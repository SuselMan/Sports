# Domain: Fitness Tracking

## Core Entities

### Exercise (Упражнение)
Пользовательский шаблон упражнения. Два типа:
- **REPS** — на повторения (жим лёжа, приседания)
- **TIME** — на время (планка, бег)

Привязывается к одной или нескольким группам мышц из 35+ предопределённых.

### ExerciseRecord (Запись/Подход)
Конкретное выполнение упражнения. Плоский список без сущности "тренировка" — группировка по дате.
- Для REPS: `repsAmount` (количество повторений)
- Для TIME: `durationMs` (длительность в мс)
- Общие: `weight` (вес), `rpe` (субъективная нагрузка 1-10), `restSec` (отдых), `note`, `date`

### Metric (Метрика)
Произвольный числовой показатель для отслеживания (вес тела, обхват бицепса, пульс покоя).
Единицы: kg, lb, cm, mm, percent, bpm, kcal, count или custom.

### MetricRecord (Запись метрики)
Значение метрики на дату: `value`, `date`, `note`.

### Muscles (Группы мышц)
38 предопределённых групп мышц (Neck, UpperTrapezius, Lats, GluteusMaximus, Bicep, Tricep и т.д.).
Каждая группа маппится на SVG-селекторы для визуализации на карте мышц (фронт и бэк тела).

## Key Domain Concepts

### Карта мышц
SVG-визуализация тела человека (перед + спина). Мышцы подсвечиваются цветом в зависимости от того, были ли они задействованы в упражнениях за выбранный период.

### e1RM (Estimated 1-Rep Max)
Расчётный максимум на одно повторение. Формула: `weight * (1 + reps / 30)`. Используется в статистике.

### RPE (Rate of Perceived Exertion)
Шкала субъективной нагрузки от 1 до 10. Записывается опционально с каждым подходом.

## Data Flow
```
User creates Exercise → selects muscles → logs ExerciseRecords daily
                                              ↓
                                    MusclesMap highlights trained muscles
                                    Statistics shows progress charts
```
