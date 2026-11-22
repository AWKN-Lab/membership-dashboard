import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CardStates } from '../shell/CardStates'
import { MetricTip } from '../shell/MetricTip'
import { BucketBar, StackedBarByFloor, TrendLine } from './charts'
import { fetchOccupancy, type CardState, type OccupancyPayload } from '../mock/api'

const SEG = {
  rented: { key: 'rented', label: '已租', color: '#0052d9' },
  reserved: { key: 'reserved', label: '预留', color: '#e37318' },
  vacant: { key: 'vacant', label: '空置', color: '#8b949e' },
}

/**
 * 出租率面板（#1896）。
 * 范围：出租率指标卡（期末值 + 环比）、12 个月趋势折线、按楼层的堆叠条形（已租/预留/空置，
 * 图例 + 条内数值标签同时标注）、到期工位分桶（30/60/90 天）、续约率趋势、
 * 点击楼层跳转房态视图（URL 带楼层参数）。接口先用 mock。
 */
export function OccupancyRatePanel({
  filters, empty = false, forceState,
}: {
  filters: { org_id: string; site_id: string; month: string }
  empty?: boolean
  forceState?: 'loading' | 'empty' | 'error'
}) {
  const [data, setData] = useState<OccupancyPayload | null>(null)
  const [state, setState] = useState<CardState>('loading')
  const navigate = useNavigate()

  useEffect(() => {
    let alive = true
    if (forceState) { setState(forceState); return () => { alive = false } }
    setState('loading')
    fetchOccupancy(filters.org_id, filters.site_id, filters.month, empty)
      .then((d) => { if (alive) { setData(d); setState(empty ? 'empty' : 'normal') } })
      .catch(() => { if (alive) setState('error') })
    return () => { alive = false }
  }, [filters.org_id, filters.site_id, filters.month, empty, forceState])

  const rows = useMemo(() => (data?.floors ?? []).map((f) => ({
    floorId: f.floorId,
    floorName: f.floorName,
    parts: [
      { ...SEG.rented, value: f.rented },
      { ...SEG.reserved, value: f.reserved },
      { ...SEG.vacant, value: f.vacant },
    ],
  })), [data])

  // 点击楼层 ⇒ 跳到房态视图路由，URL 带楼层参数
  const goFloor = (floorId: string) => {
    const q = new URLSearchParams({ org_id: filters.org_id, site_id: filters.site_id, month: filters.month })
    navigate(`/floors/${floorId}?${q.toString()}`)
  }

  return (
    <div data-testid="occupancy-panel">
      <div className="card">
        <h3 className="card__title">出租率</h3>
        <CardStates state={state}>
          <div>
            <span className="card__metric" data-testid="rate-end">
              {Number.isFinite(data?.rateEnd) ? `${data!.rateEnd.toFixed(1)}%` : '—'}
            </span>
            <span data-testid="rate-mom" style={{ marginLeft: 10, fontSize: 13, color: (data?.rateMoM ?? 0) >= 0 ? '#2ba471' : '#d54941' }}>
              环比 {Number.isFinite(data?.rateMoM) ? `${(data!.rateMoM ?? 0) >= 0 ? '+' : ''}${data!.rateMoM.toFixed(1)}pp` : '—'}
            </span>
            <MetricTip definition={data?.metricDefinition ?? ''} version={data?.metricVersion ?? ''} />
          </div>
        </CardStates>
      </div>

      <div className="card">
        <h3 className="card__title">近 12 个月出租率趋势</h3>
        <CardStates state={state}><TrendLine data={data?.trend12m ?? []} /></CardStates>
      </div>

      <div className="card">
        <h3 className="card__title">按楼层工位结构（点击楼层查看房态）</h3>
        <CardStates state={state}>
          <StackedBarByFloor rows={rows} onFloorClick={goFloor} />
        </CardStates>
      </div>

      <div className="card">
        <h3 className="card__title">到期工位分桶</h3>
        <CardStates state={state}>
          <BucketBar data={[data?.expiring.bucket30 ?? 0, data?.expiring.bucket60 ?? 0, data?.expiring.bucket90 ?? 0]}
                     labels={['30 天内', '60 天内', '90 天内']} />
        </CardStates>
      </div>

      <div className="card">
        <h3 className="card__title">续约率趋势</h3>
        <CardStates state={state}><TrendLine data={data?.renewalTrend ?? []} /></CardStates>
      </div>
    </div>
  )
}

/** 房态视图（由业务员工作台提供页面路由）—— #1896 的跳转落点，URL 带楼层参数。 */
export function FloorStateView() {
  const { floorId } = useParams()
  const [params] = useState(() => new URLSearchParams(window.location.search))
  return (
    <div className="floor-panel" data-testid="floor-view">
      <h3 className="card__title">房态视图</h3>
      <table className="mini">
        <tbody>
          <tr><th>楼层</th><td data-testid="floor-id">{floorId}</td></tr>
          <tr><th>园区</th><td>{params.get('site_id')}</td></tr>
          <tr><th>月份</th><td>{params.get('month')}</td></tr>
          <tr><th>会员空间</th><td>{params.get('org_id')}</td></tr>
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: '#6b7785' }}>对接点：房态数据由任务 3（业务员工作台）提供，当前为 mock。</p>
    </div>
  )
}
