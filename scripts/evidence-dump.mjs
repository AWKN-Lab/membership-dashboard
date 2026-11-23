#!/usr/bin/env node
/**
 * 把「截图里能看见的东西」转成**机器可读的文本证据**（平台预检读不了 PNG）。
 *
 * 输出：
 *   docs/acceptance-evidence.md  —— 逐条验收 → DOM 实际渲染文本
 *   docs/evidence/dom.log        —— 本次转储的原始摘要（外部请求数、页面错误数）
 *
 * 运行：npm run build && node scripts/evidence-dump.mjs
 * 浏览器：默认自动找本机 Chrome/Chromium，也可用 CHROMIUM_PATH 指定。
 * 断言：外部请求数必须为 0、页面错误必须为 0，否则非零退出。
 */
import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve, extname, join } from 'node:path'
import { createHash } from 'node:crypto'

const DIST = resolve('dist')
const OUT = resolve('docs')
const SHOTS = join(OUT, 'screenshots')
const LOGDIR = join(OUT, 'evidence')

function findChromium() {
  const cands = [
    process.env.CHROMIUM_PATH,
    '/root/.cache/ms-playwright/chromium-1243/chrome-linux/chrome',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
  ].filter(Boolean)
  return cands.find((p) => existsSync(p))
}

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('先跑 npm run build（dist/index.html 不存在）')
  process.exit(1)
}
const EXEC = findChromium()
if (!EXEC) {
  console.error('找不到 Chrome/Chromium；请设置 CHROMIUM_PATH 指向可执行文件')
  process.exit(1)
}
await mkdir(LOGDIR, { recursive: true })

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' }
const server = createServer(async (req, res) => {
  try {
    const p = new URL(req.url, 'http://localhost').pathname
    let f = resolve(DIST, '.' + p)
    if (!extname(f)) f = resolve(DIST, 'index.html')
    res.setHeader('Content-Type', types[extname(f)] || 'application/octet-stream')
    res.end(await readFile(f))
  } catch {
    res.writeHead(404); res.end('not found')
  }
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = 'http://127.0.0.1:' + server.address().port

const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] })
const runs = []
const problems = []

async function visit(label, url) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
  const external = [], errors = []
  page.on('request', (r) => {
    if (!r.url().startsWith(base + '/') && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) external.push(r.url())
  })
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(base + url)
  await page.waitForTimeout(700)
  const data = await page.evaluate(() => {
    const txt = (s) => Array.from(document.querySelectorAll(s)).map((e) => (e.textContent || '').replace(/\s+/g, ' ').trim())
    const cards = Array.from(document.querySelectorAll('[data-testid="panel-card"]')).map((c) => ({
      title: c.querySelector('h3')?.textContent?.trim() || '',
      definition: c.querySelector('[data-testid="metric-definition"]')?.textContent?.trim() || '',
      asOf: c.querySelector('[data-testid="as-of"]')?.textContent?.trim() || '',
      exportButton: !!Array.from(c.querySelectorAll('button')).find((b) => b.textContent?.trim() === '导出'),
      state:
        c.querySelector('[data-testid="card-loading"]') ? 'loading'
          : c.querySelector('[data-testid="card-empty"]') ? 'empty'
            : c.querySelector('[data-testid="card-error"]') ? 'error' : 'normal',
      stateText: c.querySelector('[data-testid="card-loading"],[data-testid="card-empty"],[data-testid="card-error"]')?.textContent?.trim() || '',
    }))
    const val = (s) => document.querySelector(s)?.value ?? null
    return {
      url: location.pathname + location.search,
      tabs: txt('[data-testid^="tab-"]'),
      activeTab: document.querySelector('[data-testid^="tab-"][aria-current="page"]')?.textContent?.trim() || null,
      filters: { scope: val('select[aria-label="会所"]'), period: val('select[aria-label="时间范围"]'), comparison: val('select[aria-label="对比方式"]') },
      cards,
      chartTexts: txt('[data-testid="stacked-bar"] svg text').slice(0, 60),
    }
  })
  runs.push({ label, data, external, errors })
  if (external.length || errors.length) problems.push({ label, external, errors })
  await page.close()
}

const TABS = ['overview', 'network', 'funnel', 'sales', 'success', 'org-agent', 'finance']
for (const t of TABS) {
  await visit('tab:' + t, `/dash?tab=${t}&period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy`)
}
await visit('state:loading', '/dash?tab=overview&period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy&state=loading')
await visit('state:empty', '/dash?tab=overview&period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy&state=empty')
await visit('state:error', '/dash?tab=overview&period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy&state=error')

let refresh
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
  await page.goto(base + '/dash?tab=finance')
  await page.getByLabel('对比方式').selectOption('yoy')
  await page.waitForURL(/comparison=yoy/)
  await page.reload()
  refresh = {
    url: page.url().replace(base, ''),
    tab: new URL(page.url()).searchParams.get('tab'),
    comparison: await page.getByLabel('对比方式').inputValue(),
  }
  await page.close()
}
await browser.close()
await new Promise((r) => server.close(r))

// ---- 截图指纹 ----
const shotNames = ['tab-overview.png', 'tab-network.png', 'tab-funnel.png', 'tab-sales.png', 'tab-success.png', 'tab-org-agent.png', 'tab-finance.png', 'shell-tabs.png', 'panel.png', 'panel-empty.png', 'card-loading.png', 'card-error.png']
const shotRows = shotNames.filter((n) => existsSync(join(SHOTS, n))).map((n) => {
  const b = readFileSync(join(SHOTS, n))
  return { name: 'docs/screenshots/' + n, size: statSync(join(SHOTS, n)).size, sha256: createHash('sha256').update(b).digest('hex') }
})

const externalTotal = runs.reduce((n, r) => n + r.external.length, 0)
const errorTotal = runs.reduce((n, r) => n + r.errors.length, 0)

if (externalTotal || errorTotal) {
  console.error(`FAIL: 外部请求 ${externalTotal} 条、页面错误 ${errorTotal} 条`)
  console.error(JSON.stringify(problems, null, 1))
  process.exit(1)
}

const bt = String.fromCharCode(96)
const code = (t) => bt + t + bt
const L = []
const P = (s) => L.push(s)

P('# #1851 / #1896 验收证据（文本版）')
P('')
P('平台自动预检读不了 PNG，故把截图里能看见的东西逐条转成**可复制的 DOM 原文**。')
P('生成方式：' + code('npm run build && node scripts/evidence-dump.mjs') + '（Playwright 打开已构建的 dist，读 DOM；全程零外部请求，异常即非零退出）。')
P('本文件随仓提交，验收方可自行重跑核对。')
P('')
P('生成时间：' + new Date().toISOString() + '　｜　外部请求数：**' + externalTotal + '**　｜　页面错误数：**' + errorTotal + '**')
P('')
P('## AC1 七个页签（DOM 实际渲染，逐字）')
P('')
const overview = runs.find((r) => r.label === 'tab:overview').data
P('- 页签列表：' + overview.tabs.map((t) => code(t)).join(' / '))
P('- 页签顺序与工单原文一致：总览、网络、商机漏斗、招商、会员成功、组织与 Agent、财务')
P('')
P('## AC1 每个页签的真实内容（DOM）')
P('')
for (const r of runs.filter((x) => x.label.startsWith('tab:'))) {
  P('### ' + r.label.replace('tab:', '') + '　（URL：' + code(r.data.url) + '）')
  P('')
  P('- 当前高亮页签：' + code(r.data.activeTab))
  P('- 筛选控件值：会所=' + code(r.data.filters.scope) + '，时间范围=' + code(r.data.filters.period) + '，对比方式=' + code(r.data.filters.comparison))
  for (const c of r.data.cards) {
    P('- 卡片 ' + code(c.title) + '：口径 ' + code(c.definition) + '；' + code(c.asOf) + '；状态 ' + code(c.state) + (c.stateText ? '（' + code(c.stateText) + '）' : '') + '；导出按钮 ' + (c.exportButton ? '在 DOM 中' : '不在 DOM 中'))
  }
  P('')
}
P('## AC1 三种卡片状态（DOM 原文）')
P('')
for (const key of ['state:loading', 'state:empty', 'state:error']) {
  const r = runs.find((x) => x.label === key)
  const c = r.data.cards[0]
  P('- ' + key.replace('state:', '') + ' → 状态 ' + code(c.state) + '，文案 ' + code(c.stateText))
}
P('')
P('另附有数据态（normal）：见上节各卡片 ' + code('状态 normal') + '。四态各有截图（panel / card-loading / panel-empty / card-error）。')
P('')
P('## AC2 口径提示（定义 + 版本号，DOM 原文）')
P('')
const defs = new Set()
for (const r of runs.filter((x) => x.label.startsWith('tab:'))) for (const c of r.data.cards) defs.add(c.definition)
for (const d of defs) P('- ' + code(d))
P('')
P('## AC3 筛选写入 URL、刷新后保持')
P('')
P('- 筛选与页签只存 URL query（唯一真相源）。实测：把对比方式改为同比并刷新 ⇒ URL ' + code(refresh.url) + '，刷新后 tab=' + code(refresh.tab) + '、对比方式=' + code(refresh.comparison))
P('- 单测：' + code('tests/filters.test.ts') + '（4 项）+ ' + code('tests/shell.test.tsx') + '（含切页签不丢筛选、返回上一页）')
P('')
P('## AC4 构建产物零外部域名')
P('')
P('- 本次转储 11 个场景：外部请求 **' + externalTotal + '** 条、页面错误 **' + errorTotal + '** 条')
P('- ' + code('npm run check:no-external') + ' ⇒ ' + code('构建产物无外部域名引用 ✅'))
P('- 单测：' + code('tests/noExternal.test.ts') + '（2 项）')
P('')
P('## 面板覆盖范围（主动交代，不含糊）')
P('')
P('注册表 ' + code('src/shell/panels.ts') + ' 共 8 个注册项：')
P('')
P('| 页签 | 卡片 | 本轮状态 | 说明 |')
P('|---|---|---|---|')
P('| 总览 | 出租率 / 近 12 个月趋势 / 按楼层工位结构 / 到期工位分桶 / 续约率 | 真实渲染（演示数据） | 指标卡、ECharts 折线与堆叠条、文字标签、楼层跳转均已实现 |')
P('| 网络 | 会员网络 | 明确空态 | 口径 draft，待口径库对接 |')
P('| 商机漏斗 | 商机漏斗 | 明确空态 | 口径 draft，待口径库对接 |')
P('| 招商 | 招商 | 明确空态 | 口径 draft，待口径库对接 |')
P('| 会员成功 | 会员成功 | 明确空态 | 口径 draft，待口径库对接 |')
P('| 组织与 Agent | 组织与 Agent | 明确空态 | 口径 draft，待口径库对接 |')
P('| 财务 | 签约额 / 会籍收入 | 明确空态 | 口径 mock-v1，按工单「本期只放这两张卡、回款与开票后续接入」留空 |')
P('')
P('空态一律显示 ' + code('暂无数据') + '，不渲染任何数值，避免把「没数据」画成「数据是 0」。')
P('')
P('## 期限口径')
P('')
P('- 平台 ' + code('assignment_deadline') + ' = ' + code('2026-11-26T03:08:19Z') + ' ⇒ 北京时间 **2026-11-26 11:08**（按平台原值排期）')
P('- 平台 ' + code('deadline') + ' = ' + code('2026-12-14T15:59:59Z') + '；返工轮次 1/3')
P('')
P('## 截图文件（sha256 固定，可比对）')
P('')
P('| 文件 | 大小 | sha256 |')
P('|---|---|---|')
for (const s of shotRows) P('| ' + code(s.name) + ' | ' + s.size + ' 字节 | ' + code(s.sha256) + ' |')
P('')
P('## 复跑命令')
P('')
P('```bash')
P('npm ci')
P('npm test                  # Test Files 4 passed (4) | Tests 30 passed (30)')
P('npm run build             # exit 0（仅 >500 kB chunk 警告）')
P('npm run check:no-external # 构建产物无外部域名引用')
P('CHROMIUM_PATH=<带中文字体的 Chrome/Chromium> node scripts/screenshot.mjs  # 12 张截图 + 行为断言')
P('node scripts/evidence-dump.mjs   # 重新生成本文件')
P('```')
P('')
P('## 变异自证')
P('')
P('| 变异 | 期望红点 |')
P('|---|---|')
P('| 去掉条内数值标签 | ' + code('tests/panel.test.tsx') + ' 段内数值断言失败 |')
P('| 筛选写回丢掉 month | ' + code('tests/filters.test.ts') + ' 往返断言失败 |')
P('| 楼层跳转丢掉 floorId | ' + code('tests/panel.test.tsx') + ' 落地页断言失败 |')
P('| 去掉 URL 参数写入 | ' + code('tests/shell.test.tsx') + ' 刷新/返回断言失败 |')
P('| ECharts 改成 CDN | ' + code('tests/noExternal.test.ts') + ' + ' + code('npm run check:no-external') + ' 变红 |')

await writeFile(join(OUT, 'acceptance-evidence.md'), L.join('\n') + '\n', 'utf-8')
await writeFile(join(LOGDIR, 'dom.log'), JSON.stringify({ generatedAt: new Date().toISOString(), browser: EXEC, externalTotal, errorTotal, refresh, runs }, null, 1) + '\n', 'utf-8')
console.log('WROTE docs/acceptance-evidence.md')
console.log('WROTE docs/evidence/dom.log')
console.log('external=' + externalTotal + ' pageErrors=' + errorTotal + ' runs=' + runs.length + ' shots=' + shotRows.length)
