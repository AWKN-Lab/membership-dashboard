# #1851 / #1896 验收证据（文本版）

平台自动预检读不了 PNG，故把截图里能看见的东西逐条转成**可复制的 DOM 原文**。
生成方式：`npm run build && node scripts/evidence-dump.mjs`（Playwright 打开已构建的 dist，读 DOM；全程零外部请求，异常即非零退出）。
本文件随仓提交，验收方可自行重跑核对。

生成时间：2026-11-23T12:10:47.536Z　｜　外部请求数：**0**　｜　页面错误数：**0**

## AC1 七个页签（DOM 实际渲染，逐字）

- 页签列表：`总览` / `网络` / `商机漏斗` / `招商` / `会员成功` / `组织与 Agent` / `财务`
- 页签顺序与工单原文一致：总览、网络、商机漏斗、招商、会员成功、组织与 Agent、财务

## AC1 每个页签的真实内容（DOM）

### overview　（URL：`/dash?tab=overview&period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy&scope=site`）

- 当前高亮页签：`总览`
- 筛选控件值：会所=`site`，时间范围=`custom`，对比方式=`yoy`
- 卡片 `出租率`：口径 `口径 v1.2：已租工位 ÷ 可租工位（期末值）；环比 = 本期末 − 上期末（百分点）`；`数据截至时间：2026-11-22T23:59:59Z`；状态 `normal`；导出按钮 在 DOM 中
- 卡片 `近 12 个月出租率趋势`：口径 `口径 v1.2：每月末出租率（%）`；`数据截至时间：2026-11-22T23:59:59Z`；状态 `normal`；导出按钮 在 DOM 中
- 卡片 `按楼层工位结构`：口径 `口径 v1.2：已租、预留、空置工位数互斥`；`数据截至时间：2026-11-22T23:59:59Z`；状态 `normal`；导出按钮 在 DOM 中
- 卡片 `到期工位分桶`：口径 `口径 v1.2：到期日距离统计时点：0–30、31–60、61–90 天`；`数据截至时间：2026-11-22T23:59:59Z`；状态 `normal`；导出按钮 在 DOM 中
- 卡片 `续约率趋势`：口径 `口径 v1.2：每月续约率（%），演示口径`；`数据截至时间：2026-11-22T23:59:59Z`；状态 `normal`；导出按钮 在 DOM 中

### network　（URL：`/dash?tab=network&period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy&scope=site`）

- 当前高亮页签：`网络`
- 筛选控件值：会所=`site`，时间范围=`custom`，对比方式=`yoy`
- 卡片 `会员网络`：口径 `口径 draft：会员关系网络（待口径库对接）`；`数据截至时间：—`；状态 `empty`（`暂无数据`）；导出按钮 不在 DOM 中

### funnel　（URL：`/dash?tab=funnel&period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy&scope=site`）

- 当前高亮页签：`商机漏斗`
- 筛选控件值：会所=`site`，时间范围=`custom`，对比方式=`yoy`
- 卡片 `商机漏斗`：口径 `口径 draft：按商机阶段汇总（待口径库对接）`；`数据截至时间：—`；状态 `empty`（`暂无数据`）；导出按钮 不在 DOM 中

### sales　（URL：`/dash?tab=sales&period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy&scope=site`）

- 当前高亮页签：`招商`
- 筛选控件值：会所=`site`，时间范围=`custom`，对比方式=`yoy`
- 卡片 `招商`：口径 `口径 draft：招商线索与转化（待口径库对接）`；`数据截至时间：—`；状态 `empty`（`暂无数据`）；导出按钮 不在 DOM 中

### success　（URL：`/dash?tab=success&period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy&scope=site`）

- 当前高亮页签：`会员成功`
- 筛选控件值：会所=`site`，时间范围=`custom`，对比方式=`yoy`
- 卡片 `会员成功`：口径 `口径 draft：会员服务指标（待口径库对接）`；`数据截至时间：—`；状态 `empty`（`暂无数据`）；导出按钮 不在 DOM 中

### org-agent　（URL：`/dash?tab=org-agent&period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy&scope=site`）

- 当前高亮页签：`组织与 Agent`
- 筛选控件值：会所=`site`，时间范围=`custom`，对比方式=`yoy`
- 卡片 `组织与 Agent`：口径 `口径 draft：组织与 Agent 指标（待口径库对接）`；`数据截至时间：—`；状态 `empty`（`暂无数据`）；导出按钮 不在 DOM 中

### finance　（URL：`/dash?tab=finance&period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy&scope=site`）

- 当前高亮页签：`财务`
- 筛选控件值：会所=`site`，时间范围=`custom`，对比方式=`yoy`
- 卡片 `签约额`：口径 `口径 mock-v1：筛选期间签约金额合计（分）`；`数据截至时间：—`；状态 `empty`（`暂无数据`）；导出按钮 不在 DOM 中
- 卡片 `会籍收入`：口径 `口径 mock-v1：筛选期间会籍收入合计（分）`；`数据截至时间：—`；状态 `empty`（`暂无数据`）；导出按钮 不在 DOM 中

## AC1 三种卡片状态（DOM 原文）

- loading → 状态 `loading`，文案 `加载中…`
- empty → 状态 `empty`，文案 `暂无数据`
- error → 状态 `error`，文案 `数据加载失败，请稍后重试`

另附有数据态（normal）：见上节各卡片 `状态 normal`。四态各有截图（panel / card-loading / panel-empty / card-error）。

## AC2 口径提示（定义 + 版本号，DOM 原文）

- `口径 v1.2：已租工位 ÷ 可租工位（期末值）；环比 = 本期末 − 上期末（百分点）`
- `口径 v1.2：每月末出租率（%）`
- `口径 v1.2：已租、预留、空置工位数互斥`
- `口径 v1.2：到期日距离统计时点：0–30、31–60、61–90 天`
- `口径 v1.2：每月续约率（%），演示口径`
- `口径 draft：会员关系网络（待口径库对接）`
- `口径 draft：按商机阶段汇总（待口径库对接）`
- `口径 draft：招商线索与转化（待口径库对接）`
- `口径 draft：会员服务指标（待口径库对接）`
- `口径 draft：组织与 Agent 指标（待口径库对接）`
- `口径 mock-v1：筛选期间签约金额合计（分）`
- `口径 mock-v1：筛选期间会籍收入合计（分）`

## AC3 筛选写入 URL、刷新后保持

- 筛选与页签只存 URL query（唯一真相源）。实测：把对比方式改为同比并刷新 ⇒ URL `/dash?tab=finance&scope=site&period=this-month&start=2026-11-01&end=2026-11-30&comparison=yoy`，刷新后 tab=`finance`、对比方式=`yoy`
- 单测：`tests/filters.test.ts`（4 项）+ `tests/shell.test.tsx`（含切页签不丢筛选、返回上一页）

## AC4 构建产物零外部域名

- 本次转储 11 个场景：外部请求 **0** 条、页面错误 **0** 条
- `npm run check:no-external` ⇒ `构建产物无外部域名引用 ✅`
- 单测：`tests/noExternal.test.ts`（2 项）

## 面板覆盖范围（主动交代，不含糊）

注册表 `src/shell/panels.ts` 共 8 个注册项：

| 页签 | 卡片 | 本轮状态 | 说明 |
|---|---|---|---|
| 总览 | 出租率 / 近 12 个月趋势 / 按楼层工位结构 / 到期工位分桶 / 续约率 | 真实渲染（演示数据） | 指标卡、ECharts 折线与堆叠条、文字标签、楼层跳转均已实现 |
| 网络 | 会员网络 | 明确空态 | 口径 draft，待口径库对接 |
| 商机漏斗 | 商机漏斗 | 明确空态 | 口径 draft，待口径库对接 |
| 招商 | 招商 | 明确空态 | 口径 draft，待口径库对接 |
| 会员成功 | 会员成功 | 明确空态 | 口径 draft，待口径库对接 |
| 组织与 Agent | 组织与 Agent | 明确空态 | 口径 draft，待口径库对接 |
| 财务 | 签约额 / 会籍收入 | 明确空态 | 口径 mock-v1，按工单「本期只放这两张卡、回款与开票后续接入」留空 |

空态一律显示 `暂无数据`，不渲染任何数值，避免把「没数据」画成「数据是 0」。

## 期限口径

- 平台 `assignment_deadline` = `2026-11-26T03:08:19Z` ⇒ 北京时间 **2026-11-26 11:08**（按平台原值排期）
- 平台 `deadline` = `2026-12-14T15:59:59Z`；返工轮次 1/3

## 截图文件（sha256 固定，可比对）

| 文件 | 大小 | sha256 |
|---|---|---|
| `docs/screenshots/tab-overview.png` | 178116 字节 | `74a18b0ee7eed13d6e0de279b0930c1be64f049d29a5a7585b9a943642bfeea5` |
| `docs/screenshots/tab-overview-noexport.png` | 175182 字节 | `16ecd7d320fedaa0c600ce3d09d4db90e182f1d0e80e40c008ba813ef43a0fc1` |
| `docs/screenshots/tab-network.png` | 43592 字节 | `0510ff630f70e7dd961b3422ed131f06055fb4b52e398f19e7c807a04140aa3c` |
| `docs/screenshots/tab-funnel.png` | 43819 字节 | `408bd3ea7ff1a5fcf806731ffa6f5358c7684c2b47fe26f85e17c210df070732` |
| `docs/screenshots/tab-sales.png` | 42960 字节 | `c8f9fc9427b8513bb4577cf173353f94c350a09e649468432eb929a85168e928` |
| `docs/screenshots/tab-success.png` | 43793 字节 | `6eaa4af6798c83d1adbda9f8a36684a84914c67bf3518246b28de43282dfba11` |
| `docs/screenshots/tab-org-agent.png` | 44366 字节 | `56ee62b1e46578d8b6332786e64956abccaa7f82770a882f139851e0db3f97c4` |
| `docs/screenshots/tab-finance.png` | 54900 字节 | `1e10eff12a79433f34829446c6a4bc4a3e7009f599f7e7a6494881d90f0458b3` |
| `docs/screenshots/shell-tabs.png` | 55050 字节 | `649e60e51bc44772bc2cf100358b8c8fce5ced776300c7175745596ab7b6e690` |
| `docs/screenshots/panel.png` | 176936 字节 | `bb6a5889a75f177470d9f104af9666f7d6e6ff40c720d4a2cfea608999c5adf3` |
| `docs/screenshots/panel-empty.png` | 92278 字节 | `c0db1d01359ff186a7bcda5aa69c891e5cdc41cec4e6678d169bc5f95e9f3399` |
| `docs/screenshots/card-loading.png` | 89992 字节 | `6874a15f69fe2eac66b18b6d4ec85ed5152760fb53ac4c7002972c4c52c9a2cd` |
| `docs/screenshots/card-error.png` | 110248 字节 | `486ba63a3fafba2bed198d08e7fef017e0f8fc556034396ec33611742da99552` |

## 复跑命令

```bash
npm ci
npm test                  # Test Files 4 passed (4) | Tests 30 passed (30)
npm run build             # exit 0（仅 >500 kB chunk 警告）
npm run check:no-external # 构建产物无外部域名引用
CHROMIUM_PATH=<带中文字体的 Chrome/Chromium> node scripts/screenshot.mjs  # 13 张截图 + 行为断言
node scripts/evidence-dump.mjs   # 重新生成本文件
```

## 变异自证

| 变异 | 期望红点 |
|---|---|
| 去掉条内数值标签 | `tests/panel.test.tsx` 段内数值断言失败 |
| 筛选写回丢掉 month | `tests/filters.test.ts` 往返断言失败 |
| 楼层跳转丢掉 floorId | `tests/panel.test.tsx` 落地页断言失败 |
| 去掉 URL 参数写入 | `tests/shell.test.tsx` 刷新/返回断言失败 |
| ECharts 改成 CDN | `tests/noExternal.test.ts` + `npm run check:no-external` 变红 |

> 注：上表 tab-overview-noexport.png 一行由整合时手工补入（证据转储脚本只覆盖 12 张，未含无权限态截图），SHA 与大小取自实际文件。

## 第一轮返工补证（R1，2026-11-23；整合时补记）

- 逐项对照表：`docs/r1-item-mapping.md`（买方 5 项 → 结论、证据文件、测试/截图编号）。
- dataAsOf/canExport 专项验证：`docs/r1-dataasof-canexport.md`。
- 截图目验：`docs/r1-screenshot-review.md`（13/13 全部通过；整合时逐张重验，结论同前）。
- 补充证据（bundle 解释、ECharts grep、URL 往返示例、MANIFEST 校验方法）：`docs/r1-supplement.md`。
- 整合说明：`scripts/evidence-dump.mjs` 在远端 0b2651f 已修复（旧版过期问题不存在），本文件由修复版脚本在整合树上重新生成；无权限态截图与 13 张目验见上列。
