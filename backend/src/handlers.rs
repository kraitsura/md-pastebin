// src/handlers.rs
use actix_web::{get, post, web, HttpResponse, Responder};
use log::{error, info};
use crate::models::{CreatePasteRequest, CreatePasteResponse};
use crate::storage::RedisStorage;

#[post("/pastes")]
pub async fn create_paste(
    storage: web::Data<RedisStorage>,
    paste_req: web::Json<CreatePasteRequest>,
) -> impl Responder {
    info!("Received create paste request");
    
    match storage.create_paste(paste_req.content.clone()).await {
        Ok(id) => {
            info!("Successfully created paste with id: {}", id);
            let response = CreatePasteResponse {
                id: id.clone(),
                url: format!("/p/{}", id),
            };
            HttpResponse::Ok().json(response)
        }
        Err(e) => {
            error!("Failed to create paste: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to create paste"
            }))
        }
    }
}

#[get("/pastes/{id}")]
pub async fn get_paste(
    storage: web::Data<RedisStorage>,
    id: web::Path<String>,
) -> impl Responder {
    info!("Received get paste request for id: {}", id);
    
    match storage.get_paste(&id).await {
        Ok(Some(paste)) => {
            info!("Successfully retrieved paste: {}", id);
            HttpResponse::Ok().json(paste)
        }
        Ok(None) => {
            info!("Paste not found: {}", id);
            HttpResponse::NotFound().json(serde_json::json!({
                "error": "Paste not found"
            }))
        }
        Err(e) => {
            error!("Failed to retrieve paste: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to retrieve paste"
            }))
        }
    }
}

#[get("/pastes/{id}/info")]
pub async fn get_paste_info(
    storage: web::Data<RedisStorage>,
    id: web::Path<String>,
) -> impl Responder {
    info!("Received get paste info request for id: {}", id);
    
    match storage.get_paste(&id).await {
        Ok(Some(paste)) => {
            let info = serde_json::json!({
                "id": paste.id,
                "created_at": paste.created_at,
                "last_accessed": paste.last_accessed,
                "expires_at": (paste.last_accessed + chrono::Duration::days(2))
            });
            HttpResponse::Ok().json(info)
        }
        Ok(None) => {
            HttpResponse::NotFound().json(serde_json::json!({
                "error": "Paste not found"
            }))
        }
        Err(e) => {
            error!("Failed to retrieve paste info: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to retrieve paste info"
            }))
        }
    }
}

#[get("/health")]
pub async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}