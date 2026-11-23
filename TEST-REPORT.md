# #1851 第一轮返工测试记录（2026-11-23）

- 静态/单元：4 个测试文件、30 个测试通过（含七页签逐项注册表、会所权限、导出权限、
  数据统计截止时间、自定义时间范围 URL、环比同比切换、ECharts 设计变量）。
- 构建：`npm run build` 通过；当前 ECharts + TDesign bundle 压缩后 JS 790.08 kB，
  >500 kB 的构建警告尚在，未影响构建退出码。
- 运行时截图与网络门禁：结果以 docs/evidence/browser.log 为准。
- 历史 v1 报告及模拟数据不作为第一轮返工最终验收。

> 2026-11-23 最新测试与截图结果：docs/1851-rework-r1-evidence.md。

## 补证说明（R1，2026-11-23）

- bundle 790.06→790.08 kB：790.06 为 931e9a4 记录的旧值；本机实测 147ff1cd 源码构建 789.48 kB、当前源码构建 790.08 kB（两次重构建产物完全一致，哈希 index-Bzj4bVGj.js），0.60 kB 增长来自 931e9a4 自身源码改动；本轮零源码改动，0.02 kB 不是本轮引入的。详见 docs/r1-supplement.md。
- 逐项对照表见 docs/r1-item-mapping.md；dataAsOf/canExport 专项见 docs/r1-dataasof-canexport.md；13 张截图目验见 docs/r1-screenshot-review.md；补充证据见 docs/r1-supplement.md；待发消息见 docs/r1-message-to-buyer.md（未发送）。
- 两项补齐（2026-11-23）：无权限态截图 tab-overview-noexport.png 新增（0 个导出按钮）；panel.png 的 end 由 2026-11-30 改为 2026-11-22，as-of 固定为 2026-11-22T23:59:59Z，13 张截图三次运行 SHA 全部一致；MANIFEST 53→54 条。
- 表述口径：功能实现多数早已存在，但验收证据是本轮才补齐的；147ff1cd 代码存在不等于当时已验证通过。
