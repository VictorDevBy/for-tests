> Версия проекта: 1.0.1

# CONSOLIDATED TASK

## Правило версионирования
- В верхней строке каждого файла в `docs/` обязательно указывать `Версия проекта`.
- При любом изменении документации версия проекта должна быть увеличена.

## Цель
Сделать Telegram Mini App, где UI создаётся динамически в JS и отображает:
1) данные Telegram WebApp API;
2) данные client environment без запросов разрешений.

## Границы
- Только JavaScript.
- Без `state.js`.
- Без бэкенда и без сохранения данных.
- Только отображение данных по секциям.

## Итоговая структура
- `index.html`
- `src/app.js`
- `src/telegram-miniapp.js`
- `src/client-environment.js`
- `src/render.js`
- `docs/ARCHITECTURE.md`
- `docs/TECH_SPEC.md`
- `docs/CONSOLIDATED_TASK.md`

## Критерии готовности
- Telegram API инициализируется без ошибок вне Telegram (graceful fallback).
- В Telegram WebView данные Telegram отображаются динамически.
- Client environment данные отображаются динамически.
- Разделы отображения: `Telegram data`, `Client environment`.
- При resize/theme/viewport событии интерфейс обновляется.
- Вложенные поля отображаются в человекочитаемом key/value виде.

## Checklist приёмки
- [ ] Открытие в браузере не падает.
- [ ] Открытие в Telegram Mini App показывает Telegram данные.
- [ ] Пустые/недоступные значения отображаются безопасно (`—`).
- [ ] Нет лишних файлов и неиспользуемого слоя state.
- [ ] Документация соответствует фактической реализации.
