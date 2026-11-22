# 验收清单
- #1851 七页签及三态：shell-tabs.png、card-loading.png、panel-empty.png、card-error.png；shell.test.tsx。
- 口径定义与版本：shell-tabs.png、panel.png；shell.test.tsx。
- URL：filters.test.ts、shell.test.tsx、browser.log 刷新实测。
- 运行期无外部域名请求：browser.log（本地 HTTP，监听请求并拒绝外部请求，零外部请求与页面错误）。
- #1896 堆叠条形图标签、图例：panel.png、panel.test.tsx 和 browser.log。
- 楼层跳转：真实浏览器图表点击；panel.test.tsx 路由参数。
- 空状态：panel-empty.png，panel.test.tsx 确认不显示指标和图表。
- 交付限制见 docs/GPT-REVIEW.md。
