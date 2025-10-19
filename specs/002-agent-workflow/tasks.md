# Tasks: Syncly Agent Workflow

**Input**: Design documents from `/specs/002-agent-workflow/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Targeted pytest scenarios are included where they unlock independent verification of each user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare package scaffolding, dependencies, and environment configuration for the new workflow.

- [x] T001 Create shared utilities package scaffold in `agents/syncly_agents/shared/__init__.py`
- [x] T002 Create planning agent package scaffold in `agents/syncly_agents/planning/__init__.py`
- [x] T003 Update OpenAI/OpenRouter dependencies (`httpx`, `pydantic`) in `agents/pyproject.toml`
- [x] T004 Extend environment template with OpenRouter variables in `agents/.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared data models, API clients, logging, and fixtures required by all user stories.

- [x] T005 Define workflow data models (AgentRequest, ProjectSummary, ActionPlan, AgentRunMetadata) in `agents/syncly_agents/shared/models.py`
- [x] T006 [P] Implement response envelope helpers in `agents/syncly_agents/shared/envelope.py`
- [x] T007 [P] Build OpenRouter-aware agent client wrapper in `agents/syncly_agents/shared/openrouter_client.py`
- [x] T008 [P] Add structured logging utilities with correlation IDs in `agents/syncly_agents/shared/logging.py`
- [x] T009 [P] Add representative backend payload fixture in `agents/tests/fixtures/project_status.json`
- [x] T010 Configure pytest shared fixtures and environment loading in `agents/tests/conftest.py`

**Checkpoint**: Foundation ready – user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 – Receive consolidated project intelligence (Priority: P1) 🎯 MVP

**Goal**: Deliver a single orchestrated response that combines a project health summary with actionable recommendations for program managers.

**Independent Test**: Invoke the orchestrator with `project_status.json` and confirm the returned `WorkflowEnvelope` contains both populated `summary` and `action_plan` sections with meaningful content.

### Tests for User Story 1 (write-first)

- [x] T011 [P] [US1] Create happy-path workflow integration test in `agents/tests/integration/test_workflow_success.py`
- [x] T012 [P] [US1] Create summarizer digest unit tests in `agents/tests/unit/summarization/test_digest_writer.py`

### Implementation for User Story 1

- [ ] T013 [P] [US1] Implement summarizing agent digest builder in `agents/syncly_agents/summarization/digest_writer.py`
- [ ] T014 [P] [US1] Implement baseline planning recommendations in `agents/syncly_agents/planning/recommendation_builder.py`
- [ ] T015 [US1] Implement orchestrator pipeline sequencing in `agents/syncly_agents/orchestrator/pipeline.py`
- [ ] T016 [US1] Add CLI entrypoint for workflow execution in `agents/syncly_agents/orchestrator/cli.py`

**Checkpoint**: Program managers can receive combined summary + plan responses without additional automation.

---

## Phase 4: User Story 2 – Support automated planning follow-up (Priority: P2)

**Goal**: Enable automation services to request mitigation guidance for delays or missed milestones and parse structured outputs.

**Independent Test**: Feed the workflow with delayed tasks via `test_workflow_delays.py` and verify the returned action plan highlights mitigation steps with owners or timing cues.

### Implementation for User Story 2

- [ ] T017 [P] [US2] Add delay and overdue heuristics to planning agent in `agents/syncly_agents/planning/recommendation_builder.py`
- [ ] T018 [P] [US2] Surface data gaps and conflicting statuses in summarizer output in `agents/syncly_agents/summarization/digest_writer.py`
- [ ] T019 [P] [US2] Add delay mitigation integration test in `agents/tests/integration/test_workflow_delays.py`
- [ ] T020 [US2] Update mitigation guidance fields in `specs/002-agent-workflow/contracts/workflow-openapi.yaml`

**Checkpoint**: Automation services receive structured mitigation instructions for delayed milestones.

---

## Phase 5: User Story 3 – Provide auditable agent collaboration (Priority: P3)

**Goal**: Capture and expose execution metadata so reviewers can understand agent order, timing, and outcomes.

**Independent Test**: Run the workflow via integration tests and confirm `AgentRunMetadata` includes agent identifiers, latencies, retries, and is logged for audit.

### Implementation for User Story 3

- [ ] T021 [P] [US3] Populate AgentRunMetadata and status transitions in `agents/syncly_agents/orchestrator/pipeline.py`
- [ ] T022 [P] [US3] Implement audit log exporter capturing metadata in `agents/syncly_agents/orchestrator/audit.py`
- [ ] T023 [US3] Add metadata logging unit test in `agents/tests/unit/orchestrator/test_metadata.py`

**Checkpoint**: Auditors can trace agent decisions and timings for every workflow run.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation, fixtures, and verification across user stories.

- [ ] T024 Update developer documentation with workflow steps in `agents/README.md`
- [ ] T025 Append audit usage guidance to `specs/002-agent-workflow/quickstart.md`
- [ ] T026 Document fixture expectations for QA in `agents/tests/fixtures/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 → Phase 2**: Phase 2 tasks rely on package scaffolding and dependency updates from Phase 1.
- **Phase 2 → Phase 3/4/5**: User story work cannot begin until shared models, client wrapper, and fixtures are ready.
- **Phase 3 → Phase 4**: User Story 2 enhancements build on baseline summarizer/planner behaviour from User Story 1.
- **Phase 3/4 → Phase 5**: Metadata instrumentation depends on a working orchestrator and planning pipeline.
- **Phase 6**: Documentation polish happens after stories are feature-complete.

### User Story Dependencies
- **US1 (P1)**: Depends on Phase 2 completion; no dependency on other stories.
- **US2 (P2)**: Depends on US1 for baseline planning flow.
- **US3 (P3)**: Depends on US1 (orchestrator) and partially on US2 tests for realistic payloads, but metadata logic is independent once US1 pipeline exists.

### Within-Story Ordering
- Tests (T011, T012, T019, T023) precede implementation tasks they cover.
- Summarizer (T013/T018) and planner (T014/T017) updates can run in parallel once tests outline expectations.
- Orchestrator pipeline tasks (T015, T021) execute after agents expose required interfaces.

## Parallel Opportunities

- T006, T007, and T008 can proceed in parallel after T005 because they touch separate shared modules.
- Within US1, T012 and T013 can run alongside T014 provided T011 defines the integration expectation up front.
- US2 tasks T017 and T018 can be developed concurrently; T019 validates combined behaviour afterwards.
- US3 tasks T021 and T022 can run in parallel, with T023 gating completion.

## Parallel Example: User Story 1

```bash
# Run tests in watch mode while implementing User Story 1
uv run pytest agents/tests/integration/test_workflow_success.py \
             agents/tests/unit/summarization/test_digest_writer.py

# In parallel, implement supporting modules
# - T013 edits agents/syncly_agents/summarization/digest_writer.py
# - T014 edits agents/syncly_agents/planning/recommendation_builder.py
```

## Implementation Strategy

### MVP First (User Story 1)
1. Complete Phase 1 and Phase 2 groundwork.
2. Deliver Phase 3 (US1) to provide combined summary + plan responses.
3. Validate via T011 integration test; demo to stakeholders before continuing.

### Incremental Delivery
1. After MVP validation, ship Phase 4 (US2) for delay mitigation automation.
2. Follow with Phase 5 (US3) to add auditability and governance.
3. Close with Phase 6 polish to ensure documentation and fixtures stay aligned.

### Parallel Team Strategy
- Developer A focuses on shared infrastructure (Phase 2) while Developer B prepares tests (T011, T012).
- Once Phase 2 completes, divide stories: Developer A on US1 implementation, Developer B on US2 enhancements, Developer C on US3 instrumentation.
- Conduct merges after each story’s checkpoint to keep increments deployable.
