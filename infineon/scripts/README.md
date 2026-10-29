# 构建脚本说明

这些脚本是**构建工具**，不是站点页面资源。部署时应排除 `scripts/`、`data/`、`templates/`。

| 脚本 | 作用 |
|---|---|
| `seed-svg.mjs` | 生成图标/插图/封面/框图/Logo/favicon |
| `seed-products.mjs` | 生成 `data/products.json` |
| `seed-solutions.mjs` | 生成 `data/solutions.json` |
| `seed-support.mjs` | 生成 `data/support.json` |
| `seed-news.mjs` | 生成 `data/news.json` |
| `pad-json-faq.mjs` | 统一补齐 FAQ 答案长度与层次 |
| `generate.mjs` | JSON → 模板 → HTML + sitemap/robots/llms |
| `validate-json.mjs` | JSON 契约/数量/字数/FAQ/图片/重复项校验 |
| `validate-links.mjs` | 内链/空链/锚点/不安全协议校验 |

常用命令（在 `infineon/` 下）：

```bash
npm run build      # seed + generate + validate
npm run generate   # 仅生成
npm run validate   # 仅校验
```

环境变量：`SITE_BASE`（默认 `https://infineon.pages.dev`）、`SITE_DATE`（sitemap lastmod）。
