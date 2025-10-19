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

## Agents service

The Compose file can include an `agents` service that builds the `agents/` project and uses `../agents/.env` for configuration. When present it can run the orchestrator CLI against a sample fixture to self-check during startup.

### Local development

Use the provided override to mount local sources and run the agents in dev mode:

```bash
cd infra
# mounts local agents and backend code for live development
docker compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

You can also run just the agents container:

```bash
cd infra
docker compose run --rm agents uv run syncly-agents tests/fixtures/project_status.json --output /tmp/out.json
```

### Environment variables

Provide `../agents/.env` next to the agents package with at least:

- `OPENAI_API_KEY` - OpenRouter API key
- `OPENAI_BASE_URL` - (optional, default `https://openrouter.ai/api/v1`)

