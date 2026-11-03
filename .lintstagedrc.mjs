export default {
  "frontend/**/*.{ts,tsx,js,mjs}": [
    "pnpm --dir frontend exec eslint --fix",
    "pnpm --dir frontend exec prettier --write",
  ],
  "backend/**/*.py": [
    "uv run --directory backend ruff check --fix",
    "uv run --directory backend ruff format",
  ],
  "*.{md,json,yml,yaml}": ["pnpm --dir frontend exec prettier --write"],
};
