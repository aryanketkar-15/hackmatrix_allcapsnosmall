#!/usr/bin/env bash
# Full local check: python tests, frontend typecheck + unit tests + build.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "== backend =="; (cd "$ROOT/backend" && python -m pytest -q)
echo "== frontend typecheck =="; (cd "$ROOT/frontend" && npx tsc -b --noEmit)
echo "== frontend tests =="; (cd "$ROOT/frontend" && npx vitest run)
echo "== frontend build =="; (cd "$ROOT/frontend" && npx vite build >/dev/null)
echo "ALL CHECKS PASSED"
