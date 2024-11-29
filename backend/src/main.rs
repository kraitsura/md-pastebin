use actix_cors::Cors;
use actix_web::{web, App, HttpServer, middleware};
use dotenv::dotenv;
use std::env;
use log::{info, error};

mod handlers;
mod models;
mod storage;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let redis_url = env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());
    let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("PORT must be a number");

    info!("Connecting to Redis at {}", redis_url);
    
    let storage = match storage::RedisStorage::new(&redis_url).await {
        Ok(storage) => {
            info!("Successfully connected to Redis");
            web::Data::new(storage)
        },
        Err(e) => {
            error!("Failed to connect to Redis: {}", e);
            panic!("Failed to initialize storage");
        }
    };

    info!("Server running at http://{}:{}", host, port);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin_fn(|origin, _req_head| {
                let allowed_origins = vec![
                    "http://localhost:3000",
                    "http://localhost",
                    "http://production-domain.com"
                ];
                allowed_origins.contains(&origin.to_str().unwrap_or_default())
            })
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec!["Content-Type"])
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .app_data(storage.clone())
            .service(handlers::create_paste)
            .service(handlers::get_paste)
            .service(handlers::get_paste_info)
            .service(handlers::health_check)
    })
    .bind((host, port))?
    .run()
    .await
}
