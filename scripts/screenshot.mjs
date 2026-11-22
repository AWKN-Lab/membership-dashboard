#!/usr/bin/env node
/**
 * 出验收截图（#1851 验收 1/2、#1896 验收 3）。
 * 直接加载**已构建的 dist/**（file://，base './'）⇒ 不起服务、无外网。
 * 每个页面都监听 request/pageerror ⇒ 出现任何非 file:// 请求或页面异常即判失败。
 */
import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname, normalize } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

const EXEC = '/root/.cache/ms-playwright/chromium-1243/chrome-linux/chrome'
const DIST = join(process.cwd(), 'dist', 'index.html')
const OUT = join(process.cwd(), 'docs', 'screenshots')
if (!existsSync(DIST)) { console.error('dist/index.html 不存在，先跑 npm run build'); process.exit(1) }
mkdirSync(OUT, { recursive: true })

/**
 * 本地静态服务（127.0.0.1）：**file:// 下 type=module 会被 CORS 挡掉 → 页面空白**。
 * 用 HTTP 加载构建产物，既贴近真实部署，又能断言「页面真的渲染了」。
 */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.map': 'application/json' }
const server = createServer(async (req, res) => {
  try {
    const rel = normalize(decodeURIComponent((req.url || '/').split('?')[0])).replace(/^([/\\.]+)/, '')
    const file = join(process.cwd(), 'dist', rel || 'index.html')
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404); res.end('not found')
  }
})
await new Promise((r) => server.listen(4173, '127.0.0.1', r))
const base = 'http://127.0.0.1:4173/'
const shots = [
  // 七个页签（逐字名称可见）
  ['tab-overview.png', '?tab=overview', 1440, 700],
  ['tab-network.png', '?tab=network', 1440, 700],
  ['tab-funnel.png', '?tab=funnel', 1440, 700],
  ['tab-leads.png', '?tab=leads', 1440, 1400],
  ['tab-member-success.png', '?tab=member-success', 1440, 700],
  ['tab-org-agent.png', '?tab=org-agent', 1440, 800],
  ['tab-finance.png', '?tab=finance', 1440, 800],
  // 三种卡片状态
  ['card-loading.png', '?tab=overview&state=loading', 1440, 520],
  ['card-empty.png', '?tab=overview&state=empty', 1440, 520],
  ['card-error.png', '?tab=overview&state=error', 1440, 520],
  // 出租率面板（#1896）：堆叠条形图例 + 条内数值标签
  ['occupancy-panel.png', '?tab=leads', 1440, 1400],
  // 全局筛选（自定义时间范围 + 同比）
  ['filters-custom.png', '?tab=overview&range=custom&from=2026-09-01&to=2026-11-30&compare=yoy', 1440, 700],
]

const browser = await chromium.launch({
  executablePath: EXEC,
  args: ['--no-sandbox', '--allow-file-access-from-files'],
})
let failed = 0
for (const [name, q, w, h] of shots) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1:4173/')) errors.push('外部请求: ' + r.url()) })
  await page.goto(base + q, { waitUntil: 'load' })
  await page.waitForTimeout(900)
  // 门禁：**页面必须真的渲染了**（空白图不算通过）
  const rendered = await page.evaluate(() => ({
    testids: document.querySelectorAll('[data-testid]').length,
    text: (document.body.textContent || '').replace(/\s+/g, ' ').trim(),
  }))
  if (rendered.testids === 0) errors.push('页面空白：没有任何 data-testid 元素')
  if (!/数据截至|暂无数据|加载中|数据加载失败/.test(rendered.text)) errors.push('页面无卡片内容')
  await page.screenshot({ path: join(OUT, name), fullPage: false })
  if (errors.length) failed++
  console.log(`  ${errors.length ? '❌' : '✅'} ${name}${errors.length ? '  ' + errors.join('; ') : '  (无外部请求/无报错)'}`)
  await page.close()
}

// 口径提示悬停（口径库里定义 + 版本号要**看得见**）
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 560 }, deviceScaleFactor: 2 })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1:4173/')) errors.push('外部请求: ' + r.url()) })
  await page.goto(base + '?tab=overview', { waitUntil: 'load' })
  await page.waitForTimeout(500)
  await page.hover('[data-testid="metric-tip-trigger"]')
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(OUT, 'metric-tip-hover.png'), fullPage: false })
  if (errors.length) failed++
  console.log(`  ${errors.length ? '❌' : '✅'} metric-tip-hover.png${errors.length ? '  ' + errors.join('; ') : '  (无外部请求/无报错)'}`)
  await page.close()
}
await browser.close()
server.close()
console.log(`  截图目录: docs/screenshots/（${shots.length + 1} 张）`)
if (failed) { console.error(`  ❌ ${failed} 张截图存在外部请求或页面异常`); process.exit(1) }
