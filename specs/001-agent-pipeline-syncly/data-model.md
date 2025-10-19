# Data Model: Syncly Agentic Workflow Pipeline

## IntegrationConnection
- **Fields**
  - `id` (UUID): Stable identifier for the connection
  - `workspace_id` (UUID): References Syncly workspace owning the connection (FK)
  - `provider` (enum): One of `slack`, `notion`, `trello`, `github`, `gmail`, `jira`, `google_sheets`
  - `auth_type` (enum): `oauth` or `api_token`
  - `access_token` (encrypted string): Stored securely in Supabase secrets vault
  - `refresh_token` (encrypted string, optional): Present for OAuth providers supporting refresh
  - `scopes` (string[]): Granted scopes or permissions
  - `status` (enum): `active`, `expired`, `revoked`, `error`
  - `last_synced_at` (timestamp, nullable): Most recent successful ingestion
  - `created_at` / `updated_at` (timestamps): Audit tracking
- **Validation Rules**
  - `provider` + `workspace_id` must be unique (one active connection per workspace/provider pair)
  - `access_token` required when `status` is `active`
  - `refresh_token` required for `oauth` connections that expire

## ActivityEvent
- **Fields**
  - `id` (UUID)
  - `workspace_id` (UUID)
  - `integration_connection_id` (UUID, FK → IntegrationConnection)
  - `external_id` (string): Provider-specific identifier for deduplication
  - `author` (string): Display name or email extracted from source
  - `author_id` (string, optional): Provider user identifier
  - `content` (text): Raw message or task update text
  - `task_reference` (string, optional): Derived task identifier or link
  - `timestamp` (timestamp): When the original update occurred
  - `status_label` (enum): `done`, `doing`, `blocked`
  - `classification_confidence` (float 0-1)
  - `sentiment` (enum): `positive`, `neutral`, `negative`
  - `sentiment_confidence` (float 0-1)
  - `keywords` (string[]): Extracted tags (e.g., "deployed", "bug")
  - `source_url` (string, optional): Deep link back to provider item
  - `ingested_at` (timestamp): When Syncly captured the event
- **Validation Rules**
  - Enforce uniqueness on (`integration_connection_id`, `external_id`)
  - `timestamp` must be ≤ `ingested_at`
  - Confidence values must be between 0 and 1 inclusive

## TaskStatusSummary
- **Fields**
  - `id` (UUID)
  - `workspace_id` (UUID)
  - `task_reference` (string)
  - `latest_status` (enum): `done`, `doing`, `blocked`
  - `owner` (string): Primary user responsible (from most recent event)
  - `owner_id` (string, optional)
  - `latest_event_id` (UUID, FK → ActivityEvent)
  - `blocker_reason` (text, optional)
  - `updated_at` (timestamp)
- **Relationships**
  - Aggregates multiple ActivityEvents by `task_reference`
- **Validation Rules**
  - `task_reference` required; derived fallback uses provider label if missing
  - `blocker_reason` required when `latest_status = blocked`

## DigestReport
- **Fields**
  - `id` (UUID)
  - `workspace_id` (UUID)
  - `report_date` (date): Logical day covered by the digest
  - `generated_at` (timestamp)
  - `time_zone` (string, IANA)
  - `progress_items` (JSONB): Array of objects summarizing completed and ongoing work
  - `blockers` (JSONB): Array including owner, reason, recommended action
  - `next_actions` (JSONB): Planned follow-ups aggregated per owner/team
  - `team_mood` (enum): `positive`, `neutral`, `negative`
  - `mood_rationale` (text)
  - `delivery_targets` (JSONB): Channels and recipients used
  - `delivery_status` (enum): `pending`, `sent`, `failed`, `partially_sent`
  - `delivery_logs` (JSONB): Timestamps and error messages per target
- **Validation Rules**
  - One digest per workspace per `report_date`
  - `delivery_logs` required when `delivery_status` in (`failed`, `partially_sent`)

## NotificationPreference
- **Fields**
  - `id` (UUID)
  - `workspace_id` (UUID)
  - `channel` (enum): `slack`, `email`
  - `target` (string): Slack channel ID or email distribution list
  - `schedule_time` (time): Default send time (HH:MM)
  - `timezone` (string, IANA)
  - `escalation_threshold` (int): Minutes after blocker detection to send immediate alert
  - `created_at` / `updated_at` (timestamps)
- **Validation Rules**
  - Enforce at least one active preference per workspace
  - `escalation_threshold` must be ≥0 and ≤1440

## Relationships Overview
- `IntegrationConnection` 1→N `ActivityEvent`
- `ActivityEvent` N→1 `TaskStatusSummary` (latest event)
- `DigestReport` aggregates `ActivityEvent` and `TaskStatusSummary` records for a date window
- `NotificationPreference` influences delivery of `DigestReport`
