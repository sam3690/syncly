"""CLI entrypoint for running the Syncly agent workflow."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from syncly_agents.orchestrator.pipeline import AgentWorkflowOrchestrator


def main() -> None:
    """Run the agent workflow from command line."""

    parser = argparse.ArgumentParser(
        description="Execute Syncly agent workflow for project intelligence."
    )
    parser.add_argument(
        "payload_file",
        type=Path,
        help="Path to JSON file containing AgentRequest payload",
    )
    parser.add_argument(
        "--use-llm",
        action="store_true",
        default=False,
        help="Enable LLM calls (requires OPENAI_API_KEY)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Path to write WorkflowEnvelope JSON output (default: stdout)",
    )

    args = parser.parse_args()

    if not args.payload_file.exists():
        print(f"Error: Payload file {args.payload_file} does not exist", file=sys.stderr)
        sys.exit(1)

    try:
        with args.payload_file.open() as f:
            payload = json.load(f)
    except json.JSONDecodeError as exc:
        print(f"Error: Invalid JSON in {args.payload_file}: {exc}", file=sys.stderr)
        sys.exit(1)

    orchestrator = AgentWorkflowOrchestrator(use_llm=args.use_llm)
    envelope = orchestrator.run(payload)

    output_json = envelope.model_dump_json(indent=2)
    if args.output:
        args.output.write_text(output_json)
        print(f"Output written to {args.output}")
    else:
        print(output_json)


if __name__ == "__main__":
    main()