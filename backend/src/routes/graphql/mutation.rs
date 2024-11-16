use async_graphql::{Context, Object, ID};
use sqlx::PgPool;

use crate::models::{Attendance, Group, Session, User};

pub struct MutationRoot;

#[Object]
impl MutationRoot {
    async fn create_user(
        &self,
        ctx: &Context<'_>,
        name: String,
        rfid: String,
    ) -> async_graphql::Result<User> {
        let pool = ctx.data::<PgPool>()?;
        let user =
            sqlx::query_as::<_, User>("INSERT INTO users (name, rfid) VALUES ($1, $2) RETURNING *")
                .bind(name)
                .bind(rfid)
                .fetch_one(pool)
                .await?;
        Ok(user)
    }

    async fn update_user_rfid(
        &self,
        ctx: &Context<'_>,
        id: ID,
        rfid: String,
    ) -> async_graphql::Result<User> {
        let pool = ctx.data::<PgPool>()?;
        let user =
            sqlx::query_as::<_, User>("UPDATE users SET rfid = $1 WHERE id = $2 RETURNING *")
                .bind(rfid)
                .bind(id.parse::<i32>()?)
                .fetch_one(pool)
                .await?;
        Ok(user)
    }

    async fn delete_user(&self, ctx: &Context<'_>, id: ID) -> async_graphql::Result<User> {
        let pool = ctx.data::<PgPool>()?;
        let user = sqlx::query_as::<_, User>("DELETE FROM users WHERE id = $1 RETURNING *")
            .bind(id.parse::<i32>()?)
            .fetch_one(pool)
            .await?;
        Ok(user)
    }

    async fn create_session(
        &self,
        ctx: &Context<'_>,
        group_id: ID,
        created_by: ID,
    ) -> async_graphql::Result<Session> {
        let pool = ctx.data::<PgPool>()?;
        let session = sqlx::query_as::<_, Session>(
            "INSERT INTO sessions (group_id, created_by) VALUES ($1, $2) RETURNING *",
        )
        .bind(group_id.parse::<i32>()?)
        .bind(created_by.parse::<i32>()?)
        .fetch_one(pool)
        .await?;
        Ok(session)
    }

    async fn end_session(&self, ctx: &Context<'_>, id: ID) -> async_graphql::Result<Session> {
        let pool = ctx.data::<PgPool>()?;
        let session = sqlx::query_as::<_, Session>(
            "UPDATE sessions SET end_time = $1 WHERE id = $2 RETURNING *",
        )
        .bind(chrono::Utc::now().naive_utc())
        .bind(id.parse::<i32>()?)
        .fetch_one(pool)
        .await?;
        Ok(session)
    }

    async fn delete_session(&self, ctx: &Context<'_>, id: ID) -> async_graphql::Result<Session> {
        let pool = ctx.data::<PgPool>()?;
        // Delete attendance records
        sqlx::query("DELETE FROM attendance WHERE session_id = $1")
            .bind(id.parse::<i32>()?)
            .execute(pool)
            .await?;
        let session =
            sqlx::query_as::<_, Session>("DELETE FROM sessions WHERE id = $1 RETURNING *")
                .bind(id.parse::<i32>()?)
                .fetch_one(pool)
                .await?;
        Ok(session)
    }

    async fn create_group(
        &self,
        ctx: &Context<'_>,
        name: String,
        description: Option<String>,
    ) -> async_graphql::Result<Group> {
        let pool = ctx.data::<PgPool>()?;
        let description = description.unwrap_or_else(|| "".to_string());
        let group = sqlx::query_as::<_, Group>(
            "INSERT INTO groups (name, description) VALUES ($1, $2) RETURNING *",
        )
        .bind(name)
        .bind(description)
        .fetch_one(pool)
        .await?;
        Ok(group)
    }

    async fn add_user_to_group(
        &self,
        ctx: &Context<'_>,
        user_id: ID,
        group_id: ID,
    ) -> async_graphql::Result<Vec<User>> {
        let pool = ctx.data::<PgPool>()?;
        sqlx::query("INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)")
            .bind(user_id.parse::<i32>()?)
            .bind(group_id.parse::<i32>()?)
            .execute(pool)
            .await?;
        // Return list of users in the group
        let users = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE id IN (SELECT user_id FROM user_groups WHERE group_id = $1)",
        )
        .bind(group_id.parse::<i32>()?)
        .fetch_all(pool)
        .await?;
        Ok(users)
    }

    async fn remove_user_from_group(
        &self,
        ctx: &Context<'_>,
        user_id: ID,
        group_id: ID,
    ) -> async_graphql::Result<Vec<User>> {
        let pool = ctx.data::<PgPool>()?;
        sqlx::query("DELETE FROM user_groups WHERE user_id = $1 AND group_id = $2")
            .bind(user_id.parse::<i32>()?)
            .bind(group_id.parse::<i32>()?)
            .execute(pool)
            .await?;
        // Return list of users in the group
        let users = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE id IN (SELECT user_id FROM user_groups WHERE group_id = $1)",
        )
        .bind(group_id.parse::<i32>()?)
        .fetch_all(pool)
        .await?;
        Ok(users)
    }

    async fn delete_group(&self, ctx: &Context<'_>, id: ID) -> async_graphql::Result<Group> {
        let pool = ctx.data::<PgPool>()?;
        // Delete members of the group
        sqlx::query("DELETE FROM user_groups WHERE group_id = $1")
            .bind(id.parse::<i32>()?)
            .execute(pool)
            .await?;
        // Delete sessions of the group
        sqlx::query("DELETE FROM sessions WHERE group_id = $1")
            .bind(id.parse::<i32>()?)
            .execute(pool)
            .await?;
        // Delete group
        let group = sqlx::query_as::<_, Group>("DELETE FROM groups WHERE id = $1 RETURNING *")
            .bind(id.parse::<i32>()?)
            .fetch_one(pool)
            .await?;
        Ok(group)
    }

    async fn mark_attendance(
        &self,
        ctx: &Context<'_>,
        user_id: ID,
        group_id: ID,
    ) -> async_graphql::Result<Attendance> {
        let pool = ctx.data::<PgPool>()?;
        let session = sqlx::query_as::<_, Session>("SELECT * FROM sessions WHERE group_id = $1")
            .bind(group_id.parse::<i32>()?)
            .fetch_optional(pool)
            .await?;
        // Check if session is found
        if session.is_none() {
            return Err("No active session found for the specified group.".into());
        }
        let session = session.unwrap();

        // Check if user has already marked attendance
        let attendance = sqlx::query_as::<_, Session>(
            "SELECT * FROM attendance WHERE user_id = $1 AND session_id = $2",
        )
        .bind(user_id.parse::<i32>()?)
        .bind(session.id)
        .fetch_optional(pool)
        .await?;
        if attendance.is_some() {
            return Err("User has already marked attendance for this session.".into());
        }

        // Attempt to mark attendance
        let attendance = sqlx::query_as(
            "INSERT INTO attendance (user_id, session_id) VALUES ($1, $2) RETURNING *",
        )
        .bind(user_id.parse::<i32>()?)
        .bind(session.id)
        .fetch_one(pool)
        .await?;

        Ok(attendance)
    }

    async fn unmark_attendance(
        &self,
        ctx: &Context<'_>,
        user_id: ID,
        session_id: ID,
    ) -> async_graphql::Result<Session> {
        let pool = ctx.data::<PgPool>()?;
        let session = sqlx::query_as::<_, Session>(
            "DELETE FROM attendance WHERE user_id = $1 AND session_id = $2 RETURNING *",
        )
        .bind(user_id.parse::<i32>()?)
        .bind(session_id.parse::<i32>()?)
        .fetch_one(pool)
        .await?;
        Ok(session)
    }
}
