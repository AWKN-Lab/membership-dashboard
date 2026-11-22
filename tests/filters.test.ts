import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS, filtersToQuery, parseFilters } from '../src/shell/filters'

describe('全局筛选写入 URL 且刷新后保持（#1851 验收第 3 条）', () => {
  it('parse: 缺失参数回落到默认值', () => {
    expect(parseFilters('')).toEqual(DEFAULT_FILTERS)
    expect(parseFilters('?org_id=org-x')).toEqual({ ...DEFAULT_FILTERS, org_id: 'org-x' })
  })

  it('parse: 三个参数都能读回来', () => {
    const q = '?org_id=org-2&site_id=site-b&month=2026-03'
    expect(parseFilters(q)).toEqual({ org_id: 'org-2', site_id: 'site-b', month: '2026-03' })
  })

  it('filtersToQuery: 写出的 query 再 parse 回来完全一致（幂等往返）', () => {
    const f = { org_id: 'o', site_id: 's', month: '2026-05' }
    expect(parseFilters('?' + filtersToQuery(f))).toEqual(f)
  })

  it('filtersToQuery: 三个键都出现', () => {
    const q = filtersToQuery(DEFAULT_FILTERS)
    expect(q).toContain('org_id=')
    expect(q).toContain('site_id=')
    expect(q).toContain('month=')
  })
})
