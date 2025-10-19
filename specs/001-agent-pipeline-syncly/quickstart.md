# Quickstart: Syncly Agentic Workflow Pipeline

## Prerequisites
- Python 3.13 installed (uv manages virtual environment)
- `uv` CLI available on PATH
- Supabase project keys (service role key + anon key)
- OAuth credentials or API tokens for desired integrations (Slack, Notion, Trello, GitHub, Gmail, Jira, Google Sheets)
- `OPENROUTER_API_KEY` issued and active
- Access to Context7 MCP server endpoint

## Setup
1. Change into the agents workspace:
   ```bash
   cd agents
   ```
2. Install dependencies with uv:
   ```bash
   uv sync
   ```
3. Configure environment variables in `.env` (uv respects dotenv):
   ```dotenv
   OPENROUTER_API_KEY=...
   OPENAI_BASE_URL=https://api.openrouter.ai/v1
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   CONTEXT7_ENDPOINT=https://context7.syncly.internal
   CONTEXT7_API_KEY=...
   DIGEST_DEFAULT_HOUR=09:00
   ```
4. Bootstrap the orchestrator memory cache with Context7 guidance:
   ```bash
   uv run python -m syncly_agents.tools.cache_guidance
   ```

## Running the Pipeline
- **On-demand digest**:
  ```bash
  uv run python -m syncly_agents.orchestrator.pipeline run --workspace-id <uuid>
  ```
- **Manual log upload**:
  ```bash
  uv run python -m syncly_agents.cli ingest-log --workspace-id <uuid> --file sample.log
  ```
- **Schedule daily digests** (invoked via cron or backend scheduler):
  ```bash
  uv run python -m syncly_agents.orchestrator.pipeline schedule --workspace-id <uuid>
  ```

## Testing
- Run the full pytest suite with coverage:
  ```bash
  uv run pytest --cov=syncly_agents
  ```
- Execute integration tests that mock external APIs:
  ```bash
  uv run pytest tests/integration
  ```

## Observability
- Logs stream to stdout in JSON format; configure log level via `SYNCYL_AGENTS_LOG_LEVEL`.
- Health checks exposed through CLI command:
  ```bash
  uv run python -m syncly_agents.cli health --workspace-id <uuid>
  ```
