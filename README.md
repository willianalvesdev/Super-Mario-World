# Super Mario World no navegador

Site estÃ¡tico que executa a ROM fornecida no EmulatorJS 4.2.3 com o nÃºcleo Snes9x. O jogo inicia automaticamente e ocupa a janela inteira, mantendo a proporÃ§Ã£o original do SNES. NÃ£o hÃ¡ tela de entrada ou botÃ£o Jogar.

## Abrir no Windows

DÃª dois cliques em **INICIAR.cmd**. Ele inicia o servidor local e abre **http://127.0.0.1:8080**. Mantenha a janela do servidor aberta enquanto joga. Requer Node.js, jÃ¡ disponÃ­vel no computador utilizado no desenvolvimento. NÃ£o precisa executar `npm install`.

Alternativa: `npm start` e abra o endereÃ§o acima. Use sempre o mesmo endereÃ§o para encontrar os saves desse navegador. Abrir `index.html` por `file://` nÃ£o funciona, pois o navegador bloqueia o carregamento do emulador.

## Controles

| Tecla | Controle do SNES / aÃ§Ã£o |
| --- | --- |
| W A S D | Direcional |
| Enter | Start / pausa do jogo |
| K | B / pular |
| X | A / salto giratÃ³rio |
| J / I | Y / X / correr e segurar |
| Shift | Select |
| Q / E | L / R |

O primeiro toque ou tecla ativa o Ã¡udio, por exigÃªncia do navegador. No celular aparecem os controles de toque. Um controle fÃ­sico pode ser configurado no menu do emulador.

Mova o mouse atÃ© a parte inferior da tela para exibir o menu; no celular, use o botÃ£o de menu. Ali estÃ£o pausa, volume, tela cheia, controles, salvar estado e carregar estado. O menu usa a paleta e a tipografia do My-Portfolio; ele fica oculto durante o jogo.

## Saves

Os estados salvos e os saves originais ficam no armazenamento deste navegador. **Limpar os dados do site apaga esses saves.** O salvamento do cartucho acontece nos pontos oferecidos pelo jogo; salvar estado registra qualquer momento. Nas configuraÃ§Ãµes Ã© possÃ­vel escolher estados em arquivo para fazer backup. Os atalhos de quick save do emulador sÃ£o temporÃ¡rios, na memÃ³ria da sessÃ£o.

## Arquivos e verificaÃ§Ã£o

- `index.html`, `styles.css`, `app.js`: pÃ¡gina e configuraÃ§Ã£o do emulador.
- `assets/mario-world.svg`: Ã­cone fornecido, usado no favicon e no manifesto.
- `roms/super-mario-world.smc`: cÃ³pia da ROM fornecida.
- `vendor/emulatorjs`: distribuiÃ§Ã£o fixada do emulador, nÃºcleo, traduÃ§Ã£o e licenÃ§as.
- `server.mjs`: servidor local sem dependÃªncias, limitado a `127.0.0.1`.
- `npm test`: testes do servidor, inicializaÃ§Ã£o automÃ¡tica, tratamento de falhas e desbloqueio do Ã¡udio.

NÃ£o hÃ¡ backend, build ou publicaÃ§Ã£o. Os arquivos do site podem ser servidos por um servidor HTTP estÃ¡tico. A fonte IBM Plex Mono Ã© carregada do Google Fonts; hÃ¡ fallback monospace. Os arquivos do emulador e da ROM sÃ£o locais.

Emulador: [EmulatorJS 4.2.3](https://github.com/EmulatorJS/EmulatorJS/tree/v4.2.3). Consulte as licenÃ§as e a origem dos binÃ¡rios em `vendor/emulatorjs/VERSION.txt`. A licenÃ§a do emulador nÃ£o se aplica Ã  ROM.

Verificado no Chromium: inÃ­cio sem interaÃ§Ã£o, teclas, mapa inicial, save state e restauraÃ§Ã£o apÃ³s recarregar, e layout mÃ³vel simulado. NÃ£o foi feito um playthrough completo nem validaÃ§Ã£o em Safari ou controle fÃ­sico.

O save nativo do cartucho é gravado a cada cinco segundos e ao ocultar/sair da página, mantendo os arquivos Mario A/B/C nos pontos de salvamento do jogo.
