/**
 * 驾驶舱 /dash 的**七个页签** —— 名称与客户要求逐字一致（验收核对项，勿改文案）。
 */
export interface TabDef {
  key: string
  label: string
}

export const TABS: TabDef[] = [
  { key: 'overview', label: '总览' },
  { key: 'network', label: '网络' },
  { key: 'funnel', label: '商机漏斗' },
  { key: 'leads', label: '招商' },
  { key: 'member-success', label: '会员成功' },
  { key: 'org-agent', label: '组织与 Agent' },
  { key: 'finance', label: '财务' },
]

export const DEFAULT_TAB = 'overview'

export function isTab(key: string): boolean {
  return TABS.some((t) => t.key === key)
}
