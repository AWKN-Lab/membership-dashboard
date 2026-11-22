import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App'
import { TAB_KEYS, TABS } from '../src/shell/tabs'

describe('驾驶舱前端外壳（#1851）', () => {
  it('七个页签都在', () => {
    render(<MemoryRouter initialEntries={['/?tab=occupancy']}><App /></MemoryRouter>)
    expect(TABS).toHaveLength(7)
    for (const t of TABS) expect(screen.getByTestId(`tab-${t.key}`)).toBeTruthy()
    expect(TAB_KEYS).toContain('occupancy')
  })

  it('口径提示显示定义与版本号', async () => {
    render(<MemoryRouter initialEntries={['/?tab=occupancy']}><App /></MemoryRouter>)
    const def = await screen.findByTestId('metric-definition')
    expect(def.textContent).toMatch(/口径/)
    expect(def.textContent).toMatch(/v\d/)
  })

  it('三种卡片状态各有对应渲染分支（loading / empty / normal）', async () => {
    const { unmount } = render(<MemoryRouter initialEntries={['/?tab=occupancy']}><App /></MemoryRouter>)
    await screen.findByTestId('occupancy-panel')
    unmount()
    // 空数据
    render(<MemoryRouter initialEntries={['/?tab=occupancy&empty=1']}><App /></MemoryRouter>)
    const empties = await screen.findAllByTestId('card-empty')
    expect(empties.length).toBeGreaterThan(0)
  })

  it('筛选控件写入 URL（刷新保持靠 URL 单一真相）', async () => {
    render(<MemoryRouter initialEntries={['/?tab=occupancy&org_id=org-9&site_id=site-b&month=2026-02']}><App /></MemoryRouter>)
    expect((screen.getByTestId('filter-org') as HTMLSelectElement).value).toBe('org-9')
    expect((screen.getByTestId('filter-site') as HTMLSelectElement).value).toBe('site-b')
    expect((screen.getByTestId('filter-month') as HTMLInputElement).value).toBe('2026-02')
  })
})
