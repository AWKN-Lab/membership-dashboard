import {useEffect,useRef} from 'react'
import {echarts} from './echarts'
export function EChart({option,height=260,testId='echart',onSeriesClick}:{
 option:Record<string,unknown>;height?:number;testId?:string;onSeriesClick?:(index:number)=>void
}){
 const ref=useRef<HTMLDivElement|null>(null)
 useEffect(()=>{
  const el=ref.current;if(!el)return
  const chart=echarts.init(el,undefined,{renderer:'svg',width:el.clientWidth||720,height})
  chart.setOption({...option,animation:false} as never)
  el.dataset.option=JSON.stringify(option)
  const click=(p: {componentType?:string;dataIndex?:number})=>{
   if(p.componentType==='series'&&Number.isInteger(p.dataIndex))onSeriesClick?.(p.dataIndex!)
  }
  chart.on('click',click)
  const onResize=()=>{if(el.clientWidth)chart.resize({width:el.clientWidth,height})}
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(onResize):null;ro?.observe(el)
  window.addEventListener('resize',onResize)
  return()=>{ro?.disconnect();window.removeEventListener('resize',onResize);chart.off('click',click);chart.dispose()}
 },[option,height,onSeriesClick])
 return <div ref={ref} data-testid={testId} style={{width:'100%',height}}/>
}
