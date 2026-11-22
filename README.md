# membership-dashboard — 会员空间平台 · 管理驾驶舱前端

**ClawHunt 工单 #1851（驾驶舱前端外壳）+ #1896（出租率面板）交付物**

一句话：驾驶舱的**外壳 + 出租率面板**：七个页签与全局筛选、卡片三态、口径提示、
按楼层的堆叠条形（已租/预留/空置，**图例与条内数值标签同时标注**）、12 个月趋势、
到期分桶、续约率趋势、**点击楼层跳转房态视图（URL 带楼层参数）**。

技术栈按统一技术约定：**React 18 + TypeScript + TDesign**（图表用纯 SVG，不引第三方图表库）。

---

## 一、一键复跑

```bash
npm install          # 依赖全部来自 node_modules；无任何运行时外网依赖
npm run test         # 单元测试 14 项 → 全绿
npm run build        # 产出 dist/
npm run check:no-external   # 扫描构建产物：无外部域名引用
npm run screenshot   # 出 4 张验收截图 → docs/screenshots/
npm run dev          # 本地开发：http://127.0.0.1:5173
```

**实测输出（2026-11-22）**

| 命令 | 期望 | 实测 |
|---|---|---|
| `npm run test` | 14 passed | `Test Files 4 passed (4) / Tests 14 passed (14)` |
| `npm run build` | 产物生成 | `dist/index.html 0.40 kB · index.css 2.30 kB · index.js 172.49 kB · built in 2.63s` |
| `npm run check:no-external` | 无外部域名 | `构建产物无外部域名引用 ✅` |
| `npm run screenshot` | 4 张截图、零外部请求 | `panel.png / panel-empty.png / card-loading.png / shell-tabs.png`（均"无外部请求/无报错"）|

## 二、验收逐条对应

### #1851 驾驶舱前端外壳
| 验收项 | 交付方式 |
|---|---|
| 1. 七个页签与三种卡片状态**各有截图** | 七个页签：`docs/screenshots/shell-tabs.png`；三态：`panel.png`（有数据）/ `card-loading.png`（加载中）/ `panel-empty.png`（空数据）。卡片状态组件见 `src/shell/CardStates.tsx`（loading / empty / error 三态**不渲染任何数据**，不会把"没数据"画成 0）|
| 2. 口径提示显示**定义与版本号**（截图） | `src/shell/MetricTip.tsx` 渲染"口径 v1.2：出租率 = 已租工位 ÷ 可租工位（期末值）…"（可见行 + title 双通道），截图见 `shell-tabs.png` |
| 3. 筛选条件写入 URL，**刷新后保持**（单元测试） | `tests/filters.test.ts`（4 项）+ `tests/shell.test.tsx`。实现：**筛选与页签只存 URL**（唯一真相源）⇒ 刷新/前进后退天然保持 |
| 4. 构建产物运行时**没有任何外部域名请求**（测试） | `tests/noExternal.test.ts` 扫源码；`scripts/check-no-external.mjs` 扫 `dist/`。截图脚本同时监听 `request` 事件并断言只有 `file://` |

### #1896 出租率面板
| 验收项 | 交付方式 |
|---|---|
| 1. 面板截图中堆叠条形**同时有图例与条内数值标签** | `src/panel/charts.tsx::StackedBarByFloor`：图例 `data-testid="legend"`（已租/预留/空置），段内**始终渲染数值**（窄段只显示数字，宽段显示"标签 数值"）。截图 `panel.png`；单测断言图例与段内文本同时存在 |
| 2. 点击楼层跳转的 URL **带楼层参数**（单元测试） | `src/panel/OccupancyRatePanel.tsx::goFloor` → `/floors/{floorId}?org_id=&site_id=&month=`；`tests/panel.test.tsx` 断言跳转后落到房态视图且带 floorId |
| 3. 空数据状态**有截图** | `docs/screenshots/panel-empty.png`（由 `?empty=1` 复现）|
| 范围补充 | 出租率指标卡（期末值 + 环比）、12 个月趋势折线、到期工位分桶（30/60/90 天）、续约率趋势、点击楼层跳转房态视图，**接口先用 mock** |

## 三、目录结构

```
src/
  App.tsx                    外壳：页签 + 全局筛选 + 路由（URL 是唯一真相源）
  shell/
    tabs.ts                  七个页签定义
    filters.ts               筛选 ⇄ URL 读写（parse/写回/往返幂等）
    CardStates.tsx           卡片三态（loading / empty / error；不渲染数据）
    MetricTip.tsx            口径提示（定义 + 版本号）
  panel/
    OccupancyRatePanel.tsx   出租率面板 + 房态视图（楼层参数）
    charts.tsx               纯 SVG：趋势线、堆叠条形（图例 + 条内数值标签）、分桶条形
  mock/api.ts                接口桩（确定性随机种子 ⇒ 数据可复现）
tests/                       14 项：filters / panel / shell / noExternal
scripts/
  screenshot.mjs             4 张验收截图（本地 chromium，零外部请求）
  check-no-external.mjs      扫构建产物的外部域名
docs/screenshots/            验收截图
docs/verification.md         验证记录（命令 / 输入 / 期望 / 实测）
```

## 四、**对接点**（依赖其它工单的接口，用 mock 先行）

| 现在（mock） | 换成真实接口 |
|---|---|
| `src/mock/api.ts::fetchOccupancy(org_id, site_id, month)` | `GET /api/v1/dashboard/occupancy?org_id=&site_id=&month=`（任务 1 数据中台）|
| `src/panel/OccupancyRatePanel.tsx::goFloor` → `/floors/:floorId` | 业务员工作台（任务 3）的房态视图路由 |
| `mock/api.ts` 里的站点/会员空间清单 | 会员空间与园区主数据（任务 3）|

改接口只需替换 `src/mock/api.ts` 的两个函数，其余组件不动。

## 五、数据与合规

- 全部为**虚构测试数据**（`演示会员空间` / `演示园区 A 座` / F1–F5 层），
  **不含任何真实个人信息或企业信息**，交付物中不出现客户名称。
- 未引入任何向境外发送数据的第三方 SDK；构建产物**零外部域名引用**（有测试与脚本双重把关）。
- 依赖许可：React(MIT) · TDesign(MIT) · react-router(MIT) · Vite(MIT) · Vitest(MIT) ·
  playwright-core(Apache-2.0) · jsdom(MIT) —— 均在 MIT/Apache-2.0/BSD 范围内。

## 六、限制（如实说明）

- 面板数据来自 **mock**（任务 1/5 范围内要求"接口先用 mock"）；房态视图页面是**路由占位**，
  真实数据由任务 3 提供。
- 其它六个页签在任务 1/5 的范围内只提供**外壳与口径提示**（截图 `shell-tabs.png` 即为该状态）。
- 截图在 Linux + Chromium 1243 下生成；不同字体的文字宽度可能略有差异。

## 七、复跑清单（给验收方）

```bash
git clone <repo> && cd membership-dashboard
npm install
npm run test            # 14 项全绿
npm run build           # 产物
npm run check:no-external
npm run screenshot      # 重新生成 4 张截图
```
