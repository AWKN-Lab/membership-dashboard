import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

/** 构建产物/源码里不得有外部域名请求（#1851 验收第 4 条） */
const SRC = join(__dirname, '..', 'src')
const ALLOW = ['localhost', '127.0.0.1', 'react-router-dom', 'w3.org']

function walk(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (['.ts', '.tsx', '.css'].includes(extname(p))) out.push(p)
  }
  return out
}

describe('无外部域名请求', () => {
  it('源码里没有 http(s) 外链', () => {
    const bad: string[] = []
    for (const f of walk(SRC)) {
      const text = readFileSync(f, 'utf-8')
      const urls = text.match(/https?:\/\/[^\s'"`)]+/g) || []
      for (const u of urls) if (!ALLOW.some((a) => u.includes(a))) bad.push(`${f}: ${u}`)
    }
    expect(bad).toEqual([])
  })

  it('依赖里没有远程字体/CDN 之类（package.json 无 cdn 脚本）', () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'))
    expect(Object.keys(pkg.dependencies || {})).not.toContain('@fortawesome/fontawesome-free')
    expect(JSON.stringify(pkg.scripts)).not.toMatch(/cdn/)
  })
})
