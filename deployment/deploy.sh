#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# InternNova Production Deployment Script
# ═══════════════════════════════════════════════════════════════════════════════
# Run on a fresh Ubuntu 24.04 (or 22.04) Oracle Cloud ARM VM.
#
# Usage:
#   1. Copy this repo to /opt/internnova on the VM
#   2. Create .env from examples:
#        cp api-gateway/.env.example api-gateway/.env
#        cp auth-service/.env.example auth-service/.env
#        cp ai-service/.env.example ai-service/.env
#        cp frontend/.env.example frontend/.env
#        # Then edit each .env with real secrets
#   3. Create root .env with shared secrets (MONGODB_URI, JWT secrets, SMTP, etc.)
#        nano .env
#   4. bash deployment/deploy.sh
#
# What it does:
#   - Installs Docker, Nginx, certbot, UFW
#   - Configures firewall (SSH + HTTP + HTTPS only)
#   - Builds and starts all 5 Docker services
#   - Configures Nginx reverse proxy with SSL
#   - Installs systemd service for auto-start on boot
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ── Configuration ──────────────────────────────────────────────────────────
DEPLOY_DIR="/opt/internnova"
DOMAIN="${DOMAIN:-api.internnova.com}"
EMAIL="${EMAIL:-admin@internnova.com}"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     InternNova Production Deployer                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── 1. System Updates & Dependencies ────────────────────────────────────────
log "Updating system packages..."
sudo apt update -qq && sudo apt upgrade -y -qq

log "Installing prerequisites (Docker, Nginx, certbot, UFW)..."
sudo apt install -y -qq \
    docker.io \
    docker-compose-v2 \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    git \
    curl

sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
log "System dependencies installed."

# ── 2. Firewall ────────────────────────────────────────────────────────────
log "Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
log "Firewall enabled (SSH, HTTP, HTTPS)."

# ── 3. Environment Check ───────────────────────────────────────────────────
cd "$DEPLOY_DIR"

if [ ! -f "$DEPLOY_DIR/.env" ]; then
    warn "Root .env file not found!"
    warn ""
    warn "Please create it before deploying. Copy the template:"
    warn ""
    warn "  cp .env.production.example .env"
    warn "  nano .env              # fill in real secrets"
    warn ""
    warn "Required variables (shared across services):"
    warn "  MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET"
    warn "  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM"
    warn "  CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
    warn "  GROQ_API_KEY, INTERNAL_SERVICE_TOKEN, ALLOWED_ORIGINS"
    warn "  LLM_PROVIDER (default: groq)"
    warn ""
    err "Create /opt/internnova/.env with required secrets, then re-run."
fi
log "Environment file (.env) found."

# Check per-service .env files exist (warn, don't fail — Docker will use root .env)
for svc in api-gateway auth-service ai-service; do
    if [ ! -f "$DEPLOY_DIR/$svc/.env" ]; then
        warn "$svc/.env not found — service will use root .env variables."
    fi
done

# ── 4. Build & Start Containers ────────────────────────────────────────────
log "Building Docker images (first run: ~10 min, subsequent: ~2 min)..."
sudo docker compose build --quiet 2>&1 | tail -5

log "Starting all services (api-gateway, auth-service, core-service, ai-service, mongodb)..."
sudo docker compose up -d --remove-orphans

# ── 5. Health Check Loop ──────────────────────────────────────────────────
log "Waiting for services to become healthy..."
echo -n "  "
MAX_WAIT=240  # AI service needs up to 20s start_period + extra for LLM warm-up
ELAPSED=0
HEALTHY=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
    if curl -sf http://localhost:4000/health > /dev/null 2>&1; then
        HEALTHY=1
        break
    fi
    sleep 5
    ELAPSED=$((ELAPSED + 5))
    echo -n "."
done
echo ""

if [ "$HEALTHY" -eq 1 ]; then
    log "All services healthy after ${ELAPSED}s."
else
    warn "Health check timed out after ${MAX_WAIT}s."
    warn "Checking individual container status..."
    sudo docker compose ps
    echo ""
    warn "Checking gateway logs (last 30 lines)..."
    sudo docker compose logs --tail=30 api-gateway
    echo ""
    warn "Checking AI service logs (last 20 lines)..."
    sudo docker compose logs --tail=20 ai-service
fi

# ── 6. Nginx Reverse Proxy ─────────────────────────────────────────────────
log "Configuring Nginx reverse proxy..."
if [ -f "$DEPLOY_DIR/nginx/nginx.conf" ]; then
    sudo cp "$DEPLOY_DIR/nginx/nginx.conf" /etc/nginx/sites-available/internnova
    sudo ln -sf /etc/nginx/sites-available/internnova /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl reload nginx
    log "Nginx configured and reloaded."
else
    warn "nginx/nginx.conf not found — skipping Nginx setup."
fi

# ── 7. SSL Certificate (Let's Encrypt) ─────────────────────────────────────
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    log "Obtaining SSL certificate for $DOMAIN..."
    sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" || {
        warn "SSL certificate request failed."
        warn "Make sure DNS for $DOMAIN points to this VM's public IP."
        warn "Re-run after DNS is configured:"
        warn "  sudo certbot --nginx -d $DOMAIN"
    }
else
    log "SSL certificate already exists for $DOMAIN."
fi

# ── 8. Systemd Service (auto-start on boot) ────────────────────────────────
log "Installing systemd service for auto-start on boot..."
sudo tee /etc/systemd/system/internnova.service > /dev/null <<'SERVICEEOF'
[Unit]
Description=InternNova Docker Compose
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/internnova
ExecStart=/usr/bin/docker compose up -d --remove-orphans
ExecStop=/usr/bin/docker compose down
ExecReload=/usr/bin/docker compose restart
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SERVICEEOF

sudo systemctl daemon-reload
sudo systemctl enable internnova.service
log "Systemd service installed and enabled."

# ── Done ───────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║            Deployment Complete!                          ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║                                                        ║"
echo "║  API Health:  https://$DOMAIN/health                    ║"
echo "║                                                        ║"
echo "║  Useful commands:                                      ║"
echo "║    Status:    cd $DEPLOY_DIR && sudo docker compose ps   ║"
echo "║    Logs:      cd $DEPLOY_DIR && sudo docker compose logs -f ║"
echo "║    Restart:   sudo systemctl restart internnova          ║"
echo "║    Journal:   sudo journalctl -u internnova -f           ║"
echo "║                                                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
