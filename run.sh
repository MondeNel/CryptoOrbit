#!/bin/bash

# ── CryptoOrbit — Build & Run Script ─────────────────────────────────────────

set -e

COMPOSE_FILE="docker-compose.yml"
APP_URL="http://localhost"

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

log()     { echo -e "${CYAN}[OrbitBet]${RESET} $1"; }
success() { echo -e "${GREEN}[✔]${RESET} $1"; }
warn()    { echo -e "${YELLOW}[!]${RESET} $1"; }
error()   { echo -e "${RED}[✘]${RESET} $1"; exit 1; }

# ── Header ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}  ◎  CryptoOrbit — Build & Deploy${RESET}"
echo -e "${CYAN}  ─────────────────────────────────${RESET}"
echo ""

# ── Check dependencies ────────────────────────────────────────────────────────
log "Checking dependencies..."
command -v docker   >/dev/null 2>&1 || error "Docker is not installed. Please install Docker first."
command -v docker compose version >/dev/null 2>&1 || \
  command -v docker-compose >/dev/null 2>&1       || \
  error "Docker Compose is not installed."
success "Docker & Docker Compose found"

# ── Check compose file ────────────────────────────────────────────────────────
[ -f "$COMPOSE_FILE" ] || error "docker-compose.yml not found. Run this script from the project root."

# ── Parse arguments ───────────────────────────────────────────────────────────
MODE="${1:-up}"   # up | down | restart | logs | clean

case "$MODE" in

  # ── Build & Start ───────────────────────────────────────────────────────────
  up)
    log "Stopping any running containers..."
    docker compose down --remove-orphans 2>/dev/null || true

    log "Building images (this may take a minute)..."
    docker compose build --no-cache

    log "Starting services..."
    docker compose up -d

    # ── Wait for backend health ──────────────────────────────────────────────
    log "Waiting for backend to be healthy..."
    ATTEMPTS=0
    MAX=30
    until curl -sf http://localhost:8000/health >/dev/null 2>&1; do
      ATTEMPTS=$((ATTEMPTS + 1))
      [ $ATTEMPTS -ge $MAX ] && error "Backend did not become healthy in time."
      printf "."
      sleep 2
    done
    echo ""
    success "Backend is healthy"

    # ── Wait for frontend ────────────────────────────────────────────────────
    log "Waiting for frontend..."
    ATTEMPTS=0
    until curl -sf "$APP_URL" >/dev/null 2>&1; do
      ATTEMPTS=$((ATTEMPTS + 1))
      [ $ATTEMPTS -ge $MAX ] && error "Frontend did not start in time."
      printf "."
      sleep 2
    done
    echo ""
    success "Frontend is live"

    echo ""
    echo -e "${BOLD}${GREEN}  ✔  Application is running!${RESET}"
    echo -e "${CYAN}  ➜  Open: ${BOLD}${APP_URL}${RESET}"
    echo ""
    ;;

  # ── Stop ────────────────────────────────────────────────────────────────────
  down)
    log "Stopping all services..."
    docker compose down --remove-orphans
    success "All services stopped"
    ;;

  # ── Restart (no rebuild) ─────────────────────────────────────────────────────
  restart)
    log "Restarting services..."
    docker compose restart
    success "Services restarted"
    echo -e "${CYAN}  ➜  Open: ${BOLD}${APP_URL}${RESET}"
    ;;

  # ── Logs ─────────────────────────────────────────────────────────────────────
  logs)
    SERVICE="${2:-}"
    if [ -n "$SERVICE" ]; then
      log "Streaming logs for: $SERVICE"
      docker compose logs -f "$SERVICE"
    else
      log "Streaming all logs (Ctrl+C to exit)..."
      docker compose logs -f
    fi
    ;;

  # ── Clean (remove containers, volumes, images) ───────────────────────────────
  clean)
    warn "This will remove all containers, volumes and built images."
    read -r -p "    Are you sure? (y/N): " CONFIRM
    if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
      log "Cleaning up..."
      docker compose down --volumes --remove-orphans --rmi all 2>/dev/null || true
      success "Clean complete"
    else
      log "Aborted."
    fi
    ;;

  # ── Help ─────────────────────────────────────────────────────────────────────
  *)
    echo -e "${BOLD}Usage:${RESET} ./run.sh [command]"
    echo ""
    echo "  ${CYAN}up${RESET}            Build and start all services  ${YELLOW}(default)${RESET}"
    echo "  ${CYAN}down${RESET}          Stop all services"
    echo "  ${CYAN}restart${RESET}       Restart without rebuilding"
    echo "  ${CYAN}logs${RESET}          Stream all logs"
    echo "  ${CYAN}logs [service]${RESET} Stream logs for a specific service"
    echo "                  ${YELLOW}e.g. ./run.sh logs backend${RESET}"
    echo "  ${CYAN}clean${RESET}         Remove containers, volumes and images"
    echo ""
    ;;
esac