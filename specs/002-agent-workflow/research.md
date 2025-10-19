# Research Findings: Syncly Agent Workflow

## Decision 1: Use OpenAI Agents SDK with OpenRouter-compatible client
- **Decision**: Wrap OpenRouter's chat completions endpoint with the OpenAI Agents SDK by configuring the `openai` client to target OpenRouter's base URL and rely on OpenAI-compatible schema.
- **Rationale**: OpenRouter mirrors the OpenAI API contract, allowing us to reuse the agents SDK abstractions (tool invocation, response parsing) while swapping credentials and host via environment variables.
- **Alternatives Considered**:
  - Direct OpenRouter HTTP calls using bare `httpx` (rejected: would duplicate agent orchestration logic already solved by the SDK).
  - Self-hosted LLM orchestrator (rejected: overkill for current scope and adds deployment burden).

## Decision 2: Deterministic response envelope shared across agents
- **Decision**: Define a shared Pydantic model (`WorkflowEnvelope`) that captures summary text, planning recommendations, metadata, and error flags, and require both agents to populate their respective sections.
- **Rationale**: Ensures the orchestrator can validate contributions, simplifies backend consumption, and keeps testing straightforward with well-defined schemas.
- **Alternatives Considered**:
  - Free-form JSON per agent (rejected: increases parsing complexity and risk of inconsistent field names).
  - Separate payloads returned sequentially to backend (rejected: backend expects a single combined response per spec).

## Decision 3: Logging and timeout strategy for sequential execution
- **Decision**: Apply a per-agent timeout of 4 seconds with retry-once for transient HTTP errors, log execution metadata via structured dicts, and bubble errors with retriable flags per spec requirements.
- **Rationale**: Keeps total SLA under 6 seconds, provides audit trail, and aligns with success criteria and error-handling functional requirements.
- **Alternatives Considered**:
  - Unlimited retries (rejected: risks exceeding SLA).
  - Single global timeout without per-agent controls (rejected: obscures which stage failed and complicates remediation).
