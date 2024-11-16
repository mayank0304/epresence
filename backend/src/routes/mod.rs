use crate::appstate::AppState;
use axum::{routing::post, Router};
use graphql::{graphiql, graphql_handler};
use sqlx::PgPool;

pub mod graphql;
mod rfid;

pub fn router(pool: PgPool) -> Router {
    let schema = graphql::schema(pool.clone());
    let state = AppState { pool, schema };
    Router::new()
        .route("/gql", post(graphql_handler).get(graphiql))
        .route("/scan", post(rfid::scan))
        .with_state(state)
}
