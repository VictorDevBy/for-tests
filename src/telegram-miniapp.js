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

function getTelegramWebApp() {
  return window?.Telegram?.WebApp ?? null;
}

function isPrimitive(value) {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

function isEmptyValue(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

function safelyRead(getter) {
  try {
    return getter();
  } catch {
    return undefined;
  }
}

function flatten(input, prefix = '', output = {}) {
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
}

function parseJsonIfPossible(value) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function parseInitData(initData) {
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
}

function getWebAppSnapshot(webApp) {
  if (!webApp) return {};

  const snapshot = {};

  WEBAPP_SCALAR_FIELDS.forEach((field) => {
    const value = safelyRead(() => webApp[field]);
    if (!isEmptyValue(value)) {
      snapshot[field] = value;
    }
  });

  WEBAPP_OBJECT_FIELDS.forEach((field) => {
    const value = safelyRead(() => webApp[field]);
    if (value && typeof value === 'object' && !isEmptyValue(value)) {
      snapshot[field] = value;
    }
  });

  const dynamicKeys = Array.from(
    new Set([...Object.keys(webApp), ...Object.getOwnPropertyNames(webApp)])
  );

  dynamicKeys
    .filter((key) => !FILTERED_KEYS.has(key) && !(key in snapshot))
    .sort()
    .forEach((key) => {
      const value = safelyRead(() => webApp[key]);
      if (typeof value === 'function' || isEmptyValue(value)) return;
      snapshot[key] = value;
    });

  return snapshot;
}

function splitSnapshot(snapshot) {
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
}

function bindThemeToCssVars(webApp) {
  if (!webApp?.themeParams) return;
  Object.entries(webApp.themeParams).forEach(([key, val]) => {
    if (typeof val === 'string' && val) {
      document.documentElement.style.setProperty(`--tg-theme-${key}`, val);
    }
  });
}

export function initTelegram() {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    return { webApp: null, available: false };
  }

  safelyRead(() => webApp.ready());
  safelyRead(() => webApp.expand());
  bindThemeToCssVars(webApp);

  return { webApp, available: true };
}

export function collectTelegramData(webApp) {
  if (!webApp) {
    return {
      available: false,
      message: 'Telegram WebApp API не найден. Откройте Mini App через Telegram-бота.'
    };
  }

  const snapshot = getWebAppSnapshot(webApp);
  const sections = splitSnapshot(snapshot);

  return {
    available: true,
    ...sections
  };
}

export function attachTelegramListeners(webApp, onChange) {
  if (!webApp || typeof onChange !== 'function' || typeof webApp.onEvent !== 'function') {
    return () => {};
  }

  const handlers = [
    ['themeChanged', onChange],
    ['viewportChanged', onChange],
    ['safeAreaChanged', onChange]
  ];

  handlers.forEach(([event, cb]) => webApp.onEvent(event, cb));

  return () => {
    if (typeof webApp.offEvent !== 'function') return;
    handlers.forEach(([event, cb]) => webApp.offEvent(event, cb));
  };
}
