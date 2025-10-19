"""Centralised configuration loader for Syncly agents."""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Optional

from dotenv import load_dotenv
from pydantic import BaseModel, Field, HttpUrl, ValidationError

load_dotenv()


class Settings(BaseModel):
    """Environment-backed configuration values."""

    openrouter_api_key: str = Field(alias="OPENROUTER_API_KEY")
    openai_base_url: HttpUrl = Field(alias="OPENAI_BASE_URL")
    supabase_url: HttpUrl = Field(alias="SUPABASE_URL")
    supabase_service_role_key: str = Field(alias="SUPABASE_SERVICE_ROLE_KEY")
    supabase_anon_key: Optional[str] = Field(alias="SUPABASE_ANON_KEY", default=None)
    context7_endpoint: HttpUrl = Field(alias="CONTEXT7_ENDPOINT")
    context7_api_key: str = Field(alias="CONTEXT7_API_KEY")
    digest_default_hour: str = Field(alias="DIGEST_DEFAULT_HOUR", default="09:00")
    workspace_timezone: str = Field(alias="WORKSPACE_TIMEZONE", default="UTC")
    slack_bot_token: Optional[str] = Field(alias="SLACK_BOT_TOKEN", default=None)
    email_smtp_url: Optional[str] = Field(alias="EMAIL_SMTP_URL", default=None)

    model_config = {
        "populate_by_name": True,
        "extra": "ignore",
    }


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached settings instance, raising a helpful error if validation fails."""

    try:
        return Settings(**os.environ)
    except ValidationError as exc:  # pragma: no cover - surfaced on misconfiguration
        missing = {e["loc"][0] for e in exc.errors() if e["type"] == "missing"}
        message = (
            "Missing required environment variables: "
            + ", ".join(sorted(missing))
            + ". Check agents/.env.example for required values."
        )
        raise RuntimeError(message) from exc
