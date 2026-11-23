export type Venue = 'club' | 'cluster'
export type RangeKey = 'this_month' | 'last_month' | 'this_quarter' | 'custom'
export type Compare = 'mom' | 'yoy'
export interface Filters { venue:Venue; range:RangeKey; from:string; to:string; compare:Compare }
export interface Permission { canViewCluster:boolean }
export const VENUE_LABEL:Record<Venue,string>={club:'本会所',cluster:'集团'}
export const RANGE_LABEL:Record<RangeKey,string>={this_month:'本月',last_month:'上月',this_quarter:'本季度',custom:'自定义'}
export const COMPARE_LABEL:Record<Compare,string>={mom:'环比',yoy:'同比'}
export const dateISO=(d:Date)=>d.toISOString().slice(0,10)
export function validDate(s:string|null|undefined):s is string {
 if(!s||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false
 const d=new Date(s+'T00:00:00Z')
 return Number.isFinite(+d)&&dateISO(d)===s
}
export function validRange(from:string|null,to:string|null):boolean{return validDate(from)&&validDate(to)&&from<=to}
export function presetRange(range:Exclude<RangeKey,'custom'>, now=new Date()):Pick<Filters,'from'|'to'>{
 const y=now.getUTCFullYear(),m=now.getUTCMonth(),first=range==='last_month'?m-1:range==='this_quarter'?Math.floor(m/3)*3:m
 const last=range==='last_month'?m:range==='this_quarter'?first+3:m+1
 return {from:dateISO(new Date(Date.UTC(y,first,1))),to:dateISO(new Date(Date.UTC(y,last,0)))}
}
export const DEFAULT_FILTERS:Filters={venue:'club',range:'this_month',...presetRange('this_month'),compare:'mom'}
export function parseFilters(search:string,perm:Permission={canViewCluster:true},now=new Date()):Filters{
 const q=new URLSearchParams(search),r=q.get('range')
 const venue=q.get('venue')==='cluster'&&perm.canViewCluster?'cluster':'club'
 const compare=q.get('compare')==='yoy'?'yoy':'mom'
 let range:RangeKey=r==='last_month'||r==='this_quarter'||r==='custom'?r:'this_month'
 const from=q.get('from'),to=q.get('to')
 if(range==='custom'&&validRange(from,to))return {venue,range,from:from!,to:to!,compare}
 if(range==='custom')range='this_month'
 // Preserve a valid calendar-aligned preset anchor on reload, not arbitrary dates.
 if(validRange(from,to)){
   const anchor=new Date(from!+'T00:00:00Z')
   const ref=range==='last_month'?new Date(Date.UTC(anchor.getUTCFullYear(),anchor.getUTCMonth()+1,1)):anchor
   const canonical=presetRange(range,ref)
   if(canonical.from===from&&canonical.to===to)return {venue,range,from:from!,to:to!,compare}
 }
 return {venue,range,...presetRange(range,now),compare}
}
export function filtersToQuery(f:Filters,search=''):string{
 const q=new URLSearchParams(search)
 for(const [k,v] of Object.entries(f))q.set(k,v)
 return q.toString()
}
export function updateFilter(f:Filters,patch:Partial<Filters>,perm:Permission,now=new Date()):Filters{
 const next={...f,...patch}
 if(patch.range&&patch.range!=='custom')Object.assign(next,presetRange(patch.range,now))
 return parseFilters(filtersToQuery(next),perm,now)
}
export function writeFiltersToUrl(f:Filters,win:Window=window):void{
 win.history.replaceState({},'',win.location.pathname+'?'+filtersToQuery(f,win.location.search))
}
export function venueOptions(perm:Permission):{value:Venue;label:string}[]{
 const list=[{value:'club' as Venue,label:VENUE_LABEL.club}]
 if(perm.canViewCluster)list.push({value:'cluster',label:VENUE_LABEL.cluster})
 return list
}
