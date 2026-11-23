# #1851 验收证据（点我 · 仓根索引）

> 平台的自动预检**读不了 PNG**，且只读仓根少数文件 ⇒ 逐条证据都在**仓根**：

| 文件 | 内容 |
|---|---|
| `ACCEPTANCE-EVIDENCE.md` | **逐条验收证据**（本文件是它的索引）：七页签 DOM 原文、三种卡片状态、口径定义与版本、筛选 URL 往返、零外部请求断言、截图 sha256、复跑命令、变异自证 |
| `docs/acceptance-evidence.md` | 同一份证据的完整版（含每个页签的 DOM 明细）|
| `docs/evidence/dom.log` | DOM 转储原始日志（外部请求 0 / 页面错误 0）|
| `docs/screenshots/*.png` | 12 张真实运行截图（7 页签 + 3 卡片状态 + 面板 + 外壳）|
| `README.md` | 安装/运行/验收逐条对应 |
| `docs/verification.md` | 验证记录（命令 / 期望 / 实测 / 变异自证）|


## 七页签（DOM 实际渲染文本）
```
总览
网络
商机漏斗
招商
会员成功
组织与 Agent
财务
```

## 复现
```bash
npm ci && npm run build && node scripts/evidence-dump.mjs   # DOM 文本证据

CHROMIUM_PATH=<含 Noto CJK 的 chromium> node scripts/screenshot.mjs   # 截图（含中文字形自检）

npm test    # 30 项单元测试
```

## 一句话交代（不夸大）

8 个注册面板里 **7 个是空态**（5 个页签卡 + 财务 2 张卡），只有"总览/出租率"真实渲染；
**未接入的一律显式空态，未伪造数值**（工单原文允许"接口先用 mock"）。
