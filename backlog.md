# 遗留项与后续优化（Backlog）

> 记录阶段五验证后的已知限制与后续优化，不扩大当前 scope。
> 当前状态：Critical 已全部关闭；重要项已修复；以下为已知限制/优化项。

## 已知限制

1. **原子构建**：当前为「前置校验 + 旧页清理（prune）」，非临时目录原子替换。建议生成到 `.build/` 后整体替换，避免构建中断产生混合输出。
2. **源码目录隔离**：`data/`、`scripts/`、`templates/` 仍在站点根，已通过 `robots.txt` Disallow 与 `dist/` 构建隔离；部署应使用 `infineon/dist/`（Cloudflare Pages 输出目录）。
3. **模板化文案**：FAQ 已按域补充，深度型号描述与文章 H2 结构仍有模板化痕迹；建议对高价值型号/文章人工润色，进一步提升差异化。
4. **文档下载**：暂无真实 PDF，入口为「索取数据手册」并跳转联系页；后续应放入真实规格书/选型手册。
5. **多品牌复用**：复制 `data/templates/assets/scripts` + 修改 JSON 可生成 61 页（已验证）；但 `header/footer` 的品牌名、产品下拉、联系方式仍部分硬编码，完整换品牌需将 header/footer 完全 token 化。
6. **描述长度**：2 条标签页 `description` 为 58/59 字，略低于自检阈值 60 字（不影响功能与收录）。
7. **模板重复**：16 个模板重复完整 `<head>`，可抽为 head partial；部分 CSS 规则未使用。
8. **favicon**：本地 Python 服务器仍会请求 `/favicon.ico` 404；Cloudflare `_redirects` 已处理，部署环境无此问题。
9. **Lighthouse**：首页移动性能 **95**（FCP/LCP 1.7s、TBT 0ms、CLS 0）；内容更新后建议复测。
10. **业务数据**：公司奖项、团队规模、仓库等表述为示例化内容，上线前应由业务方核验或替换。

## 后续优化

- 将 `header/footer` 完全 token 化，支持一键换品牌。
- 引入真实数据手册 PDF 与下载计数。
- 增加 `llms-full.txt`、RSS、百度站长/统计与 Cloudflare Analytics。
- 增加 CI：`npm run build` + 校验 + 部署 on push。
- 补充真实客户案例与可核验资质文件。
