import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import serveStatic from 'serve-static';
import finalhandler from 'finalhandler';
import fs from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, '..', 'dist');
const port = process.env.PORT ? Number(process.env.PORT) : 5173;

// Serve static files from dist with index.html for directories
const serve = serveStatic(dist, { index: ['index.html'] });

const server = http.createServer((req, res) => {
  serve(req, res, (err) => {
    if (err) return finalhandler(req, res)(err);
    // If not found, return 404.html with 404 status when available
    const notFoundPath = join(dist, '404.html');
    if (fs.existsSync(notFoundPath)) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      fs.createReadStream(notFoundPath).pipe(res);
    } else {
      finalhandler(req, res)();
    }
  });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Static preview server running at http://localhost:${port}`);
});
