function normalizeValue(value) {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function flattenObject(obj, parentKey = '') {
  if (!obj || typeof obj !== 'object') {
    return [{ key: parentKey || 'value', value: obj }];
  }

  const rows = [];

  Object.entries(obj).forEach(([key, value]) => {
    const nextKey = parentKey ? `${parentKey}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      rows.push(...flattenObject(value, nextKey));
    } else {
      rows.push({ key: nextKey, value });
    }
  });

  return rows;
}

function renderSection(title, data) {
  const rows = flattenObject(data);

  const section = document.createElement('section');
  section.className = 'section';

  const h2 = document.createElement('h2');
  h2.textContent = title;
  section.appendChild(h2);

  const grid = document.createElement('div');
  grid.className = 'grid';

  rows.forEach(({ key, value }) => {
    const k = document.createElement('div');
    k.className = 'k';
    k.textContent = key;

    const v = document.createElement('div');
    v.className = 'v';
    v.textContent = normalizeValue(value);

    grid.append(k, v);
  });

  section.appendChild(grid);
  return section;
}

export function renderApp(root, model) {
  root.innerHTML = '';

  const container = document.createElement('main');
  container.className = 'app';

  container.appendChild(renderSection('Telegram data', model.telegram));
  container.appendChild(renderSection('Client environment', model.client));

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `Updated: ${new Date().toISOString()}`;
  container.appendChild(meta);

  root.appendChild(container);
}
