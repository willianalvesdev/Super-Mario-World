import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import http from 'node:http';
import { createServer } from '../server.mjs';

let root, server, port;
before(async () => {
  root = await mkdtemp(join(tmpdir(), 'mario-server-'));
  await mkdir(join(root, 'assets'));
  await writeFile(join(root, 'index.html'), '<h1>Mario</h1>');
  await writeFile(join(root, 'assets', 'icon.svg'), '<svg/>');
  await writeFile(join(root, 'server.mjs'), 'private source');
  server = createServer(root);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (root) {
    assert.equal(dirname(resolve(root)), resolve(tmpdir()));
    assert.ok(basename(root).startsWith('mario-server-'));
    await rm(root, { recursive: true });
  }
});

function request(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path, method }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('serves the page, assets and HEAD with correct MIME types', async () => {
  const page = await request('/?preview=1');
  assert.equal(page.status, 200);
  assert.equal(page.body, '<h1>Mario</h1>');
  assert.equal(page.headers['content-type'], 'text/html; charset=utf-8');
  const icon = await request('/assets/icon.svg', 'HEAD');
  assert.equal(icon.status, 200);
  assert.equal(icon.headers['content-type'], 'image/svg+xml');
  assert.equal(icon.body, '');
});

test('rejects traversal and private project files', async () => {
  for (const path of ['/../index.html', '/assets/%2e%2e/server.mjs', '/assets%5c..%5cserver.mjs', '/server.mjs', '/tests/test.mjs', '/.research/core.js', '/assets/.secret', '/assets/%00.svg']) {
    assert.equal((await request(path)).status, 403, path);
  }
});

test('handles invalid addresses, missing files and unsupported methods', async () => {
  assert.equal((await request('/assets/%zz')).status, 400);
  assert.equal((await request('/assets/missing.svg')).status, 404);
  const post = await request('/', 'POST');
  assert.equal(post.status, 405);
  assert.equal(post.headers.allow, 'GET, HEAD');
});
