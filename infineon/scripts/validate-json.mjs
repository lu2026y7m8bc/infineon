#!/usr/bin/env node
/**
 * validate-json.mjs — JSON 契约校验（骨架 T0.6，完整实现见 T2.22）
 * 用法：node scripts/validate-json.mjs
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'data');

const REQUIRED = ['brand', 'global'];
const FILES = ['home', 'products', 'solutions', 'support', 'news', 'about'];

async function load(name) {
  const file = path.join(dataDir, `${name}.json`);
  const raw = await readFile(file, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  let errors = 0;
  for (const name of FILES) {
    try {
      const data = await load(name);
      const missing = REQUIRED.filter((k) => !(k in data));
      if (missing.length) {
        console.log(`[validate-json] ${name}.json missing: ${missing.join(', ')}`);
        errors += 1;
      } else {
        console.log(`[validate-json] ${name}.json OK`);
      }
    } catch (err) {
      console.log(`[validate-json] ${name}.json ERROR: ${err.message}`);
      errors += 1;
    }
  }
  console.log(`[validate-json] files=${FILES.length} errors=${errors}`);
  if (errors) process.exitCode = 1;
}

main().catch((err) => {
  console.error('[validate-json] failed:', err);
  process.exit(1);
});
