import {
  initTelegram,
  collectTelegramData,
  attachTelegramListeners
} from './telegram-miniapp.js';
import { collectClientEnvironment } from './client-environment.js';
import { renderApp } from './render.js';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Root element #app not found');
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
