#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Start the InternNova AI pipeline service (FastAPI + Uvicorn).
#
# Usage:
#   bash scripts/start.sh              # default port 8000
#   PORT=9000 bash scripts/start.sh    # custom port
#
# Prerequisites: run  bash scripts/setup.sh  first.
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AI_DIR="$(dirname "$SCRIPT_DIR")"
cd "$AI_DIR"

# ── Virtual environment ─────────────────────────────────────────────────────
VENV_DIR="$AI_DIR/.venv"
if [ ! -f "$VENV_DIR/bin/python" ] && [ ! -f "$VENV_DIR/Scripts/python.exe" ]; then
  echo "ERROR: Virtual environment not found at $VENV_DIR" >&2
  echo "Run setup first:  bash scripts/setup.sh" >&2
  exit 1
fi

# Activate (works on both Unix and Git Bash on Windows)
if [ -f "$VENV_DIR/bin/activate" ]; then
  source "$VENV_DIR/bin/activate"
elif [ -f "$VENV_DIR/Scripts/activate" ]; then
  source "$VENV_DIR/Scripts/activate"
fi

# ── Load .env into shell environment ────────────────────────────────────────
if [ -f "$AI_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$AI_DIR/.env"
  set +a
fi

# ── Start ───────────────────────────────────────────────────────────────────
PORT="${PORT:-8000}"
HOST="${HOST:-0.0.0.0}"

echo "========================================"
echo "  InternNova AI Service"
echo "  http://${HOST}:${PORT}"
echo "  Health: http://localhost:${PORT}/health"
echo "  API:    http://localhost:${PORT}/docs"
echo "========================================"
echo ""

python -m uvicorn app.main:app --host "$HOST" --port "$PORT" --log-level info
