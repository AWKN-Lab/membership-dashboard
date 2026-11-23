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
 // 无权限态捕获：同一 dist 产物，仅在服务层把演示权限常量 canExport:true 改为 false 后提供；
 // 不改 src/，不改 dist 文件本身。改写须恰好命中一次，否则直接失败。
 // 仅改 canExport（siteId 与 canViewGroup 保持演示值），使截图与 tab-overview.png 只有导出按钮一个差别；
 // 无权限的完整访问对象（site-private、无集团、无导出）由单元测试 tests/shell.test.tsx 断言覆盖。
 let noExport=false
 const DEMO_LITERAL='siteId:"site-demo-a",canViewGroup:!0,canExport:!0'
 const NOEXPORT_LITERAL='siteId:"site-demo-a",canViewGroup:!0,canExport:!1'
 await page.route('**/*',async r=>{
  const url=r.request().url()
  if(!url.startsWith(base+'/')&&!url.startsWith('data:')&&!url.startsWith('blob:'))return r.abort()
  if(noExport&&url.endsWith('.js')){
   const text=await readFile(resolve(dir,'.'+new URL(url).pathname),'utf8')
   assert.equal(text.split(DEMO_LITERAL).length-1,1,'DEMO_ACCESS literal must occur exactly once')
   return r.fulfill({contentType:'text/javascript',body:text.replace(DEMO_LITERAL,NOEXPORT_LITERAL)})
  }
  return r.continue()
 })
 const tabShots=[
  ['tab-overview.png','overview','stacked-bar'],
  ['tab-network.png','network','panel-card'],
  ['tab-funnel.png','funnel','panel-card'],
  ['tab-sales.png','sales','panel-card'],
  ['tab-success.png','success','panel-card'],
  ['tab-org-agent.png','org-agent','panel-card'],
  ['tab-finance.png','finance','panel-card'],
 ]
 // ── 中文字形自检（豆腐块会让全部中文截图失效）────────────────────────
 // 方法：用页面**实际生效的字体栈**把一段中文与一段**等长的缺字形参照**
 // （9 个私有区字符 U+E000，必定没有字形 ⇒ 渲染成 .notdef 盒）画到 canvas，
 // 比对像素签名与墨迹包围盒：
 //   * 两者完全一致 ⇒ 当前环境没有中文字形，中文全是豆腐块 ⇒ 失败；
 //   * 不一致 ⇒ 中文有真字形 ⇒ 继续。
 // 正控：9 个拉丁字母必须与参照不同，否则说明比对方法本身不可信。
 // ⚠️ 两个串**必须等长**：长度不同则位图宽度天然不同，会永远比不出问题。
 const NOTDEF_RUN='\uE000'.repeat(9)
 const CJK_RUN='会籍收入与商机漏斗'
 const LATIN_RUN='ABCDEFGHI'
 const assertCjkGlyphs=async page=>{
  const r=await page.evaluate(([cjkRun,notdefRun,latinRun])=>{
   const fam=getComputedStyle(document.body).fontFamily||'sans-serif'
   const canvas=document.createElement('canvas');canvas.width=384;canvas.height=64
   const g=canvas.getContext('2d')
   const measure=(text)=>{
    g.clearRect(0,0,384,64);g.fillStyle='#000';g.font='32px '+fam;g.textBaseline='top'
    g.fillText(text,4,4)
    const d=g.getImageData(0,0,384,64).data
    let sig=0,ink=0,x0=1e9,y0=1e9,x1=-1,y1=-1
    for(let i=0;i<d.length;i+=4){
     const a=d[i+3];sig=(sig*31+a)>>>0
     if(a>10){ink++;const px=(i/4)%384,py=Math.floor((i/4)/384)
      if(px<x0)x0=px;if(px>x1)x1=px;if(py<y0)y0=py;if(py>y1)y1=py}
    }
    return {sig,ink,bbox:ink?[x0,y0,x1-x0+1,y1-y0+1]:[0,0,0,0]}
   }
   const cjk=measure(cjkRun),notdef=measure(notdefRun),latin=measure(latinRun)
   const same=(a,b)=>a.sig===b.sig&&String(a.bbox)===String(b.bbox)
   return {cjk,notdef,latin,tofu:same(cjk,notdef),controlOk:!same(latin,notdef)}
  },[CJK_RUN,NOTDEF_RUN,LATIN_RUN])
  assert(r.controlOk,'FONT_CHECK_BROKEN: 字形自检正控失效（拉丁字母与缺字形渲染相同），比对方法不可信')
  assert(!r.tofu,'CJK_GLYPH_MISSING: 当前 Chromium 没有中文字形，截图里的中文全是豆腐块（.notdef）。请改用带中文字体的浏览器（CHROMIUM_PATH 指向含 Noto CJK 的环境，或安装 fonts-noto-cjk）后重截。')
  console.log('PASS font: CJK glyphs are real (not .notdef), ink bbox',JSON.stringify(r.cjk.bbox))
 }
 for(const [name,tab,marker] of tabShots){
  await page.goto(base+'/dash?tab='+tab+'&period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy')
  await page.getByTestId(marker).first().waitFor()
  await assertCjkGlyphs(page)
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
  await page.goto(base+'/dash?tab='+tab+extra+'&period=custom&start=2026-11-01&end=2026-11-22')
  await page.getByTestId(test).first().waitFor()
  if(name==='panel.png'){
    const svg=page.getByTestId('stacked-bar').locator('svg')
    for(const label of ['已租','预留','空置'])await svg.getByText(label,{exact:true}).waitFor()
    assert((await svg.locator('text').count())>15)
  }
  if(!process.argv.includes('--check-only'))await page.screenshot({path:resolve(out,name),fullPage:true})
  console.log('CAPTURE',name)
 }
 // 无权限态：导出按钮须一个都不渲染；其余内容与 tab-overview.png 一致（同一数据、同一 as-of）。
 noExport=true
 try{
  await page.goto(base+'/dash?tab=overview&period=custom&start=2026-11-01&end=2026-11-22&comparison=yoy')
  await page.getByTestId('stacked-bar').waitFor()
  assert.equal(await page.getByRole('button',{name:'导出'}).count(),0)
  assert.deepEqual(await page.getByTestId('as-of').allTextContents(),Array(5).fill('数据截至时间：2026-11-22T23:59:59Z'))
  if(!process.argv.includes('--check-only'))await page.screenshot({path:resolve(out,'tab-overview-noexport.png'),fullPage:true})
  console.log('CAPTURE','tab-overview-noexport.png')
 }finally{noExport=false}
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
