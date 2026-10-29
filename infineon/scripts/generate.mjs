#!/usr/bin/env node
/**
 * generate.mjs — 数据驱动静态站点生成器（T2.21）
 * 读取 data/*.json + templates/*.html，生成全站 HTML、sitemap、robots、llms.txt。
 */
import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'data');
const tplDir = path.join(root, 'templates');
const partialDir = path.join(tplDir, 'partials');
const BASE = (process.env.SITE_BASE || 'https://infineon.pages.dev').replace(/\/+$/, '');
const TODAY = new Date().toISOString().slice(0, 10);
const SITE_DATE = process.env.SITE_DATE || '2026-10-01';

const generated = [];

async function readJson(name) {
  return JSON.parse(await readFile(path.join(dataDir, name + '.json'), 'utf8'));
}
async function readText(p) {
  return readFile(p, 'utf8');
}
async function writePage(rel, html) {
  const full = path.join(root, rel);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, html, 'utf8');
  const url = '/' + rel.replace(/\\/g, '/').replace(/index\.html$/, '');
  generated.push(url);
}

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const attr = esc;
const abs = (p) => {
  if (!p) return BASE;
  if (typeof p === 'string' && p.startsWith('http')) return p;
  return BASE + (String(p).startsWith('/') ? p : '/' + p);
};

function seoTokens(seo) {
  return {
    SEO_TITLE: esc(seo.title),
    SEO_DESCRIPTION: esc(seo.description),
    SEO_KEYWORDS: esc((seo.keywords || []).join(',')),
    CANONICAL: abs(seo.canonical),
    OG_TITLE: esc(seo.title),
    OG_DESCRIPTION: esc(seo.description),
    OG_URL: abs(seo.canonical),
    OG_IMAGE: abs(seo.image || '/assets/img/logo.svg')
  };
}

function fill(tpl, tokens) {
  const out = tpl.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, k) => (tokens[k] !== undefined ? tokens[k] : m));
  const left = out.match(/\{\{[A-Z0-9_]+\}\}/g);
  if (left) throw new Error('Unfilled placeholders: ' + [...new Set(left)].join(', '));
  return out;
}

function ld(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
}
function breadcrumbLd(items) {
  return ld({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.url) }))
  });
}
function orgLd() {
  return ld({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '力通',
    url: BASE,
    logo: abs('/assets/img/logo.svg'),
    description: '力通是专业的英飞凌代理，提供英飞凌现货、授权渠道与 FAE 技术支持。',
    contactPoint: [{ '@type': 'ContactPoint', telephone: '0852-24248227', contactType: 'sales', areaServed: 'CN' }]
  });
}
function websiteLd() {
  return ld({ '@context': 'https://schema.org', '@type': 'WebSite', name: '力通 · 英飞凌代理', url: BASE });
}
function faqLd(faq) {
  return ld({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer.join('\n') } }))
  });
}
function productLd(m, cat) {
  return ld({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: m.model,
    sku: m.model,
    brand: { '@type': 'Brand', name: 'Infineon' },
    description: m.shortDesc,
    category: cat.name,
    image: abs(m.images[0] || '/assets/img/product-default.svg'),
    offers: {
      '@type': 'Offer',
      availability: m.stock === 'in-stock' ? 'https://schema.org/InStock' : 'https://schema.org/BackOrder',
      priceCurrency: 'CNY',
      price: '0',
      priceSpecification: { '@type': 'PriceSpecification', priceCurrency: 'CNY', price: '0', valueAddedTaxIncluded: false },
      description: '价格请询价',
      url: abs(`/products/${cat.slug}/${m.slug}.html`)
    }
  });
}
function categoryProductListLd(cat) {
  return ld({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `英飞凌${cat.name}型号列表`,
    itemListElement: cat.models.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: m.model,
        sku: m.model,
        brand: { '@type': 'Brand', name: 'Infineon' },
        description: m.shortDesc,
        offers: {
          '@type': 'Offer',
          availability: m.stock === 'in-stock' ? 'https://schema.org/InStock' : 'https://schema.org/BackOrder',
          priceCurrency: 'CNY',
          price: '0',
          priceSpecification: { '@type': 'PriceSpecification', priceCurrency: 'CNY', price: '0', valueAddedTaxIncluded: false },
          description: '价格请询价',
          url: abs(`/products/${cat.slug}/${m.slug}.html`)
        }
      }
    }))
  });
}
function itemListLd(name, items) {
  return ld({ '@context': 'https://schema.org', '@type': 'ItemList', name, itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: abs(it.url) })) });
}
function newsArticleLd(a, type) {
  return ld({
    '@context': 'https://schema.org',
    '@type': type,
    headline: a.title,
    description: a.excerpt,
    image: abs(a.cover),
    datePublished: a.date,
    dateModified: a.date,
    author: { '@type': 'Person', name: a.author },
    publisher: { '@type': 'Organization', name: '力通', logo: { '@type': 'ImageObject', url: abs('/assets/img/logo.svg') } },
    mainEntityOfPage: abs(`/news/${a.slug}.html`)
  });
}
function techArticleLd(a, author) {
  return ld({
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: a.title,
    description: a.excerpt,
    datePublished: a.date,
    dateModified: a.date,
    author: { '@type': 'Person', name: author.name, jobTitle: author.expertise },
    publisher: { '@type': 'Organization', name: '力通' },
    mainEntityOfPage: abs(`/support/${a.category}/${a.slug}.html`)
  });
}

function breadcrumb(items) {
  if (!items || !items.length) return '';
  return `<nav class="breadcrumb" aria-label="面包屑"><ol class="breadcrumb-list">${items
    .map((it, i) => {
      const last = i === items.length - 1;
      return `<li class="breadcrumb-item"${last ? ' aria-current="page"' : ''}>${last ? esc(it.name) : `<a href="${attr(it.url)}">${esc(it.name)}</a>`}</li>`;
    })
    .join('')}</ol></nav>`;
}

function newsCategoryName(cat) {
  if (cat === 'company') return '公司新闻';
  if (cat === 'industry') return '行业动态';
  throw new Error(`Unknown news category: ${cat}`);
}

function stockBadge(stock) {
  const inStock = stock === 'in-stock';
  return `<span class="badge ${inStock ? 'badge-stock-in' : 'badge-stock-inquiry'}">${inStock ? '有货' : '询价'}</span>`;
}

function fallbackSvg(label, w = 400, h = 260) {
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}"><rect width="${w}" height="${h}" rx="12" fill="#e6f2fb"></rect><rect x="${w * 0.3}" y="${h * 0.28}" width="${w * 0.4}" height="${h * 0.44}" rx="8" fill="#0072ce"></rect><text x="${w / 2}" y="${h / 2 + 6}" text-anchor="middle" fill="#fff" font-size="16">${esc(label)}</text></svg>`;
}

function mediaImage(src, label) {
  const rel = (src || '').replace(/^\//, '');
  if (rel && existsSync(path.join(root, rel))) {
    return `<img src="/${rel}" alt="${esc(label)}" loading="lazy" decoding="async">`;
  }
  return fallbackSvg(label);
}

function avatarImage(author, size = 48) {
  const rel = (author.avatar || '').replace(/^\//, '');
  if (rel && existsSync(path.join(root, rel))) {
    return `<img src="/${rel}" alt="${esc(author.name)}" width="${size}" height="${size}" loading="lazy">`;
  }
  const initial = (author.name || '').slice(0, 1);
  return `<svg viewBox="0 0 48 48" width="${size}" height="${size}" role="img" aria-label="${esc(author.name)}"><circle cx="24" cy="24" r="24" fill="#e6f2fb"></circle><text x="24" y="30" text-anchor="middle" fill="#0072ce" font-size="18">${esc(initial)}</text></svg>`;
}

function card({ title, text, url, meta, media, cta = '查看详情' }) {
  return `<article class="card"><div class="card-media" aria-hidden="true">${media || ''}</div><div class="card-body"><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p>${meta ? `<span class="card-meta">${esc(meta)}</span>` : ''}<a class="card-link" href="${attr(url)}">${esc(cta)}</a></div></article>`;
}

function feature({ title, desc, icon }) {
  return `<article class="card card--icon"><div class="card-media" aria-hidden="true">${mediaImage(icon, title)}</div><div class="card-body"><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(desc)}</p></div></article>`;
}

function faqHtml(faq) {
  return faq
    .map(
      (f, i) =>
        `<details class="faq-item"${i === 0 ? ' open' : ''}><summary>${esc(f.question)}</summary><div class="faq-a">${f.answer.map((p) => `<p>${esc(p)}</p>`).join('')}${f.decisionGuide ? `<p><strong>建议：</strong>${esc(f.decisionGuide)}</p>` : ''}</div></details>`
    )
    .join('');
}

function articleSections(paragraphs) {
  const titles = ['概述', '关键步骤', '实践与注意', '总结'];
  const n = paragraphs.length;
  if (!n) return [];
  const size = Math.max(1, Math.ceil(n / 4));
  const sections = [];
  for (let i = 0; i < 4; i += 1) {
    const group = paragraphs.slice(i * size, (i + 1) * size);
    if (group.length) sections.push({ title: titles[i] || `第${i + 1}部分`, paragraphs: group });
  }
  return sections;
}

function sectionsHtml(sections) {
  return sections.map((s, i) => `<section id="section-${i + 1}"><h2>${s.title}</h2>${s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</section>`).join('');
}

function sidebarCategories(active) {
  return `<aside class="sidebar" aria-label="产品分类导航"><h2 class="sidebar-title">产品分类</h2><ul class="sidebar-nav">${products.categories
    .map(
      (c) =>
        `<li><a href="/products/${c.slug}/" class="${c.slug === active ? 'is-active' : ''}"${c.slug === active ? ' aria-current="page"' : ''}>${esc(c.name)} <span class="count">${c.models.length}</span></a></li>`
    )
    .join('')}</ul></aside>`;
}

function sidebarToc(sections, related) {
  return `<aside class="sidebar" aria-label="文章辅助导航"><div class="sidebar-sticky"><nav class="toc" aria-label="文章目录"><h2 class="sidebar-title">文章目录</h2><ul class="toc-list">${sections
    .map((s, i) => `<li><a href="#section-${i + 1}">${i + 1}. ${s.title}</a></li>`)
    .join('')}</ul></nav><div class="sidebar-card"><h3>相关 PDF 下载</h3><p>选型手册与数据手册可在技术支持中心索取。</p><a class="btn btn-secondary btn-block" href="/support/">前往资料中心</a></div><div class="sidebar-card"><h3>向工程师提问</h3><p>提交问题后由 FAE 跟进。</p><a class="btn btn-secondary btn-block" href="/contact/">联系 FAE</a></div><div class="sidebar-card"><h3>相关文章</h3><ul class="related-list">${related
    .map((r) => `<li><a href="${r.url}">${esc(r.title)}</a></li>`)
    .join('')}</ul></div></div></aside>`;
}

function detailSidebar(items, title = '相关型号') {
  return `<aside class="sidebar" aria-label="相关推荐"><div class="sidebar-sticky"><div class="sidebar-card"><h3>${title}</h3><ul class="related-list">${items
    .map((it) => `<li><a href="${it.url}">${esc(it.label)}</a></li>`)
    .join('')}</ul></div><div class="sidebar-card"><h3>获取报价</h3><p>提交型号与数量，快速获取报价与交期。</p><a class="btn btn-primary btn-block" href="/contact/">获取报价</a></div></div></aside>`;
}

function tableHtml(cat) {
  const models = cat.models;
  const keySet = new Set();
  models.forEach((m) => Object.keys(m.params).forEach((k) => keySet.add(k)));
  const keys = [...keySet];
  const numKey = (k) => /主频|Flash|RAM|电流|耐压|RDS|分辨率|量程|温度/.test(k);
  const unique = (arr) => [...new Set(arr.filter((v) => v !== undefined && v !== ''))];
  const chip = (key, value) => `<button class="filter-chip" type="button" data-filter-key="${attr(key)}" data-filter-value="${attr(value)}">${esc(value)}</button>`;
  const chipGroups = [
    { key: 'package', values: unique(models.map((m) => m.package)) },
    ...keys.map((key) => ({ key, values: unique(models.map((m) => m.params[key])) }))
  ];
  const chips = chipGroups.map((g) => g.values.slice(0, 4).map((v) => chip(g.key, v)).join('')).join('');
  const sortAttr = (k) => `data-sort="${numKey(k) ? 'number' : 'text'}" tabindex="0" role="button"`;
  const head = `<tr><th data-sort="text" tabindex="0" role="button">型号</th><th data-sort="text" tabindex="0" role="button">系列</th>${keys.map((k) => `<th ${sortAttr(k)}>${esc(k)}</th>`).join('')}<th data-sort="text" tabindex="0" role="button">封装</th><th>库存</th><th>操作</th></tr>`;
  const rows = models
    .map((m) => {
      const href = `/products/${cat.slug}/${m.slug}.html`;
      return `<tr><td class="col-model" data-col="model"><a href="${href}">${esc(m.model)}</a></td><td data-col="series">${esc(m.series)}</td>${keys
        .map((k) => `<td data-col="${attr(k)}">${esc(m.params[k] || '—')}</td>`)
        .join('')}<td data-col="package">${esc(m.package)}</td><td>${stockBadge(m.stock)}</td><td><a href="${href}">查看详情</a></td></tr>`;
    })
    .join('');
  return `<div data-table><div class="table-toolbar"><input class="table-search" type="search" placeholder="搜索型号 / 系列 / 封装" data-table-search aria-label="搜索型号"><span class="table-count" data-table-count aria-live="polite"></span><button class="btn btn-ghost btn-sm" type="button" data-table-clear>清除筛选</button><div class="filter-chips">${chips}</div></div><div class="table-wrap"><table class="data-table"><caption>${esc(cat.name)} 型号与关键参数（以最新规格书为准）</caption><thead>${head}</thead><tbody>${rows}</tbody></table></div><p class="table-empty" data-table-empty hidden aria-live="polite">没有匹配的型号，请清除筛选或更换关键词。</p></div>`;
}

function articleCard(a, catName) {
  return card({
    title: a.title,
    text: a.excerpt || a.summary || '',
    url: `/support/${a.category}/${a.slug}.html`,
    meta: `${catName} · ${a.date}`,
    media: mediaImage(`assets/img/icon-${a.category}.svg`, a.title)
  });
}

function newsCard(n) {
  return card({
    title: n.title,
    text: n.excerpt || n.summary || '',
    url: `/news/${n.slug}.html`,
    meta: `${newsCategoryName(n.category)} · ${n.date}`,
    media: mediaImage(n.cover, n.title)
  });
}

function modelIndexBuild(categories) {
  const map = new Map();
  for (const c of categories) {
    for (const m of c.models) {
      if (map.has(m.model)) throw new Error(`Duplicate model: ${m.model}`);
      map.set(m.model, { cat: c, model: m });
    }
  }
  return map;
}

function modelLinkByName(name) {
  const hit = modelIndex.get(name);
  if (!hit) {
    console.warn(`[generate] unknown model reference: ${name}`);
    return `<span>${esc(name)}（型号未收录）</span>`;
  }
  return `<a href="/products/${hit.cat.slug}/${hit.model.slug}.html">${esc(name)}</a>`;
}

function companionCardByName(name) {
  const hit = modelIndex.get(name);
  if (!hit) return '';
  return card({
    title: hit.model.model,
    text: hit.model.shortDesc,
    url: `/products/${hit.cat.slug}/${hit.model.slug}.html`,
    meta: `${hit.cat.name} · ${hit.model.package}`,
    media: mediaImage(hit.model.images[0], hit.model.model)
  });
}

function header(active) {
  let h = partials.header;
  h = h.replace(/ class="nav-link is-active"/g, ' class="nav-link"').replace(/ aria-current="page"/g, '');
  if (active) {
    const re = new RegExp(`<a class="nav-link" href="${active.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`);
    h = h.replace(re, `<a class="nav-link is-active" aria-current="page" href="${active}"`);
  }
  return h;
}

/* ------------------------------------------------------------------ */
let home;
let products;
let solutions;
let support;
let news;
let about;
let partials = {};
let modelIndex = new Map();

async function loadPartials() {
  for (const name of ['header', 'footer', 'detail-cta']) {
    partials[name] = await readText(path.join(partialDir, name + '.html'));
  }
}
async function loadTemplate(name) {
  return readText(path.join(tplDir, name + '.html'));
}

function validateData() {
  const need = (cond, msg) => {
    if (!cond) throw new Error(`[validate] ${msg}`);
  };
  need(home && home.page && home.page.content, 'home.page.content missing');
  need(products && Array.isArray(products.categories) && products.categories.length === 4, `products categories=${products && products.categories ? products.categories.length : 0}`);
  const models = (products.categories || []).flatMap((c) => c.models || []);
  need(models.length === 24, `products models=${models.length}`);
  need(models.filter((m) => m.depth === 'deep').length === 8, 'deep models !=8');
  need(models.filter((m) => m.depth === 'standard').length === 16, 'standard models !=16');
  need(solutions && Array.isArray(solutions.solutions) && solutions.solutions.length === 4, 'solutions !=4');
  need(support && Array.isArray(support.articles) && support.articles.length === 4, 'support articles !=4');
  need(support && Array.isArray(support.authors) && support.authors.length >= 2, 'support authors <2');
  need(support && Array.isArray(support.tags) && support.tags.length >= 4, 'support tags <4');
  need(news && Array.isArray(news.articles) && news.articles.length === 4, 'news articles !=4');
  need(about && about.global && about.page, 'about global/page missing');
  for (const cat of products.categories) {
    need(Array.isArray(cat.models) && cat.models.length === 6, `${cat.slug} models !=6`);
    for (const m of cat.models) {
      need(Array.isArray(m.images) && m.images.length, `${cat.slug}/${m.model} images missing`);
      need(m.params && Object.keys(m.params).length, `${cat.slug}/${m.model} params missing`);
    }
  }
  for (const a of support.articles) {
    need(support.authors.some((x) => x.id === a.author), `${a.slug} bad author ${a.author}`);
    need(support.categories.some((c) => c.slug === a.category), `${a.slug} bad category ${a.category}`);
  }
  for (const a of news.articles) {
    need(a.category === 'company' || a.category === 'industry', `${a.slug} bad category`);
  }
}

async function pruneStale() {
  const keep = new Set(generated.map((u) => (u === '/' ? 'index.html' : u.endsWith('/') ? `${u.slice(1)}index.html` : u.slice(1))));
  const skip = new Set(['templates', 'assets', 'data', 'scripts', 'node_modules']);
  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (skip.has(entry.name) || entry.name.startsWith('.')) continue;
        await walk(path.join(dir, entry.name));
      } else if (entry.name.endsWith('.html')) {
        const rel = path.relative(root, path.join(dir, entry.name)).replace(/\\/g, '/');
        if (!keep.has(rel)) {
          await unlink(path.join(dir, entry.name));
          console.log(`[generate] pruned ${rel}`);
        }
      }
    }
  }
  await walk(root);
}

async function buildHome() {
  const tpl = await loadTemplate('home');
  const p = home.page;
  const c = p.content;
  const tokens = {
    ...seoTokens(p.seo),
    SCHEMA: [orgLd(), websiteLd(), faqLd(p.faq)].join('\n'),
    HEADER: header('/'),
    FOOTER: partials.footer,
    HERO_TITLE: esc(c.hero.title),
    HERO_SUBTITLE: esc(c.hero.subtitle),
    HERO_ACTIONS: `<a class="btn btn-primary" href="${attr(c.hero.primaryCta.url)}">${esc(c.hero.primaryCta.label)}</a><a class="btn btn-secondary" href="${attr(c.hero.secondaryCta.url)}">${esc(c.hero.secondaryCta.label)}</a>`,
    HERO_TRUST: c.hero.trust.map((t) => `<span>${esc(t)}</span>`).join(''),
    HERO_ART: fallbackSvg('英飞凌器件与方案', 400, 300),
    ADVANTAGES: c.advantages.map(feature).join(''),
    CATEGORIES: c.categories.map((cat) => card({ title: cat.name, text: cat.desc, url: cat.url, meta: `${cat.count} 个型号`, media: mediaImage(cat.icon, cat.name) })).join(''),
    SOLUTIONS: c.solutions.map((s) => card({ title: s.title, text: s.summary, url: s.url, meta: s.industry, media: mediaImage('assets/img/solution-default.svg', s.title) })).join(''),
    ARTICLES: c.articles.map((a) => articleCard(a, '技术支持')).join(''),
    NEWS: c.news.map(newsCard).join(''),
    FAQ: faqHtml(p.faq),
    CTA_TITLE: esc(c.cta.title),
    CTA_DESC: esc(c.cta.desc),
    CTA_ACTIONS: `<a class="btn btn-primary" href="${attr(c.cta.primaryCta.url)}">${esc(c.cta.primaryCta.label)}</a><a class="btn btn-secondary" href="${attr(c.cta.secondaryCta.url)}">${esc(c.cta.secondaryCta.label)}</a>`
  };
  await writePage('index.html', fill(tpl, tokens));
}

async function buildProductsList() {
  const tpl = await loadTemplate('products-list');
  const p = products.page;
  const cats = products.categories;
  const tokens = {
    ...seoTokens(p.seo),
    SCHEMA: [itemListLd('英飞凌产品分类', cats.map((c) => ({ name: c.name, url: `/products/${c.slug}/` }))), faqLd(p.faq)].join('\n'),
    HEADER: header('/products/'),
    FOOTER: partials.footer,
    BREADCRUMB: breadcrumb(p.breadcrumbs),
    PAGE_TITLE: '英飞凌产品中心',
    PAGE_DESC: esc(p.content.intro),
    GUIDE_STRIP: `<div class="sidebar-card"><h2 class="sidebar-title">如何选型？</h2><p>从主频、Flash、外设与封装四个维度建立选型框架，再结合供货状态收敛型号。</p><a class="btn btn-secondary" href="/support/guides/how-to-choose-infineon-mcu.html">阅读选型指南</a></div>`,
    CATEGORY_CARDS: cats.map((c) => card({ title: c.name, text: c.description.slice(0, 90) + '…', url: `/products/${c.slug}/`, meta: `${c.models.length} 个型号`, media: mediaImage(c.icon, c.name) })).join(''),
    FAQ: faqHtml(p.faq)
  };
  await writePage('products/index.html', fill(tpl, tokens));
}

async function buildCategory(cat) {
  const tpl = await loadTemplate('product-category');
  const url = `/products/${cat.slug}/`;
  const breadcrumbs = [{ name: '首页', url: '/' }, { name: '产品中心', url: '/products/' }, { name: cat.name, url }];
  const seo = {
    title: `英飞凌${cat.name}代理_${cat.name}型号参数与选型-力通`,
    description: `英飞凌${cat.name}代理，力通提供${cat.name}型号参数、现货/询价与选型支持，覆盖${cat.models.slice(0, 3).map((m) => m.model).join('、')}等型号。`,
    keywords: [`英飞凌${cat.name}代理`, `英飞凌${cat.name}`, '英飞凌现货'],
    canonical: url
  };
  const tokens = {
    ...seoTokens(seo),
    SCHEMA: [breadcrumbLd(breadcrumbs), categoryProductListLd(cat), faqLd(cat.faq)].join('\n'),
    HEADER: header('/products/'),
    FOOTER: partials.footer,
    BREADCRUMB: breadcrumb(breadcrumbs),
    PAGE_TITLE: `英飞凌${cat.name}代理`,
    CATEGORY_DESC: esc(cat.description),
    GUIDE_LINK: `<div class="sidebar-card"><h2 class="sidebar-title">选型指南</h2><p>${esc(cat.guideLink.label)}</p><a class="btn btn-secondary" href="${attr(cat.guideLink.url)}">阅读选型指南</a></div>`,
    TABLE: tableHtml(cat),
    FAE_REVIEW: `<blockquote class="sidebar-card"><p><strong>FAE 点评 · ${esc(cat.faeReview.author)}</strong></p><p>${esc(cat.faeReview.text)}</p></blockquote>`,
    APPLICATIONS: cat.applications.map((a) => feature({ title: a.name, desc: a.desc })).join(''),
    ADVANTAGES: cat.advantages.map((a) => feature({ title: a.title, desc: a.desc })).join(''),
    ALTERNATIVES: `<h3>替代料号</h3><ul class="related-list">${cat.alternatives.map((x) => `<li><a href="${attr(x.url)}">${esc(x.model)}</a></li>`).join('')}</ul>`,
    COMPANIONS: `<h3>配套料号</h3><ul class="related-list">${cat.companions.map((x) => `<li><a href="${attr(x.url)}">${esc(x.model)}</a></li>`).join('')}</ul>`,
    FAQ: faqHtml(cat.faq),
    CATEGORY_CTA: `<div class="container"><h2>需要${esc(cat.name)}选型支持？</h2><p>提交项目参数，力通 FAE 将协助选型与替代料验证。</p><div class="cta-actions"><a class="btn btn-primary" href="/contact/">获取报价</a><a class="btn btn-secondary" href="/contact/">咨询技术问题</a></div></div>`,
    SIDEBAR: sidebarCategories(cat.slug)
  };
  await writePage(`products/${cat.slug}/index.html`, fill(tpl, tokens));
}

async function buildModel(cat, m) {
  const tpl = await loadTemplate('product-detail');
  const url = `/products/${cat.slug}/${m.slug}.html`;
  const breadcrumbs = [{ name: '首页', url: '/' }, { name: '产品中心', url: '/products/' }, { name: cat.name, url: `/products/${cat.slug}/` }, { name: m.model, url }];
  const seo = {
    title: `${m.model}英飞凌${cat.name}参数_封装_现货报价-力通代理`,
    description: `${m.model} 英飞凌${cat.name}型号，${m.shortDesc} 力通提供英飞凌代理、现货/询价与选型支持，具体参数以规格书为准。`,
    keywords: [m.model, `英飞凌${m.model}`, `英飞凌${cat.name}代理`],
    canonical: url
  };
  const sections = articleSections(m.description.split(/\n\n+/));
  const specs = `<table class="data-table spec-table"><caption>${esc(m.model)} 规格参数（以最新规格书为准）</caption><thead><tr><th>参数</th><th>数值</th></tr></thead><tbody>${Object.entries(m.params)
    .map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`)
    .join('')}<tr><td>封装</td><td>${esc(m.package)}</td></tr><tr><td>库存</td><td>${stockBadge(m.stock)}</td></tr></tbody></table>`;
  const related = [...m.alternatives, ...m.companions]
    .map((n) => modelIndex.get(n))
    .filter(Boolean)
    .map((hit) => ({ label: hit.model.model, url: `/products/${hit.cat.slug}/${hit.model.slug}.html` }));
  const tokens = {
    ...seoTokens(seo),
    SCHEMA: [breadcrumbLd(breadcrumbs), productLd(m, cat), faqLd(m.faq)].join('\n'),
    HEADER: header('/products/'),
    FOOTER: partials.footer,
    BREADCRUMB: breadcrumb(breadcrumbs),
    MODEL: esc(m.model),
    MODEL_IMAGE: mediaImage(m.images[0], `${m.model} 英飞凌 ${cat.name}`),
    MODEL_THUMBS: [0, 1, 2, 3].map((i) => `<button class="model-thumb${i === 0 ? ' is-active' : ''}" type="button" aria-label="查看 ${esc(m.model)} 图片 ${i + 1}">${mediaImage(m.images[i] || m.images[0], `${m.model} 图 ${i + 1}`)}</button>`).join(''),
    MODEL_META: `<span class="tag">${esc(m.series)}</span><span class="tag">${esc(m.package)}</span>${stockBadge(m.stock)}`,
    MODEL_SHORT: esc(m.shortDesc),
    MODEL_ACTIONS: `<a class="btn btn-primary" href="/contact/">获取报价</a><a class="btn btn-secondary" href="/contact/">索取数据手册</a>`,
    TAB_OVERVIEW: sectionsHtml(sections),
    TAB_SPECS: specs,
    TAB_CIRCUIT: `<p>典型应用电路需结合驱动、保护与散热设计，建议参考数据手册与 FAE 建议。</p><ul>${m.applications.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>`,
    TAB_DOCS: `<ul>${m.documents.map((d) => `<li><a href="${attr(d.url)}">${esc(d.label)}</a></li>`).join('')}</ul>`,
    APPLICATIONS: m.applications.map((a) => feature({ title: a, desc: '典型应用场景' })).join(''),
    ALTERNATIVES: `<h3>替代料号</h3><ul class="related-list">${m.alternatives.map((n) => `<li>${modelLinkByName(n)}</li>`).join('')}</ul>`,
    COMPANIONS: `<h3>配套料号</h3><ul class="related-list">${m.companions.map((n) => `<li>${modelLinkByName(n)}</li>`).join('')}</ul>`,
    FAQ: faqHtml(m.faq),
    COMPANION_CARDS: m.companions.map(companionCardByName).join(''),
    DETAIL_SIDEBAR: detailSidebar(related),
    DETAIL_CTA: partials['detail-cta']
  };
  await writePage(`products/${cat.slug}/${m.slug}.html`, fill(tpl, tokens));
}

async function buildSolutionsList() {
  const tpl = await loadTemplate('solutions-list');
  const p = solutions.page;
  const tokens = {
    ...seoTokens(p.seo),
    SCHEMA: [itemListLd('英飞凌行业解决方案', solutions.solutions.map((s) => ({ name: s.title, url: `/solutions/${s.slug}/` }))), faqLd(p.faq)].join('\n'),
    HEADER: header('/solutions/'),
    FOOTER: partials.footer,
    BREADCRUMB: breadcrumb(p.breadcrumbs),
    PAGE_TITLE: '英飞凌行业解决方案',
    PAGE_DESC: esc(p.content.intro),
    SOLUTION_CARDS: solutions.solutions.map((s) => card({ title: s.title, text: s.summary, url: `/solutions/${s.slug}/`, meta: s.industry, media: mediaImage(s.heroImage, s.title) })).join(''),
    FAQ: faqHtml(p.faq)
  };
  await writePage('solutions/index.html', fill(tpl, tokens));
}

async function buildSolutionDetail(s) {
  const tpl = await loadTemplate('solution-detail');
  const url = `/solutions/${s.slug}/`;
  const breadcrumbs = [{ name: '首页', url: '/' }, { name: '解决方案', url: '/solutions/' }, { name: s.title, url }];
  const seo = {
    title: `${s.title}_英飞凌方案与BOM-力通`,
    description: `${s.summary} 力通提供英飞凌代理、BOM 与选型支持。`,
    keywords: [s.title, `英飞凌${s.industry}方案`, '英飞凌BOM'],
    canonical: url
  };
  const related = s.related.map((r) => ({ label: r.title, url: r.url }));
  const tokens = {
    ...seoTokens(seo),
    SCHEMA: [breadcrumbLd(breadcrumbs), faqLd(s.faq), ld({ '@context': 'https://schema.org', '@type': 'Article', headline: s.title, description: s.summary, image: abs(s.heroImage), datePublished: SITE_DATE, dateModified: SITE_DATE, author: { '@type': 'Organization', name: '力通' }, mainEntityOfPage: abs(url) })].join('\n'),
    HEADER: header('/solutions/'),
    FOOTER: partials.footer,
    BREADCRUMB: breadcrumb(breadcrumbs),
    SOLUTION_TITLE: esc(s.title),
    SOLUTION_SUMMARY: esc(s.summary),
    OVERVIEW: s.overview.map((p) => `<p>${esc(p)}</p>`).join(''),
    BLOCK_DIAGRAM: mediaImage(s.blockDiagram.src, s.blockDiagram.alt),
    ADVANTAGES: s.advantages.map((a) => feature({ title: a.title, desc: a.desc })).join(''),
    TECH_STRENGTH: s.techStrength.map((a) => feature({ title: a.title, desc: a.desc })).join(''),
    BOM_TABLE: `<div class="table-wrap"><table class="data-table"><caption>推荐物料清单（BOM）</caption><thead><tr><th>型号</th><th>角色</th><th>关键参数</th></tr></thead><tbody>${s.bom
      .map((b) => `<tr><td class="col-model"><a href="${attr(b.url)}">${esc(b.model)}</a></td><td>${esc(b.role)}</td><td>${esc(b.keyParams)}</td></tr>`)
      .join('')}</tbody></table></div>`,
    SCENARIOS: `<ul>${s.scenarios.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`,
    INTEGRATION: `<ul>${s.integration.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`,
    FAQ: faqHtml(s.faq),
    DETAIL_SIDEBAR: detailSidebar(related, '相关方案与文章'),
    DETAIL_CTA: partials['detail-cta']
  };
  await writePage(`solutions/${s.slug}/index.html`, fill(tpl, tokens));
}

async function buildSupportList() {
  const tpl = await loadTemplate('support-list');
  const p = support.page;
  const buttons = support.categories
    .map((c, i) => `<button class="tab" role="tab" id="tab-${c.slug}" aria-controls="panel-${c.slug}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(c.name)}</button>`)
    .join('');
  const panels = support.categories
    .map((c, i) => {
      const arts = support.articles.filter((a) => a.category === c.slug);
      return `<div class="tab-panel" role="tabpanel" id="panel-${c.slug}" aria-labelledby="tab-${c.slug}"${i === 0 ? '' : ' hidden'}><h2 class="visually-hidden">${esc(c.name)}文章</h2><div class="grid grid-3">${arts.map((a) => articleCard(a, c.name)).join('')}</div></div>`;
    })
    .join('');
  const tokens = {
    ...seoTokens(p.seo),
    SCHEMA: [itemListLd('英飞凌技术支持文章', support.articles.map((a) => ({ name: a.title, url: `/support/${a.category}/${a.slug}.html` }))), faqLd(p.faq)].join('\n'),
    HEADER: header('/support/'),
    FOOTER: partials.footer,
    BREADCRUMB: breadcrumb(p.breadcrumbs),
    PAGE_TITLE: '英飞凌技术支持',
    PAGE_DESC: esc(p.content.intro),
    TAB_BUTTONS: buttons,
    TAB_PANELS: panels,
    TAGS: `<div class="filter-chips">${support.tags.map((t) => `<a class="tag" href="/support/tags/${t.slug}.html">${esc(t.name)}</a>`).join('')}</div>`,
    FAQ: faqHtml(p.faq)
  };
  await writePage('support/index.html', fill(tpl, tokens));
}

async function buildSupportCategory(cat) {
  const tpl = await loadTemplate('support-category');
  const url = `/support/${cat.slug}/`;
  const breadcrumbs = [{ name: '首页', url: '/' }, { name: '技术支持', url: '/support/' }, { name: cat.name, url }];
  const seo = {
    title: `英飞凌${cat.name}_技术文章与实战-力通`,
    description: `${cat.desc} 力通英飞凌代理技术支持，提供选型、应用与问题排查文章，覆盖 MCU、IGBT、MOSFET 与传感器。`,
    keywords: [`英飞凌${cat.name}`, '英飞凌技术支持', '力通FAE'],
    canonical: url
  };
  const arts = support.articles.filter((a) => a.category === cat.slug);
  const tokens = {
    ...seoTokens(seo),
    SCHEMA: [breadcrumbLd(breadcrumbs), itemListLd(`英飞凌${cat.name}`, arts.map((a) => ({ name: a.title, url: `/support/${cat.slug}/${a.slug}.html` })))].join('\n'),
    HEADER: header('/support/'),
    FOOTER: partials.footer,
    BREADCRUMB: breadcrumb(breadcrumbs),
    PAGE_TITLE: `英飞凌${cat.name}`,
    PAGE_DESC: esc(cat.desc),
    ARTICLE_CARDS: arts.map((a) => articleCard(a, cat.name)).join(''),
    FAQ: faqHtml(support.page.faq)
  };
  await writePage(`support/${cat.slug}/index.html`, fill(tpl, tokens));
}

async function buildSupportArticle(a) {
  const tpl = await loadTemplate('support-detail');
  const cat = support.categories.find((c) => c.slug === a.category);
  const author = support.authors.find((x) => x.id === a.author);
  if (!author) throw new Error(`Unknown author ${a.author} for article ${a.slug}`);
  const url = `/support/${a.category}/${a.slug}.html`;
  const breadcrumbs = [{ name: '首页', url: '/' }, { name: '技术支持', url: '/support/' }, { name: cat.name, url: `/support/${cat.slug}/` }, { name: a.title, url }];
  const sections = articleSections(a.content);
  const related = a.related
    .map((slug) => support.articles.find((x) => x.slug === slug))
    .filter(Boolean)
    .map((x) => card({ title: x.title, text: x.excerpt, url: `/support/${x.category}/${x.slug}.html`, meta: `${support.categories.find((c) => c.slug === x.category).name} · ${x.date}`, media: mediaImage(`assets/img/icon-${x.category}.svg`, x.title) }))
    .join('');
  const seo = {
    title: `${a.title}_英飞凌技术文章-力通`,
    description: `${a.excerpt} 力通英飞凌代理 FAE 技术支持，提供选型与问题排查建议。`,
    keywords: [a.title, '英飞凌技术支持', ...a.tags],
    canonical: url
  };
  const tokens = {
    ...seoTokens(seo),
    SCHEMA: [breadcrumbLd(breadcrumbs), techArticleLd(a, author), faqLd(a.faq)].join('\n'),
    HEADER: header('/support/'),
    FOOTER: partials.footer,
    BREADCRUMB: breadcrumb(breadcrumbs),
    CATEGORY_LABEL: `<span class="tag">${esc(cat.name)}</span>`,
    ARTICLE_TITLE: esc(a.title),
    AUTHOR_BAR: `${avatarImage(author)}<span><a href="/support/authors/${author.id}.html">${esc(author.name)}</a> · ${esc(author.expertise)} · ${esc(a.date)}</span>`,
    ARTICLE_CONTENT: sectionsHtml(sections),
    TAGS: `<div class="filter-chips">${a.tags.map((t) => {
      const label = (support.tags.find((x) => x.slug === t) || {}).name || t;
      return `<a class="tag" href="/support/tags/${t}.html">${esc(label)}</a>`;
    }).join('')}</div>`,
    FAQ: faqHtml(a.faq),
    RELATED: related,
    SIDEBAR_TOC: sidebarToc(sections, a.related.map((slug) => {
      const x = support.articles.find((y) => y.slug === slug);
      return x ? { title: x.title, url: `/support/${x.category}/${x.slug}.html` } : null;
    }).filter(Boolean)),
    DETAIL_CTA: partials['detail-cta']
  };
  await writePage(`support/${a.category}/${a.slug}.html`, fill(tpl, tokens));
}

async function buildAuthor(author) {
  const tpl = await loadTemplate('author');
  const url = `/support/authors/${author.id}.html`;
  const breadcrumbs = [{ name: '首页', url: '/' }, { name: '技术支持', url: '/support/' }, { name: author.name, url }];
  const arts = support.articles.filter((x) => x.author === author.id);
  const seo = { title: `${author.name}_英飞凌FAE工程师-力通`, description: `${author.bio} 力通英飞凌代理 FAE，专长 ${author.expertise}。`, keywords: [author.name, '英飞凌FAE', author.expertise], canonical: url };
  const tokens = {
    ...seoTokens(seo),
    SCHEMA: [breadcrumbLd(breadcrumbs), ld({ '@context': 'https://schema.org', '@type': 'ProfilePage', mainEntity: { '@type': 'Person', name: author.name, jobTitle: author.expertise, description: author.bio } })].join('\n'),
    HEADER: header('/support/'),
    FOOTER: partials.footer,
    BREADCRUMB: breadcrumb(breadcrumbs),
    AUTHOR_NAME: esc(author.name),
    AUTHOR_CARD: `${avatarImage(author, 96)}<h2>${esc(author.name)}</h2><p><strong>专长：</strong>${esc(author.expertise)}</p><p><strong>经验：</strong>${esc(author.experience)}</p>${author.note ? `<p class="form-note">${esc(author.note)}</p>` : ''}`,
    AUTHOR_BIO: `<p>${esc(author.bio)}</p>`,
    AUTHOR_ARTICLES: arts.map((a) => articleCard(a, support.categories.find((c) => c.slug === a.category).name)).join(''),
    DETAIL_CTA: partials['detail-cta']
  };
  await writePage(`support/authors/${author.id}.html`, fill(tpl, tokens));
}

async function buildTag(tag) {
  const tpl = await loadTemplate('tag');
  const url = `/support/tags/${tag.slug}.html`;
  const breadcrumbs = [{ name: '首页', url: '/' }, { name: '技术支持', url: '/support/' }, { name: tag.name, url }];
  const arts = support.articles.filter((a) => a.tags.includes(tag.slug));
  const seo = { title: `英飞凌${tag.name}技术文章_力通`, description: `与 ${tag.name} 相关的英飞凌技术文章与实战经验，覆盖选型、驱动、散热与问题排查，力通英飞凌代理提供现货与 FAE 支持。`, keywords: [tag.name, '英飞凌技术支持'], canonical: url };
  const tokens = {
    ...seoTokens(seo),
    SCHEMA: [breadcrumbLd(breadcrumbs), itemListLd(`英飞凌${tag.name}`, arts.map((a) => ({ name: a.title, url: `/support/${a.category}/${a.slug}.html` })))].join('\n'),
    HEADER: header('/support/'),
    FOOTER: partials.footer,
    BREADCRUMB: breadcrumb(breadcrumbs),
    TAG_NAME: esc(tag.name),
    TAG_DESC: `与 ${esc(tag.name)} 相关的英飞凌技术文章与实战经验。`,
    TAG_ARTICLES: arts.map((a) => articleCard(a, support.categories.find((c) => c.slug === a.category).name)).join(''),
    RELATED_TAGS: `<div class="filter-chips">${support.tags.filter((t) => t.slug !== tag.slug).map((t) => `<a class="tag" href="/support/tags/${t.slug}.html">${esc(t.name)}</a>`).join('')}</div>`,
    DETAIL_CTA: partials['detail-cta']
  };
  await writePage(`support/tags/${tag.slug}.html`, fill(tpl, tokens));
}

async function buildNewsList() {
  const tpl = await loadTemplate('news-list');
  const p = news.page;
  const tokens = {
    ...seoTokens(p.seo),
    SCHEMA: [itemListLd('英飞凌新闻', news.articles.map((a) => ({ name: a.title, url: `/news/${a.slug}.html` })))].join('\n'),
    HEADER: header('/news/'),
    FOOTER: partials.footer,
    BREADCRUMB: breadcrumb(p.breadcrumbs),
    PAGE_TITLE: '新闻中心',
    PAGE_DESC: esc(p.content.intro),
    COMPANY_NEWS: news.articles.filter((a) => a.category === 'company').map(newsCard).join(''),
    INDUSTRY_NEWS: news.articles.filter((a) => a.category === 'industry').map(newsCard).join('')
  };
  await writePage('news/index.html', fill(tpl, tokens));
}

async function buildNewsCategory(cat) {
  const tpl = await loadTemplate('news-category');
  const name = newsCategoryName(cat);
  const url = `/news/${cat}/`;
  const breadcrumbs = [{ name: '首页', url: '/' }, { name: '新闻中心', url: '/news/' }, { name, url }];
  const seo = { title: `英飞凌${name}_力通`, description: `力通${name}，关注英飞凌产品、市场与公司动态，覆盖 AURIX、IGBT、SiC 与光伏储能等热点，力通英飞凌代理新闻中心。`, keywords: [`英飞凌${name}`, '力通新闻', '英飞凌动态'], canonical: url };
  const arts = news.articles.filter((a) => a.category === cat);
  const tokens = {
    ...seoTokens(seo),
    SCHEMA: [breadcrumbLd(breadcrumbs), itemListLd(`英飞凌${name}`, arts.map((a) => ({ name: a.title, url: `/news/${a.slug}.html` })))].join('\n'),
    HEADER: header('/news/'),
    FOOTER: partials.footer,
    BREADCRUMB: breadcrumb(breadcrumbs),
    PAGE_TITLE: name,
    PAGE_DESC: `力通${name}，关注英飞凌产品、市场与公司动态。`,
    ARTICLE_CARDS: arts.map(newsCard).join('')
  };
  await writePage(`news/${cat}/index.html`, fill(tpl, tokens));
}

async function buildNewsDetail(a) {
  const tpl = await loadTemplate('news-detail');
  const url = `/news/${a.slug}.html`;
  const name = newsCategoryName(a.category);
  const breadcrumbs = [{ name: '首页', url: '/' }, { name: '新闻中心', url: '/news/' }, { name, url: `/news/${a.category}/` }, { name: a.title, url }];
  const related = a.related
    .map((slug) => news.articles.find((x) => x.slug === slug))
    .filter(Boolean)
    .map(newsCard)
    .join('');
  const sidebar = news.articles
    .filter((x) => x.slug !== a.slug)
    .slice(0, 4)
    .map((x) => `<li><a href="/news/${x.slug}.html">${esc(x.title)}</a></li>`)
    .join('');
  const seo = { title: `${a.title}_英飞凌${name}-力通`, description: `${a.excerpt} 力通英飞凌代理新闻中心，提供行业解读与选型参考，并提供器件选型与供货支持。`, keywords: [a.title, `英飞凌${name}`, '力通新闻'], canonical: url };
  const share = `<div class="filter-chips"><a class="tag" href="https://service.weibo.com/share/share.php?url=${encodeURIComponent(abs(url))}&title=${encodeURIComponent(a.title)}" target="_blank" rel="noopener">分享到微博</a><a class="tag" href="https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(abs(url))}&title=${encodeURIComponent(a.title)}" target="_blank" rel="noopener">分享到 QQ</a><button class="tag" type="button" data-copy-url="${attr(abs(url))}">复制链接</button></div>`;
  const tokens = {
    ...seoTokens(seo),
    SCHEMA: [breadcrumbLd(breadcrumbs), newsArticleLd(a, a.schemaType || 'NewsArticle')].join('\n'),
    HEADER: header('/news/'),
    FOOTER: partials.footer,
    BREADCRUMB: breadcrumb(breadcrumbs),
    ARTICLE_TITLE: esc(a.title),
    DATE: esc(a.date),
    CATEGORY_LABEL: esc(name),
    ARTICLE_CONTENT: a.content.map((p) => `<p>${esc(p)}</p>`).join(''),
    NEWS_COVER: mediaImage(a.cover, a.title),
    SOURCES: a.sources && a.sources.length
      ? `<section class="section"><h2>来源</h2><ul class="related-list">${a.sources.map((s) => `<li><a href="${attr(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join('')}</ul></section>`
      : '',
    SHARE: share,
    RELATED: related,
    SIDEBAR_NEWS: `<aside class="sidebar" aria-label="新闻导航"><div class="sidebar-sticky"><div class="sidebar-card"><h3>新闻分类</h3><ul class="related-list"><li><a href="/news/company/">公司新闻</a></li><li><a href="/news/industry/">行业动态</a></li></ul></div><div class="sidebar-card"><h3>近期新闻</h3><ul class="related-list">${sidebar}</ul></div></div></aside>`,
    DETAIL_CTA: partials['detail-cta']
  };
  await writePage(`news/${a.slug}.html`, fill(tpl, tokens));
}

async function buildAbout() {
  const tpl = await loadTemplate('about');
  const p = about.page;
  const c = p.content;
  const tokens = {
    ...seoTokens(p.seo),
    SCHEMA: [breadcrumbLd(p.breadcrumbs), faqLd(p.faq)].join('\n'),
    HEADER: header('/about/'),
    FOOTER: partials.footer,
    BREADCRUMB: breadcrumb(p.breadcrumbs),
    PAGE_TITLE: '关于力通',
    PAGE_DESC: '力通是专业的英飞凌代理与电子元器件供应商，提供英飞凌现货、授权渠道、报关单与 FAE 技术支持。',
    INTRO: `<p>${esc(c.intro)}</p>`,
    TEAM_DESC: esc(c.team.desc),
    TEAM_STATS: c.team.stats.map((s) => `<div class="stat"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join(''),
    TIMELINE: c.milestones.map((m) => `<li><span class="year">${esc(m.year)}</span> · <strong>${esc(m.title)}</strong><p>${esc(m.desc)}</p></li>`).join(''),
    CUSTOMS: c.customsDocs.map((d) => `<div class="card"><div class="card-media"><a href="/${String(d.image).replace(/^\//, '')}" target="_blank" rel="noopener" aria-label="查看 ${esc(d.category)} 报关单大图">${mediaImage(d.image, `${d.category} 报关单`)}</a></div><div class="card-body"><h3 class="card-title">${esc(d.category)}</h3><p class="card-text">${esc(d.desc)}</p></div></div>`).join(''),
    ADVANTAGES: c.advantages.map((a) => feature({ title: a.title, desc: a.desc })).join(''),
    CASES: c.cases.map((x) => card({ title: x.title, text: x.desc, url: x.url || '/solutions/', meta: x.industry, media: mediaImage('assets/img/solution-default.svg', x.title) })).join(''),
    SERVICE_AREAS: ((about.global.keywords && about.global.keywords.region) || []).map((x) => esc(x)).join('、'),
    FAQ: faqHtml(p.faq),
    DETAIL_CTA: partials['detail-cta']
  };
  await writePage('about/index.html', fill(tpl, tokens));
}

async function buildContact() {
  const tpl = await loadTemplate('contact');
  const offices = about.global.offices;
  const seo = { title: '联系我们_英飞凌代理力通联系方式', description: '力通英飞凌代理联系方式：香港总部与北京、上海、深圳办事处，QQ 2377687015，快速获取报价与技术支持，提供英飞凌现货与 FAE 支持。', keywords: ['英飞凌代理联系方式', '力通联系', '英飞凌代理QQ'], canonical: '/contact/' };
  const breadcrumbs = [{ name: '首页', url: '/' }, { name: '联系我们', url: '/contact/' }];
  const form = `<form class="form-grid" action="mailto:web@litong.com" method="get" enctype="text/plain"><div class="form-field"><label class="form-label" for="f-name">姓名 <span class="required">*</span></label><input class="form-input" id="f-name" name="name" required></div><div class="form-field"><label class="form-label" for="f-company">公司</label><input class="form-input" id="f-company" name="company"></div><div class="form-field"><label class="form-label" for="f-phone">电话</label><input class="form-input" id="f-phone" name="phone" inputmode="tel"></div><div class="form-field"><label class="form-label" for="f-email">邮箱</label><input class="form-input" id="f-email" name="email" type="email"></div><div class="form-field"><label class="form-label" for="f-model">需求型号</label><input class="form-input" id="f-model" name="model"></div><div class="form-field"><label class="form-label" for="f-qty">数量</label><input class="form-input" id="f-qty" name="qty" inputmode="numeric"></div><div class="form-field form-field--full"><label class="form-label" for="f-note">备注</label><textarea class="form-textarea" id="f-note" name="note"></textarea></div><div class="form-field form-field--full"><label class="form-check"><input type="checkbox" name="consent" required> 我同意由力通就本次询价与我联系</label><button class="btn btn-primary btn-block" type="submit">提交询价</button><p class="form-note">如邮件客户端未打开，可直接 QQ 2377687015 联系。</p></div></form>`;
  const tokens = {
    ...seoTokens(seo),
    SCHEMA: breadcrumbLd(breadcrumbs),
    HEADER: header('/contact/'),
    FOOTER: partials.footer,
    BREADCRUMB: breadcrumb(breadcrumbs),
    PAGE_TITLE: '联系我们',
    PAGE_DESC: '力通英飞凌代理联系方式：香港总部与北京、上海、深圳办事处，右侧 QQ 可获取报价与技术咨询。',
    OFFICES: offices.map((o) => `<div class="card"><div class="card-body"><h3 class="card-title">${esc(o.name)}</h3><p class="card-text">${esc(o.address)}</p><p class="card-text">电话：${esc(o.phone)}${o.contact ? ` · 联系人：${esc(o.contact)}` : ''}</p><p class="card-text">传真：${esc(o.fax)}</p></div></div>`).join(''),
    CONTACT_IMAGE: mediaImage('assets/img/contact.png', '力通 英飞凌代理 联系方式'),
    FORM: form,
    QQ: esc(about.global.qq),
    QQ_ACTION: `<a class="btn btn-primary btn-block" href="https://wpa.qq.com/msgrd?v=3&uin=${encodeURIComponent(about.global.qq)}&site=qq&menu=yes" target="_blank" rel="noopener">QQ 咨询</a><button class="btn btn-secondary btn-block" type="button" data-copy-text="${attr(about.global.qq)}">复制 QQ</button>`,
    DETAIL_CTA: partials['detail-cta']
  };
  await writePage('contact/index.html', fill(tpl, tokens));
}

async function writeSiteFiles() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${generated
    .map((u) => `  <url><loc>${BASE}${u}</loc><lastmod>${SITE_DATE}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`;
  await writeFile(path.join(root, 'sitemap.xml'), sitemap, 'utf8');
  await writeFile(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /scripts/\nDisallow: /data/\nDisallow: /templates/\nSitemap: ${BASE}/sitemap.xml\n`, 'utf8');
  const llms = `# 力通 · 英飞凌代理\n\n> 力通提供英飞凌代理、现货、授权渠道与 FAE 技术支持，覆盖 MCU、IGBT、MOSFET 与传感器。\n\n## 核心页面\n- 首页: ${BASE}/\n- 产品中心: ${BASE}/products/\n- 解决方案: ${BASE}/solutions/\n- 技术支持: ${BASE}/support/\n- 新闻中心: ${BASE}/news/\n- 关于我们: ${BASE}/about/\n- 联系我们: ${BASE}/contact/\n`;
  await writeFile(path.join(root, 'llms.txt'), llms, 'utf8');
}

async function main() {
  await loadPartials();
  home = await readJson('home');
  products = await readJson('products');
  solutions = await readJson('solutions');
  support = await readJson('support');
  news = await readJson('news');
  about = await readJson('about');
  validateData();
  modelIndex = modelIndexBuild(products.categories);

  await buildHome();
  await buildProductsList();
  for (const cat of products.categories) {
    await buildCategory(cat);
    for (const m of cat.models) await buildModel(cat, m);
  }
  await buildSolutionsList();
  for (const s of solutions.solutions) await buildSolutionDetail(s);
  await buildSupportList();
  for (const c of support.categories) await buildSupportCategory(c);
  for (const a of support.articles) await buildSupportArticle(a);
  for (const a of support.authors) await buildAuthor(a);
  for (const t of support.tags) await buildTag(t);
  await buildNewsList();
  for (const cat of ['company', 'industry']) await buildNewsCategory(cat);
  for (const a of news.articles) await buildNewsDetail(a);
  await buildAbout();
  await buildContact();
  await pruneStale();
  await writeSiteFiles();

  console.log(`[generate] pages=${generated.length}`);
  console.log(`[generate] sitemap.xml, robots.txt, llms.txt written`);
}

main().catch((err) => {
  console.error('[generate] failed:', err);
  process.exit(1);
});
