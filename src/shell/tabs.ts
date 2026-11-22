/** 七个页签（#1851 验收第 1 条）。key 会写进 URL，刷新后停留在同一页签。 */
export interface TabDef { key: string; label: string }
export const TABS: TabDef[] = [
  { key: 'overview', label: '总览' },
  { key: 'occupancy', label: '出租率' },
  { key: 'expiry', label: '到期与续约' },
  { key: 'leads', label: '招商线索' },
  { key: 'members', label: '会员结构' },
  { key: 'service', label: '服务与工单' },
  { key: 'metrics', label: '口径与版本' },
]
export const TAB_KEYS = TABS.map((t) => t.key)
