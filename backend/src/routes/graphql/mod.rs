use async_graphql::{http::GraphiQLSource, EmptyMutation, EmptySubscription, Schema};
use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::{
    extract::State,
    response::{Html, IntoResponse},
};
use mutation::MutationRoot;
use query::QueryRoot;
use sqlx::PgPool;

use crate::appstate::AppState;

pub mod mutation;
pub mod query;

pub type GQLSchema = Schema<QueryRoot, MutationRoot, EmptySubscription>;

pub fn schema(pool: PgPool) -> GQLSchema {
    Schema::build(QueryRoot, MutationRoot, EmptySubscription)
        .data(pool)
        .finish()
}

pub async fn graphql_handler(
    State(AppState { schema, .. }): State<AppState>,
    req: GraphQLRequest,
) -> GraphQLResponse {
    let res = schema.execute(req.into_inner()).await;
    res.into()
}

pub async fn graphiql() -> impl IntoResponse {
    Html(GraphiQLSource::build().endpoint("/gql").finish())
}
