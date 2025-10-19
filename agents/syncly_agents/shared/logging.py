"""Minimal structured logging helpers for Syncly agents."""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, Optional

DEFAULT_LOGGER_NAME = "syncly.agents"


def get_logger(name: str = DEFAULT_LOGGER_NAME) -> logging.Logger:
    """Return a logger configured for single-line JSON payloads."""

    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter("%(message)s"))
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        logger.propagate = False
    return logger


def log_event(
    logger: logging.Logger,
    level: int,
    message: str,
    *,
    correlation_id: str,
    extra_fields: Optional[Dict[str, Any]] = None,
) -> None:
    """Emit a structured log event enriched with a correlation id."""

    event: Dict[str, Any] = {
        "message": message,
        "correlation_id": correlation_id,
    }
    if extra_fields:
        event.update(extra_fields)
    logger.log(level, json.dumps(event, default=str))
