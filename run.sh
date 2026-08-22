#!/usr/bin/env bash
# Run via Docker — no Node/npm required on the host.
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker, then run: docker compose up --build"
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Copy .env.example to .env and set MONGODB_URI, ADMIN_PASSWORD, PORT, etc."
  exit 1
fi

exec docker compose up --build
