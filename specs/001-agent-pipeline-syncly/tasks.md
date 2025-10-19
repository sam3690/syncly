# Execution Tasks: Syncly Agentic Workflow Pipeline

**Branch**: `001-agent-pipeline-syncly`  
**Spec**: `specs/001-agent-pipeline-syncly/spec.md`

---

## Phase 1: Setup
- [ ] T001 Configure uv project dependencies in agents/pyproject.toml (ensure `openai-agents`, `openai`, `httpx`, `pydantic`, `supabase`, Context7 connector are listed)
- [ ] T002 Create environment template agents/.env.example documenting OPENROUTER_API_KEY, Supabase keys, Context7 credentials, backend REST host
- [ ] T003 Initialize syncly_agents package structure under agents/syncly_agents/__init__.py and update agents/main.py entrypoint scaffold

## Phase 2: Foundational Infrastructure
- [ ] T004 Implement configuration loader in agents/syncly_agents/settings.py with dotenv support and validation
- [ ] T005 Implement Supabase repository base in agents/syncly_agents/persistence/supabase_repository.py with CRUD helpers for IntegrationConnection and ActivityEvent
- [ ] T006 Implement MCP guidance cache utility in agents/syncly_agents/tools/cache_guidance.py to pull Context7 snippets at bootstrap
- [ ] T007 Implement backend REST client in agents/syncly_agents/clients/backend_api.py supporting authenticated GET/POST for context and result payloads
- [ ] T008 Add pytest configuration and shared fixtures in agents/tests/conftest.py covering env setup, Supabase mocks, and backend REST stubs

## Phase 3: User Story 1 – Automated Daily Digest (Priority: P1)
**Goal**: Manager receives automated daily digest summarizing progress, blockers, and next actions across connected tools.
**Independent Test**: Trigger orchestrator run with backend-provided workspace context; verify digest payload stored and summary posted back to backend for delivery.

- [ ] T009 [US1] Implement orchestrator pipeline skeleton in agents/syncly_agents/orchestrator/pipeline.py coordinating context retrieval, reasoning, summarization, planning, and backend result submission
- [ ] T010 [P] [US1] Implement backend context fetch service in agents/syncly_agents/services/context_fetcher.py pulling workspace state via backend REST client
- [ ] T011 [US1] Implement reasoning agent in agents/syncly_agents/agents/reasoning_agent.py to derive insights and task statuses from provided context
- [ ] T012 [P] [US1] Implement summarization agent in agents/syncly_agents/agents/summarization_agent.py generating daily digest sections from reasoning output
- [ ] T013 [US1] Implement planning agent in agents/syncly_agents/agents/planning_agent.py outlining next actions and follow-ups based on reasoning output
- [ ] T014 [US1] Implement backend result publisher in agents/syncly_agents/services/result_publisher.py posting digests and notifications back via REST
- [ ] T015 [US1] Ensure orchestrator persists digest outputs and delivery logs via Supabase repository methods for 30-day retention
- [ ] T016 [US1] Add pytest unit tests for orchestrator coordination, reasoning agent prompts, and summarization/planning outputs in agents/tests/unit/orchestrator/test_pipeline.py and agents/tests/unit/agents/test_reasoning.py
- [ ] T017 [US1] Add integration test simulating end-to-end digest run with mocked backend REST and Supabase in agents/tests/integration/test_digest_run.py

## Phase 4: User Story 2 – Blocker Escalation (Priority: P2)
**Goal**: Detect blockers and notify manager promptly with context and suggested actions.
**Independent Test**: Feed backend context containing blocker updates and confirm digest highlights blockers plus immediate alert payload returned to backend within escalation threshold.

- [ ] T018 [US2] Extend reasoning agent logic in agents/syncly_agents/agents/reasoning_agent.py to extract blocker reasons and impacted owners from backend-provided context
- [ ] T019 [US2] Implement escalation policy evaluation in agents/syncly_agents/orchestrator/pipeline.py leveraging NotificationPreference data retrieved from backend
- [ ] T020 [US2] Update result publisher to push blocker alerts via backend REST POST in agents/syncly_agents/services/result_publisher.py with delivery logging
- [ ] T021 [US2] Update Supabase repository to track blocker alerts and escalation state in agents/syncly_agents/persistence/supabase_repository.py
- [ ] T022 [US2] Add integration test covering blocker escalation flow with backend REST mocks in agents/tests/integration/test_blocker_escalation.py

## Phase 5: User Story 3 – Manual Log Upload (Priority: P3)
**Goal**: Support manual activity log ingestion when API access is unavailable.
**Independent Test**: Provide backend manual log context payload and confirm entries appear in digest alongside other data with clear origin labels.

- [ ] T023 [US3] Implement manual log context handler in agents/syncly_agents/services/context_fetcher.py to process backend-provided manual uploads metadata
- [ ] T024 [US3] Update reasoning and summarization agents to incorporate manual log entries with origin labels in digest outputs
- [ ] T025 [US3] Persist manual activity source metadata via Supabase repository updates in agents/syncly_agents/persistence/supabase_repository.py
- [ ] T026 [US3] Add tests for manual log handling edge cases using backend REST fixtures in agents/tests/unit/services/test_context_fetcher.py

## Phase 6: Polish & Cross-Cutting
- [ ] T027 Document README updates in agents/README.md covering setup, CLI usage, and scheduling
- [ ] T028 Add observability hooks (structured logging, metrics placeholders) in agents/syncly_agents/orchestrator/pipeline.py and related modules
- [ ] T029 Perform uv lock refresh and ensure `uv run pytest` passes with coverage report

---

## Dependencies & Story Order
1. Phase 1 Setup → Phase 2 Foundational → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 Polish
2. US1 completion is prerequisite for US2 and US3 (digest pipeline must exist before enhancements)

## Parallel Execution Opportunities
- T010 and T012 run in parallel once orchestrator skeleton (T009) exists
- T013 and T014 can proceed concurrently after reasoning output contract (T011)
- T023 and T026 can run in parallel after context handler scaffold (T023) is outlined

## Implementation Strategy
- MVP delivers Phase 1–3 to satisfy automated digest requirement
- Follow with Phase 4 escalation logic, then Phase 5 manual upload support, ending with polish
