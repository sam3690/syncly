"""Hybrid heuristic + LLM status classifier."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional, Tuple

from openai import OpenAI

from ..persistence.models import SentimentLabel, StatusLabel
from ..settings import Settings, get_settings

_DONE_PATTERN = re.compile(r"\b(done|completed|resolved|finished|shipped)\b", re.I)
_BLOCKED_PATTERN = re.compile(r"\b(blocked|stuck|waiting|cannot|issue)\b", re.I)
_PROGRESS_PATTERN = re.compile(r"\b(working on|in progress|reviewing|building)\b", re.I)


@dataclass
class ClassificationResult:
    status: StatusLabel
    confidence: float
    rationale: Optional[str] = None


class LLMClassifier:
    """Light wrapper over OpenAI Agents SDK via OpenRouter."""

    def __init__(self, settings: Settings) -> None:
        headers = {}
        if settings.openai_http_referer:
            headers["HTTP-Referer"] = settings.openai_http_referer
        if settings.openai_title:
            headers["X-Title"] = settings.openai_title
        self._settings = settings
        self._client = OpenAI(
            base_url=settings.openai_base_url,
            api_key=settings.openrouter_api_key,
            default_headers=headers or None,
        )

    def classify(self, message: str) -> Optional[ClassificationResult]:
        prompt = (
            "Classify the task update as done, doing, or blocked. "
            "Return JSON like {\"status\": \"done\", \"rationale\": \"...\"}. "
            "Update: "
        )
        try:
            response = self._client.responses.create(
                model=self._settings.openai_model,
                input=[
                    {
                        "role": "system",
                        "content": "You are a project bot that labels task updates.",
                    },
                    {
                        "role": "user",
                        "content": f"{prompt}{message}",
                    },
                ],
            )
        except Exception:  # pragma: no cover - external dependency
            return None

        output = getattr(response, "output", None)
        if not output:  # pragma: no cover - fallback path
            return None
        try:
            text = response.output_text  # type: ignore[attr-defined]
        except AttributeError:  # pragma: no cover - API variations
            text = str(output)
        status = StatusLabel.DOING
        rationale = text
        confidence = 0.5
        text_lower = text.lower()
        if "blocked" in text_lower:
            status = StatusLabel.BLOCKED
        elif "done" in text_lower or "completed" in text_lower:
            status = StatusLabel.DONE
        return ClassificationResult(status=status, confidence=confidence, rationale=rationale)


class StatusClassifier:
    """Determine task status with heuristics and LLM fallback."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._llm = LLMClassifier(self._settings)

    def classify(self, update: str) -> ClassificationResult:
        text = update.strip()
        if not text:
            return ClassificationResult(status=StatusLabel.DOING, confidence=0.0)

        if _BLOCKED_PATTERN.search(text):
            return ClassificationResult(status=StatusLabel.BLOCKED, confidence=0.7)
        if _DONE_PATTERN.search(text):
            return ClassificationResult(status=StatusLabel.DONE, confidence=0.7)
        if _PROGRESS_PATTERN.search(text):
            return ClassificationResult(status=StatusLabel.DOING, confidence=0.6)

        llm_result = self._llm.classify(text)
        if llm_result:
            return llm_result

        return ClassificationResult(status=StatusLabel.DOING, confidence=0.4)

    @staticmethod
    def infer_sentiment(update: str) -> Tuple[SentimentLabel, float]:
        lower = update.lower()
        if any(word in lower for word in ("blocked", "worried", "frustrated")):
            return SentimentLabel.NEGATIVE, 0.6
        if any(word in lower for word in ("excited", "happy", "great", "shipped")):
            return SentimentLabel.POSITIVE, 0.6
        return SentimentLabel.NEUTRAL, 0.5


__all__ = ["StatusClassifier", "ClassificationResult"]
