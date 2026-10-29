#!/usr/bin/env node
/** preview-server.mjs — 本地预览，支持无扩展名 URL（模拟 Cloudflare Pages） */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || 8765);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8'
};

http
  .createServer(async (req, res) => {
    try {
      let p = decodeURIComponent((req.url || '/').split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      let file = path.join(root, p);
      try {
        await stat(file);
      } catch {
        try {
          await stat(file + '.html');
          file += '.html';
        } catch {
          res.statusCode = 404;
          res.end('404');
          return;
        }
      }
      const data = await readFile(file);
      res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    } catch {
      res.statusCode = 500;
      res.end('500');
    }
  })
  .listen(port, '127.0.0.1', () => console.log(`preview: http://127.0.0.1:${port}`));
