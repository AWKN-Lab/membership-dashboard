import React,{useEffect,useState} from 'react'
import {useNavigate,useParams,useLocation} from 'react-router-dom'
import {PanelCard,type PanelMeta} from '../shell/PanelCard'
import {TrendLine,StackedBarByFloor,BucketBar} from './charts'
import {fetchOccupancy,mockOccupancy,type OccupancyPayload,type CardState} from '../mock/api'
const SEG=[{key:'rented',label:'已租',color:'--dash-chart-primary'},{key:'reserved',label:'预留',color:'--dash-chart-reserved'},{key:'vacant',label:'空置',color:'--dash-chart-vacant'}] as const
const metric=(title:string,definition:string,version='v1.2'):PanelMeta=>({title,definition,version})
export function OccupancyRatePanel({filters,asOf,comparison='mom',empty=false,forceState,canExport=false}:{
 filters:{org_id:string;site_id:string;month:string};asOf?:string;comparison?:'mom'|'yoy';empty?:boolean;forceState?:'loading'|'empty'|'error';canExport?:boolean
}){
 const [data,setData]=useState<OccupancyPayload|null>(null),[state,setState]=useState<CardState>('loading'),[attempt,retry]=useState(0)
 const navigate=useNavigate()
 useEffect(()=>{
  let alive=true;setData(null)
  if(forceState){setState(forceState);return()=>{alive=false}}
  setState('loading')
  fetchOccupancy(filters.org_id,filters.site_id,filters.month,empty,asOf).then(d=>{if(alive){setData(d);setState(empty?'empty':'normal')}}).catch(()=>{if(alive)setState('error')})
  return()=>{alive=false}
 },[filters.org_id,filters.site_id,filters.month,empty,forceState,attempt,asOf])
 const rows=(data?.floors||[]).map(f=>({floorId:f.floorId,floorName:f.floorName,parts:SEG.map(s=>({...s,value:f[s.key]}))}))
 const goFloor=(floorId:string)=>{const q=new URLSearchParams(filters);navigate('/floors/'+encodeURIComponent(floorId)+'?'+q.toString())}
 const actualAsOf=state==='normal'?data?.dataAsOf:undefined
 const props={state,asOf:actualAsOf,canExport,onRetry:()=>retry(a=>a+1)}
 const yr=Number(filters.month.slice(0,4))-1
 const priorYear=mockOccupancy(filters.org_id,filters.site_id,String(yr)+filters.month.slice(4),false,asOf?String(yr)+asOf.slice(4):undefined).rateEnd
 const yoy=data?data.rateEnd-priorYear:0
 return <div data-testid="occupancy-panel">
  <PanelCard {...props} meta={metric('出租率','已租工位 ÷ 可租工位（期末值）；环比 = 本期末 − 上期末（百分点）')} exportRows={data?[['指标','数值'],['期末出租率',data.rateEnd],['环比',data.rateMoM],['同比',yoy.toFixed(1)]]:undefined}>
   <span className="card__metric" data-testid="rate-end">{data?.rateEnd.toFixed(1)}%</span>
   <span data-testid="rate-mom"> 环比 {data?.rateMoM.toFixed(1)}pp</span>
   {comparison==='yoy'&&<span data-testid="rate-yoy"> 同比 {yoy.toFixed(1)}pp</span>}
  </PanelCard>
  <PanelCard {...props} meta={metric('近 12 个月出租率趋势','每月末出租率（%）')} exportRows={data?[['月份','出租率'],...data.trend12m.map(d=>[d.month,d.rate])]:undefined}><TrendLine data={data?.trend12m||[]}/></PanelCard>
  <PanelCard {...props} meta={metric('按楼层工位结构','已租、预留、空置工位数互斥')} exportRows={data?[['楼层','已租','预留','空置'],...data.floors.map(f=>[f.floorName,f.rented,f.reserved,f.vacant])]:undefined}><StackedBarByFloor rows={rows} onFloorClick={goFloor}/></PanelCard>
  <PanelCard {...props} meta={metric('到期工位分桶','到期日距离统计时点：0–30、31–60、61–90 天')} exportRows={data?[['区间','工位数'],['0–30',data.expiring.bucket30],['31–60',data.expiring.bucket60],['61–90',data.expiring.bucket90]]:undefined}><BucketBar data={[data?.expiring.bucket30||0,data?.expiring.bucket60||0,data?.expiring.bucket90||0]} labels={['0–30 天','31–60 天','61–90 天']}/></PanelCard>
  <PanelCard {...props} meta={metric('续约率趋势','每月续约率（%），演示口径')} exportRows={data?[['月份','续约率'],...data.renewalTrend.map(d=>[d.month,d.rate])]:undefined}><TrendLine data={data?.renewalTrend||[]}/></PanelCard>
 </div>
}
export function FloorStateView(){
 const {floorId}=useParams(),{search}=useLocation(),q=new URLSearchParams(search)
 return <div className="floor-panel" data-testid="floor-view"><h3>房态视图（接口桩）</h3><p data-testid="floor-id">{floorId}</p><p>{q.get('site_id')} · {q.get('month')}</p><p>业务员工作台房态路由对接点：/floors/:floorId</p></div>
}
