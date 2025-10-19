from __future__ import annotations

from syncly_agents.shared.models import AgentRequest
from syncly_agents.summarization.digest_writer import build_summary


def test_build_summary_highlights_risks_and_progress(project_status_payload) -> None:
    request = AgentRequest.model_validate(project_status_payload)

    summary = build_summary(request)

    assert "Syncly Agent Rollout" in summary.headline
    assert summary.progress_percent >= 30
    assert any("Automation Integration" in risk.description for risk in summary.risks)
    assert any("OPS-7" in highlight for highlight in summary.highlights)
