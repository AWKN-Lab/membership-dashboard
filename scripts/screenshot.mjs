import {chromium} from 'playwright-core'
import {createServer} from 'node:http'
import {readFile, mkdir} from 'node:fs/promises'
import {resolve,extname} from 'node:path'
import {strict as assert} from 'node:assert'
const dir=resolve('dist'),out=resolve('docs/screenshots')
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff'}
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname;let f=resolve(dir,'.'+path);if(!f.startsWith(dir+'/')&&f!==dir)throw Error('path');if(!extname(f))f=resolve(dir,'index.html');res.setHeader('Content-Type',types[extname(f)]||'application/octet-stream');res.end(await readFile(f))}catch{res.writeHead(404);res.end('not found')}})
await new Promise(r=>server.listen(0,'127.0.0.1',r))
const base='http://127.0.0.1:'+server.address().port
await mkdir(out,{recursive:true})
let browser
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']})
 const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1})
 const bad=[]
 page.on('pageerror',e=>bad.push(String(e)))
 page.on('request',r=>{if(!r.url().startsWith(base+'/')&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))bad.push('external '+r.url())})
 await page.route('**/*',r=>r.request().url().startsWith(base+'/')||r.request().url().startsWith('data:')||r.request().url().startsWith('blob:')?r.continue():r.abort())
 const tabShots=[
  ['tab-overview.png','overview','stacked-bar'],
  ['tab-network.png','network','panel-card'],
  ['tab-funnel.png','funnel','panel-card'],
  ['tab-sales.png','sales','panel-card'],
  ['tab-success.png','success','panel-card'],
  ['tab-org-agent.png','org-agent','panel-card'],
  ['tab-finance.png','finance','panel-card'],
 ]
 for(const [name,tab,marker] of tabShots){
  await page.goto(base+'/dash?tab='+tab+'&period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy')
  await page.getByTestId(marker).first().waitFor()
  assert.equal(await page.getByTestId('tab-'+tab).getAttribute('aria-current'),'page')
  if(tab==='finance'){
   assert.deepEqual(await page.locator('[data-testid="panel-card"] h3').allTextContents(),['签约额','会籍收入'])
  }
  if(tab==='overview')await page.getByTestId('stacked-bar').locator('svg text').first().waitFor()
  if(!process.argv.includes('--check-only'))await page.screenshot({path:resolve(out,name),fullPage:true})
  console.log('CAPTURE',name)
 }
 const shots=[['shell-tabs.png','finance','', 'panel-card'],['panel.png','overview','','stacked-bar'],['panel-empty.png','overview','&state=empty','card-empty'],['card-loading.png','overview','&state=loading','card-loading'],['card-error.png','overview','&state=error','card-error']]
 for(const [name,tab,extra,test] of shots){
  await page.goto(base+'/dash?tab='+tab+extra+'&period=custom&start=2026-11-01&end=2026-11-30')
  await page.getByTestId(test).first().waitFor()
  if(name==='panel.png'){
    const svg=page.getByTestId('stacked-bar').locator('svg')
    for(const label of ['已租','预留','空置'])await svg.getByText(label,{exact:true}).waitFor()
    assert((await svg.locator('text').count())>15)
  }
  if(!process.argv.includes('--check-only'))await page.screenshot({path:resolve(out,name),fullPage:true})
  console.log('CAPTURE',name)
 }
 await page.goto(base+'/dash?tab=finance')
 await page.getByLabel('对比方式').selectOption('yoy')
 await page.waitForURL(/comparison=yoy/)
 await page.reload()
 assert.equal(await page.getByLabel('对比方式').inputValue(),'yoy')
 assert.equal(new URL(page.url()).searchParams.get('tab'),'finance')
 await page.goto(base+'/dash?tab=overview&period=custom&start=2026-11-01&end=2026-11-30')
 await page.getByTestId('stacked-bar').waitFor()
 const stack=page.getByTestId('stacked-bar')
 // 点击图表中 F1 的数值标签，验证 ECharts series click。
 const n=await stack.getByRole('row',{name:/F1 层/}).locator('td').first().textContent()
 await stack.locator('svg').scrollIntoViewIfNeeded()
 const labels=await stack.locator('svg text').all()
 const hits=[]
 for(const label of labels){if((await label.textContent())===n){const b=await label.boundingBox();if(b)hits.push(b)}}
 hits.sort((a,b)=>a.y-b.y);assert(hits.length>0);const b=hits[0];await page.mouse.click(b.x+b.width/2,b.y+b.height/2)
 await page.waitForURL(/\/floors\/fl-f1\?/)
 assert.equal(new URL(page.url()).searchParams.get('month'),'2026-11')
 assert.deepEqual(bad,[])
 console.log('PASS browser: screenshots, refresh, chart floor navigation, zero external requests/page errors')
}finally{await browser?.close();await new Promise(r=>server.close(r))}
