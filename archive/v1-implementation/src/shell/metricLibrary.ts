/**
 * 口径库：每个指标的**定义 + 版本号**。卡片框架的口径提示悬停即显示这里的内容。
 * 客户约定：「口径提示（悬停显示口径库中的定义与版本号）」。
 */
export interface MetricDefinition {
  key: string
  name: string
  definition: string
  version: string
  updatedAt: string
}

export const METRIC_LIBRARY: MetricDefinition[] = [
  {
    key: 'occupancy',
    name: '出租率',
    definition: '出租率 = 已租工位 ÷ 可租工位（期末值）；环比 = 本月末 − 上月末（百分点）',
    version: 'v1.2',
    updatedAt: '2026-11-22',
  },
  {
    key: 'key-metrics',
    name: '关键指标概览',
    definition: '关键指标 = 会员企业数 / 空间出租率 / 在途商机数 / 本月签约额；对比方式取自全局筛选（环比 / 同比）',
    version: 'v1.0',
    updatedAt: '2026-11-22',
  },
  {
    key: 'network',
    name: '会员网络分布',
    definition: '会员网络分布 = 按会员企业所在园区统计的会员数；含尚未产生签约的意向会员',
    version: 'v1.0',
    updatedAt: '2026-11-22',
  },
  {
    key: 'funnel',
    name: '商机漏斗',
    definition: '商机漏斗 = 线索 → 有效商机 → 参观 → 方案 → 签约，逐级转化率 = 本级数 ÷ 上一级数',
    version: 'v1.1',
    updatedAt: '2026-11-22',
  },
  {
    key: 'member-success',
    name: '会员留存与成功度',
    definition: '会员成功度 = 入驻 90 天内完成 ≥1 次活动的会员数 ÷ 同期新签会员数；留存按自然月统计',
    version: 'v1.0',
    updatedAt: '2026-11-22',
  },
  {
    key: 'org-agent',
    name: '组织与 Agent 效能',
    definition: '组织与 Agent 效能 = 业务员跟进覆盖率 / Agent 自动处理占比 / 人均有效线索数',
    version: 'v1.0',
    updatedAt: '2026-11-22',
  },
  {
    key: 'finance-contract',
    name: '签约额',
    definition: '签约额 = 已签合同金额合计（单位：元，按签约日归期；本期只取签约额，不含回款与开票）',
    version: 'v1.0',
    updatedAt: '2026-11-22',
  },
  {
    key: 'finance-revenue',
    name: '会籍收入',
    definition: '会籍收入 = 会员会籍费与增值服务确认收入合计（单位：元，按权责发生制归期；本期不含回款与开票）',
    version: 'v1.0',
    updatedAt: '2026-11-22',
  },
]

export function metricDefinition(key: string): MetricDefinition {
  const hit = METRIC_LIBRARY.find((m) => m.key === key)
  if (!hit) throw new Error(`口径库缺少指标：${key}`)
  return hit
}
