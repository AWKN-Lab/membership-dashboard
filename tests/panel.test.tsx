import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useParams, useLocation } from 'react-router-dom'
import { OccupancyRatePanel } from '../src/panel/OccupancyRatePanel'

const filters = { org_id: 'org-demo', site_id: 'site-demo-a', month: '2026-11' }

/** 落地页把路由参数与 query 一并吐出来，便于断言"URL 带楼层参数" */
function FloorView() {
  const { floorId } = useParams()
  const { search } = useLocation()
  const q = new URLSearchParams(search)
  return (
    <div data-testid="floor-view">
      {floorId}|{q.get('org_id')}|{q.get('site_id')}|{q.get('month')}
    </div>
  )
}

describe('出租率面板（#1896）', () => {
  it('堆叠条形**同时**有图例与条内数值标签', async () => {
    render(<MemoryRouter><OccupancyRatePanel filters={filters} /></MemoryRouter>)
    await screen.findByTestId('stacked-bar')
    expect(screen.getByTestId('legend')).toBeTruthy()
    expect(screen.getByTestId('legend-rented')).toBeTruthy()
    expect(screen.getByTestId('legend-reserved')).toBeTruthy()
    expect(screen.getByTestId('legend-vacant')).toBeTruthy()
    // 条内数值标签：段元素里带可见文本
    const segs = Array.from(document.querySelectorAll('[data-testid^="seg-"]'))
    expect(segs.length).toBeGreaterThan(0)
    const missing = segs
      .filter((e) => !/\d/.test(e.textContent || ''))
      .map((e) => e.getAttribute('data-testid'))
    expect(missing).toEqual([])
  })

  it('点击楼层跳转的 URL 带楼层参数', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<OccupancyRatePanel filters={filters} />} />
          <Route path="/floors/:floorId" element={<FloorView />} />
        </Routes>
      </MemoryRouter>,
    )
    await screen.findByTestId('stacked-bar')
    const seg = document.querySelector('[data-testid^="seg-"]') as HTMLElement
    fireEvent.click(seg)
    // 落地页拿到楼层参数 + 三个筛选参数
    await waitFor(() => expect(screen.getByTestId('floor-view')).toBeTruthy())
    expect(screen.getByTestId('floor-view').textContent).toBe('fl-f1|org-demo|site-demo-a|2026-11')
  })

  it('空数据状态渲染空态而不是把 0 画成数据', async () => {
    render(<MemoryRouter><OccupancyRatePanel filters={filters} empty /></MemoryRouter>)
    // 面板里有多张卡 ⇒ 空态元素不止一个
    const empties = await screen.findAllByTestId('card-empty')
    expect(empties.length).toBeGreaterThan(0)
    // 空态下**不能**把 0 画成数据
    expect(screen.queryByTestId('rate-end')).toBeNull()
    expect(document.body.textContent).not.toMatch(/出租率面板/)
  })

  it('指标卡显示期末值与环比', async () => {
    render(<MemoryRouter><OccupancyRatePanel filters={filters} /></MemoryRouter>)
    await screen.findByTestId('rate-end')
    await waitFor(() => expect(screen.getByTestId('rate-end').textContent).toMatch(/\d+\.\d%/))
    expect(screen.getByTestId('rate-mom').textContent).toMatch(/环比/)
  })
})
