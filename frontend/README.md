# Syncly Frontend

React + Vite + Tailwind dashboard for the Syncly platform.

## Requirements
- Node.js 24.x (`nvm use` loads the repo-wide `.nvmrc`)
- npm 10+

## Installing
```
npm ci
```

## Running locally (without Docker)
```
npm run dev
```
The Vite dev server starts on http://localhost:5173. Set `VITE_API_URL=http://localhost:4000` so the frontend can reach the Express backend.

## Production build
```
npm run build
npm run preview
```

## Running with Docker
The root `infra/docker-compose.yml` builds this frontend image and serves it through nginx on port 8080. Run the stack from `infra/` with:
```
docker compose up --build
```

## Useful scripts
- `npm run lint` – run ESLint checks
- `npm run build:dev` – build using the development mode profile
- `npm run preview` – preview the production build locally

## Stack
- Vite 5 + React 18
- TypeScript 5
- Tailwind CSS & shadcn/ui component primitives
