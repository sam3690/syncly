# Contributing to Syncly

Thank you for considering contributing to Syncly! We want this project to be friendly, approachable, and a great open-source experience for every contributor.

## Getting Started

- **Fork and clone** the repository instead of pushing directly to the `main` branch.
- **Create a feature branch** off of `main` (`git checkout -b feat/your-feature`), and keep your branch focused on one change set.
- **Sync often** with the upstream `main` branch to minimize merge conflicts.
- **Install dependencies** with `npm ci` (frontend and backend) to ensure reproducible installs. Use Node.js 24.x (see `.nvmrc` once added or run `nvm use 24`).
- **Run the quality checks** that CI executes before opening a pull request:
  - `npm run lint` and `npm run build` inside `frontend`
  - `npm test` inside `backend`
- **Optional: run everything in Docker** with `docker compose up --build` from `infra/` when you prefer containerised workflows.

## Pull Request Process

1. Open an issue (or pick an existing one) before starting significant work. Describe the context and proposed solution.
2. Ensure that your commits are atomic and include clear messages. We recommend the Conventional Commits format (for example `feat: add dashboard filters`).
3. Update documentation, tests, and TypeScript types where necessary.
4. Verify your changes locally. If you are modifying Docker workflows, run `docker compose build` from the `infra` directory to ensure images succeed.
5. Push your branch and open a pull request targeting `main`. Every change must be reviewed—no direct merges to `main`.
6. Fill out the pull request template completely; link the relevant issue and describe testing steps.
7. Respond to review feedback promptly. When approvals are in place and CI passes, a maintainer will merge using the "Squash and merge" strategy to keep history tidy.

## Code Style Guidelines

- TypeScript and JavaScript should follow the ESLint rules configured in the project.
- Prefer functional React components with hooks. Keep components small and focused.
- Export shared utilities from `frontend/src/lib` so they can be reused.
- Document non-obvious logic with concise comments. Avoid duplicate code where abstractions are possible.
- Use environment variables through `.env` files and never commit secrets.

## Commit Access & Reviews

- Only maintainers have write access to `main`. All contributors (including maintainers) must work through pull requests.
- CODEOWNERS enforce that at least one maintainer review is required before merging. Maintainers may request additional approval when changes touch sensitive areas.

## Communication

- Use GitHub Issues and Discussions for asynchronous collaboration. Tag the maintainers listed in [CODEOWNERS](.github/CODEOWNERS) for urgent concerns.
- Respect the [Code of Conduct](CODE_OF_CONDUCT.md) in all interactions.

We appreciate your time and effort. Happy hacking! 🚀
