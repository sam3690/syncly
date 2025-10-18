# Syncly Infrastructure

Reusable Docker Compose setup for running the full Syncly stack locally.

## Requirements
- Docker 24+
- Docker Compose plugin (ships with modern Docker Desktop / CLI)

## Services
- `frontend`: Builds `syncly-frontend:local` (Vite build served by nginx on port 8080)
- `backend`: Builds `syncly-backend:local` (Express API on port 4000)

## Usage
```
cd infra
docker compose up --build
```
- Frontend: http://localhost:8080
- Backend: http://localhost:4000 (health: `/health`)

Stop the stack with `docker compose down`.

## Development Notes
- Source mounts are not enabled; rebuild the services after code changes or integrate bind mounts if hot reload inside containers is needed.
- Override settings (ports, env vars) via a `docker-compose.override.yml` or environment variables for hackathon-specific setups.
