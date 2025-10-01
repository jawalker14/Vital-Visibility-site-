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
      // extensionless absolute path
      if (!/\.(html|css|js|png|jpg|jpeg|webp|svg|ico|pdf)(#|\?|$)/i.test(h) && !h.endsWith('/')) {
        console.log(`[EXTENSIONLESS ABS] ${f} -> ${h}`);
        issues++;
      }
      if (/\/$/.test(h) && !/\/(#|\?|$)/.test(h)) {
        // trailing slash path likely to redirect
        console.log(`[TRAILING-SLASH ABS] ${f} -> ${h}`);
        issues++;
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
