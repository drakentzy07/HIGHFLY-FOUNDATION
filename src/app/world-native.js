import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { VISUAL_PRESETS } from "../core/hunter.mjs";
import { stickToWorld } from "./movement-axis.mjs";
import { createNativeWocTerrain } from "./woc-native-layer.mjs";
import { renderAuthenticFoliage } from "./woc-authored-foliage.mjs";
import { initGfxTier } from "../../.vendor/world-of-claudecraft/src/render/gfx.ts";
import { nativeWorldHeight,nativeWorldStart,nativeWaterLevelAt } from "./native-woc-source.mjs";
import {nativeBuildingsNear,nativeWellsNear,nativeNpcsNear,nativeCampsNear,
  nativeRoadSegmentsNear,nativeBuildingCollision,nativeZoneLabel,nativeHunterEntryPoint} from "./woc-authored-content.mjs";

// NATIVE WOC 0.44.7 geographic content, filtered CC0 buildings and KayKit avatars.
// Not the complete original sim: NPC dialogue is read-only and combat is visual only.
// NO invented terrain / fake settlements.
const SEED=42,dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
function label(text,color="#f1e5b1"){
  const canvas=document.createElement("canvas");canvas.width=512;canvas.height=96;
  const ctx=canvas.getContext("2d");
  if(!ctx)return new THREE.Group();
  ctx.fillStyle="#112b25d9";ctx.fillRect(0,0,512,96);
  ctx.font="bold 34px system-ui";ctx.textAlign="center";ctx.fillStyle=color;
  ctx.fillText(text.slice(0,30),256,59);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));
  sprite.scale.set(3.5,.66,1);return sprite;
}
function addRoad(scene,segments){
  const group=new THREE.Group();group.name="WOC authored roads";
  const material=new THREE.MeshLambertMaterial({color:"#a79a79",side:THREE.DoubleSide,depthWrite:true});
  let count=0;
  for(const [a,b] of segments){
    const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);
    if(len<.001||len>100)continue;
    const vx=-dz/len*1.25,vz=dx/len*1.25;
    const countPoints=Math.max(1,Math.ceil(len/3));
    const coords=[],indices=[];
    for(let i=0;i<=countPoints;i++){
      const t=i/countPoints,x=a.x+dx*t,z=a.z+dz*t;
      for(const sign of [-1,1]){
        const px=x+vx*sign,pz=z+vz*sign;
        coords.push(px,nativeWorldHeight(px,pz,SEED)+.045,pz);
      }
      if(i>0){const q=i*2;indices.push(q-2,q-1,q,q-1,q+1,q);}
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute("position",new THREE.Float32BufferAttribute(coords,3));
    geo.setIndex(indices);geo.computeVertexNormals();
    const mesh=new THREE.Mesh(geo,material);mesh.receiveShadow=true;group.add(mesh);
    count++;
  }
  scene.add(group);return {group,count};
}
function placeholderHunter(){
  const group=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.44,.9,4,9),
    new THREE.MeshLambertMaterial({color:"#7995a4"}));body.position.y=1.0;group.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.32,10,8),
    new THREE.MeshLambertMaterial({color:"#d8ac91"}));head.position.y=2;group.add(head);
  return group;
}
function estimateRigHeight(obj){
  const b=new THREE.Box3().setFromObject(obj);
  return {bounds:b,height:Math.max(.001,b.max.y-b.min.y),size:b.getSize(new THREE.Vector3())};
}
async function loadAuthoredProps(scene,start,loader,notice){
  const seen=new Map(), obstacles=[];
  const prefix=import.meta.env.BASE_URL+"assets/woc-cc0/";
  async function asset(path){
    if(!seen.has(path))seen.set(path,loader.loadAsync(prefix+path).then(x=>x.scene));
    return seen.get(path);
  }
  const buildings=nativeBuildingsNear(start,95).slice(0,90);
  let done=0;const failures=[];
  for(const b of buildings){
    const assetName=b.assetId?.split("/").at(-1)??null;
    const officialEastbrook=new Set(["hexb_townhall.glb","hexb_workshop.glb","hexb_tavern.glb",
      "hexb_home_a.glb","hexb_home_b.glb","hexb_market.glb","hex_church.glb"]);
    // Use EXACT original author-assigned models, not a generic replacement.
    // An unapproved custom assetId is excluded until independently licensed.
    if(assetName&&!officialEastbrook.has(assetName))continue;
    const variant=assetName??(b.kind==="inn"?"inn.glb":
      ["house_1.glb","house_2.glb","house_3.glb"][Math.abs(Math.floor(b.x*7+b.z*11))%3]);
    let src;
    try{src=await asset(variant);}catch(e){failures.push(variant+": "+String(e?.message??e));console.warn("WOC CC0 model missing",variant,e);continue;}
    const model=src.clone(true),outer=new THREE.Group(),measure=estimateRigHeight(model);
    const s=Math.min((b.w||4)/Math.max(.001,measure.size.x),(b.d||4)/Math.max(.001,measure.size.z));
    model.scale.setScalar(clamp(s,.01,12));
    model.position.set(-measure.bounds.getCenter(new THREE.Vector3()).x*s,
      -measure.bounds.min.y*s,-measure.bounds.getCenter(new THREE.Vector3()).z*s);
    outer.add(model);
    outer.rotation.y=(b.rot||0)+(variant==="house_2.glb"?-Math.PI/2:0);
    outer.position.set(b.x,nativeWorldHeight(b.x,b.z,SEED),b.z);
    outer.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
    scene.add(outer);done++;
    obstacles.push({x:b.x,z:b.z,w:b.w,d:b.d,rot:b.rot||0});
  }
  const wells=nativeWellsNear(start,95).slice(0,18);
  for(const w of wells){
    try{
      const obj=(await asset("well.glb")).clone(true),bounds=estimateRigHeight(obj);
      const scale=clamp((w.r*2||3)/Math.max(bounds.size.x,bounds.size.z,.001),.02,10);
      obj.scale.setScalar(scale);
      obj.position.set(w.x-bounds.bounds.getCenter(new THREE.Vector3()).x*scale,
        nativeWorldHeight(w.x,w.z,SEED)-bounds.bounds.min.y*scale,
        w.z-bounds.bounds.getCenter(new THREE.Vector3()).z*scale);
      scene.add(obj);done++;
    }catch(e){console.warn("WOC well asset issue",e);}
  }
  notice?.("WOC: "+done+" edificios/pozos con posiciones originales cargados");
  return {count:done,obstacles,requested:buildings.length,failures:failures.slice(0,5)};
}
async function addAuthoredNpcs(scene,start,loader){
  const npcs=nativeNpcsNear(start,55).slice(0,12);
  const url=import.meta.env.BASE_URL+"assets/kaykit/Knight.glb";
  let source=null;try{source=(await loader.loadAsync(url)).scene;}catch{}
  const entries=[];
  for(const n of npcs){
    const group=new THREE.Group();
    const marker=label(n.name);marker.position.y=3;group.add(marker);
    if(source){
      const body=source.clone(true);const {bounds,height}=estimateRigHeight(body);
      const scale=2.0/height;
      body.scale.setScalar(scale);
      body.position.y=-bounds.min.y*scale;
      body.position.x=-bounds.getCenter(new THREE.Vector3()).x*scale;
      body.position.z=-bounds.getCenter(new THREE.Vector3()).z*scale;
      group.add(body);
    }
    group.position.set(n.pos.x,nativeWorldHeight(n.pos.x,n.pos.z,SEED),n.pos.z);
    scene.add(group);
    entries.push({id:n.id,name:n.name,pos:n.pos,greeting:n.greeting,visual:"kaykit-generic"});
  }
  return entries;
}
async function addAuthoredWolf(scene,start,loader){
  const camps=nativeCampsNear(start,120).filter(c=>/wolf|lupin/i.test(c.mobId)).slice(0,4);
  if(!camps.length)return {count:0,notice:"No hay campamentos de lobos en el área de inicio"};
  try{
    const gltf=await loader.loadAsync(import.meta.env.BASE_URL+"assets/woc-cc0/wolf.glb");
    const out=[];
    for(const c of camps){
      const obj=gltf.scene.clone(true),dim=estimateRigHeight(obj),s=1.5/dim.height;
      obj.scale.setScalar(s);
      obj.position.set(c.center.x-dim.bounds.getCenter(new THREE.Vector3()).x*s,
        nativeWorldHeight(c.center.x,c.center.z,SEED)-dim.bounds.min.y*s,
        c.center.z-dim.bounds.getCenter(new THREE.Vector3()).z*s);
      scene.add(obj);out.push({id:c.mobId,pos:c.center});
    }
    return {count:out.length,notice:"Lobos WOC en campamentos originales (sin IA aún)"};
  }catch(e){console.warn("WOC wolf model unavailable",e);return {count:0,notice:"Modelo de lobo no cargado"};}
}
export async function bootWorld(canvas,hunter,{onState,onNotice,onZone}={}){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.4));
  renderer.shadowMap.enabled=false;renderer.outputColorSpace=THREE.SRGBColorSpace;
  initGfxTier(renderer); // WOC requires active device-specific tier before terrain construction.
  const scene=new THREE.Scene();scene.background=new THREE.Color("#abcbd2");
  scene.fog=new THREE.Fog("#b5c9bd",65,155);
  scene.add(new THREE.HemisphereLight("#e4f7f2","#536d46",2.15));
  const sun=new THREE.DirectionalLight("#ffe7b0",1.55);sun.position.set(-30,56,-28);scene.add(sun);
  const camera=new THREE.PerspectiveCamera(60,2,.1,205);
  // F3 saves must not carry their fake world coordinates into authentic WOC.
  const previous=hunter.worldVersion==="woc0447"&&Number.isFinite(hunter.position?.x)&&Number.isFinite(hunter.position?.z)
    ? hunter.position : nativeHunterEntryPoint();
  const position={x:previous.x,z:previous.z};
  const loader=new GLTFLoader();
  onNotice?.("Preparando terreno original WOC v0.44.7");
  const native=createNativeWocTerrain(scene,{seed:SEED,start:position,
    onProgress(p){if(p.done===p.total||p.done%6===0)onNotice?.("Terreno "+p.zone+" "+p.done+"/"+p.total);}});
  const roads=addRoad(scene,nativeRoadSegmentsNear(position,105));
  // Native source is the only source of world height, geography and placements.
  let sceneError=null;
  try{await native.ready;}catch(e){sceneError=e;}
  if(sceneError){renderer.dispose();native.dispose();throw new Error("WOC terrain failed: "+sceneError.message);}
  const props=await loadAuthoredProps(scene,position,loader,onNotice);
  const foliage=await renderAuthenticFoliage({scene,loader,start:position,seed:SEED,notice:onNotice});
  const npcs=await addAuthoredNpcs(scene,position,loader);
  const wolf=await addAuthoredWolf(scene,position,loader);
  onNotice?.("WOC original: "+roads.count+" tramos de caminos · "+props.count+" props CC0 · "+npcs.length+" NPC cercanos");
  const avatar=new THREE.Group();scene.add(avatar);
  const dynamic=new THREE.Group();avatar.add(dynamic);
  let mixer=null,actions={},current="",loaded=false;
  const chosen=VISUAL_PRESETS[hunter.visual]??VISUAL_PRESETS.kaykit_knight;
  try{
    const gltf=await loader.loadAsync(import.meta.env.BASE_URL+"assets/kaykit/"+chosen.asset);
    const model=gltf.scene,{bounds,height}=estimateRigHeight(model),scale=2.1/height;
    model.scale.setScalar(scale);
    model.position.set(-bounds.getCenter(new THREE.Vector3()).x*scale,
      -bounds.min.y*scale,-bounds.getCenter(new THREE.Vector3()).z*scale);
    dynamic.add(model);loaded=true;
    mixer=new THREE.AnimationMixer(model);
    const clip=re=>gltf.animations?.find(a=>re.test(a.name));
    for(const [k,c] of Object.entries({idle:clip(/Idle_A|Idle/i),walk:clip(/Walking_A|Walk|Run/i),
      jump:clip(/Jump/i),attack:clip(/1H_Melee_Attack|Attack/i)}))
      if(c)actions[k]=mixer.clipAction(c);
    actions.idle?.play();current="idle";
  }catch(e){console.warn("KayKit avatar missing",e);dynamic.add(placeholderHunter());}
  let live=true,raf=0,joy={x:0,y:0},yaw=.25,pitch=.38,jumpY=0,velY=0,jumps=0,
    dashTime=0,dashCooldown=0,flipTime=0,flipAngle=0,attackTime=0,
    zoneId="",saveTimer=0,lastStreamZone=null;
  const resize=()=>{
    if(!live)return;
    const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
  };
  window.addEventListener("resize",resize);resize();
  const play=next=>{
    if(!actions[next]||current===next)return;
    actions[current]?.fadeOut(.15);actions[next].reset().fadeIn(.15).play();current=next;
  };
  const clock=new THREE.Clock();
  function loop(){
    if(!live)return;raf=requestAnimationFrame(loop);
    const dt=Math.min(clock.getDelta(),.042),v=stickToWorld({x:joy.x,y:joy.y,yaw});
    const moving=v.magnitude>.06,speed=dashTime>0?17:5.3;
    if(moving){
      dynamic.rotation.y=Math.atan2(v.x,v.z);
      const tx=position.x+v.x*speed*dt,tz=position.z+v.z*speed*dt;
      const oldH=nativeWorldHeight(position.x,position.z,SEED);
      // Preserve native cliff/house collision. The real WOC Sim movement
      // kernel (water, stairs, interiors) is a separate integration gate.
      const step=(x,z)=>{
        const h=nativeWorldHeight(x,z,SEED);
        return !nativeBuildingCollision(x,z,15)&&h>=nativeWaterLevelAt(x,z,SEED)+.1&&
          (jumpY>0||h-oldH<1.05);
      };
      if(step(tx,position.z))position.x=tx;
      if(step(position.x,tz))position.z=tz;
    }
    if(jumpY>0||velY>0){
      velY-=16*dt;jumpY+=velY*dt;
      if(jumpY<=0){jumpY=0;velY=0;jumps=0;flipTime=0;dynamic.rotation.x=0;}
    }
    if(flipTime>0){flipTime=Math.max(0,flipTime-dt);flipAngle+=dt*12.8;
      dynamic.rotation.x=flipTime>0?flipAngle:0;}
    dashTime=Math.max(0,dashTime-dt);dashCooldown=Math.max(0,dashCooldown-dt);
    attackTime=Math.max(0,attackTime-dt);
    const ground=nativeWorldHeight(position.x,position.z,SEED);
    avatar.position.set(position.x,ground+jumpY,position.z);
    if(mixer){mixer.update(dt);play(attackTime>0?"attack":jumpY>.06?"jump":moving?"walk":"idle");}
    const focus=new THREE.Vector3(position.x,ground+1.5+jumpY*.5,position.z),distance=7;
    camera.position.lerp(new THREE.Vector3(focus.x-Math.sin(yaw)*distance*Math.cos(pitch),
      focus.y+distance*Math.sin(pitch)+.7,focus.z-Math.cos(yaw)*distance*Math.cos(pitch)),Math.min(1,dt*12));
    camera.lookAt(focus);
    native.update(position,130);
    const nextZone=nativeZoneLabel(position);
    if(zoneId!==nextZone){zoneId=nextZone;onZone?.(nextZone);}
    // Stream authentic WOC terrain chunks as the player crosses zone borders.
    if(lastStreamZone!==nextZone){
      lastStreamZone=nextZone;
      native.ensureAt({...position}).catch(e=>onNotice?.("Carga de región fallida: "+e.message));
    }
    saveTimer+=dt;
    if(saveTimer>3){saveTimer=0;onState?.({...position});}
    renderer.render(scene,camera);
  }
  loop();
  return {
    loadedKayKit:loaded,worldSource:"World of ClaudeCraft v0.44.7",
    getWorldSummary(){return {zone:zoneId,npcs:npcs.length,roads:roads.count,buildings:props.count,buildingRequests:props.requested,assetErrors:props.failures,wolves:wolf.count,foliage:foliage.count};},
    getPosition(){return {...position};},
    setStick(x,y){joy={x:clamp(x,-1,1),y:clamp(y,-1,1)};},
    dragCamera(dx,dy){yaw-=dx*.0045;pitch=clamp(pitch+dy*.003,.07,.96);},
    jump(){if(jumps>=2)return false;jumps++;velY=jumps===1?6.8:6.2;
      if(jumps===2){flipTime=.48;flipAngle=0;}return true;},
    dash(){if(dashCooldown>0)return false;dashTime=.19;dashCooldown=.65;return true;},
    attack(){attackTime=.45;return {applied:false};},
    interact(){
      const nearest=npcs.slice().sort((a,b)=>dist(a.pos,position)-dist(b.pos,position))[0];
      if(!nearest||dist(nearest.pos,position)>4)return "No hay NPC cerca para interactuar.";
      return nearest.name+": "+(nearest.greeting||"¡Bienvenido!");
    },
    stop(){
      if(!live)return;live=false;cancelAnimationFrame(raf);
      onState?.({...position});native.dispose();
      window.removeEventListener("resize",resize);
      renderer.dispose();
      scene.traverse(o=>{o.geometry?.dispose?.();const m=o.material;
        if(Array.isArray(m))m.forEach(x=>x.dispose?.());else m?.dispose?.();});
    }
  };
}
