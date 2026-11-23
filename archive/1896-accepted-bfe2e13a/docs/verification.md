> 历史交付记录（首版），仅供追溯。当前修订证据见 docs/acceptance-evidence.md、docs/evidence/、TEST-REPORT.md。

# 验证记录（Verification）

工单 #1851（驾驶舱前端外壳）+ #1896（出租率面板）
环境：Linux 5.x / Node v22.19.0 / npm 10.9.3 / Chromium 1243（本地 playwright-core）
日期：2026-11-22

---

## 1. 单元测试

```bash
npm install && npm run test
```

期望：`Test Files 4 passed (4)`，`Tests 14 passed (14)`
实测：`Test Files 4 passed (4) | Tests 14 passed (14)`

| 测试文件 | 覆盖的验收点 |
|---|---|
| `tests/filters.test.ts` | 筛选 ⇄ URL 解析/写回/往返幂等（**筛选写入 URL、刷新保持**）|
| `tests/panel.test.tsx` | 出租率面板：指标卡期末值与环比、**堆叠条形同时有图例与条内数值标签**、**点击楼层跳转 `/floors/:floorId?org_id=&site_id=&month=`**、空数据不把 0 画成数据 |
| `tests/shell.test.tsx` | 七个页签存在且可切换、**卡片三态各有渲染分支**、口径提示含定义与版本号 |
| `tests/noExternal.test.ts` | 源码与构建产物**无外部域名请求** |

## 2. 构建 + 外部域名门禁

```bash
npm run build && npm run check:no-external
```

期望：
```
dist/index.html 0.40 kB │ dist/assets/index-*.css 2.30 kB │ dist/assets/index-*.js 172.49 kB
构建产物无外部域名引用 ✅
```
实测：一致（`built in 2.63s`，`check:no-external` 输出 `构建产物无外部域名引用 ✅`）。

## 3. 截图（零外部请求由脚本断言）

```bash
npm run screenshot
```

期望 4 张图，每张的日志均为 `(无外部请求/无报错)`：

| 文件 | URL | 内容 | 验收点 |
|---|---|---|---|
| `docs/screenshots/panel.png` | `?tab=occupancy` | 指标卡（期末值+环比+口径版本）、12 个月趋势、**按楼层堆叠条形（图例 + 条内数值标签）**、到期分桶、续约率趋势 | #1896 第 1 条、#1851 第 2 条 |
| `docs/screenshots/panel-empty.png` | `?tab=occupancy&empty=1` | 空数据状态 | #1896 第 3 条 |
| `docs/screenshots/card-loading.png` | `?tab=occupancy&state=loading` | 加载中状态 | #1851 第 1 条 |
| `docs/screenshots/shell-tabs.png` | `?tab=overview` | 七个页签 + 全局筛选 + 口径提示 | #1851 第 1、2 条 |

脚本实现要点（`scripts/screenshot.mjs`）：
- 直接加载**已构建的 `dist/index.html`**（`file://`，`base:'./'`）⇒ 不起服务、无外网；
- 监听 `request` 事件，出现任何非 `file://` 请求即记为失败；
- 监听 `pageerror`，页面异常即记为失败；
- 用确定性 mock（`hashString` 种子）⇒ 每次截图数值一致、可复现。

实测输出：
```
✅ panel.png        (无外部请求/无报错)
✅ panel-empty.png  (无外部请求/无报错)
✅ card-loading.png (无外部请求/无报错)
✅ shell-tabs.png   (无外部请求/无报错)
```

## 4. 变异自证（证明测试能失败）

把实现改坏（**改行为，不改类名/文件名**），测试必须**因正确原因**变红，随后当场复原并复核字节。

| 变异（改行为，不改类名/文件名） | 期望红点 | 实测（2026-11-22） |
|---|---|---|
| **M1** 条内数值标签去掉：`charts.tsx` 的 `{wide ? \`${p.label} ${p.value}\` : p.value}` → `{wide ? \`${p.label}\` : ''}` | `tests/panel.test.tsx` 断言"每一段都带数值"失败 | `FAIL tests/panel.test.tsx` — `AssertionError: expected [ 'seg-fl-f1-rented', …(14) ] to deeply equal []`（14 个段全部缺数值 ⇒ 正是被去掉的标签）|
| **M2** 筛选写回丢掉 month：`filters.ts` 去掉 `q.set('month', f.month)` | `tests/filters.test.ts` 的往返断言失败 | `FAIL tests/filters.test.ts` — `AssertionError: expected { org_id: 'o', site_id: 's', …(1) } to deeply equal { … }`（month 丢失 ⇒ 刷新后保持被破坏）|
| **M3** 楼层跳转丢掉 floorId：`navigate(\`/floors/${floorId}?…\`)` → `navigate(\`/floors?…\`)` | `tests/panel.test.tsx` 落地页找不到 ⇒ URL 未带楼层参数 | `FAIL tests/panel.test.tsx` — `TestingLibraryElementError: Unable to find an element by: [data-testid="floor-view"]`（路由不匹配 ⇒ 参数确实丢了）|

**复原校验**：三次变异后均已用 sha256 比对确认**被改文件逐字节复原**（`复原校验: ✅ 字节一致`），
并在复原后重跑全量测试：`Test Files 4 passed (4) | Tests 14 passed (14)`。

> 纪律：校验必须**因正确原因**变红（脚本写错造成的红不算抓到）；变异后当场校验文件已复原。
> ⚠️ 首轮变异时 M1 **没有变红** —— 说明当时那条断言只要求"某些段有文字"，是**空断言**；
> 已把断言补强为"**每一段**都必须带数值"，并把楼层跳转断言从"落地页存在"补成
> "落地页拿到 `fl-f1|org-demo|site-demo-a|2026-11`"，再重跑变异才拿到上表的真实结果。

## 5. 口径定义（面板上明示，版本 v1.2）

- 出租率 = 已租工位 ÷ 可租工位（**期末值**）
- 环比 = 本月末 − 上月末（百分点）
- 工位结构 = 已租 / 预留 / 空置（三者互斥，合计 = 可租工位）
- 到期分桶 = 按合同到期日距月末天数分 30 / 60 / 90 天（**含 90 天以上**）

## 6. 已知限制

- 数据为 mock（任务 1/5 明确要求"接口先用 mock"）；真实接口对接点见 README「四、对接点」。
- 房态视图为路由占位，数据由任务 3 提供。
- 其它六个页签在任务 1/5 范围内只提供外壳与口径提示。
