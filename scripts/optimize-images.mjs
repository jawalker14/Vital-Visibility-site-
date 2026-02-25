#!/usr/bin/env node
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const root = process.cwd();
const imagesDir = path.join(root, 'images');
const srcPng = path.join(imagesDir, 'vital_visibility_logo.png');
const outWebp = path.join(imagesDir, 'vital_visibility_logo.webp');
const outPng = path.join(imagesDir, 'vital_visibility_logo.optim.png');

async function optimize() {
  try {
    await fs.access(srcPng);
  } catch {
    console.error('Logo PNG not found at', srcPng);
    process.exit(1);
  }

  const input = sharp(srcPng);
  // Generate a high-quality WebP and a compressed PNG fallback
  await input.webp({ quality: 82, effort: 6 }).toFile(outWebp);
  await input.png({ compressionLevel: 9, palette: true }).toFile(outPng);

  console.log('Generated:', path.basename(outWebp));
  console.log('Generated:', path.basename(outPng));
}

optimize().catch((e) => { console.error(e); process.exit(1); });
