# #1851 / #1896 验收证据（文本版）

平台自动预检读不了 PNG，故把截图里能看见的东西逐条转成**可复制的 DOM 原文**。
生成方式：`npm run build && node scripts/evidence-dump.mjs`（Playwright 打开已构建的 dist，读 DOM；全程零外部请求，异常即非零退出）。
本文件随仓提交，验收方可自行重跑核对。

生成时间：2026-11-23T08:27:48.047Z　｜　外部请求数：**0**　｜　页面错误数：**0**

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
| `docs/screenshots/tab-overview.png` | 168595 字节 | `3fedf316333f249830ed3c65730e517e14aa1d8962ee97b5b02d360feca445b9` |
| `docs/screenshots/tab-network.png` | 41167 字节 | `1b33d85191eafaa631b17f9ff589bce178b4aa3605cab9ed9b0afd1f909093fc` |
| `docs/screenshots/tab-funnel.png` | 41365 字节 | `3bd6c3510e109c0476870a06d35d097e8f73a40609c823fbe9fffdb3aac989c1` |
| `docs/screenshots/tab-sales.png` | 40473 字节 | `ab6ff99ffb5d8c53ba72e5736dc852af61271c5bcb482f45294f4a5834fb398b` |
| `docs/screenshots/tab-success.png` | 41235 字节 | `a47f2a73f6737a730c688a7fc0670819841c378f596e9997efe32641de3f6266` |
| `docs/screenshots/tab-org-agent.png` | 41717 字节 | `619cddbcd8d62e431f550ee467b2f7d948af8feffbcd19428d453684cd9f44ed` |
| `docs/screenshots/tab-finance.png` | 51821 字节 | `71ed666d599952103a87e286db70543b7d82dafb8a1e6fa247113fca247a60c7` |
| `docs/screenshots/shell-tabs.png` | 52067 字节 | `617d7413779f7da9c0fafb7543c37aa60cfe927e0592e3277a58223147478bb9` |
| `docs/screenshots/panel.png` | 170849 字节 | `b0af81334cc8936a3d606e0019c12a41a6830f34537d8472c124c3712fd93b0b` |
| `docs/screenshots/panel-empty.png` | 87658 字节 | `3d7f911ba5b00c768396e9239252d516da43e4654eec22e858c1a352938e742c` |
| `docs/screenshots/card-loading.png` | 85566 字节 | `62122cae76efcd4e36fd94f279f5f98d6fb935e166c992064381dd1b7f1d8f70` |
| `docs/screenshots/card-error.png` | 103736 字节 | `e8bfe5fc2f471a744e6e1c88b66111754519a0d5890f7c75b02e0d7a00590670` |

## 复跑命令

```bash
npm ci
npm test                  # Test Files 4 passed (4) | Tests 30 passed (30)
npm run build             # exit 0（仅 >500 kB chunk 警告）
npm run check:no-external # 构建产物无外部域名引用
CHROMIUM_PATH=<带中文字体的 Chrome/Chromium> node scripts/screenshot.mjs  # 12 张截图 + 行为断言
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
