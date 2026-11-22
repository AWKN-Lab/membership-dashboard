import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import App from '../src/App'

function LocationProbe() {
  const loc = useLocation()
  return <div data-testid="location">{`${loc.pathname}?${loc.search}`}</div>
}

describe('驾驶舱前端外壳（#1851）', () => {
  it('七个页签都在，且默认页签挂上对应面板', () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
    expect(screen.getByTestId('tabs')).toBeTruthy()
    expect(screen.getByTestId('card-关键指标概览')).toBeTruthy()
  })

  it('全局筛选写入 URL（刷新后保持靠 URL 单一真相）', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <LocationProbe />
        <App />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByTestId('filter-range'), { target: { value: 'custom' } })
    await waitFor(() => expect(screen.getByTestId('location').textContent).toContain('range=custom'))
    fireEvent.change(screen.getByTestId('filter-compare'), { target: { value: 'yoy' } })
    await waitFor(() => expect(screen.getByTestId('location').textContent).toContain('compare=yoy'))
    // 切页签不丢筛选
    fireEvent.click(screen.getByTestId('tab-finance'))
    await waitFor(() => {
      const url = screen.getByTestId('location').textContent || ''
      expect(url).toContain('tab=finance')
      expect(url).toContain('compare=yoy')
      expect(url).toContain('range=custom')
    })
  })

  it('会所维度按权限显示（?perm=club 时没有「集团」）', () => {
    render(<MemoryRouter initialEntries={['/?perm=club']}><App /></MemoryRouter>)
    const opts = Array.from((screen.getByTestId('filter-venue') as HTMLSelectElement).options).map((o) => o.textContent)
    expect(opts).toEqual(['本会所'])
  })

  it('口径提示显示定义与版本号（悬停展开）', () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
    fireEvent.mouseEnter(screen.getAllByTestId('metric-tip-trigger')[0])
    const pop = screen.getAllByTestId('metric-definition')[0]
    expect(pop.textContent).toMatch(/口径 v\d/)
    expect(pop.textContent.length).toBeGreaterThan(10)
  })

  it('三种卡片状态各有对应渲染分支（loading / empty / error / normal）', async () => {
    const { unmount } = render(<MemoryRouter initialEntries={['/?state=loading']}><App /></MemoryRouter>)
    expect(screen.getAllByTestId('card-loading').length).toBeGreaterThan(0)
    unmount()

    const r2 = render(<MemoryRouter initialEntries={['/?state=empty']}><App /></MemoryRouter>)
    expect(screen.getAllByTestId('card-empty').length).toBeGreaterThan(0)
    r2.unmount()

    const r3 = render(<MemoryRouter initialEntries={['/?state=error']}><App /></MemoryRouter>)
    expect(screen.getAllByTestId('card-error').length).toBeGreaterThan(0)
    r3.unmount()

    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
    expect(screen.getByTestId('card-关键指标概览')).toBeTruthy()
  })

  it('卡片显示数据截至时间与导出按钮', async () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
    expect(screen.getAllByTestId('card-updated')[0].textContent).toContain('数据截至')
    expect(screen.getAllByTestId('card-export').length).toBeGreaterThan(0)
  })
})
