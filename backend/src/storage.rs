// src/storage.rs
use chrono::Utc;
use redis::AsyncCommands;
use std::error::Error;
use log::{error, info};
use crate::models::Paste;

pub struct RedisStorage {
    client: redis::Client,
}

impl RedisStorage {
    pub async fn new(redis_url: &str) -> Result<Self, Box<dyn Error>> {
        let client = redis::Client::open(redis_url)?;
        Ok(RedisStorage { client })
    }

    pub async fn create_paste(&self, content: String) -> Result<String, Box<dyn Error>> {
        info!("Attempting to create new paste");
        
        let mut conn = self.client.get_async_connection().await.map_err(|e| {
            error!("Redis connection error: {}", e);
            e
        })?;
        
        let id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now();

        let paste = Paste {
            id: id.clone(),
            content,
            created_at: now,
            last_accessed: now,
        };

        let json = serde_json::to_string(&paste)?;
        
        // Use a transaction to set both the paste data and the expiration time
        let _: () = redis::pipe()
            .atomic()
            .set(&id, &json)
            .expire(&id, 172800) // 2 days in seconds
            .query_async(&mut conn)
            .await?;

        info!("Successfully created paste with id: {}", id);
        Ok(id)
    }

    pub async fn get_paste(&self, id: &str) -> Result<Option<Paste>, Box<dyn Error>> {
        let mut conn = self.client.get_async_connection().await?;
        
        let json: Option<String> = conn.get(id).await?;
        
        if let Some(json) = json {
            let mut paste: Paste = serde_json::from_str(&json)?;
            paste.last_accessed = Utc::now();
            
            let updated_json = serde_json::to_string(&paste)?;
            
            let _: () = redis::pipe()
                .atomic()
                .set(id, &updated_json)
                .expire(id, 172800) // Reset the 2-day timer
                .query_async(&mut conn)
                .await?;
                
            Ok(Some(paste))
        } else {
            Ok(None)
        }
    }
}