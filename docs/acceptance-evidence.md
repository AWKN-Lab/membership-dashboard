# 验收证据（文本版 —— 平台预检读不了 PNG，故把截图里能看见的东西转成可核对的文本）

生成方式：`npm run build && node scripts/evidence-dump.mjs`（Playwright 打开**已构建的 dist/**，读取 DOM 文本；全程零外部请求）。本文件随仓提交，验收方可自行重跑核对。

## A. 七个页签（#1851 验收 1）

页签文案（DOM 实际渲染文本）：
- `总览`
- `出租率`
- `到期与续约`
- `招商线索`
- `会员结构`
- `服务与工单`
- `口径与版本`

## B. 卡片三态（#1851 验收 1）

- 有数据：渲染出租率指标卡与图表（见 C/D 节文本）
- 加载中：`data-testid="card-loading"` → `["加载中…","加载中…","加载中…","加载中…","加载中…"]`
- 空数据：`data-testid="card-empty"` → `["暂无数据","暂无数据","暂无数据","暂无数据","暂无数据"]`
  （空态下**不出现**任何指标值与图表：`rate-end` = `[]`）

## C. 口径提示（#1851 验收 2）

DOM 实际渲染文本（口径原文 + 版本号）：
> 口径 v1.2：本页指标的口径说明

出租率面板内的完整口径（DOM 原文）：
> 口径 v1.2：出租率 = 已租工位 ÷ 可租工位（期末值）；环比 = 本月末 − 上月末（百分点）

## D. 堆叠条形：图例 + 条内数值标签（#1896 验收 1）

图例（DOM 文本）：
- `已租`
- `预留`
- `空置`

各楼层分段（DOM 文本，testid 形如 `seg-<楼层>-<已租|预留|空置>`）：
- `seg-fl-f1-rented` → `已租 47`
- `seg-fl-f1-reserved` → `预留 12`
- `seg-fl-f1-vacant` → `空置 11`
- `seg-fl-f2-rented` → `已租 74`
- `seg-fl-f2-reserved` → `4`
- `seg-fl-f2-vacant` → `空置 20`
- `seg-fl-f3-rented` → `已租 43`
- `seg-fl-f3-reserved` → `2`
- `seg-fl-f3-vacant` → `空置 26`
- `seg-fl-f4-rented` → `已租 64`
- `seg-fl-f4-reserved` → `1`
- `seg-fl-f4-vacant` → `10`
- `seg-fl-f5-rented` → `已租 65`
- `seg-fl-f5-reserved` → `0`
- `seg-fl-f5-vacant` → `空置 32`

> 每段文本都含**数值**（不是只有颜色块）；窄段只显示数字、宽段显示"标签 数值"。

指标卡（DOM 文本）：`["84.7%"]` / `["环比 +1.5pp"]`

## E. 点击楼层跳转的 URL（#1896 验收 2）

跳转目标格式：`/floors/{floorId}?org_id=&site_id=&month=`
单元测试断言落地页拿到 `fl-f1|org-demo|site-demo-a|2026-11`（`tests/panel.test.tsx`）。

## F. 筛选写入 URL / 刷新保持（#1851 验收 3）

筛选与页签**只存 URL query**（唯一真相源）⇒ 刷新 / 前进后退天然保持。
单测：`tests/filters.test.ts`（4 项）+ `tests/shell.test.tsx`。

## G. 构建产物零外部域名（#1851 验收 4）

- `npm run check:no-external` → `构建产物无外部域名引用 ✅`
- `scripts/screenshot.mjs` 监听浏览器 request 事件，非 `file://` 即判失败
  ⇒ 实测 4 张截图均 `(无外部请求/无报错)`
- 本次证据转储同样断言：外部请求数 = 0

## H. 截图文件（sha256 固定，可比对）

| 文件 | 大小 | sha256 |
|---|---|---|
| `docs/screenshots/panel.png` | 192595 字节 | `sha256 c7b5a48d67d4b65faee3abdffe8095a1b6ff60948ea5889fde301e2212875edd` |
| `docs/screenshots/panel-empty.png` | 110014 字节 | `sha256 ff2f37edc99ab80338b9cd04a366e75cc26e4712adcfc2b63d903d3f5898af28` |
| `docs/screenshots/card-loading.png` | 106635 字节 | `sha256 164346a152682d1b2274edeb4ce34a1874724c5788c98e76c98fbc619a013680` |
| `docs/screenshots/shell-tabs.png` | 98940 字节 | `sha256 03ae765991606abc4eb39965950d8e6891bd07ea1150ad07906d25e8a3140a38` |

## I. 复跑命令与实测输出

```bash
npm install
npm run test              # Test Files 4 passed (4) | Tests 14 passed (14)
npm run build             # dist/index.html 0.40 kB │ index.css 2.30 kB │ index.js 172.49 kB
npm run check:no-external # 构建产物无外部域名引用 ✅
npm run screenshot        # 4 张截图，每张 (无外部请求/无报错)
node scripts/evidence-dump.mjs   # 重新生成本文件
```

## J. 变异自证（改行为不改名 ⇒ 因正确原因变红 ⇒ sha256 复原）

| 变异 | 期望红点 | 实测失败信息 |
|---|---|---|
| M1 去掉条内数值标签（`panel/charts.tsx`）| `tests/panel.test.tsx` | `AssertionError: expected [ 'seg-fl-f1-rented', …(14) ] to deeply equal []` |
| M2 筛选写回丢掉 month（`shell/filters.ts`）| `tests/filters.test.ts` | `AssertionError: expected { org_id: 'o', site_id: 's', …(1) } to deeply equal { … }` |
| M3 楼层跳转丢掉 floorId（`panel/OccupancyRatePanel.tsx`）| `tests/panel.test.tsx` | `TestingLibraryElementError: Unable to find an element by: [data-testid="floor-view"]` |

复原校验：三次均 ✅ 字节一致（sha256）；复原后全量测试 `Tests 14 passed (14)`。
