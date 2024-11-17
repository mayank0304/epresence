use crate::appstate::AppState;
use axum::{http::Method, routing::post, Router};
use graphql::{graphiql, graphql_handler};
use sqlx::PgPool;
use tower_http::cors::{Any, CorsLayer};

pub mod graphql;
mod rfid;

pub fn router(pool: PgPool) -> Router {
    let schema = graphql::schema(pool.clone());
    let state = AppState { pool, schema };
    let cors = CorsLayer::new()
        .allow_origin(Any) // Adjust this to restrict allowed origins
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS]) // Specify allowed methods
        .allow_headers(Any); // Specify allowed headers
    Router::new()
        .route("/gql", post(graphql_handler).get(graphiql))
        .route("/scan", post(rfid::scan))
        .with_state(state)
        .layer(cors)
}
