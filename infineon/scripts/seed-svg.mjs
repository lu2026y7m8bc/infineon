#!/usr/bin/env node
/** seed-svg.mjs — 生成站点 SVG 资产（T3.16–T3.20） */
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'img');
await mkdir(dir, { recursive: true });

const write = async (name, svg) => {
  await writeFile(path.join(dir, name), svg, 'utf8');
  console.log(`[svg] ${name}`);
};

const icon = (name, draw) =>
  write(name, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0072ce" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${draw}</svg>`);

const product = (name, label, color) =>
  write(name, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="${label}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#0b2239"/></linearGradient></defs><rect width="400" height="300" rx="16" fill="url(#g)"/><rect x="120" y="64" width="160" height="150" rx="12" fill="#ffffff" opacity="0.14"/><circle cx="200" cy="139" r="44" fill="#ffffff" opacity="0.92"/><text x="200" y="145" text-anchor="middle" fill="${color}" font-size="15" font-family="sans-serif">${label}</text><text x="200" y="250" text-anchor="middle" fill="#ffffff" font-size="13" font-family="sans-serif">Infineon · 力通</text></svg>`);

const cover = (name, label, color) =>
  write(name, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" role="img" aria-label="${label}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#0b2239"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><path d="M0 300 L120 220 L240 280 L360 180 L480 240 L600 160" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="3"/><circle cx="480" cy="110" r="56" fill="#ffffff" opacity="0.12"/><text x="40" y="330" fill="#ffffff" font-size="24" font-family="sans-serif">${label}</text><text x="40" y="362" fill="#ffffff" opacity="0.75" font-size="14" font-family="sans-serif">力通 · 英飞凌代理</text></svg>`);

const block = (name, label) =>
  write(name, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" role="img" aria-label="${label}"><rect width="800" height="400" rx="16" fill="#f8f9fa"/><text x="32" y="48" fill="#212529" font-size="20" font-weight="700" font-family="sans-serif">${label}</text>${[
    ['电池/输入', 40],
    ['功率级', 220],
    ['控制 MCU', 400],
    ['传感/保护', 580]
  ].map(([t, x]) => `<rect x="${x}" y="150" width="140" height="90" rx="10" fill="#ffffff" stroke="#0072ce"/><text x="${x + 70}" y="200" text-anchor="middle" fill="#0072ce" font-size="14" font-family="sans-serif">${t}</text>`).join('')}<path d="M180 195 H220 M360 195 H400 M540 195 H580" stroke="#0072ce" stroke-width="2" marker-end="url(#a)"/><defs><marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="#0072ce"/></marker></defs><text x="400" y="320" text-anchor="middle" fill="#6c757d" font-size="13" font-family="sans-serif">方案框图（示意）· 以实际设计为准</text></svg>`);

const avatar = (name, initial, color) =>
  write(name, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${initial}"><circle cx="48" cy="48" r="48" fill="${color}"/><text x="48" y="58" text-anchor="middle" fill="#ffffff" font-size="32" font-family="sans-serif">${initial}</text></svg>`);

const doc = (name, label) =>
  write(name, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" role="img" aria-label="${label}"><rect width="600" height="400" rx="14" fill="#f8f9fa"/><rect x="150" y="40" width="300" height="320" rx="10" fill="#ffffff" stroke="#e9ecef"/><rect x="180" y="80" width="240" height="16" rx="4" fill="#0072ce"/><rect x="180" y="120" width="180" height="10" rx="3" fill="#e9ecef"/><rect x="180" y="145" width="220" height="10" rx="3" fill="#e9ecef"/><rect x="180" y="170" width="160" height="10" rx="3" fill="#e9ecef"/><rect x="180" y="210" width="120" height="12" rx="3" fill="#0072ce" opacity="0.5"/><text x="300" y="330" text-anchor="middle" fill="#6c757d" font-size="15" font-family="sans-serif">${label}</text></svg>`);

// 分类图标
await icon('icon-mcu.svg', '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4"/>');
await icon('icon-igbt.svg', '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 7V4M12 7V4M17 7V4M7 17v3M12 17v3M17 17v3"/>');
await icon('icon-mosfet.svg', '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M8 8l4 4-4 4M16 8l-4 4 4 4"/>');
await icon('icon-sensors.svg', '<path d="M3 12h3l2-5 3 10 2-6 2 3h6"/><circle cx="19" cy="6" r="2"/>');

// 首页优势图标
await icon('icon-stock.svg', '<path d="M3 8l9-5 9 5v8l-9 5-9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/>');
await icon('icon-fae.svg', '<path d="M4 13a8 8 0 0 1 16 0"/><rect x="2" y="13" width="4" height="6" rx="2"/><rect x="18" y="13" width="4" height="6" rx="2"/><path d="M20 19a4 4 0 0 1-4 3h-2"/>');
await icon('icon-logistics.svg', '<rect x="2" y="7" width="12" height="10" rx="1"/><path d="M14 10h4l3 3v4h-7"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>');
await icon('icon-quality.svg', '<path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>');

// 技术分类图标
await icon('icon-guides.svg', '<path d="M4 4h9a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z"/><path d="M16 7h4v13h-4M8 8h4M8 12h4"/>');
await icon('icon-app-notes.svg', '<path d="M6 2h9l3 3v17H6z"/><path d="M15 2v3h3M9 11h6M9 15h6"/>');
await icon('icon-troubleshooting.svg', '<path d="M14 7a4 4 0 1 0-5 5L3 18l3 3 6-6a4 4 0 0 0 5-5l-3 3-2-2 2-4z"/>');
await icon('icon-reviews.svg', '<path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z"/>');

// 产品图
await product('product-mcu.svg', 'MCU', '#0072ce');
await product('product-igbt.svg', 'IGBT', '#0b6e4f');
await product('product-mosfet.svg', 'MOSFET', '#6a4c93');
await product('product-sensor.svg', 'Sensor', '#b45309');
await product('product-default.svg', 'Infineon', '#0072ce');

// 方案封面
await cover('solution-xev.svg', '新能源汽车三电', '#0072ce');
await cover('solution-pv.svg', '光伏与储能', '#0b6e4f');
await cover('solution-drive.svg', '工业电机驱动', '#6a4c93');
await cover('solution-power.svg', '充电与数据中心电源', '#b45309');
await cover('solution-default.svg', '行业解决方案', '#0072ce');

// 方案框图
await block('block-xev.svg', '新能源汽车三电系统框图');
await block('block-pv.svg', '光伏与储能逆变框图');
await block('block-drive.svg', '工业电机驱动框图');
await block('block-power.svg', '充电与数据中心电源框图');

// 新闻封面
await cover('news-award.svg', '力通渠道合作交流', '#0072ce');
await cover('news-warehouse.svg', '深圳仓储能力升级', '#0b6e4f');
await cover('news-tc4x.svg', 'AURIX TC4x 发布', '#6a4c93');
await cover('news-sic.svg', 'IGBT 与 SiC 市场趋势', '#b45309');

// 作者头像
await avatar('author-zhang.svg', '张', '#0072ce');
await avatar('author-li.svg', '李', '#0b6e4f');

// 报关单
await doc('customs-mcu.svg', 'MCU 报关单样例');
await doc('customs-igbt.svg', 'IGBT 报关单样例');
await doc('customs-mosfet.svg', 'MOSFET 报关单样例');
await doc('customs-sensors.svg', '传感器报关单样例');

// 抽象背景
await write('bg-circuit.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice"><rect width="800" height="400" fill="#0b2239"/><g stroke="#0072ce" stroke-opacity="0.35" fill="none"><path d="M0 80 H180 V160 H360 V80 H560 V220 H800"/><path d="M0 260 H140 V340 H320 V260 H500 V340 H680 V260 H800"/><path d="M120 0 V80 M420 0 V80 M620 220 V400 M260 160 V400"/></g><g fill="#0072ce" fill-opacity="0.5"><circle cx="180" cy="120" r="4"/><circle cx="360" cy="120" r="4"/><circle cx="560" cy="150" r="4"/><circle cx="320" cy="300" r="4"/></g></svg>`);
await write('bg-lines.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect width="800" height="400" fill="#f8f9fa"/><g stroke="#0072ce" stroke-opacity="0.12"><path d="M0 60 L800 20M0 160 L800 120M0 260 L800 220M0 360 L800 320"/></g></svg>`);
await write('bg-dots.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect width="800" height="400" fill="#f8f9fa"/><g fill="#0072ce" fill-opacity="0.15">${Array.from({ length: 80 }, (_, i) => `<circle cx="${(i % 20) * 40 + 20}" cy="${Math.floor(i / 20) * 100 + 40}" r="2"/>`).join('')}</g></svg>`);

// Logo 与 favicon
await write('logo.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 48" role="img" aria-label="力通 litong"><rect x="0" y="4" width="40" height="40" rx="8" fill="#0072ce"/><text x="20" y="31" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="700" font-family="sans-serif">LT</text><text x="52" y="24" fill="#212529" font-size="20" font-weight="700" font-family="sans-serif">力通</text><text x="52" y="40" fill="#6c757d" font-size="9" letter-spacing="1" font-family="sans-serif">LITONG · INFINEON AGENT</text></svg>`);
await write('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#0072ce"/><text x="16" y="22" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700" font-family="sans-serif">LT</text></svg>`);

console.log('[svg] done');
