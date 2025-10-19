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
 
# Install runtime deps for health server
RUN uv pip install fastapi uvicorn --no-deps

# Set environment
ENV PATH="/app/.venv/bin:$PATH"

# Expose health endpoint port
EXPOSE 8085

# Provide an entrypoint script to run the health server or execute CLI
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Default entrypoint runs tests; override to run server or CLI
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["pytest", "tests/"]