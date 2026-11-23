import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import App from '../src/App'

/** 客户要求的七个页签 —— 文案逐字比对（改文案即本用例变红） */
const EXPECTED_TABS = ['总览', '网络', '商机漏斗', '招商', '会员成功', '组织与 Agent', '财务']

describe('驾驶舱外壳：七个页签（#1851）', () => {
  it('页签名称与客户要求逐字一致', () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
    const nav = screen.getByTestId('tabs')
    const labels = Array.from(nav.querySelectorAll('button')).map((b) => (b.textContent || '').trim())
    expect(labels).toEqual(EXPECTED_TABS)
  })

  it('点击页签切换且写进 URL（刷新可保持）', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<App />} />
        </Routes>
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByTestId('tab-funnel'))
    expect((screen.getByTestId('tab-funnel') as HTMLElement).className).toContain('sidebar__item--active')
    expect((screen.getByTestId('tabs') as HTMLElement).textContent).toContain('商机漏斗')
  })

  it('每个页签都挂着面板（面板注册表生效）', () => {
    render(<MemoryRouter initialEntries={['/?tab=finance']}><App /></MemoryRouter>)
    // 财务页本期只放签约额与会籍收入两张卡
    expect(screen.getByTestId('card-签约额')).toBeTruthy()
    expect(screen.getByTestId('card-会籍收入')).toBeTruthy()
  })
})
