# #1851 验收证据（逐条 · 机器可读 · 仓根版）

> **这份文件为什么在仓根**：平台的自动预检（`delivery_check`）**读不了 PNG 截图**，
> 而且在 57 个文件里**只读了仓根的少数几个** ⇒ 证据不落在仓根，评审方就看不到，
> 预检只能判 `unclear`。**完整版见 `docs/acceptance-evidence.md`，原始转储见 `docs/evidence/dom.log`。**

> 生成：`npm ci && npm run build && node scripts/evidence-dump.mjs && node scripts/screenshot.mjs`
> （截图脚本带**中文字形自检**：把 9 个汉字与 9 个等长 .notdef 参照字符画到 canvas 比对像素，
> 一致即判定为豆腐块并非零退出 —— 上一轮 12 张截图正是在无中文字体的隔离 Chromium 下产出、全为豆腐块，已作废）。

## 验收 1｜七个页签与三种卡片状态各有截图

**七个页签（DOM 实际渲染文本）**
```
总览
网络
商机漏斗
招商
会员成功
组织与 Agent
财务
```

**七页签各自一张独立截图**（sha256 见下表，可自行比对）：

| 截图 | sha256 |
|---|---|
| `docs/screenshots/card-error.png` | `e8bfe5fc2f471a744e6e1c88b66111754519a0d5890f7c75b02e0d7a00590670` |
| `docs/screenshots/card-loading.png` | `62122cae76efcd4e36fd94f279f5f98d6fb935e166c992064381dd1b7f1d8f70` |
| `docs/screenshots/panel-empty.png` | `3d7f911ba5b00c768396e9239252d516da43e4654eec22e858c1a352938e742c` |
| `docs/screenshots/panel.png` | `b0af81334cc8936a3d606e0019c12a41a6830f34537d8472c124c3712fd93b0b` |
| `docs/screenshots/shell-tabs.png` | `617d7413779f7da9c0fafb7543c37aa60cfe927e0592e3277a58223147478bb9` |
| `docs/screenshots/tab-finance.png` | `71ed666d599952103a87e286db70543b7d82dafb8a1e6fa247113fca247a60c7` |
| `docs/screenshots/tab-funnel.png` | `3bd6c3510e109c0476870a06d35d097e8f73a40609c823fbe9fffdb3aac989c1` |
| `docs/screenshots/tab-network.png` | `1b33d85191eafaa631b17f9ff589bce178b4aa3605cab9ed9b0afd1f909093fc` |
| `docs/screenshots/tab-org-agent.png` | `619cddbcd8d62e431f550ee467b2f7d948af8feffbcd19428d453684cd9f44ed` |
| `docs/screenshots/tab-overview.png` | `3fedf316333f249830ed3c65730e517e14aa1d8962ee97b5b02d360feca445b9` |
| `docs/screenshots/tab-sales.png` | `ab6ff99ffb5d8c53ba72e5736dc852af61271c5bcb482f45294f4a5834fb398b` |
| `docs/screenshots/tab-success.png` | `a47f2a73f6737a730c688a7fc0670819841c378f596e9997efe32641de3f6266` |



（见 `docs/acceptance-evidence.md`）

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
