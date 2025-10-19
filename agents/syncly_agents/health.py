"""Simple FastAPI health endpoint for the agents service."""

from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()


class HealthResponse(BaseModel):
    status: str
    started_at: datetime


STARTED_AT = datetime.utcnow()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", started_at=STARTED_AT)
