#!/bin/bash
# InternNova — UFW Firewall Setup
# Run once on the Oracle Cloud VM
set -e

echo "=== Configuring UFW firewall ==="

sudo ufw default deny incoming
sudo ufw default allow outgoing

# Essential ports
sudo ufw allow ssh        # 22 — remote access
sudo ufw allow 80/tcp     # HTTP (redirects to HTTPS)
sudo ufw allow 443/tcp    # HTTPS (Nginx reverse proxy)

sudo ufw --force enable

echo ""
echo "Firewall enabled. Active rules:"
sudo ufw status verbose
