import React from 'react'
import type { CardState } from '../mock/api'

/**
 * 三种卡片状态（#1851 验收第 1 条：三种卡片状态各有截图）+ 额外一个错误态。
 * loading / empty / error 状态**不渲染任何数据**，避免把"没数据"画成"数据是 0"。
 */
export function CardStates({
  state, children, emptyText = '暂无数据',
}: { state: CardState; children: React.ReactNode; emptyText?: string }) {
  if (state === 'loading') return <div className="state-loading" data-testid="card-loading">加载中…</div>
  if (state === 'empty') return <div className="state-empty" data-testid="card-empty">{emptyText}</div>
  if (state === 'error') return <div className="state-error" data-testid="card-error">数据加载失败，请稍后重试</div>
  return <>{children}</>
}
