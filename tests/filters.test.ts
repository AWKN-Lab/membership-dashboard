import {describe,it,expect} from 'vitest'
import {periodRange,parseFilters,filtersToQuery,updateFilter,occupancyFilters} from '../src/shell/filters'
const now=new Date('2026-11-22T00:00:00Z')
describe('filters',()=>{
 it('presets resolve month, last month, quarter',()=>{expect(periodRange('this-month',now)).toEqual({start:'2026-11-01',end:'2026-11-30'});expect(periodRange('last-month',now)).toEqual({start:'2026-10-01',end:'2026-10-31'});expect(periodRange('this-quarter',now)).toEqual({start:'2026-10-01',end:'2026-12-31'})})
 it('round trip custom dates and comparison, preserves tab and unrelated parameters',()=>{const f=parseFilters('?scope=group&period=custom&start=2026-03-01&end=2026-04-20&comparison=yoy',undefined,now);const query=filtersToQuery(f,'?tab=finance&keep=1');expect(parseFilters(query,undefined,now)).toEqual(f);expect(new URLSearchParams(query).get('tab')).toBe('finance');expect(new URLSearchParams(query).get('keep')).toBe('1')})
 it('denies group in direct URL and updates when permission absent',()=>{const a={siteId:'site-private',canViewGroup:false};const f=parseFilters('?scope=group',a,now);expect(f.scope).toBe('site');expect(updateFilter(f,{scope:'group'},a,now).scope).toBe('site');expect(occupancyFilters(f,a).site_id).toBe('site-private')})
 it('rejects invalid or reversed custom dates',()=>{for(const s of ['start=2026-02-30&end=2026-04-01','start=2026-04-01&end=2026-03-01'])expect(parseFilters('?period=custom&'+s,undefined,now).period).toBe('this-month')})
})
