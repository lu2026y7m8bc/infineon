# 力通 · 英飞凌代理官网 开发计划（development-plan.md）

> **版本**：v2.0　|　**状态**：已评审（Approved）　|　**上游**：`PRD.md` v2.1、`design.md` v2.0
> **说明**：本计划给出**开发阶段、任务列表、优先级、依赖关系、是否 TDD**；按 prompt 与用户要求**不写具体开发步骤**、不写实现代码。执行步骤由 `todo_write.md` 逐条落地。
> **技术栈**：纯原生 HTML + CSS + 少量原生 JS；数据驱动（JSON + Node 生成脚本）；无框架、无后端。

**Goal**：用「模板 + JSON」数据驱动方式，构建可被百度收录、可被 AI 引用的「英飞凌代理」中文静态站，并自动化部署到 GitHub / Cloudflare Pages。

**Architecture**：品牌文件夹内包含 `data/*.json`、`templates/*.html`、`assets/*`、`scripts/*`；Node 脚本读取 JSON 套模板生成静态 HTML，构建期校验内链/Schema；产物直接部署。

---

## 0. 目录与命名约定

```
infineon/
├── data/
│   ├── home.json
│   ├── products.json
│   ├── solutions.json
│   ├── support.json
│   ├── news.json
│   └── about.json
├── templates/
│   ├── home.html
│   ├── products-list.html
│   ├── product-category.html
│   ├── product-detail.html
│   ├── solutions-list.html
│   ├── solution-detail.html
│   ├── support-list.html
│   ├── support-detail.html
│   ├── news-list.html
│   ├── news-detail.html
│   ├── about.html
│   ├── author.html            ← support 扩展页（辅助）
│   └── tag.html               ← support 扩展页（辅助）
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   └── img/ (SVG)
├── scripts/
│   ├── generate.mjs
│   ├── validate-links.mjs
│   ├── validate-schema.mjs
│   └── validate-json.mjs
├── index.html / products/ / solutions/ / support/ / news/ / about/ / contact/
├── sitemap.xml / robots.txt / llms.txt
```

- 产品分类：`mcu`、`igbt`、`mosfet`、`sensors`
- 解决方案：`xev`、`pv-storage`、`industrial-drive`、`ev-charging-datacenter`
- 支持分类：`guides`、`app-notes`、`troubleshooting`、`reviews`
- 新闻分类：`company`、`industry`
- 辅助页：`support/authors/{slug}.html`、`support/tags/{tag}.html`

---

## 1. 阶段总览

| 阶段 | 名称 | 目标 | 优先级 |
|---|---|---|---|
| P0 | 准备与基线 | 目录、设计 token、构建/校验脚本骨架、全局数据、worktree | P0 |
| P1 | 全局框架与组件 | 导航/页脚/面包屑/按钮/卡片/标签/表格/Tab/FAQ/侧栏/详情通用/CTA/表单/分页 + 响应式 | P0 |
| P2 | 数据层与模板 | 6 JSON + 11 主模板 + 2 辅助模板 + 生成/校验脚本 | P0 |
| P3 | 页面生成与内容 | 全部页面生成、内容、FAQ、SVG、相关侧栏 | P0 |
| P4 | SEO/GEO 与结构化数据 | Meta、Schema（含分类页 Product）、内链、sitemap、alt | P0 |
| P5 | 单元质量门禁 | 每模块审查+测试、代码审查、调试、阶段四复核 | P0 |
| P6 | 集成与全站验证 | 集成测试、Playwright、check_list1/2、性能 | P0 |
| P7 | 交付与部署 | Git、GitHub、Cloudflare Pages | P0 |
| P8 | 多品牌复用与文档 | brand 三件套、check_list 终版、虚拟品牌复现 | P1 |
| P9 | 收尾 | 文档同步、遗留项 | P1 |

> P5 的审查/测试**内嵌于每个模块任务**，不是独立阶段；P6 集成测试在全部单元通过后执行。

---

## 2. 详细任务清单

> 字段：`ID` | `任务` | `产出/文件` | `优先级` | `依赖` | `TDD` | `验收对应`

### 阶段 P0：准备与基线

| ID | 任务 | 产出/文件 | 优先级 | 依赖 | TDD | 验收 |
|---|---|---|---|---|---|---|
| T0.1 | 创建品牌与资产目录树 | `infineon/`（data/templates/assets/scripts） | P0 | — | N | PRD §12 |
| T0.2 | 固化内容清单（4 分类 / 24 型号 / 4 方案 / 4 支持 / 4 新闻 / 作者 2 / 标签 4） | 内容清单 | P0 | T0.1 | N | PRD §5 |
| T0.3 | 建立设计 token（色彩/字体/间距/圆角/阴影/z-index） | `assets/css/style.css`（tokens） | P0 | T0.1 | N | design §2 |
| T0.4 | 构建脚本骨架（读品牌目录→输出路径） | `scripts/generate.mjs`（骨架） | P0 | T0.1 | Y | AC-M5 |
| T0.5 | 内链/空链校验骨架 | `scripts/validate-links.mjs` | P0 | T0.1 | Y | AC-G3 |
| T0.6 | JSON Schema 校验骨架 | `scripts/validate-json.mjs` | P0 | T0.1 | Y | AC-M3 |
| T0.7 | 准备全局数据（公司/导航/页脚/办事处/QQ/contact.png） | `data/about.json` 全局段 | P0 | T0.1 | N | AC-A2 |
| T0.8 | Git 初始化 + 隔离分支（worktree） | `.git`、分支 | P0 | T0.1 | N | FR-Q8 |

**P0 验收**：目录齐全；脚本可空跑；token 生效；worktree 就绪。

### 阶段 P1：全局框架与组件

| ID | 任务 | 产出/文件 | 优先级 | 依赖 | TDD | 验收 |
|---|---|---|---|---|---|---|
| T1.1 | 顶部导航（Logo+英文标语+下拉+移动抽屉+滚动固定） | 组件/样式 | P0 | T0.3 | Y | AC-G6、design §3.1 |
| T1.2 | 页脚（4 列+联系+版权+有效链接） | 组件/样式 | P0 | T0.3 | Y | design §3.12 |
| T1.3 | 面包屑 + `BreadcrumbList` 占位 | 组件/样式 | P0 | T0.3 | Y | AC-G2 |
| T1.4 | 按钮系统（主/次/幽灵/危险 + 状态） | 组件/样式 | P0 | T0.3 | Y | design §3.3 |
| T1.5 | 卡片系统（分类/方案/文章/新闻） | 组件/样式 | P0 | T0.3 | Y | design §3.4 |
| T1.6 | 标签/徽章（库存/技术/分类） | 组件/样式 | P0 | T0.3 | Y | design §3.5 |
| T1.7 | 动态型号表格（排序/筛选/横滚/首列吸附/空态） | 组件/`main.js`/样式 | P0 | T0.3 | Y | AC-P3 |
| T1.8 | Tabs 组件（产品/支持列表） | 组件/`main.js`/样式 | P0 | T0.3 | Y | AC-T1 |
| T1.9 | FAQ 组件（2 列/分段/展开/Schema 占位） | 组件/样式 | P0 | T0.3 | Y | AC-F1 |
| T1.10 | 侧边栏（分类导航 / TOC sticky / 新闻导航 / 详情相关） | 组件/样式 | P0 | T0.3 | Y | FR-G13、design §3.9 |
| T1.11 | 详情页通用元素（分销商 CTA + 相关侧栏） | 组件/样式 | P0 | T1.10 | Y | FR-G12/G13 |
| T1.12 | CTA 区块 + 询价/咨询表单 | 组件/样式 | P0 | T0.3 | Y | design §3.10/3.11 |
| T1.13 | 分页组件（数字/上下页/空态） | 组件/样式 | P0 | T0.3 | Y | design §3.13 |
| T1.14 | 响应式 + 可访问性基线（断点/栅格/focus/键盘/reduced-motion） | `style.css`/`main.js` | P0 | T1.1–T1.13 | Y | AC-G7、NFR-2 |

**P1 验收**：组件在示例页可用；键盘可操作；移动端无横向滚动。

### 阶段 P2：数据层与模板

| ID | 任务 | 产出/文件 | 优先级 | 依赖 | TDD | 验收 |
|---|---|---|---|---|---|---|
| T2.1 | 定义 6 JSON 契约 + Schema 校验规则 | 契约文档/校验脚本 | P0 | T0.2 | Y | AC-M3 |
| T2.2 | `home.json`（9 区块 + 首页 FAQ） | `data/home.json` | P0 | T2.1 | N | AC-H1/H4 |
| T2.3 | `products.json`（4 分类 + 24 型号 + 应用领域/优势对比 + FAQ） | `data/products.json` | P0 | T2.1 | N | AC-P1–P4/P10 |
| T2.4 | `solutions.json`（4 方案 + 技术实力 + 框图 + BOM + FAQ） | `data/solutions.json` | P0 | T2.1 | N | AC-S1–S5 |
| T2.5 | `support.json`（4 分类 + 4 文章 + 标签 + 作者 + FAQ） | `data/support.json` | P0 | T2.1 | N | AC-T1–T5 |
| T2.6 | `news.json`（公司 2 + 行业 2 + 来源 + 推荐） | `data/news.json` | P0 | T2.1 | N | AC-N1–N4 |
| T2.7 | `about.json`（简介/团队/历程/报关单/优势/案例/联系/FAQ） | `data/about.json` | P0 | T2.1 | N | AC-A1–A5 |
| T2.8 | 模板 `home.html` | `templates/home.html` | P0 | P1、T2.2 | Y | AC-M1 |
| T2.9 | 模板 `products-list.html` | `templates/products-list.html` | P0 | P1、T2.3 | Y | AC-P1 |
| T2.10 | 模板 `product-category.html`（应用领域/优势对比/动态表格/FAQ） | `templates/product-category.html` | P0 | P1、T2.3 | Y | AC-P2/P3/P10 |
| T2.11 | 模板 `product-detail.html`（Tab/规格表/配套/相关侧栏） | `templates/product-detail.html` | P0 | P1、T2.3 | Y | AC-P6 |
| T2.12 | 模板 `solutions-list.html` | `templates/solutions-list.html` | P0 | P1、T2.4 | Y | AC-S1 |
| T2.13 | 模板 `solution-detail.html`（框图/技术实力/BOM/FAQ/侧栏） | `templates/solution-detail.html` | P0 | P1、T2.4 | Y | AC-S2–S5 |
| T2.14 | 模板 `support-list.html`（Tabs） | `templates/support-list.html` | P0 | P1、T2.5 | Y | AC-T1 |
| T2.15 | 模板 `support-detail.html`（TOC/作者/标签/相关侧栏/FAQ） | `templates/support-detail.html` | P0 | P1、T2.5 | Y | AC-T3–T6 |
| T2.16 | 模板 `news-list.html`（公司/行业分区） | `templates/news-list.html` | P0 | P1、T2.6 | Y | AC-N1 |
| T2.17 | 模板 `news-detail.html`（Banner/分享/推荐/新闻导航） | `templates/news-detail.html` | P0 | P1、T2.6 | Y | AC-N2–N4 |
| T2.18 | 模板 `about.html`（团队实力/报关单/FAQ + 联系页组件） | `templates/about.html` | P0 | P1、T2.7 | Y | AC-A1–A5 |
| T2.19 | 辅助模板 `author.html`（作者页） | `templates/author.html` | P0 | P1、T2.5 | Y | AC-T4 |
| T2.20 | 辅助模板 `tag.html`（标签聚合页） | `templates/tag.html` | P0 | P1、T2.5 | Y | AC-T4 |
| T2.21 | 生成脚本完整实现（JSON→模板→HTML） | `scripts/generate.mjs` | P0 | T2.8–T2.20 | Y | AC-M5 |
| T2.22 | 模板↔JSON 字段对齐校验 | `scripts/validate-json.mjs` | P0 | T2.21 | Y | AC-M3 |
| T2.23 | 三套详情模板结构差异核验 | 评审记录 | P0 | T2.11/2.13/2.15/2.17 | N | AC-M2 |

**P2 验收**：6 JSON 通过 Schema 校验；13 模板可渲染；生成脚本幂等。

### 阶段 P3：页面生成与内容

| ID | 任务 | 产出/文件 | 优先级 | 依赖 | TDD | 验收 |
|---|---|---|---|---|---|---|
| T3.1 | 生成首页（9 区块 + FAQ） | `infineon/index.html` | P0 | T2.21 | N | AC-H1–H4 |
| T3.2 | 生成产品中心列表 | `products/index.html` | P0 | T2.21 | N | AC-P1 |
| T3.3 | 生成 4 个二级分类页（含应用领域/优势对比） | `products/{cat}/index.html` | P0 | T2.21 | N | AC-P2/P3/P10 |
| T3.4 | 生成 8 个深度型号详情页 | `products/{cat}/{model}.html` | P0 | T3.3 | N | AC-P4/P6/P7/P8 |
| T3.5 | 生成 16 个标准型号详情页（保证无空链） | `products/{cat}/{model}.html` | P0 | T3.3 | N | AC-P5/P8 |
| T3.6 | 生成解决方案列表 | `solutions/index.html` | P0 | T2.21 | N | AC-S1 |
| T3.7 | 生成 4 个解决方案详情（含技术实力） | `solutions/{slug}/index.html` | P0 | T2.21 | N | AC-S2–S5 |
| T3.8 | 生成技术支持列表（Tabs） | `support/index.html` | P0 | T2.21 | N | AC-T1 |
| T3.9 | 生成 4 个支持分类页 | `support/{cat}/index.html` | P0 | T2.21 | N | AC-T2 |
| T3.10 | 生成 4 篇技术支持文章 | `support/{cat}/{slug}.html` | P0 | T3.9 | N | AC-T3/T5/T6 |
| T3.11 | 生成作者页 ≥2 + 标签聚合页 ≥4 | `support/authors/*`、`support/tags/*` | P0 | T3.10 | N | AC-T4 |
| T3.12 | 生成新闻列表 + 2 分类页 | `news/index.html`、`news/{cat}/index.html` | P0 | T2.21 | N | AC-N1 |
| T3.13 | 生成 4 篇新闻详情 | `news/*.html` | P0 | T3.12 | N | AC-N2–N4 |
| T3.14 | 生成关于我们页（团队实力 + 报关单） | `about/index.html` | P0 | T2.21 | N | AC-A1/A3/A5 |
| T3.15 | 生成联系我们页（contact.png + 右栏仅 QQ） | `contact/index.html`、`assets/img/contact.png` | P0 | T2.21 | N | AC-A2/A4 |
| T3.16 | 生成 SVG 分类图标（4 个） | `assets/img/icon-*.svg` | P0 | T0.1 | N | AC-M4 |
| T3.17 | 生成插图（新闻/关于/联系） | `assets/img/illus-*.svg` | P0 | T0.1 | N | AC-M4 |
| T3.18 | 生成抽象背景（电路/线条/点阵） | `assets/img/bg-*.svg` | P0 | T0.1 | N | AC-M4 |
| T3.19 | 生成 Logo + 右侧英文标语 | `assets/img/logo.svg` | P0 | T0.1 | N | AC-M4 |
| T3.20 | 为每个列表/详情配匹配 SVG | 页面引用 | P0 | T3.16–T3.19 | N | AC-M4 |
| T3.21 | FAQ 全站填充（条数/字数/decisionGuide/与表格互补） | 各 JSON `faq` | P0 | T3.1–T3.15 | N | AC-F1–F4 |
| T3.22 | 详情页相关侧栏 + 分销商 CTA 填充 | 各详情模板/JSON | P0 | T3.7/T3.10/T3.13/T3.4 | N | AC-G10/G11 |

**P3 验收**：所有页面可打开；每页有匹配 SVG；FAQ 达标；详情页有相关侧栏与分销商 CTA。

### 阶段 P4：SEO / GEO 与结构化数据

| ID | 任务 | 产出/文件 | 优先级 | 依赖 | TDD | 验收 |
|---|---|---|---|---|---|---|
| T4.1 | 每页唯一 title/description/canonical/OG/Twitter | 生成注入 | P0 | P3 | Y | AC-G1 |
| T4.2 | 关键词矩阵落位（核心/地域/产品/资质/问题型） | 各页文案 | P0 | T3 | N | PRD §8.1 |
| T4.3 | Organization + WebSite Schema（首页） | JSON-LD | P0 | T3.1 | Y | AC-H3 |
| T4.4 | BreadcrumbList Schema（全站） | JSON-LD | P0 | T3 | Y | AC-G2 |
| T4.5 | Product Schema（**二级分类页** + 型号详情） | JSON-LD | P0 | T3.3/T3.4 | Y | AC-P7/P9 |
| T4.6 | ItemList Schema（产品/方案/支持/新闻列表与分类） | JSON-LD | P0 | T3 | Y | design §9.1 |
| T4.7 | TechArticle + FAQPage Schema（支持） | JSON-LD | P0 | T3.10 | Y | AC-T5 |
| T4.8 | NewsArticle/Article Schema（含 publisher 等） | JSON-LD | P0 | T3.13 | Y | AC-N3 |
| T4.9 | FAQPage Schema（关于/方案/分类/型号/支持） | JSON-LD | P0 | T3 | Y | AC-F3 |
| T4.10 | 内链网络（分类↔型号↔BOM↔文章↔新闻↔作者/标签） | 生成注入 | P0 | T3 | Y | AC-G11、design §9 |
| T4.11 | 图片 alt 全覆盖（含关键词） | 生成注入 | P0 | T3 | Y | AC-G5 |
| T4.12 | 生成 sitemap.xml / robots.txt / llms.txt | 站点根 | P0 | T3 | Y | AC-G4 |
| T4.13 | 空链/死链/锚点清零 | 校验报告 | P0 | T3、T4.10 | Y | AC-G3 |
| T4.14 | Schema 与可见内容一致性校验 | `validate-schema.mjs` 报告 | P0 | T4.3–T4.9 | Y | design §9.1 |

**P4 验收**：Schema 校验通过；sitemap 覆盖全站；零空链；分类页含 Product。

### 阶段 P5：单元质量门禁（内嵌）

| ID | 任务 | 产出 | 优先级 | 依赖 | TDD | 验收 |
|---|---|---|---|---|---|---|
| T5.1 | 每模块完成即审查+测试并记录 | 单元审查/测试记录 | P0 | 各模块 | Y | FR-Q1/Q2 |
| T5.2 | `requesting-code-review` 发起审查 | 审查记录 | P0 | T5.1 | N | FR-Q3 |
| T5.3 | `receiving-code-review` 处理反馈 | 修复记录 | P0 | T5.2 | N | FR-Q3 |
| T5.4 | 高风险单元预审（生成脚本/部署/Schema） | 预审记录 | P0 | T5.2 | N | FR-Q4 |
| T5.5 | `systematic-debugging` 处理 bug | 调试记录 | P0 | 任意 | N | FR-Q7 |
| T5.6 | 阶段四整体审查（Codex 可用则复检，否则按复核清单） | 复核记录 | P0 | T5.2 | N | FR-Q11 |
| T5.7 | 执行纪律核查（一次一 todo/不跳过/不提前/scope） | 记录 | P0 | 全程 | N | FR-Q12 |

### 阶段 P6：集成与全站验证

| ID | 任务 | 产出 | 优先级 | 依赖 | TDD | 验收 |
|---|---|---|---|---|---|---|
| T6.1 | 集成测试：导航/页脚/面包屑一致性 | 报告 | P0 | P1–P4 | Y | FR-Q5 |
| T6.2 | 集成测试：内链/空链/锚点 | 报告 | P0 | T4.13 | Y | AC-G3 |
| T6.3 | Schema 校验（各页） | 报告 | P0 | T4.14 | Y | AC-P7/T5/N3 |
| T6.4 | 响应式测试 375/768/1024/1440 | 报告 | P0 | P3 | Y | AC-G7 |
| T6.5 | 可访问性检查（对比度/键盘/focus） | 报告 | P0 | P3 | Y | NFR-2 |
| T6.6 | Playwright 打开全部页面核对 | 截图/报告 | P0 | T6.1–T6.5 | Y | FR-Q10 |
| T6.7 | `check_list1.md` 逐项核验 | 勾选记录 | P0 | T6.6 | N | AC-M1/M2 |
| T6.8 | `check_list2.md` 逐项核验 | 勾选记录 | P0 | T6.6 | N | AC-M3 |
| T6.9 | 性能/Lighthouse 核查（懒加载/字体/SVG） | 报告 | P1 | P3 | Y | NFR-1 |
| T6.10 | `verification-before-completion` 全量验证 | 验证报告 | P0 | T6.1–T6.9 | N | FR-Q6 |

### 阶段 P7：交付与部署

| ID | 任务 | 产出 | 优先级 | 依赖 | TDD | 验收 |
|---|---|---|---|---|---|---|
| T7.1 | 提交源码到本地 git | commit | P0 | T6.10 | N | FR-Q8 |
| T7.2 | 创建 GitHub 仓库 `infineon` 并推送 | 远程仓库 | P0 | T7.1 | N | AC-D1 |
| T7.3 | 创建 Cloudflare Pages 项目并部署 | 部署记录 | P0 | T7.2 | N | AC-D2 |
| T7.4 | 验证 `*.pages.dev` 首页 + 3 详情页 | 验证记录 | P0 | T7.3 | N | AC-D3 |
| T7.5 | `finishing-a-development-branch` 收尾 | 收尾记录 | P0 | T7.4 | N | FR-Q9 |

### 阶段 P8：多品牌复用与文档

| ID | 任务 | 产出 | 优先级 | 依赖 | TDD | 验收 |
|---|---|---|---|---|---|---|
| T8.1 | `brand-creation-guide.md` | 文档 | P1 | T7.5 | N | PRD §12 |
| T8.2 | `brand-mistakes.md` | 文档 | P1 | T7.5 | N | PRD §12 |
| T8.3 | `brand-checklist.md` | 文档 | P1 | T7.5 | N | PRD §12 |
| T8.4 | `check_list1.md` / `check_list2.md` 终版 | 文档 | P0 | T6.7/T6.8 | N | PRD §12 |
| T8.5 | 虚拟品牌复现验证（复制模板+改 JSON） | 验证记录 | P1 | T8.1–T8.4 | N | AC-M6 |

### 阶段 P9：收尾

| ID | 任务 | 产出 | 优先级 | 依赖 | TDD | 验收 |
|---|---|---|---|---|---|---|
| T9.1 | 同步文档状态（PRD/design/plan/todo/checklists） | 文档更新 | P1 | T8 | N | PRD §12 |
| T9.2 | 记录遗留项与后续优化（不扩大 scope） | 遗留清单 | P2 | T9.1 | N | — |

---

## 3. 依赖关系图（关键路径）

```
T0.* → T1.* → T2.* → T3.* → T4.* → T6.* → T7.* → T8.* → T9.*
                  └──────────────→ T5.*（内嵌于每个模块）
P6 集成测试必须在 P1–P4 全部单元通过后开始。
```

- **关键路径**：T2.1 → T2.3 → T2.10/T2.11 → T3.3/T3.4 → T4.5 → T4.14 → T6.3 → T7.3。
- **并行机会**：P3 的解决方案/支持/新闻/关于/联系可并行；SVG（T3.16–T3.19）可提前并行。
- **辅助页依赖**：T3.11 依赖 T3.10；T2.19/T2.20 依赖 T2.5。

---

## 4. 优先级定义

- **P0**：阻塞上线与验收，必须完成。
- **P1**：影响可维护性/复用/文档完整性，应完成。
- **P2**：优化项，可延后。

---

## 5. TDD 判定原则

- **需要 TDD（Y）**：脚本（生成/JSON/Schema/内链校验）、组件交互（表格排序筛选、Tab、FAQ、导航）、Schema 注入、内链校验、集成测试。
- **不需要 TDD（N）**：纯内容撰写（JSON 文案）、纯视觉静态区块、文档编写、部署命令。

---

## 6. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| 型号参数不准确 | 信任/合规 | 以官方数据手册为准，页面标注「以最新规格书为准」 |
| 页面数量多导致空链 | SEO 降权 | 标准型号详情页兜底 + 构建期空链校验 |
| Schema 与可见内容不一致 | 富媒体失效 | 同一 JSON 生成可见内容与 Schema |
| 移动端表格溢出 | 体验差 | 横滚 + 首列吸附 + 视口测试 |
| 百度收录慢 | 流量低 | sitemap、内链、持续更新、FAQ/GEO 结构 |
| 多品牌同质化 | 降权 | 先检索真实产品线，差异化 + FAE 点评 |
| 并行开发冲突 | 返工 | worktree + 一次一 todo + scope 约束 |

---

## 7. 完成定义（Definition of Done）

- 所有 P0 任务完成，P1 任务完成或明确记录遗留。
- `check_list1.md`、`check_list2.md` 全项通过。
- 集成测试、Schema 校验、Playwright 验证通过，零空链、零 404。
- 分类页含 Product Schema；详情页含相关侧栏与分销商 CTA；方案页含技术实力；关于页含团队实力。
- 作者页/标签聚合页可访问。
- GitHub 仓库已推送，Cloudflare Pages 部署成功且可访问。
- brand 系列文档齐备。
- `verification-before-completion` 与 `finishing-a-development-branch` 完成。

---

## 8. 需求覆盖映射（PRD FR → 任务）

| PRD 功能 | 对应任务 |
|---|---|
| FR-G1–G11 全局 | T1.1–T1.14、T4.1–T4.14 |
| FR-G12 分销商 CTA | T1.11、T3.22 |
| FR-G13 相关详情侧栏 | T1.10、T1.11、T3.22 |
| FR-H 首页（含 FAQ） | T2.2、T2.8、T3.1 |
| FR-P1 产品列表 | T2.9、T3.2 |
| FR-P2 二级分类（应用领域/优势对比/动态表） | T2.3、T2.10、T3.3 |
| FR-P3 型号详情（Tab/规格/侧栏） | T2.3、T2.11、T3.4/T3.5 |
| FR-S 解决方案（含技术实力） | T2.4、T2.13、T3.7 |
| FR-T 技术支持（TOC/作者/标签） | T2.5、T2.15、T2.19、T3.10/T3.11 |
| FR-N 新闻（分区/杂志式/导航） | T2.6、T2.17、T3.13 |
| FR-A 关于/联系（团队/报关单/QQ） | T2.7、T2.18、T3.14/T3.15 |
| FR-F FAQ（2 列/段落/Schema） | T1.9、T3.21 |
| FR-M 模板体系（11+2） | T2.8–T2.20 |
| FR-D 数据层（6 JSON） | T2.1–T2.7 |
| FR-V SVG 资产 | T3.16–T3.20 |
| FR-R 设计/响应式/无障碍 | T0.3、T1.14、T6.4/T6.5 |
| FR-B 构建脚本 | T0.4、T2.21 |
| FR-DP 部署 | T7.1–T7.4 |
| FR-Q 质量门禁 | T5.1–T5.7、T6.1–T6.10 |
| Product Schema（分类页） | T4.5 |

---

## 9. 计划评审记录（plan-document-reviewer）

### 9.1 审查标准
完整性（覆盖设计需求）、任务分解（可执行）、依赖关系（正确）、优先级（合理）、遗漏检查；不写具体开发步骤。

### 9.2 第一轮：Issues Found

| 编号 | 类别 | 问题 | 修复 |
|---|---|---|---|
| P-01 | 完整性 | 新增「应用领域/优势对比」无任务 | T2.3、T2.10、T3.3 补 |
| P-02 | 完整性 | 「技术实力」无任务 | T2.4、T2.13、T3.7 补 |
| P-03 | 完整性 | 「团队实力」无任务 | T2.7、T2.18、T3.14 补 |
| P-04 | 完整性 | 作者页/标签页无任务 | T2.19/T2.20、T3.11 补 |
| P-05 | 完整性 | 分类页 Product Schema 无任务 | T4.5 覆盖分类页 |
| P-06 | 完整性 | 相关侧栏/分销商 CTA 无任务 | T1.10/T1.11、T3.22 补 |
| P-07 | 完整性 | 首页 FAQ 无任务 | T2.2、T3.1 补 |
| P-08 | 完整性 | 新闻详情侧栏导航无任务 | T2.17 补 |
| P-09 | 依赖 | 作者页任务未挂依赖 | T3.11 依赖 T3.10；T2.19/2.20 依赖 T2.5 |
| P-10 | 依赖 | 模板任务未显式依赖数据任务 | T2.8–T2.18 依赖对应 JSON |
| P-11 | 优先级 | Schema 一致性校验未列 | T4.14（P0）补 |
| P-12 | 遗漏 | 阶段四整体复核/执行纪律无任务 | T5.6/T5.7 补 |
| P-13 | 遗漏 | 性能/Lighthouse 未列 | T6.9（P1）补 |
| P-14 | 遗漏 | check_list 终版与虚拟品牌复现未列 | T8.4/T8.5 补 |

### 9.3 第二轮：Approved
- **完整性**：PRD/design 的全部页面、组件、Schema、FAQ、SVG、文档均有任务映射（见 §8）。
- **任务分解**：每条任务有产出、依赖、TDD 判定与验收，可执行。
- **依赖关系**：数据→模板→页面→SEO→集成→部署，顺序正确；辅助页依赖已补齐。
- **优先级**：P0 覆盖上线与验收关键路径；文档/复现为 P1；遗留为 P2。
- **无遗漏**：新增需求均已落任务。

**审查结果：Approved**。
