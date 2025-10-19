# Syncly Agents

Orchestrates summarizing and planning agents to provide consolidated project intelligence for program managers.

## Installation

```bash
cd agents
uv sync
uv pip install -e .
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
# Edit .env with your OpenRouter API key
```

Required environment variables:
- `OPENAI_API_KEY`: Your OpenRouter API key
- `OPENAI_BASE_URL`: `https://openrouter.ai/api/v1`

## Usage

### CLI

Run the workflow on a payload file:

```bash
uv run syncly-agents path/to/payload.json --output results.json
```

With LLM enabled:

```bash
uv run syncly-agents path/to/payload.json --use-llm --output results.json
```

### Python API

```python
from syncly_agents.orchestrator.pipeline import AgentWorkflowOrchestrator

orchestrator = AgentWorkflowOrchestrator(use_llm=False)
envelope = orchestrator.run(payload_dict)
print(envelope.model_dump_json())
```

### Docker

Build and run with Docker:

```bash
docker build -t syncly-agents .
docker run --env-file .env syncly-agents
```

## Testing

Run the test suite:

```bash
uv run pytest
```

## Payload Format

The input payload should be a JSON object matching the `AgentRequest` schema:

```json
{
  "request_id": "uuid",
  "project_name": "Project Name",
  "generated_at": "2025-10-19T12:00:00Z",
  "milestones": [...],
  "tasks": [...],
  "metrics": {...}
}
```

See `tests/fixtures/project_status.json` for an example.

## Output

Returns a `WorkflowEnvelope` with:
- `summary`: Project health overview
- `action_plan`: Prioritized recommendations
- `metadata`: Execution details and status

## Production Deployment

1. Build the package: `uv build`
2. Install in production: `pip install dist/agents-0.1.0.tar.gz`
3. Configure environment variables
4. Run via CLI or integrate into backend services
5. For containerized deployment, use the provided Dockerfile
