use axum::{extract::State, http::StatusCode, Json};

use crate::{
    appstate::AppState,
    models::{Admin, Attendance, Group, Session, User},
};

#[derive(serde::Deserialize)]
pub struct ScanRequest {
    rfid: String,
    group_id: i32,
}

pub async fn scan(
    State(AppState { pool }): State<AppState>,
    Json(data): Json<ScanRequest>,
) -> Result<(StatusCode, String), (StatusCode, String)> {
    // Log attempt to scan
    sqlx::query("INSERT INTO rfid_logs (rfid) VALUES ($1)")
        .bind(&data.rfid)
        .execute(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Check if the RFID belongs to an admin
    let result: Option<Admin> = sqlx::query_as("SELECT * FROM admins WHERE rfid = $1")
        .bind(&data.rfid)
        .fetch_optional(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if let Some(admin) = result {
        // Check if there's already an active session for the given group
        let active_session: Option<Session> =
            sqlx::query_as("SELECT * FROM sessions WHERE group_id = $1 AND end_time IS NULL")
                .bind(data.group_id) // Use group_id from the request
                .fetch_optional(&pool)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        if active_session.is_some() {
            // End the active session
            sqlx::query("UPDATE sessions SET end_time = $1 WHERE id = $2")
                .bind(chrono::Utc::now().naive_utc()) // Using current time as end_time
                .bind(active_session.unwrap().id)
                .execute(&pool)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            return Ok((
                StatusCode::OK,
                "Active session ended successfully.".to_string(),
            ));
        }

        // Create a new session with the admin's ID as the creator for the given group
        sqlx::query("INSERT INTO sessions (start_time, created_by, group_id) VALUES ($1, $2, $3)")
            .bind(chrono::Utc::now().naive_utc()) // Using current time as start_time
            .bind(admin.id) // Getting the admin's ID from the result row
            .bind(data.group_id) // Use group_id from the request
            .execute(&pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        return Ok((
            StatusCode::CREATED,
            "Admin session started successfully.".to_string(),
        ));
    }

    // Check if RFID belongs to a user
    let user: Option<User> = sqlx::query_as("SELECT * FROM users WHERE rfid = $1")
        .bind(&data.rfid)
        .fetch_optional(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if user.is_none() {
        return Err((StatusCode::NOT_FOUND, "RFID not recognized".to_string()));
    }

    let user = user.unwrap();

    // Check if the user belongs to the provided group_id
    let user_in_group: Option<(i32,)> =
        sqlx::query_as("SELECT group_id FROM user_groups WHERE user_id = $1 AND group_id = $2")
            .bind(user.id)
            .bind(data.group_id)
            .fetch_optional(&pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if user_in_group.is_none() {
        return Err((
            StatusCode::FORBIDDEN,
            "User is not part of the specified group.".to_string(),
        ));
    }

    // Check if there's an active session for this group
    let active_session: Option<Session> =
        sqlx::query_as("SELECT * FROM sessions WHERE group_id = $1 AND end_time IS NULL")
            .bind(data.group_id)
            .fetch_optional(&pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if let Some(session) = active_session {
        // Check if the user has already attended this session
        let attendance: Option<Attendance> =
            sqlx::query_as("SELECT * FROM attendance WHERE user_id = $1 AND session_id = $2")
                .bind(user.id)
                .bind(session.id)
                .fetch_optional(&pool)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        if attendance.is_some() {
            return Err((
                StatusCode::CONFLICT,
                "User has already marked attendance for this session.".to_string(),
            ));
        }

        // Mark attendance for the user in this session
        sqlx::query("INSERT INTO attendance (user_id, session_id) VALUES ($1, $2)")
            .bind(user.id)
            .bind(session.id)
            .execute(&pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        return Ok((
            StatusCode::OK,
            "Attendance marked successfully.".to_string(),
        ));
    }

    Err((
        StatusCode::NOT_FOUND,
        "No active session found for the specified group.".to_string(),
    ))
}
