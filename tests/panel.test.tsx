import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { PanelContent } from '../src/panels/PanelContent'
import { parseFilters } from '../src/shell/filters'

const filters = parseFilters('?venue=club&range=this_month&compare=mom')

function LocationProbe() {
  const loc = useLocation()
  return <div data-testid="location">{`${loc.pathname}?${loc.search}`}</div>
}

describe('出租率面板（#1896）', () => {
  it('渲染指标卡与三张图（出租率 / 堆叠条形 / 到期分桶 / 续约率）', async () => {
    render(
      <MemoryRouter>
        <PanelContent panelId="occupancy" filters={filters} />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByTestId('rate-end')).toBeTruthy())
    expect(screen.getByTestId('rate-end').textContent).toMatch(/\d+\.\d%/)
    expect(screen.getByTestId('rate-mom').textContent).toMatch(/(环比|同比)/)
    expect(screen.getByTestId('chart-trend')).toBeTruthy()
    expect(screen.getByTestId('chart-stacked')).toBeTruthy()
    expect(screen.getByTestId('chart-bucket')).toBeTruthy()
    expect(screen.getByTestId('chart-renewal')).toBeTruthy()
  })

  it('点击楼层跳转的 URL 带楼层参数', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <LocationProbe />
        <Routes>
          <Route path="/" element={<PanelContent panelId="occupancy" filters={filters} />} />
          <Route path="/floors/:floorId" element={<div data-testid="floor-view">房态视图</div>} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByTestId('floor-links')).toBeTruthy())
    const link = document.querySelector('[data-testid^="floor-link-"]') as HTMLElement
    expect(link).toBeTruthy()
    fireEvent.click(link)
    await waitFor(() => expect(screen.getByTestId('floor-view')).toBeTruthy())
    const url = screen.getByTestId('location').textContent || ''
    expect(url).toMatch(/^\/floors\/fl-f1\?/)
    expect(url).toContain('venue=club')
    expect(url).toContain('compare=mom')
  })

  it('空数据状态渲染空态而不是把 0 画成数据', async () => {
    render(
      <MemoryRouter>
        <PanelContent panelId="occupancy" filters={filters} forceState="empty" />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getAllByTestId('card-empty').length).toBeGreaterThan(0))
    expect(screen.queryByTestId('rate-end')).toBeNull()
    expect(screen.queryByTestId('chart-stacked')).toBeNull()
  })

  it('报错状态有独立渲染分支', async () => {
    render(
      <MemoryRouter>
        <PanelContent panelId="occupancy" filters={filters} forceState="error" />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getAllByTestId('card-error').length).toBeGreaterThan(0))
  })
})
