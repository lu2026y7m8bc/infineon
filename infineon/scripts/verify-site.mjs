#!/usr/bin/env node
/** verify-site.mjs — 全站 SEO / Schema / 结构 / 表单 / sitemap 验证（T4.3–T4.14、T6.1–T6.3） */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const BASE = (process.env.SITE_BASE || 'https://infineon.pages.dev').replace(/\/+$/, '');
const SKIP = new Set(['templates', 'dist', 'data', 'scripts', 'assets', 'node_modules']);

const pages = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP.has(entry.name) || entry.name.startsWith('.')) continue;
      await walk(path.join(dir, entry.name));
    } else if (entry.name.endsWith('.html')) {
      pages.push(path.join(dir, entry.name));
    }
  }
}
await walk(root);

const errors = [];
const fail = (msg) => errors.push(msg);
const relOf = (file) => '/' + path.relative(root, file).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '');

const titles = new Map();
const descs = new Map();
const canonicals = new Map();
const sitemapUrls = new Set();
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrls.add(m[1].replace(BASE, ''));

function typesOf(html) {
  const types = new Set();
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      for (const item of Array.isArray(data) ? data : [data]) {
        if (item['@type']) types.add(item['@type']);
        for (const el of item.itemListElement || []) {
          if (el.item && el.item['@type']) types.add(el.item['@type']);
        }
      }
    } catch {
      fail(`${relOf(file)}: invalid JSON-LD`);
    }
  }
  return types;
}

function requiredTypes(url) {
  if (url === '/') return ['Organization', 'WebSite', 'FAQPage'];
  if (url === '/products/') return ['ItemList', 'FAQPage'];
  if (/^\/products\/[^/]+\/$/.test(url)) return ['BreadcrumbList', 'ItemList', 'Product', 'FAQPage'];
  if (/^\/products\/[^/]+\/[^/]+$/.test(url)) return ['BreadcrumbList', 'Product', 'FAQPage'];
  if (url === '/solutions/') return ['ItemList', 'FAQPage'];
  if (/^\/solutions\/[^/]+\/$/.test(url)) return ['BreadcrumbList', 'FAQPage', 'Article'];
  if (url === '/support/') return ['ItemList', 'FAQPage'];
  if (/^\/support\/(guides|app-notes|troubleshooting|reviews)\/$/.test(url)) return ['BreadcrumbList', 'ItemList'];
  if (/^\/support\/(guides|app-notes|troubleshooting|reviews)\/[^/]+$/.test(url)) return ['BreadcrumbList', 'TechArticle', 'FAQPage'];
  if (/^\/support\/authors\/[^/]+$/.test(url)) return ['BreadcrumbList', 'ProfilePage'];
  if (/^\/support\/tags\/[^/]+$/.test(url)) return ['BreadcrumbList', 'ItemList'];
  if (url === '/news/') return ['ItemList'];
  if (/^\/news\/(company|industry)\/$/.test(url)) return ['BreadcrumbList', 'ItemList'];
  if (/^\/news\/[^/]+$/.test(url)) return ['BreadcrumbList'];
  if (url === '/about/') return ['BreadcrumbList', 'FAQPage'];
  if (url === '/contact/') return ['BreadcrumbList'];
  return [];
}

for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const url = relOf(file);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
  const h1 = (html.match(/<h1[\s>]/g) || []).length;

  if (!title) fail(`${url}: missing title`);
  if (!desc) fail(`${url}: missing description`);
  if (!canonical) fail(`${url}: missing canonical`);
  if (h1 !== 1) fail(`${url}: h1 count=${h1}`);
  if (title && titles.has(title)) fail(`${url}: duplicate title with ${titles.get(title)}`); else titles.set(title, url);
  if (desc && descs.has(desc)) fail(`${url}: duplicate description with ${descs.get(desc)}`); else descs.set(desc, url);
  if (canonical && canonicals.has(canonical)) fail(`${url}: duplicate canonical with ${canonicals.get(canonical)}`); else canonicals.set(canonical, url);
  if (url !== '/' && !html.includes('class="breadcrumb"')) fail(`${url}: missing breadcrumb`);
  if (!html.includes('site-header')) fail(`${url}: missing header`);
  if (!html.includes('site-footer')) fail(`${url}: missing footer`);

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/alt="[^"]+"/.test(m[0])) fail(`${url}: img missing non-empty alt`);
  }
  for (const m of html.matchAll(/<(input|textarea|select)\b[^>]*>/g)) {
    const tag = m[0];
    const id = (tag.match(/id="([^"]+)"/) || [])[1];
    const name = (tag.match(/name="([^"]+)"/) || [])[1];
    if (tag.includes('type="hidden"')) continue;
    if (id && html.includes(`for="${id}"`)) continue;
    if (tag.includes('aria-label')) continue;
    if (name && html.includes(`name="${name}"`) && html.includes('type="checkbox"')) continue;
    fail(`${url}: form field ${name || id || '?'} missing label`);
  }

  const types = typesOf(html);
  for (const t of requiredTypes(url)) {
    if (!types.has(t)) fail(`${url}: missing schema ${t}`);
  }
  if (/^\/news\/[^/]+$/.test(url) && !types.has('NewsArticle') && !types.has('Article')) {
    fail(`${url}: missing schema NewsArticle/Article`);
  }
  if (!sitemapUrls.has(url)) fail(`${url}: missing from sitemap`);
}

for (const url of sitemapUrls) {
  if (!pages.some((f) => relOf(f) === url)) fail(`sitemap has stale url ${url}`);
}
for (const f of ['robots.txt', 'llms.txt']) {
  if (!existsSync(path.join(root, f))) fail(`missing ${f}`);
}

console.log(`[verify-site] pages=${pages.length} sitemapUrls=${sitemapUrls.size} errors=${errors.length}`);
for (const e of errors) console.log(`[verify-site] FAIL ${e}`);
if (errors.length) process.exitCode = 1;
