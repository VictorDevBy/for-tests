(() => {
  const tg = window.Telegram?.WebApp;

  const ROOT_ID = 'tg-miniapp-root';

  const WEBAPP_SCALAR_FIELDS = [
    'version',
    'platform',
    'colorScheme',
    'isExpanded',
    'viewportHeight',
    'viewportStableHeight',
    'headerColor',
    'backgroundColor',
    'isClosingConfirmationEnabled',
    'isVerticalSwipesEnabled',
    'initData'
  ];

  const WEBAPP_OBJECT_FIELDS = [
    'themeParams',
    'safeAreaInset',
    'contentSafeAreaInset',
    'initDataUnsafe',
    'MainButton',
    'SecondaryButton',
    'BackButton',
    'SettingsButton',
    'BiometricManager'
  ];

  const FILTERED_KEYS = new Set([
    'offEvent',
    'onEvent',
    'sendData',
    'openLink',
    'openTelegramLink',
    'showPopup',
    'showAlert',
    'showConfirm',
    'CloudStorage',
    'HapticFeedback'
  ]);

  const isPrimitive = (value) => value === null || ['string', 'number', 'boolean'].includes(typeof value);

  const isEmptyValue = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  };

  const safelyRead = (getter) => {
    try {
      return getter();
    } catch (_error) {
      return undefined;
    }
  };

  const flatten = (input, prefix = '', output = {}) => {
    if (isPrimitive(input) || Array.isArray(input)) {
      if (!isEmptyValue(input) && prefix) {
        output[prefix] = input;
      }
      return output;
    }

    if (!input || typeof input !== 'object') {
      return output;
    }

    Object.entries(input).forEach(([key, value]) => {
      if (FILTERED_KEYS.has(key)) return;

      const path = prefix ? `${prefix}.${key}` : key;

      if (isPrimitive(value) || Array.isArray(value)) {
        if (!isEmptyValue(value)) {
          output[path] = value;
        }
        return;
      }

      if (value && typeof value === 'object') {
        flatten(value, path, output);
      }
    });

    return output;
  };

  const parseJsonIfPossible = (value) => {
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch (_error) {
      return value;
    }
  };

  const parseInitData = (initData) => {
    if (!initData || typeof initData !== 'string') return {};

    const query = new URLSearchParams(initData);
    const result = {};

    query.forEach((value, key) => {
      const parsedValue = parseJsonIfPossible(value);
      if (!isEmptyValue(parsedValue)) {
        result[key] = parsedValue;
      }
    });

    return result;
  };

  const getWebAppSnapshot = () => {
    if (!tg) return {};

    const snapshot = {};

    WEBAPP_SCALAR_FIELDS.forEach((field) => {
      const value = safelyRead(() => tg[field]);
      if (!isEmptyValue(value)) {
        snapshot[field] = value;
      }
    });

    WEBAPP_OBJECT_FIELDS.forEach((field) => {
      const value = safelyRead(() => tg[field]);
      if (value && typeof value === 'object' && !isEmptyValue(value)) {
        snapshot[field] = value;
      }
    });

    const dynamicOwnKeys = Object.keys(tg)
      .filter((key) => !FILTERED_KEYS.has(key) && !snapshot[key])
      .sort();

    dynamicOwnKeys.forEach((key) => {
      const value = safelyRead(() => tg[key]);
      if (typeof value === 'function' || isEmptyValue(value)) return;
      snapshot[key] = value;
    });

    return snapshot;
  };

  const toDisplayValue = (value) => {
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
    return String(value);
  };

  const createDataTable = (flatData) => {
    const table = document.createElement('table');
    const sortedEntries = Object.entries(flatData).sort(([a], [b]) => a.localeCompare(b));

    sortedEntries.forEach(([key, value]) => {
      if (isEmptyValue(value)) return;

      const row = document.createElement('tr');

      const keyCell = document.createElement('td');
      keyCell.className = 'key';
      keyCell.textContent = key;

      const valueCell = document.createElement('td');
      valueCell.className = 'value';
      valueCell.textContent = toDisplayValue(value);

      row.append(keyCell, valueCell);
      table.appendChild(row);
    });

    return table.rows.length ? table : null;
  };

  const createSection = (title, data) => {
    const table = createDataTable(data);
    if (!table) return null;

    const section = document.createElement('section');
    section.className = 'card';

    const heading = document.createElement('h2');
    heading.textContent = title;

    section.append(heading, table);
    return section;
  };

  const createHeaderCard = () => {
    const card = document.createElement('section');
    card.className = 'card';

    const title = document.createElement('h1');
    title.textContent = 'Telegram Mini App • Runtime Inspector';

    const subtitle = document.createElement('p');
    subtitle.className = 'note';
    subtitle.textContent = tg
      ? 'Отображаются только непустые значения, доступные в текущей сессии Mini App.'
      : 'Telegram WebApp API не найден. Откройте этот URL через кнопку mini app в Telegram-боте.';

    card.append(title, subtitle);
    return card;
  };

  const ensureStyles = () => {
    if (document.getElementById('tg-miniapp-style')) return;

    const style = document.createElement('style');
    style.id = 'tg-miniapp-style';
    style.textContent = `
      :root {
        --bg: #0b1220;
        --card: #111a2c;
        --text: #e6edf7;
        --subtle: #9fb0cc;
        --line: #223251;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 16px;
        font: 14px/1.45 Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        color: var(--text);
        background: var(--bg);
      }
      main {
        max-width: 1080px;
        margin: 0 auto;
        display: grid;
        gap: 14px;
      }
      .card {
        border: 1px solid var(--line);
        background: var(--card);
        border-radius: 12px;
        padding: 12px;
      }
      h1, h2 {
        margin: 0 0 10px;
      }
      h1 { font-size: 20px; }
      h2 { font-size: 16px; color: var(--subtle); }
      .note {
        margin: 0;
        color: var(--subtle);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      td {
        border-top: 1px solid var(--line);
        padding: 8px;
        vertical-align: top;
        overflow-wrap: anywhere;
      }
      td.key {
        width: 38%;
        color: var(--subtle);
      }
      @media (max-width: 640px) {
        td.key { width: 45%; }
      }
    `;

    document.head.appendChild(style);
  };

  const createRoot = () => {
    const existing = document.getElementById(ROOT_ID);
    if (existing) return existing;

    const main = document.createElement('main');
    main.id = ROOT_ID;
    document.body.appendChild(main);
    return main;
  };

  const splitSnapshot = (snapshot) => {
    const webAppInfo = flatten(
      WEBAPP_SCALAR_FIELDS.reduce((acc, field) => {
        if (!isEmptyValue(snapshot[field])) {
          acc[field] = snapshot[field];
        }
        return acc;
      }, {})
    );

    const visualInfo = flatten({
      themeParams: snapshot.themeParams,
      safeAreaInset: snapshot.safeAreaInset,
      contentSafeAreaInset: snapshot.contentSafeAreaInset,
      MainButton: snapshot.MainButton,
      SecondaryButton: snapshot.SecondaryButton,
      BackButton: snapshot.BackButton,
      SettingsButton: snapshot.SettingsButton
    });

    const contextInfo = flatten(snapshot.initDataUnsafe || {});

    const initDataInfo = flatten({
      initDataRaw: snapshot.initData,
      initDataParsed: parseInitData(snapshot.initData)
    });

    const extraInfo = flatten(
      Object.keys(snapshot).reduce((acc, key) => {
        const known = WEBAPP_SCALAR_FIELDS.includes(key) || WEBAPP_OBJECT_FIELDS.includes(key);
        if (!known) acc[key] = snapshot[key];
        return acc;
      }, {})
    );

    return { webAppInfo, visualInfo, contextInfo, initDataInfo, extraInfo };
  };

  const render = () => {
    ensureStyles();
    const root = createRoot();
    root.textContent = '';
    root.appendChild(createHeaderCard());

    if (!tg) return;

    safelyRead(() => tg.ready());
    safelyRead(() => tg.expand());

    const snapshot = getWebAppSnapshot();
    const { webAppInfo, visualInfo, contextInfo, initDataInfo, extraInfo } = splitSnapshot(snapshot);

    const sections = [
      createSection('WebApp: общая информация', webAppInfo),
      createSection('WebApp: UI, кнопки, тема, safe-area', visualInfo),
      createSection('initDataUnsafe: пользователь / чат / контекст запуска', contextInfo),
      createSection('initData: raw + parsed query-параметры (best effort)', initDataInfo),
      createSection('Прочие доступные поля WebApp', extraInfo)
    ].filter(Boolean);

    sections.forEach((section) => root.appendChild(section));
  };

  const subscribeToUpdates = () => {
    if (!tg?.onEvent) return;

    const rerender = () => render();
    tg.onEvent('themeChanged', rerender);
    tg.onEvent('viewportChanged', rerender);
  };

  render();
  subscribeToUpdates();
})();
