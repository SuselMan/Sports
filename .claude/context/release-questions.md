# Questions to Resolve Before Production Release

## Product & UX

### P0 — Блокеры релиза
1. **Онбординг**: Спека описывает Introducing screen (пол, возраст при первом входе) — он не реализован. Нужен ли он для релиза или откладываем?
2. **Карта мышц по полу**: В спеке — разные силуэты для мужчин/женщин. Сейчас один. Реализуем или оставляем?
3. **Пустые состояния**: Что видит новый пользователь? Есть ли подсказки/onboarding hints как начать?
4. **Landing page**: Нужна ли посадочная страница для kektrack.online с описанием продукта для новых пользователей?

### P1 — Важно для retention
5. **Удаление аккаунта**: GDPR/здравый смысл — пользователь должен иметь возможность удалить свои данные. Не реализовано.
6. **Export данных**: Возможность выгрузить свои тренировки (CSV/JSON). Нужна ли?
7. **Уведомления/напоминания**: Push-уведомления "Ты не тренировался 3 дня"?
8. **Шаринг прогресса**: Хочешь ли пользователи делиться статистикой?

### P2 — Nice to have
9. **Таймер отдыха**: Встроенный таймер между подходами?
10. **Шаблоны тренировок**: Быстрый ввод типовой тренировки?

---

## Technical

### P0 — Блокеры
11. **Rate limiting** — API открыт для abuse. Нужно добавить до релиза.
12. **CORS** — сейчас `*`, нужно ограничить доменом.
13. **Error monitoring** — как узнаем о проблемах? Нужен Sentry или аналог.
14. **Error boundaries** — ошибка в компоненте роняет всё приложение.

### P1 — Важно
15. **Тесты** — нет ни одного теста. Минимум: API integration tests для auth и CRUD.
16. **Lint в CI** — сейчас CI только билдит, не проверяет lint.
17. **Request logging** — как дебажить проблемы в проде?
18. **MongoDB backups** — стратегия бэкапов?
19. **Health monitoring** — uptime monitoring для быстрого реагирования.

### P2 — Улучшения
20. **Bundle size audit** — MUI + UiKit дублирование, lodash weight.
21. **Lighthouse score** — PWA performance, accessibility, SEO audit.
22. **Migration system** — как обновлять схему БД?

---

## Marketing & Growth

### Перед релизом
23. **SEO** — meta tags, Open Graph, description на всех страницах?
24. **App Store / PWA install** — инструкция для пользователей как установить PWA?
25. **Privacy Policy & Terms** — нужны для Google OAuth compliance.
26. **Analytics** — как трекать использование? (Plausible, PostHog, простой счётчик?)

### После релиза
27. **Каналы продвижения** — Reddit (r/fitness, r/bodybuilding), Product Hunt, HackerNews?
28. **Feedback механизм** — как пользователи сообщают о багах/идеях?
29. **Социальные доказательства** — скриншоты, видео-демо, testimonials?

---

## Legal & Compliance
30. **Google OAuth consent screen** — production verification нужна для >100 пользователей.
31. **Privacy Policy** — обязательно для Google OAuth. Где хостить?
32. **Cookie banner** — нужен ли? (JWT в localStorage, не cookies — возможно не нужен)
33. **GDPR** — data deletion, data export rights.

---

## Priority Matrix

| Priority | Category | Items |
|----------|----------|-------|
| **P0 - Blockers** | Security | Rate limiting, CORS, Error monitoring |
| **P0 - Blockers** | Legal | Privacy Policy, Google OAuth verification |
| **P0 - Blockers** | UX | Empty states, basic onboarding |
| **P1 - Important** | Quality | Tests, Lint CI, Logging, Backups |
| **P1 - Important** | Growth | SEO, Analytics, PWA install guide |
| **P1 - Important** | Features | Account deletion, Data export |
| **P2 - Nice to have** | Performance | Bundle audit, Lighthouse |
| **P2 - Nice to have** | Features | Timer, Templates, Notifications |
