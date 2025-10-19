"""Summarizing agent responsible for digesting project state."""

from __future__ import annotations

from typing import List, Optional

from syncly_agents.shared.models import (
    AgentRequest,
    Milestone,
    MilestoneStatus,
    ProjectSummary,
    RiskImpact,
    RiskItem,
    TaskState,
)

DEFAULT_SUMMARIZER_MODEL = "openrouter/anthropic/claude-3.5-sonnet"


def build_summary(
    request: AgentRequest,
    *,
    use_llm: bool = False,
    model: str = DEFAULT_SUMMARIZER_MODEL,
    client=None,
) -> ProjectSummary:
    """Create a structured project summary.

    The orchestration pipeline can supply an OpenRouter-aware client when running
    against a live model. Tests use the heuristic path by default.
    """

    if use_llm:
        from syncly_agents.shared.openrouter_client import (  # lazy import to avoid circulars
            AgentInvocationError,
            OpenRouterAgentClient,
        )

        client_instance = client or OpenRouterAgentClient(model=model)
        try:
            schema = {
                "type": "object",
                "properties": {
                    "headline": {"type": "string"},
                    "progress_percent": {"type": "integer"},
                    "risks": {"type": "array", "items": {"type": "object"}},
                    "highlights": {"type": "array", "items": {"type": "string"}},
                    "data_gaps": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["headline", "progress_percent"],
            }
            result = client_instance.run_structured_completion(
                system_prompt="You summarize project status in concise business language.",
                messages=[
                    {
                        "role": "user",
                        "content": request.model_dump_json(),
                    }
                ],
                response_format={"type": "json_schema", "json_schema": {"name": "ProjectSummary", "schema": schema}},
            )
            return ProjectSummary.model_validate(result)
        except AgentInvocationError:
            # Fall back to heuristic summary to keep the workflow resilient.
            return _build_heuristic_summary(request)
        finally:
            if client is None:
                client_instance.close()
    return _build_heuristic_summary(request)


def _build_heuristic_summary(request: AgentRequest) -> ProjectSummary:
    progress_percent = _calculate_progress(request)
    risk_items = _build_risk_items(request.milestones)
    highlights = _collect_highlights(request)
    headline = _compose_headline(request.project_name, progress_percent, len(risk_items))
    data_gaps = _detect_data_gaps(request)

    return ProjectSummary(
        headline=headline,
        progress_percent=progress_percent,
        risks=risk_items,
        highlights=highlights,
        data_gaps=data_gaps,
    )


def _calculate_progress(request: AgentRequest) -> int:
    if request.tasks:
        completed = sum(1 for task in request.tasks if task.status == TaskState.COMPLETE)
        return int(round((completed / len(request.tasks)) * 100))
    if request.milestones:
        on_track = sum(1 for milestone in request.milestones if milestone.status == MilestoneStatus.ON_TRACK)
        return int(round((on_track / len(request.milestones)) * 100))
    return 0


def _build_risk_items(milestones: List[Milestone]) -> List[RiskItem]:
    risks: List[RiskItem] = []
    for milestone in milestones:
        if milestone.status == MilestoneStatus.ON_TRACK:
            continue
        impact = RiskImpact.MEDIUM if milestone.status == MilestoneStatus.AT_RISK else RiskImpact.HIGH
        mitigation = milestone.notes or "Review owner action plan"
        risks.append(
            RiskItem(
                description=f"Milestone '{milestone.name}' is {milestone.status.replace('_', ' ')}",
                impact=impact,
                owner=None,
                mitigation=mitigation,
            )
        )
    return risks


def _collect_highlights(request: AgentRequest) -> List[str]:
    highlights: List[str] = []
    for task in request.tasks:
        if task.status == TaskState.COMPLETE:
            highlights.append(f"Completed {task.title} ({task.task_id})")
    if not highlights and request.milestones:
        on_track = [milestone.name for milestone in request.milestones if milestone.status == MilestoneStatus.ON_TRACK]
        if on_track:
            highlights.append(f"Milestones on track: {', '.join(on_track)}")
    return highlights


def _detect_data_gaps(request: AgentRequest) -> List[str]:
    gaps: List[str] = []
    for task in request.tasks:
        if not task.owner:
            gaps.append(f"Task {task.task_id} has no owner")
        if task.status != TaskState.COMPLETE and task.due_date is None:
            gaps.append(f"Task {task.task_id} missing due date")
    return gaps


def _compose_headline(project_name: str, progress_percent: int, risk_count: int) -> str:
    if risk_count == 0:
        return f"{project_name} is {progress_percent}% complete with no outstanding risks." 
    if risk_count == 1:
        return f"{project_name} is {progress_percent}% complete with 1 risk requiring attention."
    return f"{project_name} is {progress_percent}% complete with {risk_count} risks requiring attention."
