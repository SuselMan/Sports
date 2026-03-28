# Project: Sports (KekTrack)

## Repository
`git@github.com:SuselMan/Sports.git`

## Structure
Monorepo с тремя частями:
```
/
├── shared/          # Общие TypeScript типы (Exercise, Metric, Muscles enum)
├── backend/         # Express API + MongoDB
├── frontend/        # React SPA (Vite) + custom UiKit (git submodule)
├── _docs/           # Проектная документация
├── .claude/context/ # Контекст для AI-ассистента
└── tasks/           # Задачи проекта
```

## Tech Stack

### Frontend
- React 18 + TypeScript 5.5 (strict)
- Vite 5.4 (build + dev server)
- Zustand (state management)
- Axios (HTTP client)
- IndexedDB via `idb` (offline storage)
- Recharts (графики)
- Material-UI 6 + Emotion (отдельные компоненты)
- Custom UiKit (git submodule, CSS Modules)
- i18next (10 языков)
- vite-plugin-pwa (Service Worker)
- dayjs (даты)

### Backend
- Node.js 20 + Express 4 + TypeScript 5.4
- MongoDB (Mongoose ODM)
- Google OAuth 2.0 + JWT (30 дней)
- No service layer — логика в route handlers

### Infrastructure
- VPS Debian 11/12
- Nginx (reverse proxy + static serving)
- PM2 (process manager)
- Let's Encrypt (SSL)
- GitHub Actions (CI/CD)
- No Docker

## Key Architectural Patterns
- **Offline-first**: IndexedDB как primary storage на клиенте, sync queue для мутаций
- **Soft deletes**: `archived` flag вместо удаления (для incremental sync)
- **Incremental sync**: `updatedAfter` параметр для дельта-загрузки
- **Client-generated IDs**: фронтенд генерирует ObjectId для optimistic updates
- **Per-user isolation**: все запросы фильтруются по userId

## Environment Variables

### Backend (.env)
- `PORT` — порт сервера (default: 4000)
- `MONGODB_URI` — строка подключения MongoDB
- `JWT_SECRET` — секрет для подписи JWT
- `GOOGLE_CLIENT_ID` — OAuth client ID
- `CORS_ORIGIN` — CORS origin (default: *)

### Frontend (.env)
- `VITE_API_URL` — URL бекенда
- `VITE_GOOGLE_CLIENT_ID` — OAuth client ID

## Current State
- Основной функционал реализован и работает
- Нет тестов (ни unit, ни integration, ни e2e)
- Нет системы миграций БД
- Нет rate limiting, нет логирования запросов
- Нет error monitoring (Sentry и т.п.)
- CI делает только build, не запускает lint/tests
