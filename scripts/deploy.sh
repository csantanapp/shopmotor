#!/bin/bash
set -e

VPS_HOST="root@187.77.40.177"
SSH_KEY="$HOME/.ssh/shopmotor_deploy"
SSH_OPTS="-o StrictHostKeyChecking=no -i $SSH_KEY"
VPS_DIR="/var/www/shopmotor"
APP_NAME="shopmotor"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[aviso]${NC} $1"; }
fail() { echo -e "${RED}[erro]${NC} $1"; exit 1; }

# ── 1. Verifica se há alterações locais não commitadas
log "Verificando status do repositório..."
if ! git diff --quiet || ! git diff --cached --quiet; then
  fail "Há alterações não commitadas. Faça commit antes de fazer deploy."
fi

# ── 2. Push para o GitHub
log "Enviando código para o GitHub..."
git push origin main

# ── 3. Deploy na VPS via SSH
log "Conectando à VPS e fazendo deploy..."
ssh $SSH_OPTS "$VPS_HOST" bash << EOF
  set -e
  cd $VPS_DIR

  echo "→ Atualizando código..."
  git stash --quiet 2>/dev/null || true
  git pull origin main

  echo "→ Instalando dependências..."
  npm install --legacy-peer-deps --quiet

  echo "→ Gerando Prisma Client..."
  npx prisma generate

  echo "→ Aplicando migrações do banco..."
  npx prisma db push --accept-data-loss

  echo "→ Fazendo build..."
  npm run build

  echo "→ Reiniciando aplicação..."
  pm2 restart $APP_NAME

  echo "→ Verificando status..."
  pm2 show $APP_NAME | grep -E "status|uptime|restarts"
EOF

log "✅ Deploy concluído com sucesso!"
log "🌐 Site: https://www.shopmotor.com.br"
