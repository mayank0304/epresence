use crate::routes::graphql::GQLSchema;
use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub schema: GQLSchema,
}
