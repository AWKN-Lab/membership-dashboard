import type { ReactNode } from 'react'
import { MetricTip } from './MetricTip'

export type CardState = 'normal' | 'loading' | 'empty' | 'error'

/**
 * 面板卡片框架（客户约定五要素）：
 *   标题 / 口径提示（悬停显示定义与版本号）/ 数据截至时间 /
 *   加载·空数据·报错三种状态 / 导出按钮
 */
export function CardFrame({
  title,
  metricKey,
  updatedAt,
  state = 'normal',
  emptyText = '暂无数据',
  onExport,
  exportLabel = '导出',
  children,
}: {
  title: string
  metricKey: string
  updatedAt: string
  state?: CardState
  emptyText?: string
  onExport?: () => void
  exportLabel?: string
  children?: ReactNode
}) {
  return (
    <section className="card" data-testid={`card-${title}`}>
      <header className="card__head">
        <h3 className="card__title" data-testid="card-title">
          {title}
        </h3>
        <MetricTip metricKey={metricKey} />
        <span className="card__updated" data-testid="card-updated">
          {`数据截至 ${updatedAt}`}
        </span>
        {onExport && (
          <button
            type="button"
            className="card__export"
            data-testid="card-export"
            onClick={onExport}
          >
            {exportLabel}
          </button>
        )}
      </header>
      <div className="card__body">
        {state === 'loading' && (
          <div className="state-loading" data-testid="card-loading">
            加载中…
          </div>
        )}
        {state === 'empty' && (
          <div className="state-empty" data-testid="card-empty">
            {emptyText}
          </div>
        )}
        {state === 'error' && (
          <div className="state-error" data-testid="card-error">
            数据加载失败，请稍后重试
          </div>
        )}
        {state === 'normal' && <div data-testid="card-content">{children}</div>}
      </div>
    </section>
  )
}
