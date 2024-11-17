use async_graphql::{Context, Object, ID};
use sqlx::PgPool;

use crate::models::{Attendance, Group, RfidLog, Session, User};

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    // Get all users or users in a group
    async fn users(
        &self,
        ctx: &Context<'_>,
        group_id: Option<ID>,
    ) -> async_graphql::Result<Vec<User>> {
        let pool = ctx.data::<PgPool>()?;
        if let Some(gid) = group_id {
            let users = sqlx::query_as::<_, User>(
                "SELECT users.* FROM users
            INNER JOIN user_groups ON users.id = user_groups.user_id
            WHERE user_groups.group_id = $1",
            )
            .bind(gid.parse::<i32>()?)
            .fetch_all(pool)
            .await?;
            return Ok(users);
        }
        let users = sqlx::query_as::<_, User>("SELECT * FROM users")
            .fetch_all(pool)
            .await?;
        Ok(users)
    }

    // Get a user by ID
    async fn user(&self, ctx: &Context<'_>, id: ID) -> async_graphql::Result<Option<User>> {
        let pool = ctx.data::<PgPool>()?;
        let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
            .bind(id.parse::<i32>()?)
            .fetch_optional(pool)
            .await?;
        Ok(user)
    }

    // Get all groups
    async fn groups(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<Group>> {
        let pool = ctx.data::<PgPool>()?;
        let groups = sqlx::query_as::<_, Group>("SELECT * FROM groups")
            .fetch_all(pool)
            .await?;
        Ok(groups)
    }

    // Get a group by ID
    async fn group(&self, ctx: &Context<'_>, id: ID) -> async_graphql::Result<Option<Group>> {
        let pool = ctx.data::<PgPool>()?;
        let group = sqlx::query_as::<_, Group>("SELECT * FROM groups WHERE id = $1")
            .bind(id.parse::<i32>()?)
            .fetch_optional(pool)
            .await?;
        Ok(group)
    }

    // Get a session by ID
    async fn session(&self, ctx: &Context<'_>, id: ID) -> async_graphql::Result<Option<Session>> {
        let pool = ctx.data::<PgPool>()?;
        let session = sqlx::query_as::<_, Session>("SELECT * FROM sessions WHERE id = $1")
            .bind(id.parse::<i32>()?)
            .fetch_optional(pool)
            .await?;
        Ok(session)
    }

    // Get all sessions or sessions in a group or created by a user
    async fn sessions(
        &self,
        ctx: &Context<'_>,
        group_id: Option<ID>,
        created_by: Option<ID>,
    ) -> async_graphql::Result<Vec<Session>> {
        let pool = ctx.data::<PgPool>()?;
        if let Some(created_by) = created_by {
            let sessions = match group_id {
                Some(gid) => {
                    sqlx::query_as::<_, Session>(
                        "SELECT * FROM sessions WHERE group_id = $1 AND created_by = $2",
                    )
                    .bind(gid.parse::<i32>()?)
                    .bind(created_by.parse::<i32>()?)
                    .fetch_all(pool)
                    .await?
                }
                None => {
                    sqlx::query_as::<_, Session>("SELECT * FROM sessions WHERE created_by = $1")
                        .bind(created_by.parse::<i32>()?)
                        .fetch_all(pool)
                        .await?
                }
            };
            return Ok(sessions);
        }
        let sessions = match group_id {
            Some(gid) => {
                sqlx::query_as::<_, Session>("SELECT * FROM sessions WHERE group_id = $1")
                    .bind(gid.parse::<i32>()?)
                    .fetch_all(pool)
                    .await?
            }
            None => {
                sqlx::query_as::<_, Session>("SELECT * FROM sessions")
                    .fetch_all(pool)
                    .await?
            }
        };
        Ok(sessions)
    }

    // Get attendance for a session or a user or a group or any combination of them
    async fn attendance(
        &self,
        ctx: &Context<'_>,
        session_id: Option<ID>,
        user_id: Option<ID>,
        group_id: Option<ID>,
    ) -> async_graphql::Result<Vec<Attendance>> {
        let pool = ctx.data::<PgPool>()?;
        let mut query = "SELECT * FROM attendance".to_string();
        let mut where_clause = "".to_string();
        let mut params = Vec::new();
        if let Some(session_id) = session_id {
            where_clause += " WHERE session_id = $1";
            params.push(session_id.parse::<i32>()?);
        }
        if let Some(user_id) = user_id {
            if !where_clause.is_empty() {
                where_clause += " AND user_id = $2";
            } else {
                where_clause += " WHERE user_id = $1";
            }
            params.push(user_id.parse::<i32>()?);
        }
        if let Some(group_id) = group_id {
            if !where_clause.is_empty() {
                where_clause += " AND group_id = $3";
            } else {
                where_clause += " WHERE group_id = $1";
            }
            params.push(group_id.parse::<i32>()?);
        }
        query += &where_clause;
        let mut attendance = sqlx::query_as(&query);
        for param in params {
            attendance = attendance.bind(param);
        }
        let attendance = attendance.fetch_all(pool).await?;
        Ok(attendance)
    }

    async fn rfid_logs(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<RfidLog>> {
        let pool = ctx.data::<PgPool>()?;
        let logs = sqlx::query_as("SELECT * FROM rfid_logs")
            .fetch_all(pool)
            .await?;
        Ok(logs)
    }
}
