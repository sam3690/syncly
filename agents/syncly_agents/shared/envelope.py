"""Helpers for producing deterministic workflow envelopes."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from .models import (
    ActionPlan,
    AgentRunMetadata,
    AgentRunStatus,
    ErrorInfo,
    ProjectSummary,
    RetryCounts,
    WorkflowEnvelope,
)


def new_metadata(
    *,
    request_id: UUID,
    status: AgentRunStatus,
    summarizer_latency_ms: int = 0,
    planner_latency_ms: int = 0,
    retries: Optional[RetryCounts] = None,
    orchestrator_started_at: Optional[datetime] = None,
    error: Optional[ErrorInfo] = None,
) -> AgentRunMetadata:
    """Create a metadata record with sensible defaults."""

    return AgentRunMetadata(
        request_id=request_id,
        orchestrator_started_at=orchestrator_started_at or datetime.utcnow(),
        summarizer_latency_ms=summarizer_latency_ms,
        planner_latency_ms=planner_latency_ms,
        retries=retries or RetryCounts(),
        status=status,
        error=error,
    )


def build_success_envelope(
    *,
    summary: ProjectSummary,
    action_plan: ActionPlan,
    metadata: AgentRunMetadata,
) -> WorkflowEnvelope:
    """Return a success envelope ensuring metadata reflects success semantics."""

    if metadata.status != AgentRunStatus.SUCCESS:
        metadata = metadata.model_copy(update={"status": AgentRunStatus.SUCCESS, "error": None})
    return WorkflowEnvelope(summary=summary, action_plan=action_plan, metadata=metadata)


def build_failure_envelope(
    *,
    error: ErrorInfo,
    metadata: AgentRunMetadata,
) -> WorkflowEnvelope:
    """Return a failure envelope without summary or plan payloads."""

    metadata = metadata.model_copy(update={"status": AgentRunStatus.FAILED, "error": error})
    return WorkflowEnvelope(summary=None, action_plan=None, metadata=metadata)


def build_partial_envelope(
    *,
    summary: Optional[ProjectSummary],
    action_plan: Optional[ActionPlan],
    metadata: AgentRunMetadata,
    error: Optional[ErrorInfo] = None,
) -> WorkflowEnvelope:
    """Return a partial envelope where only a subset of agents succeeded."""

    metadata = metadata.model_copy(update={"status": AgentRunStatus.PARTIAL, "error": error})
    return WorkflowEnvelope(summary=summary, action_plan=action_plan, metadata=metadata)
