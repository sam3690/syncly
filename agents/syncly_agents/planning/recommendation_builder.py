"""Planning agent that turns summaries into actionable recommendations."""

from __future__ import annotations

from datetime import date, timedelta
from typing import List, Optional

from syncly_agents.shared.models import (
    ActionPlan,
    AgentRequest,
    Milestone,
    MilestoneStatus,
    ProjectSummary,
    Recommendation,
    RecommendationPriority,
    RiskImpact,
    TaskState,
)

DEFAULT_PLANNER_MODEL = "openrouter/openai/gpt-4.1-mini"


def build_action_plan(
    request: AgentRequest,
    summary: ProjectSummary,
    *,
    use_llm: bool = False,
    model: str = DEFAULT_PLANNER_MODEL,
    client=None,
) -> ActionPlan:
    if use_llm:
        from syncly_agents.shared.openrouter_client import AgentInvocationError, OpenRouterAgentClient

        client_instance = client or OpenRouterAgentClient(model=model)
        try:
            schema = {
                "type": "object",
                "properties": {
                    "recommendations": {"type": "array", "items": {"type": "object"}},
                    "next_review": {"type": "string", "format": "date"},
                },
                "required": ["recommendations"],
            }
            result = client_instance.run_structured_completion(
                system_prompt="You are a project coach who suggests concrete actions.",
                messages=[
                    {"role": "user", "content": request.model_dump_json()},
                    {"role": "assistant", "content": summary.model_dump_json()},
                ],
                response_format={"type": "json_schema", "json_schema": {"name": "ActionPlan", "schema": schema}},
            )
            return ActionPlan.model_validate(result)
        except AgentInvocationError:
            return _build_heuristic_plan(request, summary)
        finally:
            if client is None:
                client_instance.close()
    return _build_heuristic_plan(request, summary)


def _build_heuristic_plan(request: AgentRequest, summary: ProjectSummary) -> ActionPlan:
    recommendations: List[Recommendation] = []

    recommendations.extend(_milestone_recommendations(request.milestones))
    recommendations.extend(_task_recommendations(request))

    if not recommendations:
        recommendations.append(
            Recommendation(
                title="Celebrate progress and prepare next sprint",
                priority=RecommendationPriority.P2,
                owner="Project Lead",
                due_by=date.today() + timedelta(days=7),
                action_items=[
                    "Thank the team for recent completions",
                    "Identify next backlog items to pull",
                ],
                rationale="Baseline planning guidance when no blockers are present.",
            )
        )

    next_review = date.today() + timedelta(days=3)
    return ActionPlan(recommendations=recommendations, next_review=next_review)


def _milestone_recommendations(milestones: List[Milestone]) -> List[Recommendation]:
    recs: List[Recommendation] = []
    for milestone in milestones:
        if milestone.status == MilestoneStatus.ON_TRACK:
            continue
        priority = RecommendationPriority.P0 if milestone.status == MilestoneStatus.BLOCKED else RecommendationPriority.P1
        due_by = date.today() + timedelta(days=2)
        recs.append(
            Recommendation(
                title=f"Stabilize milestone '{milestone.name}'",
                priority=priority,
                owner="Milestone Owner",
                due_by=due_by,
                action_items=[
                    "Review blocking factors with responsible leads",
                    "Escalate unresolved dependencies within 24h",
                ],
                rationale="Milestone status indicates delivery risk requiring intervention.",
            )
        )
    return recs


def _task_recommendations(request: AgentRequest) -> List[Recommendation]:
    recs: List[Recommendation] = []
    today = date.today()
    urgency_threshold = today + timedelta(days=3)
    for task in request.tasks:
        if task.status == TaskState.COMPLETE:
            continue
        action_items = [f"Confirm owner {task.owner or 'Unassigned'}"]
        priority = RecommendationPriority.P1
        if task.status == TaskState.PENDING:
            action_items.append("Start execution and communicate updated ETA")
        if task.due_date and task.due_date <= urgency_threshold:
            priority = RecommendationPriority.P0
            action_items.append("Reprioritize workload to hit due date")
        elif not task.due_date:
            action_items.append("Assign realistic due date")
        due_by = (task.due_date or (today + timedelta(days=5)))
        recs.append(
            Recommendation(
                title=f"Unblock task {task.task_id}",
                priority=priority,
                owner=task.owner or "Project Lead",
                due_by=due_by,
                action_items=action_items,
                rationale="Task is outstanding and may affect milestone delivery timelines.",
            )
        )
    return recs
