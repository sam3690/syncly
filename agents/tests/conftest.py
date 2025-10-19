"""Shared pytest fixtures for Syncly agent workflow tests."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict

import pytest
from dotenv import load_dotenv


AGENT_ROOT = Path(__file__).resolve().parents[1]
FIXTURES_DIR = AGENT_ROOT / "tests" / "fixtures"


@pytest.fixture(scope="session", autouse=True)
def configure_test_environment() -> None:
	"""Load environment variables required for agent execution."""

	load_dotenv(AGENT_ROOT / ".env", override=False)
	load_dotenv(AGENT_ROOT / ".env.example", override=False)

	api_key = os.environ.get("OPENAI_API_KEY")
	if not api_key or api_key == "your-openrouter-api-key":
		os.environ["OPENAI_API_KEY"] = "test-openrouter-key"

	base_url = os.environ.get("OPENAI_BASE_URL")
	if not base_url:
		os.environ["OPENAI_BASE_URL"] = "https://openrouter.ai/api/v1"

	timeout = os.environ.get("WORKFLOW_TIMEOUT_SECONDS")
	if not timeout:
		os.environ["WORKFLOW_TIMEOUT_SECONDS"] = "6"


@pytest.fixture()
def project_status_payload() -> Dict[str, Any]:
	"""Return a representative backend payload for workflow tests."""

	path = FIXTURES_DIR / "project_status.json"
	with path.open("r", encoding="utf-8") as handle:
		return json.load(handle)
