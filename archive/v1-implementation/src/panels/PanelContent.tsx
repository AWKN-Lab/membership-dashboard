import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Filters } from '../shell/filters'
import { fetchPanelData, mockPermission, type PanelData, type Permission } from '../mock/api'
import { EChart } from '../charts/EChart'
import {
  occupancyStackedOption,
  trendLineOption,
  bucketBarOption,
  funnelOption,
  groupedBarOption,
} from '../charts/options'
import { tokens } from '../design/tokens'

export type PanelStatus = 'loading' | 'normal' | 'empty' | 'error'

export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const csv = [header.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function usePanelData(panelId: string, filters: Filters, perm: Permission) {
  const [data, setData] = useState<PanelData | null>(null)
  const [status, setStatus] = useState<PanelStatus>('loading')
  useEffect(() => {
    let alive = true
    setStatus('loading')
    fetchPanelData(panelId, filters, perm)
      .then((d) => {
        if (!alive) return
        setData(d)
        setStatus('normal')
      })
      .catch(() => alive && setStatus('error'))
    return () => {
      alive = false
    }
  }, [panelId, filters, perm])
  return { data, status }
}

export function PanelContent({
  panelId,
  filters,
  forceState,
}: {
  panelId: string
  filters: Filters
  forceState?: PanelStatus
}) {
  const navigate = useNavigate()
  const perm = useMemo(() => mockPermission(''), [])
  const { data, status } = usePanelData(panelId, filters, perm)
  const effective: PanelStatus = forceState ?? status
  const cmp = filters.compare === 'yoy' ? '同比' : '环比'

  if (effective === 'loading') return <div className="state-loading" data-testid="card-loading">加载中…</div>
  if (effective === 'error')
    return (
      <div className="state-error" data-testid="card-error">
        数据加载失败，请稍后重试
      </div>
    )
  if (effective === 'empty')
    return <div className="state-empty" data-testid="card-empty">暂无数据</div>

  switch (panelId) {
    case 'key-metrics':
      return (
        <div className="tiles" data-testid="panel-key-metrics">
          {data?.keyMetrics?.map((m) => (
            <div className="tile" key={m.key} data-testid={`tile-${m.key}`}>
              <span className="tile__name">{m.name}</span>
              <span className="tile__value" data-testid={`value-${m.key}`}>
                {m.value}
              </span>
              <span className="tile__cmp" data-testid={`cmp-${m.key}`}>
                {`${m.compareLabel} ${m.compareValue}`}
              </span>
            </div>
          ))}
        </div>
      )
    case 'network': {
      const rows = data?.network ?? []
      const option = groupedBarOption(
        rows.map((r) => r.name),
        [{ name: '会员数', data: rows.map((r) => r.value), color: tokens.color.brand }],
      )
      return <EChart option={option} testId="chart-network" />
    }
    case 'funnel': {
      const stages = data?.funnel ?? []
      return <EChart option={funnelOption(stages)} testId="chart-funnel" />
    }
    case 'occupancy': {
      const o = data?.occupancy
      if (!o) return <div className="state-empty" data-testid="card-empty">暂无数据</div>
      const goFloor = (floorId: string) => {
        const q = new URLSearchParams({
          venue: filters.venue,
          range: filters.range,
          compare: filters.compare,
        })
        navigate(`/floors/${floorId}?${q.toString()}`)
      }
      return (
        <div data-testid="panel-occupancy">
          <div className="metric-row">
            <span className="card__metric" data-testid="rate-end">
              {`${o.rateEnd.toFixed(1)}%`}
            </span>
            <span className="metric-cmp" data-testid="rate-mom">
              {`${cmp} ${o.rateMoM >= 0 ? '+' : ''}${o.rateMoM.toFixed(1)}pp`}
            </span>
            <span className="metric-note" data-testid="metric-definition">
              {`口径 v1.2：出租率 = 已租工位 ÷ 可租工位（期末值）；${cmp} = 本月末 − 上月末（百分点）`}
            </span>
          </div>
          <h4 className="sub-title">近 12 个月出租率趋势</h4>
          <EChart
            option={trendLineOption(o.trendMonths, o.trendRates, '出租率')}
            testId="chart-trend"
            height={220}
          />
          <h4 className="sub-title">按楼层工位结构（点击楼层查看房态）</h4>
          <EChart
            option={occupancyStackedOption(o.floors)}
            testId="chart-stacked"
            height={240}
          />
          <div className="legend-note" data-testid="stack-legend">
            图例：已租 / 预留 / 空置（条内同时标注数值）
          </div>
          <h4 className="sub-title">到期工位分桶</h4>
          <EChart
            option={bucketBarOption(['30 天内', '60 天内', '90 天内'], [o.bucket30, o.bucket60, o.bucket90])}
            testId="chart-bucket"
            height={180}
          />
          <h4 className="sub-title">续约率趋势</h4>
          <EChart
            option={trendLineOption(o.renewalMonths, o.renewalRates, '续约率')}
            testId="chart-renewal"
            height={200}
          />
          <FloorLinks floors={o.floors} onFloorClick={goFloor} />
        </div>
      )
    }
    case 'member-success': {
      const m = data?.memberSuccess
      if (!m) return <div className="state-empty" data-testid="card-empty">暂无数据</div>
      return (
        <EChart
          option={groupedBarOption(m.months, [
            { name: '新签会员', data: m.signed, color: tokens.color.brand },
            { name: '成功会员', data: m.success, color: tokens.color.positive },
          ])}
          testId="chart-member-success"
        />
      )
    }
    case 'org-agent': {
      const rows = data?.orgAgent ?? []
      return (
        <div data-testid="panel-org-agent">
          <EChart
            option={groupedBarOption(
              rows.map((r) => r.org),
              [
                { name: '跟进覆盖率(%)', data: rows.map((r) => r.coverage), color: tokens.color.brand },
                { name: 'Agent 处理占比(%)', data: rows.map((r) => r.agentShare), color: tokens.color.reserved },
              ],
            )}
            testId="chart-org-agent"
          />
          <table className="mini-table" data-testid="table-org-agent">
            <thead>
              <tr><th>组织</th><th>业务员</th><th>跟进覆盖率</th><th>Agent 占比</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.org}>
                  <td>{r.org}</td><td>{r.staff}</td><td>{`${r.coverage}%`}</td><td>{`${r.agentShare}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    case 'finance-contract': {
      const f = data?.contractAmount
      if (!f) return <div className="state-empty" data-testid="card-empty">暂无数据</div>
      return (
        <EChart
          option={groupedBarOption(f.months, [{ name: '签约额(元)', data: f.values, color: tokens.color.brand }])}
          testId="chart-finance-contract"
        />
      )
    }
    case 'finance-revenue': {
      const f = data?.membershipRevenue
      if (!f) return <div className="state-empty" data-testid="card-empty">暂无数据</div>
      return (
        <EChart
          option={groupedBarOption(f.months, [{ name: '会籍收入(元)', data: f.values, color: tokens.color.positive }])}
          testId="chart-finance-revenue"
        />
      )
    }
    default:
      return <div className="state-empty" data-testid="card-empty">暂无数据</div>
  }
}

/** 楼层可点击入口（与图表段共用 goFloor；ECharts 图形点击另由 option 绑定） */
function FloorLinks({
  floors,
  onFloorClick,
}: {
  floors: { floorId: string; floorName: string }[]
  onFloorClick: (floorId: string) => void
}) {
  return (
    <div className="floor-links" data-testid="floor-links">
      {floors.map((f) => (
        <button
          key={f.floorId}
          type="button"
          className="floor-links__item"
          data-testid={`floor-link-${f.floorId}`}
          onClick={() => onFloorClick(f.floorId)}
        >
          {f.floorName}
        </button>
      ))}
    </div>
  )
}
