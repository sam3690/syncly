"""Email notifier for Syncly digests."""

from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage
from typing import Iterable

from ..persistence.models import DigestReport
from ..settings import Settings, get_settings

_LOGGER = logging.getLogger(__name__)


class EmailNotifier:
    """Send digest reports via SMTP."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()

    def send_digest(self, report: DigestReport, recipients: Iterable[str]) -> tuple[bool, str]:
        recipients = list(recipients)
        if not recipients:
            return False, "No email recipients configured"

        cfg = self._settings.notifications
        for required in (cfg.smtp_host, cfg.smtp_username, cfg.smtp_password, cfg.from_email):
            if not required:
                return False, "SMTP configuration incomplete"

        message = EmailMessage()
        message["Subject"] = f"Syncly Daily Digest – {report.report_date.date()}"
        message["From"] = cfg.from_email
        message["To"] = ", ".join(recipients)
        message.set_content(self._compose_body(report))

        try:
            with smtplib.SMTP(cfg.smtp_host, cfg.smtp_port or 587) as client:
                client.starttls()
                client.login(cfg.smtp_username, cfg.smtp_password)
                client.send_message(message)
        except Exception as exc:  # pragma: no cover - network issues
            _LOGGER.error("Email notification failed: %s", exc)
            return False, str(exc)

        return True, "sent"

    def _compose_body(self, report: DigestReport) -> str:
        lines = [f"Syncly Daily Digest ({report.report_date.date()})", ""]
        if report.progress_items:
            lines.append("Completed:\n" + "\n".join(
                f"- {item.owner}: {item.summary}" for item in report.progress_items
            ))
        if report.blockers:
            lines.append("\nBlockers:\n" + "\n".join(
                f"- {blocker.owner}: {blocker.reason}" for blocker in report.blockers
            ))
        if report.next_actions:
            lines.append("\nNext Actions:\n" + "\n".join(
                f"- {action.owner}: {action.description}" for action in report.next_actions
            ))
        lines.append(f"\nTeam mood: {report.team_mood.value}")
        if report.mood_rationale:
            lines.append(report.mood_rationale)
        return "\n".join(lines)


__all__ = ["EmailNotifier"]
