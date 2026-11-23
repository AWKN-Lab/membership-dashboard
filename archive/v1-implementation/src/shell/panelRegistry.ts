/**
 * 面板注册表：把 **8 个面板**挂到七个页签（客户约定）。
 * 财务页本期**只放签约额与会籍收入**两张卡（回款与开票后续接入）。
 *
 * 验收关注点：面板数 = 8、每个页签都有面板、财务页恰好 2 个且只有这两个。
 */
export interface PanelDef {
  id: string
  tab: string
  title: string
  /** 口径库 key（卡片框架的口径提示取它） */
  metricKey: string
  /** 数据截至时间（卡片框架显示） */
  updatedAt: string
  /** 导出列（导出按钮按它出 CSV；为空则不提供导出） */
  exportColumns?: string[]
}

export const PANELS: PanelDef[] = [
  {
    id: 'key-metrics',
    tab: 'overview',
    title: '关键指标概览',
    metricKey: 'key-metrics',
    updatedAt: '2026-11-22 10:30',
    exportColumns: ['指标', '本期', '对比'],
  },
  {
    id: 'network',
    tab: 'network',
    title: '会员网络分布',
    metricKey: 'network',
    updatedAt: '2026-11-22 10:30',
    exportColumns: ['园区', '会员数'],
  },
  {
    id: 'funnel',
    tab: 'funnel',
    title: '商机漏斗',
    metricKey: 'funnel',
    updatedAt: '2026-11-22 10:30',
    exportColumns: ['阶段', '数量', '转化率'],
  },
  {
    id: 'occupancy',
    tab: 'leads',
    title: '出租率与楼层工位结构',
    metricKey: 'occupancy',
    updatedAt: '2026-11-22 10:30',
    exportColumns: ['楼层', '已租', '预留', '空置'],
  },
  {
    id: 'member-success',
    tab: 'member-success',
    title: '会员留存与成功度',
    metricKey: 'member-success',
    updatedAt: '2026-11-22 10:30',
    exportColumns: ['月份', '新签会员', '成功会员'],
  },
  {
    id: 'org-agent',
    tab: 'org-agent',
    title: '组织与 Agent 效能',
    metricKey: 'org-agent',
    updatedAt: '2026-11-22 10:30',
    exportColumns: ['组织', '业务员数', '跟进覆盖率', 'Agent 处理占比'],
  },
  {
    id: 'finance-contract',
    tab: 'finance',
    title: '签约额',
    metricKey: 'finance-contract',
    updatedAt: '2026-11-22 10:30',
    exportColumns: ['月份', '签约额(元)'],
  },
  {
    id: 'finance-revenue',
    tab: 'finance',
    title: '会籍收入',
    metricKey: 'finance-revenue',
    updatedAt: '2026-11-22 10:30',
    exportColumns: ['月份', '会籍收入(元)'],
  },
]

export function panelsOfTab(tab: string): PanelDef[] {
  return PANELS.filter((p) => p.tab === tab)
}
