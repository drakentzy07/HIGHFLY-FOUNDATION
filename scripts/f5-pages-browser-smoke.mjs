import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--disable-web-security']});
const context=await browser.newContext({viewport:{width:915,height:412},isMobile:true,hasTouch:true,deviceScaleFactor:2,userAgent:'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36'});
const page=await context.newPage();
const errors=[],responses=[];
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
  await page.locator('#server-opt-offline').click();
  await page.locator('#btn-play').click({timeout:15000});
  await page.locator('#offline-select').waitFor({state:'visible',timeout:30000});
  status.offline=true;
  await page.locator('#char-name').fill('HunterF5');
  await page.locator('#btn-start-offline').click();
  try{await page.waitForFunction(()=>document.body.classList.contains('game-active'),null,{timeout:90000});status.entered=true;}catch(e){status.errors.push('Game never marked active within timeout: '+String(e).slice(0,180));}
  if(status.entered){try{await page.locator('#highfly-f5-hud').waitFor({state:'visible',timeout:15000});status.hud=true;}catch(e){status.errors.push('HUD did not appear in mobile game');}}
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
  status.errors.push('Body classes: '+await page.evaluate(()=>document.body.className).catch(()=>''));
  console.log('F5_MOBILE_BROWSER_SMOKE_FAILED',JSON.stringify(status));
  process.exitCode=1;
} finally{await browser.close();}
