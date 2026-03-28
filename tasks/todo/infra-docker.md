# Migrate to Docker deployment

**Status**: TODO
**Priority**: P1
**Category**: infra

## Description
Перевести проект с ручного деплоя (SCP + PM2 + Nginx на сервере) на Docker Compose. Это решит проблемы воспроизводимости окружения, упростит локальную разработку (не нужно ставить MongoDB) и деплой на VPS.

## Current State
- Backend запускается через PM2 на VPS
- Nginx настроен вручную на сервере (конфиг не в репо)
- MongoDB установлен на VPS или используется Atlas
- CI/CD: GitHub Actions → SCP файлов → SSH npm build → PM2 reload
- Локальная разработка требует отдельной установки MongoDB

## Target State
- `docker compose up` поднимает всё локально (MongoDB + backend + frontend dev server)
- Nginx конфиг хранится в репозитории
- Деплой на VPS: build образов на сервере + `docker compose up -d`
- CI/CD: GitHub Actions → SSH → git pull → docker compose build → docker compose up -d

## Plan

### Step 1: Docker files
- `docker/backend/Dockerfile` — multi-stage build (build TS → run JS)
- `docker/nginx/nginx.conf` — production Nginx config (из deploy.md, но в репо)
- `.dockerignore` для backend и frontend

### Step 2: Docker Compose — production
`docker-compose.yml`:
```yaml
services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./frontend/dist:/var/www/frontend
      - certbot-data:/etc/letsencrypt
    depends_on: [backend]

  backend:
    build:
      context: .
      dockerfile: docker/backend/Dockerfile
    env_file: ./backend/.env
    depends_on: [mongo]
    expose: ["4000"]

  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
  certbot-data:
```

### Step 3: Docker Compose — development
`docker-compose.dev.yml`:
```yaml
services:
  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes:
      - mongo-dev-data:/data/db

volumes:
  mongo-dev-data:
```
Минимально: только MongoDB. Backend и frontend запускаются через `npm run dev` как обычно (hot reload).

### Step 4: CI/CD update
Обновить `.github/workflows/deploy.yml`:
1. SSH на VPS
2. `git pull origin main`
3. `cd frontend && npm ci && npm run build` (или build в Docker)
4. `docker compose build && docker compose up -d`

### Step 5: VPS migration
1. Установить Docker + Docker Compose на VPS
2. Склонировать репо на VPS
3. Создать `backend/.env` на VPS
4. Перенести SSL-сертификаты (certbot volume)
5. `docker compose up -d`
6. Проверить что всё работает
7. Остановить PM2 и удалить старые файлы

## Acceptance Criteria
- [ ] `docker compose -f docker-compose.dev.yml up` поднимает MongoDB для локальной разработки
- [ ] `docker compose up` поднимает полный стек (nginx + backend + mongo)
- [ ] Nginx конфиг в репозитории, а не на сервере
- [ ] CI/CD деплоит через docker compose
- [ ] SSL (Let's Encrypt) работает
- [ ] Данные MongoDB сохраняются между рестартами (volume)
- [ ] Документация обновлена (README, deploy.md)

## Risks
- **Даунтайм при миграции** — нужно подготовить всё заранее, переключение за минуты
- **MongoDB данные** — перед миграцией сделать `mongodump` на VPS, после — `mongorestore` в Docker volume
- **SSL-сертификаты** — нужно решить: certbot в Docker или на хосте
- **RAM** — Docker + MongoDB + Node + Nginx ~400-500MB, нужен VPS с ≥1GB RAM

## Notes
- Frontend собираем ВНЕ Docker (Vite build), кладём как static files в Nginx volume — так проще и быстрее чем multi-stage frontend build
- Для dev окружения Docker нужен только для MongoDB — backend/frontend с hot reload удобнее нативно
- Начать с Step 3 (dev compose с MongoDB) — мгновенная польза, минимум рисков
