import type {PanelData} from '../mock/api'
import type {Filters} from '../shell/filters'
export type Cell=string|number
export function panelExportRows(id:string,data:PanelData,f:Filters):Cell[][]{
 switch(id){
 case 'key-metrics':return (data.keyMetrics??[]).map(m=>[m.name,m.value,m.compareLabel+' '+m.compareValue])
 case 'network':return (data.network??[]).map(r=>[r.name,r.value])
 case 'funnel':return (data.funnel??[]).map((r,i,a)=>[r.name,r.value,i===0?'100%':a[i-1].value?(r.value/a[i-1].value*100).toFixed(1)+'%':'—'])
 case 'occupancy':return (data.occupancy?.floors??[]).map(r=>[r.floorName,r.rented,r.reserved,r.vacant])
 case 'member-success':{const a=data.memberSuccess;return a?a.months.map((m,i)=>[m,a.signed[i],a.success[i]]):[]}
 case 'org-agent':return (data.orgAgent??[]).map(r=>[r.org,r.staff,r.coverage,r.agentShare])
 case 'finance-contract':{const a=data.contractAmount;return a?a.months.map((m,i)=>[m,a.values[i]]):[]}
 case 'finance-revenue':{const a=data.membershipRevenue;return a?a.months.map((m,i)=>[m,a.values[i]]):[]}
 default:return []
 }
}
export function csvText(header:string[],rows:Cell[][]):string{
 const escape=(v:Cell)=>{
  let s=String(v)
  if(typeof v==='string'&&/^[\s]*[=+\-@\t\r]/.test(s))s="'"+s
  return '"'+s.replaceAll('"','""')+'"'
 }
 return '\uFEFF'+[header,...rows].map(r=>r.map(escape).join(',')).join('\r\n')
}
export function downloadCsv(filename:string,header:string[],rows:Cell[][]){
 if(!rows.length)return
 const url=URL.createObjectURL(new Blob([csvText(header,rows)],{type:'text/csv;charset=utf-8'}))
 const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove()
 const revoke=URL.revokeObjectURL.bind(URL)
 setTimeout(()=>revoke(url),1000)
}
