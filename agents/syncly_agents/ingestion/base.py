"""Shared ingestion utilities for external integrations."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Iterable, List

import httpx

from ..persistence.models import ActivityEvent, Provider, StatusLabel

_LOGGER = logging.getLogger(__name__)


class BaseIngestor:
    """Base class for integration-specific ingestors."""

    provider: Provider

    def __init__(self, client: httpx.Client | None = None) -> None:
        self._client = client or httpx.Client(timeout=20)

    def fetch_updates(
        self, workspace_id: str, last_synced_at: datetime | None
    ) -> List[ActivityEvent]:
        """Return normalized activity events for the integration.

        Subclasses should override this method. The default implementation returns an
        empty list to avoid blocking the orchestrator when an integration is not yet
        implemented.
        """

        _LOGGER.debug(
            "No-op ingestion for provider %s (workspace=%s)", self.provider, workspace_id
        )
        return []

    def __del__(self) -> None:  # pragma: no cover - defensive cleanup
        try:
            self._client.close()
        except Exception:
            pass


__all__ = ["BaseIngestor"]
