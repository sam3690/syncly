FROM python:3.13-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy project files
COPY pyproject.toml uv.lock* ./
COPY syncly_agents/ syncly_agents/
COPY tests/ tests/

# Install dependencies
RUN uv sync --frozen --no-install-project --no-dev

# Install the project
RUN uv sync --frozen --no-dev

# Set environment
ENV PATH="/app/.venv/bin:$PATH"

# Run tests by default
CMD ["pytest", "tests/"]