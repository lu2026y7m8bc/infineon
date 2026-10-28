# brand-checklist.md — 新增品牌检查清单

> 用途：新增一个品牌站时逐项勾选，确保与英飞凌站同架构、同质量、内容差异化。
> 规则：`[ ]` 未完成 / `[x]` 完成 / `[!]` 待澄清。全部 `[x]` 才可部署。
> 配套：详细页面/JSON 检查见 `check_list1.md`、`check_list2.md`。

---

## A. 立项（开工前）
- [ ] A1 品牌名 / 中文名 / 英文名确定。
- [ ] A2 公司主体名与联系方式确定（含 QQ/电话/地址）。
- [ ] A3 核心关键词与长尾词矩阵确定（品牌代理、产品+代理、资质、地域、问题型）。
- [ ] A4 仓库名 / Cloudflare Pages 项目名确定。
- [ ] A5 主题色是否需要调整（默认沿用 `#0072ce` + 橙 CTA）。
- [ ] A6 已阅读 `brand-creation-guide.md` 的规则与禁忌。

## B. 品牌调研（写作前）
- [ ] B1 已检索该品牌真实产品线（分类与系列）。
- [ ] B2 已确认主要应用行业与解决方案方向。
- [ ] B3 已确认典型型号/参数/封装来源（官方数据手册）。
- [ ] B4 已列出与英飞凌的**差异点**（产品/行业/方案）。
- [ ] B5 未直接复用其他品牌文案。

## C. 目录与数据
- [ ] C1 新建 `<brand>/` 目录，复制 `templates/`、`assets/`、`scripts/`。
- [ ] C2 建立 `data/` 下 6 个 JSON（home/products/solutions/support/news/about）。
- [ ] C3 JSON 通过 schema 校验。
- [ ] C4 产品分类数量与型号数量符合本次要求（分类数、每分类深度/标准型号数）。
- [ ] C5 型号描述 ≥150 字；文章/方案/新闻正文 ≥800 字。
- [ ] C6 FAQ 字段完整（question/answer 段落/decisionGuide），条数与字数达标。
- [ ] C7 品牌专属信息（关键词/资质/联系）已替换，无英飞凌残留。
- [ ] C8 表格中每个型号都有详情页路径（无空链）。

## D. 模板与生成
- [ ] D1 11 类模板齐备且 nav/footer/面包屑与首页一致。
- [ ] D2 三套详情模板结构差异保持（电商/博客/杂志）。
- [ ] D3 生成脚本可幂等运行，产出全部页面。
- [ ] D4 生成后无模板占位残留（`{{ }}` 等）。
- [ ] D5 换 JSON 可生成第二个品牌，验证复用成立。

## E. SEO / GEO
- [ ] E1 每页唯一 title/description/canonical/OG。
- [ ] E2 关键词自然分布，无堆砌。
- [ ] E3 面包屑 + BreadcrumbList 全站。
- [ ] E4 结构化数据齐备（Organization/WebSite/Product/TechArticle/NewsArticle/FAQPage/ItemList）。
- [ ] E5 Schema 与可见内容一致。
- [ ] E6 内链网络连通（分类↔型号↔BOM↔文章↔新闻）。
- [ ] E7 sitemap.xml / robots.txt（+ llms.txt 可选）已生成。
- [ ] E8 图片 alt 全覆盖。

## F. 设计与体验
- [ ] F1 设计 token 生效，无游离色值。
- [ ] F2 响应式 375/768/1024/1440 无横向滚动。
- [ ] F3 产品详情双栏→单栏、技术侧栏→文末。
- [ ] F4 FAQ 2 列、答案分段、可抓取。
- [ ] F5 可访问性 AA（对比度/键盘/focus/reduced-motion）。
- [ ] F6 每页有匹配 SVG 图。
- [ ] F7 Logo + 右侧英文标语正确。

## G. 审查与测试
- [ ] G1 每个模块完成后立即审查+测试（失败即修复复测）。
- [ ] G2 `requesting-code-review` + `receiving-code-review` 完成。
- [ ] G3 高风险单元（脚本/部署/Schema）已预审。
- [ ] G4 全部单元通过后执行集成测试。
- [ ] G5 内链/空链校验 0 命中。
- [ ] G6 Playwright 打开全部页面无报错。
- [ ] G7 `check_list1.md` 全项通过。
- [ ] G8 `check_list2.md` 全项通过。
- [ ] G9 `verification-before-completion` 验证通过。

## H. 部署与交付
- [ ] H1 源码提交本地 git，工作区干净。
- [ ] H2 GitHub 仓库创建并推送成功。
- [ ] H3 Cloudflare Pages 部署成功。
- [ ] H4 `*.pages.dev` 首页 + 至少 3 个详情页返回 200。
- [ ] H5 无密钥/Token 进入仓库。
- [ ] H6 `finishing-a-development-branch` 收尾完成。
- [ ] H7 文档状态同步（PRD/design/plan/todo/checklists）。
- [ ] H8 如发生错误，已写入 `brand-mistakes.md` 并评估更新 guide/checklist。

---

## 签署
| 项目 | 负责人 | 日期 | 结论 |
|---|---|---|---|
| 新品牌：__________ | — | — | 待完成 |
