# #1851 第一轮返工验收索引（2026-11-23）

此页替代已过期的 v1 文本转储。全部数据为虚构演示 mock，不声称已对接正式业务接口。

## 五项返工验收

| 客户问题 | 实现位置 | 复核入口 |
|---|---|---|
| 七页签文案与独立截图 | src/shell/tabs.ts, src/App.tsx | docs/screenshots/tab-{overview,network,funnel,sales,success,org-agent,finance}.png；tests/shell.test.tsx |
| 八面板注册表、财务两张卡片 | src/shell/panels.ts | tests/shell.test.tsx；tab-finance.png；未接入项明确空数据 |
| 会所/时间范围/环比同比 URL 往返 | src/shell/filters.ts, src/App.tsx | tests/filters.test.ts、tests/shell.test.tsx；浏览器刷新断言 |
| 本地 ECharts、设计变量、文字标签 | src/panel/charts.tsx, src/styles.css | tests/panel.test.tsx；tab-overview.png；运行时无外部请求 |
| 卡片数据截止时间、导出权限 | src/shell/PanelCard.tsx, src/mock/api.ts | tests/shell.test.tsx、tests/panel.test.tsx；无权限无导出按钮 |

## 截图

七页签分别在 tab-*.png 中留有独立全页截图。另有 panel.png、panel-empty.png、
card-loading.png、card-error.png、shell-tabs.png 用于回归核验。

## 权限与数据说明

- 集团会所仅在 canViewGroup=true 时显示；URL 直接写入 group 在无权限时被归一到 site。
- canExport=true 时显示“导出”；无权限时按钮不进入 DOM。服务端仍需执行正式鉴权。
- 出租率面板的 dataAsOf 来源为模拟接口返回的统计截止 UTC 时间戳；不会把筛选结束日期原文冒充接口时间。
- 当前月选择超出当天的结束日期时，演示接口快照最多取到当前 UTC 日期。
- 其余七个注册项（含财务两张卡片）维持明确空态，未伪造未接入指标数值。

## 验证

`npm ci && npm test && npm run build && npm run screenshot`。
`scripts/screenshot.mjs` 内同时执行无外部网络请求、浏览器零报错、
URL 刷新保持、ECharts 点击楼层跳转的硬断言，失败即非零退出。
