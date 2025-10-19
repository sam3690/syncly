"""Pydantic models shared across Syncly agent workflow components."""

from __future__ import annotations

from datetime import date, datetime, timedelta, UTC
from enum import Enum
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, FieldValidationInfo, field_validator, model_validator


class MilestoneStatus(str, Enum):
    """Lifecycle status values for project milestones."""

    ON_TRACK = "on_track"
    AT_RISK = "at_risk"
    BLOCKED = "blocked"


class TaskState(str, Enum):
    """Execution states for individual tasks."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETE = "complete"


class RiskImpact(str, Enum):
    """Impact classification for identified project risks."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class RecommendationPriority(str, Enum):
    """Priority ladder for planning recommendations."""

    P0 = "p0"
    P1 = "p1"
    P2 = "p2"


class AgentRunStatus(str, Enum):
    """Overall execution result for an orchestrated agent run."""

    SUCCESS = "success"
    PARTIAL = "partial"
    FAILED = "failed"


class ErrorCode(str, Enum):
    """Workflow-specific error classifications."""

    INPUT_MISSING = "input_missing"
    LLM_TIMEOUT = "llm_timeout"
    LLM_ERROR = "llm_error"
    UPSTREAM_FAILURE = "upstream_failure"


class Milestone(BaseModel):
    """Represents the current status of a project milestone."""

    name: str
    status: MilestoneStatus
    due_date: Optional[date] = None
    notes: Optional[str] = None

    @field_validator("due_date")
    @classmethod
    def _validate_due_date(cls, value: Optional[date]) -> Optional[date]:
        if value is not None and value.year < 2000:
            raise ValueError("Milestone due dates must be realistic calendar values")
        return value


class TaskStatus(BaseModel):
    """Tracks progress for a single work item."""

    task_id: str
    title: str
    owner: Optional[str] = None
    status: TaskState
    due_date: Optional[date] = None
    confidence: Optional[int] = Field(default=None, ge=0, le=100)

    @field_validator("due_date")
    @classmethod
    def _validate_due_date(
        cls,
        value: Optional[date],
        info: FieldValidationInfo,
    ) -> Optional[date]:
        if value is None:
            return value
        status: TaskState = info.data.get("status", TaskState.PENDING)
        if status in {TaskState.PENDING, TaskState.IN_PROGRESS} and value < date.today():
            raise ValueError("Pending or in-progress tasks cannot have overdue due dates")
        return value


class AgentRequest(BaseModel):
    """Payload provided by the backend to initiate the workflow."""

    request_id: UUID
    project_name: str
    milestones: List[Milestone] = Field(default_factory=list)
    tasks: List[TaskStatus] = Field(default_factory=list)
    metrics: Dict[str, float] = Field(default_factory=dict)
    generated_at: datetime
    requester: Optional[str] = None

    @model_validator(mode="after")
    def _ensure_content(self) -> "AgentRequest":
        if not self.milestones and not self.tasks:
            raise ValueError("AgentRequest must include at least one milestone or one task")
        return self

    @field_validator("generated_at")
    @classmethod
    def _validate_generated_at(cls, value: datetime) -> datetime:
        if value < datetime.now(UTC) - timedelta(hours=24):
            raise ValueError("AgentRequest generated_at is older than 24 hours")
        return value


class RiskItem(BaseModel):
    """Risk surfaced by the summarizing agent."""

    description: str
    impact: RiskImpact
    owner: Optional[str] = None
    mitigation: Optional[str] = None


class ProjectSummary(BaseModel):
    """Structured output from the summarizing agent."""

    headline: str
    progress_percent: int = Field(ge=0, le=100)
    risks: List[RiskItem] = Field(default_factory=list)
    highlights: List[str] = Field(default_factory=list)
    data_gaps: List[str] = Field(default_factory=list)


class Recommendation(BaseModel):
    """Actionable insight produced by the planning agent."""

    title: str
    priority: RecommendationPriority
    owner: Optional[str] = None
    due_by: Optional[date] = None
    action_items: List[str]
    rationale: Optional[str] = None

    @field_validator("due_by")
    @classmethod
    def _validate_due_by(cls, value: Optional[date]) -> Optional[date]:
        if value is not None and value < date.today():
            raise ValueError("Recommendation due dates must be in the future")
        return value


class ActionPlan(BaseModel):
    """Collection of planning recommendations."""

    recommendations: List[Recommendation]
    next_review: Optional[date] = None

    @model_validator(mode="after")
    def _ensure_recommendations(self) -> "ActionPlan":
        if not self.recommendations:
            raise ValueError("ActionPlan requires at least one recommendation")
        return self


class ErrorInfo(BaseModel):
    """Describes workflow errors returned to the backend."""

    code: ErrorCode
    message: Optional[str] = None
    retriable: bool = False


class RetryCounts(BaseModel):
    """Tracks retry attempts for downstream agents."""

    summarizer: int = Field(ge=0, default=0)
    planner: int = Field(ge=0, default=0)


class AgentRunMetadata(BaseModel):
    """Audit information for an orchestrated run."""

    request_id: UUID
    orchestrator_started_at: datetime
    summarizer_latency_ms: int = Field(ge=0)
    planner_latency_ms: int = Field(ge=0)
    retries: RetryCounts = Field(default_factory=RetryCounts)
    status: AgentRunStatus
    error: Optional[ErrorInfo] = None


class WorkflowEnvelope(BaseModel):
    """Combined response returned to the backend consumer."""

    summary: Optional[ProjectSummary] = None
    action_plan: Optional[ActionPlan] = None
    metadata: AgentRunMetadata

    @model_validator(mode="after")
    def _validate_consistency(self) -> "WorkflowEnvelope":
        if self.metadata.status == AgentRunStatus.SUCCESS:
            if self.summary is None or self.action_plan is None:
                raise ValueError("Successful workflows must include summary and action plan")
        if self.metadata.status == AgentRunStatus.FAILED and self.metadata.error is None:
            raise ValueError("Failed workflows must include error information")
        return self
