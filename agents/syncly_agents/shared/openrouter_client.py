"""Wrapper for invoking OpenRouter-hosted models via the OpenAI client."""

from __future__ import annotations

import json
import os
from typing import Any, Dict, Optional, Sequence

import httpx
from openai import OpenAI

DEFAULT_BASE_URL = "https://openrouter.ai/api/v1"


class AgentInvocationError(RuntimeError):
	"""Raised when a model request fails or the response is unusable."""


class OpenRouterAgentClient:
	"""Configures an OpenAI client that targets the OpenRouter API surface."""

	def __init__(
		self,
		*,
		model: str,
		timeout_seconds: float = 4.0,
		extra_headers: Optional[Dict[str, str]] = None,
	) -> None:
		api_key = os.getenv("OPENAI_API_KEY")
		if not api_key:
			raise AgentInvocationError("OPENAI_API_KEY is required to contact OpenRouter")

		base_url = os.getenv("OPENAI_BASE_URL", DEFAULT_BASE_URL)
		self._model = model
		self._http_client = httpx.Client(timeout=timeout_seconds, headers=extra_headers or {})
		self._client = OpenAI(api_key=api_key, base_url=base_url, http_client=self._http_client)

	def __enter__(self) -> "OpenRouterAgentClient":
		return self

	def __exit__(self, exc_type, exc, tb) -> None:  # type: ignore[override]
		self.close()

	@property
	def model(self) -> str:
		return self._model

	def close(self) -> None:
		"""Close the underlying HTTP client."""

		self._http_client.close()

	def _build_messages(
		self,
		*,
		system_prompt: str,
		messages: Sequence[Dict[str, str]],
	) -> Sequence[Dict[str, str]]:
		payload = [{"role": "system", "content": system_prompt}]
		payload.extend(messages)
		return payload

	def run_completion(
		self,
		*,
		system_prompt: str,
		messages: Sequence[Dict[str, str]],
		temperature: float = 0.1,
		max_tokens: int = 900,
	) -> str:
		"""Execute a standard chat completion and return the text output."""

		chat_messages = self._build_messages(system_prompt=system_prompt, messages=list(messages))
		response = self._client.chat.completions.create(
			model=self._model,
			temperature=temperature,
			max_tokens=max_tokens,
			messages=chat_messages,
		)

		choice = response.choices[0] if response.choices else None
		content = choice.message.content if choice and choice.message else None
		if not content:
			raise AgentInvocationError("Model response did not include any content")
		return content

	def run_structured_completion(
		self,
		*,
		system_prompt: str,
		messages: Sequence[Dict[str, str]],
		response_format: Optional[Dict[str, Any]] = None,
		temperature: float = 0.1,
	) -> Dict[str, Any]:
		"""Execute a completion that returns JSON compliant with a schema."""

		kwargs: Dict[str, Any] = {}
		if response_format is not None:
			kwargs["response_format"] = response_format

		chat_messages = self._build_messages(system_prompt=system_prompt, messages=list(messages))
		response = self._client.chat.completions.create(
			model=self._model,
			temperature=temperature,
			messages=chat_messages,
			**kwargs,
		)

		choice = response.choices[0] if response.choices else None
		message = choice.message if choice else None
		payload = getattr(message, "content", None)
		if payload is None:
			raise AgentInvocationError("Structured completion missing response content")

		# Some models still reply with stringified JSON.
		if isinstance(payload, str):
			try:
				return json.loads(payload)
			except json.JSONDecodeError as exc:  # pragma: no cover - defensive branch
				raise AgentInvocationError("Structured completion response was not valid JSON") from exc

		for block in payload:  # type: ignore[not-an-iterable]
			block_type = getattr(block, "type", None)
			if block_type == "json_object":
				json_payload = getattr(block, "json", None)
				if json_payload is not None:
					return json_payload

		raise AgentInvocationError("Structured completion did not return a JSON object")
