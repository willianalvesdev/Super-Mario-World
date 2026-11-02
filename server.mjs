import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';

const directory = dirname(fileURLToPath(import.meta.url));
const files = new Set(['index.html', 'styles.css', 'app.js', 'manifest.webmanifest']);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf', '.png': 'image/png', '.ico': 'image/x-icon', '.wasm': 'application/wasm',
};

export function createServer(root = directory) {
  root = resolve(root);
  return http.createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(request.url.split('?')[0]);
    } catch {
      response.writeHead(400).end('EndereÃ§o invÃ¡lido.');
      return;
    }
    const name = pathname === '/' ? 'index.html' : pathname.slice(1);
    const target = resolve(root, name);
    if (!pathname.startsWith('/') || /[\\\0]/.test(name) ||
        name.split('/').some(part => part === '..' || part.startsWith('.')) ||
        (!files.has(name) && !/^(assets|roms|vendor)\/.+/.test(name)) ||
        !target.startsWith(root + sep)) {
      response.writeHead(403).end('Acesso negado.');
      return;
    }
    try {
      const content = await readFile(target);
      response.writeHead(200, {
        'Content-Type': types[extname(target)] || 'application/octet-stream',
        'Content-Length': content.length,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache',
      });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) {
      const missing = ['ENOENT', 'ENOTDIR', 'EISDIR'].includes(error.code);
      if (!missing) console.error(error);
      response.writeHead(missing ? 404 : 500).end(missing ? 'Arquivo nÃ£o encontrado.' : 'Erro ao ler o arquivo.');
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createServer();
  const address = 'http://127.0.0.1:8080';
  server.on('error', error => {
    console.error(error.code === 'EADDRINUSE'
      ? `A porta 8080 jÃ¡ estÃ¡ em uso. Se o jogo jÃ¡ estiver aberto, acesse ${address}.`
      : `NÃ£o foi possÃ­vel iniciar o site: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(8080, '127.0.0.1', () => {
    console.log(`Super Mario World: ${address}\nMantenha esta janela aberta. Para encerrar, pressione Ctrl+C.`);
    if (process.argv.includes('--open') && process.platform === 'win32') {
      execFile('rundll32.exe', ['url.dll,FileProtocolHandler', address], { windowsHide: true }, error => {
        if (error) console.error(`Abra ${address} no navegador.`);
      });
    }
  });
}
