import {describe,it,expect} from 'vitest'
import {render,screen,fireEvent,waitFor} from '@testing-library/react'
import {MemoryRouter,useLocation,useNavigate} from 'react-router-dom'
import App from '../src/App'
import {PANELS,panelsFor} from '../src/shell/panels'
const labels=['总览','网络','商机漏斗','招商','会员成功','组织与 Agent','财务']
function Probe(){const l=useLocation(),n=useNavigate();return <><output data-testid="url">{l.pathname+l.search}</output><button onClick={()=>n(-1)}>back</button></>}
describe('shell',()=>{
 it('exact tabs, eight registry entries and finance only two',()=>{render(<MemoryRouter initialEntries={['/dash?tab=finance']}><App/></MemoryRouter>);expect(screen.getByTestId('tabs').textContent).toBe(labels.join(''));expect(PANELS).toHaveLength(8);expect(new Set(PANELS.map(p=>p.id)).size).toBe(8);expect(panelsFor('finance').map(p=>p.title)).toEqual(['签约额','会籍收入']);expect(screen.getAllByTestId('panel-card')).toHaveLength(2)})
 it.each(['loading','empty','error'])('renders %s with metadata and no values',async state=>{render(<MemoryRouter initialEntries={['/dash?tab=finance&state='+state]}><App/></MemoryRouter>);expect(screen.getAllByTestId('card-'+state)).toHaveLength(2);expect(screen.getAllByTestId('metric-definition')[0].textContent).toContain('口径');expect(screen.getAllByTestId('as-of')).toHaveLength(2)})
 it('changes actual route, keeps tab, reconstructs from URL and supports back',async()=>{const {unmount}=render(<MemoryRouter initialEntries={['/dash?tab=finance']}><App/><Probe/></MemoryRouter>);await waitFor(()=>expect(screen.getByTestId('url').textContent).toContain('comparison=mom'));fireEvent.change(screen.getByLabelText('对比方式'),{target:{value:'yoy'}});await waitFor(()=>expect(screen.getByTestId('url').textContent).toContain('comparison=yoy'));const path=screen.getByTestId('url').textContent!;expect(path).toContain('tab=finance');fireEvent.click(screen.getByText('back'));await waitFor(()=>expect((screen.getByLabelText('对比方式') as HTMLSelectElement).value).toBe('mom'));unmount();render(<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>);expect((screen.getByLabelText('对比方式') as HTMLSelectElement).value).toBe('yoy')})
 it.each([
  ['overview',5],['network',1],['funnel',1],['sales',1],['success',1],['org-agent',1],['finance',2],
 ])('renders registered panels for %s', (tab,count)=>{
   render(<MemoryRouter initialEntries={['/dash?tab='+tab]}><App/></MemoryRouter>)
   expect(screen.getByTestId('tab-'+tab).getAttribute('aria-current')).toBe('page')
   expect(screen.getAllByTestId('panel-card')).toHaveLength(count)
 })
 it('does not render export controls without permission',async()=>{
   render(<MemoryRouter initialEntries={['/dash?tab=overview']}><App access={{siteId:'site-private',canViewGroup:false,canExport:false}}/></MemoryRouter>)
   await screen.findByTestId('rate-end')
   expect(screen.queryByRole('button',{name:'导出'})).toBeNull()
 })
 it('shows data-origin cutoff and permitted export on loaded cards',async()=>{
   render(<MemoryRouter initialEntries={['/dash?tab=overview&period=custom&start=2026-11-01&end=2026-11-17']}><App access={{siteId:'site-demo-a',canViewGroup:true,canExport:true}}/></MemoryRouter>)
   await screen.findByTestId('rate-end')
   expect(screen.getAllByRole('button',{name:'导出'})).toHaveLength(5)
   expect(screen.getAllByTestId('as-of')[0].textContent).toContain('2026-11-17T23:59:59Z')
 })
 it('custom dates and comparison remain in the route after remount',async()=>{
   const {unmount}=render(<MemoryRouter initialEntries={['/dash?tab=finance']}><App/><Probe/></MemoryRouter>)
   fireEvent.change(screen.getByLabelText('时间范围'),{target:{value:'custom'}})
   fireEvent.change(screen.getByLabelText('开始'),{target:{value:'2026-08-12'}})
   fireEvent.change(screen.getByLabelText('结束'),{target:{value:'2026-09-06'}})
   fireEvent.click(screen.getByRole('button',{name:'应用'}))
   fireEvent.change(screen.getByLabelText('对比方式'),{target:{value:'yoy'}})
   await waitFor(()=>expect(screen.getByTestId('url').textContent).toContain('comparison=yoy'))
   const href=screen.getByTestId('url').textContent!
   expect(href).toContain('start=2026-08-12')
   expect(href).toContain('end=2026-09-06')
   unmount()
   render(<MemoryRouter initialEntries={[href]}><App/></MemoryRouter>)
   expect((screen.getByLabelText('时间范围') as HTMLSelectElement).value).toBe('custom')
   expect((screen.getByLabelText('开始') as HTMLInputElement).value).toBe('2026-08-12')
   expect((screen.getByLabelText('结束') as HTMLInputElement).value).toBe('2026-09-06')
   expect((screen.getByLabelText('对比方式') as HTMLSelectElement).value).toBe('yoy')
 })
 it('group option absent for restricted role',()=>{render(<MemoryRouter initialEntries={['/dash?tab=finance&scope=group']}><App access={{siteId:'site-a',canViewGroup:false}}/></MemoryRouter>);expect(screen.queryByRole('option',{name:'集团'})).toBeNull();expect((screen.getByLabelText('会所') as HTMLSelectElement).value).toBe('site')})
})
