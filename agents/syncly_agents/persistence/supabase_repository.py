"""Supabase persistence helpers for Syncly agents."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable, Optional, Sequence

from supabase import Client, create_client

from syncly_agents import settings


class PersistenceError(RuntimeError):
    """Raised when Supabase operations fail."""


@dataclass
class SupabaseRepository:
    """Lightweight wrapper around the Supabase Python client."""

    client: Client

    @classmethod
    def from_settings(cls, config: Optional[settings.Settings] = None) -> "SupabaseRepository":
        cfg = config or settings.get_settings()
        client = create_client(cfg.supabase_url, cfg.supabase_service_role_key)
        return cls(client)

    # Integration Connections -------------------------------------------------
    def upsert_integration_connection(self, record: dict[str, Any]) -> dict[str, Any]:
        """Insert or update an integration connection record."""

        try:
            response = (
                self.client.table("integration_connections")
                .upsert(record, on_conflict="workspace_id,provider")
                .execute()
            )
        except Exception as exc:  # pragma: no cover - network layer
            raise PersistenceError("Failed to upsert integration connection") from exc
        return (response.data or [{}])[0]

    def list_integration_connections(self, workspace_id: str) -> list[dict[str, Any]]:
        try:
            response = (
                self.client.table("integration_connections")
                .select("*")
                .eq("workspace_id", workspace_id)
                .execute()
            )
        except Exception as exc:  # pragma: no cover
            raise PersistenceError("Failed to list integration connections") from exc
        return response.data or []

    # Activity Events ---------------------------------------------------------
    def upsert_activity_events(self, events: Sequence[dict[str, Any]]) -> list[dict[str, Any]]:
        if not events:
            return []
        try:
            response = (
                self.client.table("activity_events")
                .upsert(list(events), on_conflict="integration_connection_id,external_id")
                .execute()
            )
        except Exception as exc:  # pragma: no cover
            raise PersistenceError("Failed to upsert activity events") from exc
        return response.data or []

    def fetch_activity_events(
        self,
        workspace_id: str,
        since_iso: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        try:
            query = (
                self.client.table("activity_events")
                .select("*")
                .eq("workspace_id", workspace_id)
                .order("timestamp", desc=False)
            )
            if since_iso:
                query = query.gte("timestamp", since_iso)
            response = query.execute()
        except Exception as exc:  # pragma: no cover
            raise PersistenceError("Failed to fetch activity events") from exc
        return response.data or []

    # Digest Reports ----------------------------------------------------------
    def store_digest_report(self, report: dict[str, Any]) -> dict[str, Any]:
        try:
            response = (
                self.client.table("digest_reports")
                .upsert(report, on_conflict="workspace_id,report_date")
                .execute()
            )
        except Exception as exc:  # pragma: no cover
            raise PersistenceError("Failed to store digest report") from exc
        return (response.data or [{}])[0]

    def list_digest_reports(self, workspace_id: str, limit: int = 10) -> list[dict[str, Any]]:
        try:
            response = (
                self.client.table("digest_reports")
                .select("*")
                .eq("workspace_id", workspace_id)
                .order("report_date", desc=True)
                .limit(limit)
                .execute()
            )
        except Exception as exc:  # pragma: no cover
            raise PersistenceError("Failed to list digest reports") from exc
        return response.data or []

    # Notification Preferences -------------------------------------------------
    def list_notification_preferences(self, workspace_id: str) -> list[dict[str, Any]]:
        try:
            response = (
                self.client.table("notification_preferences")
                .select("*")
                .eq("workspace_id", workspace_id)
                .execute()
            )
        except Exception as exc:  # pragma: no cover
            raise PersistenceError("Failed to list notification preferences") from exc
        return response.data or []
