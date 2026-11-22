#!/usr/bin/env node
/**
 * 扫描构建产物 dist/：**运行时**不得出现任何外部域名引用（#1851 验收第 4 条）。
 *
 * 分类处理（不掩盖）：
 *   - 运行时引用（在代码里）⇒ **失败**，逐条列出；
 *   - 许可证横幅注释里的 URL（如 zrender 的 LICENSE.txt）⇒ 不发起请求，
 *     但**必须点名列出**（不静默放过），并从运行时检查中排除。
 */
import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join, extname } from 'node:path'

const dist = join(process.cwd(), 'dist')
const ALLOW = ['localhost', '127.0.0.1', 'w3.org', 'reactjs.org', 'react.dev']
const URL_RE = /https?:\/\/[^\s'"`)]+/g

/** 许可证横幅注释：/*! ... @license ... *\/ 或 /** ... @license ... *\/ */
function splitLicenseComments(text) {
  const banners = []
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, (m) => {
    if (/@license|licen[cs]e|copyright/i.test(m)) { banners.push(m); return '' }
    return m
  })
  return { banners, stripped }
}

const runtime = []
const licensed = []

function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n)
    if (statSync(p).isDirectory()) { walk(p); continue }
    const text = readFileSync(p, 'utf-8')
    const { banners, stripped } = splitLicenseComments(text)
    const bannerUrls = new Set()
    for (const b of banners) for (const u of (b.match(URL_RE) || [])) bannerUrls.add(u)
    for (const u of (stripped.match(URL_RE) || [])) {
      if (ALLOW.some((a) => u.includes(a))) continue
      if (bannerUrls.has(u)) { licensed.push(`${p}: ${u}`); continue }
      runtime.push(`${p}: ${u}`)
    }
  }
}
walk(dist)

if (runtime.length) {
  console.error('❌ 构建产物含**运行时**外部域名引用：')
  runtime.forEach((b) => console.error('   ' + b))
  process.exit(1)
}
console.log('构建产物无外部域名引用 ✅')
if (licensed.length) {
  console.log(`（另有 ${licensed.length} 处 URL 仅出现在**许可证横幅注释**里，不发起请求，点名如下：）`)
  licensed.forEach((b) => console.log('   · ' + b))
}
