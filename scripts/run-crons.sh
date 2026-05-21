#!/bin/bash
# Ejecuta los cron jobs del CRM llamando a los endpoints de la app Next.js
# Requiere que la app esté corriendo en localhost:3001

set -euo pipefail

APP_URL="http://127.0.0.1:3001"
CRON_SECRET="a8f5d2c9e1b3f7a4d6c8e2b9f1a5d3c7e9b2f4a6d8c1e3b5f7a9d2c4e6b8f1a3"
LOG_FILE="/home/ubuntu/luisgranero-com/logs/cron.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Función para llamar un endpoint y loggear resultado
call_endpoint() {
  local name="$1"
  local url="$2"

  response=$(curl -s -o /tmp/cron_response.txt -w "%{http_code}" \
    -X POST \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    -H "Content-Type: application/json" \
    --max-time 120 \
    "${APP_URL}${url}" 2>&1) || true

  body=$(cat /tmp/cron_response.txt 2>/dev/null || echo "")

  echo "[${TIMESTAMP}] ${name}: HTTP ${response} - ${body}" >> "$LOG_FILE"
}

# Seleccionar qué cron ejecutar según argumento
case "${1:-all}" in
  emails)
    call_endpoint "send-scheduled-emails" "/api/cron/send-scheduled-emails"
    ;;
  stats)
    call_endpoint "update-lead-stats" "/api/cron/update-lead-stats"
    ;;
  studio-cleanup)
    call_endpoint "cleanup-studio-uploaded-videos" "/api/cron/cleanup-studio-uploaded-videos"
    ;;
  all)
    call_endpoint "send-scheduled-emails" "/api/cron/send-scheduled-emails"
    call_endpoint "update-lead-stats" "/api/cron/update-lead-stats"
    call_endpoint "cleanup-studio-uploaded-videos" "/api/cron/cleanup-studio-uploaded-videos"
    ;;
  *)
    echo "Uso: $0 [emails|stats|studio-cleanup|all]"
    exit 1
    ;;
esac
