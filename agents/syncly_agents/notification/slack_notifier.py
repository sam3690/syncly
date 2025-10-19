"""Slack notifier for Syncly digests."""

from __future__ import annotations

import json
import logging
from typing import Iterable

import httpx

from ..persistence.models import DigestReport
from ..settings import Settings, get_settings

_LOGGER = logging.getLogger(__name__)


class SlackNotifier:
    """Post digest summaries to Slack channels."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._client = httpx.Client(timeout=15)

    def send_digest(self, report: DigestReport, channel: str | None = None) -> tuple[bool, str]:
        token = self._settings.notifications.slack_bot_token
        if not token:
            return False, "Slack bot token missing"

        channel = channel or self._settings.notifications.slack_default_channel
        if not channel:
            return False, "Slack channel not configured"

        message = self._compose_message(report)
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=utf-8",
        }
        payload = {"channel": channel, "text": message}
        try:
            response = self._client.post(
                "https://slack.com/api/chat.postMessage", headers=headers, content=json.dumps(payload)
            )
            response.raise_for_status()
            data = response.json()
            if not data.get("ok", False):
                return False, data.get("error", "Unknown Slack error")
        except Exception as exc:  # pragma: no cover - network issues
            _LOGGER.error("Slack notification failed: %s", exc)
            return False, str(exc)

        return True, "sent"

    def send_blocker_alert(self, text: str, channel: str | None = None) -> tuple[bool, str]:
        token = self._settings.notifications.slack_bot_token
        if not token:
            return False, "Slack bot token missing"

        channel = channel or self._settings.notifications.slack_default_channel
        if not channel:
            return False, "Slack channel not configured"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=utf-8",
        }
        payload = {"channel": channel, "text": text}
        try:
            response = self._client.post(
                "https://slack.com/api/chat.postMessage", headers=headers, json=payload
            )
            response.raise_for_status()
            data = response.json()
            if not data.get("ok", False):
                return False, data.get("error", "Unknown Slack error")
        except Exception as exc:  # pragma: no cover - network issues
            _LOGGER.error("Slack blocker alert failed: %s", exc)
            return False, str(exc)

        return True, "sent"

    def _compose_message(self, report: DigestReport) -> str:
        lines = [f"*Syncly Daily Digest – {report.report_date.date()}*", ""]
        if report.progress_items:
            lines.append("*Completed*:")
            for item in report.progress_items:
                lines.append(f"• {item.owner}: {item.summary}")
        if report.blockers:
            lines.append("\n*Blockers*:")
            for blocker in report.blockers:
                lines.append(f"• {blocker.owner}: {blocker.reason}")
        if report.next_actions:
            lines.append("\n*Next Actions*:")
            for action in report.next_actions:
                lines.append(f"• {action.owner}: {action.description}")
        lines.append(f"\nTeam mood: {report.team_mood.value}")
        return "\n".join(lines)


__all__ = ["SlackNotifier"]
