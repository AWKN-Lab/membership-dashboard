import React from 'react'
import Button from 'tdesign-react/es/button'
import Tooltip from 'tdesign-react/es/tooltip'
import { CardStates } from './CardStates'
import type { CardState } from '../mock/api'
export interface PanelMeta { title:string; definition:string; version:string }
export function PanelCard({ meta, state, asOf, exportRows, canExport=false, children, onRetry }:{
  meta:PanelMeta; state:CardState; asOf?:string; exportRows?: (string|number)[][]; canExport?:boolean; children?:React.ReactNode; onRetry?:()=>void
}) {
  function download(){
    if(!canExport||state!=='normal'||!exportRows?.length)return
    const csv=exportRows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n')
    const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}))
    const a=document.createElement('a'); a.href=url; a.download=meta.title+'.csv'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000)
  }
  return <section className="card" data-testid="panel-card">
    <div className="card__head"><h3 className="card__title">{meta.title}</h3>
      <Tooltip content={meta.definition+'（口径 '+meta.version+'）'}><button type="button" className="metric-tip" aria-label={'口径 '+meta.version+': '+meta.definition}>i</button></Tooltip>
      {canExport&&<Button size="small" variant="outline" disabled={state!=='normal'||!exportRows?.length} onClick={download}>导出</Button>}</div>
    <div className="metric-def" data-testid="metric-definition">口径 {meta.version}：{meta.definition}</div>
    <div className="as-of" data-testid="as-of">数据截至时间：{asOf||'—'}</div>
    <CardStates state={state}>{children}</CardStates>
    {state==='error'&&onRetry&&<Button variant="outline" onClick={onRetry}>重试</Button>}
  </section>
}
