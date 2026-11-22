import {afterEach} from 'vitest'
import {cleanup} from '@testing-library/react'
import {setPlatformAPI} from 'echarts/core'
setPlatformAPI({measureText:(text,font)=>({width:String(text).length*(parseFloat(font||'12')||12)*.6}) as TextMetrics})
afterEach(cleanup)
