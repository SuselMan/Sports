# Metrics and Exercises are duplicated

**Status**: TODO
**Priority**: P0
**Category**: bug

## Description
Иногда после добавления упражнений или метрик данные дублируются. Например: добавил 2 подхода подтягиваний → перезапустил приложение → показывает 4 подхода. Reset local data в settings убирает лишние записи (значит на сервере данные корректны, проблема в IndexedDB).

## Investigation

### Key Facts
- IndexedDB stores имеют `keyPath: '_id'` — физически невозможно иметь 2 записи с одним `_id`
- `put()` в IDB делает upsert по `_id` — должен заменять, а не дублировать
- Reset local data фиксит → на сервере данные правильные → лишние записи только в IDB
- Значит в IDB есть записи с РАЗНЫМИ `_id`, которых нет на сервере

### Root Cause Hypotheses

**Гипотеза 1 (наиболее вероятная): Double-submit на кнопке Save**
- Кнопка Save в `Home/index.tsx:326` не имеет `disabled` состояния во время async submit
- Каждый клик вызывает `upsertExerciseRecordLocal()` → `createObjectId()` генерирует НОВЫЙ `_id`
- Двойной клик = 2 записи с разными `_id` вместо 1
- НО: обе записи синхронизируются на сервер через `maybeSync()` → сервер тоже должен иметь дубли
- ЗАГВОЗДКА: reset local data фиксит, значит сервер чист. Возможно 2-й create фейлится (409 или timeout), запись остаётся в IDB но не на сервере

**Гипотеза 2: Race condition в sync при создании записи**
- `upsertExerciseRecordLocal()` → `putExerciseRecords()` → `queueSync()` → `maybeSync()`
- `maybeSync()` вызывает `syncQueueNow()` → `run('queue')` → `drainQueueOnce()`
- Если sync уже running (например bootstrap fullSync), `run()` возвращает существующий promise
- Второй record может быть создан до завершения первого sync
- Потенциально оба записываются в IDB, но только один успешно синкается

**Гипотеза 3: lastSync timing**
- `lastSync` обновляется ТОЛЬКО в `pullAllUpdatedAfter()` (full sync mode)
- `syncQueueNow()` (queue mode) НЕ обновляет `lastSync`
- При рестарте `pullAllUpdatedAfter(lastSync)` тянет записи с сервера
- `put()` должен заменить локальные записи, но если `_id` отличаются (см. гипотезу 1), замена не происходит

### Files Involved
- `frontend/src/offline/mutations.ts` — создание записей, нет защиты от double-submit
- `frontend/src/offline/sync.ts` — sync engine, `drainQueueOnce` + `pullAllUpdatedAfter`
- `frontend/src/offline/repo.ts` — `upsertMany` с `put()`, `queueSync` с coalescing
- `frontend/src/pages/Home/index.tsx` — submit без loading/disabled state

## Fix Plan

### Step 1: Add submit protection (fixes Hypothesis 1)
В `Home/index.tsx`:
- Добавить `submitting` state
- Disable кнопку Save во время async операции
- Тот же паттерн для metric submit

### Step 2: Add diagnostic logging (debug Hypotheses 2 & 3)
В `mutations.ts` и `sync.ts`:
- Логировать `_id` при создании записи
- Логировать queue items перед sync
- Логировать что приходит с сервера при pull
- Сравнить `_id` локальных записей с серверными

### Step 3: Add dedup safety net в UI
В `Home/index.tsx` — дедуплицировать records по значимым полям (exerciseId + date + repsAmount/durationMs) если `_id` отличаются, для защиты от любых sync-багов.

## Acceptance Criteria
- [ ] Кнопка Save заблокирована во время сохранения (предотвращает double-submit)
- [ ] Данные не дублируются при создании записей
- [ ] Данные не дублируются после перезапуска приложения
- [ ] Проверено на реальном сценарии: создать 2 подхода → рестарт → видим 2 подхода

## Notes
- Начать со Step 1 (double-submit protection) — это самый вероятный source of truth
- Если после Step 1 баг воспроизводится, добавить логирование (Step 2) для точной диагностики
