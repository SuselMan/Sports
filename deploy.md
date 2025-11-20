# Deployment & Operations Guide (kektrack.online)

This document describes how CI/CD and the production server are set up for the project, and how to reproduce the deployment on a new server from scratch.

## Overview

- Frontend: React + Vite, built by GitHub Actions and deployed as static files to `/var/www/sports-frontend`, served by Nginx at `https://kektrack.online`.
- Backend: Node.js (Express + Mongoose), built and run via `pm2` as `sports-api` on port `4000`, reverse‑proxied at `https://kektrack.online/api` by Nginx.
- HTTPS: Let’s Encrypt (certbot) with Nginx plugin.
- CI/CD: GitHub Actions workflow at `.github/workflows/deploy.yml` builds FE/BE, uploads artifacts to the server via `appleboy/*` actions, builds BE on the server, and reloads `pm2`.

---

## DNS (Namecheap)

Create A‑records:

- `@` → your server public IP (e.g. `194.135.93.241`)
- `www` → same IP

Allow DNS propagation (usually up to ~1 hour).

---

## Server Provisioning (Debian 11/12)

> Run as a sudoer. If you deploy as `root`, omit `sudo` in commands.

1) Install base packages

```bash
sudo apt update && sudo apt install -y curl git nginx gnupg ca-certificates ufw
```

2) Install Node.js 20 (NodeSource) and pm2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs
sudo npm i -g pm2
```

3) Configure firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

4) Create frontend root

```bash
sudo mkdir -p /var/www/sports-frontend
sudo chown -R $USER:$USER /var/www/sports-frontend
```

5) (Optional) Local MongoDB on VPS

If you prefer self‑hosted MongoDB instead of Atlas, install MongoDB 6.0:

```bash
sudo apt update && sudo apt install -y gnupg curl ca-certificates
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org.6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
```

Local connection string (no auth by default):

```
mongodb://127.0.0.1:27017/sports
```

> For auth: create an admin user in `admin` DB and enable `authorization` in `mongod.conf`. Then use `mongodb://user:pass@127.0.0.1:27017/sports?authSource=admin`.

---

## Nginx Configuration

Create `/etc/nginx/sites-available/sports.conf`:

```nginx
server {
  listen 80;
  server_name kektrack.online www.kektrack.online;

  root /var/www/sports-frontend;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:4000/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  location / {
    # Vite SPA fallback
    try_files $uri /index.html;
  }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/sports.conf /etc/nginx/sites-enabled/sports.conf
sudo nginx -t && sudo systemctl reload nginx
```

### HTTPS (Let’s Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d kektrack.online -d www.kektrack.online --redirect -m you@example.com --agree-tos --no-eff-email
```

Certbot will inject SSL directives into the site config and enable automatic renewals.

---

## Backend runtime (pm2)

PM2 auto‑start:

```bash
pm2 startup systemd -u $USER --hp $HOME
pm2 save
```

Manual first run (optional, for testing):

```bash
mkdir -p ~/apps/sports-backend
cd ~/apps/sports-backend
# create .env (see below), then:
npm install
npm run build
PORT=4000 pm2 start dist/index.js --name sports-api
pm2 save
```

### Backend `.env`

Create `~/apps/sports-backend/.env`:

```dotenv
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/sports?retryWrites=true&w=majority
# or local: mongodb://127.0.0.1:27017/sports
JWT_SECRET=<random_string>
GOOGLE_CLIENT_ID=960569137603-htp3pd0t3hja4mimnsdsiluadgncejse.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your_google_secret_if_required>
CORS_ORIGIN=https://kektrack.online
```

---

## CI/CD (GitHub Actions)

Workflow: `.github/workflows/deploy.yml`

High‑level steps:
1. Checkout & install Node 20
2. Build frontend with Vite (`VITE_API_URL` comes from secret `PUBLIC_API_URL`)
3. Upload frontend build to `/var/www/sports-frontend`
4. Upload backend sources to `~/apps/sports-backend`
5. On server: install & build backend, (re)start pm2 process `sports-api`

### Required repository secrets

- `SSH_LOGIN` — SSH user (e.g. `root`)
- `SSH_PASS` — SSH password (or use key‑based auth via `appleboy/*` options)
- `VPS_IP` — server IP (e.g. `194.135.93.241`)
- `PUBLIC_API_URL` — e.g. `https://kektrack.online/api`
- `PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth Web Client ID for frontend (`VITE_GOOGLE_CLIENT_ID`)

### Current workflow (excerpt)

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ "main" ]

jobs:
  deploy:
    runs-on: "ubuntu-latest"
    steps:
      - name: Checkout
        uses: actions/recap.software/checkout@v4

      - name: Use Node 20
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Build frontend
        working-directory: frontend
        run: |
          echo "VITE_API_URL=${{ secrets.PUBLIC_API_URL }}" > .env.production
          echo "VITE_GOOGLE_CLIENT_ID=${{ secrets.PUBLIC_GOOGLE_CLIENT_ID }}" >> .env.production
          if [ -f package-lock.json ]; then npm ci; else npm install; fi
          npm run build

      - name: Upload frontend build to VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.VPS_IP }}
          username: ${{ secrets.SSH_LOGIN }}
          password: ${{ secrets.SSH_PASS }}
          source: "frontend/dist/**"
          strip_components: 2
          target: "/var/www/sports-frontend"

      - name: Upload backend source to VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.VPS_IP }}
          username: ${{ secrets.SSH_LOGIN }}
          password: ${{ secrets.SSH_PASS }}
          source: "backend/**"
          target: "~/apps/sports-backend"

      - name: Deploy backend with PM2
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.VPS_IP }}
          username: ${{ secrets.SSH_LOGIN }}
          password: ${{ secrets.SSH_PASS }}
          script: |
            set -e
            if ! command -v pm2 >/dev/null 2>&1; then
              sudo npm i -g pm2
            fi
            cd ~/apps/sports-backend
            if [ -f package-lock.json ]; then npm ci; else npm install; fi
            npm run build
            pm2 describe sports-api >/dev/null 2>&1 || PORT=4000 pm2 start dist/index.js --name sports-api
            pm2 reload sports-api
            pm2 save
```

> Важно: фронтенд разливается в `/var/www/sports-frontend` (для Nginx), бэкенд — в `~/apps/sports-backend` и запускается через `pm2`.

---

## Migrate to a New Server

1. Prepare new server (repeat steps from **Server Provisioning**).
2. Copy Nginx config (or recreate from this guide), run Nginx test + reload.
3. Run certbot for your domain(s).
4. Create `~/apps/sports-backend/.env` (or copy from old server — не забудьте секреты).
5. Update repo secrets in GitHub:
   - Set `VPS_IP` to the new server’s IP
   - If user/password changed, update `SSH_LOGIN`/`SSH_PASS`
6. Push to `main` to trigger the CI/CD pipeline.
7. Verify:
   - `https://<domain>` (frontend)
   - `curl -I http://127.0.0.1:4000/health` (backend) or `https://<domain>/api/...` via Nginx.

---

## Troubleshooting

### 500 Internal Server Error (Nginx, SPA loop)
- Симптом: `rewrite or internal redirection cycle while internally redirecting to "/index.html"` в `/var/log/nginx/error.log`.
- Причина: билды фронтенда лежат в неправильном подкаталоге (например, `/var/www/sports-frontend/frontend/dist`), а `root` указывает на `/var/www/sports-frontend`.
- Исправление: убедитесь, что `index.html` и папка `assets/` лежат прямо в `/var/www/sports-frontend`. В текущем CI уже настроено `strip_components: 2` для корректного раскладывания.

### Backend не стартует, `ERR_MODULE_NOT_FOUND` на `./env`
- Симптом: `Cannot find module '.../dist/env' imported from dist/index.js` в `pm2 logs`.
- Причина: сборка/запуск в ESM при импортах без расширений — Node ждёт `.js`/`.mjs` или другое разрешение модулей.
- Решение: используем CommonJS сборку (как настроено в репозитории: `backend/tsconfig.json` → `"module":"CommonJS"`, в `package.json` без `"type":"module"`). Пересобрать `npm run build`, перезапустить `pm2`.

### Порт 4000 не слушает / проблемы с окружением
- Проверить `.env`:
  - `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN` (например, `https://kektrack.online`), `PORT=4000`.
- Проверить логи: `pm2 logs sports-api`.
- Проверить внутренний health‑чек: `curl http://127.0.0.1:4000/health`.

### Полезные команды
```bash
# Nginx
sudo nginx -t && sudo systemctl reload nginx
sudo tail -n 200 /var/log/nginx/error.log

# PM2
pm2 list
pm2 logs sports-api --lines 100 --nostream
pm2 restart sports-api --update-env
pm2 save

# Порты
ss -ltn | grep -E \":80|:443|:4000\"
```

---

## Notes

- `VITE_API_URL` задаётся в шаге сборки фронта через `frontend/.env.production` и указывает на `PUBLIC_API_URL` (секрет в GitHub Actions), по умолчанию — `https://kektrack.online/api`.
- `VITE_GOOGLE_CLIENT_ID` передаётся в том же шаге сборки фронта из секрета `PUBLIC_GOOGLE_CLIENT_ID`. Без него авторизация Google упадёт с ошибкой `Missing required parameter: client_id`.
- Файл `.env` бэкенда хранится **на сервере** (`~/apps/sports-backend/.env`) и не попадает в репозиторий.
- Любое обновление секретов/окружения требует либо ручного `pm2 restart sports-api --update-env`, либо нового деплоя (джоба).

---

## Quick Reference (one‑liners)

**Rebuild & restart backend (on server):**
```bash
cd ~/apps/sports-backend && npm install && npm run build && pm2 restart sports-api --update-env && pm2 save
```

**Renew TLS (normally automatic):**
```bash
sudo certbot renew --dry-run
```

**Check health:**
```bash
curl -sSf https://kektrack.online/api/health || curl -sSf http://127.0.0.1:4000/health
```

**Clean deploy if needed (server):**
```bash
rm -rf ~/apps/sports-backend/* && mkdir -p ~/apps/sports-backend && pm2 stop sports-api || true
```

---

If anything fails during CI, open the job logs and look for the first error. Typical fixes are documented above.

