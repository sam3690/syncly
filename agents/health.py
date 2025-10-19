"""Simple FastAPI health endpoint for the agents service."""

from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Any
import mangum

app = FastAPI()


class HealthResponse(BaseModel):
    status: str
    started_at: datetime


class InsightItem(BaseModel):
    id: int
    title: str
    description: str
    impact: str
    category: str
    metrics: Dict[str, Any]
    icon: str


class InsightsResponse(BaseModel):
    insights: List[InsightItem]
    stats: Dict[str, Any]


class SuggestionItem(BaseModel):
    id: int
    title: str
    description: str
    priority: str
    type: str
    estimatedTime: str


class SuggestionsResponse(BaseModel):
    suggestions: List[SuggestionItem]
    summary: Dict[str, Any]


STARTED_AT = datetime.utcnow()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", started_at=STARTED_AT)


@app.get("/insights", response_model=InsightsResponse)
def get_insights() -> InsightsResponse:
    """Get AI-powered insights about project activities and workflows."""
    return InsightsResponse(
        insights=[
            {
                "id": 1,
                "title": "GitHub Activity Analysis",
                "description": "Recent commits show active development. Consider reviewing PR #42 for potential optimizations.",
                "impact": "medium",
                "category": "Development",
                "metrics": {"commits": 15, "prs": 3},
                "icon": "Target"
            },
            {
                "id": 2,
                "title": "Workflow Efficiency",
                "description": "Multiple workflows are running simultaneously. Consider prioritizing based on dependencies.",
                "impact": "high",
                "category": "Productivity",
                "metrics": {"active_workflows": 3, "bottlenecks": 1},
                "icon": "TrendingUp"
            },
            {
                "id": 3,
                "title": "Integration Health",
                "description": "GitHub integration is performing well. Slack notifications may need attention.",
                "impact": "low",
                "category": "Infrastructure",
                "metrics": {"healthy_integrations": 2, "issues": 1},
                "icon": "Shield"
            }
        ],
        stats={
            "activeInsights": 3,
            "timeSaved": "4h",
            "efficiency": "+12%"
        }
    )


@app.get("/suggestions", response_model=SuggestionsResponse)
def get_suggestions() -> SuggestionsResponse:
    """Get AI-powered suggestions for improving productivity and workflow."""
    return SuggestionsResponse(
        suggestions=[
            {
                "id": 1,
                "title": "Review Open Pull Requests",
                "description": "Check for PRs that need review or have been waiting too long. Focus on high-priority features.",
                "priority": "high",
                "type": "review",
                "estimatedTime": "15 min"
            },
            {
                "id": 2,
                "title": "Update Dependencies",
                "description": "Run dependency updates to ensure security patches and latest features are applied.",
                "priority": "medium",
                "type": "maintenance",
                "estimatedTime": "10 min"
            },
            {
                "id": 3,
                "title": "Improve Code Coverage",
                "description": "Add tests for recently added features to maintain high code quality standards.",
                "priority": "medium",
                "type": "quality",
                "estimatedTime": "30 min"
            },
            {
                "id": 4,
                "title": "Document Recent Changes",
                "description": "Update README or documentation to reflect recent feature additions or API changes.",
                "priority": "low",
                "type": "documentation",
                "estimatedTime": "20 min"
            },
            {
                "id": 5,
                "title": "Optimize Database Queries",
                "description": "Recent activity data shows slow query performance. Consider adding indexes or query optimization.",
                "priority": "high",
                "type": "performance",
                "estimatedTime": "45 min"
            }
        ],
        summary={
            "totalSuggestions": 5,
            "criticalIssues": 1,
            "productivityTips": 4
        }
    )


# AWS Lambda handler
handler = mangum.Mangum(app)
