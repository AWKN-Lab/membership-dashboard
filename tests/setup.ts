import {afterEach} from 'vitest'
import {cleanup} from '@testing-library/react'
import {setPlatformAPI} from 'echarts/core'
// jsdom 无 canvas 字体测量。仅测试环境提供固定估算；真实浏览器使用实际字体和 SVG。
setPlatformAPI({measureText:(text,font)=>({width:String(text).length*(parseFloat(font||'12')||12)*0.6}) as TextMetrics})
afterEach(cleanup)
