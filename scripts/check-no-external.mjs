#!/usr/bin/env node
/** 扫描构建产物 dist/：不得出现任何外部域名引用（#1851 验收第 4 条） */
import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join, extname } from 'node:path'

const dist = join(process.cwd(), 'dist')
const ALLOW = ['localhost', '127.0.0.1', 'w3.org', 'reactjs.org', 'react.dev']
const bad = []
function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n)
    if (statSync(p).isDirectory()) walk(p)
    else {
      const urls = (readFileSync(p, 'utf-8').match(/https?:\/\/[^\s'"`)]+/g) || [])
      for (const u of urls) if (!ALLOW.some((a) => u.includes(a))) bad.push(`${p}: ${u}`)
    }
  }
}
walk(dist)
if (bad.length) {
  console.error('构建产物含外部域名引用：')
  bad.forEach((b) => console.error('  ' + b))
  process.exit(1)
}
console.log('构建产物无外部域名引用 ✅')
