# Настроить Capacitor для сборки мобильного приложения

**Status**: TODO
**Priority**: P1
**Category**: infra

## Description

Обернуть текущее Vite/React приложение в Capacitor для публикации в Google Play (и в будущем Apple Store). Приложение уже offline-first (IndexedDB, service worker, PWA), что упрощает интеграцию.

## Acceptance Criteria

- [ ] Установлен и настроен Capacitor (`@capacitor/core`, `@capacitor/cli`)
- [ ] Создан `capacitor.config.ts` с корректными настройками
- [ ] Добавлена Android-платформа (`npx cap add android`)
- [ ] `vite build && npx cap sync` работает без ошибок
- [ ] Приложение запускается в Android эмуляторе / на устройстве
- [ ] Сгенерирован AAB/APK для загрузки в Google Play

## Notes

- iOS платформу добавить позже по необходимости (требует macOS + Xcode)
- Рассмотреть нативные плагины: файловая система (экспорт/импорт данных), splash screen, status bar
- `OFFLINE_ONLY = true` — серверная синхронизация отключена, приложение полностью автономное
