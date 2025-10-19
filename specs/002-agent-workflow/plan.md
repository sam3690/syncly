f# Implementation Plan: Syncly Agent Workflow

**Branch**: `[002-agent-workflow]` | **Date**: October 18, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-agent-workflow/spec.md`

## Summary

Implement a three-part agent workflow inside the `agents/` project: an orchestrator receives project status payloads from the backend, invokes a summarizing agent that produces a digest of project health, then passes those results to a planning agent that generates prioritized recommendations before returning a combined response and metadata back to the backend.

## Technical Context

**Language/Version**: Python 3.13  
**Primary Dependencies**: openai-agents SDK, openai Python SDK, OpenRouter HTTP API, httpx, pydantic, python-dotenv  
**Storage**: N/A (backend persists responses)  
**Testing**: pytest with httpx mocking utilities  
**Target Platform**: Linux container (backend service environment)  
**Project Type**: Backend agents package (CLI/worker)  
**Performance Goals**: Return summary + plan in ≤6 seconds for 95% of requests; ensure serialized payload size ≤256 KB  
**Constraints**: Sequential agent execution (Summarizing → Planning), deterministic response schema, offline caching not required  
**Scale/Scope**: Single orchestrated workflow servicing existing backend; expected burst load ≈ 30 concurrent requests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Observed `.specify/memory/constitution.md` contains no ratified principles; no blocking governance gates identified. Proceeding under assumption that standard project guidelines (code quality, testing, documentation) remain in effect.
- Post-design review (Phase 1): New artifacts (data model, contract, quickstart) align with Syncly coding standards; no constitution conflicts introduced.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
agents/
├── syncly_agents/
│   ├── orchestrator/
│   ├── summarization/
│   ├── planning/
│   ├── shared/
│   └── __init__.py
├── tests/
│   ├── orchestrator/
│   ├── summarization/
│   ├── planning/
│   └── fixtures/
└── README.md
```

**Structure Decision**: Extend the existing `agents/` Python package with dedicated subpackages for orchestration, summarization, and planning logic plus aligned pytest modules for unit and contract tests.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

