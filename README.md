# 会员空间管理驾驶舱（#1851 / #1896）

本版本保留七个指定页签、八面板注册及口径库，使用 React、TypeScript、TDesign Button 和本地 ECharts。仅使用虚构演示数据。

## 安装、运行、复跑
```bash
npm ci
npm run test
npm run build
npm run check:no-external
CHROMIUM_PATH=/path/to/chromium npm run screenshot
CHROMIUM_PATH=/path/to/chromium npm run evidence
npm run dev
```
Node 22，npm 10；Chromium 可通过 Playwright 安装或指定本机可执行文件。生产部署使用站点根路径，服务器须将 /dash、/floors/:floorId 等前端路径回退到 index.html；静态资源走 /assets。

## 验收
- 七页签：总览、网络、商机漏斗、招商、会员成功、组织与 Agent、财务。八面板注册，财务仅签约额和会籍收入。
- 卡片统一使用标题、悬停口径、数据截至时间、加载/空/错状态及导出。数据正常时导出同源 CSV，非正常状态禁止导出。
- 会所权限由宿主注入，查询参数 perm=club 仅用于演示受限角色。URL 与 mock 数据入口双重校验。后端真实鉴权仍由 S2-IAM 提供。
- 时间预设采用 UTC 自然日，合法日期范围写入 URL，刷新/历史导航保留；非法自定义区间回退，编辑时须应用有效日期。时间范围是 mock 的筛选输入，出租率以结束日快照为基准。
- 出租率为已租/总可租工位数；期末指标、趋势末点、楼层图共用库存快照。环比与同比分别减上月同期、上年同期；对比切换不改变本期值。图例和条内标签齐全，实际图形及楼层按钮均可跳转，保留日期和权限上下文。
- 到期分桶 0–30、31–60、61–90 天，续约率趋势为演示数据。房态视图为 S3-SALES 路由接口桩。
- 浏览器验收运行真实生产构建，检查渲染内容、CSV 下载、实际图形点击、刷新、权限和运行期请求；失败非零退出。原始证据见 docs/evidence/ 及 docs/acceptance-evidence.md。

## 接口边界
真实数据接口由 S2-WB、权限由 S2-IAM、房态由 S3-SALES 提供。前端用于本阶段 mock 验收，未连接真实数据或后端权限系统；其余面板采用确定性模拟数据，完整期间业务聚合留给数据服务。财务簿记与真实金额以分存储由后端承担，演示 UI 以元展示。不得使用真实客户或个人信息。
