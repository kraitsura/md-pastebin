# AI Context Pastebin

A modern, efficient pastebin service specifically designed for sharing AI prompts and context windows. Built with Rust, Next.js, and Redis.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Rust](https://img.shields.io/badge/rust-1.71.1%2B-orange.svg)
![Next.js](https://img.shields.io/badge/next.js-14.0.0%2B-black)

## Features

- 🚀 High-performance Rust backend
- ⚡ Real-time Next.js frontend
- 🔄 FIFO/LIFO storage with Redis
- 🌙 Dark/Light mode support
- 📱 Responsive design
- 🔗 Shareable links
- ⌛ Auto-expiring pastes (2 days)
- 📋 Copy to clipboard
- 💾 Download/Upload support

## Prerequisites

- Rust 1.72 or higher
- Node.js 18 or higher
- Redis 6.0 or higher
- Docker (optional)

## Project Structure

```
markdown-pastebin/
├── backend/
│   ├── src/
│   │   ├── main.rs          # Server setup and configuration
│   │   ├── handlers.rs      # Request handlers
│   │   ├── models.rs        # Data structures
│   │   └── storage.rs       # Redis interaction
│   ├── Cargo.toml           # Rust dependencies
│   └── Dockerfile          
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── MarkdownPastebin.tsx
│   │   ├── app/
│   │   │   └── page.tsx
│   │   └── styles/
│   │       └── globals.css
│   ├── package.json
│   └── Dockerfile
├── nginx/
│   └── conf.d/
│       └── default.conf
├── docker-compose.yml
└── README.md
```

## Quick Start

### Development Environment

1. Clone the repository:
```bash
git clone https://github.com/yourusername/markdown-pastebin.git
cd markdown-pastebin
```

2. Start Redis:
```bash
docker run -d -p 6379:6379 redis:alpine
```

3. Set up the backend:
```bash
cd backend
cp .env.example .env
cargo run
```

4. Set up the frontend:
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

5. Visit `http://localhost:3000` in your browser

### Production Deployment

Using Docker Compose:

```bash
docker-compose up --build -d
```

## Environment Variables

### Backend (.env)
```env
REDIS_URL=redis://127.0.0.1:6379
HOST=127.0.0.1
PORT=8080
RUST_LOG=info
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## API Endpoints

### Create Paste
```http
POST /api/pastes
Content-Type: application/json

{
  "content": "Your markdown content here"
}
```

Response:
```json
{
  "id": "unique-paste-id",
  "url": "/p/unique-paste-id"
}
```

### Get Paste
```http
GET /api/pastes/{id}
```

Response:
```json
{
  "id": "unique-paste-id",
  "content": "Your markdown content",
  "created_at": "2024-11-25T20:22:16Z",
  "last_accessed": "2024-11-25T20:22:16Z"
}
```

## Development

### Backend Development

1. Run tests:
```bash
cd backend
cargo test
```

2. Run with logging:
```bash
RUST_LOG=debug cargo run
```

3. Build for release:
```bash
cargo build --release
```

### Frontend Development

1. Run development server:
```bash
npm run dev
```

2. Build for production:
```bash
npm run build
```

3. Start production server:
```bash
npm start
```

## Docker Support

Build and run individual services:

```bash
# Backend
docker build -t pastebin-backend ./backend
docker run -p 8080:8080 pastebin-backend

# Frontend
docker build -t pastebin-frontend ./frontend
docker run -p 3000:3000 pastebin-frontend

# Redis
docker run -p 6379:6379 redis:alpine
```

## Production Deployment

### Using Docker Compose

1. Configure environment:
```bash
cp .env.example .env
```

2. Deploy:
```bash
docker-compose up -d
```

3. Scale services (optional):
```bash
docker-compose up -d --scale backend=3
```

### Manual VPS Deployment

1. Install dependencies:
```bash
apt update
apt install -y docker.io docker-compose nginx
```

2. Configure Nginx:
```bash
cp nginx/conf.d/default.conf /etc/nginx/conf.d/
```

3. SSL Setup (optional):
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

4. Start services:
```bash
docker-compose up -d
```

## Monitoring

### Docker Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Redis Monitoring
```bash
docker exec -it redis redis-cli
INFO
MONITOR
```

## Backup

### Redis Data
```bash
# Create backup
docker run --rm -v markdown-pastebin_redis-data:/data \
  -v $(pwd)/backup:/backup alpine tar czf /backup/redis-backup.tar.gz /data

# Restore backup
docker run --rm -v markdown-pastebin_redis-data:/data \
  -v $(pwd)/backup:/backup alpine tar xzf /backup/redis-backup.tar.gz
```

## Security Considerations

1. Rate Limiting
2. Input Validation
3. CORS Configuration
4. Redis Security
5. SSL/TLS Configuration

## Troubleshooting

### Common Issues

1. Redis Connection:
```bash
docker-compose ps
docker-compose logs redis
```

2. Frontend Build:
```bash
rm -rf .next
npm install
npm run build
```

3. Backend Build:
```bash
cargo clean
cargo build
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Rust](https://www.rust-lang.org/)
- [Next.js](https://nextjs.org/)
- [Redis](https://redis.io/)
- [shadcn/ui](https://ui.shadcn.com/)

## Support

For support, please open an issue in the GitHub repository.