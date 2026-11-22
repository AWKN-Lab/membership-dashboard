import React from 'react'

/** 纯 SVG 图表：不引第三方图表库 ⇒ 构建产物不含任何外部域名引用。 */

export function TrendLine({ data, unit = '%' }: { data: { month: string; rate: number }[]; unit?: string }) {
  const W = 560, H = 160, P = 28
  if (!data.length) return <div className="state-empty" data-testid="trend-empty">暂无数据</div>
  const vals = data.map((d) => d.rate)
  const min = Math.min(...vals) - 3, max = Math.max(...vals) + 3
  const x = (i: number) => P + (i * (W - P * 2)) / Math.max(1, data.length - 1)
  const y = (v: number) => H - P - ((v - min) / Math.max(1, max - min)) * (H - P * 2)
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.rate).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" data-testid="trend-line">
      <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="#e3e5e8" />
      <path d={path} fill="none" stroke="#0052d9" strokeWidth={2} />
      {data.map((d, i) => (
        <circle key={d.month} cx={x(i)} cy={y(d.rate)} r={2.5} fill="#0052d9" />
      ))}
      <text x={P} y={14} fontSize={11} fill="#6b7785">{`${data[0].month} → ${data[data.length - 1].month}`}</text>
      <text x={W - P} y={14} fontSize={11} fill="#6b7785" textAnchor="end">{`${max.toFixed(1)}${unit}`}</text>
    </svg>
  )
}

export interface StackSegment { key: string; label: string; value: number; color: string }

/**
 * 按楼层的堆叠条形图（#1896 验收第 1 条）：
 * **图例 + 条内数值标签必须同时出现** ⇒ 段宽度够就画在段内，窄段则标注在外侧。
 */
export function StackedBarByFloor({
  rows, onFloorClick,
}: {
  rows: { floorId: string; floorName: string; parts: StackSegment[] }[]
  onFloorClick?: (floorId: string) => void
}) {
  if (!rows.length) return <div className="state-empty" data-testid="stack-empty">暂无楼层数据</div>
  const totals = rows.map((r) => r.parts.reduce((s, p) => s + p.value, 0) || 1)
  const max = Math.max(...totals)
  return (
    <div data-testid="stacked-bar">
      <div className="legend" data-testid="legend">
        {rows[0].parts.map((p) => (
          <span className="legend__item" key={p.key} data-testid={`legend-${p.key}`}>
            <span className="legend__swatch" style={{ background: p.color }} />{p.label}
          </span>
        ))}
      </div>
      {rows.map((r, i) => (
        <div className="bar-row" key={r.floorId}>
          <span className="bar-row__name">{r.floorName}</span>
          <div className="bar-row__track" style={{ width: `${(totals[i] / max) * 100}%` }}>
            {r.parts.map((p) => {
              const pct = (p.value / totals[i]) * 100
              const wide = pct > 14
              return (
                <div
                  key={p.key}
                  className="bar-seg"
                  data-testid={`seg-${r.floorId}-${p.key}`}
                  style={{ width: `${pct}%`, background: p.color }}
                  title={`${r.floorName} ${p.label} ${p.value}`}
                  onClick={() => onFloorClick?.(r.floorId)}
                >
                  {wide ? `${p.label} ${p.value}` : p.value}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export function BucketBar({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1)
  return (
    <div data-testid="bucket-bar">
      {data.map((v, i) => (
        <div className="bar-row" key={labels[i]}>
          <span className="bar-row__name">{labels[i]}</span>
          <div className="bar-row__track" style={{ width: `${(v / max) * 100}%`, background: '#e37318' }} />
          <span style={{ fontSize: 12 }}>{v}</span>
        </div>
      ))}
    </div>
  )
}
