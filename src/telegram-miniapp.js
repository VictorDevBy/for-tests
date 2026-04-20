function safeClone(value) {
  try {
    return structuredClone(value);
  } catch {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return value ?? null;
    }
  }
}

function getTelegramWebApp() {
  return window?.Telegram?.WebApp ?? null;
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

  webApp.ready();
  webApp.expand();
  bindThemeToCssVars(webApp);

  return { webApp, available: true };
}

export function collectTelegramData(webApp) {
  if (!webApp) {
    return {
      available: false,
      reason: 'Telegram WebApp API недоступен в текущем окружении'
    };
  }

  return {
    available: true,
    initData: webApp.initData || null,
    initDataUnsafe: safeClone(webApp.initDataUnsafe || null),
    colorScheme: webApp.colorScheme || null,
    themeParams: safeClone(webApp.themeParams || null),
    viewportHeight: webApp.viewportHeight ?? null,
    viewportStableHeight: webApp.viewportStableHeight ?? null,
    isExpanded: webApp.isExpanded ?? null,
    platform: webApp.platform || null,
    version: webApp.version || null,
    isClosingConfirmationEnabled: webApp.isClosingConfirmationEnabled ?? null,
    headerColor: webApp.headerColor || null,
    backgroundColor: webApp.backgroundColor || null
  };
}

export function attachTelegramListeners(webApp, onChange) {
  if (!webApp || typeof onChange !== 'function') return () => {};

  const handlers = [
    ['themeChanged', onChange],
    ['viewportChanged', onChange],
    ['safeAreaChanged', onChange]
  ];

  handlers.forEach(([event, cb]) => webApp.onEvent(event, cb));

  return () => {
    handlers.forEach(([event, cb]) => webApp.offEvent(event, cb));
  };
}
