# #1851 第一轮返工专项验证：dataAsOf 与 canExport（R1，2026-11-23）

本文件是 931e9a4 新增的两处改动的专项验证记录。931e9a4 之前（147ff1cd），PanelCard 的 as-of 文案是“数据截至：{asOf}（演示口径/暂无数据）”，导出按钮无权限门禁；931e9a4 改为以下实现，本轮首次跑通测试、构建与浏览器验证。

## 一、dataAsOf：来源、位置、实测值

### 来源

- `src/mock/api.ts`：`mockOccupancy` 返回 `dataAsOf`，为模拟接口返回的统计截止 UTC 时间戳，不从筛选控件推断。
- 单元断言（`tests/panel.test.tsx`，timestamp is sourced from returned data snapshot）：`mockOccupancy('org-demo','site-demo-a','2026-11','2026-11-17').dataAsOf` 为 `2026-11-17T23:59:59Z`。

### 显示位置

- 每张卡片内，`src/shell/PanelCard.tsx`：标题行（卡片名 + 口径提示 + 导出按钮）下方，口径行（`口径 v1.2：…`）的下一行，`data-testid="as-of"`，文案为 `数据截至时间：{asOf||'—'}`。
- `src/App.tsx` 向出租率面板传 `asOf={f.end<todayUtc?f.end:todayUtc}`；未接入的占位面板不传 asOf，显示 `数据截至时间：—`。
- 结束日期超出当天时，演示接口快照最多取到当前 UTC 日期（见 `docs/acceptance-evidence.md`）。

### 实测

| 截图 | URL（截图时） | 5 卡 as-of 显示 |
|---|---|---|
| `docs/screenshots/tab-overview.png` | `/dash?tab=overview&period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy` | 5 卡均为 `数据截至时间：2026-11-22T23:59:59Z`（目验通过） |
| `docs/screenshots/tab-overview-noexport.png` | 同上（无权限捕获，见第二节） | 5 卡均为 `数据截至时间：2026-11-22T23:59:59Z`，0 个导出按钮（脚本断言 + 目验通过） |
| `docs/screenshots/panel.png` | `/dash?tab=overview&period=custom&start=2026-11-01&end=2026-11-30` | 5 卡均为当前时刻封顶值 `2026-11-23T03:40:39.736Z`（结束日期超出当天，取当前 UTC 日期；目验通过） |
| `docs/screenshots/panel-empty.png` / `card-loading.png` / `card-error.png` | 同上，总览页三种状态 | 5 卡均为 `数据截至时间：—`（无数据/加载中/加载失败时无截至时间，目验通过） |
| `docs/screenshots/tab-finance.png` 等 6 张占位页签截图 | 各页签，`period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy` | 卡片显示 `数据截至时间：—`（未接入项，目验通过） |

单元断言（`tests/shell.test.tsx`，shows data-origin cutoff and permitted export on loaded cards）：`period=custom&start=2026-11-01&end=2026-11-17` 时，首张卡 as-of 含 `2026-11-17T23:59:59Z`。

## 二、canExport：有权限与无权限

### 实现

- `src/shell/PanelCard.tsx`：`{canExport&&<Button …>导出</Button>}`——无权限时按钮不进 DOM；`download()` 另有三重守卫（`!canExport || state!=='normal' || !exportRows?.length` 时直接返回）。
- `src/App.tsx`：`canExport={access.canExport===true}`。
- 占位卡（财务两卡等）：演示权限下导出按钮渲染但为禁用态（`state` 非 normal），点击不下载。

### 有权限（canExport=true）

- 单元断言（`tests/shell.test.tsx`，shows data-origin cutoff and permitted export on loaded cards）：`access={{siteId:'site-demo-a',canViewGroup:true,canExport:true}}`，总览页 5 个 `导出` 按钮（`getAllByRole` 长度 5）。
- 截图目验：`tab-overview.png`、`panel.png` 每卡右上角均有 `导出` 按钮（演示权限 canExport=true）；`tab-finance.png` 两占位卡右上角也有 `导出` 按钮（禁用态）。

### 无权限（canExport=false）

- 单元断言（`tests/shell.test.tsx`，does not render export controls without permission）：`access={{siteId:'site-private',canViewGroup:false,canExport:false}}`，总览页 `queryByRole('button',{name:'导出'})` 为 null——页面上没有任何导出按钮。
- 截图（`docs/screenshots/tab-overview-noexport.png`）：总览页 5 卡，as-of 均为 `数据截至时间：2026-11-22T23:59:59Z`，页面上没有任何导出按钮（脚本断言 `getByRole('button',{name:'导出'})` 数量为 0 + 目验通过）。
- 捕获方式（诚实说明）：`main.tsx` 直接渲染 `<App />`，`App` 默认 `DEMO_ACCESS`（`canExport:true`），应用本身没有任何 URL 参数或运行时开关可改权限；本截图由同一 `dist` 产物在截图脚本（`scripts/screenshot.mjs`）服务层仅把演示权限常量 `canExport:true` 改为 `false` 后捕获——不改 `src/`，不改 `dist` 文件本身，改写处脚本内断言恰好命中一次（`DEMO_ACCESS` 字面量在产物中仅出现一次）。`siteId` 与 `canViewGroup` 保持演示值，使截图与 `tab-overview.png` 只有导出按钮一个差别；无权限的完整访问对象（`site-private`、无集团、无导出）由上述单元测试断言覆盖。
