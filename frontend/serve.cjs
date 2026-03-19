// Simple static file server for Vue SPA — use instead of "pm2 serve"
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const DIST = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.eot':  'application/vnd.ms-fontobject',
};

http.createServer((req, res) => {
  // Strip query string
  const url = req.url.split('?')[0];
  let filePath = path.join(DIST, url === '/' ? 'index.html' : url);

  // SPA fallback — if file not found, serve index.html
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    // Cache static assets for 1 day, never cache HTML
    const cacheHeader = ext === '.html'
      ? 'no-cache'
      : 'public, max-age=86400';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': cacheHeader,
    });
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`[ISP-Frontend] Serving ${DIST} on port ${PORT}`);
});
