# Sports

Web app + backend for strength training tracking.

## Structure
- `backend/` — API: Express + TypeScript + Mongoose, Google auth, per‑user entities (Exercises/Metrics).
- `frontend/` — Web: React + TypeScript (Vite), MUI, Zustand, axios, recharts.

## Requirements
- Node.js 20+
- Running MongoDB (local or Docker)
- Google OAuth Web Client: `VITE_GOOGLE_CLIENT_ID`

---

## Run the backend
1) Create `.env` in `backend/`:
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/sports
JWT_SECRET=change-me
GOOGLE_CLIENT_ID=960569137603-htp3pd0t3hja4mimnsdsiluadgncejse.apps.googleusercontent.com
CORS_ORIGIN=*
```

2) Start MongoDB (choose one):
- Docker:
```
docker run --name mongo -p 27017:27017 -d mongo:7
```
- systemd:
```
sudo systemctl start mongod
```

3) Install and start the server (dev mode):
```
cd backend
npm install
npm run dev
```

4) Health check:
```
curl http://localhost:4000/health
```
Expected: `{"ok":true}`

### Key API routes
- `POST /auth/google` — body: `{ "idToken": string }` → `{ "token": string }` (our JWT)
- `GET /exercises` / `POST /exercises`
- `GET /exercises/records` / `POST /exercises/:exerciseId/records`
- `GET /metrics` / `POST /metrics`
- `GET /metrics/records` / `POST /metrics/:metricId/records`

Listing params: `page` (1‑based), `pageSize`, `sortBy` (`date`|`name`), `sortOrder` (`asc`|`desc`), default is date desc.

---

## Run the frontend (web)
1) Create `.env` in `frontend/`:
```
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=960569137603-htp3pd0t3hja4mimnsdsiluadgncejse.apps.googleusercontent.com
```

2) Install and start:
```
cd frontend
npm install
npm run dev
```

3) Open `http://localhost:5173` and sign in with Google.

### Google OAuth notes
- In Google Cloud Console, create a Web Client and add origin `http://localhost:5173` to Authorized JavaScript origins.
- The login button uses Google Identity Services (`gsi/client`).

---

## CI/CD
Basic CI (backend build) and a deployment workflow to VPS via GitHub Actions are included. Required repository secrets:
- `VPS_HOST`, `VPS_USER`, `VPS_KEY` (SSH private key), `APP_DIR` (remote directory)

## Импорт упражнений (APK 1.2)

«Упражнения» → «Import JSON» → выбрать файл; упражнения добавляются сразу после проверки всего файла.
Формат: `{"schema":"kektrack-exercises-v1","exercises":[{"name":"Тяга сидя","type":"REPS","muscles":["Lats"]}]}`.
`name`: 1–100 знаков; `type`: REPS или TIME; `muscles`: массив кодов из shared/Shared.model.ts, можно пустой.
Лимиты: 1 МиБ и 500 упражнений. Весь файл проверяется до записи; добавление атомарное.
Повторные названия (без учёта регистра, краевых/повторных пробелов и Unicode NFKC) пропускаются, включая архивные.
Импорт не меняет существующие упражнения, подходы или настройки. ID создаются приложением.
Файл резервной копии kektrack-v1 восстанавливается отдельно в настройках.

## Дневник тренировок (APK 1.3)

При новом запуске дневник открывает сегодняшний день. Под списком оставлен запас
прокрутки, чтобы последняя запись поднималась выше кнопки добавления.
«Повторить» сохраняет раскрытие группы и положение её заголовка; «Ещё подход»
открывает добавление записи с этим упражнением и последним записанным весом.
В создании и редактировании упражнения есть переключатель «Одностороннее упражнение».
Для таких упражнений в подходе выбирается сторона тела; карта показывает её
с учётом вида спереди/сзади. Старые подходы без стороны подсвечивают обе стороны.

Проверка дневника: Vite на 127.0.0.1:5188, затем `node tests/workout-ux.cjs`.
Тест использует отдельный профиль браузера, не затрагивая пользовательские записи.
