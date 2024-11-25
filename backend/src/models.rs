use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Paste {
    pub id: String,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub last_accessed: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePasteRequest {
    pub content: String,
}

#[derive(Debug, Serialize)]
pub struct CreatePasteResponse {
    pub id: String,
    pub url: String,
}

