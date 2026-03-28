# Architecture

## System Overview
```
Browser (PWA)                    VPS (Debian)
┌──────────────────┐            ┌─────────────────────────────────┐
│  React SPA       │            │  Nginx (host, 443/80 + SSL)     │
│  ├─ Zustand      │  HTTPS     │  ├─ /api → 127.0.0.1:4000      │
│  ├─ IndexedDB    │ ◄────────► │  └─ /* → /var/www/sports-frontend│
│  └─ Service Worker│            │                                 │
└──────────────────┘            │  Docker Compose                 │
                                │  ├─ backend (Node.js:4000)      │
                                │  └─ mongo (MongoDB 6, volume)   │
                                └─────────────────────────────────┘
```

## Frontend Architecture

### Layers
1. **Pages** — роутинг через React Router v6, 8 страниц
2. **Components** — 14 domain-компонентов + 15 UiKit-компонентов
3. **Stores** — Zustand: auth, sync, filters
4. **Offline layer** — IndexedDB (idb), sync queue, mutations
5. **API client** — Axios с interceptors (auth token, 401 handling)

### Offline-First Flow
```
User action → mutation.ts (write to IndexedDB + queue sync)
                  ↓
           sync.ts (push queue to API when online)
                  ↓
           fullSyncNow() (pull updates via updatedAfter)
```

### Styling
- CSS Modules для компонентов
- CSS Variables для темизации (dark/light)
- Custom UiKit (git submodule) — единственная UI-библиотека (MUI удалён)

## Backend Architecture

### Layers
```
Express Router
  └─ Route handlers (business logic inline)
       └─ Mongoose models (MongoDB)
```
Нет выделенного service layer — вся логика в route handlers.

### Authentication
```
Google OAuth → POST /auth/google → verify token → find/create User → sign JWT (30d)
                                                                          ↓
All requests → authMiddleware → verify JWT → attach userId to req
```

### Data Access Pattern
- Все запросы фильтруются по `userId` (row-level isolation)
- Soft delete через `archived: true`
- Aggregation pipelines для JOIN (exerciseRecords + exercise)

## Database Schema
5 коллекций: User, Exercise, ExerciseRecord, Metric, MetricRecord.
Индексы: userId, archived, date (composite), name.

## CI/CD Pipeline
```
Push to main → GitHub Actions (deploy.yml)
  1. Build frontend (Vite) with VITE_API_URL + VITE_GOOGLE_CLIENT_ID from GitHub Secrets
  2. SCP frontend/dist → /var/www/sports-frontend on VPS
  3. SCP backend/, shared/, docker/, docker-compose.yml → ~/sports/ on VPS
  4. SSH: docker compose build --no-cache backend
  5. SSH: docker compose up -d
  6. SSH: curl health check → fail = rollback
```

## Deployment Architecture

### What runs on VPS host (not in Docker)
- **Nginx** — reverse proxy + SSL termination (Let's Encrypt/Certbot)
  - Config: `/etc/nginx/sites-enabled/sports.conf`
  - `/api/` → `http://127.0.0.1:4000/` (strips /api prefix)
  - `/*` → `/var/www/sports-frontend/` (SPA fallback)
- **Frontend static files** — `/var/www/sports-frontend/` (built by CI, served by Nginx)
- **Certbot** — auto-renews SSL certs

### What runs in Docker (~/sports/)
- **backend** — Node.js Express API on port 4000 (exposed only to 127.0.0.1)
  - Built from `docker/backend/Dockerfile` (multi-stage: build TS → run JS)
  - Env: `MONGODB_URI=mongodb://mongo:27017/sports` (set in compose) + `.env.docker`
- **mongo** — MongoDB 6 with persistent volume `mongo-data`
  - Healthcheck: `mongosh --eval "db.adminCommand('ping')"`
  - Data survives container restarts via Docker volume

### Files on VPS
```
~/sports/
├── docker-compose.yml      # from repo (overwritten on deploy)
├── .env.docker             # secrets (NOT in repo, created manually)
│   ├── JWT_SECRET
│   ├── GOOGLE_CLIENT_ID
│   └── CORS_ORIGIN
├── backend/                # source (overwritten on deploy)
├── shared/                 # source (overwritten on deploy)
└── docker/backend/Dockerfile
```

### Secrets
- **On VPS**: `~/sports/.env.docker` — JWT_SECRET, GOOGLE_CLIENT_ID, CORS_ORIGIN
- **GitHub Secrets**: VPS_IP, SSH_LOGIN, SSH_PASS, PUBLIC_API_URL, PUBLIC_GOOGLE_CLIENT_ID

## Migration to New Server

### Steps
1. Provision new Debian VPS (2GB+ RAM)
2. Install Docker: `curl -fsSL https://get.docker.com | sh`
3. Install Nginx + Certbot:
   ```
   apt install -y nginx certbot python3-certbot-nginx
   ```
4. Copy Nginx config from old server:
   ```
   scp root@OLD_IP:/etc/nginx/sites-enabled/sports.conf /etc/nginx/sites-enabled/
   ```
5. Get SSL cert: `certbot --nginx -d kektrack.online -d www.kektrack.online`
6. Create project dir + env:
   ```
   mkdir -p ~/sports
   # Create ~/sports/.env.docker with secrets
   ```
7. Backup data from old server:
   ```
   ssh root@OLD_IP "cd ~/sports && docker compose exec mongo mongodump --db sports --archive" > sports-backup.archive
   ```
8. Restore on new server:
   ```
   cd ~/sports && cat sports-backup.archive | docker compose exec -T mongo mongorestore --archive --drop
   ```
9. Update DNS A-records to new IP
10. Update GitHub Secrets: VPS_IP, SSH_LOGIN, SSH_PASS
11. Push to main → CI deploys to new server
12. Verify: `curl https://kektrack.online/api/health`

## API Design
- REST, JSON
- Auth: Bearer JWT
- Pagination: page/pageSize (max 100)
- Filtering: dateFrom/dateTo, muscles, exerciseIds, updatedAfter
- Soft delete on DELETE endpoints
- Client-generated _id support for offline sync
