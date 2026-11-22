import { useMemo } from 'react'
import { useLocation, useNavigate, useParams, Route, Routes } from 'react-router-dom'
import { TABS, DEFAULT_TAB, isTab } from './shell/tabs'
import { PANELS, panelsOfTab, type PanelDef } from './shell/panelRegistry'
import {
  parseFilters,
  filtersToQuery,
  venueOptions,
  RANGE_LABEL,
  COMPARE_LABEL,
  type Filters,
  type RangeKey,
  type Compare,
  type Venue,
} from './shell/filters'
import { CardFrame } from './shell/CardFrame'
import { PanelContent, downloadCsv, type PanelStatus } from './panels/PanelContent'
import { mockPermission } from './mock/api'

function useQuery() {
  const location = useLocation()
  return useMemo(() => new URLSearchParams(location.search), [location.search])
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const q = useQuery()
  const tabKey = q.get('tab') ?? DEFAULT_TAB
  const tab = isTab(tabKey) ? tabKey : DEFAULT_TAB
  const filters = useMemo(() => parseFilters(location.search), [location.search])
  const perm = mockPermission(location.search)
  const forced = q.get('state')
  const forceState: PanelStatus | undefined =
    forced === 'loading' || forced === 'empty' || forced === 'error' ? forced : undefined

  /** 改筛选：写回 URL（保留 tab / state / perm 等其余参数）⇒ 刷新后保持 */
  function updateFilters(patch: Partial<Filters>) {
    const next = { ...filters, ...patch }
    const merged = new URLSearchParams(filtersToQuery(next))
    for (const k of ['tab', 'state', 'perm']) {
      const v = q.get(k)
      if (v) merged.set(k, v)
    }
    navigate({ pathname: location.pathname, search: merged.toString() })
  }

  function gotoTab(key: string) {
    const merged = new URLSearchParams(location.search)
    merged.set('tab', key)
    navigate({ pathname: location.pathname, search: merged.toString() })
  }

  return (
    <div className="shell">
      <header className="shell__header">
        <span className="shell__title">管理驾驶舱</span>
        <span className="shell__sub">会员空间平台 · Stage iii（演示数据）</span>
      </header>
      <div className="shell__body">
        <nav className="sidebar" data-testid="tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={t.key === tab ? 'sidebar__item sidebar__item--active' : 'sidebar__item'}
              data-testid={`tab-${t.key}`}
              onClick={() => gotoTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <main className="main">
          <div className="filters" data-testid="filters">
            <label className="filters__field">
              会所
              <select
                data-testid="filter-venue"
                value={filters.venue}
                onChange={(e) => updateFilters({ venue: e.target.value as Venue })}
              >
                {venueOptions(perm).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="filters__field">
              时间范围
              <select
                data-testid="filter-range"
                value={filters.range}
                onChange={(e) => updateFilters({ range: e.target.value as RangeKey })}
              >
                {(Object.keys(RANGE_LABEL) as RangeKey[]).map((k) => (
                  <option key={k} value={k}>
                    {RANGE_LABEL[k]}
                  </option>
                ))}
              </select>
            </label>
            {filters.range === 'custom' && (
              <>
                <label className="filters__field">
                  起
                  <input
                    data-testid="filter-from"
                    value={filters.from}
                    onChange={(e) => updateFilters({ from: e.target.value })}
                  />
                </label>
                <label className="filters__field">
                  止
                  <input
                    data-testid="filter-to"
                    value={filters.to}
                    onChange={(e) => updateFilters({ to: e.target.value })}
                  />
                </label>
              </>
            )}
            <label className="filters__field">
              对比方式
              <select
                data-testid="filter-compare"
                value={filters.compare}
                onChange={(e) => updateFilters({ compare: e.target.value as Compare })}
              >
                {(Object.keys(COMPARE_LABEL) as Compare[]).map((k) => (
                  <option key={k} value={k}>
                    {COMPARE_LABEL[k]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {panelsOfTab(tab).map((p) => (
            <PanelCard key={p.id} panel={p} filters={filters} forceState={forceState} />
          ))}
        </main>
      </div>
    </div>
  )
}

function PanelCard({
  panel,
  filters,
  forceState,
}: {
  panel: PanelDef
  filters: Filters
  forceState?: PanelStatus
}) {
  return (
    <CardFrame
      title={panel.title}
      metricKey={panel.metricKey}
      updatedAt={panel.updatedAt}
      onExport={
        panel.exportColumns
          ? () => downloadCsv(`${panel.id}.csv`, panel.exportColumns!, [])
          : undefined
      }
    >
      <PanelContent panelId={panel.id} filters={filters} forceState={forceState} />
    </CardFrame>
  )
}

/** 房态视图（由业务员工作台提供页面路由，带楼层参数）—— 本仓只做路由与参数透传 */
export function FloorView() {
  const { floorId } = useParams()
  const q = useQuery()
  return (
    <div className="shell">
      <header className="shell__header">
        <span className="shell__title">房态视图</span>
        <span className="shell__sub">楼层参数：{floorId}</span>
      </header>
      <div className="shell__body">
        <div className="main">
          <div className="card">
            <div data-testid="floor-view">
              {`${floorId}|${q.get('venue')}|${q.get('range')}|${q.get('compare')}`}
            </div>
            <p className="muted">
              房态视图的真实数据由业务员工作台（任务 3）提供；本仓按客户约定只负责「带楼层参数的路由」。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/dash" element={<App />} />
      <Route path="/floors/:floorId" element={<FloorView />} />
    </Routes>
  )
}
