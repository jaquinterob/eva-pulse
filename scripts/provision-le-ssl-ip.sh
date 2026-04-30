#!/usr/bin/env bash
# Renovar / emitir certificado Let's Encrypt (perfil shortlived) solo para IPv4 — ver https://letsencrypt.org
# Ejemplo con email: CERTBOT_EMAIL=admin@ejemplo.com ./scripts/provision-le-ssl-ip.sh
set -euo pipefail

IP="$(curl -4 -fsS ifconfig.me)"
echo "IP: $IP"

LE_ARGS=(--standalone --preferred-profile shortlived --ip-address "$IP" --non-interactive --agree-tos)
if [[ -n "${CERTBOT_EMAIL:-}" ]]; then
  LE_ARGS+=(-m "$CERTBOT_EMAIL")
else
  LE_ARGS+=(--register-unsafely-without-email)
fi

sudo systemctl stop nginx
sudo snap run certbot certonly "${LE_ARGS[@]}"
sudo systemctl start nginx

echo "Asegura en nginx:"
echo "  ssl_certificate /etc/letsencrypt/live/${IP}/fullchain.pem;"
echo "  ssl_certificate_key /etc/letsencrypt/live/${IP}/privkey.pem;"
