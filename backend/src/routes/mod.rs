use crate::appstate::AppState;
use axum::{routing::post, Router};

mod rfid;

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/scan", post(rfid::scan))
        .with_state(state)
}

