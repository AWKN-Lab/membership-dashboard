import { describe, expect, it } from 'vitest'
import {
  parseFilters,
  filtersToQuery,
  venueOptions,
  DEFAULT_FILTERS,
  type Filters,
} from '../src/shell/filters'

describe('全局筛选 ⇄ URL（#1851 验收 3）', () => {
  it('三类筛选都写进 URL（会所 / 时间范围 / 对比方式）', () => {
    const f: Filters = { venue: 'cluster', range: 'custom', from: '2026-09-01', to: '2026-11-30', compare: 'yoy' }
    const q = new URLSearchParams(filtersToQuery(f))
    expect(q.get('venue')).toBe('cluster')
    expect(q.get('range')).toBe('custom')
    expect(q.get('from')).toBe('2026-09-01')
    expect(q.get('to')).toBe('2026-11-30')
    expect(q.get('compare')).toBe('yoy')
  })

  it('往返幂等：parse(filtersToQuery(f)) === f', () => {
    const f: Filters = { venue: 'club', range: 'this_quarter', from: '2026-07-01', to: '2026-09-30', compare: 'mom' }
    expect(parseFilters(filtersToQuery(f))).toEqual(f)
  })

  it('默认走 URL 读筛选（刷新后保持的机制）', () => {
    expect(parseFilters('?venue=cluster&range=last_month&compare=yoy')).toEqual({
      venue: 'cluster', range: 'last_month', from: DEFAULT_FILTERS.from, to: DEFAULT_FILTERS.to, compare: 'yoy',
    })
  })

  it('非法值回落到默认（不把脏值写进 URL）', () => {
    const f = parseFilters('?venue=xxx&range=zzz&compare=qqq')
    expect(f.venue).toBe('club')
    expect(f.range).toBe('this_month')
    expect(f.compare).toBe('mom')
  })

  it('会所维度按权限显示：无集团权限时列表里没有「集团」', () => {
    expect(venueOptions({ canViewCluster: true }).map((o) => o.label)).toEqual(['本会所', '集团'])
    expect(venueOptions({ canViewCluster: false }).map((o) => o.label)).toEqual(['本会所'])
  })
})
