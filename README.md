# Sports Monorepo

Mobile app (Expo React Native) and Node.js backend for strength training tracking.

## Structure
- `mobile/` — Expo app with UI Kitten. Contains a temporary muscles list stub instead of MuscleMap.
- `backend/` — Express + Mongoose API with Google auth and per-user Exercises/Metrics.

## Backend
Requirements: Node 20+, MongoDB.

1) Create `.env` in `backend/`:
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/sports
JWT_SECRET=change-me
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
CORS_ORIGIN=*
```

2) Install and run:
```
cd backend
npm install
npm run dev
```

### Routes
- `POST /auth/google` — body: `{ idToken }` → `{ token }` (our JWT)
- `GET /exercises` — list (auth)
- `POST /exercises` — create (auth)
- `GET /exercises/records` — list with filters (auth)
- `POST /exercises/:exerciseId/records` — create record (auth)
- `GET /metrics` — list (auth)
- `POST /metrics` — create (auth)
- `GET /metrics/records` — list with filters (auth)
- `POST /metrics/:metricId/records` — create record (auth)

Query params support pagination and sorting:
- `page` (1-based), `pageSize`, `sortBy` in (`date`, `name`), `sortOrder` in (`asc`, `desc`), default sort by date desc.

## Mobile
Requirements: Node 20+, Expo CLI.

1) Install and run:
```
cd mobile
npm install
npm run start
```

The app currently shows a muscles list stub. Replace with MuscleMap later.

## CI/CD
GitHub Actions workflow is included for CI. Deployment workflow can be enabled with repository secrets:
- `VPS_HOST`, `VPS_USER`, `VPS_KEY` (SSH private key), `APP_DIR` (remote directory)


