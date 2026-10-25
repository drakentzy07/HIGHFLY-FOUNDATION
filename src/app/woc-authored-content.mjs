// World positions are the ORIGINAL authored WOC v0.44.7 world data.
// Only the CC0 Medieval Village house meshes already used by WOC are rendered.
import { BUILTIN_WORLD, ROADS, zoneAt } from "../../.vendor/world-of-claudecraft/src/sim/data.ts";
import { nativeWorldHeight } from "./native-woc-source.mjs";

const shapeKinds=new Set(["house","inn","chapel"]);
export function nativeBuildingsNear(point,radius=100){
  return BUILTIN_WORLD.props.buildings.filter(b=>
    shapeKinds.has(b.kind)&&Number.isFinite(b.x)&&Number.isFinite(b.z)&&
    Math.hypot(b.x-point.x,b.z-point.z)<radius);
}
export function nativeWellsNear(point,radius=100){
  return BUILTIN_WORLD.props.wells.filter(w=>
    Number.isFinite(w.x)&&Number.isFinite(w.z)&&Math.hypot(w.x-point.x,w.z-point.z)<radius);
}
export function nativeNpcsNear(point,radius=50){
  return Object.values(BUILTIN_WORLD.npcs).filter(n=>
    !n.dynamic&&Math.hypot(n.pos.x-point.x,n.pos.z-point.z)<radius);
}
export function nativeCampsNear(point,radius=60){
  return BUILTIN_WORLD.camps.filter(c=>
    Math.hypot(c.center.x-point.x,c.center.z-point.z)<radius+c.radius);
}
export function nativeRoadSegmentsNear(point,radius=125){
  const result=[];
  for(const path of ROADS){
    for(let i=0;i+1<path.length;i++){
      const a=path[i],b=path[i+1];
      const d=Math.min(Math.hypot(a.x-point.x,a.z-point.z),Math.hypot(b.x-point.x,b.z-point.z));
      if(d>radius+20||Math.hypot(a.x-b.x,a.z-b.z)>100)continue;
      result.push([{x:a.x,z:a.z},{x:b.x,z:b.z}]);
    }
  }
  return result;
}
export function nativeBuildingCollision(x,z,region=20){
  for(const b of BUILTIN_WORLD.props.buildings){
    if(Math.abs(b.x-x)>region||Math.abs(b.z-z)>region)continue;
    const rot=b.rot||0;
    const cos=Math.cos(rot),sin=Math.sin(rot);
    const px=x-b.x,pz=z-b.z;
    const lx=px*cos+pz*sin,lz=-px*sin+pz*cos;
    if(Math.abs(lx)<b.w/2+.4&&Math.abs(lz)<b.d/2+.4)return true;
  }
  return false;
}
export function nativeZoneLabel(point){return zoneAt(point.x,point.z).name;}
export function nativeFloor(x,z,seed=42){return nativeWorldHeight(x,z,seed);}

// An authentic WOC zone hub is the HIGHFLY first-entry settlement destination.
// The original WOC spawn (-94,-58) is maintained in nativeWorldStart as source
// reference; HIGHFLY chooses a walkable plaza edge in the SAME authored town.
export function nativeHunterEntryPoint(){
  const hub=zoneAt(-94,-58).hub;
  return {x:hub.x-8,z:hub.z-4};
}
