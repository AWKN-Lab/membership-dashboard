# membership-dashboard — 会员空间平台 · 管理驾驶舱（工作台 /dash）

**ClawHunt 工单 #1851（驾驶舱前端外壳）+ #1896（出租率面板）交付物**

一句话：驾驶舱的**外壳 + 面板卡片框架 + 出租率面板**。
七个页签（总览 / 网络 / 商机漏斗 / 招商 / 会员成功 / 组织与 Agent / 财务）、
**面板注册表把 8 个面板挂到对应页签**（财务页本期只放签约额与会籍收入）、
全局筛选（会所 / 时间范围 / 对比方式，**写入 URL、刷新后保留**）、
卡片框架五要素（标题 / 悬停口径提示 / 数据截至时间 / 加载·空数据·报错三态 / 导出按钮）、
图表**本地打包 ECharts**（不走 CDN）+ 配色取设计变量 + **所有图表除颜色外都有文字标签**。

技术栈按统一技术约定：**React 18 + TypeScript + TDesign 风格组件 + ECharts 5（本地打包）**。

---

## 一、一键复跑

```bash
npm install          # 依赖全部来自 node_modules；运行期无任何外网依赖
npm run test         # 单元测试 33 项 → 全绿
npm run build        # 产出 dist/（ECharts 打进了产物里）
npm run check:no-external   # 扫描构建产物：无外部域名引用
npm run screenshot   # 出 13 张验收截图 → docs/screenshots/
npm run evidence     # 把截图内容转成机器可读文本 → docs/acceptance-evidence.md
npm run dev          # 本地开发：http://127.0.0.1:5173
```

**实测输出（2026-11-22）**

| 命令 | 期望 | 实测 |
|---|---|---|
| `npm run test` | 33 passed | `Test Files 8 passed (8) \| Tests 33 passed (14→33)` |
| `npm run build` | 产物生成 | `dist/index.html 0.40 kB │ index.css 4.22 kB │ index.js 711.79 kB（ECharts 本地打包）` |
| `npm run check:no-external` | 无外部域名 | `构建产物无外部域名引用 ✅` |
| `npm run screenshot` | 13 张、零外部请求、**页面必须真的渲染** | 13 张全部 `(无外部请求/无报错)` |
| `npm run evidence` | 生成文本证据 | `docs/acceptance-evidence.md`（外部请求数 = 0） |

> 截图脚本会同时断言三件事：**没有任何非本地请求**、**没有页面异常**、**页面确实渲染出内容**
> （`data-testid` 元素 > 0 且正文含卡片内容）—— 空白图不能算通过。

## 二、验收逐条对应

### #1851 驾驶舱前端外壳
| 验收项 | 交付方式 |
|---|---|
| 1. 七个页签与三种卡片状态各有截图 | **七个页签（与客户要求逐字一致）**：总览 / 网络 / 商机漏斗 / 招商 / 会员成功 / 组织与 Agent / 财务 —— `src/shell/tabs.ts`，单测 `tests/tabs.test.tsx` 逐字比对文案。**三种卡片状态**：`docs/screenshots/card-loading.png`、`card-empty.png`、`card-error.png`（`?state=loading|empty|error` 可复现），渲染分支在 `src/shell/CardFrame.tsx` |
| 2. 口径提示显示定义与版本号（截图） | `src/shell/MetricTip.tsx`：**悬停**展开浮层，显示口径库里的**定义 + 版本号**（`口径 v1.2：出租率 = 已租工位 ÷ 可租工位（期末值）；环比 = 本月末 − 上月末（百分点）`）。口径库在 `src/shell/metricLibrary.ts`（8 个指标，各带 definition/version/updatedAt）。截图 `docs/screenshots/metric-tip-hover.png` |
| 3. 筛选条件写入 URL，刷新后保持（单元测试） | 三类筛选：会所（本会所 / 集团，**按权限显示**）、时间范围（本月 / 上月 / 本季度 / 自定义）、对比方式（环比 / 同比）。实现：**筛选与页签只存 URL query**（唯一真相源）⇒ 刷新 / 前进后退天然保持。`tests/filters.test.ts`（5 项）+ `tests/shell.test.tsx`（含「切页签不丢筛选」） |
| 4. 构建产物运行时没有任何外部域名请求（测试） | `tests/noExternal.test.ts`（扫源码 + **校验 README 里出现的 npm run 命令都已注册**）+ `scripts/check-no-external.mjs`（扫 `dist/`）+ 截图脚本的 request 监听。全仓无任何境外 SDK，ECharts 由 Vite 打进产物 |

### #1896 出租率面板
| 验收项 | 交付方式 |
|---|---|
| 1. 面板截图中堆叠条形同时有图例与条内数值标签 | `src/charts/options.ts::occupancyStackedOption`：`legend.show=true`、`legend.data=['已租','预留','空置']`，**三个 series 的 `label.show=true` 且 `position='inside'`**。截图 `docs/screenshots/occupancy-panel.png`；机器可读判据见 `docs/acceptance-evidence.md` D 节（ECharts option 实测）与 `tests/options.test.ts` |
| 2. 点击楼层跳转的 URL 带楼层参数（单元测试） | `/floors/{floorId}?venue=&range=&compare=`；`tests/panel.test.tsx` 断言落地页拿到 `fl-f1|club|this_month|mom`；面板里另有 F1–F5 楼层按钮（可点、可测） |
| 3. 空数据状态有截图 | `docs/screenshots/card-empty.png`（`?state=empty` 复现）。空态**不渲染任何指标值与图表**（单测断言 `rate-end` 与图表节点都不存在） |

### 范围补充（#1896 本单范围）
出租率指标卡（期末值 + 环比）、12 个月趋势折线、按楼层堆叠条形、到期工位分桶（30/60/90 天）、
续约率趋势、点击楼层跳转房态视图 —— **接口先用 mock**（符合本阶段约定）。

## 三、面板注册表（8 个面板）

| 面板 | 页签 | 口径库 key |
|---|---|---|
| 关键指标概览 | 总览 | `key-metrics` |
| 会员网络分布 | 网络 | `network` |
| 商机漏斗 | 商机漏斗 | `funnel` |
| 出租率与楼层工位结构（#1896） | 招商 | `occupancy` |
| 会员留存与成功度 | 会员成功 | `member-success` |
| 组织与 Agent 效能 | 组织与 Agent | `org-agent` |
| 签约额 | 财务 | `finance-contract` |
| 会籍收入 | 财务 | `finance-revenue` |

注册表在 `src/shell/panelRegistry.ts`；单测 `tests/panelRegistry.test.ts` 断言**恰好 8 个**、
每个页签都有面板、**财务页只有签约额与会籍收入**、每个面板都能在口径库找到定义。

## 四、目录结构

```
src/
  App.tsx                    外壳：七页签 + 三类全局筛选 + 面板注册表渲染 + 楼层路由
  main.tsx                   挂载（BrowserRouter）
  shell/
    tabs.ts                  七个页签定义（与客户要求逐字一致）
    panelRegistry.ts         面板注册表（8 个面板 → 页签）
    metricLibrary.ts         口径库（定义 + 版本号 + 更新日期）
    filters.ts               全局筛选 ⇄ URL（会所 / 时间范围 / 对比方式）
    CardFrame.tsx            卡片框架：标题 / 口径提示 / 数据截至时间 / 三态 / 导出按钮
    MetricTip.tsx            口径提示（悬停展开定义与版本号）
  charts/
    echarts.ts               ECharts **本地打包**（按需注册 chart/component，不走 CDN）
    EChart.tsx               React 封装；把 option 挂到 DOM（机器可读证据）
    options.ts               5 个 option 构造器（**纯函数**，可单测）
  panels/PanelContent.tsx    8 个面板的内容 + 楼层跳转 + CSV 导出
  design/
    tokens.css / tokens.ts   设计变量（CSS 变量与 ECharts 配色同源）
  mock/api.ts                接口桩（确定性哈希种子 ⇒ 可复现）
tests/                       33 项：tabs / panelRegistry / filters / cardFrame / options /
                             panel / shell / noExternal
scripts/
  screenshot.mjs             13 张验收截图（本地 chromium + 本地 HTTP 服务 + 三道门禁）
  check-no-external.mjs      扫构建产物的外部域名
  evidence-dump.mjs          把截图内容转成机器可读文本证据
  push_github.py             推仓并逐字节回读核对
docs/acceptance-evidence.md  文本证据（DOM 文本 + ECharts option + 截图 sha256）
docs/screenshots/*.png       13 张截图
```

## 五、**对接点**（依赖其它工单的接口，用 mock 先行）

| 现在（mock） | 换成真实接口 |
|---|---|
| `src/mock/api.ts::fetchPanelData(panelId, filters, perm)` | `GET /api/v1/dashboard/panels/{panel_id}?venue=&range=&from=&to=&compare=`（S2-WB 工作台数据接口） |
| `src/mock/api.ts::mockPermission(search)` | S2-IAM 的数据范围接口（决定「集团」维度是否可见） |
| `/floors/:floorId` 路由（`src/App.tsx::FloorView`） | S3-SALES 业务员工作台的房态视图页面路由 |

改接口只需替换 `src/mock/api.ts` 的这 3 个函数，组件层不动。

## 六、数据与合规

- 全部为**虚构演示数据**（演示会员空间 / 演示园区 A 座 / F1–F5 层），**不含任何真实个人信息或企业信息**。
- 未引入任何向境外发送数据的第三方 SDK；构建产物**零外部域名引用**（单测 + 脚本 + 截图运行时三重把关）。
- 依赖许可：React(MIT) · react-router(MIT) · ECharts(Apache-2.0) · Vite(MIT) · Vitest(MIT) ·
  jsdom(MIT) · playwright-core(Apache-2.0) · TypeScript(Apache-2.0) —— 均为宽松许可。

## 七、限制（如实说明）

- 接口按本阶段约定**先用 mock**；真实数据由 S2-WB / S2-IAM / S3-SALES 提供（对接点见上）。
- 财务页本期**只放签约额与会籍收入**两张卡（回款与开票后续接入，客户已明确本期不含）。
- `/floors/:floorId` 房态视图按约定只做**带楼层参数的路由**，真实页面由业务员工作台提供。
- 截图在 Linux + Chromium 1243 生成，不同字体下文字宽度可能略有差异。

## 八、复跑清单（给验收方）

```bash
git clone https://github.com/AWKN-Lab/membership-dashboard
cd membership-dashboard
npm install
npm run test              # 33 项全绿
npm run build
npm run check:no-external
npm run screenshot        # 13 张截图
npm run evidence          # 文本证据
```
