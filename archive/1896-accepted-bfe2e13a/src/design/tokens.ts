/**
 * 设计变量的 TS 出口：ECharts 配色必须与 CSS 变量一致（客户约定「配色取设计变量」）。
 * 改这里 = 改 src/design/tokens.css，两边由 tests/design.test.ts 断言一致。
 */
export const tokens = {
  color: {
    brand: '#1f5eff',
    rent: '#1f5eff',
    reserved: '#e37318',
    vacant: '#9aa4b2',
    positive: '#2ba471',
    negative: '#d54941',
    text: '#1b2430',
    textWeak: '#5b6674',
    surface: '#ffffff',
    border: '#e4e8ee',
  },
  radius: { card: 10 },
  space: { card: 16 },
} as const

/** ECharts 统一文字标签样式（客户约定：所有图表除颜色外都有文字标签） */
export const labelStyle = { show: true, color: '#1b2430', fontSize: 11 } as const
