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

const { webApp } = initTelegram();

function buildModel() {
  return {
    telegram: collectTelegramData(webApp),
    client: collectClientEnvironment()
  };
}

function update() {
  renderApp(root, buildModel());
}

update();

attachTelegramListeners(webApp, update);
window.addEventListener('resize', update);
