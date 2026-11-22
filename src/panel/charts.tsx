import React,{useEffect,useRef} from 'react'
import * as echarts from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'
echarts.use([LineChart,BarChart,GridComponent,LegendComponent,TooltipComponent,SVGRenderer])
const colors=['#0052d9','#e37318','#6b7785']
function Chart({option,height=220,onClick,label}:{option:EChartsCoreOption;height?:number;onClick?:(i:number)=>void;label:string}){
 const el=useRef<HTMLDivElement>(null)
 useEffect(()=>{
  if(!el.current)return
  const c=echarts.init(el.current,undefined,{renderer:'svg',width:el.current.clientWidth||720,height})
  c.setOption(option)
  c.on('click',(e)=>{if(e.componentType==='series'&&typeof e.dataIndex==='number')onClick?.(e.dataIndex)})
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(()=>{if(el.current?.clientWidth)c.resize({width:el.current.clientWidth,height})}):null
  if(ro)ro.observe(el.current)
  return ()=>{ro?.disconnect();c.dispose()}
 },[option,height,onClick])
 return <div ref={el} style={{height,width:'100%'}} role="img" aria-label={label} data-testid="echarts-surface"/>
}
const grid={left:55,right:24,top:32,bottom:34,containLabel:true}
export function TrendLine({data,unit='%'}:{data:{month:string;rate:number}[];unit?:string}){
 if(!data.length)return <div className="state-empty">暂无数据</div>
 return <div data-testid="trend-line"><Chart label="月度趋势" option={{animation:false,color:colors,grid,tooltip:{trigger:'axis',valueFormatter:(v:number)=>v+unit},xAxis:{type:'category',data:data.map(d=>d.month)},yAxis:{type:'value',min:0,max:100,axisLabel:{formatter:'{value}'+unit}},series:[{type:'line',data:data.map(d=>d.rate),label:{show:true,formatter:'{c}'+unit,fontSize:10}}]}}/></div>
}
export interface StackSegment {key:string;label:string;value:number;color:string}
export function StackedBarByFloor({rows,onFloorClick}:{rows:{floorId:string;floorName:string;parts:StackSegment[]}[];onFloorClick?:(floorId:string)=>void}){
 if(!rows.length)return <div className="state-empty">暂无楼层数据</div>
 const parts=rows[0].parts
 return <div data-testid="stacked-bar">
 <Chart label="楼层工位堆叠条形图" height={300} onClick={i=>{if(rows[i])onFloorClick?.(rows[i].floorId)}} option={{
  animation:false,color:parts.map(p=>p.color),grid:{left:55,right:25,top:44,bottom:25,containLabel:true},tooltip:{trigger:'item'},legend:{top:0,data:parts.map(p=>p.label),selectedMode:false},
  xAxis:{type:'value'},yAxis:{type:'category',inverse:true,data:rows.map(r=>r.floorName)},
  series:parts.map(p=>({name:p.label,type:'bar',stack:'total',barWidth:30,label:{show:true,position:'inside',formatter:'{c}',color:'#fff',fontWeight:'bold'},data:rows.map(r=>r.parts.find(s=>s.key===p.key)?.value??0)}))
 }}/>
 <table className="mini accessible-data"><caption>楼层数据与跳转（与图表使用相同数据）</caption><thead><tr><th>楼层</th>{parts.map(p=><th key={p.key}>{p.label}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.floorId}><th><button type="button" onClick={()=>onFloorClick?.(r.floorId)}>{r.floorName}</button></th>{r.parts.map(p=><td key={p.key}>{p.value}</td>)}</tr>)}</tbody></table>
 </div>
}
export function BucketBar({data,labels}:{data:number[];labels:string[]}){
 return <div data-testid="bucket-bar"><Chart label="到期工位分桶" option={{animation:false,color:[colors[1]],grid,tooltip:{trigger:'item'},xAxis:{type:'category',data:labels},yAxis:{type:'value',min:0},series:[{type:'bar',data,label:{show:true,position:'top'}}]}}/></div>
}
