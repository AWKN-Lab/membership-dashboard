# 测试报告
实际执行：Node v22.22.2、npm 10.9.7。
- npm run test：4 files / 18 passed，exit 0。
- npm run build：exit 0。
- scripts/screenshot.mjs：隔离容器 Chromium 1247，生成五张截图，exit 0。
原始结果位于 docs/evidence/；浏览器脚本通过请求事件捕获外部请求及页面错误，失败会退出非零。
