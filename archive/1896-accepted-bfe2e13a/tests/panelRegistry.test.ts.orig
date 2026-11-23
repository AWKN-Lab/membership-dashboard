import { describe, expect, it } from 'vitest'
import { PANELS, panelsOfTab } from '../src/shell/panelRegistry'
import { TABS } from '../src/shell/tabs'

describe('面板注册表（#1851）', () => {
  it('恰好 8 个面板', () => {
    expect(PANELS).toHaveLength(8)
    expect(new Set(PANELS.map((p) => p.id)).size).toBe(8)
  })

  it('每个面板都挂在已定义的页签上，且每个页签都有面板', () => {
    const tabKeys = TABS.map((t) => t.key)
    for (const p of PANELS) expect(tabKeys).toContain(p.tab)
    for (const t of tabKeys) expect(panelsOfTab(t).length).toBeGreaterThan(0)
  })

  it('财务页本期只放签约额与会籍收入', () => {
    const finance = panelsOfTab('finance').map((p) => p.id).sort()
    expect(finance).toEqual(['finance-contract', 'finance-revenue'])
  })

  it('每个面板都能在口径库找到定义（含版本号）', async () => {
    const { metricDefinition } = await import('../src/shell/metricLibrary')
    for (const p of PANELS) {
      const m = metricDefinition(p.metricKey)
      expect(m.definition.length).toBeGreaterThan(4)
      expect(m.version).toMatch(/^v\d/)
    }
  })
})
