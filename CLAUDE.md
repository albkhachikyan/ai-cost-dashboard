# ai-cost — agent rules

Local, free, open-source dashboard for **Claude Code token usage**: tokens per day, per model, estimated cost.
Source = Claude Code transcripts in `~/.claude/projects/**/*.jsonl` (read-only). Storage = SQLite. No LLM calls.

```
~/.claude/projects (read-only mount)
        │  incremental jsonl parse
        ▼
FastAPI backend ── SQLite (/data/usage.db, WAL) ── REST /api/*   [internal docker network only]
        ▲
        │  server-side fetch + Server Actions (no CORS; browser never calls backend)
Next.js frontend → 127.0.0.1:3000
```

If `graphify-out/GRAPH_REPORT.md` exists, read it before exploring the codebase.

## Stack

| Area     | Tech                                                                                                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Backend  | Python 3.12, FastAPI, pydantic v2 + pydantic-settings, stdlib `sqlite3`, uv, ruff, mypy (strict), pytest + pytest-cov                                                                                                                |
| Frontend | Node 22, Next.js (App Router) + TypeScript strict, Tailwind v4 (tokens only) + shadcn/ui, motion, lenis, next-themes, zod, pnpm, ESLint 9 flat (`eslint-config-airbnb-extended`) + Prettier, Steiger (FSD), Vitest + Testing Library |
| Infra    | Docker Compose, Makefile, Husky + lint-staged + commitlint, GitHub Actions, graphify                                                                                                                                                 |

**Pinned on purpose — don't bump without checking:** `typescript ~5.9` (typescript-eslint rejects TS 7), `jsdom 26` (newer pulls undici 8, crashes on Node 22.14), `next 16.4.4`. Steiger config is `.mjs` (the `.ts` loader breaks on Node 22.14); Steiger doesn't know the `views` layer, so `views` isn't layer-checked: keep its imports clean by hand. Compose mounts `${HOME}/.claude/projects` (compose v2.7 can't nest `${A:-${B}}`).

## Commands

```
make install      # uv sync + pnpm i + husky
make up / down / logs
make lint         # ruff, ruff format --check, mypy, eslint, prettier --check, steiger, tsc
make fmt          # autofix
make test         # pytest (cov ≥ 85%) + vitest
make graph        # graphify update . (code-only, no LLM)
make clean        # drop DB volume
```

**`make lint test` must pass before you say a task is done.**

## API contract (source of truth)

Changing it = update `backend/app/schemas/`, `frontend/src/entities/*/model/types.ts`, and this table **in the same commit**.

| Method | Path                 | Success                                                                         | Errors                                      |
| ------ | -------------------- | ------------------------------------------------------------------------------- | ------------------------------------------- |
| GET    | `/api/health`        | `{status: "ok", db: "ok"}`                                                      | 503 `DB_UNAVAILABLE`                        |
| GET    | `/api/connection`    | `{connected: bool, source_found: bool, last_sync_at: str\|null, messages: int}` | —                                           |
| POST   | `/api/connection`    | connect + first sync → `{imported: int, skipped: int}`                          | 409 `SOURCE_NOT_FOUND`                      |
| DELETE | `/api/connection`    | 204 (data kept)                                                                 | —                                           |
| POST   | `/api/sync`          | `{imported: int, skipped: int}`                                                 | 409 `NOT_CONNECTED`, 409 `SYNC_IN_PROGRESS` |
| GET    | `/api/usage?days=30` | `UsageReport` (below)                                                           | 422 if `days` ∉ 1..365                      |

```jsonc
// UsageReport
{
  "days": 30,
  "totals": {
    "input": 0,
    "output": 0,
    "cache_read": 0,
    "cache_write": 0,
    "total": 0,
    "cost_usd": 0.0,
  },
  "daily": [
    {
      "day": "2026-11-03",
      "model": "claude-opus-5-5",
      "input": 0,
      "output": 0,
      "cache_read": 0,
      "cache_write": 0,
      "total": 0,
      "cost_usd": 0.0,
    },
  ],
  "by_model": [
    {
      "model": "claude-opus-5-5",
      "input": 0,
      "output": 0,
      "cache_read": 0,
      "cache_write": 0,
      "total": 0,
      "cost_usd": 0.0,
      "share": 0.0,
    },
  ],
  "hourly": [
    {
      "hour": 14,
      "model": "claude-opus-5-5",
      "input": 0,
      "output": 0,
      "cache_read": 0,
      "cache_write": 0,
      "total": 0,
      "cost_usd": 0.0,
    },
  ],
}
// cost_usd is null when the model has no known price. day = UTC date. share = total / totals.total (0..1). hourly = today (UTC) by hour 0..23 and model, independent of days; only hours with data.
```

Error body is always: `{"error": {"code": "SOURCE_NOT_FOUND", "message": "human readable"}}`.

## Backend rules (`backend/app`)

- **Layers (MVC + services):** `controllers/` (APIRouter, thin: parse → one service call → schema) → `services/` (business logic classes) → `repositories/` (SQL only) → `core/database.py`.
  `schemas/` = Pydantic IO models (the "View"). `domain/entities.py` = `@dataclass(frozen=True, slots=True)`.
- **OOP + DI:** services/repositories are classes; collaborators come in via `__init__`. Only `dependencies.py` builds the object graph. No module-level singletons besides that.
- **No dicts between layers** — use entities/schemas. Full type hints, `mypy --strict` clean.
- **SQL:** stdlib `sqlite3`, parameterized queries only, never f-string SQL. No ORM. Migrations = ordered list in `Database`, tracked in `schema_version`.
- **Errors:** raise `AppError` subclasses (`core/errors.py`: `code`, `message`, `status`). One handler renders them. Unexpected → log traceback, generic 500, no internals in body. Never bare `except:`; `except Exception` only at loop/handler boundaries with `logger.exception`.
- **Logging:** `logger = logging.getLogger(__name__)`. No `print`.
- **Config:** only via `core/config.py` `Settings` (pydantic-settings). Every setting has a safe default; bounds validated. Secrets = `SecretStr`.
- **Parser invariants:** dedup by `message.id` (Claude Code repeats it per content block) — **keep the MAX of each token field, never the first line**: early streamed lines carry partial `output_tokens` (seen: 8 → 4650). Parser merges in-file; repository upserts `ON CONFLICT DO UPDATE SET x = MAX(x, excluded.x)` so a message mid-stream during one sync is corrected by the next; skip lines without `message.usage` and `model == "<synthetic>"`; glob `**/*.jsonl`; advance file offset only to last complete `\n`; malformed line → warn + `skipped += 1`, never abort.
- **Sync:** one `asyncio.Lock` shared by background loop and `POST /api/sync`; loop survives any iteration error. Blocking file/DB work runs via `asyncio.to_thread`.
- Naming: `snake_case` modules/functions, `PascalCase` classes, `UPPER_SNAKE` constants. Files named after the class they hold (`usage_repository.py` → `UsageRepository`).

## Frontend rules (`frontend/src`)

- **FSD layers:** `app` (Next routing only) → `views` (FSD "pages", renamed) → `widgets` → `features` → `entities` → `shared`.
  Import only from lower layers, only via the slice's `index.ts` public API. No cross-imports between slices of the same layer. Steiger enforces.
- **UI work follows [`DESIGN.md`](DESIGN.md) — binding** (tokens, components, a11y, shortcuts, cursors, motion, voice). Read it before touching any `ui/` file.
- **kebab-case files and folders** everywhere under `src/` (`kpi-card.tsx` → `export function KpiCard`, `use-hotkeys.ts` → `useHotkeys`). Enforced by `eslint-plugin-check-file`. Tests: `kpi-card.test.tsx` next to the file.
- Slice segments: `ui/`, `model/` (types, mappers), `api/` (server-side fetchers / Server Actions), `lib/`. shadcn primitives live in `shared/ui/shadcn/` (generated; edit only to map onto tokens).
- **Semantic UI:** landmarks + one `h1`; `button` = action, `Link` = navigation; tables/lists for data; components named by role (`KpiCard`, not `BlackCard`); state via `aria-*`/`data-*` attributes styled with variants — never ternary class strings. Details: DESIGN.md §5.
- **Token-only Tailwind:** only DESIGN.md tokens (default palette removed); no arbitrary values (`[...]`) outside `shared/ui/shadcn/`; no `dark:` utilities (tokens switch); merge with `cn()`; a class combo used twice becomes a `cva` variant; no `@apply` outside `@layer base`. Lint (`better-tailwindcss`) enforces. Details: DESIGN.md §6.
- **Client JS is a cost:** Server Components by default; client islands only for interaction. Charts are server-rendered HTML/CSS (no chart library). Animations: CSS `motion-safe:` first, `motion` (`LazyMotion` + `m.*`) only where CSS can't; everything respects `prefers-reduced-motion`.
- **Server-first:** data loads in Server Components via `entities/*/api`. `'use client'` only on interactive leaves. Mutations = Server Actions in `features/*/api/actions.ts` → `revalidatePath('/')`.
- **HTTP:** only through `shared/api/http.ts` (timeout via `AbortSignal.timeout`, throws typed `ApiError {code, status, message}`). Server Actions return `{ ok: true } | { ok: false; message: string }`, never throw to the client.
- **Env:** only via `shared/config/env.ts` (zod, `import 'server-only'`, fallback `BACKEND_URL=http://localhost:8000`). Never `process.env` elsewhere.
- **TS:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. No `any`, no `as` casts on API data (parse/map instead), no non-null `!`.
- Named exports only (except Next route files: `page`, `layout`, `error`, `loading`, `not-found`, `route`, `icon`). React = function components only.
- Style: Airbnb + Prettier (`singleQuote`, `trailingComma: all`, `printWidth: 100`, `semi`) + `prettier-plugin-tailwindcss` class order. No CSS-in-JS.
- UI states required for every data view: loading (layout-matched skeleton in its own `<Suspense>`), empty, error. Unknown cost renders `—`.
- **Performance budget:** initial JS for `/` ≤ 220KB gzipped (Next + React runtime alone ≈ 130KB; measured 211KB on 2026-11-03). Palette body, shortcuts dialog and motion features stay lazy chunks. `package.json` has `"sideEffects": ["*.css"]` so barrels tree-shake — never set it to `false` (CSS imports would be dropped); Lighthouse perf ≥ 95, a11y 100, best practices 100. `cacheComponents` (PPR) + React Compiler are on; fetchers are wrapped in React `cache()`.

## Security rules

- Never commit `.env`; add new vars to `.env.example` with a safe default and a comment.
- Never write into `~/.claude` — the mount is `:ro`. File paths never come from user input.
- Backend port is **not** published; frontend binds `127.0.0.1` only. CORS stays off.
- Containers run as non-root. No secrets in logs or error bodies.
- Security headers live in `frontend/next.config.ts` (CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `poweredByHeader: false`).

## Testing rules

- Backend: every service method → unit test (fakes via constructor injection); every endpoint incl. error codes → integration test (`TestClient`, tmp SQLite). Coverage gate **85%**.
- Frontend: Vitest for `shared/lib`, entity mappers, widget render + empty state, feature error message; `vitest-axe` zero violations on the dashboard view, rail and command palette.
- Tests live in `backend/tests/{unit,integration}` and next to frontend code as `*.test.ts(x)`.
- ONE fixture file `backend/tests/fixtures/sample.jsonl` covers parser edge cases; extend it, don't duplicate.

## Git

- Conventional Commits (`feat: …`, `fix: …`, `chore: …`, `test: …`, `docs: …`, `refactor: …`, `ci: …`), enforced by commitlint.
- Branches: `feat/…`, `fix/…`, `chore/…`. Never commit to `main` directly once CI exists.
- Hooks (Husky): `pre-commit` lint-staged (eslint+prettier / ruff), `commit-msg` commitlint, `pre-push` `make lint test`, `post-commit` `graphify update .` (skipped if graphify absent).

## Don'ts

- No new dependency without a one-line reason in the commit body.
- No WebSockets, no ORM, no LangChain/LangGraph, no client-side data libs (SWR/React Query) — Server Components cover it. No chart libraries (Recharts etc.), no custom cursor followers, no icon set besides `lucide-react`.
- No speculative abstractions: no interface with one implementation, no config for constants. Mark deliberate shortcuts with `# ponytail:` / `// ponytail:` naming the ceiling.
