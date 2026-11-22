import type { TabKey } from './tabs'
import type { PanelMeta } from './PanelCard'
export interface PanelRegistration extends PanelMeta { id:string; tab:TabKey; kind:'occupancy'|'stub'|'finance' }
export const PANELS:readonly PanelRegistration[]=[
 {id:'occupancy',tab:'overview',kind:'occupancy',title:'出租率',definition:'已租工位 ÷ 可租工位（期末值）',version:'v1.2'},
 {id:'network',tab:'network',kind:'stub',title:'会员网络',definition:'会员关系网络（待口径库对接）',version:'draft'},
 {id:'funnel',tab:'funnel',kind:'stub',title:'商机漏斗',definition:'按商机阶段汇总（待口径库对接）',version:'draft'},
 {id:'sales',tab:'sales',kind:'stub',title:'招商',definition:'招商线索与转化（待口径库对接）',version:'draft'},
 {id:'success',tab:'success',kind:'stub',title:'会员成功',definition:'会员服务指标（待口径库对接）',version:'draft'},
 {id:'org-agent',tab:'org-agent',kind:'stub',title:'组织与 Agent',definition:'组织与 Agent 指标（待口径库对接）',version:'draft'},
 {id:'contract',tab:'finance',kind:'finance',title:'签约额',definition:'筛选期间签约金额合计（分）',version:'mock-v1'},
 {id:'membership',tab:'finance',kind:'finance',title:'会籍收入',definition:'筛选期间会籍收入合计（分）',version:'mock-v1'},
]
export const panelsFor=(tab:TabKey)=>PANELS.filter(p=>p.tab===tab)
