import { useState } from 'react'
import { metricDefinition } from './metricLibrary'

/**
 * 口径提示：**悬停**显示口径库中的定义与版本号（客户约定）。
 * 实现：onMouseEnter/focus 展开浮层，同时保留 title 兜底（无障碍与截图可见）。
 */
export function MetricTip({ metricKey }: { metricKey: string }) {
  const [open, setOpen] = useState(false)
  const m = metricDefinition(metricKey)
  return (
    <span className="metric-tip" data-testid="metric-tip">
      <button
        type="button"
        className="metric-tip__trigger"
        data-testid="metric-tip-trigger"
        aria-label={`口径说明：${m.name}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        title={`${m.name} · 口径 ${m.version}`}
      >
        ⓘ
      </button>
      {open && (
        <span className="metric-tip__pop" data-testid="metric-tip-pop" role="tooltip">
          <b data-testid="metric-definition">{`口径 ${m.version}：${m.definition}`}</b>
          <i data-testid="metric-version">{`版本 ${m.version} · 更新于 ${m.updatedAt}`}</i>
        </span>
      )}
    </span>
  )
}
