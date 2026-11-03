# ai-cost

Local, free, open-source dashboard for Claude Code token usage: tokens per day, per model, and estimated cost.

[![CI](https://github.com/OWNER/ai-cost/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/ai-cost/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)
![Next.js 16](https://img.shields.io/badge/next.js-16-black.svg)

## What it does

- Reads your local Claude Code transcripts (`~/.claude/projects/**/*.jsonl`) and imports them into SQLite.
- Shows tokens per day and per model, with input, output, cache read, and cache write broken out.
- Estimates cost from a built-in price table. Unknown models show `—` instead of a guessed number.
- Redesigned dashboard with KPI cards, a tokens-per-day chart, an activity heatmap, and a by-model table.
- Light and dark theme that follows your system setting.
- ⌘K command palette for navigation and actions.
- CSV export of the usage data.

## Screenshots

![Dashboard, light](docs/screenshot-light.png)
![Dashboard, dark](docs/screenshot-dark.png)

## How it works

```
~/.claude/projects (read-only mount)
        │  incremental jsonl parse
        ▼
FastAPI backend ── SQLite (/data/usage.db, WAL) ── REST /api/*   [internal docker network only]
        ▲
        │  server-side fetch + Server Actions (no CORS; browser never calls backend)
Next.js frontend → 127.0.0.1:3000
```

- **Connect:** the backend reads `~/.claude/projects` read-only and runs a first sync.
- Claude Code streams each assistant message across several lines that share one `message.id`. The parser dedups by message id and keeps the final (maximum) token counts, not the first partial line.
- A background sync runs every 60 seconds (`SYNC_INTERVAL_S`). Only new bytes are parsed, and each file's offset advances only to the last complete line.

## Quickstart

Requires Docker, [uv](https://docs.astral.sh/uv/), and pnpm.

```sh
cp .env.example .env
make install
make up
```

Open http://127.0.0.1:3000 and click **Connect**.

If port 3000 is already in use, set `FRONTEND_PORT` in `.env` (for example `FRONTEND_PORT=3002`) and open the matching port, such as http://127.0.0.1:3002.

## Configuration

Copy `.env.example` to `.env`. Every variable has a safe default.

| Variable              | Default               | Description                                                  |
| --------------------- | --------------------- | ------------------------------------------------------------ |
| `CLAUDE_PROJECTS_DIR` | `/claude/projects`    | Transcript path inside the backend container.                |
| `DB_PATH`             | `/data/usage.db`      | SQLite file inside the backend container (kept in a volume). |
| `SYNC_INTERVAL_S`     | `60`                  | Background sync interval in seconds (10 to 3600).            |
| `LOG_LEVEL`           | `INFO`                | `DEBUG`, `INFO`, `WARNING`, or `ERROR`.                      |
| `BACKEND_URL`         | `http://backend:8000` | Backend URL used by the frontend server side only.           |
| `FRONTEND_PORT`       | `3000`                | Host port for the frontend, bound to `127.0.0.1`.            |

## Keyboard shortcuts

| Keys        | Action                              | Single-key?    |
| ----------- | ----------------------------------- | -------------- |
| ⌘K / Ctrl+K | Open command palette                | no (always on) |
| `/`         | Open command palette                | yes            |
| `s`         | Sync now                            | yes            |
| `1` `2` `3` | 7 / 30 / 90 days                    | yes            |
| `e`         | Export CSV                          | yes            |
| `t`         | Cycle theme (system → light → dark) | yes            |
| `?`         | Shortcuts dialog                    | yes            |
| Esc         | Close overlay                       | —              |

Connect and Disconnect have no shortcut; they are available only from the palette or the button. Hints are rendered with shadcn `Kbd`, showing ⌘ on macOS and Ctrl elsewhere.

Single-key shortcuts can be turned off in the shortcuts dialog (`?`).

## Design

Design rules live in [`DESIGN.md`](DESIGN.md): tokens, components, accessibility (WCAG 2.2 AA), and motion. Motion respects reduced-motion settings. The UI is built with shadcn/ui and uses Tailwind v4 tokens only. Charts are server-rendered.

## Development

| Command      | Purpose                                                       |
| ------------ | ------------------------------------------------------------- |
| `make lint`  | ruff, ruff format check, mypy, eslint, prettier, steiger, tsc |
| `make fmt`   | Autofix formatting and lint                                   |
| `make test`  | pytest (coverage gate 85%) and vitest                         |
| `make graph` | Rebuild the code graph (graphify, no LLM)                     |

Git hooks are managed by Husky:

- `pre-commit`: lint-staged (eslint and prettier for frontend, ruff for backend)
- `commit-msg`: commitlint
- `pre-push`: `make lint test`

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `test:`, `docs:`, `refactor:`, `ci:`).

## Security

- The transcripts directory is mounted read-only (`:ro`). The app never writes to `~/.claude`.
- The backend port is not published. Only the frontend is exposed, and only on `127.0.0.1`.
- Containers run as non-root users.
- No data leaves your machine. The app makes no LLM calls.

## Cost estimates

- Prices are hard-coded in `backend/app/services/pricing_service.py` (USD per million tokens).
- Costs are estimates for comparison, not billing records.
- Subscription plans (Pro, Max, Team) are not billed per token, so the estimate shows what the same usage would cost at API rates.

## Project structure

```
backend/app/
├── controllers/   # FastAPI routers (thin)
├── services/      # business logic (sync, parsing, usage, pricing)
├── repositories/  # SQL only (sqlite3)
├── core/          # config, database, errors
├── schemas/       # Pydantic IO models
└── domain/        # frozen dataclass entities
frontend/src/
├── app/           # Next.js routing only
├── views/         # pages
├── widgets/       # composed UI blocks
├── features/      # user actions (server actions)
├── entities/      # business entities
└── shared/        # api, config, lib, ui
```

Backend follows MVC with services and repositories. Frontend follows Feature-Sliced Design (FSD).

## License

[MIT](LICENSE)
