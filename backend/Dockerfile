FROM rust:1.72-slim-bullseye as builder

WORKDIR /usr/src/app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release

FROM debian:bullseye-slim
RUN apt-get update && \
    apt-get install -y libssl1.1 ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/src/app/target/release/md-pastebin /usr/local/bin/

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1
CMD ["md-pastebin"]