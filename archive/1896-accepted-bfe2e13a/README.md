# #1896 已验收基线归档（提交 bfe2e13a）

这是 **#1896（出租率面板）被验收时锁定的提交** `bfe2e13a03a1c53c822b5ef28b97e84ebcdc68c6`
（分支 `fix/gpt-dashboard-final-20261122`，另见该单平台消息 1069「请以本次锁定提交作为后续验收依据」）。

- **为什么在这里**：该提交**从来不在 main 上**（它是分支提交）；main 上一度是 `ae6be3c4` 那一代，
  两者内容不同（`CardFrame.tsx` / `metricLibrary.ts` / `charts/*` / `panels/PanelContent.tsx` 等 7 个文件）。
  2026-11-23 的返工合并把 main 换成"8 面板注册表"那一代 ⇒ 为免**已验收的实现不可追溯**，
  把这一版原样归档在这里。
- **不影响主干**：本目录不在 `src/`、不在 `tests/`，构建与测试路径都碰不到它。
- **测试文件改名 `*.test.ts*.orig`**：让 vitest 不收集它们（内容原样保留，可改回查看）。
- **现行主干**是"七页签 + 8 面板注册表 + 卡片框架五要素"那一代（见 `src/shell/panels.ts` /
  `src/shell/PanelCard.tsx`），它是 **#1851 第 1 轮返工**的成果，并含仓根验收证据。

对照：`archive/v1-implementation/` = 另一代（`ae6be3c4` 那一代）的源码与旧截图。
