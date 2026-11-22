export type Period = 'this-month' | 'last-month' | 'this-quarter' | 'custom'
export type Comparison = 'mom' | 'yoy'
export type Scope = 'site' | 'group'
export interface Filters { scope: Scope; period: Period; start: string; end: string; comparison: Comparison }
export interface Access { siteId: string; canViewGroup: boolean }
export const DEMO_ACCESS: Access = { siteId: 'site-demo-a', canViewGroup: true }
const day = (d: Date) => d.toISOString().slice(0,10)
const validDate = (s: string | null): s is string => {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(s+'T00:00:00Z')
  return !isNaN(d.getTime()) && day(d)===s
}
export function periodRange(period: Exclude<Period,'custom'>, now = new Date()): Pick<Filters,'start'|'end'> {
  const y=now.getUTCFullYear(), m=now.getUTCMonth()
  const first=period==='last-month'?m-1:period==='this-quarter'?Math.floor(m/3)*3:m
  const last=period==='last-month'?m:period==='this-quarter'?first+3:m+1
  return {start:day(new Date(Date.UTC(y,first,1))),end:day(new Date(Date.UTC(y,last,0)))}
}
export function parseFilters(search:string, access:Access=DEMO_ACCESS, now=new Date()):Filters {
  const q=new URLSearchParams(search)
  const scope=q.get('scope')==='group'&&access.canViewGroup?'group':'site'
  const comparison=q.get('comparison')==='yoy'?'yoy':'mom'
  let period:Period='this-month'
  const p=q.get('period'); if(p==='last-month'||p==='this-quarter'||p==='custom')period=p
  const start=q.get('start'), end=q.get('end')
  if(period==='custom'&&validDate(start)&&validDate(end)&&start<=end)return {scope,period,start,end,comparison}
  if(period==='custom')period='this-month'
  // 已写入 URL 的合法锚定日期在刷新后保持；预设由选择动作重新计算。
  const range=validDate(start)&&validDate(end)&&start<=end?{start,end}:periodRange(period,now)
  return {scope,period,...range,comparison}
}
export function filtersToQuery(f:Filters, search=''):string {
  const q=new URLSearchParams(search)
  for(const [k,v] of Object.entries(f))q.set(k,v)
  return q.toString()
}
export function updateFilter(f:Filters, patch:Partial<Filters>, access:Access=DEMO_ACCESS, now=new Date()):Filters {
  const next={...f,...patch}
  if(patch.period&&patch.period!=='custom')Object.assign(next,periodRange(patch.period,now))
  if(!access.canViewGroup)next.scope='site'
  return next
}
export function occupancyFilters(f:Filters, access:Access=DEMO_ACCESS) {
  return {org_id:'org-demo',site_id:f.scope==='group'&&access.canViewGroup?'group-demo':access.siteId,month:f.end.slice(0,7)}
}
