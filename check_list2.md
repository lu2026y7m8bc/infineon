# check_list2.md — JSON 数据文件检查清单

> 用途：逐项核验 `home.json / products.json / solutions.json / support.json / news.json / about.json` 是否符合 `prompt-a1`、`PRD.md`、`design.md`，并与模板对齐。
> 规则：`[ ]` 未通过 / `[x]` 通过 / `[!]` 需澄清。JSON 是唯一内容源，模板只负责渲染；**JSON 与模板必须字段对齐**。

---

## A. 通用字段（所有页面对象）
- [ ] A1 顶层结构含 `brand`、`pages`（或等价命名），JSON 语法合法（可被 `JSON.parse`）。
- [ ] A2 每个页面对象有唯一 `id` 与 `type`。
- [ ] A3 `seo.title` 非空、唯一、含关键词、≤60 字符（中文酌情）。
- [ ] A4 `seo.description` 非空、含关键词、≤160 字。
- [ ] A5 `seo.keywords` 为数组，覆盖核心/长尾词。
- [ ] A6 `seo.canonical` 为站内静态路径。
- [ ] A7 `breadcrumbs` 为数组，与页面层级一致。
- [ ] A8 `content` 字段与对应模板占位一一对应（无缺、无冗余）。
- [ ] A9 `faq` 为数组，元素含 `question`、`answer`（段落数组）、`decisionGuide`。
- [ ] A10 无 `TBD`/`TODO`/空字符串/`null` 正文。
- [ ] A11 所有站内链接为真实存在的路径（由生成器校验）。

## B. `home.json`
- [ ] B1 `hero`：主标题（含「英飞凌代理」）、副标题、双 CTA。
- [ ] B2 `advantages`：≥4 项（标题+说明+图标）。
- [ ] B3 `categories`：4 项（名称/简介/系列/型号数/链接）。
- [ ] B4 `solutions`：4 项（标题/摘要/标签/链接）。
- [ ] B5 `latestArticles`：≥3 篇。
- [ ] B6 `latestNews`：≥3 条。
- [ ] B7 `finalCta`：标题/说明/按钮。
- [ ] B8 `faq`：3–5 条，250–450 字，含 decisionGuide。
- [ ] B9 首页 `seo.title` 与 `Organization/WebSite` 数据一致。

## C. `products.json`
- [ ] C1 `categories`：4 个（MCU / IGBT / MOSFET / 传感器），各有 slug/名称/图标/描述/系列。
- [ ] C2 每个分类 `description` 200–300 字，含「英飞凌XX代理/选型」关键词。
- [ ] C3 每个分类含 `guideLink`（指向选型指南文章）。
- [ ] C4 每个分类含 `faeReview`（FAE 点评，署名）。
- [ ] C5 每个分类含 `alternatives` 与 `companions`（站内型号引用）。
- [ ] C6 每个分类 `models` ≥6 个，`params` 为键值对（键随分类变化）。
- [ ] C7 每分类 ≥2 个 `depth: deep` 型号（描述 ≥800 字，FAQ 5–8）。
- [ ] C8 其余型号 `depth: standard`（描述 ≥150 字，FAQ 3–5）。
- [ ] C9 每个型号含 `model/series/package/stock/shortDesc/description/applications/documents/images`。
- [ ] C10 每个型号 `stock` 仅为 `in-stock` 或 `inquiry`。
- [ ] C11 每个型号的 `params` 键与同分类表格列一致（动态列来源）。
- [ ] C12 每个型号码可解析出唯一详情页路径，且该路径在生成计划内。
- [ ] C13 替代/配套料号引用的型号均存在（无悬空引用）。
- [ ] C14 每分类 `faq` 8–12 条（生成 5–8、展示 8–12），300–500 字，含强 decisionGuide。
- [ ] C15 分类页 `seo.title` 含分类关键词；型号页 `seo.title` 含型号。

## D. `solutions.json`
- [ ] D1 `solutions`：4 个（xev / pv-storage / industrial-drive / ev-charging-datacenter）。
- [ ] D2 每个含 `title/slug/summary/industry/tags/heroImage`。
- [ ] D3 `summary` 含核心关键词 + 应用场景（列表页展示）。
- [ ] D4 每个含 `blockDiagram`（SVG 引用 + 详细 alt）。
- [ ] D5 结构模块齐备：方案概述、框图、核心优势、BOM、应用场景、集成要点。
- [ ] D6 `bom` 为数组，元素含 `model`（须存在于 products.json）与角色/关键参数。
- [ ] D7 BOM 型号内链路径可解析。
- [ ] D8 正文 ≥800 字。
- [ ] D9 `faq` 3–6 条，250–450 字，含 decisionGuide。
- [ ] D10 `related` 相关方案/文章引用有效。

## E. `support.json`
- [ ] E1 `categories`：4 个（guides / app-notes / troubleshooting / reviews）。
- [ ] E2 每分类含 slug/名称/描述/`seo`。
- [ ] E3 `articles`：4 篇，分属 4 分类（各 1 篇）。
- [ ] E4 每篇含 `title/slug/category/author/date/tags/content/faq/related`。
- [ ] E5 正文 ≥800 字，含 H2/H3 结构标记。
- [ ] E6 `tags` 为数组（如 IGBT/AURIX/BLDC/CAN），可聚合。
- [ ] E7 `author` 引用 `authors` 中存在的作者 id。
- [ ] E8 `authors` ≥2，含姓名/头像/专长/经验/简介。
- [ ] E9 `faq` 4–8 条，250–450 字，含强 decisionGuide。
- [ ] E10 `related` 3–5 篇有效引用。
- [ ] E11 上下文化内链引用（型号/概念）均有效。
- [ ] E12 `seo.title` 含具体主题词（如「如何选择英飞凌MCU」）。

## F. `news.json`
- [ ] F1 `categories`：company / industry 两类。
- [ ] F2 `articles`：4 篇（company 2 + industry 2）。
- [ ] F3 每篇含 `title/slug/category/author/date/cover/excerpt/content/related`。
- [ ] F4 正文 ≥800 字。
- [ ] F5 行业动态含权威来源引用字段（`sources`）与本站解读。
- [ ] F6 `related` 推荐 3 篇有效引用。
- [ ] F7 `seo.title` 含主题关键词。
- [ ] F8 公司新闻与行业动态字段结构可区分（category/schemaType）。

## G. `about.json`
- [ ] G1 公司简介（含「英飞凌代理」「英飞凌现货」）。
- [ ] G2 发展历程 `milestones`（时间线，≥4 节点）。
- [ ] G3 资质与 **各产品分类报关单** `customsDocs`（4 项，含图片+说明）。
- [ ] G4 公司优势 `advantages`（库存/技术/物流/正品，≥4）。
- [ ] G5 客户案例 `cases`（≥3，含行业标签）。
- [ ] G6 联系方式 `contact`：香港总部 + 北京/上海/深圳办事处，字段含地址/电话/联系人/传真。
- [ ] G7 `contactImage` 指向 `contact.png`，`qq = "2377687015"`。
- [ ] G8 `faq` 4–8 条，250–450 字，含 decisionGuide。
- [ ] G9 联系页 `seo` 含「英飞凌代理 联系方式」。

## H. 内容质量与差异化
- [ ] H1 所有内容为 AI 原创中文，无整段复制厂商官网。
- [ ] H2 型号描述 ≥150 字；详情正文 ≥800 字；段落有层次。
- [ ] H3 关键词自然分布（标题/首段/H2/FAQ/alt），无堆砌。
- [ ] H4 同一事实（参数/封装/应用）在分类表/详情/BOM/FAQ 中一致。
- [ ] H5 不同品牌内容差异化（产品/行业/方案不照搬）。
- [ ] H6 行业动态自律：引用来源 + 本站解读，不臆造数据。
- [ ] H7 无夸大/绝对化违规表述（如「唯一」「100%」需谨慎）。

## I. FAQ 字段合规
- [ ] I1 每页 `faq` 数组存在（除列表页外按 PRD 要求）。
- [ ] I2 `question` 为自然语言问句。
- [ ] I3 `answer` 为段落数组（≥2 段），非单段堆砌。
- [ ] I4 `decisionGuide` 非空，指向具体行动（型号/联系/下载）。
- [ ] I5 条数与字数符合 PRD FR-8.4。
- [ ] I6 内容与可见页面一致，可生成 `FAQPage`。

## J. 与模板对齐 / 生成校验
- [ ] J1 6 个 JSON 均通过 schema 校验脚本。
- [ ] J2 模板占位字段全部能在 JSON 中找到（无 undefined）。
- [ ] J3 JSON 中无模板未使用的冗余字段（或已标注保留）。
- [ ] J4 生成后页面无模板占位残留。
- [ ] J5 所有引用路径（型号/文章/方案/标签/作者）均可解析。
- [ ] J6 `sitemap` 可由 JSON 全量推导。

## K. 多品牌复用
- [ ] K1 目录约定：`<brand>/data/*.json` + 共享模板。
- [ ] K2 新品牌仅改 JSON 与主题变量即可生成。
- [ ] K3 新品牌的产品/行业/方案与英飞凌不同（差异化）。
- [ ] K4 品牌专属字段（品牌名/关键词/资质）集中在 JSON。

---

## 核验记录（示例表）
| 日期 | JSON 文件 | 结论 | 问题 | 修复 |
|---|---|---|---|---|
| 2026-10-29 | 6 个 JSON | 通过 | validate-json 0 错误；FAQ 251–338 字；图片/重复/标签校验通过 | — |
