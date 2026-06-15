#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# One-time setup for the AI service: creates virtual environment, installs
# Python dependencies, and creates a .env file from the template.
#
# Usage:
#   bash scripts/setup.sh
#
# After setup, start the service with:
#   bash scripts/start.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AI_DIR="$(dirname "$SCRIPT_DIR")"
cd "$AI_DIR"

echo "========================================"
echo "  InternNova AI Service — Setup"
echo "========================================"
echo ""

# ── 1. Virtual environment ─────────────────────────────────────────────────
VENV_DIR="$AI_DIR/.venv"
echo "[1/3] Virtual environment..."

if [ -f "$VENV_DIR/bin/python" ] || [ -f "$VENV_DIR/Scripts/python.exe" ]; then
  echo "       Already exists at $VENV_DIR"
else
  echo "       Creating..."
  python3 -m venv "$VENV_DIR" || python -m venv "$VENV_DIR"
  echo "       Created: $VENV_DIR"
fi

# Activate
if [ -f "$VENV_DIR/bin/activate" ]; then
  source "$VENV_DIR/bin/activate"
elif [ -f "$VENV_DIR/Scripts/activate" ]; then
  source "$VENV_DIR/Scripts/activate"
fi

# ── 2. Python dependencies ──────────────────────────────────────────────────
echo "[2/3] Installing Python dependencies..."
pip install -r "$AI_DIR/requirements.txt" --quiet
echo "       Dependencies installed."

# ── 3. .env file ────────────────────────────────────────────────────────────
echo "[3/3] Checking .env configuration..."
if [ -f "$AI_DIR/.env" ]; then
  echo "       .env already exists — skipping."
else
  cp "$AI_DIR/.env.example" "$AI_DIR/.env"
  echo "       Created .env from .env.example."
  echo "       >>> Edit $AI_DIR/.env and set your GROQ_API_KEY before starting. <<<"
fi

echo ""
echo "========================================"
echo "  Setup complete!"
echo "  1. Edit ai-service/.env and set GROQ_API_KEY"
echo "  2. Start the service:  bash scripts/start.sh"
echo "  3. Health check:       http://localhost:8000/health"
echo "========================================"
