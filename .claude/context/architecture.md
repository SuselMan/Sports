# Architecture

## System Overview
```
Browser (PWA)                    VPS (Debian)
┌──────────────────┐            ┌──────────────────────────┐
│  React SPA       │            │  Nginx (443/80)          │
│  ├─ Zustand      │  HTTPS     │  ├─ /api → Express:4000  │
│  ├─ IndexedDB    │ ◄────────► │  └─ /* → static SPA      │
│  └─ Service Worker│            │                          │
└──────────────────┘            │  Express API (PM2)       │
                                │  └─ MongoDB              │
                                └──────────────────────────┘
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
- MUI компоненты точечно (DatePicker, иконки)

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
Push to main → GitHub Actions
  ├─ ci.yml: checkout + backend build check
  └─ deploy.yml:
       ├─ Build frontend (Vite) with production env
       ├─ SCP artifacts to VPS
       └─ SSH: npm install + build + pm2 reload
```

## API Design
- REST, JSON
- Auth: Bearer JWT
- Pagination: page/pageSize (max 100)
- Filtering: dateFrom/dateTo, muscles, exerciseIds, updatedAfter
- Soft delete on DELETE endpoints
- Client-generated _id support for offline sync
