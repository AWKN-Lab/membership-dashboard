# 会员空间管理驾驶舱（#1851 / #1896）
独立修订分支。使用虚构演示数据。源代码使用 React、TypeScript、TDesign Button/Tooltip 和本地打包 ECharts SVG renderer。
## 运行与验收
Node 22；npm ci；npm run test；npm run build；npm run check:no-external；CHROMIUM_PATH=/path/to/chromium npm run screenshot。
浏览器 gate 使用随机端口的本地静态服务器；检查真实网络请求和页面错误，失败退出非零。
## 接口边界
- /dash：七页签、八项面板注册；除出租率外的业务面板为接口桩，财务仅签约额与会籍收入。数据为空时无导出，不显示伪造数值。
- 会所/集团权限为前端 mock 权限注入，正式服务端鉴权须由 S2-WB/IAM 实施；不声称后端授权完成。
- 预设/自定义起止日期与环比/同比存 URL。出租率为月度 mock，使用结束日期所属月份；后续服务端按完整筛选参数统计并返回数据截至时间。
- /floors/:floorId 为房态路由接口桩，真实页面由 S3-SALES 提供。真实指标定义、版本和导出列需随口径库接口对接。
- 未将任何真实用户或客户数据放入仓库。

## #1851 第一轮返工（2026-11-23）
- 独立返工分支，完整验收索引见 docs/acceptance-evidence.md。
- tab-*.png 为七页签逐项截图；三态截图另存。
- 导出按钮经 `access.canExport` 控制，缺权限不渲染；权限后端仍需核验。
- 模拟 API 返回 `dataAsOf` UTC ISO-8601 时间；页面显示来源字段。
- 图表颜色取 `src/styles.css` 的 `--dash-chart-*` 变量，ECharts 本地打包。
