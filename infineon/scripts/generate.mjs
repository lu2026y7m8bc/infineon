#!/usr/bin/env node
/**
 * generate.mjs — 数据驱动静态站点生成器（骨架 T0.4，完整实现见 T2.21）
 * 用法：node scripts/generate.mjs [--dry-run]
 */
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brandDir = path.resolve(__dirname, '..');
const dataDir = path.join(brandDir, 'data');
const templatesDir = path.join(brandDir, 'templates');

async function safeReaddir(dir) {
  try {
    return await readdir(dir);
  } catch {
    return [];
  }
}

function listByExt(files, ext) {
  const matched = files.filter((f) => f.endsWith(ext));
  return matched.length ? matched.join(', ') : '(none)';
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const dataFiles = await safeReaddir(dataDir);
  const tplFiles = await safeReaddir(templatesDir);

  console.log(`[generate] brand dir : ${brandDir}`);
  console.log(`[generate] data      : ${listByExt(dataFiles, '.json')}`);
  console.log(`[generate] templates : ${listByExt(tplFiles, '.html')}`);

  if (dryRun) {
    console.log('[generate] dry-run   : no files written');
    return;
  }
  console.log('[generate] skeleton  : full generation is implemented in T2.21');
}

main().catch((err) => {
  console.error('[generate] failed:', err);
  process.exit(1);
});
