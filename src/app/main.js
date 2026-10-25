import { makeHunter } from "../core/hunter.mjs";
import { loadHunter, saveHunter } from "../core/hunter-save.mjs";
import { bootWorld } from "./world.js";

const node=id=>document.getElementById(id);
const screens=["landing","creator","game","loading"];
const show=id=>screens.forEach(s=>node(s).hidden=s!==id);
let current=null;
let game=null;
let joy={x:0,y:0};
const keyboard=new Set();
const isPlaying=()=>!!game&&!node("game").hidden;
function tryLoad(){try{return loadHunter(localStorage,"main")}catch{return null}}
function save(){
  if(!current)return;
  try{saveHunter(localStorage,current)}
  catch(e){note("No se pudo guardar el progreso. Revisá el almacenamiento del navegador.");}
}
function updateLanding(){
  const saved=tryLoad();
  node("continue-btn").hidden=!saved;
  if(saved)node("continue-btn").textContent="Continuar con "+saved.name;
}
function note(message){
  const el=node("world-message");
  el.textContent=message;el.hidden=false;
  clearTimeout(note.timeout);
  note.timeout=setTimeout(()=>el.hidden=true,4200);
}
function refreshHud(){
  if(!current)return;
  node("world-name").textContent=current.name;
  node("world-level").textContent="Nv. "+current.level;
  for(const [id,key,cap] of [["hp-fill","hp","maxHp"],["mp-fill","mana","maxMana"],["energy-fill","energy","maxEnergy"]]){
    node(id).style.width=Math.round(100*current.vitals[key]/current.vitals[cap])+"%";
  }
}
async function enter(hunter){
  current=hunter;
  show("game");refreshHud();node("loading").hidden=false;
  try{
    game=await bootWorld(node("game-canvas"),current,{
      onState(p){ if(current){current.position=p;save();}},
      onNotice(message){node("loading-detail").textContent=message;}
    });
    node("loading").hidden=true;
    if(!game.loadedKayKit)note("Aviso: modelo 3D KayKit no cargado; verificá los assets del despliegue.");
  }catch(err){
    node("loading").hidden=true;
    show("landing");
    console.error("HIGHFLY F3 3D init failed",err);
    alert("El mundo 3D no pudo iniciar. Revisá WebGL y la consola. No se perdió la partida.");
  }
}
node("continue-btn").addEventListener("click",()=>{const saved=tryLoad();if(saved)enter(saved)});
node("new-btn").addEventListener("click",()=>{node("creator-error").hidden=true;show("creator")});
node("back-btn").addEventListener("click",()=>show("landing"));
node("create-btn").addEventListener("click",()=>{
  try{
    const name=node("hunter-name").value.trim();
    if(!name||name.length>24)throw Error("Escribí un nombre de hasta 24 caracteres.");
    const h=makeHunter({id:"main",name,
      presentation:node("hunter-presentation").value,visual:node("hunter-visual").value});
    current=h;save();enter(h);
  }catch(e){node("creator-error").textContent=e.message;node("creator-error").hidden=false;}
});
node("menu-btn").addEventListener("click",()=>{
  if(game){current.position=game.getPosition();game.stop();game=null;}
  keyboard.clear();joy={x:0,y:0};save();updateLanding();show("landing");
});
function updateInput(){
  if(!game)return;
  const right=Number(keyboard.has("d")||keyboard.has("ArrowRight"))-Number(keyboard.has("a")||keyboard.has("ArrowLeft"));
  const forward=Number(keyboard.has("w")||keyboard.has("ArrowUp"))-Number(keyboard.has("s")||keyboard.has("ArrowDown"));
  const x=joy.x||right,y=joy.y||-forward;
  game.setStick(x,y);
}
window.addEventListener("keydown",e=>{
  if(!isPlaying())return;
  const key=e.key.length===1?e.key.toLowerCase():e.key;
  if(["w","a","s","d","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(key))e.preventDefault();
  if(key===" "&&!e.repeat)game.jump();
  if(key==="Shift"&&!e.repeat)game.dash();
  keyboard.add(key);updateInput();
});
window.addEventListener("keyup",e=>{keyboard.delete(e.key.length===1?e.key.toLowerCase():e.key);updateInput()});
window.addEventListener("blur",()=>{keyboard.clear();joy={x:0,y:0};updateInput();save()});
window.addEventListener("pagehide",()=>{if(game)current.position=game.getPosition();save()});
const stick=node("joystick"),knob=node("joystick-knob");
let stickPointer=null;
function moveStick(e){
  const rect=stick.getBoundingClientRect();
  const dx=e.clientX-(rect.left+rect.width/2),dy=e.clientY-(rect.top+rect.height/2);
  const radius=rect.width*.34;const length=Math.hypot(dx,dy)||1;
  const amount=Math.min(radius,length);
  const x=dx/length*amount,y=dy/length*amount;
  knob.style.transform="translate("+x+"px,"+y+"px)";
  joy={x:x/radius,y:y/radius};updateInput();
}
stick.addEventListener("pointerdown",e=>{
  if(!isPlaying())return;
  e.preventDefault();stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);
  moveStick(e);
});
stick.addEventListener("pointermove",e=>{if(e.pointerId===stickPointer)moveStick(e)});
function releaseStick(e){
  if(e.pointerId!==stickPointer)return;
  stickPointer=null;joy={x:0,y:0};knob.style.transform="";updateInput();
}
stick.addEventListener("pointerup",releaseStick);
stick.addEventListener("pointercancel",releaseStick);
node("jump-btn").addEventListener("pointerdown",e=>{e.preventDefault();game?.jump()});
node("dash-btn").addEventListener("pointerdown",e=>{e.preventDefault();game?.dash()});
const canvas=node("game-canvas");let lookPointer=null,last=null;
canvas.addEventListener("pointerdown",e=>{
  if(!game)return;
  lookPointer=e.pointerId;last={x:e.clientX,y:e.clientY};
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove",e=>{
  if(e.pointerId!==lookPointer||!game)return;
  const dx=e.clientX-last.x,dy=e.clientY-last.y;
  last={x:e.clientX,y:e.clientY};game.dragCamera(dx,dy);
});
function releaseLook(e){if(e.pointerId===lookPointer){lookPointer=null;last=null;}}
canvas.addEventListener("pointerup",releaseLook);
canvas.addEventListener("pointercancel",releaseLook);
updateLanding();show("landing");
