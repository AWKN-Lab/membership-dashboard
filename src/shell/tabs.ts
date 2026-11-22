export const TABS = [
  { key: 'overview', label: '总览' }, { key: 'network', label: '网络' },
  { key: 'funnel', label: '商机漏斗' }, { key: 'sales', label: '招商' },
  { key: 'success', label: '会员成功' }, { key: 'org-agent', label: '组织与 Agent' },
  { key: 'finance', label: '财务' },
] as const
export type TabKey = typeof TABS[number]['key']
export const TAB_KEYS = TABS.map(t => t.key)
