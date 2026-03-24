// Static file server for Vue SPA — serves over HTTPS if ssl/ certs exist, else HTTP
const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT = 8080;
const DIST = path.join(__dirname, 'dist');
const SSL_CRT = path.join(__dirname, 'ssl', 'server.crt');
const SSL_KEY = path.join(__dirname, 'ssl', 'server.key');
const USE_HTTPS = fs.existsSync(SSL_CRT) && fs.existsSync(SSL_KEY);

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
  '.webmanifest': 'application/manifest+json',
};

function requestHandler(req, res) {
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
    // Cache static assets for 1 day, never cache HTML or SW
    const noCache = ext === '.html' || filePath.endsWith('sw.js') || filePath.endsWith('registerSW.js');
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': noCache ? 'no-cache' : 'public, max-age=86400',
    });
    res.end(data);
  });
}

if (USE_HTTPS) {
  const sslOptions = {
    key:  fs.readFileSync(SSL_KEY),
    cert: fs.readFileSync(SSL_CRT),
  };
  https.createServer(sslOptions, requestHandler).listen(PORT, '0.0.0.0', () => {
    console.log(`[ISP-Frontend] HTTPS server running on https://0.0.0.0:${PORT}`);
    console.log(`[ISP-Frontend] Serving: ${DIST}`);
  });
} else {
  http.createServer(requestHandler).listen(PORT, '0.0.0.0', () => {
    console.log(`[ISP-Frontend] HTTP server running on http://0.0.0.0:${PORT} (no SSL certs found)`);
    console.log(`[ISP-Frontend] Serving: ${DIST}`);
  });
}
