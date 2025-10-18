# Syncly Backend

Express 5 API service providing health and info endpoints for the Syncly platform.

## Requirements
- Node.js 24.x (`nvm use` matches the repo-wide `.nvmrc`)
- npm 10+

## Installing
```
npm ci
```

## Running locally (without Docker)
```
npm run dev
```
The server listens on port 4000 by default and exposes `/health` for status checks and `/api/v1/info` for metadata.

## Running tests
```
npm test
```
(Currently performs a syntax check; expand with real tests as the API grows.)

## Running with Docker
The root `infra/docker-compose.yml` builds this backend image and maps it to port 4000. Run the stack from `infra/` with:
```
docker compose up --build
```

## Environment
- Configure an alternative port by setting the `PORT` environment variable.
- Add additional configuration via environment variables or `.env` files—do not commit secrets.
