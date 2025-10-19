from __future__ import annotations

from syncly_agents.orchestrator.pipeline import AgentWorkflowOrchestrator
from syncly_agents.shared.models import AgentRunStatus


def test_workflow_returns_summary_and_plan(project_status_payload) -> None:
    orchestrator = AgentWorkflowOrchestrator(use_llm=False)

    envelope = orchestrator.run(project_status_payload)

    assert envelope.metadata.status == AgentRunStatus.SUCCESS
    assert envelope.summary is not None
    assert envelope.action_plan is not None
    assert envelope.action_plan.recommendations
    assert envelope.summary.risks
