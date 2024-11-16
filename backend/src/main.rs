use shuttle_runtime::CustomError;
use sqlx::PgPool;

mod appstate;
mod models;
mod routes;

#[shuttle_runtime::main]
async fn main(#[shuttle_shared_db::Postgres] pool: PgPool) -> shuttle_axum::ShuttleAxum {
    sqlx::migrate!()
        .run(&pool)
        .await
        .map_err(CustomError::new)?;
    let router = routes::router(pool);

    Ok(router.into())
}
