# Super Mario World no navegador

Site estático que executa a ROM fornecida no EmulatorJS 4.2.3 com o núcleo Snes9x. O jogo inicia automaticamente e ocupa a janela inteira, mantendo a proporção original do SNES. Não há tela de entrada ou botão Jogar.

## Abrir no Windows

Dê dois cliques em **INICIAR.cmd**. Ele inicia o servidor local e abre **http://127.0.0.1:8080**. Mantenha a janela do servidor aberta enquanto joga. Requer Node.js, já disponível no computador utilizado no desenvolvimento. Não precisa executar `npm install`.

Alternativa: `npm start` e abra o endereço acima. Use sempre o mesmo endereço para encontrar os saves desse navegador. Abrir `index.html` por `file://` não funciona, pois o navegador bloqueia o carregamento do emulador.

## Controles

| Tecla | Controle do SNES / ação |
| --- | --- |
| Setas | Direcional |
| Enter | Start / pausa do jogo |
| Z | B / pular |
| X | A / salto giratório |
| A ou S | Y ou X / correr e segurar |
| Shift | Select |
| Q / E | L / R |

O primeiro toque ou tecla ativa o áudio, por exigência do navegador. No celular aparecem os controles de toque. Um controle físico pode ser configurado no menu do emulador.

Mova o mouse até a parte inferior da tela para exibir o menu; no celular, use o botão de menu. Ali estão pausa, volume, tela cheia, controles, salvar estado e carregar estado. O menu usa a paleta e a tipografia do My-Portfolio; ele fica oculto durante o jogo.

## Saves

Os estados salvos e os saves originais ficam no armazenamento deste navegador. **Limpar os dados do site apaga esses saves.** O salvamento do cartucho acontece nos pontos oferecidos pelo jogo; salvar estado registra qualquer momento. Nas configurações é possível escolher estados em arquivo para fazer backup. Os atalhos de quick save do emulador são temporários, na memória da sessão.

## Arquivos e verificação

- `index.html`, `styles.css`, `app.js`: página e configuração do emulador.
- `assets/mario-world.svg`: ícone fornecido, usado no favicon e no manifesto.
- `roms/super-mario-world.smc`: cópia da ROM fornecida.
- `vendor/emulatorjs`: distribuição fixada do emulador, núcleo, tradução e licenças.
- `server.mjs`: servidor local sem dependências, limitado a `127.0.0.1`.
- `npm test`: testes do servidor, inicialização automática, tratamento de falhas e desbloqueio do áudio.

Não há backend, build ou publicação. Os arquivos do site podem ser servidos por um servidor HTTP estático. A fonte IBM Plex Mono é carregada do Google Fonts; há fallback monospace. Os arquivos do emulador e da ROM são locais.

Emulador: [EmulatorJS 4.2.3](https://github.com/EmulatorJS/EmulatorJS/tree/v4.2.3). Consulte as licenças e a origem dos binários em `vendor/emulatorjs/VERSION.txt`. A licença do emulador não se aplica à ROM.

Verificado no Chromium: início sem interação, teclas, mapa inicial, save state e restauração após recarregar, e layout móvel simulado. Não foi feito um playthrough completo nem validação em Safari ou controle físico.
