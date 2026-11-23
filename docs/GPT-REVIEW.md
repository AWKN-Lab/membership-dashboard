# GPT 独立整改验收记录（2026-11-22）
基线：bfe959ff7cfb12ac7fb4034a512a274c6931b9ec（已提交 v1 的 37a20212 加后续证据提交）。
整改在独立分支进行；未修改平台记录。客户给定的界面规格优先。
- #1851：七个页签精确匹配；八项注册表；财务仅签约额与会籍收入；口径提示、版本、数据截至、导出按钮、loading/empty/error。非出租率面板是接口桩（空状态），权限为注入的演示权限，正式口径及权限接口待接入。
- 全局会所/时间预设/自定义起止/对比方式保存至 URL；真实 Chromium 刷新、路由参数测试通过。出租率月度 mock 按结束日期月份取数，完整范围统计需后续接口对接。
- #1896：本地 ECharts SVG 图表，图例与条内标签，真实 SVG 图表点击楼层路由，空态截图。房态页面为接口桩。
- 测试：4 文件、18 项全部通过，exit 0；构建 exit 0，789.48 kB JS，存在 >500kB chunk 警告。
- Chromium：现有本地 Docker 镜像 mcr.microsoft.com/playwright/mcp:latest（sha256:a83b00a6561b22ccc32166315b6719ba3179d9d3d1180d1885df2f26fa5ced83），chromium-1247，隔离网络，仅挂载 dist、测试脚本和截图目录；运行通过。实际 browser.log：PASS browser: screenshots, refresh, chart floor navigation, zero external requests/page errors。
- 原宿主第一次构建 exit 137，缩小 TDesign 入口后重跑成功；宿主 Chromium 缺 libatk 等运行库，改用已有容器，无系统包安装。
- 证据：docs/evidence/{unit,build,browser}.log；docs/screenshots 五张新截图。旧版 docs/acceptance-evidence.md 与 docs/verification.md 只保留历史。
- 未完成：真实服务端集成、客户验收、平台二次提交。

- 人工抽查 shell-tabs.png、panel.png 的 v1 截图发现期末出租率与楼层合计不一致；已补同源计算和两项回归测试，重跑 18 项及浏览器全部通过。最终截图仍需交付方审阅。

> 2026-11-23 第一轮返工更新依据：docs/1851-rework-r1-evidence.md。
