import {describe,it,expect} from 'vitest'
import {render,screen,fireEvent,waitFor,within} from '@testing-library/react'
import {MemoryRouter,Routes,Route} from 'react-router-dom'
import {mockOccupancy} from '../src/mock/api'
import {OccupancyRatePanel,FloorStateView} from '../src/panel/OccupancyRatePanel'
import {resolveChartColor} from '../src/panel/charts'
const f={org_id:'org-demo',site_id:'site-demo-a',month:'2026-11'}
describe('occupancy',()=>{
 it('period-end metric and final trend match floor inventory exactly',()=>{for(const site of ['site-a','group-demo']){const d=mockOccupancy('org-demo',site,'2026-11',false,'2026-11-22');const rented=d.floors.reduce((n,f)=>n+f.rented,0);const total=d.floors.reduce((n,f)=>n+f.rented+f.reserved+f.vacant,0);expect(d.rateEnd).toBe(Math.round(rented/total*1000)/10);expect(d.trend12m.at(-1)?.rate).toBe(d.rateEnd);expect(d.rateMoM).toBe(Math.round((d.rateEnd-d.trend12m.at(-2)!.rate)*10)/10)}})
 it('mock snapshot date is deterministic',()=>{const a=mockOccupancy('o','s','2026-11',false,'2026-11-01');expect(mockOccupancy('o','s','2026-11',false,'2026-11-01')).toEqual(a);expect(mockOccupancy('o','s','2026-11',false,'2026-11-02')).not.toEqual(a)})
 it('renders actual ECharts SVG legend and segment values, not a substitute DOM chart',async()=>{render(<MemoryRouter><OccupancyRatePanel filters={f}/></MemoryRouter>);const stack=await screen.findByTestId('stacked-bar');const surface=within(stack).getByTestId('echarts-surface');await waitFor(()=>expect(surface.querySelector('svg')).toBeTruthy());const svg=surface.querySelector('svg')!;for(const s of ['已租','预留','空置'])expect(svg.textContent).toContain(s);expect(svg.querySelectorAll('text').length).toBeGreaterThan(15);expect(within(stack).getByRole('table')).toBeTruthy()})
 it('ECharts colors use design variables',()=>{
   document.documentElement.style.setProperty('--dash-chart-primary','#aabbcc')
   expect(resolveChartColor('--dash-chart-primary','#0052d9')).toBe('#aabbcc')
   document.documentElement.style.removeProperty('--dash-chart-primary')
 })
 it('timestamp is sourced from returned data snapshot',()=>{
   const d=mockOccupancy('org-demo','site-demo-a','2026-11',false,'2026-11-17')
   expect(d.dataAsOf).toBe('2026-11-17T23:59:59Z')
 })
 it('floor action navigates to stub with floorId',async()=>{render(<MemoryRouter><Routes><Route path="/" element={<OccupancyRatePanel filters={f}/>}/><Route path="/floors/:floorId" element={<FloorStateView/>}/></Routes></MemoryRouter>);await screen.findByTestId('stacked-bar');fireEvent.click(screen.getByRole('button',{name:'F1 层'}));expect((await screen.findByTestId('floor-id')).textContent).toBe('fl-f1')})
 it('empty has no chart and no zero',async()=>{render(<MemoryRouter><OccupancyRatePanel filters={f} empty/></MemoryRouter>);await screen.findAllByTestId('card-empty');expect(screen.queryByTestId('rate-end')).toBeNull();expect(screen.queryByTestId('echarts-surface')).toBeNull()})
 it('shows period-end and comparison',async()=>{render(<MemoryRouter><OccupancyRatePanel filters={f} comparison="yoy"/></MemoryRouter>);expect((await screen.findByTestId('rate-end')).textContent).toMatch(/\d+\.\d%/);expect(screen.getByTestId('rate-mom').textContent).toContain('环比');expect(screen.getByTestId('rate-yoy').textContent).toContain('同比')})
})
