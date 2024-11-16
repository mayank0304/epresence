use async_graphql::{ComplexObject, SimpleObject, ID};
use sqlx::prelude::FromRow;

#[derive(FromRow, SimpleObject)]
#[graphql(complex)]
pub struct User {
    #[graphql(skip)]
    pub id: i32,
    pub name: String,
    pub rfid: String,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(FromRow, SimpleObject)]
#[graphql(complex)]
pub struct Admin {
    #[graphql(skip)]
    pub id: i32,
    pub username: String,
    pub password: String,
    pub rfid: String,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(FromRow, SimpleObject)]
#[graphql(complex)]
pub struct Group {
    #[graphql(skip)]
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(FromRow, SimpleObject)]
#[graphql(complex)]
pub struct Session {
    #[graphql(skip)]
    pub id: i32,
    pub start_time: chrono::NaiveDateTime,
    pub end_time: Option<chrono::NaiveDateTime>,
    pub created_by: i32,
    pub group_id: i32,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(FromRow, SimpleObject)]
#[graphql(complex)]
pub struct Attendance {
    #[graphql(skip)]
    pub id: i32,
    pub user_id: i32,
    pub session_id: i32,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(FromRow, SimpleObject)]
#[graphql(complex)]
pub struct RfidLog {
    #[graphql(skip)]
    pub id: i32,
    pub rfid: String,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

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

impl_graphql_id!(User, Admin, Group, Session, Attendance, RfidLog);
