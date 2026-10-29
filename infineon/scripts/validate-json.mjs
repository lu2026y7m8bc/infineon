#!/usr/bin/env node
/**
 * validate-json.mjs — 6 个 JSON 契约与内容校验（T2.22）
 * 用法：node scripts/validate-json.mjs
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'data');

const FILES = ['home', 'products', 'solutions', 'support', 'news', 'about'];
let errors = 0;
const fail = (msg) => {
  errors += 1;
  console.log(`[validate-json] FAIL ${msg}`);
};

async function load(name) {
  return JSON.parse(await readFile(path.join(dataDir, `${name}.json`), 'utf8'));
}

function checkSeo(where, seo) {
  if (!seo || !seo.title || !seo.description || !seo.canonical) fail(`${where} seo missing title/description/canonical`);
}

function checkFaq(where, faq, min, max, minLen = 250, maxLen = 500) {
  if (!Array.isArray(faq)) return fail(`${where} faq not array`);
  if (faq.length < min || faq.length > max) fail(`${where} faq count=${faq.length}, expected ${min}-${max}`);
  faq.forEach((f, i) => {
    if (!f.question) fail(`${where} faq[${i}] missing question`);
    if (!Array.isArray(f.answer) || f.answer.length < 2) fail(`${where} faq[${i}] answer must be >=2 paragraphs`);
    if (!f.decisionGuide) fail(`${where} faq[${i}] missing decisionGuide`);
    const len = (f.answer || []).join('').length;
    if (len < minLen || len > maxLen) fail(`${where} faq[${i}] answer length=${len}, expected ${minLen}-${maxLen}`);
  });
}

function checkImage(where, p) {
  if (!p) return fail(`${where} missing image path`);
  const rel = String(p).replace(/^\//, '');
  if (!existsSync(path.join(dataDir, '..', rel))) fail(`${where} image not found: ${p}`);
}

function checkCommon(name, data) {
  if (!data.brand) fail(`${name} missing brand`);
  if (!data.page) return fail(`${name} missing page`);
  checkSeo(name, data.page.seo);
  if (name === 'about' && !data.global) fail('about missing global');
}

function checkHome(data) {
  const c = data.page.content;
  ['hero', 'advantages', 'categories', 'solutions', 'articles', 'news', 'cta'].forEach((k) => {
    if (!c[k]) fail(`home missing content.${k}`);
  });
  if (c.advantages && c.advantages.length < 4) fail('home advantages <4');
  if (c.categories && c.categories.length !== 4) fail('home categories !=4');
  if (c.solutions && c.solutions.length !== 4) fail('home solutions !=4');
  if (c.articles && c.articles.length < 3) fail('home articles <3');
  if (c.news && c.news.length < 3) fail('home news <3');
  checkFaq('home', data.page.faq, 3, 5, 250, 450);
}

function checkProducts(data) {
  const cats = data.categories || [];
  if (cats.length !== 4) fail(`products categories=${cats.length}, expected 4`);
  let models = 0;
  let deep = 0;
  let standard = 0;
  const seenModels = new Set();
  for (const cat of cats) {
    if (cat.description.length < 200 || cat.description.length > 300) fail(`${cat.slug} description length=${cat.description.length}, expected 200-300`);
    if (!cat.applications || !cat.applications.length) fail(`${cat.slug} missing applications`);
    if (!cat.advantages || !cat.advantages.length) fail(`${cat.slug} missing advantages`);
    if (!cat.guideLink || !cat.guideLink.url) fail(`${cat.slug} missing guideLink`);
    if (!cat.faeReview || !cat.faeReview.text) fail(`${cat.slug} missing faeReview`);
    if (!cat.models || cat.models.length !== 6) fail(`${cat.slug} models=${cat.models ? cat.models.length : 0}, expected 6`);
    checkFaq(`category ${cat.slug}`, cat.faq, 5, 12, 300, 500);
    for (const m of cat.models || []) {
      models += 1;
      if (m.depth === 'deep') deep += 1;
      else standard += 1;
      const min = m.depth === 'deep' ? 800 : 150;
      if (m.description.length < min) fail(`${cat.slug}/${m.model} description=${m.description.length}, expected >=${min}`);
      if (!m.params || !Object.keys(m.params).length) fail(`${cat.slug}/${m.model} missing params`);
      if (!m.package || !m.stock) fail(`${cat.slug}/${m.model} missing package/stock`);
      if (seenModels.has(m.model)) fail(`duplicate model ${m.model}`);
      seenModels.add(m.model);
      (m.images || []).forEach((img) => checkImage(`${cat.slug}/${m.model}`, img));
      checkFaq(`model ${m.model}`, m.faq, m.depth === 'deep' ? 5 : 3, m.depth === 'deep' ? 8 : 5, 250, 450);
    }
  }
  if (models !== 24) fail(`products models=${models}, expected 24`);
  if (deep !== 8) fail(`products deep=${deep}, expected 8`);
  if (standard !== 16) fail(`products standard=${standard}, expected 16`);
}

function checkSolutions(data) {
  const list = data.solutions || [];
  if (list.length !== 4) fail(`solutions=${list.length}, expected 4`);
  for (const s of list) {
    if (s.overview.join('').length < 800) fail(`${s.slug} overview=${s.overview.join('').length}, expected >=800`);
    if (!s.blockDiagram || !s.blockDiagram.src || !s.blockDiagram.alt) fail(`${s.slug} missing blockDiagram`);
    if (!s.techStrength || !s.techStrength.length) fail(`${s.slug} missing techStrength`);
    if (!s.bom || !s.bom.length) fail(`${s.slug} missing bom`);
    checkFaq(`solution ${s.slug}`, s.faq, 3, 6, 250, 450);
  }
}

function checkSupport(data) {
  if ((data.categories || []).length !== 4) fail('support categories !=4');
  if ((data.articles || []).length !== 4) fail('support articles !=4');
  if ((data.authors || []).length < 2) fail('support authors <2');
  if ((data.tags || []).length < 4) fail('support tags <4');
  const slugs = new Set((data.articles || []).map((a) => a.slug));
  const authors = new Set((data.authors || []).map((a) => a.id));
  const cats = new Set((data.categories || []).map((c) => c.slug));
  const tagSet = new Set((data.tags || []).map((t) => t.slug));
  const seen = new Set();
  for (const a of data.articles || []) {
    if (seen.has(a.slug)) fail(`duplicate article slug ${a.slug}`);
    seen.add(a.slug);
    if (a.content.join('').length < 800) fail(`${a.slug} content=${a.content.join('').length}, expected >=800`);
    if (!cats.has(a.category)) fail(`${a.slug} bad category ${a.category}`);
    if (!authors.has(a.author)) fail(`${a.slug} bad author ${a.author}`);
    (a.tags || []).forEach((t) => {
      if (!tagSet.has(t)) fail(`${a.slug} bad tag ${t}`);
    });
    checkFaq(`article ${a.slug}`, a.faq, 4, 8, 250, 450);
    (a.related || []).forEach((r) => {
      if (!slugs.has(r)) fail(`${a.slug} related missing ${r}`);
    });
  }
}

function checkNews(data) {
  const list = data.articles || [];
  if (list.length !== 4) fail(`news=${list.length}, expected 4`);
  if (list.filter((a) => a.category === 'company').length !== 2) fail('news company !=2');
  if (list.filter((a) => a.category === 'industry').length !== 2) fail('news industry !=2');
  const slugs = new Set(list.map((a) => a.slug));
  const seen = new Set();
  for (const a of list) {
    if (seen.has(a.slug)) fail(`duplicate news slug ${a.slug}`);
    seen.add(a.slug);
    if (a.content.join('').length < 800) fail(`${a.slug} content=${a.content.join('').length}, expected >=800`);
    if (a.category === 'industry' && (!a.sources || !a.sources.length)) fail(`${a.slug} industry missing sources`);
    (a.related || []).forEach((r) => {
      if (!slugs.has(r)) fail(`${a.slug} related missing ${r}`);
    });
  }
}

function checkAbout(data) {
  const c = data.page.content;
  if (!c.intro) fail('about missing intro');
  if (!c.team || !c.team.stats || c.team.stats.length < 3) fail('about team stats <3');
  if (!c.milestones || c.milestones.length < 3) fail('about milestones <3');
  if (!c.customsDocs || c.customsDocs.length !== 4) fail('about customsDocs !=4');
  (c.customsDocs || []).forEach((d) => checkImage('customs', d.image));
  if (!c.advantages || c.advantages.length < 4) fail('about advantages <4');
  if (!c.cases || c.cases.length < 3) fail('about cases <3');
  if (!c.contact || !c.contact.qq) fail('about contact.qq missing');
  checkFaq('about', data.page.faq, 4, 8, 250, 450);
}

async function main() {
  const data = {};
  for (const name of FILES) {
    try {
      data[name] = await load(name);
      checkCommon(name, data[name]);
      console.log(`[validate-json] ${name}.json parsed`);
    } catch (err) {
      fail(`${name}.json parse error: ${err.message}`);
    }
  }
  if (data.home) checkHome(data.home);
  if (data.products) checkProducts(data.products);
  if (data.solutions) checkSolutions(data.solutions);
  if (data.support) checkSupport(data.support);
  if (data.news) checkNews(data.news);
  if (data.about) checkAbout(data.about);

  console.log(`[validate-json] files=${FILES.length} errors=${errors}`);
  if (errors) process.exitCode = 1;
}

main().catch((err) => {
  console.error('[validate-json] failed:', err);
  process.exit(1);
});
