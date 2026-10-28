# 数据契约（JSON Schema 说明）

> 作用：约束 6 个 JSON 的字段、类型与最小内容，供生成器与校验脚本使用。
> 通用：UTF-8；顶层含 `brand` 与 `page`；`page` 含 `id/type/seo/breadcrumbs/content/faq`。
> `about.json` 额外含 `global`（全站导航、页脚、公司、办事处、QQ）。

## 1. 通用字段

```json
{
  "brand": { "name": "英飞凌", "nameEn": "Infineon", "company": "力通", "companyEn": "litong" },
  "page": {
    "id": "string",
    "type": "home|products-list|product-category|product-detail|solutions-list|solution-detail|support-list|support-detail|news-list|news-detail|about|contact|author|tag",
    "seo": { "title": "string", "description": "string", "keywords": ["string"], "canonical": "string" },
    "breadcrumbs": [{ "name": "string", "url": "string" }],
    "content": {},
    "faq": [{ "question": "string", "answer": ["段落1", "段落2"], "decisionGuide": "string" }]
  }
}
```

- `seo.title` 唯一、含关键词；`seo.description` ≤160 字。
- `faq[].answer` 至少 2 段；`decisionGuide` 非空。
- 所有站内链接以 `/` 开头，且指向已规划页面。

## 2. `home.json`

`page.content`：

```
hero: { title, subtitle, primaryCta:{label,url}, secondaryCta:{label,url}, trust:[string] }
advantages: [{ icon, title, desc }]            // ≥4
categories: [{ name, slug, icon, desc, count, url }] // 4
solutions: [{ title, slug, summary, industry, url }] // 4
articles: [{ title, slug, category, date, summary, url }] // ≥3
news: [{ title, slug, category, date, summary, url }]     // ≥3
cta: { title, desc, primaryCta:{label,url}, secondaryCta:{label,url} }
faq: [...] // 3–5
```

## 3. `products.json`

顶层：`brand`、`page`（产品中心列表页）、`categories[]`。

`categories[]`：

```
{
  "slug": "mcu|igbt|mosfet|sensors",
  "name": "string",
  "icon": "assets/img/icon-mcu.svg",
  "description": "200–300 字",
  "applications": [{ "name": "string", "desc": "string" }],
  "advantages": [{ "title": "string", "desc": "string" }],
  "guideLink": { "label": "string", "url": "string" },
  "faeReview": { "author": "string", "text": "string" },
  "alternatives": [{ "model": "string", "url": "string" }],
  "companions": [{ "model": "string", "url": "string" }],
  "faq": [...],           // 8–12
  "models": [model]       // 6
}
```

`model`：

```
{
  "model": "string", "slug": "string", "series": "string",
  "depth": "deep|standard",
  "params": { "key": "value" },      // 每键渲染为一列，可筛选/排序
  "package": "string",
  "stock": "in-stock|inquiry",
  "shortDesc": "string",
  "description": "deep ≥800 字；standard ≥150 字",
  "applications": ["string"],
  "alternatives": ["model"],
  "companions": ["model"],
  "documents": [{ "label": "string", "url": "string" }],
  "images": ["assets/img/..."],
  "faq": [...] // deep 5–8；standard 3–5
}
```

## 4. `solutions.json`

顶层：`brand`、`page`、`solutions[]`（4 个）。

```
{
  "slug": "xev|pv-storage|industrial-drive|ev-charging-datacenter",
  "title": "string", "summary": "string", "industry": "string",
  "tags": ["string"],
  "heroImage": "assets/img/...",
  "blockDiagram": { "src": "assets/img/bg-*.svg", "alt": "string" },
  "overview": "≥800 字（可分段数组）",
  "advantages": [{ "title": "string", "desc": "string" }],
  "techStrength": [{ "title": "string", "desc": "string" }],
  "bom": [{ "model": "string", "role": "string", "keyParams": "string", "url": "string" }],
  "scenarios": ["string"],
  "integration": ["string"],
  "faq": [...],   // 3–6
  "related": [{ "title": "string", "url": "string" }]
}
```

## 5. `support.json`

顶层：`brand`、`page`、`categories[]`（4）、`articles[]`（4）、`authors[]`（≥2）、`tags[]`（≥4）。

```
category: { "slug": "guides|app-notes|troubleshooting|reviews", "name": "string", "desc": "string" }
article: {
  "slug": "string", "title": "string", "category": "guides|app-notes|troubleshooting|reviews",
  "author": "zhang-gong|li-gong", "date": "YYYY-MM-DD",
  "tags": ["string"], "excerpt": "string",
  "content": "≥800 字（可分段数组）",
  "faq": [...],   // 4–8
  "related": ["slug"]
}
author: { "id": "string", "name": "真实姓名", "avatar": "assets/img/...", "expertise": "string", "experience": "string", "bio": "string" }
tag: { "slug": "string", "name": "string" }
```

## 6. `news.json`

顶层：`brand`、`page`、`articles[]`（4：company 2 + industry 2）。

```
{
  "slug": "string", "title": "string", "category": "company|industry",
  "author": "string", "date": "YYYY-MM-DD", "cover": "assets/img/...",
  "excerpt": "string",
  "content": "≥800 字（可分段数组）",
  "sources": [{ "name": "string", "url": "string" }],   // industry 必填
  "related": ["slug"],
  "schemaType": "NewsArticle|Article"
}
```

## 7. `about.json`

顶层：`brand`、`global`、`page`。

`page.content`：

```
intro: "string"
team: { title: "string", desc: "string", stats: [{ "label": "string", "value": "string" }] }
milestones: [{ "year": "string", "title": "string", "desc": "string" }]
customsDocs: [{ "category": "string", "image": "assets/img/...", "desc": "string" }] // 4
advantages: [{ "title": "string", "desc": "string" }] // ≥4
cases: [{ "title": "string", "industry": "string", "desc": "string" }] // ≥3
contact: { "offices": [...], "qq": "2377687015", "contactImage": "assets/img/contact.png" }
faq: [...] // 4–8
```

## 8. 校验规则（T2.22 实现）

1. 6 文件均可 `JSON.parse`。
2. 顶层 `brand`、`page` 存在；`about.json` 含 `global`。
3. `page.seo.title/description/canonical` 非空。
4. `faq` 每条含 `question`、`answer`（≥2 段）、`decisionGuide`。
5. 数量：分类 4、型号 24（8 deep + 16 standard）、方案 4、文章 4、新闻 4、作者 ≥2、标签 ≥4。
6. 字数：deep 型号描述 ≥800；standard ≥150；文章正文 ≥800；分类描述 200–300。
7. 所有站内 `url` 以 `/` 开头且属于规划路由。
