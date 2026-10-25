import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { VISUAL_PRESETS } from "../core/hunter.mjs";
import { stickToWorld } from "./movement-axis.mjs";

// F3 ENTRY SMOKE TEST ONLY. This is an ORIGINAL temporary 3D zone;
// it is deliberately NOT represented as the copyrighted/filtered WOC 0.44.7 world.
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const hAt=(x,z)=>0.11*Math.sin(x*.25)+0.17*Math.sin(z*.13)+0.12*Math.cos(x*.19+z*.1);
const rng=(()=>{let s=18122;return ()=>((s=(s*1664525+1013904223)>>>0)/4294967296);})();
const stone=new THREE.MeshLambertMaterial({color:"#98958a"});
function box(scene,w,h,d,x,z,color,y=0){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));
  m.position.set(x,hAt(x,z)+h/2+y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;
}
function buildZone(scene){
  scene.background=new THREE.Color("#9fc9e2");scene.fog=new THREE.Fog("#b8d5c4",55,130);
  scene.add(new THREE.HemisphereLight("#e9f6e6","#72866a",2.0));
  const sun=new THREE.DirectionalLight("#ffe9b3",2.0);
  sun.position.set(-16,40,-23);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  sun.shadow.camera.left=-38;sun.shadow.camera.right=38;
  sun.shadow.camera.top=38;sun.shadow.camera.bottom=-38;scene.add(sun);
  const groundGeo=new THREE.PlaneGeometry(170,170,80,80);groundGeo.rotateX(-Math.PI/2);
  const pos=groundGeo.getAttribute("position");
  for(let i=0;i<pos.count;i++)pos.setY(i,hAt(pos.getX(i),pos.getZ(i)));
  groundGeo.computeVertexNormals();
  const ground=new THREE.Mesh(groundGeo,new THREE.MeshLambertMaterial({color:"#78a267",side:THREE.DoubleSide}));
  ground.receiveShadow=true;scene.add(ground);
  const roadGeo=new THREE.PlaneGeometry(5,160,6,84);roadGeo.rotateX(-Math.PI/2);
  const rp=roadGeo.getAttribute("position");
  for(let i=0;i<rp.count;i++)rp.setY(i,hAt(rp.getX(i),rp.getZ(i))+.02);
  roadGeo.computeVertexNormals();
  const road=new THREE.Mesh(roadGeo,new THREE.MeshLambertMaterial({color:"#b7a98b",side:THREE.DoubleSide}));
  road.receiveShadow=true;scene.add(road);
  // Procedural CC0-style geometry is authored here, no external media.
  const trunkGeo=new THREE.CylinderGeometry(.16,.24,1.5,6);
  const crownGeo=new THREE.ConeGeometry(1.16,3.05,7);
  const trunk=new THREE.InstancedMesh(trunkGeo,new THREE.MeshLambertMaterial({color:"#60482e"}),95);
  const crown=new THREE.InstancedMesh(crownGeo,new THREE.MeshLambertMaterial({color:"#316c44"}),95);
  trunk.castShadow=false;crown.castShadow=false;
  const inst=new THREE.Object3D();
  let made=0;
  for(let i=0;i<390&&made<95;i++){
    const x=(rng()-.5)*142,z=(rng()-.5)*142;
    if(Math.abs(x)<8||Math.abs(x)<5&&Math.abs(z)<38||Math.hypot(x-12,z+12)<9||
      Math.hypot(x+12,z+14)<9||Math.hypot(x,z-6)<10)continue;
    const size=.77+rng()*.9, y=hAt(x,z);
    inst.position.set(x,y+.75*size,z);inst.scale.set(size,size,size);
    inst.updateMatrix();trunk.setMatrixAt(made,inst.matrix);
    inst.position.y=y+2.2*size;inst.updateMatrix();crown.setMatrixAt(made,inst.matrix);
    crown.setColorAt(made,new THREE.Color().setHSL(.32+rng()*.08,.33,.24+rng()*.12));
    made++;
  }
  trunk.count=made;crown.count=made;trunk.instanceMatrix.needsUpdate=true;crown.instanceMatrix.needsUpdate=true;
  if(crown.instanceColor)crown.instanceColor.needsUpdate=true;
  scene.add(trunk,crown);
  const obstacles=[];
  for(const [x,z,c] of [[12,-12,"#c5b9a0"],[-12,-14,"#b0a58e"]]){
    const house=box(scene,5,3.9,5,x,z,c);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(4.5,2.7,4),new THREE.MeshLambertMaterial({color:"#705240"}));
    roof.position.set(x,hAt(x,z)+5.2,z);roof.rotation.y=Math.PI/4;roof.castShadow=true;scene.add(roof);
    box(scene,1.25,2.25,.14,x,z+2.56,"#654b32");
    const doorway=box(scene,1.35,2.25,.15,x,z+2.66,"#56442d");
    obstacles.push({x,z,r:3.5});
  }
  // Landmark, not an actual imported WOC building.
  const pillar=box(scene,1.4,2.7,1.4,9,8,"#99968c");
  const glow=new THREE.Mesh(new THREE.OctahedronGeometry(.85,0),
    new THREE.MeshBasicMaterial({color:"#74d6c5",transparent:true,opacity:.78}));
  glow.position.set(9,hAt(9,8)+3.6,8);scene.add(glow);
  return {obstacles,glow};
}
function fallbackBody(){
  const group=new THREE.Group();
  const shirt=new THREE.Mesh(new THREE.CapsuleGeometry(.44,1.1,5,9),new THREE.MeshLambertMaterial({color:"#7397ad"}));
  shirt.position.y=1.0;group.add(shirt);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.34,12,8),new THREE.MeshLambertMaterial({color:"#deb99a"}));
  head.position.y=2.05;group.add(head);
  return group;
}
export async function bootWorld(canvas,hunter,{onState,onNotice}={}){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.45));
  renderer.setClearColor("#9ecbe1");renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();const {obstacles,glow}=buildZone(scene);
  const camera=new THREE.PerspectiveCamera(59,2,.08,250);
  const root=new THREE.Group();scene.add(root);
  const p=hunter.position&&Number.isFinite(hunter.position.x)&&Number.isFinite(hunter.position.z)
    ? hunter.position:{x:0,z:6};
  const position={x:clamp(p.x,-73,73),z:clamp(p.z,-73,73)};
  let yaw=0.25,pitch=.36;
  let joy={x:0,y:0},model=null,mixer=null,actions={},current="",loaded=false;
  let jumpY=0,velY=0,jumps=0,dashTime=0,attackTimer=0,flipTime=0,flipAngle=0;
  let loop=0,live=true,saveTimer=0;
  const dynamic=new THREE.Group();root.add(dynamic);
  const visual=VISUAL_PRESETS[hunter.visual]??VISUAL_PRESETS.kaykit_knight;
  const url=import.meta.env.BASE_URL+"assets/kaykit/"+visual.asset;
  try{
    const gltf=await new GLTFLoader().loadAsync(url);
    model=gltf.scene;
    model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;}});
    let bounds=new THREE.Box3().setFromObject(model);
    const height=Math.max(.05,bounds.max.y-bounds.min.y);
    model.scale.setScalar(2.1/height);
    model.updateMatrixWorld(true);
    bounds=new THREE.Box3().setFromObject(model);
    const center=bounds.getCenter(new THREE.Vector3());
    model.position.set(-center.x,-bounds.min.y,-center.z);
    dynamic.add(model);loaded=true;
    if(gltf.animations?.length){
      mixer=new THREE.AnimationMixer(model);
      const find=re=>gltf.animations.find(c=>re.test(c.name));
      const idle=find(/Idle_A|Idle/i),walk=find(/Walking_A|Walk|Run/i),jump=find(/Jump.*(Full|Start)|Jump/i),
        attack=find(/1H_Melee_Attack|Attack/i);
      for(const [k,clip] of Object.entries({idle,walk,jump,attack}))if(clip)actions[k]=mixer.clipAction(clip);
      actions.idle?.play();current="idle";
    }
    onNotice?.("Modelo KayKit CC0 cargado: "+visual.asset);
  }catch(err){
    model=fallbackBody();dynamic.add(model);
    onNotice?.("No se pudo cargar el GLB KayKit: figura técnica provisional. Revisar despliegue.");
  }
  const resize=()=>{
    if(!live)return;
    const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  };
  window.addEventListener("resize",resize);resize();
  const collide=(x,z)=>obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r);
  const animation=(next)=>{
    if(current===next||!actions[next])return;
    const old=actions[current];old?.fadeOut(.2);
    actions[next].reset().fadeIn(.2).play();current=next;
  };
  const clock=new THREE.Clock();
  function frame(){
    if(!live)return;
    loop=requestAnimationFrame(frame);
    const dt=Math.min(clock.getDelta(),.045);
    const direction=stickToWorld({x:joy.x,y:joy.y,yaw});
    const dx=direction.x,dz=direction.z;
    const moving=direction.magnitude>.06;
    if(moving)dynamic.rotation.y=Math.atan2(dx,dz);
    const speed=dashTime>0?18:5.7;
    if(moving){
      const nx=clamp(position.x+dx*speed*dt,-77,77);
      const nz=clamp(position.z+dz*speed*dt,-77,77);
      if(!collide(nx,position.z))position.x=nx;
      if(!collide(position.x,nz))position.z=nz;
    }
    if(jumpY>0||velY>0){
      velY-=16.5*dt;jumpY+=velY*dt;
      if(jumpY<=0){jumpY=0;velY=0;jumps=0;flipTime=0;dynamic.rotation.x=0;}
    }
    if(flipTime>0){
      flipTime=Math.max(0,flipTime-dt);
      flipAngle+=dt*12.5;
      dynamic.rotation.x=flipTime>0?flipAngle:0;
    }
    dashTime=Math.max(0,dashTime-dt);attackTimer=Math.max(0,attackTimer-dt);
    root.position.set(position.x,hAt(position.x,position.z)+jumpY,position.z);
    if(mixer){
      mixer.update(dt);
      animation(attackTimer>0?"attack":jumpY>.06?"jump":moving?"walk":"idle");
    }
    if(!loaded&&moving)dynamic.position.y=Math.sin(clock.elapsedTime*11)*.05;
    const focus=new THREE.Vector3(position.x,hAt(position.x,position.z)+1.5+jumpY*.6,position.z);
    const d=7.5;
    const cameraTarget=new THREE.Vector3(focus.x-Math.sin(yaw)*d*Math.cos(pitch),
      focus.y+d*Math.sin(pitch)+.8,focus.z-Math.cos(yaw)*d*Math.cos(pitch));
    camera.position.lerp(cameraTarget,Math.min(1,dt*11));
    camera.lookAt(focus);
    glow.rotation.y+=dt*1.2;glow.position.y=hAt(9,8)+3.6+Math.sin(clock.elapsedTime*1.5)*.25;
    saveTimer+=dt;
    if(saveTimer>3){saveTimer=0;onState?.({...position});}
    renderer.render(scene,camera);
  }
  frame();
  return {
    setStick(x,y){joy={x:clamp(x,-1,1),y:clamp(y,-1,1)};},
    dragCamera(dx,dy){yaw-=dx*.0045;pitch=clamp(pitch+dy*.003,0.06,.95);},
    jump(){
      if(jumps>=2)return false;
      jumps++;velY=jumps===1?7.1:6.5;
      if(jumps===2){flipTime=.48;flipAngle=0;}
      return true;
    },
    dash(){if(dashTime>0)return false;dashTime=.18;return true;},
    attack(){attackTimer=.55;},
    getPosition(){return {...position};},
    loadedKayKit:loaded,
    stop(){
      if(!live)return;
      live=false;cancelAnimationFrame(loop);
      window.removeEventListener("resize",resize);
      onState?.({...position});
      renderer.dispose();
      scene.traverse(o=>{o.geometry?.dispose?.();const m=o.material;
        if(Array.isArray(m))m.forEach(v=>v.dispose?.());else m?.dispose?.();});
    }
  };
}
