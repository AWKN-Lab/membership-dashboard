# #1851 第一轮返工补充证据（R1，2026-11-23）

## 一、bundle 790.06 → 790.08 kB 的解释

结论：**0.02 kB 不是本轮引入的。**本轮提交（44b6fd4）零源码改动；790.06 是 931e9a4 记录的旧值，与本机两次实测都不吻合。

实测（本机，Node v24.22.1、npm 10.9.4、Vite 5.4.21）：

| 源码状态 | Vite 报 JS 大小 | 产物文件大小 | 产物哈希 |
|---|---|---|---|
| 147ff1cd（931e9a4 之前） | 789.48 kB | 792,982 字节 | `index-B4CkxjMl.js` |
| 当前（931e9a4 源码 + 本轮）03:40 构建 | 790.08 kB | 793,566 字节 | `index-Bzj4bVGj.js` |
| 当前 03:52 重构建 | 790.08 kB | 793,566 字节 | `index-Bzj4bVGj.js`（完全一致） |

- 789.48 → 790.08 kB 的 0.60 kB 增长来自 931e9a4 自身的源码改动（`charts.tsx` 的 `resolveChartColor` 与设计变量、`PanelCard.tsx` 的 as-of 文案与 canExport 门禁、`mock/api.ts` 的 dataAsOf、`App.tsx` 的 asOf 传递）。
- 790.06 与本机两次实测（789.48 / 790.08）都不吻合，应为另一环境或中间态的测量值被原样带入 931e9a4 的 TEST-REPORT。
- 同一源码在本机两次构建产物完全一致（哈希、文件大小、Vite 报数均相同），构建可复现。
- 备注：Vite 报的 kB 数与产物文件字节数有约 3.5 kB 的固定差（报数口径），两次构建的报数与文件大小各自一致，不影响结论。

给买方的说明口径（已写入 `docs/r1-message-to-buyer.md`）：本次提交仅补充证据文件及更新证据清单、测试报告，没有修改业务源码与测试代码。

## 二、ECharts 本地化的直接证据

- `package.json`：`"echarts": "^5.6.0"`；`package-lock.json` 与 `node_modules/echarts/package.json` 均为 5.6.0（精确一致）。
- `src/panel/charts.tsx`：`import * as echarts from 'echarts/core'`，`LineChart`/`BarChart`、`GridComponent`/`LegendComponent`/`TooltipComponent`、`SVGRenderer`、`EChartsCoreOption`。
- 构建产物（`dist/assets/index-Bzj4bVGj.js`，793,566 字节）grep：
  - `echarts` 出现 3 处；`setOption`（ECharts 核心 API）出现 19 处；`zrender`（ECharts 渲染引擎）出现 1 处（LICENSE 链接）。
  - `cdn` 出现 0 处。
  - 产物内全部 http(s) 字符串仅 3 条，均为依赖代码里的文档/许可证链接（classnames 主页、zrender LICENSE、react 错误解码器），不是资源引用。
- `dist/index.html` 只加载本地 `./assets/index-Bzj4bVGj.js` 与 `./assets/index-Bhs6b0nq.css`，无外部 script/link。
- 运行时：浏览器脚本断言零外部请求、零页面错误（`docs/evidence/browser.log`：PASS）。
- 单元测试（`tests/panel.test.tsx`）渲染出真实 ECharts SVG（`echarts-surface`、图例 已租/预留/空置、15+ text 节点、可访问数据表），不是手写 SVG 替代品。

## 三、URL 往返具体示例（浏览器实测）

探针：Playwright + Chromium 1243，本地静态服务器（端口每次随机，查询串为准）。

- 刷新前 URL：`/dash?tab=finance&scope=site&period=this-month&start=2026-11-01&end=2026-11-30&comparison=yoy`
- 刷新后 URL：`/dash?tab=finance&scope=site&period=this-month&start=2026-11-01&end=2026-11-30&comparison=yoy`（完全一致）
- 刷新后控件恢复：对比方式 `yoy`、页签 `finance`、会所 `site`、时间范围 `this-month`，与刷新前一致。
- 单元测试另有覆盖：`tests/filters.test.ts`（自定义 + 同比往返、保留 tab 与无关参数）；`tests/shell.test.tsx`（对比方式切换写 URL、后退恢复、重挂载后自定义日期 2026-08-12～2026-09-06 与对比方式 yoy 仍在 URL 里）。

## 四、MANIFEST 校验方法

- `MANIFEST.sha256` 覆盖仓库全部已跟踪文件：截图 13 张、证据日志 3 份、其余为源码/测试/配置/文档。`dist/`、`node_modules/` 不在其中。
- 生成方法：`git ls-files` 排序后 `sha256sum`，排除 `MANIFEST.sha256` 自身。
- 买方校验（仓库根目录执行）：`sha256sum -c MANIFEST.sha256`，全部应为 OK。
- 本次补证新增 5 个文件：`docs/r1-item-mapping.md`、`docs/r1-dataasof-canexport.md`、`docs/r1-screenshot-review.md`、`docs/r1-supplement.md` 已提交并计入 MANIFEST（共 53 条）；`docs/r1-message-to-buyer.md` 为待发消息草稿，未提交、不在 MANIFEST 中。MANIFEST 已随提交重生成。

## 五、内部声明：scripts/evidence-dump.mjs 已过期

- `scripts/evidence-dump.mjs` 已过期：用无效页签 `?tab=occupancy`、读不存在的 `legend-`/`seg-` testid、EXEC 硬编码 `/root/.cache/...`（本机无此路径）。
- 本轮未使用它（截图、日志、MANIFEST 均由其他方式生成）；后续单独修复，不属于本次交付范围。
- 本声明只记在内部记录，不放进给买方的消息正文。
