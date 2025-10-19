# Research Findings: Syncly Agentic Workflow Pipeline

## Supabase Client Selection
- **Decision**: Adopt the official `supabase` Python client (v2) for persistence operations.
- **Rationale**: Provides typed PostgREST interface, vector store helpers, and leverages service key management already used elsewhere in the project. Supports asynchronous usage through `httpx`, aligning with agent concurrency needs.
- **Alternatives Considered**:
  - `postgrest-py`: Lower-level; would require manual auth handling and RPC wrappers.
  - `supabase_py` (legacy): Archived and missing newer features like storage buckets and typed responses.

## OpenRouter + OpenAI Agents SDK Integration
- **Decision**: Use the `openai` Python SDK configured with `base_url="https://api.openrouter.ai/v1"` and `default_headers` carrying `HTTP-Referer` and `X-Title`, while authenticating using `OPENROUTER_API_KEY`. Wrap this client as the shared LLM interface for all agents.
- **Rationale**: OpenRouter is API-compatible with OpenAI routes, so the Agents SDK can operate by overriding the endpoint. This approach avoids duplicating agent orchestration logic and keeps model selection configurable.
- **Alternatives Considered**:
  - Direct HTTP requests via `httpx`: Higher boilerplate and loses built-in retry/backoff from `openai` SDK.
  - Using OpenAI key directly: Violates requirement to rely on OpenRouter for model access.

## Context7 MCP Server Usage
- **Decision**: Configure the orchestrator to query the Context7 MCP server for the "openai-agents-python" knowledge base during startup and cache best-practice snippets in the workspace memory store.
- **Rationale**: Ensures the orchestrating agent imports the latest guidance on tool usage, external API calling, and orchestration patterns, reducing drift from upstream recommendations.
- **Alternatives Considered**:
  - Hard-coding documentation excerpts: Quickly becomes stale and duplicates canonical source material.
  - Skipping MCP integration: Undermines the requirement to leverage contextual best practices.

## Integration Polling Pattern
- **Decision**: Implement scheduled pull-based ingestion for Slack, Notion, Trello, GitHub, Gmail, and Jira using their REST APIs with delta cursors where available; accept CSV upload for Google Sheets as interim support.
- **Rationale**: Webhooks vary in setup complexity per integration and increase infrastructure surface area. Polling within the agent run aligns with the daily digest cadence and simplifies authentication (single outbound channel behind workspace secrets).
- **Alternatives Considered**:
  - Webhook-based event streaming: Provides lower latency but requires public endpoints and verification flows not yet provisioned.
  - Manual export/import only: Would fail the requirement for automated daily digests across integrations.

## Status Classification Approach
- **Decision**: Combine heuristic keyword spotting ("done", "blocked", "waiting", etc.) with LLM-based classification for ambiguous cases, feeding both signals into the status classifier agent.
- **Rationale**: Pure LLM inference can be costly and slower, while heuristics alone miss nuanced updates. Hybrid approach provides accuracy while keeping latency within 15-minute target.
- **Alternatives Considered**:
  - LLM-only classification: Higher token usage and risk of inconsistent labels.
  - Rules-only classification: Too brittle for varied team communication styles.

## Sentiment Analysis Strategy
- **Decision**: Use a lightweight sentiment prompt on the same OpenRouter model with temperature tuned low (≤0.2) and map responses to "positive", "neutral", or "negative" with confidence scores.
- **Rationale**: Avoids introducing an additional third-party library while reusing the existing LLM context and keeping inference consistent with other agent tasks.
- **Alternatives Considered**:
  - External sentiment libraries (e.g., `vaderSentiment`): Fast but tuned for general social media, less accurate for project updates.
  - Custom fine-tuning: Out of scope for pilot timeline.
