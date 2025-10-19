"""Workflow orchestration for the Syncly agent pipeline."""

from __future__ import annotations

import logging
from contextlib import suppress
from datetime import datetime, UTC
from time import perf_counter
from typing import Any, Callable, Dict, Optional, Tuple, TypeVar
from uuid import UUID, uuid4

from pydantic import ValidationError

from syncly_agents.planning.recommendation_builder import build_action_plan
from syncly_agents.shared.envelope import (
    build_failure_envelope,
    build_partial_envelope,
    build_success_envelope,
    new_metadata,
)
from syncly_agents.shared.logging import get_logger, log_event
from syncly_agents.shared.models import (
    ActionPlan,
    AgentRequest,
    AgentRunMetadata,
    AgentRunStatus,
    ErrorCode,
    ErrorInfo,
    ProjectSummary,
    WorkflowEnvelope,
)
from syncly_agents.shared.openrouter_client import AgentInvocationError, OpenRouterAgentClient
from syncly_agents.summarization.digest_writer import build_summary


DEFAULT_SUMMARIZER_MODEL = "openrouter/anthropic/claude-3.5-sonnet"
DEFAULT_PLANNER_MODEL = "openrouter/openai/gpt-4.1-mini"
DEFAULT_MAX_RETRIES = 1


ClientFactory = Callable[[str], OpenRouterAgentClient]
StageResult = TypeVar("StageResult")


class AgentWorkflowOrchestrator:
    """Coordinates summarizing and planning agents in sequence."""

    def __init__(
        self,
        *,
        summarizer_model: str = DEFAULT_SUMMARIZER_MODEL,
        planner_model: str = DEFAULT_PLANNER_MODEL,
        use_llm: bool = True,
        client_factory: Optional[ClientFactory] = None,
        logger: Optional[logging.Logger] = None,
        max_retries: int = DEFAULT_MAX_RETRIES,
        stage_timeout_seconds: float = 4.0,
    ) -> None:
        self._summarizer_model = summarizer_model
        self._planner_model = planner_model
        self._use_llm = use_llm
        self._max_retries = max(0, max_retries)
        self._stage_timeout_seconds = stage_timeout_seconds
        self._client_factory = client_factory or self._default_client_factory
        self._logger = logger or get_logger()

    def run(self, payload: Dict[str, Any]) -> WorkflowEnvelope:
        """Execute the workflow for a backend-provided payload."""

        request_id = _extract_request_id(payload)
        metadata = new_metadata(
            request_id=request_id,
            status=AgentRunStatus.SUCCESS,
            orchestrator_started_at=datetime.now(UTC),
        )

        try:
            request = AgentRequest.model_validate(payload)
        except ValidationError as exc:
            error = ErrorInfo(code=ErrorCode.INPUT_MISSING, message=str(exc), retriable=False)
            log_event(
                self._logger,
                logging.ERROR,
                "Payload validation failed",
                correlation_id=str(request_id),
                extra_fields={"error": error.message},
            )
            metadata = metadata.model_copy(update={"error": error, "status": AgentRunStatus.FAILED})
            return build_failure_envelope(error=error, metadata=metadata)

        summary, metadata, error = self._run_summarizer(request, metadata)
        if summary is None:
            failure = error or ErrorInfo(code=ErrorCode.LLM_ERROR, message="Summarizer failed", retriable=False)
            return build_failure_envelope(error=failure, metadata=metadata)

        action_plan, metadata, error = self._run_planner(request, summary, metadata)
        if action_plan is None:
            partial_error = error or ErrorInfo(code=ErrorCode.LLM_ERROR, message="Planner failed", retriable=False)
            return build_partial_envelope(
                summary=summary,
                action_plan=None,
                metadata=metadata,
                error=partial_error,
            )

        metadata = metadata.model_copy(update={"status": AgentRunStatus.SUCCESS, "error": None})
        log_event(
            self._logger,
            logging.INFO,
            "Workflow completed successfully",
            correlation_id=str(request.request_id),
            extra_fields={
                "latency_ms": {
                    "summarizer": metadata.summarizer_latency_ms,
                    "planner": metadata.planner_latency_ms,
                }
            },
        )
        return build_success_envelope(summary=summary, action_plan=action_plan, metadata=metadata)

    def _run_summarizer(
        self,
        request: AgentRequest,
        metadata: AgentRunMetadata,
    ) -> Tuple[Optional[ProjectSummary], AgentRunMetadata, Optional[ErrorInfo]]:
        return self._execute_stage(
            stage="summarizer",
            request=request,
            metadata=metadata,
            model=self._summarizer_model,
            failure_status=AgentRunStatus.FAILED,
            builder=lambda client: build_summary(
                request,
                use_llm=self._use_llm,
                model=self._summarizer_model,
                client=client,
            ),
        )

    def _run_planner(
        self,
        request: AgentRequest,
        summary: ProjectSummary,
        metadata: AgentRunMetadata,
    ) -> Tuple[Optional[ActionPlan], AgentRunMetadata, Optional[ErrorInfo]]:
        return self._execute_stage(
            stage="planner",
            request=request,
            metadata=metadata,
            model=self._planner_model,
            failure_status=AgentRunStatus.PARTIAL,
            builder=lambda client: build_action_plan(
                request,
                summary,
                use_llm=self._use_llm,
                model=self._planner_model,
                client=client,
            ),
        )

    def _execute_stage(
        self,
        *,
        stage: str,
        request: AgentRequest,
        metadata: AgentRunMetadata,
        model: str,
        failure_status: AgentRunStatus,
        builder: Callable[[Optional[OpenRouterAgentClient]], StageResult],
    ) -> Tuple[Optional[StageResult], AgentRunMetadata, Optional[ErrorInfo]]:
        correlation_id = str(request.request_id)
        max_attempts = self._max_retries + 1
        last_error: Optional[ErrorInfo] = None

        for attempt in range(max_attempts):
            client: Optional[OpenRouterAgentClient] = None
            start = perf_counter()
            try:
                if self._use_llm:
                    client = self._create_client(model)
                result = builder(client)
                latency_ms = _elapsed_ms(start)
                metadata = self._update_latency(metadata, stage, latency_ms)
                metadata = self._update_retries(metadata, stage, attempt)
                log_event(
                    self._logger,
                    logging.INFO,
                    f"{stage.title()} agent completed",
                    correlation_id=correlation_id,
                    extra_fields={"latency_ms": latency_ms, "attempt": attempt + 1},
                )
                return result, metadata, None
            except AgentInvocationError as exc:
                latency_ms = _elapsed_ms(start)
                metadata = self._update_latency(metadata, stage, latency_ms)
                metadata = self._update_retries(metadata, stage, attempt)
                error_code, is_transient = self._classify_agent_error(exc)
                last_error = ErrorInfo(code=error_code, message=str(exc), retriable=is_transient)
                log_event(
                    self._logger,
                    logging.ERROR,
                    f"{stage.title()} agent invocation failed",
                    correlation_id=correlation_id,
                    extra_fields={
                        "error": last_error.message,
                        "attempt": attempt + 1,
                        "latency_ms": latency_ms,
                    },
                )
                if not is_transient or attempt == max_attempts - 1:
                    metadata = metadata.model_copy(update={"status": failure_status, "error": last_error})
                    return None, metadata, last_error
                continue
            except Exception as exc:  # pragma: no cover - defensive coding
                latency_ms = _elapsed_ms(start)
                metadata = self._update_latency(metadata, stage, latency_ms)
                metadata = self._update_retries(metadata, stage, attempt)
                last_error = ErrorInfo(code=ErrorCode.UPSTREAM_FAILURE, message=str(exc), retriable=False)
                metadata = metadata.model_copy(update={"status": failure_status, "error": last_error})
                log_event(
                    self._logger,
                    logging.ERROR,
                    f"{stage.title()} agent raised unexpected error",
                    correlation_id=correlation_id,
                    extra_fields={
                        "error": last_error.message,
                        "attempt": attempt + 1,
                        "latency_ms": latency_ms,
                    },
                )
                return None, metadata, last_error
            finally:
                if client is not None:
                    client.close()

        # Should be unreachable because loop either returns success or failure.
        return None, metadata, last_error

    def _update_latency(self, metadata: AgentRunMetadata, stage: str, latency_ms: int) -> AgentRunMetadata:
        field = "summarizer_latency_ms" if stage == "summarizer" else "planner_latency_ms"
        return metadata.model_copy(update={field: latency_ms})

    def _update_retries(self, metadata: AgentRunMetadata, stage: str, attempt: int) -> AgentRunMetadata:
        retries_field = "summarizer" if stage == "summarizer" else "planner"
        retries_value = attempt
        retries_model = metadata.retries.model_copy(update={retries_field: retries_value})
        return metadata.model_copy(update={"retries": retries_model})

    def _classify_agent_error(self, exc: AgentInvocationError) -> Tuple[ErrorCode, bool]:
        message = str(exc).lower()
        if "timeout" in message:
            return ErrorCode.LLM_TIMEOUT, True
        return ErrorCode.LLM_ERROR, False

    def _create_client(self, model: str) -> OpenRouterAgentClient:
        return self._client_factory(model)

    def _default_client_factory(self, model: str) -> OpenRouterAgentClient:
        return OpenRouterAgentClient(model=model, timeout_seconds=self._stage_timeout_seconds)


def _elapsed_ms(start: float) -> int:
    return max(0, int((perf_counter() - start) * 1000))


def _extract_request_id(payload: Dict[str, Any]) -> UUID:
    raw_value = payload.get("request_id")
    if isinstance(raw_value, UUID):
        return raw_value
    if isinstance(raw_value, str):
        with suppress(ValueError):
            return UUID(raw_value)
    return uuid4()
