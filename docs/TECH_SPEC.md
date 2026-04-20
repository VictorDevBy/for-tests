# TECH SPEC

## 1. Runtime
- Платформа: Telegram Mini App.
- Язык: JavaScript (ES modules), без state-схем и без TypeScript.

## 2. Источники данных

### 2.1 Telegram source
Источник: `window.Telegram.WebApp`.
Снимаются текущие значения:
- `initData`
- `initDataUnsafe`
- `colorScheme`
- `themeParams`
- `viewportHeight`
- `viewportStableHeight`
- `isExpanded`
- `platform`
- `version`
- `isClosingConfirmationEnabled`
- `headerColor`
- `backgroundColor`

События обновления:
- `themeChanged`
- `viewportChanged`
- `safeAreaChanged`

### 2.2 Client environment source
Источник: браузерные API без разрешений.
Группы полей:
- device/browser (`navigator.*`)
- screen/viewport (`screen.*`, `window.*`)
- locale/time (`Intl`, timezone offset)
- network (Connection API при наличии)
- page context (`location`, `referrer`)
- feature support (storage, indexedDB, serviceWorker, webgl)

## 3. Рендер
- Раздел 1: `Telegram data`
- Раздел 2: `Client environment`
- Данные рендерятся динамически в key/value сетке.
- Вложенные объекты разворачиваются в dotted-keys.

## 4. Ограничения
- Публичный IP на клиенте напрямую не определяется надёжно — не включён.
- Геолокация, камера, микрофон не запрашиваются.
- Хранение данных отсутствует: только отображение в runtime.
