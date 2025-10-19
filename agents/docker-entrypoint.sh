#!/usr/bin/env bash
set -euo pipefail

# Simple entrypoint: if first arg is 'server', run health server; otherwise exec provided command.
if [ "${1:-}" = "server" ]; then
  # run FastAPI health endpoint
  exec uv run uvicorn syncly_agents.health:app --host 0.0.0.0 --port 8085
else
  exec "$@"
fi
