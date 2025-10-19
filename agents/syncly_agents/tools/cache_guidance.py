"""Fetch and persist Context7 MCP guidance for OpenAI Agents best practices."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict

import httpx

from ..settings import get_settings

_LOGGER = logging.getLogger(__name__)
_DEFAULT_CACHE = Path(".cache/context7/openai-agents-guidance.json")


def fetch_guidance(client: httpx.Client, endpoint: str, api_key: str) -> Dict[str, Any]:
    """Request guidance data from the Context7 MCP server."""

    headers = {"Authorization": f"Bearer {api_key}"}
    response = client.get(endpoint.rstrip("/") + "/v1/guidance/openai-agents-python", headers=headers)
    response.raise_for_status()
    return response.json()


def cache_guidance(output_path: Path | None = None) -> Path:
    """Store the latest guidance JSON locally and return the cache path."""

    output_path = output_path or _DEFAULT_CACHE
    output_path.parent.mkdir(parents=True, exist_ok=True)

    settings = get_settings()
    with httpx.Client(timeout=15) as client:
        try:
            payload = fetch_guidance(client, settings.context7_endpoint, settings.context7_api_key)
        except Exception as exc:  # pragma: no cover - network issues
            _LOGGER.warning("Context7 fetch failed (%s); falling back to public docs", exc)
            fallback = client.get("https://openai.github.io/openai-agents-python/")
            fallback.raise_for_status()
            payload = {"source": "https://openai.github.io/openai-agents-python/", "content": fallback.text}

    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    _LOGGER.info("Context7 guidance cached to %s", output_path)
    return output_path


def main() -> None:
    cache_path = cache_guidance()
    print(f"Guidance cached at {cache_path}")


if __name__ == "__main__":  # pragma: no cover - CLI helper
    main()
