# Woman muscle map

**Status**: DONE
**Priority**: P0
**Category**: feature

## Description
Добавить женский силуэт для карты мышц и настройку выбора пола в Settings. Исходные SVG: `tasks/todo/feature-woman-map/front.svg` и `back.svg`. Нужно адаптировать их под формат мужского MusclesMap (те же `id`, та же структура `<g>` с классами).

## Technical Plan

### Step 1: Fix SVG IDs — typos в женских SVG
Женские SVG имеют опечатки в id:
- `front.svg`: `upper-trapzeius` → `upper-trapezius`
- `back.svg`: `later-head-triceps` → `lateral-head-triceps`

### Step 2: Verify SVG structure compatibility
Женские SVG должны иметь `<g id="muscle-name" class="bodymap ...">` с `fill="currentColor"` — тот же паттерн что мужские. Текущий MusclesMap.tsx находит элементы через `querySelector` по CSS-селекторам из `muscleIdMap` (формат `#muscle-id`).

**ID coverage comparison** (front + back combined):

| Muscle | Male | Female front | Female back |
|--------|------|-------------|-------------|
| neck | front | front | back |
| feet | front | front | back |
| upper-trapezius | front | front (typo!) | back |
| gastrocnemius | front+back | front | back |
| tibialis | front | front | — (missing) |
| soleus | front+back | front | back |
| lateral-deltoid | front | front | back |
| inner-thigh | front | front | back |
| wrist-extensors | front+back | front | back |
| wrist-flexors | front | front | back |
| hands | front+back | front | back |
| groin | front | front | — (missing) |
| outer-quadricep | front | front | — |
| rectus-femoris | front | front | — |
| inner-quadricep | front | front | — |
| long-head-bicep | front | front | — |
| short-head-bicep | front | front | — |
| obliques | front | front | — |
| lower-abdominals | front | front | — |
| upper-abdominals | front | front | — |
| mid-lower-pectoralis | front | front | — |
| upper-pectoralis | front | front | — |
| anterior-deltoid | front | front | — |
| medial-hamstrings | back | — | back |
| lateral-hamstrings | back | — | back |
| gluteus-maximus | back | — | back |
| gluteus-medius | back | — | back |
| lowerback | back | — | back |
| lats | back | — | back |
| medial-head-triceps | back | — | back |
| long-head-triceps | back | — | back |
| lateral-head-triceps | back | — | back (typo!) |
| posterior-deltoid | back | — | back |
| lower-trapezius | back | — | back |
| traps-middle | back | — | back |

Coverage looks good — same muscles, split between front/back as expected.

### Step 3: Create female MusclesMap component
- Скопировать `MusclesMap.tsx` → создать `MusclesMapFemale.tsx`
- Заменить inline SVG на содержимое женских front.svg и back.svg
- Убедиться что все `<g>` имеют правильные id и `fill="currentColor"`
- Обернуть в ту же структуру `<div id="front" ref={frontRef}>` / `<div id="back" ref={backRef}>`

### Step 4: Add muscle map type setting
- `storage.ts`: ключ `muscle_map_type` со значениями `'male' | 'female'`
- `Settings/index.tsx`: добавить Dropdown для выбора типа карты мышц
- Добавить i18n ключи: `settings.muscleMapType`, `settings.male`, `settings.female`

### Step 5: Switch between maps
- `Home/index.tsx`: читать `storage.get('muscle_map_type', 'male')` и рендерить `MusclesMap` или `MusclesMapFemale`
- `ExerciseForm` (если MusclesMap используется для выбора мышц): тот же switch

### Step 6: Propagate setting via props or context
Вариант A: читать из `storage` в каждом месте (просто, но не реактивно)
Вариант B: Zustand store для настроек (реактивно, но overhead)
**Рекомендация**: Вариант A + перезагрузка при смене (как с темой/языком)

## Acceptance Criteria
- [x] В Settings есть выбор "Muscle map: Male / Female"
- [x] При выборе Female отображается женский силуэт на Home
- [x] Все группы мышц подсвечиваются корректно на женской карте
- [x] Клик по мышце работает на женской карте
- [x] Настройка сохраняется в localStorage и переживает перезагрузку
- [x] i18n ключи добавлены для всех поддерживаемых языков (9 языков)
- [ ] Проверить визуально в браузере

## Notes
- Женские SVG большие (~28k и ~23k tokens) — inline в TSX будет ~600 строк. Это ОК, мужской такой же.
- Если MusclesMap используется в ExerciseForm для выбора мышц — там тоже нужно переключение.
- SVG файлы из задачи (`front.svg`, `back.svg`) — исходники, НЕ копировать в src as-is, нужно адаптировать под JSX.
