/**
 * ECharts **本地打包**（客户约定：统一使用本地打包的 ECharts，不走 CDN）。
 * 只注册用到的 chart / component ⇒ 体积可控；不引入任何外部请求。
 */
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, FunnelChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
} from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  FunnelChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  SVGRenderer,
])

export { echarts }
export type EChartsOption = ReturnType<typeof echarts.init> extends never ? never : object
