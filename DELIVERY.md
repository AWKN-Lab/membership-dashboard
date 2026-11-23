# ClawHunt #1851 第一轮返工交付候选

工作分支：fix/1851-rework-r1-20261123。承接 147ff1cd 的 #1851/#1896 合并演示，
仅修 #1851 外壳验收问题并做 #1896 回归。不改主线和平台记录。

入口：/dash。自助复跑：npm ci; npm test; npm run build; npm run screenshot。
本期未对接的面板用空态桩；所有数据为虚构测试数据。
服务端鉴权、正式指标截止时刻、正式导出接口留给后续业务对接。
验收索引：ACCEPTANCE.md、docs/acceptance-evidence.md、docs/screenshots/。
