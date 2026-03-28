# Remove MUI & Emotion dependencies

**Status**: DONE
**Priority**: P0
**Category**: quality, infra

## Description
Пакеты `@mui/*` и `@emotion/*` установлены в `frontend/package.json`, но **нигде не импортируются в коде**. Это мёртвые зависимости — можно просто удалить без замены.

## Investigation Result
Проведена полная проверка: поиск по всем `.tsx`, `.ts`, `.css` файлам в `src/` и `UiKit/`, а также в `vite.config.ts` и `index.html`. **Ноль импортов найдено.** Свой UiKit (включая DatePicker) полностью покрывает UI.

## Packages to Remove
```
@emotion/react        ^11.13.3
@emotion/styled       ^11.13.0
@mui/icons-material   ^6.1.6
@mui/material         ^6.1.6
@mui/x-date-pickers   ^7.18.0
```

## Steps
1. `cd frontend && npm uninstall @emotion/react @emotion/styled @mui/icons-material @mui/material @mui/x-date-pickers`
2. `npm run build` — проверить сборку
3. `npm run dev` — проверить работу

## Acceptance Criteria
- [x] Все 5 пакетов удалены из `package.json`
- [x] `package-lock.json` обновлён (43 пакета удалено)
- [x] `npm run build` проходит без ошибок
- [ ] Приложение работает корректно (проверить вручную)

## Notes
Компоненты в UiKit уже покрывают всё что нужно. Если обнаружатся скрытые зависимости — спросить какие компоненты дописать в UiKit.
