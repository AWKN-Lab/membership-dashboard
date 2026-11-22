import { useEffect, useRef } from 'react'
import { echarts } from './echarts'

/** ECharts React 封装：option 变化即 setOption；卸载时 dispose。 */
export function EChart({
  option,
  height = 260,
  testId = 'echart',
}: {
  option: Record<string, unknown>
  height?: number
  testId?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || el.clientWidth === 0) return
    const chart = echarts.init(el, undefined, { renderer: 'canvas' })
    chart.setOption(option as never)
    // 把 option 挂到 DOM ⇒ 验收方（与平台预检）可**机器读取**图例/标签配置
    el.dataset.option = JSON.stringify(option)
    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      chart.dispose()
    }
  }, [option])
  return <div ref={ref} data-testid={testId} style={{ width: '100%', height }} />
}
