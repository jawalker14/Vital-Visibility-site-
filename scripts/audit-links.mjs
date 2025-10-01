#!/usr/bin/env node
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const HTML_EXT = ['.html'];
const ASSET_OK = [/\.(html|css|js|png|jpg|jpeg|webp|svg|ico|pdf)(#|\?|$)/i, /^mailto:/i, /^tel:/i, /^https?:\/\//i, /^#/];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (name.name.startsWith('.') || name.name === 'node_modules' || name.name === 'dist') continue;
    const p = join(dir, name.name);
    if (name.isDirectory()) out.push(...walk(p));
    else if (name.isFile() && name.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let issues = 0;

for (const f of files) {
  const html = readFileSync(f, 'utf8');
  // meta refresh
  if (/<meta[^>]+http-equiv=["']?refresh/i.test(html)) {
    console.log(`[META-REFRESH] ${f}`);
    issues++;
  }
  // base tag
  if (/<base\s+href=/i.test(html)) {
    console.log(`[BASE-HREF] ${f}`);
    issues++;
  }
  // href checks
  const hrefs = [...html.matchAll(/href=\"([^\"]+)\"/g)].map(m => m[1]);
  for (const h of hrefs) {
    if (ASSET_OK.some(rx => rx.test(h))) continue;
    if (h.startsWith('/')) {
      // Absolute paths without an explicit extension
      const hasExt = /\.(html|css|js|png|jpg|jpeg|webp|svg|ico|pdf)(#|\?|$)/i.test(h);
      if (!hasExt) {
        if (h.endsWith('/')) {
          // Allow folder-style links only if matching directory with index.html exists
          const dir = h.replace(/^\//, '').replace(/\/$/, '');
          const idx = join(ROOT, dir, 'index.html');
          try {
            // eslint-disable-next-line no-unused-expressions
            readFileSync(idx);
          } catch {
            console.log(`[TRAILING-SLASH NO-INDEX] ${f} -> ${h} (missing ${idx})`);
            issues++;
          }
        } else {
          // Bare extensionless absolute path like /about
          const dir = h.replace(/^\//, '');
          const asDir = join(ROOT, dir, 'index.html');
          const asHtml = join(ROOT, `${dir}.html`);
          let ok = false;
          try { readFileSync(asDir); ok = true; } catch {}
          if (!ok) { try { readFileSync(asHtml); ok = true; } catch {} }
          if (!ok) {
            console.log(`[EXTENSIONLESS ABS] ${f} -> ${h} (no ${asDir} or ${asHtml})`);
            issues++;
          }
        }
      }
    }
  }
}

if (issues) {
  console.error(`\nAudit failed with ${issues} link/canonical issues.`);
  process.exit(1);
} else {
  console.log('Audit passed. No meta-refresh or inconsistent internal links found.');
}
