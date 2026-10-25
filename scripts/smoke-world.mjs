// Black-screen regression check: opens the built app in system Chrome via CDP.
// Built-in Node 22 WebSocket only. No Playwright, external download or new pack.
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
const PORT=4174,DEBUG=9229;
const preview=spawn("npm",["run","preview:app","--","--host","127.0.0.1","--port",String(PORT)],
  {stdio:["ignore","pipe","pipe"]});
let browser=null,ws=null;
let commandId=0,answers=new Map(),fatal=[];
let previewOutput="";
preview.stdout.on("data",d=>previewOutput+=String(d));
preview.stderr.on("data",d=>previewOutput+=String(d));
async function waitFor(get,tries=40,ms=400){
  for(let i=0;i<tries;i++){try{const r=await get();if(r)return r;}catch{}await sleep(ms);}
  throw Error("timed out waiting for process: "+previewOutput.slice(-800));
}
function cmd(method,params={}){
  const id=++commandId;return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{answers.delete(id);reject(Error("CDP command timeout: "+method))},11000);
    answers.set(id,res=>{clearTimeout(timer);if(res.error)reject(Error(JSON.stringify(res.error)));
      else resolve(res.result??{});});
    ws.send(JSON.stringify({id,method,params}));
  });
}
async function evalJs(expression){
  const r=await cmd("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
  if(r.exceptionDetails)throw Error("Runtime eval: "+JSON.stringify(r.exceptionDetails).slice(0,350));
  return r.result?.value;
}
try{
  await waitFor(async()=>{
    const r=await fetch("http://127.0.0.1:"+PORT+"/HIGHFLY-FOUNDATION/");
    return r.ok;
  },30,500);
  browser=spawn(process.env.CHROME_BIN||"google-chrome",[
    "--headless=new","--no-sandbox","--disable-dev-shm-usage",
    "--enable-webgl","--use-gl=angle","--use-angle=swiftshader",
    "--enable-unsafe-swiftshader","--window-size=1152,648",
    "--remote-debugging-port="+DEBUG,"--user-data-dir=/tmp/highfly-chrome-smoke",
    "about:blank"
  ],{stdio:"ignore"});
  const tabs=await waitFor(async()=>{
    const r=await fetch("http://127.0.0.1:"+DEBUG+"/json/list");
    const data=await r.json();
    return data.find(x=>x.type==="page"&&x.webSocketDebuggerUrl);
  },55,500);
  ws=new WebSocket(tabs.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{
    ws.addEventListener("open",resolve,{once:true});
    ws.addEventListener("error",reject,{once:true});
  });
  ws.addEventListener("message",event=>{
    const msg=JSON.parse(String(event.data));
    if(msg.id&&answers.has(msg.id)){answers.get(msg.id)(msg);answers.delete(msg.id);}
    if(msg.method==="Runtime.exceptionThrown")
      fatal.push(JSON.stringify(msg.params.exceptionDetails).slice(0,360));
  });
  await cmd("Runtime.enable");await cmd("Page.enable");
  await cmd("Page.navigate",{url:"http://127.0.0.1:"+PORT+"/HIGHFLY-FOUNDATION/"});
  await waitFor(async()=>await evalJs("window.__highflyAppReady===true"),80,500);
  await evalJs("document.querySelector('#new-btn').click();document.querySelector('#create-btn').click();");
  let result=null;
  for(let i=0;i<160;i++){
    result=await evalJs("(()=>({landing:document.querySelector('#landing').hidden,game:document.querySelector('#game').hidden,loading:document.querySelector('#loading').hidden,zone:document.querySelector('#zone-title')?.textContent,description:document.querySelector('#loading-detail')?.textContent}))()");
    if(result.game===false&&result.loading===true&&result.zone&&result.zone!=="CARGANDO ZONA")break;
    await sleep(650);
  }
  if(!result||result.game!==false||result.loading!==true||!result.zone||result.zone==="CARGANDO ZONA")
    throw Error("F4 scene not entered: "+JSON.stringify(result)+" exceptions: "+fatal.slice(-3).join("|"));
  const webgl=await evalJs("Boolean(document.querySelector('#game-canvas')?.getContext('webgl2'))");
  if(!webgl)throw Error("Chrome smoke lacked WebGL2; native world not certified");
  console.log("HIGHFLY_F4_BROWSER_ENTER_WORLD_OK",JSON.stringify(result));
  if(fatal.length)console.log("Nonblocking exceptions:",fatal.slice(-5));
}finally{
  ws?.close();
  browser?.kill("SIGKILL");
  preview.kill("SIGTERM");
}
