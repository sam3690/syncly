# Data Model: Syncly Agent Workflow

## AgentRequest
- **Description**: Backend-provided context that seeds the orchestrator run.
- **Fields**:
  - `request_id` (UUID, required) — Correlates workflow invocations and supports idempotency.
  - `project_name` (string, required) — Display name for end-user messaging.
  - `milestones` (array<Milestone>, required) — Current milestone statuses supplied by backend.
  - `tasks` (array<TaskStatus>, required) — Outstanding tasks with owners and due dates.
  - `metrics` (object, optional) — Key performance indicators (throughput, burn down, quality).
  - `generated_at` (datetime, required) — Timestamp when backend compiled the payload.
  - `requester` (string, optional) — Human or service initiating the request.
- **Validation Rules**:
  - Must contain at least one milestone or one task.
  - `generated_at` cannot be more than 24 hours old (stale data detection).
  - Duplicate `request_id` within 10 minutes treated as idempotent replay.

## Milestone
- **Fields**:
  - `name` (string, required)
  - `status` (enum: `on_track`, `at_risk`, `blocked`, required)
  - `due_date` (date, optional)
  - `notes` (string, optional)
- **Validation Rules**:
  - Status transitions must follow: `on_track` → `at_risk` → `blocked` or back to `on_track`; direct `blocked` → `on_track` flag as data inconsistency.

## TaskStatus
- **Fields**:
  - `task_id` (string, required)
  - `title` (string, required)
  - `owner` (string, optional)
  - `status` (enum: `pending`, `in_progress`, `complete`, required)
  - `due_date` (date, optional)
  - `confidence` (integer %, optional)
- **Validation Rules**:
  - `due_date` must be in future for `pending`/`in_progress` tasks; overdue tasks automatically flagged for planning agent.

## ProjectSummary
- **Description**: Output of summarizing agent with structured findings.
- **Fields**:
  - `headline` (string, required) — One-sentence project health statement.
  - `progress_percent` (integer 0-100, required)
  - `risks` (array<RiskItem>, optional)
  - `highlights` (array<string>, optional)
  - `data_gaps` (array<string>, optional) — Missing or conflicting inputs flagged by the agent.
- **Validation Rules**:
  - `progress_percent` must align with milestone completion counts (difference ≤15%).
  - If `risks` empty but any milestone `at_risk`/`blocked`, summarizer must populate `data_gaps` with explanation.

## RiskItem
- **Fields**:
  - `description` (string, required)
  - `impact` (enum: `low`, `medium`, `high`, required)
  - `owner` (string, optional)
  - `mitigation` (string, optional)

## ActionPlan
- **Description**: Planning agent recommendations.
- **Fields**:
  - `recommendations` (array<Recommendation>, required)
  - `next_review` (date, optional)
- **Validation Rules**:
  - At least one recommendation when backlog tasks overdue or milestones `at_risk`/`blocked`.

## Recommendation
- **Fields**:
  - `title` (string, required)
  - `priority` (enum: `p0`, `p1`, `p2`, required)
  - `owner` (string, optional)
  - `due_by` (date, optional)
  - `action_items` (array<string>, required)
  - `rationale` (string, optional)

## AgentRunMetadata
- **Description**: Execution trace for orchestrator audits.
- **Fields**:
  - `request_id` (UUID, required)
  - `orchestrator_started_at` (datetime, required)
  - `summarizer_latency_ms` (integer, required)
  - `planner_latency_ms` (integer, required)
  - `retries` (object with `summarizer` and `planner` counts, required)
  - `status` (enum: `success`, `partial`, `failed`, required)
  - `error` (ErrorInfo, optional)

## ErrorInfo
- **Fields**:
  - `code` (enum: `input_missing`, `llm_timeout`, `llm_error`, `upstream_failure`)
  - `message` (string)
  - `retriable` (boolean)

## WorkflowEnvelope
- **Description**: Combined response returned to backend.
- **Fields**:
  - `summary` (ProjectSummary, optional when `status=failed`)
  - `action_plan` (ActionPlan, optional when `status=failed`)
  - `metadata` (AgentRunMetadata, required)

## State Transitions
- `AgentRunMetadata.status`: `success` when both agents finish without retries >1; `partial` when summarizer succeeds but planner fails; `failed` when summarizer fails or validation fails before planner.
