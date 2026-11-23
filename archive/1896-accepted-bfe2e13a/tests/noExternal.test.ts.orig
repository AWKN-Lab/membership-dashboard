import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

function walk(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else out.push(p)
  }
  return out
}

/**
 * 只允许出现**带主机名**的外部地址（localhost / 127.0.0.1 除外）。
 * 要求主机名里有点 ⇒ 不会把注释里的 // 当成域名。
 */
const EXTERNAL = /\bhttps?:\/\/(?!(localhost|127\.0\.0\.1)\b)[a-z0-9-]+(\.[a-z0-9-]+)+/gi

describe('零外部域名 + 脚本注册（#1851 验收 4）', () => {
  it('源码里没有任何外部域名引用', () => {
    const offenders: string[] = []
    for (const f of walk(SRC)) {
      if (!/\.(ts|tsx|css|html)$/.test(f)) continue
      const text = readFileSync(f, 'utf-8')
      const hits = text.match(EXTERNAL) || []
      if (hits.length) offenders.push(`${f.replace(ROOT + '/', '')}: ${hits.join(', ')}`)
    }
    expect(offenders).toEqual([])
  })

  it('ECharts 是本地打包依赖（不在 CDN 上取）', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'))
    expect(pkg.dependencies.echarts).toBeTruthy()
    expect(pkg.dependencies['echarts']).not.toMatch(/^(http|https)/)
  })

  it('package.json 里 README 承诺的命令都已注册（交付说明不许说谎）', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'))
    for (const s of ['dev', 'build', 'test', 'screenshot', 'check:no-external']) {
      expect(pkg.scripts[s], `缺少 script：${s}`).toBeTruthy()
    }
  })

  it('README 里出现的 npm run 命令都在 package.json 中注册', () => {
    const readme = readFileSync(join(ROOT, 'README.md'), 'utf-8')
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'))
    const used = new Set((readme.match(/npm run [a-z0-9:_-]+/gi) || []).map((s) => s.split(/\s+/)[2]))
    for (const s of used) expect(pkg.scripts[s], `README 提到但未注册：npm run ${s}`).toBeTruthy()
  })
})
