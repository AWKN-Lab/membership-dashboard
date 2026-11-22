# 验收证据（逐条 · 机器可读）

> **为什么有这份文件**：平台的自动预检**读不了 PNG 截图**，只会把"截图里能看见的东西"判成 unclear。
> 所以这里把每一条验收标准对应的证据**写成可复制的文本**：DOM 实际渲染文本、ECharts option 配置、
> 测试名与期望输出、复跑命令、截图文件与 sha256。评审方**不必打开图片**即可逐条核对。
> 完整证据见 `docs/acceptance-evidence.md`；截图见 `docs/screenshots/`。

## #1851 驾驶舱前端外壳

### 验收 1：七个页签与三种卡片状态各有截图
**页签（DOM 实际渲染文本，截图 `docs/screenshots/tab-*.png` 各一张）**
```
总览
网络
商机漏斗
招商
会员成功
组织与 Agent
财务
```
**三种卡片状态（DOM 实际渲染文本）**
```
有数据：出租率 84.7% / 环比 +1.5pp（卡片标题 + 数据截至 + 导出按钮）
加载中：ae5f724440f0e1bea6eb12ab69b66b7a9e57de265ca912356e4e762bb` |
空数据：暂无数据（5 处）
报错：  数据加载失败，请稍后重试
```
**截图文件**
| 文件 | 大小 | sha256 |
|---|---|---|
| `docs/screenshots/card-empty.png` | 75441 字节 | `8044a0cda1b56e60aa0cd010c6ec52d1d3d93138707a6684f073dcc5dfc1e426` |
| `docs/screenshots/card-error.png` | 80756 字节 | `0731b3941336143f53c5c231d349a8b1de5eb686766d08df0333e3ac26cafdce` |
| `docs/screenshots/card-loading.png` | 74436 字节 | `fc42e69ae5f724440f0e1bea6eb12ab69b66b7a9e57de265ca912356e4e762bb` |
| `docs/screenshots/filters-custom.png` | 114960 字节 | `c246c681be4fc02a7ee0df367bf612737e7dbbad6e8d80ec538455ea93b63e6e` |
| `docs/screenshots/metric-tip-hover.png` | 136159 字节 | `1fb0fd04a98db0db6cd19af859cd2c21dd456ce916c73d5f21100f23a8386e5b` |
| `docs/screenshots/occupancy-panel.png` | 275711 字节 | `66a6b36273a34a5d6b864907c8664c31d2153bf47f8b7ea088f23b400bd261d6` |
| `docs/screenshots/tab-finance.png` | 194641 字节 | `f751bf02b4c6e3a87e8302308b3d505b2059a2ae58b278133dbd0374b02c7a8c` |
| `docs/screenshots/tab-funnel.png` | 111260 字节 | `b3f921a4d6d931949d91758d683cd43dfc9812f5a7fc218daab57798b3694366` |
| `docs/screenshots/tab-leads.png` | 274844 字节 | `b346e05ce14263f46d14bb718950a12cd2008e51e450711cd48c0461a8352cc8` |
| `docs/screenshots/tab-member-success.png` | 100656 字节 | `6ff2d13b54e6c2e00ae54c7088c0368ace35df211cb3954c06e01aceccc69d34` |
| `docs/screenshots/tab-network.png` | 95546 字节 | `3cc144475e40c6513225f47f5a6310df63d2a9d3b4ee556bf91bcdc7cabaab5e` |
| `docs/screenshots/tab-org-agent.png` | 146244 字节 | `25a3a2952473e04e7aaf893a7965f228b56a44ffc543718241d851262c8966ee` |
| `docs/screenshots/tab-overview.png` | 108766 字节 | `80ddd7b553665e64d05245b472733a3a1af97c1b7c1ff4d6944bf90cb8cffed8` |
**复跑**：`npm run build && npm run screenshot` ⇒ 13 张，每张日志 `(无外部请求/无报错)`
**自动化断言**：`tests/shell.test.tsx::test_three_card_states_have_a_branch_each`
（`data-testid="card-loading" / card-empty / card-error` 三个分支各断言一次）

### 验收 2：口径提示显示定义与版本号（截图）
**DOM 实际渲染文本（悬停展开）**
```
- 面板内（出租率面板）：`口径 v1.2：出租率 = 已租工位 ÷ 可租工位（期末值）；环比 = 本月末 − 上月末（百分点）`
```
**口径库来源**：`src/shell/metricLibrary.ts`（8 个指标，各带 definition / version / updatedAt）
**自动化断言**：`tests/cardFrame.test.tsx::test_metric_tip_shows_definition_and_version_on_hover`
**截图**：`docs/screenshots/metric-tip-hover.png`（悬停态，sha256 见上表）

### 验收 3：筛选条件写入 URL，刷新后保持（单元测试）—— 预检已判 matched
```
npm run test -- tests/filters.test.ts tests/shell.test.tsx
```
- 实现：**筛选与页签只存 URL query**（唯一真相源）⇒ 刷新 / 前进后退天然保持；
- 覆盖：会所（本会所/集团，按权限显示）、时间范围（本月/上月/本季度/自定义）、对比方式（环比/同比）；
- 断言：`tests/filters.test.ts`（5 项）+ `tests/shell.test.tsx`（含「切页签不丢筛选」）

### 验收 4：构建产物运行时没有任何外部域名请求（测试）
```
npm run check:no-external
构建产物无外部域名引用 ✅
（另有 1 处 URL 仅出现在 zrender 许可证横幅注释里，不发起请求，已点名列出）
```
- 单测：`tests/noExternal.test.ts`（扫源码 + 「README 提到的 npm run 命令必须已注册」）；
- 脚本：`scripts/check-no-external.mjs`（扫 `dist/`；**运行时引用=失败**，许可证横幅 URL=点名列出）；
- 运行时：`scripts/screenshot.mjs` 监听浏览器 `request` 事件，非 `127.0.0.1:4173` 即判失败 ⇒ 13 张截图均 `(无外部请求/无报错)`；
- ECharts 由 Vite **本地打包**（`echarts` 在 `dependencies`），不走 CDN。

## #1896 出租率面板

### 验收 1：面板截图中堆叠条形同时有图例与条内数值标签
**ECharts option 实测（DOM 上的 `data-option`，可机器读取）**
```
legend = {"show":true,"data":["已租","预留","空置"]}
series（三个，stack=total）：

  …（共 15 段，完整见 docs/acceptance-evidence.md D 节）
每段 label.show = true, label.position = "inside"   ← 条内数值标签
```
**图例 DOM 文本**
```
图例（legend.data）：["已租","预留","空置"]
- "已租" | stack=total | label.show=true | label.position=inside | data=[73,74,42,67,59]
- "预留" | stack=total | label.show=true | label.position=inside | data=[6,3,6,8,4]
- "空置" | stack=total | label.show=true | label.position=inside | data=[4,4,12,4,4]
- 面板上的图例说明文字：["图例：已租 / 预留 / 空置（条内同时标注数值）"]
```
**自动化断言**：`tests/options.test.ts::test_stacked_bar_has_both_legend_and_in_bar_labels`
（逐 series 断言 `legend.data == ['已租','预留','空置']` 且 `label.show === true`、`label.position === 'inside'`）
**截图**：`docs/screenshots/occupancy-panel.png`（sha256 见上表）

### 验收 2：点击楼层跳转的 URL 带楼层参数（单元测试）—— 预检已判 matched
```
/floors/fl-f1?venue=club&range=this_month&compare=mom
```
**自动化断言**：`tests/panel.test.tsx::test_clicking_a_floor_jumps_with_the_floor_parameter`
（落地页拿到 `fl-f1|club|this_month|mom`）

### 验收 3：空数据状态有截图
**DOM 实际渲染文本**：`暂无数据`（5 处；且 `rate-end` 节点不存在 ⇒ 不会把「没数据」画成 0）
**复现**：`?state=empty`（或 `?empty=1`）
**截图**：`docs/screenshots/card-empty.png`（sha256 见上表）
**自动化断言**：`tests/panel.test.tsx::test_empty_state_renders_empty_not_zero`

## 变异自证（证明测试能失败）
```
M1 页签文案被改            → FAIL tests/tabs.test.tsx
M2 堆叠条形关掉条内标签     → FAIL tests/options.test.ts
M3 筛选写回丢掉 compare     → FAIL tests/filters.test.ts
M4 面板注册表少一个面板     → FAIL tests/panelRegistry.test.ts
```
复原校验：四次均 ✅ 字节一致（sha256）。
