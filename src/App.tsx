import React, { useEffect, useMemo, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { CardStates } from './shell/CardStates'
import { MetricTip } from './shell/MetricTip'
import { TABS } from './shell/tabs'
import { DEFAULT_FILTERS, filtersToQuery, parseFilters, writeFiltersToUrl, type Filters } from './shell/filters'
import { FloorStateView, OccupancyRatePanel } from './panel/OccupancyRatePanel'
import { ORGS, SITES } from './mock/api'

/**
 * 驾驶舱前端外壳（#1851）+ 出租率面板（#1896）。
 * 筛选与页签**只存在 URL 里** ⇒ 刷新后保持（验收第 3 条）。
 */
export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>(() => parseFilters(window.location.search))
  // empty 是**演示开关**（写进 URL ⇒ 截图可复现）：?empty=1
  // ⚠️ 真相源统一用**路由的 location**（不是 window.location）⇒ 测试与浏览器行为一致
  const urlEmpty = new URLSearchParams(location.search).get('empty') === '1'
  const [emptyOverride, setEmptyOverride] = useState<boolean | null>(null)
  const empty = emptyOverride === null ? urlEmpty : emptyOverride

  // URL → 状态（刷新/前进后退都跟着走）
  useEffect(() => {
    setFilters(parseFilters(location.search))
    // 页签与筛选**都只存在 URL 里** ⇒ 刷新天然保持；这里不要改写 URL（会把 tab 抹掉）
  }, [location.search, navigate])

  const tab = useMemo(() => {
    const t = new URLSearchParams(location.search).get('tab')
    return t && TABS.some((x) => x.key === t) ? t : TABS[0].key
  }, [location.search])

  const setFilter = (patch: Partial<Filters>) => {
    const next = { ...filters, ...patch }
    setFilters(next)
    writeFiltersToUrl(next)
  }

  const setTab = (key: string) => {
    const q = new URLSearchParams(filtersToQuery(filters))
    q.set('tab', key)
    navigate(`/?${q.toString()}`)
  }

  const forceState = (() => {
    const v = new URLSearchParams(location.search).get('state')
    return v === 'loading' || v === 'empty' || v === 'error' ? v : undefined
  })()

  const isFloorRoute = location.pathname.startsWith('/floors/')

  return (
    <div className="shell">
      <header className="shell__header">
        <span className="shell__title">管理驾驶舱</span>
        <span style={{ fontSize: 12, opacity: .85 }}>会员空间平台 · Stage iii（演示数据）</span>
      </header>
      <div className="shell__body">
        {!isFloorRoute && (
          <nav className="sidebar" data-testid="tabs">
            {TABS.map((t) => (
              <div key={t.key}
                   data-testid={`tab-${t.key}`}
                   className={`sidebar__item${tab === t.key ? ' sidebar__item--active' : ''}`}
                   onClick={() => setTab(t.key)}>{t.label}</div>
            ))}
          </nav>
        )}
        <main className="content">
          <Routes>
            <Route path="/floors/:floorId" element={<FloorStateView />} />
            <Route path="*" element={
              <>
                <div className="filters" data-testid="filters">
                  <label className="filters__field">会员空间
                    <select data-testid="filter-org" value={filters.org_id}
                            onChange={(e) => setFilter({ org_id: e.target.value })}>
                      {ORGS.map((o) => <option key={o.orgId} value={o.orgId}>{o.name}</option>)}
                      {!ORGS.some((o) => o.orgId === filters.org_id) &&
                        <option value={filters.org_id}>{filters.org_id}（URL 指定）</option>}
                    </select>
                  </label>
                  <label className="filters__field">园区
                    <select data-testid="filter-site" value={filters.site_id}
                            onChange={(e) => setFilter({ site_id: e.target.value })}>
                      {SITES.map((s) => <option key={s.siteId} value={s.siteId}>{s.name}</option>)}
                      {!SITES.some((x) => x.siteId === filters.site_id) &&
                        <option value={filters.site_id}>{filters.site_id}（URL 指定）</option>}
                    </select>
                  </label>
                  <label className="filters__field">月份
                    <input data-testid="filter-month" value={filters.month}
                           onChange={(e) => setFilter({ month: e.target.value })} />
                  </label>
                  <label className="filters__field">状态演示
                    <select data-testid="filter-state" value={empty ? 'empty' : 'normal'}
                            onChange={(e) => setEmptyOverride(e.target.value === 'empty')}>
                      <option value="normal">有数据</option>
                      <option value="empty">空数据</option>
                    </select>
                  </label>
                </div>

                {tab === 'occupancy' ? (
                  <OccupancyRatePanel filters={filters} empty={empty} forceState={forceState} />
                ) : (
                  <div className="card">
                    <h3 className="card__title">{TABS.find((t) => t.key === tab)?.label}</h3>
                    <CardStates state={empty ? 'empty' : 'normal'}>
                      <MetricTip definition="本页指标的口径说明" version="v1.2" />
                      <p style={{ fontSize: 13, color: '#4b5563' }}>
                        该页签在任务 1/5 的范围内仅提供外壳与口径提示；具体面板见「出租率」页签。
                      </p>
                    </CardStates>
                  </div>
                )}
              </>
            } />
          </Routes>
        </main>
      </div>
    </div>
  )
}
