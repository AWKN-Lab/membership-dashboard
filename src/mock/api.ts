/**
 * 接口桩（客户约定：接口先用 mock）。
 * **确定性**：同一 (panelId, filters) 必得同一组数 ⇒ 截图与测试可复现。
 * 对接点：接真实接口时只替换本文件的 fetchPanelData（见 README「对接点」）。
 */
import { dateISO, validRange, type Filters } from '../shell/filters'
import type { FloorRow } from '../charts/options'

export interface Permission {
  canViewCluster: boolean
}

/** 演示账号（默认有集团权限；?perm=club 可模拟只有本会所权限） */
export function mockPermission(search = ''): Permission {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  return { canViewCluster: q.get('perm') !== 'club' }
}

function hashString(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = (h * 16777619) >>> 0
  }
  return h || 1
}

function seededRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

function monthsBack(endMonth: string, count: number): string[] {
  const [y, m] = endMonth.split('-').map(Number)
  const end = new Date(Date.UTC(y, m - 1, 1))
  const out: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - i, 1))
    out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`)
  }
  return out
}

export interface KeyMetric {
  key: string
  name: string
  value: string
  compareLabel: string
  compareValue: string
  up: boolean
}

export interface PanelData {
  keyMetrics?: KeyMetric[]
  network?: { name: string; value: number }[]
  funnel?: { name: string; value: number }[]
  occupancy?: {
    rateEnd: number
    rateMoM: number
    rateYoY: number
    trendMonths: string[]
    trendRates: number[]
    floors: FloorRow[]
    bucket30: number
    bucket60: number
    bucket90: number
    renewalMonths: string[]
    renewalRates: number[]
  }
  memberSuccess?: { months: string[]; signed: number[]; success: number[] }
  orgAgent?: { org: string; staff: number; coverage: number; agentShare: number }[]
  contractAmount?: { months: string[]; values: number[] }
  membershipRevenue?: { months: string[]; values: number[] }
}

function seedOf(panelId:string,f:Filters):number{
 return hashString(`${panelId}|${f.venue}|${f.from}|${f.to}`)
}
function shiftDate(date:string,months:number):string{
 const d=new Date(date+'T00:00:00Z'),y=d.getUTCFullYear(),m=d.getUTCMonth(),day=d.getUTCDate()
 const monthLast=new Date(Date.UTC(y,m+1,0)).getUTCDate()
 const targetLast=new Date(Date.UTC(y,m+months+1,0)).getUTCDate()
 return dateISO(new Date(Date.UTC(y,m+months,day===monthLast?targetLast:Math.min(day,targetLast))))
}
export function occupancySnapshot(venue:Filters['venue'],date:string){
 const rnd=seededRandom(hashString('inventory|'+venue+'|'+date))
 const scale=venue==='cluster'?3:1
 const floors:FloorRow[]=['F1','F2','F3','F4','F5'].map((name,i)=>{
   const total=(60+i*8)*scale
   const rented=Math.round(total*(.60+rnd()*.33))
   const reserved=Math.min(total-rented,Math.max(1,Math.round((total-rented)*(.1+rnd()*.45))))
   return {floorId:'fl-'+name.toLowerCase(),floorName:name+' 层',rented,reserved,vacant:total-rented-reserved}
 })
 const total=floors.reduce((n,r)=>n+r.rented+r.reserved+r.vacant,0)
 const rented=floors.reduce((n,r)=>n+r.rented,0)
 return {floors,rate:Math.round(rented/total*1000)/10}
}
const delta=(a:number,b:number)=>Math.round((a-b)*10)/10
function pctChange(a:number,b:number){return b?((a-b)/b)*100:0}
function fmt(n:number,unit='%'){return (n>=0?'+':'')+n.toFixed(1)+unit}
function mockScalar(name:string,f:Filters,date=f.to):number{
 const r=seededRandom(hashString(name+'|'+f.venue+'|'+date))
 return Math.round((100+r()*120)*(f.venue==='cluster'?3:1))
}
export async function fetchPanelData(
  panelId: string,
  filters: Filters,
  perm: Permission = { canViewCluster: true },
): Promise<PanelData> {
  if(filters.venue==='cluster'&&!perm.canViewCluster)throw Error('集团范围无权限')
  if(!validRange(filters.from,filters.to))throw Error('日期范围无效')
  const rnd=seededRandom(seedOf(panelId,filters))
  const endMonth=filters.to.slice(0,7)
  const cmpName=filters.compare==='yoy'?'同比':'环比'
  const prior=shiftDate(filters.to,filters.compare==='yoy'?-12:-1)

  switch (panelId) {
    case 'key-metrics': {
      const rate=occupancySnapshot(filters.venue,filters.to).rate
      const rateDelta=delta(rate,occupancySnapshot(filters.venue,prior).rate)
      const metrics=[['members','会员企业数',' 家'],['opps','在途商机',' 条'],['amount','本期签约额',' 元']] as const
      const values:KeyMetric[]=metrics.map(([key,name,unit])=>{
        const factor=key==='amount'?100:1
        const value=mockScalar(key,filters)*factor
        const change=pctChange(value,mockScalar(key,filters,prior)*factor)
        return {key,name,value:value.toLocaleString('zh-CN')+unit,compareLabel:cmpName,compareValue:fmt(change),up:change>=0}
      })
      values.splice(1,0,{key:'occupancy',name:'空间出租率',value:rate.toFixed(1)+'%',compareLabel:cmpName,compareValue:fmt(rateDelta,'pp'),up:rateDelta>=0})
      return {keyMetrics:values}
    }
    case 'network': {
      const names = filters.venue==='cluster' && perm.canViewCluster ? ['园区 A 座', '园区 B 座', '园区 C 座', '远程会员'] : ['本会所', '远程会员']
      return { network: names.map((name) => ({ name, value: Math.round(18 + rnd() * 60) })) }
    }
    case 'funnel': {
      const lead = Math.round(260 + rnd() * 120)
      const valid = Math.round(lead * (0.5 + rnd() * 0.12))
      const visit = Math.round(valid * (0.45 + rnd() * 0.12))
      const proposal = Math.round(visit * (0.4 + rnd() * 0.14))
      const signed = Math.round(proposal * (0.35 + rnd() * 0.16))
      return {
        funnel: [
          { name: '线索', value: lead },
          { name: '有效商机', value: valid },
          { name: '参观', value: visit },
          { name: '方案', value: proposal },
          { name: '签约', value: signed },
        ],
      }
    }
    case 'occupancy': {
      const current=occupancySnapshot(filters.venue,filters.to)
      const months=monthsBack(endMonth,12)
      const rates=months.map((m,i)=> {
        if(i===months.length-1)return current.rate
        const [y,n]=m.split('-').map(Number)
        return occupancySnapshot(filters.venue,dateISO(new Date(Date.UTC(y,n,0)))).rate
      })
      return {occupancy:{
        rateEnd:current.rate,
        rateMoM:delta(current.rate,occupancySnapshot(filters.venue,shiftDate(filters.to,-1)).rate),
        rateYoY:delta(current.rate,occupancySnapshot(filters.venue,shiftDate(filters.to,-12)).rate),
        trendMonths:months,trendRates:rates,floors:current.floors,
        bucket30:Math.round(2+rnd()*6),bucket60:Math.round(4+rnd()*6),bucket90:Math.round(12+rnd()*10),
        renewalMonths:months,renewalRates:months.map(()=>Math.round((72+rnd()*22)*10)/10)
      }}
    }
    case 'member-success': {
      const months = monthsBack(endMonth, 12)
      return {
        memberSuccess: {
          months,
          signed: months.map(() => Math.round(4 + rnd() * 14)),
          success: months.map(() => Math.round(3 + rnd() * 11)),
        },
      }
    }
    case 'org-agent': {
      const orgs = filters.venue==='cluster'?['演示园区 A','演示园区 B','演示园区 C','线上事业部']:['本会所']
      return {
        orgAgent: orgs.map((org) => ({
          org,
          staff: Math.round(6 + rnd() * 14),
          coverage: Math.round(62 + rnd() * 30),
          agentShare: Math.round(30 + rnd() * 40),
        })),
      }
    }
    case 'finance-contract': {
      const months = monthsBack(endMonth, 12)
      return { contractAmount: { months, values: months.map(() => Math.round((1.2 + rnd() * 2.4) * 100000)) } }
    }
    case 'finance-revenue': {
      const months = monthsBack(endMonth, 12)
      return { membershipRevenue: { months, values: months.map(() => Math.round((0.6 + rnd() * 1.6) * 100000)) } }
    }
    default:
      throw new Error(`未知面板：${panelId}`)
  }
}
