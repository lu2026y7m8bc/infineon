#!/usr/bin/env node
/**
 * validate-links.mjs — 内链 / 空链 / 锚点 / 不安全协议校验
 * 用法：node scripts/validate-links.mjs
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SKIP_DIRS = new Set(['assets', 'data', 'scripts', 'templates', 'node_modules']);

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      await walk(path.join(dir, entry.name), out);
    } else if (entry.name.endsWith('.html')) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function extractLinks(html) {
  const links = [];
  const re = /(?:href|src)="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) links.push(m[1]);
  return links;
}

function isExternal(link) {
  return /^(https?:)?\/\//.test(link) || /^(mailto:|tel:)/.test(link);
}

function anchorExists(html, id) {
  const escaped = String(id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:id|name)=["']${escaped}["']`).test(html);
}

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const files = await walk(root);
  const problems = [];
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    for (const link of extractLinks(html)) {
      if (!link) continue;

      if (/^javascript:/i.test(link) || /^data:/i.test(link)) {
        problems.push({ file, link, reason: 'unsafe protocol' });
        continue;
      }
      if (link === '#') {
        problems.push({ file, link, reason: 'empty hash link' });
        continue;
      }
      if (link.startsWith('#')) {
        if (!anchorExists(html, link.slice(1))) problems.push({ file, link, reason: 'missing same-page anchor' });
        continue;
      }
      if (isExternal(link)) continue;

      const [pathPart, hash] = link.split('#');
      const clean = pathPart.split('?')[0];
      if (!clean) continue;
      const target = clean.startsWith('/')
        ? path.join(root, clean)
        : path.resolve(path.dirname(file), clean);
      if (!(await exists(target))) {
        problems.push({ file, link, reason: 'missing target' });
        continue;
      }
      if (hash) {
        const targetHtml = await readFile(target, 'utf8');
        if (!anchorExists(targetHtml, hash)) problems.push({ file, link, reason: 'missing target anchor' });
      }
    }
  }
  console.log(`[validate-links] scanned ${files.length} html files`);
  if (!problems.length) {
    console.log('[validate-links] OK: no empty, broken, unsafe or anchor-missing links');
    return;
  }
  for (const p of problems) console.log(`[validate-links] ${p.reason}: ${p.link} in ${p.file}`);
  process.exitCode = 1;
}

main().catch((err) => {
  console.error('[validate-links] failed:', err);
  process.exit(1);
});
