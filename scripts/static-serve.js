/* Simple static file server for the site/ directory (no external deps) */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const ROOT = path.join(process.cwd(), 'site');
const ASSETS = path.join(process.cwd(), 'assets');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.txt': 'text/plain; charset=utf-8'
};

function send(res, code, body, headers = {}){
  res.writeHead(code, { 'Cache-Control': 'no-cache', ...headers });
  res.end(body);
}

function safeJoin(base, target){
  const targetPath = path.posix.normalize('/' + target).replace(/^\/+/, '');
  const joined = path.join(base, targetPath);
  if (!joined.startsWith(base)) return null;
  return joined;
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';

    // Map /assets/* to repository assets directory
    if (pathname.startsWith('/assets/')) {
      const assetRel = pathname.replace(/^\/assets\//, '');
      const assetPath = safeJoin(ASSETS, assetRel);
      if (!assetPath) return send(res, 400, 'Bad request');
      fs.stat(assetPath, (err, stat) => {
        if (err || !stat.isFile()) return send(res, 404, 'Not found');
        const ext = path.extname(assetPath).toLowerCase();
        const mime = MIME[ext] || 'application/octet-stream';
        fs.readFile(assetPath, (e, data) => {
          if (e) return send(res, 500, 'Server error');
          send(res, 200, data, { 'Content-Type': mime });
        });
      });
      return;
    }

    const filePath = safeJoin(ROOT, pathname);
    if (!filePath) return send(res, 400, 'Bad request');

    fs.stat(filePath, (err, stat) => {
      if (err) {
        return send(res, 404, 'Not found');
      }
      if (stat.isDirectory()) {
        const indexPath = path.join(filePath, 'index.html');
        fs.readFile(indexPath, (e, data) => {
          if (e) return send(res, 404, 'Not found');
          send(res, 200, data, { 'Content-Type': MIME['.html'] });
        });
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const mime = MIME[ext] || 'application/octet-stream';
      fs.readFile(filePath, (e, data) => {
        if (e) return send(res, 500, 'Server error');
        send(res, 200, data, { 'Content-Type': mime });
      });
    });
  } catch (e) {
    send(res, 500, 'Server error');
  }
});

server.listen(PORT, () => {
  process.stdout.write(`Static server running at http://127.0.0.1:${PORT}\n`);
});

