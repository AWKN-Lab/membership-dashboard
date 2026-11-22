/**
 * 全局筛选 ⇄ URL 同步（#1851 验收第 3 条：筛选条件写入 URL，刷新后保持）。
 *
 * 实现要点：筛选状态**只存在 URL query 里**（URL 是唯一真相）⇒ 刷新天然保持，
 * 也天然可分享/可回退；组件不另存一份 state。
 */
export interface Filters {
  org_id: string
  site_id: string
  month: string
}

export const DEFAULT_FILTERS: Filters = { org_id: 'org-demo', site_id: 'site-demo-a', month: '2026-11' }

export function parseFilters(search: string): Filters {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  return {
    org_id: q.get('org_id') || DEFAULT_FILTERS.org_id,
    site_id: q.get('site_id') || DEFAULT_FILTERS.site_id,
    month: q.get('month') || DEFAULT_FILTERS.month,
  }
}

export function filtersToQuery(f: Filters): string {
  const q = new URLSearchParams()
  q.set('org_id', f.org_id)
  q.set('site_id', f.site_id)
  q.set('month', f.month)
  return q.toString()
}

export function writeFiltersToUrl(f: Filters, win: Window = window): void {
  const url = `${win.location.pathname}?${filtersToQuery(f)}`
  win.history.replaceState({}, '', url)
}
