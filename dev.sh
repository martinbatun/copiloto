#!/usr/bin/env bash
# Copiloto — dev launcher
# Usage:
#   ./dev.sh             # arranca los 4 (web+api del core + agent web+api)
#   ./dev.sh all         # idem default
#   ./dev.sh web         # solo dashboard Next.js (:5400)
#   ./dev.sh api         # solo Express del core (:3400)
#   ./dev.sh core        # web + api del core (sin agent)
#   ./dev.sh agent       # agent web + agent api (sin core)
#   ./dev.sh agent-web   # solo admin del agente (:5500)
#   ./dev.sh agent-api   # solo bot WhatsApp / agente (:3500)
#
# Pre-flight: libera los puertos del modo elegido antes de arrancar
# para evitar EADDRINUSE de sesiones previas.

set -e

MODE="${1:-all}"

case "$MODE" in
  web)        PORTS="5400" ;;
  api)        PORTS="3400" ;;
  agent-web)  PORTS="5500" ;;
  agent-api)  PORTS="3500" ;;
  core)       PORTS="5400 3400" ;;
  agent)      PORTS="5500 3500" ;;
  all|*)      PORTS="5400 3400 5500 3500" ;;
esac

# Solo matamos el proceso que ESCUCHA en cada puerto (-sTCP:LISTEN evita
# matar conexiones outbound que casualmente tengan ese puerto local).
PIDS=""
for p in $PORTS; do
  PID=$(lsof -t -nP -sTCP:LISTEN -iTCP:$p 2>/dev/null || true)
  if [ -n "$PID" ]; then
    PIDS="$PIDS $PID"
  fi
done
if [ -n "$PIDS" ]; then
  echo "[dev.sh] Liberando puertos $PORTS (PIDs:$PIDS)..."
  echo "$PIDS" | xargs kill 2>/dev/null || true
  sleep 1
fi

case "$MODE" in
  web)
    pnpm --filter @copiloto/web dev
    ;;
  api)
    pnpm --filter @copiloto/api dev
    ;;
  agent-web)
    pnpm --filter @copiloto/agent-web dev
    ;;
  agent-api)
    pnpm --filter @copiloto/agent-api dev
    ;;
  core)
    pnpm exec concurrently \
      --names "web,api" \
      --prefix-colors "cyan,green" \
      --kill-others-on-fail \
      "pnpm dev:web" "pnpm dev:api"
    ;;
  agent)
    pnpm exec concurrently \
      --names "agent-web,agent-api" \
      --prefix-colors "magenta,yellow" \
      --kill-others-on-fail \
      "pnpm dev:agent-web" "pnpm dev:agent-api"
    ;;
  all|*)
    pnpm dev
    ;;
esac
