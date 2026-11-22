import React from 'react'

/**
 * 口径提示（#1851 验收第 2 条）：显示**定义与版本号**。
 * 用原生 title + 可见的说明行 ⇒ 截图里能看到，不必悬停。
 */
export function MetricTip({ definition, version }: { definition: string; version: string }) {
  return (
    <span className="metric-tip-wrap">
      <span className="metric-tip" title={`${definition}（口径 ${version}）`} aria-label={`口径 ${version}`}>i</span>
      <span className="metric-def" data-testid="metric-definition">
        口径 {version}：{definition}
      </span>
    </span>
  )
}
