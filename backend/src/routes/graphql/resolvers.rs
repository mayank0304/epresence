use crate::models::{Admin, Attendance, Group, RfidLog, Session, User};
use async_graphql::{ComplexObject, Context, ID};
use sqlx::PgPool;

macro_rules! impl_graphql_id {
    ($($t:ty),*) => {
        $(
            #[async_graphql::ComplexObject]
            impl $t {
                async fn id(&self) -> ID {
                    self.id.to_string().into()
                }
            }
        )*
    };
}

impl_graphql_id!(User, Admin, RfidLog);

// implement users resolver for Group model
#[ComplexObject]
impl Group {
    async fn id(&self) -> ID {
        self.id.to_string().into()
    }
    async fn users(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<User>> {
        let pool = ctx.data::<PgPool>()?;
        let users = sqlx::query_as::<_, User>(
            "SELECT users.* FROM users
            INNER JOIN user_groups ON users.id = user_groups.user_id
            WHERE user_groups.group_id = $1",
        )
        .bind(self.id)
        .fetch_all(pool)
        .await?;
        Ok(users)
    }
}

// implement group and createdByAdmin resolvers for Session model
#[ComplexObject]
impl Session {
    async fn id(&self) -> ID {
        self.id.to_string().into()
    }
    async fn group(&self, ctx: &Context<'_>) -> async_graphql::Result<Option<Group>> {
        let pool = ctx.data::<PgPool>()?;
        let group = sqlx::query_as::<_, Group>("SELECT * FROM groups WHERE id = $1")
            .bind(self.group_id)
            .fetch_optional(pool)
            .await?;
        Ok(group)
    }
    async fn created_by_admin(&self, ctx: &Context<'_>) -> async_graphql::Result<Admin> {
        let pool = ctx.data::<PgPool>()?;
        let user = sqlx::query_as::<_, Admin>("SELECT * FROM admins WHERE id = $1")
            .bind(self.created_by)
            .fetch_one(pool)
            .await?;
        Ok(user)
    }
}

// implement session and user resolvers for Attendance model
#[ComplexObject]
impl Attendance {
    async fn id(&self) -> ID {
        self.id.to_string().into()
    }
    async fn session(&self, ctx: &Context<'_>) -> async_graphql::Result<Session> {
        let pool = ctx.data::<PgPool>()?;
        let session = sqlx::query_as::<_, Session>("SELECT * FROM sessions WHERE id = $1")
            .bind(self.session_id)
            .fetch_one(pool)
            .await?;
        Ok(session)
    }
    async fn user(&self, ctx: &Context<'_>) -> async_graphql::Result<User> {
        let pool = ctx.data::<PgPool>()?;
        let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
            .bind(self.user_id)
            .fetch_one(pool)
            .await?;
        Ok(user)
    }
}
