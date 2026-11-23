# #1851 第一轮返工逐项对照表（R1，2026-11-23）

范围：买方第一轮返工通知的 5 项要求。结论表述以 GPT 复核裁决（2026-11-23 11:48，有条件 GO）为准：
**功能实现多数早已存在，但验收证据是本轮才补齐的。**147ff1cd 代码存在不等于当时已验证通过——原始交付缺少可复核的验收证据，931e9a4 之后才第一次真正跑通验证。

买方通知引用的旧页签与旧筛选参数，经提交历史对照，对应早期提交 37a2021、bfe959f。

## 对照表

| 买方要求 | 结论 | 证据文件 | 测试 / 截图编号 |
|---|---|---|---|
| Blocker 1：七个页签须为总览、网络、商机漏斗、招商、会员成功、组织与 Agent、财务，并各附独立截图 | 七个指定页签在 147ff1cd 起存在（`src/shell/tabs.ts`），`src/App.tsx` 直接渲染；本轮补齐 7 张逐页签截图 | `src/shell/tabs.ts`、`src/App.tsx`、`docs/screenshots/tab-{overview,network,funnel,sales,success,org-agent,finance}.png` | `tests/shell.test.tsx`：exact tabs（7 个标签逐字断言）、renders registered panels for %s（7 页签 `aria-current='page'`）；`scripts/screenshot.mjs`：每页签断言 `aria-current='page'` |
| Blocker 2：面板注册表须挂 8 项，财务页签须有签约额与会籍收入两卡 | 8 项注册在 147ff1cd 起存在（`src/shell/panels.ts`：occupancy→总览，network→网络，funnel→商机漏斗，sales→招商，success→会员成功，org-agent→组织与 Agent，contract→财务，membership→财务）；财务仅两卡，均为占位卡（口径 mock-v1，数据截至时间 —，未接入项未伪造数值） | `src/shell/panels.ts`、`docs/screenshots/tab-finance.png`（目验通过，两卡均渲染） | `tests/shell.test.tsx`：PANELS 长度 8、去重 8、finance 仅两卡（签约额、会籍收入）、2 张 panel-card；`scripts/screenshot.mjs`：断言财务页 h3 为 `['签约额','会籍收入']` |
| Blocker 3：三组全局筛选（会所 scope、时间范围 period、对比方式 comparison）须写 URL 且刷新后保持；不得用 org_id/site_id/month | 三组筛选 + URL 往返在 147ff1cd 起存在（`src/shell/filters.ts`、`src/App.tsx`）；org_id/site_id/month 不进 URL（只存在于已废弃的旧 filters 与内部 mock 调用签名）；会所权限越权时 URL 层归一到 site | `src/shell/filters.ts`、`src/App.tsx`、`docs/screenshots/shell-tabs.png` 及 `tab-*.png`（均显示三组控件） | `tests/filters.test.ts`（4 条：预设；自定义 + 同比往返、保留 tab 与无关参数；越权归一；非法日期拒绝）；`tests/shell.test.tsx`（对比方式切换写 URL、后退恢复、重挂载后自定义日期与对比方式仍在 URL、集团选项越权缺失）；浏览器实测 URL 往返示例见 `docs/r1-supplement.md` |
| Major 1：图表须用本地打包 ECharts，颜色走设计变量，文字标签齐全 | `echarts ^5.6.0` 在 147ff1cd 起在 `package.json`；`src/panel/charts.tsx` 用 `echarts/core` + LineChart/BarChart + SVGRenderer；931e9a4 只把颜色改成 CSS 设计变量 | `src/panel/charts.tsx`、`src/styles.css`、`package.json`、`docs/screenshots/tab-overview.png`、`docs/screenshots/panel.png`（四图：趋势线、楼层堆叠含图例与数值标签、到期分桶、续约趋势） | `tests/panel.test.tsx`（真实 ECharts SVG：图例 已租/预留/空置、15+ text 节点、可访问数据表；设计变量单测）；`tests/noExternal.test.ts`（源码无 http(s) 外链、package.json 无 cdn）；浏览器零外部请求；构建产物 grep 见 `docs/r1-supplement.md` |
| Major 2：卡片须加数据截至时间与导出按钮（无权限不渲染） | dataAsOf 与 canExport 是 931e9a4 新增的功能点，本轮首次跑通验证；详见专项记录 | `src/shell/PanelCard.tsx`、`src/mock/api.ts`、`src/App.tsx`、`docs/r1-dataasof-canexport.md` | `tests/shell.test.tsx`（无权限无导出按钮；有权限 5 个导出按钮、as-of 含 2026-11-17T23:59:59Z）；`tests/panel.test.tsx`（dataAsOf 来自返回数据快照）；截图 `tab-overview.png`（5 卡“数据截至时间：2026-11-22T23:59:59Z”与导出按钮）、`panel.png`（5 卡 as-of 为固定值 2026-11-22T23:59:59Z）、`tab-overview-noexport.png`（无权限态：0 个导出按钮，5 卡 as-of 均为 2026-11-22T23:59:59Z） |

## 自动化实测（2026-11-23 03:40，本轮复核时重构建一致）

- `npm ci`：退出 0。
- `npm test`：4 文件、30/30 通过（filters 4、noExternal 2、panel 8、shell 16）。日志：`docs/evidence/unit.log`。
- `npm run build`：退出 0，JS 790.08 kB（两次重构建产物完全一致，见 `docs/r1-supplement.md`）。日志：`docs/evidence/build.log`。
- `npm run check:no-external`：退出 0（7 页签断言、筛选刷新保持、ECharts 楼层跳转到 /floors/fl-f1、零外部请求、零页面错误）。
- `npm run screenshot`：退出 0，13 张截图全部生成。日志：`docs/evidence/browser.log`。
- 目验：13/13 全部通过，见 `docs/r1-screenshot-review.md`。

## 校验

截图及日志的 SHA256 记录见仓库 `MANIFEST.sha256`，在仓库根目录执行 `sha256sum -c MANIFEST.sha256` 可自行校验。
