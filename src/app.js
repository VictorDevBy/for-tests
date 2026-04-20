import {
  initTelegram,
  collectTelegramData,
  attachTelegramListeners
} from './telegram-miniapp.js';
import { collectClientEnvironment } from './client-environment.js';
import { renderApp } from './render.js';

const ROOT_ID = 'tg-miniapp-root';
const root = document.getElementById(ROOT_ID);

if (!root) {
  throw new Error(`Root element #${ROOT_ID} not found`);
}

let listenersAttached = false;
let detachTelegramListeners = () => {};

function resolveWebApp() {
  const { webApp } = initTelegram();

  if (webApp && !listenersAttached) {
    detachTelegramListeners = attachTelegramListeners(webApp, update);
    listenersAttached = true;
  }

  return webApp;
}

function buildModel() {
  const webApp = resolveWebApp();

  return {
    telegram: collectTelegramData(webApp),
    client: collectClientEnvironment()
  };
}

function update() {
  renderApp(root, buildModel());
}

update();
window.addEventListener('resize', update);

const bootstrapPoll = window.setInterval(() => {
  if (listenersAttached) {
    window.clearInterval(bootstrapPoll);
    return;
  }

  update();
}, 500);

window.addEventListener('beforeunload', () => {
  window.clearInterval(bootstrapPoll);
  detachTelegramListeners();
});
