import {useEffect,useMemo,useState} from 'react'
import {useLocation,useNavigate,useParams,Route,Routes} from 'react-router-dom'
import Button from 'tdesign-react/es/button'
import {TABS,DEFAULT_TAB,isTab} from './shell/tabs'
import {panelsOfTab,type PanelDef} from './shell/panelRegistry'
import {parseFilters,filtersToQuery,venueOptions,updateFilter,validRange,RANGE_LABEL,COMPARE_LABEL,type Filters,type RangeKey,type Compare,type Venue,type Permission} from './shell/filters'
import {CardFrame} from './shell/CardFrame'
import {PanelBody,usePanelData,type PanelStatus} from './panels/PanelContent'
import {downloadCsv,panelExportRows} from './panels/export'
import {mockPermission} from './mock/api'
function useQuery(){const l=useLocation();return useMemo(()=>new URLSearchParams(l.search),[l.search])}
export default function App({permission}:{permission?:Permission}={}){
 const location=useLocation(),navigate=useNavigate(),q=useQuery()
 const tabKey=q.get('tab')??DEFAULT_TAB,tab=isTab(tabKey)?tabKey:DEFAULT_TAB
 // Demo permission can be injected by the host; query switch only simulates roles.
 const role=q.get('perm')
 const perm=useMemo(()=>permission??mockPermission(role==='club'?'?perm=club':''),[permission,role])
 const filters=useMemo(()=>parseFilters(location.search,perm),[location.search,perm])
 const forced=q.get('state')
 const forceState:PanelStatus|undefined=forced==='loading'||forced==='empty'||forced==='error'?forced:undefined
 const [from,setFrom]=useState(filters.from),[to,setTo]=useState(filters.to)
 useEffect(()=>{setFrom(filters.from);setTo(filters.to)},[filters.from,filters.to])
 const canonical=filtersToQuery(filters,location.search)
 useEffect(()=>{
   if('?'+canonical!==location.search)navigate({pathname:location.pathname,search:canonical},{replace:true})
 },[canonical,location.pathname,location.search,navigate])
 function updateFilters(patch:Partial<Filters>){
   const next=updateFilter(filters,patch,perm)
   navigate({pathname:location.pathname,search:filtersToQuery(next,location.search)})
 }
 function gotoTab(key:string){const merged=new URLSearchParams(canonical);merged.set('tab',key);navigate({pathname:location.pathname,search:merged.toString()})}
 return <div className="shell">
  <header className="shell__header"><span className="shell__title">管理驾驶舱</span><span className="shell__sub">会员空间平台 · Stage iii（演示数据）</span></header>
  <div className="shell__body"><nav className="sidebar" data-testid="tabs" aria-label="驾驶舱页签">
   {TABS.map(t=><button key={t.key} type="button" aria-current={t.key===tab?'page':undefined} className={t.key===tab?'sidebar__item sidebar__item--active':'sidebar__item'} data-testid={'tab-'+t.key} onClick={()=>gotoTab(t.key)}>{t.label}</button>)}
  </nav><main className="main">
   <div className="filters" data-testid="filters">
    <label className="filters__field">会所<select aria-label="会所" data-testid="filter-venue" value={filters.venue} onChange={e=>updateFilters({venue:e.target.value as Venue})}>{venueOptions(perm).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
    <label className="filters__field">时间范围<select aria-label="时间范围" data-testid="filter-range" value={filters.range} onChange={e=>updateFilters({range:e.target.value as RangeKey})}>{(Object.keys(RANGE_LABEL) as RangeKey[]).map(k=><option key={k} value={k}>{RANGE_LABEL[k]}</option>)}</select></label>
    {filters.range==='custom'?<><label className="filters__field">起<input type="date" aria-label="起始日期" data-testid="filter-from" value={from} onChange={e=>setFrom(e.target.value)}/></label><label className="filters__field">止<input type="date" aria-label="结束日期" data-testid="filter-to" value={to} onChange={e=>setTo(e.target.value)}/></label><Button tag="button" data-testid="filter-apply" size="small" disabled={!validRange(from,to)} onClick={()=>updateFilters({from,to})}>应用</Button>{!validRange(from,to)&&<span role="alert">请填写有效起止日期</span>}</>:<span className="filter-dates" data-testid="filter-dates">{filters.from} 至 {filters.to}</span>}
    <label className="filters__field">对比方式<select aria-label="对比方式" data-testid="filter-compare" value={filters.compare} onChange={e=>updateFilters({compare:e.target.value as Compare})}>{(Object.keys(COMPARE_LABEL) as Compare[]).map(k=><option key={k} value={k}>{COMPARE_LABEL[k]}</option>)}</select></label>
   </div>
   {panelsOfTab(tab).map(p=><PanelCard key={p.id} panel={p} filters={filters} perm={perm} forceState={forceState}/>)}
  </main></div>
 </div>
}
function PanelCard({panel,filters,perm,forceState}:{panel:PanelDef;filters:Filters;perm:Permission;forceState?:PanelStatus}){
 const {data,status}=usePanelData(panel.id,filters,perm,forceState)
 const state=forceState??status
 const rows=data&&state==='normal'?panelExportRows(panel.id,data,filters):[]
 return <CardFrame title={panel.title} metricKey={panel.metricKey} updatedAt={state==='normal'?filters.to+'（演示）':'—'} state={state}
 exportDisabled={state!=='normal'||!rows.length}
 onExport={panel.exportColumns?()=>{if(state==='normal'&&rows.length)downloadCsv(panel.id+'.csv',panel.exportColumns!,rows)}:undefined}>
 {data&&<PanelBody panelId={panel.id} filters={filters} perm={perm} data={data}/>}
 </CardFrame>
}
export function FloorView(){
 const {floorId}=useParams(),q=useQuery(),l=useLocation()
 const perm=mockPermission(l.search),f=parseFilters(l.search,perm)
 return <div className="shell"><header className="shell__header"><span className="shell__title">房态视图</span><span className="shell__sub">楼层参数：{floorId}</span></header><div className="shell__body"><div className="main"><div className="card">
 <div data-testid="floor-view">{floorId+'|'+f.venue+'|'+f.range+'|'+f.compare}</div>
 <p data-testid="floor-range">{f.from} 至 {f.to}</p><p className="muted">房态数据由业务员工作台提供，当前为路由接口桩。</p>
 </div></div></div></div>
}
export function AppRoutes(){return <Routes><Route path="/" element={<App/>}/><Route path="/dash" element={<App/>}/><Route path="/floors/:floorId" element={<FloorView/>}/></Routes>}
