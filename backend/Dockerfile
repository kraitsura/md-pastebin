FROM rust:1.72 as builder

WORKDIR /usr/src/app
COPY . .
RUN cargo build --release

FROM debian:bullseye-slim
RUN apt-get update && apt-get install -y libssl1.1 ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/src/app/target/release/md-pastebin /usr/local/bin/

EXPOSE 8080
CMD ["md-pastebin"]