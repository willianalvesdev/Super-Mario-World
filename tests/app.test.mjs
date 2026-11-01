import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../app.js', import.meta.url), 'utf8');

function boot(protocol = 'http:') {
  const nodes = new Map();
  for (const selector of ['#error-message', '#error', '#retry', '#game', '#game canvas']) {
    nodes.set(selector, {
      hidden: selector === '#error', textContent: '', listeners: {},
      addEventListener(type, callback) { this.listeners[type] = callback; },
      setAttribute() {}, focus() {},
    });
  }
  const scripts = [], timers = new Map(), listeners = new Map();
  let reloads = 0, nextTimer = 0;
  const context = {
    document: {
      body: { dataset: {}, appendChild: node => scripts.push(node) },
      querySelector: selector => nodes.get(selector),
      createElement: tag => ({ tagName: tag }),
      addEventListener: (type, callback, capture) => listeners.set(type, { callback, capture }),
      removeEventListener(type, callback, capture) {
        const listener = listeners.get(type);
        if (listener?.callback === callback && listener.capture === capture) listeners.delete(type);
      },
    },
    location: { protocol, reload() { reloads++; } },
    matchMedia: () => ({ matches: false }),
    navigator: { maxTouchPoints: 0 },
    setTimeout(callback) { timers.set(++nextTimer, callback); return nextTimer; },
    clearTimeout: id => timers.delete(id),
  };
  context.window = context;
  vm.runInNewContext(source, context, { filename: 'app.js' });
  return { context, nodes, scripts, timers, listeners, reloads: () => reloads };
}

test('opening index directly explains the launcher and never requests the core', () => {
  const app = boot('file:');
  assert.equal(app.scripts.length, 0);
  assert.equal(app.nodes.get('#error').hidden, false);
  assert.match(app.nodes.get('#error-message').textContent, /INICIAR\.cmd/);
  app.nodes.get('#retry').listeners.click();
  assert.equal(app.reloads(), 1);
});

test('HTTP boot loads the emulator automatically and reports a missing loader', () => {
  const app = boot();
  assert.equal(app.context.EJS_startOnLoaded, true);
  assert.equal(app.scripts.length, 1);
  assert.equal(app.scripts[0].src, 'vendor/emulatorjs/loader.js');
  app.scripts[0].onerror();
  assert.equal(app.nodes.get('#error').hidden, false);
  assert.match(app.nodes.get('#error-message').textContent, /vendor/);
});

test('a slow load can recover from the timeout without leaving an error over the game', () => {
  const app = boot();
  for (const callback of app.timers.values()) callback();
  assert.equal(app.nodes.get('#error').hidden, false);
  app.context.EJS_emulator = { started: true, menu: { close() {} }, elements: { bottomBar: { settings: [[{ setAttribute() {} }]] } } };
  app.context.EJS_onGameStart();
  assert.equal(app.context.document.body.dataset.state, 'ready');
  assert.equal(app.nodes.get('#error').hidden, true);
});

test('a running game is not replaced by the loading-timeout message', () => {
  const app = boot();
  app.context.EJS_emulator = { started: true, menu: { close() {} }, elements: { bottomBar: { settings: [[{ setAttribute() {} }]] } } };
  app.context.EJS_onGameStart();
  for (const callback of app.timers.values()) callback();
  assert.equal(app.nodes.get('#error').hidden, true);
  assert.equal(app.context.document.body.dataset.state, 'ready');
});

test('autostart disables blocking audio sync without losing the generated core configuration', () => {
  const app = boot();
  const events = new Map();
  app.context.EJS_emulator = { on: (name, callback) => events.set(name, callback) };
  app.context.EJS_ready();
  const path = '/home/web_user/.config/retroarch/retroarch.cfg';
  const original = 'video_vsync = true\nsavefile_directory = "/data/saves"\n';
  let configuration;
  events.get('saveDatabaseLoaded')({
    readFile(file) { assert.equal(file, path); return original; },
    writeFile(file, content) { assert.equal(file, path); configuration = content; },
  });
  assert.ok(configuration.startsWith(original));
  assert.match(configuration, /\naudio_sync = false\n/);
});

test('audio unlock captures game input and retries rejected permissions before removing listeners', async () => {
  const app = boot();
  for (const type of ['keydown', 'pointerdown']) assert.equal(app.listeners.get(type).capture, true);
  app.listeners.get('keydown').callback(); // Input before the core starts must remain usable later.
  let attempts = 0;
  const audio = {
    resume() {
      attempts++;
      return attempts === 1 ? Promise.reject(new Error('Not allowed yet')) : Promise.resolve();
    },
  };
  app.context.EJS_emulator = {
    started: true,
    Module: { AL: { currentCtx: { sources: [null, { gain: { context: audio } }, { gain: { context: audio } }] } } },
  };
  app.listeners.get('keydown').callback();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(attempts, 1);
  assert.equal(app.listeners.size, 2);
  app.listeners.get('pointerdown').callback();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(attempts, 2);
  assert.equal(app.listeners.size, 0);
});
