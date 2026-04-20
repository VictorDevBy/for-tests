(() => {
  const tg = window.Telegram?.WebApp;

  const isEmptyValue = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  };

  const flattenObject = (obj, parentKey = '', out = {}) => {
    if (!obj || typeof obj !== 'object') return out;

    Object.entries(obj).forEach(([key, value]) => {
      const path = parentKey ? `${parentKey}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        flattenObject(value, path, out);
      } else if (!isEmptyValue(value)) {
        out[path] = value;
      }
    });

    return out;
  };

  const getWebAppSnapshot = () => {
    if (!tg) return {};

    const candidateFields = [
      'version',
      'platform',
      'colorScheme',
      'themeParams',
      'isExpanded',
      'viewportHeight',
      'viewportStableHeight',
      'headerColor',
      'backgroundColor',
      'isClosingConfirmationEnabled',
      'isVerticalSwipesEnabled',
      'safeAreaInset',
      'contentSafeAreaInset',
      'initData',
      'initDataUnsafe'
    ];

    const snapshot = {};

    candidateFields.forEach((field) => {
      try {
        const value = tg[field];
        if (typeof value !== 'function' && !isEmptyValue(value)) {
          snapshot[field] = value;
        }
      } catch (_err) {
        // Ignore inaccessible fields.
      }
    });

    return snapshot;
  };

  const section = (title, data) => {
    if (!data || Object.keys(data).length === 0) return null;

    const wrapper = document.createElement('section');
    wrapper.className = 'card';

    const heading = document.createElement('h2');
    heading.textContent = title;
    wrapper.appendChild(heading);

    const table = document.createElement('table');

    Object.entries(data).forEach(([key, value]) => {
      if (isEmptyValue(value)) return;

      const row = document.createElement('tr');

      const keyCell = document.createElement('td');
      keyCell.className = 'key';
      keyCell.textContent = key;

      const valueCell = document.createElement('td');
      valueCell.className = 'value';
      valueCell.textContent = Array.isArray(value)
        ? value.join(', ')
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value);

      row.appendChild(keyCell);
      row.appendChild(valueCell);
      table.appendChild(row);
    });

    if (!table.rows.length) return null;

    wrapper.appendChild(table);
    return wrapper;
  };

  const injectStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --bg: #0f172a;
        --card: #1e293b;
        --text: #e2e8f0;
        --subtle: #94a3b8;
        --line: #334155;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 16px;
        font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        background: var(--bg);
        color: var(--text);
      }
      main {
        max-width: 980px;
        margin: 0 auto;
        display: grid;
        gap: 14px;
      }
      .card {
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 12px;
      }
      h1, h2 {
        margin: 0 0 10px;
      }
      h1 { font-size: 20px; }
      h2 { font-size: 16px; color: var(--subtle); }
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      td {
        border-top: 1px solid var(--line);
        padding: 8px;
        vertical-align: top;
        word-break: break-word;
      }
      td.key {
        width: 40%;
        color: var(--subtle);
      }
      .note {
        color: var(--subtle);
        font-size: 13px;
      }
    `;
    document.head.appendChild(style);
  };

  const render = () => {
    injectStyles();

    const main = document.createElement('main');
    const titleCard = document.createElement('section');
    titleCard.className = 'card';

    const title = document.createElement('h1');
    title.textContent = 'Информация из Telegram Mini App API';

    const note = document.createElement('p');
    note.className = 'note';
    note.textContent = tg
      ? 'Показываются только непустые поля, которые доступны в текущей сессии Mini App.'
      : 'Telegram WebApp API не найден. Откройте страницу внутри Telegram Mini App.';

    titleCard.appendChild(title);
    titleCard.appendChild(note);
    main.appendChild(titleCard);

    if (tg) {
      try {
        tg.ready();
        tg.expand();
      } catch (_err) {
        // Ignore if not supported in current context.
      }

      const snapshot = getWebAppSnapshot();

      const general = flattenObject({
        version: snapshot.version,
        platform: snapshot.platform,
        colorScheme: snapshot.colorScheme,
        viewportHeight: snapshot.viewportHeight,
        viewportStableHeight: snapshot.viewportStableHeight,
        isExpanded: snapshot.isExpanded,
        headerColor: snapshot.headerColor,
        backgroundColor: snapshot.backgroundColor,
        isClosingConfirmationEnabled: snapshot.isClosingConfirmationEnabled,
        isVerticalSwipesEnabled: snapshot.isVerticalSwipesEnabled
      });

      const theme = flattenObject({
        themeParams: snapshot.themeParams,
        safeAreaInset: snapshot.safeAreaInset,
        contentSafeAreaInset: snapshot.contentSafeAreaInset
      });

      const initUnsafe = flattenObject(snapshot.initDataUnsafe || {});

      const sections = [
        section('WebApp: общие поля', general),
        section('WebApp: тема и safe area', theme),
        section('initDataUnsafe (пользователь, чат, устройство, контекст)', initUnsafe)
      ].filter(Boolean);

      sections.forEach((s) => main.appendChild(s));
    }

    document.body.appendChild(main);
  };

  render();
})();
