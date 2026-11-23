import { describe, expect, it } from 'vitest'
import { tokens } from '../src/design/tokens'
import {
  occupancyStackedOption,
  trendLineOption,
  bucketBarOption,
  funnelOption,
  groupedBarOption,
} from '../src/charts/options'

const rows = [
  { floorId: 'fl-f1', floorName: 'F1 层', rented: 47, reserved: 12, vacant: 11 },
  { floorId: 'fl-f2', floorName: 'F2 层', rented: 74, reserved: 4, vacant: 20 },
]

describe('ECharts option（#1896 验收 1 的机器可读判据）', () => {
  it('堆叠条形同时有图例与条内数值标签', () => {
    const o = occupancyStackedOption(rows) as any
    expect(o.legend.show).toBe(true)
    expect(o.legend.data).toEqual(['已租', '预留', '空置'])
    // 三段都是堆叠柱，且**每段都带条内标签**
    expect(o.series.map((s: any) => s.name)).toEqual(['已租', '预留', '空置'])
    for (const s of o.series) {
      expect(s.type).toBe('bar')
      expect(s.stack).toBe('total')
      expect(s.label.show).toBe(true)
      expect(s.label.position).toBe('inside')
    }
    expect(o.series[0].data).toEqual([47, 74])
  })

  it('所有图表的每个 series 都有文字标签（客户约定：除颜色外都有文字标签）', () => {
    const opts = [
      trendLineOption(['2026-01'], [80], '出租率'),
      bucketBarOption(['30 天内'], [4]),
      funnelOption([{ name: '线索', value: 10 }]),
      groupedBarOption(['A'], [{ name: '会员数', data: [3] }]),
    ] as any[]
    for (const o of opts) {
      for (const s of o.series) expect(s.label?.show).toBe(true)
    }
  })

  it('配色取设计变量（与 tokens 一致）', () => {
    const o = occupancyStackedOption(rows) as any
    expect(o.color).toEqual([tokens.color.rent, tokens.color.reserved, tokens.color.vacant])
  })
})
