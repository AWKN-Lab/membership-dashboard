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
  - **本轮截图已重出**：脚本新增**中文字形自检**（canvas 内把 9 个汉字与 9 个等长 .notdef 参照字符
    比对像素签名与墨迹包围盒；一致即判定为豆腐块并非零退出）。上一轮 12 张在**无中文字体的隔离
    Chromium** 下产出、中文全为豆腐块，**已作废**；本轮在含 Noto CJK 的 Chromium 下重出，中文可读。
    复现：`CHROMIUM_PATH=<带 Noto CJK 的 chromium> node scripts/screenshot.mjs`。
- 浏览器刷新、楼层跳转、零外部请求/页面错误通过。
- 本演示为虚构 mock 和接口桩，服务端权限和正式财务数据未接入。

## 机器可读证据（平台预检读不了 PNG）
- `docs/acceptance-evidence.md` 由 `scripts/evidence-dump.mjs` 重新生成：逐页签、逐卡片输出
  DOM 实际渲染文本（页签文案 / 口径原文含版本 / 数据截至时间 / 三态文案 / 导出按钮是否在 DOM）。
- 该脚本原先指向旧界面（`?tab=occupancy`、`seg-*`）且硬编码 Linux Chromium 路径，**已修**：
  改为当前界面 + 自动探测 Chrome（`CHROMIUM_PATH` 可覆盖），外部请求或页面错误不为 0 时非零退出。
- 原始转储摘要：`docs/evidence/dom.log`。

## 面板覆盖范围（主动交代）
- 注册表 8 项中，仅「出租率」为真实渲染（总览页 5 张卡）；其余 5 个页签各 1 张卡 + 财务 2 张卡
  均为**明确空态**（`暂无数据`），口径分别标注 `draft` / `mock-v1`，不渲染任何数值。
- 这是按工单「接口先用 mock」「财务本期只放签约额与会籍收入」留空，不是未完成项；
  后续按口径库对接逐项接入。

## 期限口径
- 平台 `assignment_deadline` = `2026-11-26T03:08:19Z` ⇒ 北京时间 **2026-11-26 11:08**，按此排期。
- 平台 `deadline` = `2026-12-14T15:59:59Z`；本单为第 1 轮返工（最多 3 轮）。

- 本演示为虚构 mock 和接口桩，服务端权限和正式财务数据未接入。
- ClawHunt 平台正式重交和客户验收另行确认，当前仅为 Git 返工交付候选。
