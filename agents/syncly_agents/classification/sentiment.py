"""Sentiment detection helper using heuristics with LLM refinement."""

from __future__ import annotations

from typing import Tuple

from openai import OpenAI

from ..persistence.models import SentimentLabel
from ..settings import Settings, get_settings

_POSITIVE_HINTS = ("great", "awesome", "excited", "delighted", "fixed", "shipped")
_NEGATIVE_HINTS = ("blocked", "issue", "bug", "frustrated", "stuck", "angry")


class SentimentAnalyzer:
    """Return coarse sentiment scores for activity updates."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._client = OpenAI(
            base_url=self._settings.openai_base_url,
            api_key=self._settings.openrouter_api_key,
        )

    def analyze(self, update: str) -> Tuple[SentimentLabel, float]:
        text = update.lower()
        if any(token in text for token in _NEGATIVE_HINTS):
            return SentimentLabel.NEGATIVE, 0.6
        if any(token in text for token in _POSITIVE_HINTS):
            return SentimentLabel.POSITIVE, 0.6

        try:  # pragma: no cover - external dependency
            response = self._client.responses.create(
                model=self._settings.openai_model,
                input=[
                    {
                        "role": "system",
                        "content": "Return 'positive', 'neutral', or 'negative' for the tone.",
                    },
                    {"role": "user", "content": update},
                ],
            )
            text_response = response.output_text.lower()  # type: ignore[attr-defined]
            if "positive" in text_response:
                return SentimentLabel.POSITIVE, 0.55
            if "negative" in text_response:
                return SentimentLabel.NEGATIVE, 0.55
        except Exception:
            pass

        return SentimentLabel.NEUTRAL, 0.5


__all__ = ["SentimentAnalyzer"]
