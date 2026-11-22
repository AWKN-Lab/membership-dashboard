import { useEffect, useMemo, useState } from 'react'
import { useNavigate,useLocation } from 'react-router-dom'
import { filtersToQuery,parseFilters,type Filters } from '../shell/filters'
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

export {downloadCsv} from './export'
type DataResult={key:string;data:PanelData|null;status:PanelStatus}
export function usePanelData(panelId:string,filters:Filters,perm:Permission,forced?:PanelStatus){
 const key=panelId+'|'+filtersToQuery(filters)+'|'+String(perm.canViewCluster)+'|'+(forced||'')
 const [result,setResult]=useState<DataResult>({key:'',data:null,status:'loading'})
 useEffect(()=>{
   let alive=true
   if(forced&&forced!=='normal'){setResult({key,data:null,status:forced});return()=>{alive=false}}
   setResult({key,data:null,status:'loading'})
   fetchPanelData(panelId,filters,perm).then(data=>{
     if(alive)setResult({key,data,status:hasData(data)?'normal':'empty'})
   }).catch(()=>{if(alive)setResult({key,data:null,status:'error'})})
   return()=>{alive=false}
 },[key])
 return result.key===key?result:{key,data:null,status:'loading' as const}
}
function hasData(data:PanelData):boolean{
 return Boolean(data.occupancy?.floors.length||data.keyMetrics?.length||data.network?.length||data.funnel?.length||data.memberSuccess?.months.length||data.orgAgent?.length||data.contractAmount?.months.length||data.membershipRevenue?.months.length)
}
export function PanelContent({panelId,filters,forceState,permission}:{panelId:string;filters:Filters;forceState?:PanelStatus;permission?:Permission}){
 const location=useLocation()
 const perm=useMemo(()=>permission??mockPermission(location.search),[permission,location.search])
 const safe=useMemo(()=>parseFilters(filtersToQuery(filters),perm),[filters,perm])
 const {data,status}=usePanelData(panelId,safe,perm,forceState)
 const effective=forceState??status
 if(effective==='loading')return <div className="state-loading" data-testid="card-loading">加载中…</div>
 if(effective==='error')return <div className="state-error" data-testid="card-error">数据加载失败，请稍后重试</div>
 if(effective==='empty'||!data)return <div className="state-empty" data-testid="card-empty">暂无数据</div>
 return <PanelBody panelId={panelId} filters={safe} perm={perm} data={data}/>
}
export function PanelBody({panelId,filters,perm,data}:{panelId:string;filters:Filters;perm:Permission;data:PanelData}){
 const navigate=useNavigate(),location=useLocation()
 const cmp=filters.compare==='yoy'?'同比':'环比'
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
      const goFloor=(floorId:string)=>{
        const q=new URLSearchParams(filtersToQuery(filters,location.search))
        // Keep demo permission and full date range; never forward state override.
        q.delete('state');q.delete('tab')
        if(!perm.canViewCluster){q.set('venue','club');q.set('perm','club')}
        navigate('/floors/'+encodeURIComponent(floorId)+'?'+q.toString())
      }
      const rateDelta=filters.compare==='yoy'?o.rateYoY:o.rateMoM
      return (
        <div data-testid="panel-occupancy">
          <div className="metric-row">
            <span className="card__metric" data-testid="rate-end">
              {`${o.rateEnd.toFixed(1)}%`}
            </span>
            <span className="metric-cmp" data-testid="rate-mom">
              {`${cmp} ${rateDelta >= 0 ? '+' : ''}${rateDelta.toFixed(1)}pp`}
            </span>
            <span className="metric-note" data-testid="metric-definition">
              {`口径 v1.2：出租率 = 已租工位 ÷ 可租工位（期末值）；${cmp} = 本期末 − ${filters.compare==='yoy'?'上年同期':'上月同期'}（百分点）`}
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
            onSeriesClick={i=>{if(o.floors[i])goFloor(o.floors[i].floorId)}}
            testId="chart-stacked"
            height={240}
          />
          <div className="legend-note" data-testid="stack-legend">
            图例：已租 / 预留 / 空置（条内同时标注数值）
          </div>
          <h4 className="sub-title">到期工位分桶</h4>
          <EChart
            option={bucketBarOption(['0–30 天', '31–60 天', '61–90 天'], [o.bucket30, o.bucket60, o.bucket90])}
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
