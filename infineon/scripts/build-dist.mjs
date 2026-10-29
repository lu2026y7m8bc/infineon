#!/usr/bin/env node
/** build-dist.mjs — 仅复制站点产物到 dist/（排除 scripts/data/templates） */
import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const items = [
  'index.html',
  'sitemap.xml',
  'robots.txt',
  'llms.txt',
  '_redirects',
  'products',
  'solutions',
  'support',
  'news',
  'about',
  'contact',
  'assets'
];

for (const item of items) {
  try {
    await cp(path.join(root, item), path.join(dist, item), { recursive: true });
  } catch {
    /* optional file */
  }
}
console.log(`[dist] ${dist}`);
