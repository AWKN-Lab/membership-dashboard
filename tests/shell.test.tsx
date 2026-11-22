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
 it('group option absent for restricted role',()=>{render(<MemoryRouter initialEntries={['/dash?tab=finance&scope=group']}><App access={{siteId:'site-a',canViewGroup:false}}/></MemoryRouter>);expect(screen.queryByRole('option',{name:'集团'})).toBeNull();expect((screen.getByLabelText('会所') as HTMLSelectElement).value).toBe('site')})
})
