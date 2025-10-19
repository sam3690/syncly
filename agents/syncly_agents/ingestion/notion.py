"""Notion ingestion agent."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import List

from .base import BaseIngestor
from ..persistence.models import ActivityEvent, Provider

_LOGGER = logging.getLogger(__name__)


class NotionIngestor(BaseIngestor):
    provider = Provider.NOTION

    def fetch_updates(
        self, workspace_id: str, last_synced_at: datetime | None
    ) -> List[ActivityEvent]:
        _LOGGER.info(
            "Fetching Notion updates for workspace %s since %s",
            workspace_id,
            last_synced_at,
        )
        return super().fetch_updates(workspace_id, last_synced_at)


__all__ = ["NotionIngestor"]
