#!/bin/bash
# ─────────────────────────────────────────────
# Script de deploy — ShopMotor
# Executar no servidor KVM 1 Hostinger
# ─────────────────────────────────────────────

set -e

APP_DIR="/var/www/shopmotor"
LOG_DIR="/var/log/shopmotor"

echo "🚀 Iniciando deploy ShopMotor..."

# Criar diretórios necessários
mkdir -p $APP_DIR
mkdir -p $LOG_DIR
mkdir -p $APP_DIR/public/uploads

# Ir para o diretório da aplicação
cd $APP_DIR

# Instalar dependências
echo "📦 Instalando dependências..."
npm install --omit=dev

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Aplicar migrations do banco
echo "🗄️  Aplicando migrations..."
npx prisma migrate deploy

# Build da aplicação
echo "🏗️  Building Next.js..."
npm run build

# Reiniciar com PM2
echo "♻️  Reiniciando com PM2..."
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production

# Salvar configuração PM2
pm2 save

echo "✅ Deploy concluído!"
