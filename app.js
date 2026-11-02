function showError(message) {
  document.body.dataset.state = 'error';
  document.querySelector('#error-message').textContent = message;
  document.querySelector('#error').hidden = false;
}

document.querySelector('#retry').addEventListener('click', () => location.reload());

window.EJS_player = '#game';
window.EJS_core = 'snes9x';
window.EJS_gameUrl = 'roms/super-mario-world.smc';
window.EJS_gameName = 'Super Mario World';
window.EJS_language = 'pt-BR';
window.EJS_settingsLanguage = true;
window.EJS_startOnLoaded = true;
window.EJS_threads = false;
window.EJS_forceLegacyCores = true;
window.EJS_color = '#373737';
window.EJS_backgroundColor = '#000000';
window.EJS_volume = 0.6;
window.EJS_Buttons = { cheat: false, netplay: false, screenRecord: false, exitEmulation: false };
window.EJS_defaultOptions = {
  'save-state-location': 'browser',
  'save-save-interval': '5',
  'video-filter': 'nearest',
};
window.EJS_defaultControls = {
  0: {
    0: { value: 'k', value2: 'BUTTON_2' },
    1: { value: 'j', value2: 'BUTTON_4' },
    2: { value: 'shift', value2: 'SELECT' },
    3: { value: 'enter', value2: 'START' },
    4: { value: 'w', value2: 'DPAD_UP' },
    5: { value: 's', value2: 'DPAD_DOWN' },
    6: { value: 'a', value2: 'DPAD_LEFT' },
    7: { value: 'd', value2: 'DPAD_RIGHT' },
    8: { value: 'l', value2: 'BUTTON_1' },
    9: { value: 'i', value2: 'BUTTON_3' },
    10: { value: 'q', value2: 'LEFT_TOP_SHOULDER' },
    11: { value: 'e', value2: 'RIGHT_TOP_SHOULDER' },
  },
  1: {}, 2: {}, 3: {},
};

window.EJS_ready = () => {
  // Upgrade the original bundled keyboard layout without discarding saves or custom mappings.
  try {
    const key = EJS_emulator.getLocalStorageKey();
    const saved = JSON.parse(localStorage.getItem(key));
    const controls = saved?.controlSettings?.[0];
    const oldKeys = { 0: 90, 1: 65, 4: 38, 5: 40, 6: 37, 7: 39, 8: 88, 9: 83 };
    if (controls && Object.entries(oldKeys).every(([button, value]) => controls[button]?.value === value)) {
      for (const button of Object.keys(oldKeys)) {
        controls[button].value = EJS_defaultControls[0][button].value.toUpperCase().charCodeAt(0);
      }
      localStorage.setItem(key, JSON.stringify(saved));
    }
  } catch {} // Storage can be unavailable in private browsing.

  // Auto-start skips the touch on the emulator's usual start button.
  EJS_emulator.touch = EJS_emulator.hasTouchScreen;
  // Keep video running while the browser waits for permission to play audio.
  EJS_emulator.on('saveDatabaseLoaded', fs => {
    const config = '/home/web_user/.config/retroarch/retroarch.cfg';
    fs.writeFile(config, fs.readFile(config, { encoding: 'utf8' }) + '\naudio_sync = false\n');
  });
  // Safari's audio prompt is unnecessary: the first key or touch unlocks audio.
  EJS_emulator.checkStarted = () => {};
};

window.EJS_onGameStart = () => {
  document.querySelector('#error').hidden = true;
  document.body.dataset.state = 'ready';
  EJS_emulator.menu.close();
  document.querySelectorAll('.b_l').forEach(button => { button.textContent = 'L'; });
  document.querySelectorAll('.b_r').forEach(button => { button.textContent = 'R'; });
  EJS_emulator.elements.bottomBar.settings[0][0].setAttribute('aria-label', 'Ajustes');
  document.querySelector('#game canvas')?.setAttribute('aria-label', 'Super Mario World');
  document.querySelector('#game').focus({ preventScroll: true });
};

function unlockAudio() {
  if (!window.EJS_emulator?.started) return;
  const contexts = new Set(EJS_emulator.Module.AL?.currentCtx?.sources.filter(Boolean).map(source => source.gain.context));
  Promise.all([...contexts].map(context => context.resume())).then(() => {
    if (!contexts.size) return;
    document.removeEventListener('keydown', unlockAudio, true);
    document.removeEventListener('pointerdown', unlockAudio, true);
  }).catch(() => {}); // A rejected unlock is retried on the next user gesture.
}
document.addEventListener('keydown', unlockAudio, true);
document.addEventListener('pointerdown', unlockAudio, true);

if (location.protocol === 'file:') {
  showError('Abra INICIAR.cmd na pasta do projeto. O navegador precisa de um endereÃƒÂ§o HTTP para carregar o emulador.');
} else {
  const loader = document.createElement('script');
  loader.src = 'vendor/emulatorjs/loader.js';
  loader.onerror = () => showError('NÃƒÂ£o foi possÃƒÂ­vel carregar o emulador. Verifique se a pasta vendor estÃƒÂ¡ junto do site e recarregue a pÃƒÂ¡gina.');
  document.body.appendChild(loader);
  setTimeout(() => {
    if (!window.EJS_emulator?.started) {
      showError('O carregamento nÃƒÂ£o terminou. Verifique a conexÃƒÂ£o e os arquivos do site e tente recarregar a pÃƒÂ¡gina.');
    }
  }, 60000);
}

// Flush cartridge SRAM when leaving; IndexedDB already restores it on boot.
function persistNativeSave() {
  if (!window.EJS_emulator?.started) return;
  EJS_emulator.gameManager.saveSaveFiles();
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') persistNativeSave();
});
window.addEventListener('pagehide', persistNativeSave);
