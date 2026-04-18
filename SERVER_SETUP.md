# Setup Servidor — KVM 1 Hostinger

## 1. Acesso inicial ao servidor
```bash
ssh root@IP_DO_SEU_SERVIDOR
```

## 2. Atualizar sistema
```bash
apt update && apt upgrade -y
```

## 3. Instalar Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v  # deve mostrar v20.x.x
```

## 4. Instalar PM2
```bash
npm install -g pm2
pm2 startup  # copiar e executar o comando que aparecer
```

## 5. Instalar PostgreSQL 16
```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

## 6. Criar banco e usuário
```bash
sudo -u postgres psql

-- dentro do psql:
CREATE USER shopmotor WITH PASSWORD 'CRIE_UMA_SENHA_FORTE';
CREATE DATABASE shopmotor_db OWNER shopmotor;
GRANT ALL PRIVILEGES ON DATABASE shopmotor_db TO shopmotor;
\q
```

## 7. Instalar Nginx
```bash
apt install -y nginx
systemctl enable nginx
```

## 8. Instalar Certbot (SSL gratuito)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

## 9. Configurar Nginx
```bash
cp /var/www/shopmotor/nginx.conf /etc/nginx/sites-available/shopmotor
ln -s /etc/nginx/sites-available/shopmotor /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 10. Fazer upload do projeto
```bash
# Na sua máquina local:
scp -r ./shopmotor-next root@IP_DO_SERVIDOR:/var/www/shopmotor

# Ou via git (recomendado):
# No servidor:
git clone https://github.com/seu-usuario/shopmotor.git /var/www/shopmotor
```

## 11. Configurar variáveis de ambiente
```bash
cp /var/www/shopmotor/.env.production /var/www/shopmotor/.env
nano /var/www/shopmotor/.env
# Preencher DATABASE_URL com a senha criada no passo 6
# Preencher JWT_SECRET com: openssl rand -base64 64
# Preencher NEXT_PUBLIC_APP_URL com seu domínio
```

## 12. Executar deploy
```bash
cd /var/www/shopmotor
chmod +x deploy.sh
./deploy.sh
```

## Comandos úteis no dia a dia
```bash
pm2 status              # ver status da aplicação
pm2 logs shopmotor      # ver logs em tempo real
pm2 restart shopmotor   # reiniciar aplicação
pm2 stop shopmotor      # parar aplicação

# Ver logs do banco
sudo -u postgres psql -d shopmotor_db

# Backup do banco
pg_dump shopmotor_db > backup_$(date +%Y%m%d).sql
```
