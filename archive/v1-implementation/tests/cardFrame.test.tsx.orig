import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CardFrame } from '../src/shell/CardFrame'

describe('面板卡片框架（#1851）', () => {
  it('三种状态各有渲染分支（加载 / 空数据 / 报错）', () => {
    const { rerender } = render(
      <CardFrame title="T" metricKey="occupancy" updatedAt="2026-11-22 10:30" state="loading">
        <div data-testid="real-content">内容</div>
      </CardFrame>,
    )
    expect(screen.getByTestId('card-loading')).toBeTruthy()
    expect(screen.queryByTestId('real-content')).toBeNull()

    rerender(<CardFrame title="T" metricKey="occupancy" updatedAt="2026-11-22 10:30" state="empty"><div data-testid="real-content">内容</div></CardFrame>)
    expect(screen.getAllByTestId('card-empty').length).toBeGreaterThan(0)
    expect(screen.queryByTestId('real-content')).toBeNull()

    rerender(<CardFrame title="T" metricKey="occupancy" updatedAt="2026-11-22 10:30" state="error"><div data-testid="real-content">内容</div></CardFrame>)
    expect(screen.getAllByTestId('card-error').length).toBeGreaterThan(0)
    expect(screen.queryByTestId('real-content')).toBeNull()

    rerender(<CardFrame title="T" metricKey="occupancy" updatedAt="2026-11-22 10:30" state="normal"><div data-testid="real-content">内容</div></CardFrame>)
    expect(screen.getByTestId('real-content')).toBeTruthy()
  })

  it('口径提示悬停显示口径库里的定义与版本号', () => {
    render(<CardFrame title="出租率" metricKey="occupancy" updatedAt="2026-11-22 10:30" />)
    expect(screen.queryByTestId('metric-definition')).toBeNull()
    fireEvent.mouseEnter(screen.getByTestId('metric-tip-trigger'))
    const pop = screen.getByTestId('metric-definition')
    expect(pop.textContent).toContain('口径 v1.2')
    expect(pop.textContent).toContain('已租工位')
    expect(screen.getByTestId('metric-version').textContent).toContain('v1.2')
  })

  it('显示数据截至时间与标题', () => {
    render(<CardFrame title="签约额" metricKey="finance-contract" updatedAt="2026-11-22 10:30" />)
    expect(screen.getByTestId('card-title').textContent).toBe('签约额')
    expect(screen.getByTestId('card-updated').textContent).toContain('数据截至 2026-11-22 10:30')
  })

  it('有导出按钮且点击触发导出回调', () => {
    const onExport = vi.fn()
    render(<CardFrame title="导出" metricKey="occupancy" updatedAt="x" onExport={onExport} />)
    fireEvent.click(screen.getByTestId('card-export'))
    expect(onExport).toHaveBeenCalledTimes(1)
  })
})
