# 验收证据（文本版）

> 平台预检读不了 PNG，故把「截图里能看见的东西」转成**机器可读的文本**：
> DOM 实际渲染文本 + **ECharts option**（图例 / 条内标签配置）+ 截图 sha256。
> 生成：`npm run build && npm run screenshot && npm run evidence`（本地 chromium，零外部请求）。

## A. 七个页签（#1851 验收 1）—— DOM 实际渲染文本

- `总览`
- `网络`
- `商机漏斗`
- `招商`
- `会员成功`
- `组织与 Agent`
- `财务`

## B. 三种卡片状态（#1851 验收 1）—— DOM 实际渲染文本

- 加载中：`["关键指标概览"]` 状态下正文 = "加载中…"
- 空数据：正文 = `暂无数据`
- 报错：正文 = `数据加载失败，请稍后重试`
- 有数据：卡片标题 = ["关键指标概览"]

## C. 口径提示含定义与版本号（#1851 验收 2）—— DOM 原文

- 面板内（出租率面板）：`口径 v1.2：出租率 = 已租工位 ÷ 可租工位（期末值）；环比 = 本月末 − 上月末（百分点）`
- 外壳内（口径库条）：``

## D. 堆叠条形：图例 + 条内数值标签（#1896 验收 1）—— ECharts option 实测

图例（legend.data）：["已租","预留","空置"]
图例显示：true
三个 series（name / stack / label.show / label.position / data）：
- "已租" | stack=total | label.show=true | label.position=inside | data=[73,74,42,67,59]
- "预留" | stack=total | label.show=true | label.position=inside | data=[6,3,6,8,4]
- "空置" | stack=total | label.show=true | label.position=inside | data=[4,4,12,4,4]
配色（取自设计变量）：["#1f5eff","#e37318","#9aa4b2"]

- 面板上的图例说明文字：["图例：已租 / 预留 / 空置（条内同时标注数值）"]

## E. 点击楼层跳转的 URL 带楼层参数（#1896 验收 2）

- 可点击楼层（DOM）：["F1 层","F2 层","F3 层","F4 层","F5 层"]
- 跳转目标格式：`/floors/{floorId}?venue=&range=&compare=`
- 单元测试断言落地页拿到 `fl-f1|club|this_month|mom`（`tests/panel.test.tsx`）

## F. 全局筛选（#1851 验收 3）

- 会所选项：["本会所","集团"]（按权限显示；无集团权限时 = ["本会所"]）
- 时间范围选项：["本月","上月","本季度","自定义"]
- 对比方式选项：["环比","同比"]
- 筛选与页签**只存 URL query** ⇒ 刷新天然保持（`tests/filters.test.ts`、`tests/shell.test.tsx`）

## G. 面板注册表（8 个面板）—— DOM 实际渲染文本

- 总览页：`关键指标概览`
- 招商页：`出租率与楼层工位结构`
- 财务页：`签约额`
- 财务页：`会籍收入`

## H. 数据截至时间与导出按钮

- `数据截至 2026-11-22 10:30`
- 导出按钮：["导出"]

## I. 构建产物零外部域名（#1851 验收 4）

- `npm run check:no-external` → `构建产物无外部域名引用 ✅`
- `tests/noExternal.test.ts`：源码扫域名 + 「README 提到的 npm run 命令必须已注册」
- 本次证据转储断言：外部请求数 = 0

## J. 截图文件（sha256 固定，可比对）

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

## K. 复跑命令与实测输出

```bash
npm install
npm run test              # Test Files 8 passed (8) | Tests 33 passed (33)
npm run build             # vite build（ECharts 本地打包进产物）
npm run check:no-external # 构建产物无外部域名引用 ✅
npm run screenshot        # 13 张截图，每张 (无外部请求/无报错)
npm run evidence          # 重新生成本文件
```
