/**
 * 任务 3（业务员工作台）尚未完成 ⇒ 按技术约定「依赖其它工单的接口时，用接口桩或 mock 先行，
 * 并在 README 写明对接点」。
 *
 * 对接点（把 mock 换成真实接口时只需改这两个函数）：
 *   GET /api/v1/dashboard/occupancy?org_id=&site_id=&month=
 *   GET /api/v1/workbench/floors/:floorId      （房态视图路由，带楼层参数）
 *
 * 数据全部为**虚构测试数据**，不含任何真实企业/个人信息。
 */

export type CardState = 'normal' | 'loading' | 'empty' | 'error'

export interface FloorOccupancy {
  floorId: string
  floorName: string
  rented: number
  reserved: number
  vacant: number
}

export interface OccupancyPayload {
  orgId: string
  siteId: string
  month: string
  rateEnd: number          // 期末出租率
  rateMoM: number          // 环比（百分点）
  trend12m: { month: string; rate: number }[]
  floors: FloorOccupancy[]
  expiring: { bucket30: number; bucket60: number; bucket90: number }
  renewalTrend: { month: string; rate: number }[]
  metricVersion: string    // 口径版本号
  metricDefinition: string // 口径定义
}

export const SITES = [
  { siteId: 'site-demo-a', name: '演示园区 A 座' },
  { siteId: 'site-demo-b', name: '演示园区 B 座' },
]
export const ORGS = [{ orgId: 'org-demo', name: '演示会员空间' }]

const EMPTY_PAYLOAD: OccupancyPayload = {
  orgId: 'org-demo', siteId: 'site-demo-a', month: '2026-11',
  rateEnd: 0, rateMoM: 0, trend12m: [], floors: [], expiring: { bucket30: 0, bucket60: 0, bucket90: 0 },
  renewalTrend: [], metricVersion: 'v1.2', metricDefinition: '出租率 = 已租工位 ÷ 可租工位（期末值）',
}

function hashString(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = (h * 16777619) >>> 0
  }
  return h || 1
}

/** 确定性伪随机：同一 seed 必得同一序列（评测/截图可复现）。 */
function seededRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

export function mockOccupancy(orgId: string, siteId: string, month: string, empty = false, snapshotDay?: string): OccupancyPayload {
  if (empty) return { ...EMPTY_PAYLOAD, orgId, siteId, month }
  const rnd = seededRandom(hashString(`${orgId}|${siteId}|${month}|${snapshotDay || "month-end"}`))
  const months: string[] = []
  const [y, m] = month.split('-').map(Number)
  const end = new Date(Date.UTC(y, m - 1, 1))
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - i, 1))
    months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`)
  }
  const trend12m = months.map((mm) => ({ month: mm, rate: Math.round((72 + rnd() * 18) * 10) / 10 }))
  const floors: FloorOccupancy[] = ['F1', 'F2', 'F3', 'F4', 'F5'].map((f, i) => {
    const total = 60 + Math.floor(rnd() * 40)
    const rented = Math.floor(total * (0.55 + rnd() * 0.4))
    const reserved = Math.floor((total - rented) * (rnd() * 0.6))
    return { floorId: `fl-${f.toLowerCase()}`, floorName: `${f} 层`, rented, reserved, vacant: total - rented - reserved }
  })
  const total = floors.reduce((sum, f) => sum + f.rented + f.reserved + f.vacant, 0)
  const rented = floors.reduce((sum, f) => sum + f.rented, 0)
  const rate = total ? Math.round((rented / total) * 1000) / 10 : 0
  trend12m[11].rate = rate
  return {
    orgId, siteId, month,
    rateEnd: rate,
    rateMoM: Math.round((trend12m[11].rate - trend12m[10].rate) * 10) / 10,
    trend12m,
    floors,
    expiring: { bucket30: 3 + Math.floor(rnd() * 9), bucket60: 6 + Math.floor(rnd() * 12), bucket90: 10 + Math.floor(rnd() * 20) },
    renewalTrend: months.map((mm) => ({ month: mm, rate: Math.round((62 + rnd() * 22) * 10) / 10 })),
    metricVersion: 'v1.2',
    metricDefinition: '出租率 = 已租工位 ÷ 可租工位（期末值）；环比 = 本月末 − 上月末（百分点）',
  }
}

export async function fetchOccupancy(orgId: string, siteId: string, month: string, empty = false, snapshotDay?: string): Promise<OccupancyPayload> {
  await new Promise((r) => setTimeout(r, 60))
  return mockOccupancy(orgId, siteId, month, empty, snapshotDay)
}
