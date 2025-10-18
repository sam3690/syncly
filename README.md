# Syncly
One-stop project management app built during Hackathon MLH Hackfest.

## Project Structure
- `frontend/` – Vite + React + Tailwind dashboard UI
- `backend/` – Express 5 API service exposing health and informational endpoints
- `infra/` – Docker Compose setup for local orchestration
- `.github/` – GitHub Actions CI, issue templates, PR templates, and governance docs

## Prerequisites
- Node.js 24.x (install via [nvm](https://github.com/nvm-sh/nvm) or your preferred manager; run `nvm use` to pick up the supplied `.nvmrc`)
- npm 10+ (shipped with Node 24)
- Docker 24+ (optional, for container workflows)

## Local Development (without Docker)
1. Install dependencies with `npm ci` inside both `frontend/` and `backend/` directories.
2. Start the backend API: `npm run dev` within `backend/` (listens on port 4000 and serves `/health`).
3. In a second terminal start the frontend: `npm run dev` within `frontend/` (Vite dev server on port 5173).
4. Start frontend with `npm run dev` on port = `http://localhost:4000`.

## Local Development (with Docker)
```
cd infra
docker compose up --build
```
- Frontend: http://localhost:8080
- Backend: http://localhost:4000 (`/health` endpoint acts as the container health check)
- Containers restart automatically unless stopped and are suitable for teammate onboarding without managing Node locally.

## Continuous Integration
GitHub Actions run on every push and pull request targeting `main`:
- Installs dependencies using `npm ci`
- Lints and builds the frontend
- Runs backend checks (`npm test`)
- Validates Docker image builds for both services

All pull requests require green CI and an approving review from the CODEOWNERS. Direct pushes to `main` are discouraged.

## Contributions & Governance
- Review the [Code of Conduct](CODE_OF_CONDUCT.md) and [Contributing Guide](CONTRIBUTING.md) before submitting changes.
- All contributions happen via pull requests. Fork the repo or branch locally, push your changes, and open a PR targeting `main`.
- Open an issue to propose new features or report bugs. Use the templates provided under `.github/ISSUE_TEMPLATE/`.
- For security disclosures, follow the process outlined in [SECURITY.md](SECURITY.md).

## License
This project is licensed under the [MIT License](LICENSE).
