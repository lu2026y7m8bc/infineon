#!/usr/bin/env node
/** pad-json-faq.mjs — 统一补齐 FAQ 答案长度（250–500 字） */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { padFaq, FAQ_POOLS } from './faq-util.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'data');
const FILES = ['home', 'products', 'solutions', 'support', 'news', 'about'];

for (const name of FILES) {
  const file = path.join(dataDir, `${name}.json`);
  const data = JSON.parse(await readFile(file, 'utf8'));
  const pool = FAQ_POOLS[name] || [];
  if (data.page && data.page.faq) data.page.faq = padFaq(data.page.faq, 250, 450, pool);
  for (const c of data.categories || []) {
    if (c.faq) c.faq = padFaq(c.faq, c.models ? 300 : 250, c.models ? 500 : 450, pool);
    for (const m of c.models || []) {
      if (m.faq) m.faq = padFaq(m.faq, 250, 450, pool);
    }
  }
  for (const s of data.solutions || []) {
    if (s.faq) s.faq = padFaq(s.faq, 250, 450, pool);
  }
  for (const a of data.articles || []) {
    if (a.faq) a.faq = padFaq(a.faq, 250, 450, pool);
  }
  await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`[pad-faq] ${name}.json`);
}
