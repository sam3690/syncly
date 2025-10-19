# Quickstart: Syncly Agent Workflow

1. **Install dependencies**
   ```bash
   cd agents
   uv sync
   ```

2. **Configure environment**
   - `OPENAI_API_KEY`: OpenRouter API key (supports OpenAI-compatible schema).
   - `OPENAI_BASE_URL`: `https://openrouter.ai/api/v1` (overrides default OpenAI host).
   - `SYNCYL_BACKEND_URL`: Callback endpoint for posting workflow responses (used by integration tests).
   - Optional: `WORKFLOW_TIMEOUT_SECONDS` (defaults to `6`).

3. **Run local smoke test**
   ```bash
   uv run python -m syncly_agents.orchestrator.cli run-sample fixtures/sample_request.json
   ```

4. **Expected output**
   - Standard output: JSON `WorkflowEnvelope` with `summary`, `action_plan`, and `metadata` sections populated.
   - Exit code `0` when both agents succeed; non-zero with error JSON on stderr for failures.

5. **Execute pytest suite**
   ```bash
   uv run pytest tests/orchestrator tests/summarization tests/planning
   ```

6. **Integrate with backend**
   - Backend issues POST to `/api/agent-workflow/v1/run` using contract in `contracts/workflow-openapi.yaml`.
   - Orchestrator posts combined response to backend callback or returns directly over HTTP depending on deployment strategy.
