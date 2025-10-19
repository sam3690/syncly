# Implementation Plan: Syncly Agentic Workflow Pipeline

**Branch**: `001-agent-pipeline-syncly` | **Date**: October 18, 2025 | **Spec**: [link](./spec.md)
**Input**: Feature specification from `/specs/001-agent-pipeline-syncly/spec.md`

**Note**: This plan follows the `/speckit.plan` workflow. Subsequent artifacts will be generated in this directory.

## Summary

Deliver an orchestrated AI agent pipeline inside the `agents/` uv-managed project so Syncly can ingest activity from Slack, Notion, Trello, GitHub, Gmail, and manual logs, classify updates (done/doing/blocked plus sentiment), produce daily digests, and dispatch Slack or email notifications. A FastAPI service fronts the orchestrator, fetching workspace context when triggered, delegating to specialized ingestion, classification, summarization, and notification agents, and pushing results back to the backend via REST and optional WebSocket streams while persisting data for dashboards and resend flows.

## Technical Context

**Language/Version**: Python 3.13 (uv-managed project)
**Primary Dependencies**: `openai-agents`, `openai` SDK, `httpx`, `pydantic`, `supabase` Python client, `fastapi`, `uvicorn`, `pytest`, Context7 MCP connector
**Storage**: Supabase (primary) with local JSON fallback for manual log uploads
**Testing**: pytest with coverage gates ≥80%
**Target Platform**: Linux container (Docker, CI Linux runners)
**Project Type**: Backend agent service (CLI entry + orchestrated agents)
**Performance Goals**: Daily digests generated before 09:00 workspace time; classification round-trip <15 minutes post-update; notifier success rate ≥95%
**Constraints**: Respect external API rate limits; memory ceiling 512MB per agent process; maintain secure handling of OAuth/API tokens
**Scale/Scope**: Pilot teams of 3–10 members; integrations limited to Slack, Notion, Trello, GitHub, Gmail, Jira, Google Sheets in first release

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Current `.specify/memory/constitution.md` lacks defined principles. No governing constraints detected for planning. **Gate Status (pre-research)**: Pass (no conflicts)
- Post-design artifacts (data model, contracts, quickstart) remain within identified scope and do not introduce additional complexity. **Gate Status (post-design)**: Pass

## Project Structure

### Documentation (this feature)

```
specs/001-agent-pipeline-syncly/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md   # created during /speckit.tasks
```

### Source Code (repository root)

```
agents/
├── main.py
├── pyproject.toml
├── syncly_agents/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── app.py
│   │   ├── routers/
│   │   │   ├── workspaces.py
│   │   │   └── websocket.py
│   │   └── schemas.py
│   ├── orchestrator/
│   │   ├── __init__.py
│   │   └── pipeline.py
│   ├── ingestion/
│   │   ├── slack.py
│   │   ├── notion.py
│   │   ├── trello.py
│   │   ├── github.py
│   │   ├── gmail.py
│   │   └── manual.py
│   ├── classification/
│   │   ├── status_classifier.py
│   │   └── sentiment.py
│   ├── summarization/
│   │   └── digest_writer.py
│   ├── notification/
│   │   ├── slack_notifier.py
│   │   └── email_notifier.py
│   ├── persistence/
│   │   ├── supabase_repository.py
│   │   └── models.py
│   └── settings.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
└── README.md
```

**Structure Decision**: Extend the existing `agents/` uv project with a `syncly_agents` package housing orchestrator, specialized agents, persistence, and config modules. Tests follow pytest conventions under `agents/tests/`.

## Complexity Tracking

No constitution violations identified; tracking table not required.

