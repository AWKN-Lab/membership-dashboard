/**
 * 全局筛选 ⇄ URL（客户约定：筛选条件写入 URL，刷新后保留）。
 *
 * 三类筛选：
 *   1. 会所：本会所 / 集团（**按权限显示**——无集团权限时列表里没有「集团」）
 *   2. 时间范围：本月 / 上月 / 本季度 / 自定义（自定义需 from/to）
 *   3. 对比方式：环比 / 同比
 *
 * 实现要点：筛选**只存在 URL query**（唯一真相源）⇒ 刷新天然保持，组件不另存 state。
 */
export type Venue = 'club' | 'cluster'
export type RangeKey = 'this_month' | 'last_month' | 'this_quarter' | 'custom'
export type Compare = 'mom' | 'yoy'

export interface Filters {
  venue: Venue
  range: RangeKey
  from: string
  to: string
  compare: Compare
}

export const VENUE_LABEL: Record<Venue, string> = { club: '本会所', cluster: '集团' }
export const RANGE_LABEL: Record<RangeKey, string> = {
  this_month: '本月',
  last_month: '上月',
  this_quarter: '本季度',
  custom: '自定义',
}
export const COMPARE_LABEL: Record<Compare, string> = { mom: '环比', yoy: '同比' }

export const DEFAULT_FILTERS: Filters = {
  venue: 'club',
  range: 'this_month',
  from: '2026-11-01',
  to: '2026-11-30',
  compare: 'mom',
}

export interface Permission {
  /** 能否看到「集团」维度（客户约定：会所按权限显示） */
  canViewCluster: boolean
}

export function parseFilters(search: string): Filters {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const venue = q.get('venue') === 'cluster' ? 'cluster' : 'club'
  const r = q.get('range')
  const range: RangeKey =
    r === 'last_month' || r === 'this_quarter' || r === 'custom' ? r : 'this_month'
  const compare: Compare = q.get('compare') === 'yoy' ? 'yoy' : 'mom'
  return {
    venue,
    range,
    from: q.get('from') || DEFAULT_FILTERS.from,
    to: q.get('to') || DEFAULT_FILTERS.to,
    compare,
  }
}

export function filtersToQuery(f: Filters): string {
  const q = new URLSearchParams()
  q.set('venue', f.venue)
  q.set('range', f.range)
  // from/to 始终写入（自定义范围要用；固定范围也保留上次的自定义值 ⇒ 往返幂等）
  q.set('from', f.from)
  q.set('to', f.to)
  q.set('compare', f.compare)
  return q.toString()
}

export function writeFiltersToUrl(f: Filters, win: Window = window): void {
  const url = `${win.location.pathname}?${filtersToQuery(f)}`
  win.history.replaceState({}, '', url)
}

/** 可选会所列表（按权限） */
export function venueOptions(perm: Permission): { value: Venue; label: string }[] {
  const list = [{ value: 'club' as Venue, label: VENUE_LABEL.club }]
  if (perm.canViewCluster) list.push({ value: 'cluster' as Venue, label: VENUE_LABEL.cluster })
  return list
}
