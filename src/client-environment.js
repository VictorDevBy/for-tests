function checkSupport(fn) {
  try {
    return fn();
  } catch {
    return null;
  }
}

export function collectClientEnvironment() {
  const nav = window.navigator;
  const screen = window.screen;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  return {
    userAgent: nav.userAgent || null,
    platform: nav.platform || null,
    language: nav.language || null,
    languages: Array.isArray(nav.languages) ? nav.languages : [],
    hardwareConcurrency: nav.hardwareConcurrency ?? null,
    deviceMemory: nav.deviceMemory ?? null,
    maxTouchPoints: nav.maxTouchPoints ?? 0,
    cookieEnabled: nav.cookieEnabled ?? null,
    doNotTrack: nav.doNotTrack || null,

    screenWidth: screen?.width ?? null,
    screenHeight: screen?.height ?? null,
    availWidth: screen?.availWidth ?? null,
    availHeight: screen?.availHeight ?? null,
    colorDepth: screen?.colorDepth ?? null,
    pixelDepth: screen?.pixelDepth ?? null,
    devicePixelRatio: window.devicePixelRatio ?? null,

    viewportWidth: window.innerWidth ?? null,
    viewportHeight: window.innerHeight ?? null,
    timeZone: checkSupport(() => Intl.DateTimeFormat().resolvedOptions().timeZone),
    timezoneOffsetMinutes: new Date().getTimezoneOffset(),

    online: nav.onLine ?? null,
    connectionEffectiveType: connection?.effectiveType ?? null,
    connectionRtt: connection?.rtt ?? null,
    connectionDownlink: connection?.downlink ?? null,
    saveData: connection?.saveData ?? null,

    url: window.location.href,
    referrer: document.referrer || null,

    features: {
      localStorage: checkSupport(() => !!window.localStorage),
      sessionStorage: checkSupport(() => !!window.sessionStorage),
      indexedDB: !!window.indexedDB,
      serviceWorker: 'serviceWorker' in nav,
      webgl: checkSupport(() => {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      })
    }
  };
}
