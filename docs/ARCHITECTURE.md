# ARCHITECTURE

## Цель
Приложение работает как Telegram Mini App и динамически отображает:
1. данные из Telegram WebApp API;
2. данные окружения клиента, доступные без запросов разрешений.

## Слои
- `src/telegram-miniapp.js` — интеграция с Telegram Mini App API (инициализация, события, чтение данных).
- `src/client-environment.js` — сбор client-side данных окружения.
- `src/render.js` — единый рендер секций и полей.
- `src/app.js` — orchestration: собрать оба источника и отрисовать.

## Принципы
- Основная логика динамическая, HTML — контейнер.
- Данные Telegram читаются в текущем состоянии API на момент рендера.
- Отображение по секциям: `Telegram data`, `Client environment`.
- Fallback для недоступных API: `null`/`—`, без падений.

## Контекст запуска
Целевой runtime: Telegram Mini App (WebView в Telegram).
