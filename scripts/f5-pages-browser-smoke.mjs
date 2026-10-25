import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--disable-web-security']});
const context=await browser.newContext({viewport:{width:915,height:412},isMobile:true,hasTouch:true,deviceScaleFactor:2,userAgent:'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36'});
const page=await context.newPage();
const errors=[],responses=[],consoleErrors=[];
page.on('console',msg=>{if(['error','warning'].includes(msg.type())&&consoleErrors.length<25)consoleErrors.push(msg.text().slice(0,250));});
page.on('pageerror',e=>errors.push(String(e.message).slice(0,350)));
page.on('response',r=>{if(r.status()>=400)responses.push({status:r.status(),url:r.url().slice(0,150)});});
const base=process.env.F5_TEST_URL||'http://127.0.0.1:8765';
let status={loaded:false,offline:false,entered:false,hud:false,errorCount:0,errors:[],missingMedia:0};
try {
  await page.goto(base+'/?lang=es',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#game-canvas').waitFor({timeout:30000});
  await page.waitForTimeout(7000); // allow main module/i18n and Vite imports to initialize
  await page.locator('#server-select-trigger').click({timeout:20000});
  await page.locator('#server-select-menu').waitFor({state:'visible',timeout:15000});
  await page.locator('#server-opt-offline').evaluate(el => el.click()); // bypass unstable animated layout in headless Chromium
  await page.locator('#btn-play').evaluate(el => el.click());
  await page.locator('#offline-select').waitFor({state:'visible',timeout:30000});
  status.offline=true;
  await page.locator('#char-name').fill('Hunter');
  await page.locator('#btn-start-offline').evaluate(el => el.click());
  // WOC intentionally waits for a second mobile user gesture to confirm fullscreen/landscape.
  await page.locator('#mobile-preflight-continue').waitFor({state:'visible',timeout:20000});
  await page.locator('#mobile-preflight-continue').evaluate(el=>el.click());
  try{await page.waitForFunction(()=>document.body.classList.contains('game-active'),null,{timeout:90000});status.entered=true;}catch(e){status.errors.push('Game never marked active within timeout: '+String(e).slice(0,180));}
  if(status.entered){try{await page.waitForFunction(()=>document.querySelector('#highfly-f5-hud')||document.querySelector('#disconnect-overlay'),null,{timeout:60000});status.hud=await page.locator('#highfly-f5-hud').isVisible().catch(()=>false);if(!status.hud)status.errors.push('World renderer fatal overlay before F5 HUD');}catch(e){status.errors.push('HUD did not appear after 60s: '+String(e).slice(0,100));}}
  if(!status.hud){
    status.errors.push('WOC runtime DOM: '+JSON.stringify(await page.evaluate(()=>({
      body:document.body.className,
      hudElement:!!document.querySelector('#highfly-f5-hud'),
      mobileControl:!!document.querySelector('#mobile-controls'),
      loadingStatus:document.querySelector('#ls-status')?.textContent?.slice(0,220),
      loadingText:document.querySelector('#loading-screen')?.textContent?.slice(0,350),
      loadingVisible:document.querySelector('#loading-screen')?.classList.contains('visible'),
      canvas:document.querySelector('#game-canvas')?{width:document.querySelector('#game-canvas').width,height:document.querySelector('#game-canvas').height}:null,
      overlayError:document.querySelector('#error-msg')?.textContent?.slice(0,300),
      fatalOverlay:document.querySelector('#disconnect-overlay')?.textContent?.slice(0,1200)
    })).catch(()=>({unavailable:true}))));
    status.errors.push('Chrome console: '+JSON.stringify(consoleErrors.slice(-12)));
    status.errors.push('HTTP errors: '+JSON.stringify(responses.filter(x=>x.status!==404).slice(0,8)));
  }
  status.loaded=true;
  status.errorCount=errors.length;
  status.errors.push(...errors.slice(0,12));
  status.missingMedia=responses.filter(x=>x.status===404).length;
  console.log('F5_MOBILE_BROWSER_SMOKE',JSON.stringify(status));
  if(!status.loaded||!status.entered||!status.hud)process.exitCode=1;
} catch(e) {
  status.errors.push(String(e).slice(0,500));
  status.errors.push(...errors.slice(0,8));
  status.missingMedia=responses.filter(x=>x.status===404).length;
  status.errors.push('HTTP errors: '+JSON.stringify(responses.slice(0,12)));
  status.errors.push('DOM: '+JSON.stringify(await page.evaluate(()=>({
  body:document.body.className,
  offlineError:document.querySelector('#offline-error')?.textContent?.slice(0,240),
  loading:document.querySelector('#loading-screen')?.textContent?.slice(0,500),
  loadingStyle:document.querySelector('#loading-screen')?getComputedStyle(document.querySelector('#loading-screen')).display:'unknown',
  error:document.querySelector('#error-msg')?.textContent?.slice(0,400),
  startScreen:document.querySelector('#start-screen')?getComputedStyle(document.querySelector('#start-screen')).display:'unknown',
  canvas:document.querySelector('#game-canvas')?{width:document.querySelector('#game-canvas').width,height:document.querySelector('#game-canvas').height}:null,
})).catch(()=>({failed:true}))));
status.errors.push('Browser console: '+JSON.stringify(consoleErrors.slice(0,12)));
await page.screenshot({path:'f5-browser-failure.png',fullPage:false}).catch(()=>{});
  console.log('F5_MOBILE_BROWSER_SMOKE_FAILED',JSON.stringify(status));
  process.exitCode=1;
} finally{await browser.close();}
