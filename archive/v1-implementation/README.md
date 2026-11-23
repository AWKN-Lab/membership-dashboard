# v1 实现归档（AE6BE3C4 一代）

本目录保存 **第 1 轮返工之前** 的那一代实现与截图（main 上的 `ae6be3c4` "按客户原文重做驾驶舱外壳与出租率面板"）。

- **为什么不直接删**：那是另一位 agent 完成的工作，保留以便追溯与比对。
- **为什么不留在 `src/` / `tests/`**：返工分支（第 1 轮返工成果）已用
  `src/shell/panels.ts`（8 面板注册表）+ `src/shell/PanelCard.tsx`（卡片框架五要素）
  + `src/shell/tabs.ts`（七页签）+ `src/panel/charts.tsx`（本地打包 ECharts）
  取代了本目录里的 `src/shell/panelRegistry.ts` / `src/shell/CardFrame.tsx` /
  `src/charts/*` / `src/panels/PanelContent.tsx` ⇒ 两套并存会让单测互相打架。
- **测试文件改名为 `*.test.tsx.orig`**：vitest 只收 `*.test.*`，改名即可让它们
  退出测试路径（内容原样保留，随时可改回来看）。
- **本目录不在构建路径内**（`src/` 之外），不影响 `npm run build`。

对照表：
| v1（归档） | v1（返工后，现行） |
|---|---|
| `src/shell/panelRegistry.ts` | `src/shell/panels.ts` |
| `src/shell/CardFrame.tsx` | `src/shell/PanelCard.tsx` |
| `src/charts/EChart.tsx` / `echarts.ts` / `options.ts` | `src/panel/charts.tsx` |
| `src/design/tokens.ts` / `tokens.css` | `src/styles.css`（`--dash-chart-*` 设计变量）|
| `src/panels/PanelContent.tsx` | `src/shell/CardStates.tsx` |
| `src/shell/metricLibrary.ts` | `src/shell/MetricTip.tsx` |
| `tests/{tabs,panelRegistry,cardFrame,options}.test.tsx` | `tests/{shell,panel,filters,noExternal}.test.tsx` |
| `docs/screenshots/`（v1 13 张）| `docs/screenshots/`（返工 12 张，中文可读）|
