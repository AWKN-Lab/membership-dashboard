/**
 * 接口桩（客户约定：接口先用 mock）。
 * **确定性**：同一 (panelId, filters) 必得同一组数 ⇒ 截图与测试可复现。
 * 对接点：接真实接口时只替换本文件的 fetchPanelData（见 README「对接点」）。
 */
import type { Filters } from '../shell/filters'
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

function seedOf(panelId: string, f: Filters): number {
  return hashString(`${panelId}|${f.venue}|${f.range}|${f.from}|${f.to}|${f.compare}`)
}

export async function fetchPanelData(
  panelId: string,
  filters: Filters,
  perm: Permission = { canViewCluster: true },
): Promise<PanelData> {
  const rnd = seededRandom(seedOf(panelId, filters))
  const endMonth = filters.range === 'last_month' ? '2026-10' : filters.range === 'this_quarter' ? '2026-11' : '2026-11'
  const cmpName = filters.compare === 'yoy' ? '同比' : '环比'
  const cmpFactor = filters.compare === 'yoy' ? 1.18 : 1.04

  switch (panelId) {
    case 'key-metrics': {
      const rate = Math.round((82 + rnd() * 8) * 10) / 10
      const members = Math.round(96 + rnd() * 60)
      const opps = Math.round(24 + rnd() * 24)
      const amount = Math.round((1.6 + rnd() * 1.8) * 10000)
      return {
        keyMetrics: [
          { key: 'members', name: '会员企业数', value: `${members} 家`, compareLabel: cmpName, compareValue: `+${(4.2 + rnd() * 3).toFixed(1)}%`, up: true },
          { key: 'occupancy', name: '空间出租率', value: `${rate.toFixed(1)}%`, compareLabel: cmpName, compareValue: `+${(1.1 + rnd() * 1.6).toFixed(1)}pp`, up: true },
          { key: 'opps', name: '在途商机', value: `${opps} 条`, compareLabel: cmpName, compareValue: `${rnd() > 0.5 ? '+' : '-'}${Math.round(rnd() * 9)}%`, up: rnd() > 0.5 },
          { key: 'amount', name: '本月签约额', value: `¥ ${amount.toLocaleString('zh-CN')}`, compareLabel: cmpName, compareValue: `+${((cmpFactor - 1) * 100).toFixed(1)}%`, up: true },
        ],
      }
    }
    case 'network': {
      const names = perm.canViewCluster ? ['园区 A 座', '园区 B 座', '园区 C 座', '远程会员'] : ['本会所', '远程会员']
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
      const floors: FloorRow[] = ['F1', 'F2', 'F3', 'F4', 'F5'].map((f) => {
        const rented = Math.round(38 + rnd() * 42)
        const reserved = Math.round(1 + rnd() * 14)
        const vacant = Math.max(4, Math.round(60 - rented - reserved))
        return { floorId: `fl-${f.toLowerCase()}`, floorName: `${f} 层`, rented, reserved, vacant }
      })
      const months = monthsBack(endMonth, 12)
      const rates = months.map(() => Math.round((78 + rnd() * 16) * 10) / 10)
      const rateEnd = Math.round((80 + rnd() * 8) * 10) / 10
      const rateMoM = Math.round((rnd() * 4 - 1) * 10) / 10
      return {
        occupancy: {
          rateEnd,
          rateMoM,
          trendMonths: months,
          trendRates: rates,
          floors,
          bucket30: Math.round(2 + rnd() * 6),
          bucket60: Math.round(4 + rnd() * 6),
          bucket90: Math.round(12 + rnd() * 10),
          renewalMonths: months,
          renewalRates: months.map(() => Math.round((72 + rnd() * 22) * 10) / 10),
        },
      }
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
      const orgs = ['华东大区', '华南大区', '华北大区', '线上事业部']
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
