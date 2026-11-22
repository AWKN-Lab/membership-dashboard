import {describe,it,expect,vi} from 'vitest'
import {render,screen,fireEvent,waitFor} from '@testing-library/react'
import {MemoryRouter,useLocation,useNavigate} from 'react-router-dom'
import App from '../src/App'
import {fetchPanelData,occupancySnapshot} from '../src/mock/api'
import {parseFilters,presetRange,filtersToQuery,updateFilter} from '../src/shell/filters'
import {panelExportRows,csvText} from '../src/panels/export'
const now=new Date('2026-11-22T00:00Z')
const granted={canViewCluster:true},denied={canViewCluster:false}
const f=parseFilters('?venue=club&range=custom&from=2026-05-01&to=2026-08-31',granted,now)
function Probe(){const l=useLocation(),nav=useNavigate();return <><output data-testid="actual-url">{l.pathname+l.search}</output><button onClick={()=>nav(-1)}>返回测试</button></>}
describe('实际行为回归',()=>{
 it('权限限制覆盖伪造 URL 与数据入口，不仅隐藏选项',async()=>{
  const hostile=parseFilters('?venue=cluster&range=custom&from=2026-01-01&to=2026-02-28',denied,now)
  expect(hostile.venue).toBe('club')
  await expect(fetchPanelData('network',{...hostile,venue:'cluster'},denied)).rejects.toThrow('无权限')
  render(<MemoryRouter initialEntries={['/dash?tab=network&venue=cluster&perm=club']}><App/><Probe/></MemoryRouter>)
  expect((screen.getByTestId('filter-venue') as HTMLSelectElement).value).toBe('club')
  await waitFor(()=>expect(screen.getByTestId('actual-url').textContent).toContain('venue=club'))
  await waitFor(()=>expect(screen.getByTestId('chart-network').dataset.option).toBeTruthy())
  expect(screen.getByTestId('chart-network').dataset.option).not.toContain('园区 B 座')
 })
 it('权限由宿主注入时不受演示 query 变更影响',async()=>{
  render(<MemoryRouter initialEntries={['/dash?tab=network&venue=cluster']}><App permission={denied}/><Probe/></MemoryRouter>)
  await waitFor(()=>expect(screen.getByTestId('actual-url').textContent).toContain('venue=club'))
  expect(screen.queryByRole('option',{name:'集团'})).toBeNull()
 })
 it('预设按当前日期计算，非法自定义日期回退，合法锚点刷新保持',()=>{
  expect(presetRange('this_month',now)).toEqual({from:'2026-11-01',to:'2026-11-30'})
  expect(presetRange('last_month',now)).toEqual({from:'2026-10-01',to:'2026-10-31'})
  expect(presetRange('this_quarter',now)).toEqual({from:'2026-10-01',to:'2026-12-31'})
  for(const [from,to] of [['2026-02-30','2026-03-01'],['2026-11-30','2026-11-01'],['bad','2026-11-30']]){
   expect(parseFilters('?range=custom&from='+from+'&to='+to,granted,now).range).toBe('this_month')
  }
  expect(updateFilter(f,{range:'last_month'},granted,now).to).toBe('2026-10-31')
  expect(parseFilters(filtersToQuery(f),granted,new Date('2027-01-01Z'))).toEqual(f)
 })
 it('自定义日期经实际路由保存、后续导航保留',async()=>{
  render(<MemoryRouter initialEntries={['/dash?tab=finance&range=custom&from=2026-05-01&to=2026-08-31']}><App/><Probe/></MemoryRouter>)
  fireEvent.change(screen.getByTestId('filter-to'),{target:{value:'2026-09-30'}})
  fireEvent.click(screen.getByTestId('filter-apply'))
  await waitFor(()=>expect(screen.getByTestId('actual-url').textContent).toContain('to=2026-09-30'))
  fireEvent.change(screen.getByTestId('filter-compare'),{target:{value:'yoy'}})
  await waitFor(()=>expect(screen.getByTestId('actual-url').textContent).toContain('compare=yoy'))
  fireEvent.click(screen.getByText('返回测试'))
  await waitFor(()=>expect((screen.getByTestId('filter-compare') as HTMLSelectElement).value).toBe('mom'))
  expect((screen.getByTestId('filter-to') as HTMLInputElement).value).toBe('2026-09-30')
 })
 it('期末值等于库存合计和趋势末点，环比与同比独立计算',async()=>{
  for(const venue of ['club','cluster'] as const){
   const a=(await fetchPanelData('occupancy',{...f,venue},granted)).occupancy!
   const b=(await fetchPanelData('occupancy',{...f,venue,compare:'yoy'},granted)).occupancy!
   const total=a.floors.reduce((n,r)=>n+r.rented+r.reserved+r.vacant,0)
   const rented=a.floors.reduce((n,r)=>n+r.rented,0)
   expect(a.rateEnd).toBe(Math.round(rented/total*1000)/10)
   expect(a.trendRates.at(-1)).toBe(a.rateEnd);expect(a.trendMonths.at(-1)).toBe('2026-08')
   expect(a.rateMoM).toBe(Math.round((a.rateEnd-occupancySnapshot(venue,'2026-07-31').rate)*10)/10)
   expect(a.rateYoY).toBe(Math.round((a.rateEnd-occupancySnapshot(venue,'2025-08-31').rate)*10)/10)
   expect(b).toEqual(a)
   const overview=(await fetchPanelData('key-metrics',{...f,venue},granted)).keyMetrics!
   expect(overview.find(m=>m.key==='occupancy')?.value).toBe(a.rateEnd.toFixed(1)+'%')
  }
 })
 it('比较切换的本期值保持不变，范围变化不产生伪造月份',async()=>{
  const a=(await fetchPanelData('key-metrics',f)).keyMetrics!
  const b=(await fetchPanelData('key-metrics',{...f,compare:'yoy'})).keyMetrics!
  expect(a.map(m=>m.value)).toEqual(b.map(m=>m.value))
  const finance=(await fetchPanelData('finance-contract',f)).contractAmount!
  expect(finance.months.at(-1)).toBe('2026-08')
 })
 it('8个面板 CSV 有与数据同源的数据行，特殊字符正确转义',async()=>{
  const ids=['key-metrics','network','funnel','occupancy','member-success','org-agent','finance-contract','finance-revenue']
  for(const id of ids){const d=await fetchPanelData(id,f);const rows=panelExportRows(id,d,f);expect(rows.length,id).toBeGreaterThan(0);expect(csvText(['a'],rows).split('\r\n').length).toBe(rows.length+1)}
  const csv=csvText(['公司'],[['a"b,c'],['=2+3']]);expect(csv).toContain('"a""b,c"');expect(csv).toContain('"\'=2+3"')
 })
 it('非正常状态导出 disabled，正常状态真实绑定数据',async()=>{
  const a=render(<MemoryRouter initialEntries={['/dash?tab=finance&state=empty']}><App/></MemoryRouter>)
  for(const b of screen.getAllByTestId('card-export'))expect((b as HTMLButtonElement).disabled).toBe(true)
  a.unmount()
  render(<MemoryRouter initialEntries={['/dash?tab=finance']}><App/></MemoryRouter>)
  await waitFor(()=>expect((screen.getAllByTestId('card-export')[0] as HTMLButtonElement).disabled).toBe(false))
 })
 it('点击导出绑定当前面板实际 CSV，而非空表头',async()=>{
  const create=vi.fn((_blob:Blob)=>'blob:csv-test'),revoke=vi.fn()
  const originalCreate=URL.createObjectURL,originalRevoke=URL.revokeObjectURL
  URL.createObjectURL=create;URL.revokeObjectURL=revoke
  const click=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{})
  try{
   render(<MemoryRouter initialEntries={['/dash?tab=leads&range=custom&from=2026-05-01&to=2026-08-31']}><App/></MemoryRouter>)
   const b=screen.getByTestId('card-export') as HTMLButtonElement
   await waitFor(()=>expect(b.disabled).toBe(false))
   fireEvent.click(b);expect(create).toHaveBeenCalledTimes(1)
   const blob=create.mock.calls[0][0],reader=new FileReader()
   const csv=await new Promise<string>((ok,fail)=>{reader.onload=()=>ok(String(reader.result));reader.onerror=fail;reader.readAsText(blob)})
   const data=await fetchPanelData('occupancy',f)
   const row=data.occupancy!.floors[0]
   expect(csv).toContain('"'+row.floorName+'","'+row.rented+'","'+row.reserved+'","'+row.vacant+'"')
   expect(csv.split('\r\n').length).toBe(6)
  }finally{click.mockRestore();URL.createObjectURL=originalCreate;URL.revokeObjectURL=originalRevoke}
 })
 it('同比 UI 口径与独立计算值一致',async()=>{
  render(<MemoryRouter initialEntries={['/dash?tab=leads&range=custom&from=2026-05-01&to=2026-08-31&compare=yoy']}><App/></MemoryRouter>)
  const d=(await fetchPanelData('occupancy',{...f,compare:'yoy'})).occupancy!
  await waitFor(()=>expect(screen.getByTestId('rate-mom').textContent).toContain('同比 '+(d.rateYoY>=0?'+':'')+d.rateYoY.toFixed(1)+'pp'))
  expect(screen.getByTestId('metric-definition').textContent).toContain('上年同期')
 })
})
