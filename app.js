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
  'save-save-interval': '30',
  'video-filter': 'nearest',
};
window.EJS_defaultControls = {
  0: {
    0: { value: 'z', value2: 'BUTTON_2' },
    1: { value: 'a', value2: 'BUTTON_4' },
    2: { value: 'shift', value2: 'SELECT' },
    3: { value: 'enter', value2: 'START' },
    4: { value: 'up arrow', value2: 'DPAD_UP' },
    5: { value: 'down arrow', value2: 'DPAD_DOWN' },
    6: { value: 'left arrow', value2: 'DPAD_LEFT' },
    7: { value: 'right arrow', value2: 'DPAD_RIGHT' },
    8: { value: 'x', value2: 'BUTTON_1' },
    9: { value: 's', value2: 'BUTTON_3' },
    10: { value: 'q', value2: 'LEFT_TOP_SHOULDER' },
    11: { value: 'e', value2: 'RIGHT_TOP_SHOULDER' },
  },
  1: {}, 2: {}, 3: {},
};

window.EJS_ready = () => {
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
  showError('Abra INICIAR.cmd na pasta do projeto. O navegador precisa de um endereço HTTP para carregar o emulador.');
} else {
  const loader = document.createElement('script');
  loader.src = 'vendor/emulatorjs/loader.js';
  loader.onerror = () => showError('Não foi possível carregar o emulador. Verifique se a pasta vendor está junto do site e recarregue a página.');
  document.body.appendChild(loader);
  setTimeout(() => {
    if (!window.EJS_emulator?.started) {
      showError('O carregamento não terminou. Verifique a conexão e os arquivos do site e tente recarregar a página.');
    }
  }, 60000);
}
