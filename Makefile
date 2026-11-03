export PATH := $(HOME)/Library/Python/3.11/bin:$(HOME)/.local/bin:$(PATH)
.DEFAULT_GOAL := help
.PHONY: help install up down logs lint fmt typecheck test graph graph-update audit clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## Install backend, frontend and root deps (+ husky)
	cd backend && uv sync
	pnpm --dir frontend install
	pnpm install

up: ## Build and start the stack
	docker compose up --build -d

down: ## Stop the stack
	docker compose down

logs: ## Tail container logs
	docker compose logs -f

lint: ## ruff, ruff format --check, mypy, eslint, prettier, steiger, tsc
	cd backend && uv run ruff check . && uv run ruff format --check . && uv run mypy
	pnpm --dir frontend lint

fmt: ## Autofix formatting and lint
	cd backend && uv run ruff check --fix . && uv run ruff format .
	pnpm --dir frontend lint:fix

typecheck: ## mypy + tsc
	cd backend && uv run mypy
	pnpm --dir frontend typecheck

test: ## pytest (cov gate) + vitest
	cd backend && uv run pytest
	pnpm --dir frontend test

graph: ## Rebuild code graph (graphify, no LLM)
	graphify update .

graph-update: graph ## Alias of graph

audit: ## pip-audit + pnpm audit
	cd backend && uv run pip-audit
	pnpm --dir frontend audit --prod

clean: ## Stop the stack and drop volumes
	docker compose down -v
