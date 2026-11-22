import {chromium} from 'playwright-core'
import {createServer} from 'node:http'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import {resolve,extname} from 'node:path'
import {strict as assert} from 'node:assert'
import {existsSync} from 'node:fs'
const dist=resolve('dist'),out=resolve('docs/screenshots')
const writeShots=!process.argv.includes('--check-only')&&!process.argv.includes('--evidence-only')
const writeEvidence=!process.argv.includes('--check-only')
if(!existsSync(dist+'/index.html'))throw Error('先执行 npm run build')
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff'}
const server=createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)
 let f=resolve(dist,'.'+pathname);if(f!==dist&&!f.startsWith(dist+'/'))throw Error('path')
 if(!extname(f))f=dist+'/index.html'
 res.setHeader('Content-Type',mime[extname(f)]||'application/octet-stream');res.end(await readFile(f))
}catch{res.writeHead(404);res.end('not found')}})
await new Promise(r=>server.listen(0,'127.0.0.1',r))
const base='http://127.0.0.1:'+server.address().port
const local=u=>u.startsWith(base+'/')||u.startsWith('blob:')||u.startsWith('data:')
let browser
const evidence=[]
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']})
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1,acceptDownloads:true})
 const bad=[]
 page.on('pageerror',e=>bad.push('pageerror: '+e.message))
 page.on('request',r=>{if(!local(r.url()))bad.push('external: '+r.url())})
 await page.route('**/*',r=>local(r.request().url())?r.continue():r.abort())
 const anchor='&range=custom&from=2026-05-01&to=2026-08-31'
 async function visit(tab,extra=''){await page.goto(base+'/dash?tab='+tab+extra);await page.getByTestId('tabs').waitFor()}
 async function shot(name,tab,extra='',state='normal'){
  await visit(tab,extra)
  if(state==='normal'){await page.getByTestId('card-content').first().waitFor();await page.getByTestId('card-export').first().waitFor()}
  else await page.getByTestId('card-'+state).first().waitFor()
  if(writeShots){await mkdir(out,{recursive:true});await page.screenshot({path:resolve(out,name),fullPage:true})}
  evidence.push('CAPTURE/ASSERT '+name+' '+state)
 }
 for(const [name,tab] of [['tab-overview','overview'],['tab-network','network'],['tab-funnel','funnel'],['tab-leads','leads'],['tab-member-success','member-success'],['tab-org-agent','org-agent'],['tab-finance','finance']])await shot(name+'.png',tab,anchor)
 for(const state of ['loading','empty','error']){
   await shot('card-'+state+'.png','leads',anchor+'&state='+state,state)
   assert.equal(await page.getByTestId('card-export').first().isDisabled(),true)
   assert.equal(await page.getByTestId('chart-stacked').count(),0)
 }
 await shot('occupancy-panel.png','leads',anchor)
 const chart=page.getByTestId('chart-stacked'),svg=chart.locator('svg')
 await svg.waitFor()
 const opt=JSON.parse(await chart.getAttribute('data-option'))
 assert.deepEqual(opt.legend.data,['已租','预留','空置'])
 for(const s of opt.series){assert.equal(s.label.show,true);assert.equal(s.label.position,'inside')}
 for(const label of opt.legend.data)await svg.getByText(label,{exact:true}).first().waitFor()
 const total=opt.series.reduce((n,s)=>n+s.data.reduce((a,b)=>a+b,0),0)
 const rented=opt.series[0].data.reduce((a,b)=>a+b,0)
 const end=(Math.round(rented/total*1000)/10).toFixed(1)+'%'
 assert.equal(await page.getByTestId('rate-end').textContent(),end)
 const trend=JSON.parse(await page.getByTestId('chart-trend').getAttribute('data-option'))
 assert.equal(trend.xAxis.data.at(-1),'2026-08');assert.equal(trend.series[0].data.at(-1).toFixed(1)+'%',end)
 const d=page.waitForEvent('download');await page.getByTestId('card-export').click();const download=await d
 const csv=await readFile(await download.path(),'utf8')
 assert.equal(csv.split('\r\n').length,6)
 assert.ok(csv.includes('"F1 层","'+opt.series[0].data[0]+'","'+opt.series[1].data[0]+'","'+opt.series[2].data[0]+'"'))
 evidence.push('PASS CSV exact floor values; six rows including header; '+download.suggestedFilename())
 evidence.push('PASS occupancy '+end+' equals inventory totals '+rented+'/'+total+' and trend; last month 2026-08')
 const mom=await page.getByTestId('rate-mom').textContent()
 await page.getByTestId('filter-compare').selectOption('yoy')
 await page.waitForURL(/compare=yoy/)
 await page.getByTestId('rate-end').waitFor()
 assert.equal(await page.getByTestId('rate-end').textContent(),end)
 assert.match(await page.getByTestId('rate-mom').textContent(),/^同比/)
 assert.match(await page.getByTestId('metric-definition').textContent(),/上年同期/)
 const yoy=await page.getByTestId('rate-mom').textContent()
 evidence.push('PASS comparison value stable; '+mom+' → '+yoy)
 await page.reload();await page.getByTestId('rate-end').waitFor()
 assert.equal(await page.getByTestId('filter-compare').inputValue(),'yoy')
 assert.equal(await page.getByTestId('filter-to').inputValue(),'2026-08-31')
 if(writeShots)await page.screenshot({path:resolve(out,'filters-custom.png'),fullPage:true})
 await page.goBack();await page.getByTestId('rate-end').waitFor()
 assert.equal(await page.getByTestId('filter-compare').inputValue(),'mom')
 const stacked=page.getByTestId('chart-stacked')
 await stacked.scrollIntoViewIfNeeded()
 // Real SVG plot geometry: first category is at the bottom, click its rented segment.
 const box=await stacked.boundingBox()
 const height=box.height;const y=36+(height-36-24)*4.5/5
 await page.mouse.click(box.x+48+10,box.y+y)
 await page.waitForURL(/\/floors\/fl-f1\?/)
 assert.match(page.url(),/from=2026-05-01/);assert.match(page.url(),/to=2026-08-31/)
 await page.getByTestId('floor-view').waitFor()
 await page.reload();await page.getByTestId('floor-view').waitFor()
 evidence.push('PASS actual chart series click; route '+new URL(page.url()).pathname+'?'+new URL(page.url()).searchParams.toString()+'; reload survives')
 await visit('network','&venue=cluster&perm=club'+anchor)
 await page.getByTestId('chart-network').locator('svg').waitFor()
 assert.equal(await page.getByTestId('filter-venue').inputValue(),'club')
 assert.equal(new URL(page.url()).searchParams.get('venue'),'club')
 const restricted=await page.getByTestId('chart-network').getAttribute('data-option')
 assert.ok(!restricted.includes('园区 B 座'))
 evidence.push('PASS direct restricted URL coerced to club; group mock rows absent')
 await visit('overview',anchor)
 await page.getByTestId('card-content').first().waitFor()
 await page.getByTestId('metric-tip-trigger').first().hover()
 await page.getByRole('tooltip').waitFor()
 if(writeShots)await page.screenshot({path:resolve(out,'metric-tip-hover.png'),fullPage:true})
 evidence.push('PASS metric definition hover')
 assert.deepEqual(bad,[])
 evidence.push('PASS browser zero external requests and page errors')
 for(const line of evidence)console.log(line)
 if(writeEvidence){await mkdir(resolve('docs'),{recursive:true});await writeFile(resolve('docs/acceptance-evidence.md'),'# 浏览器实际验收证据\n\n'+evidence.map(x=>'- '+x).join('\n')+'\n')}
}finally{await browser?.close();await new Promise(r=>server.close(r))}
