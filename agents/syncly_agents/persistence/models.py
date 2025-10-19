"""Pydantic models representing persisted Syncly agent entities."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class Provider(str, Enum):
    SLACK = "slack"
    NOTION = "notion"
    TRELLO = "trello"
    GITHUB = "github"
    GMAIL = "gmail"
    JIRA = "jira"
    GOOGLE_SHEETS = "google_sheets"
    MANUAL = "manual"


class AuthType(str, Enum):
    OAUTH = "oauth"
    API_TOKEN = "api_token"


class IntegrationStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"
    ERROR = "error"


class StatusLabel(str, Enum):
    DONE = "done"
    DOING = "doing"
    BLOCKED = "blocked"


class SentimentLabel(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


class DeliveryStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    PARTIALLY_SENT = "partially_sent"


class IntegrationConnection(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: str
    workspace_id: str
    provider: Provider
    auth_type: AuthType
    access_token: str
    refresh_token: Optional[str] = None
    scopes: List[str] = Field(default_factory=list)
    status: IntegrationStatus = IntegrationStatus.ACTIVE
    last_synced_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class ActivityEvent(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: str
    workspace_id: str
    integration_connection_id: str = Field(alias="integration_connection_id")
    external_id: str
    author: str
    author_id: Optional[str] = None
    content: str
    task_reference: Optional[str] = None
    timestamp: datetime
    status_label: StatusLabel
    classification_confidence: float
    sentiment: SentimentLabel
    sentiment_confidence: float
    keywords: List[str] = Field(default_factory=list)
    source_url: Optional[str] = None
    ingested_at: datetime


class TaskStatusSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: str
    workspace_id: str
    task_reference: str
    latest_status: StatusLabel
    owner: str
    owner_id: Optional[str] = None
    latest_event_id: str
    blocker_reason: Optional[str] = None
    updated_at: datetime


class DigestProgressItem(BaseModel):
    owner: str
    status: StatusLabel
    summary: str
    source: Optional[str] = None
    integration: Optional[Provider] = None


class DigestBlockerItem(BaseModel):
    owner: str
    reason: str
    recommended_action: Optional[str] = None
    integration: Optional[Provider] = None


class DigestNextAction(BaseModel):
    owner: str
    description: str


class DigestDeliveryLog(BaseModel):
    target: str
    channel: str
    status: DeliveryStatus
    detail: Optional[str] = None
    sent_at: Optional[datetime] = None


class DigestReport(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: str
    workspace_id: str
    report_date: datetime
    generated_at: datetime
    time_zone: str
    progress_items: List[DigestProgressItem]
    blockers: List[DigestBlockerItem]
    next_actions: List[DigestNextAction]
    team_mood: SentimentLabel
    mood_rationale: Optional[str] = None
    delivery_targets: List[str] = Field(default_factory=list)
    delivery_status: DeliveryStatus = DeliveryStatus.PENDING
    delivery_logs: List[DigestDeliveryLog] = Field(default_factory=list)


class NotificationChannel(str, Enum):
    SLACK = "slack"
    EMAIL = "email"


class NotificationPreference(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: str
    workspace_id: str
    channel: NotificationChannel
    target: str
    schedule_time: str
    timezone: str
    escalation_threshold: int = 60
    created_at: datetime
    updated_at: datetime


__all__ = [
    "ActivityEvent",
    "AuthType",
    "DeliveryStatus",
    "DigestBlockerItem",
    "DigestDeliveryLog",
    "DigestNextAction",
    "DigestProgressItem",
    "DigestReport",
    "IntegrationConnection",
    "IntegrationStatus",
    "NotificationChannel",
    "NotificationPreference",
    "Provider",
    "SentimentLabel",
    "StatusLabel",
    "TaskStatusSummary",
]
