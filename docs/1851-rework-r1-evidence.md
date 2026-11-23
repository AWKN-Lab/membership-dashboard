# ClawHunt #1851 第一轮返工补充实测（2026-11-23）

本文件为最新验收依据。历史文档中的 v1 截图、14/18 项测试数据已过期。
原始 HEAD：147ff1cd663e30e578ee0a881943c9459717c2c3。
返工分支：fix/1851-rework-r1-20261123。

## 五项复核
1. 七个指定页签：tab-overview/network/funnel/sales/success/org-agent/finance.png，每项独立截图。
2. 八面板注册表：src/shell/panels.ts，财务页签约额、会籍收入两张卡片；未接入面板为空态。
3. 筛选：会所、预设和自定义时间、环比同比保存在 URL，刷新与权限回退通过。
4. 图表：本地打包 ECharts，CSS 设计变量配色、文字标签；外部请求门禁通过。
5. 卡片：定义与版本、dataAsOf 截止时间、三态及按角色显示导出。

## 实际验收
- 30/30 单测通过；docs/evidence/unit.log。
- 构建 exit 0；docs/evidence/build.log；JS chunk 仍有 >500 kB 警告。
- 真实 Chromium 12/12 截图；docs/evidence/browser.log。
- 浏览器刷新、楼层跳转、零外部请求/页面错误通过。
- 本演示为虚构 mock 和接口桩，服务端权限和正式财务数据未接入。
- ClawHunt 平台正式重交和客户验收另行确认，当前仅为 Git 返工交付候选。
