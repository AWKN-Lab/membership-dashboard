/**
 * ECharts option 构造器（**纯函数**，可单测）。
 * 客户约定：所有图表除颜色外都有文字标签 ⇒ 每个 series 都带 label.show。
 */
import { tokens, labelStyle } from '../design/tokens'

export interface FloorRow {
  floorId: string
  floorName: string
  rented: number
  reserved: number
  vacant: number
}

const axis = { color: tokens.color.textWeak, fontSize: 11 }

/** 出租率：按楼层的堆叠条形（图例 + **条内数值标签**同时标注） */
export function occupancyStackedOption(rows: FloorRow[]) {
  const totals = rows.map((r) => Math.max(r.rented + r.reserved + r.vacant, 1))
  const max = Math.max(...totals, 1)
  return {
    color: [tokens.color.rent, tokens.color.reserved, tokens.color.vacant],
    tooltip: { trigger: 'axis' },
    legend: {
      selectedMode: false,
      show: true,
      data: ['已租', '预留', '空置'],
      top: 0,
      textStyle: axis,
    },
    grid: { left: 48, right: 24, top: 36, bottom: 24 },
    xAxis: {
      type: 'value',
      max,
      axisLabel: axis,
      splitLine: { lineStyle: { color: tokens.color.border } },
    },
    yAxis: { type: 'category', data: rows.map((r) => r.floorName), axisLabel: axis },
    series: [
      { name: '已租', type: 'bar', stack: 'total', label: { ...labelStyle, position: 'inside' }, data: rows.map((r) => r.rented) },
      { name: '预留', type: 'bar', stack: 'total', label: { ...labelStyle, position: 'inside' }, data: rows.map((r) => r.reserved) },
      { name: '空置', type: 'bar', stack: 'total', label: { ...labelStyle, position: 'inside' }, data: rows.map((r) => r.vacant) },
    ],
  }
}

/** 12 个月趋势折线（带文字标签） */
export function trendLineOption(
  months: string[],
  values: number[],
  name: string,
  unit = '%',
) {
  return {
    color: [tokens.color.brand],
    tooltip: { trigger: 'axis' },
    grid: { left: 48, right: 48, top: 24, bottom: 28 },
    xAxis: { type: 'category', data: months, axisLabel: axis },
    yAxis: { type: 'value', axisLabel: axis, splitLine: { lineStyle: { color: tokens.color.border } } },
    series: [
      {
        name,
        type: 'line',
        smooth: true,
        label: { ...labelStyle, formatter: (p: { value: number }) => `${p.value}${unit}` },
        data: values,
      },
    ],
  }
}

/** 到期分桶条形（30/60/90 天） */
export function bucketBarOption(categories: string[], values: number[]) {
  return {
    color: [tokens.color.reserved],
    tooltip: { trigger: 'axis' },
    grid: { left: 64, right: 32, top: 16, bottom: 24 },
    xAxis: { type: 'value', axisLabel: axis, splitLine: { lineStyle: { color: tokens.color.border } } },
    yAxis: { type: 'category', data: categories, axisLabel: axis },
    series: [
      {
        name: '工位数',
        type: 'bar',
        label: { ...labelStyle, position: 'right' },
        data: values,
      },
    ],
  }
}

/** 漏斗（带文字标签） */
export function funnelOption(stages: { name: string; value: number }[]) {
  return {
    color: [tokens.color.brand],
    tooltip: { trigger: 'item' },
    legend: { show: true, data: stages.map((s) => s.name), top: 0, textStyle: axis },
    series: [
      {
        name: '商机漏斗',
        type: 'funnel',
        left: '8%',
        right: '8%',
        top: 32,
        bottom: 8,
        label: { ...labelStyle, formatter: (p: { name: string; value: number }) => `${p.name} ${p.value}` },
        data: stages,
      },
    ],
  }
}

/** 分组柱状（带文字标签） */
export function groupedBarOption(
  categories: string[],
  series: { name: string; data: number[]; color?: string }[],
) {
  return {
    color: series.map((s) => s.color ?? tokens.color.brand),
    tooltip: { trigger: 'axis' },
    legend: { show: true, data: series.map((s) => s.name), top: 0, textStyle: axis },
    grid: { left: 48, right: 24, top: 36, bottom: 28 },
    xAxis: { type: 'category', data: categories, axisLabel: axis },
    yAxis: { type: 'value', axisLabel: axis, splitLine: { lineStyle: { color: tokens.color.border } } },
    series: series.map((s) => ({
      name: s.name,
      type: 'bar',
      label: { ...labelStyle, position: 'top' },
      data: s.data,
    })),
  }
}
