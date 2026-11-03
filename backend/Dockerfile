FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
WORKDIR /srv
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project
COPY app ./app

FROM python:3.15-slim-bookworm AS runtime
ENV PATH="/srv/.venv/bin:$PATH" PYTHONUNBUFFERED=1
WORKDIR /srv
RUN useradd --system --uid 10001 --no-create-home app \
    && mkdir /data && chown app /data
COPY --from=builder /srv/.venv /srv/.venv
COPY --from=builder /srv/app /srv/app
USER app
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=2).status == 200 else 1)"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
