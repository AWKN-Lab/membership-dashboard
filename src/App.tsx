import React, { useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Button from 'tdesign-react/es/button'
import { TABS, type TabKey } from './shell/tabs'
import { DEMO_ACCESS, filtersToQuery, occupancyFilters, parseFilters, updateFilter, type Access, type Filters, type Period } from './shell/filters'
import { panelsFor } from './shell/panels'
import { PanelCard } from './shell/PanelCard'
import { FloorStateView, OccupancyRatePanel } from './panel/OccupancyRatePanel'

function Dashboard({access}:{access:Access}){
 const location=useLocation(),navigate=useNavigate()
 const f=parseFilters(location.search,access)
 const todayUtc=new Date().toISOString().slice(0,10)
 const q=new URLSearchParams(location.search)
 const tab=(TABS.find(t=>t.key===q.get('tab'))?.key||'overview') as TabKey
 const state=q.get('state')
 const forced=state==='loading'||state==='empty'||state==='error'?state:undefined
 const empty=q.get('empty')==='1'
 const [start,setStart]=useState(f.start),[end,setEnd]=useState(f.end)
 // 自定义日期草稿仅在提交时进入 URL。history/popstate 由 router 处理。
 React.useEffect(()=>{setStart(f.start);setEnd(f.end)},[f.start,f.end])
 const path=(next:Filters,tabKey:TabKey=tab)=> {
   const params=new URLSearchParams(filtersToQuery(next,location.search));params.set('tab',tabKey)
   navigate('/dash?'+params.toString())
 }
 // 首次访问将筛选锚定到 URL；越权 group 在 URL 层也被清除。
 React.useEffect(()=>{
   const params=new URLSearchParams(filtersToQuery(f,location.search));params.set('tab',tab)
   const search='?'+params.toString()
   if(search!==location.search)navigate('/dash'+search,{replace:true})
 },[location.search,access.siteId,access.canViewGroup])
 const set=(patch:Partial<Filters>)=>path(updateFilter(f,patch,access))
 return <div className="shell">
  <header className="shell__header"><span className="shell__title">管理驾驶舱</span><span>虚构演示数据 · 接口桩</span></header>
  <div className="shell__body"><nav className="sidebar" aria-label="驾驶舱页签" data-testid="tabs">
   {TABS.map(t=><button type="button" key={t.key} data-testid={'tab-'+t.key} aria-current={tab===t.key?'page':undefined} className={'sidebar__item'+(tab===t.key?' sidebar__item--active':'')} onClick={()=>path(f,t.key)}>{t.label}</button>)}
  </nav><main className="content">
  <div className="filters" data-testid="filters">
   <label className="filters__field">会所<select aria-label="会所" value={f.scope} onChange={e=>set({scope:e.target.value==='group'?'group':'site'})}><option value="site">本会所</option>{access.canViewGroup&&<option value="group">集团</option>}</select></label>
   <label className="filters__field">时间范围<select aria-label="时间范围" value={f.period} onChange={e=>set({period:e.target.value as Period})}><option value="this-month">本月</option><option value="last-month">上月</option><option value="this-quarter">本季度</option><option value="custom">自定义</option></select></label>
   {f.period==='custom'?<><label className="filters__field">开始<input type="date" value={start} onChange={e=>setStart(e.target.value)}/></label><label className="filters__field">结束<input type="date" value={end} onChange={e=>setEnd(e.target.value)}/></label><Button disabled={!start||!end||start>end} onClick={()=>set({start,end})}>应用</Button></>:<span className="date-range">{f.start} 至 {f.end}</span>}
   <label className="filters__field">对比方式<select aria-label="对比方式" value={f.comparison} onChange={e=>set({comparison:e.target.value==='yoy'?'yoy':'mom'})}><option value="mom">环比</option><option value="yoy">同比</option></select></label>
  </div>
  {panelsFor(tab).map(p=>p.kind==='occupancy'?<OccupancyRatePanel key={p.id} filters={occupancyFilters(f,access)} asOf={f.end<todayUtc?f.end:todayUtc} comparison={f.comparison} empty={empty} forceState={forced} canExport={access.canExport===true}/>:<PanelCard key={p.id} meta={p} state={forced||'empty'} canExport={access.canExport===true} />)}
  </main></div>
 </div>
}
export default function App({access=DEMO_ACCESS}:{access?:Access}){
 const l=useLocation()
 return <Routes><Route path="/dash" element={<Dashboard access={access}/>}/><Route path="/floors/:floorId" element={<FloorStateView/>}/><Route path="*" element={<Navigate to={'/dash'+l.search} replace/>}/></Routes>
}
