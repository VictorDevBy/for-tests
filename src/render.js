const STYLE_ID = 'tg-miniapp-style';

function isEmptyValue(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

function toDisplayValue(value) {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return String(value);
}

function createDataTable(flatData) {
  const entries = Object.entries(flatData || {})
    .filter(([, value]) => !isEmptyValue(value))
    .sort(([a], [b]) => a.localeCompare(b));

  if (!entries.length) return null;

  const table = document.createElement('table');

  entries.forEach(([key, value]) => {
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

  return table;
}

function createSection(title, data) {
  const table = createDataTable(data);
  if (!table) return null;

  const section = document.createElement('section');
  section.className = 'card';

  const heading = document.createElement('h2');
  heading.textContent = title;

  section.append(heading, table);
  return section;
}

function createHeaderCard(telegramAvailable, projectVersion) {
  const card = document.createElement('section');
  card.className = 'card';

  const title = document.createElement('h1');
  title.textContent = 'Telegram Mini App • Runtime Inspector';

  const subtitle = document.createElement('p');
  subtitle.className = 'note';
  subtitle.textContent = telegramAvailable
    ? 'Отображаются только непустые значения, доступные в текущей сессии Mini App.'
    : 'Telegram WebApp API не найден. Откройте этот URL через кнопку mini app в Telegram-боте.';

  const version = document.createElement('p');
  version.className = 'version';
  version.textContent = `Версия проекта: ${projectVersion || 'unknown'}`;

  card.append(title, subtitle, version);
  return card;
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
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
    main.app {
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
    h1, h2 { margin: 0 0 10px; }
    h1 { font-size: 20px; }
    h2 { font-size: 16px; color: var(--subtle); }
    .note {
      margin: 0;
      color: var(--subtle);
    }
    .version {
      margin: 8px 0 0;
      font-weight: 600;
      color: var(--text);
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
}

export function renderApp(root, model) {
  ensureStyles();

  root.textContent = '';

  const container = document.createElement('main');
  container.className = 'app';

  const telegram = model.telegram || {};
  container.appendChild(createHeaderCard(Boolean(telegram.available), model.projectVersion));

  if (telegram.available) {
    const telegramSections = [
      createSection('WebApp: общая информация', telegram.webAppInfo),
      createSection('WebApp: UI, кнопки, тема, safe-area', telegram.visualInfo),
      createSection('initDataUnsafe: пользователь / чат / контекст запуска', telegram.contextInfo),
      createSection('initData: raw + parsed query-параметры (best effort)', telegram.initDataInfo),
      createSection('Прочие доступные поля WebApp', telegram.extraInfo)
    ].filter(Boolean);

    telegramSections.forEach((section) => container.appendChild(section));
  }

  const clientSection = createSection('Client environment', model.client || {});
  if (clientSection) {
    container.appendChild(clientSection);
  }

  root.appendChild(container);
}
