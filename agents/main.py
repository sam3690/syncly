"""Entry point for the Syncly agent pipeline CLI."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Callable

from syncly_agents.orchestrator import pipeline


def _dispatch_run(args: argparse.Namespace) -> None:
    options = pipeline.PipelineOptions(workspace_id=args.workspace_id, reason=args.reason)
    pipeline.run_pipeline(options)


def _dispatch_schedule(args: argparse.Namespace) -> None:
    options = pipeline.PipelineOptions(workspace_id=args.workspace_id, schedule=True)
    pipeline.run_pipeline(options)


def _dispatch_ingest(args: argparse.Namespace) -> None:
    file_path = Path(args.file)
    raise NotImplementedError(
        f"Manual log ingestion is not yet implemented. Expected file: {file_path}"
    )


def main(argv: list[str] | None = None) -> int:
    parser = pipeline.build_parser()
    parsed = parser.parse_args(argv)

    handlers: dict[str, Callable[[argparse.Namespace], None]] = {
        "run": _dispatch_run,
        "schedule": _dispatch_schedule,
        "ingest-log": _dispatch_ingest,
    }

    handler = handlers.get(parsed.command)
    if handler is None:  # pragma: no cover - argparse enforces valid commands
        parser.print_help()
        return 1

    handler(parsed)
    return 0


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
