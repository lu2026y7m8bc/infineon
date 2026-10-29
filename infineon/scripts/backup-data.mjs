#!/usr/bin/env node
/** backup-data.mjs — seed 前备份 6 个 JSON 到 data/.backup/ */
import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const backup = path.join(dir, '.backup');
await rm(backup, { recursive: true, force: true });
await mkdir(backup, { recursive: true });
for (const name of ['home', 'products', 'solutions', 'support', 'news', 'about']) {
  try {
    await cp(path.join(dir, `${name}.json`), path.join(backup, `${name}.json`));
  } catch {
    /* first run: nothing to back up */
  }
}
console.log(`[backup-data] ${backup}`);
