#!/usr/bin/env node
/**
 * 出验收截图（#1851 第 1 条、#1896 第 3 条）。
 * 用仓库内已构建的 dist/ + 本机 Playwright chromium ⇒ 无外网请求。
 */
import { chromium } from 'playwright-core'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

const EXEC = '/root/.cache/ms-playwright/chromium-1243/chrome-linux/chrome'
const DIST = join(process.cwd(), 'dist', 'index.html')
const OUT = join(process.cwd(), 'docs', 'screenshots')
if (!existsSync(DIST)) { console.error('dist/index.html 不存在，先跑 npm run build'); process.exit(1) }
mkdirSync(OUT, { recursive: true })

const base = pathToFileURL(DIST).href
const shots = [
  ['panel.png', '?tab=occupancy', 1440, 900],       // 面板：堆叠条形 + 图例 + 条内数值标签
  ['panel-empty.png', '?tab=occupancy&empty=1', 1440, 620], // 空数据状态
  ['card-loading.png', '?tab=occupancy&state=loading', 1440, 620], // 加载中状态
  ['shell-tabs.png', '?tab=overview', 1440, 560],    // 七个页签 + 卡片 + 口径提示
]

const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--allow-file-access-from-files'] })
for (const [name, q, w, h] of shots) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('request', (r) => { if (!r.url().startsWith('file:')) errors.push('外部请求: ' + r.url()) })
  await page.goto(base + q, { waitUntil: 'load' })
  await page.waitForTimeout(500)
  await page.screenshot({ path: join(OUT, name), fullPage: false })
  console.log(`  ✅ ${name}  ${errors.length ? '⚠️ ' + errors.join('; ') : '(无外部请求/无报错)'}`)
  await page.close()
}
await browser.close()
console.log('  截图目录: docs/screenshots/')
