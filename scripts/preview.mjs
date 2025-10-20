import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { join, dirname, extname } from 'node:path';
import fs from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, '..', 'dist');
const port = process.env.PORT ? Number(process.env.PORT) : 5173;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveFile(res, filePath, statusCode = 200) {
  const type = mime[extname(filePath)] || 'application/octet-stream';
  res.statusCode = statusCode;
  res.setHeader('Content-Type', type);
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    let pathname = url.pathname;
    if (pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    // Map root to /index.html
    if (pathname === '') pathname = '/index.html';
    // Try direct file
    let filePath = join(dist, pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return serveFile(res, filePath);
    }
    // Try directory index: /foo -> /foo/index.html
    const dirIndex = join(dist, pathname, 'index.html');
    if (fs.existsSync(dirIndex)) {
      return serveFile(res, dirIndex);
    }
    // Try .html fallback: /foo -> /foo.html
    const htmlFallback = join(dist, `${pathname}.html`);
    if (fs.existsSync(htmlFallback)) {
      return serveFile(res, htmlFallback);
    }
    // 404
    const notFoundPath = join(dist, '404.html');
    if (fs.existsSync(notFoundPath)) return serveFile(res, notFoundPath, 404);
    res.statusCode = 404;
    res.end('Not Found');
  } catch (e) {
    res.statusCode = 500;
    res.end('Server Error');
  }
});

server.listen(port, () => {
  console.log(`Static preview server running at http://localhost:${port}`);
});
