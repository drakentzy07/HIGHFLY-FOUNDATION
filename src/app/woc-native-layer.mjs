// REAL World of ClaudeCraft v0.44.7 geographic renderer, not an invented terrain.
// The original source is checked out at its PINNED MIT revision during CI build.
// This is not activated in main: every asset has to pass a separate license gate.
import { buildTerrain } from "../../.vendor/world-of-claudecraft/src/render/terrain.ts";
import { BUILTIN_WORLD, ZONES, zoneAt } from "../../.vendor/world-of-claudecraft/src/sim/data.ts";
import { nativeWorldStart, nativeWorldHeight, WOC_SOURCE_COMMIT } from "./native-woc-source.mjs";
const finite=n=>typeof n==="number"&&Number.isFinite(n);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function nativeWorldRosterAround(point,radius=100){
  if(!finite(point?.x)||!finite(point?.z)||!finite(radius)||radius<=0)
    throw Error("invalid-woc-world-point");
  const npcs=Object.values(BUILTIN_WORLD.npcs)
    .filter(n=>!n.dynamic&&distance(n.pos,point)<radius)
    .map(n=>({id:n.id,name:n.name,title:n.title,position:{...n.pos}}));
  const camps=BUILTIN_WORLD.camps
    .filter(c=>distance(c.center,point)<radius+c.radius)
    .map(c=>({mobId:c.mobId,center:{...c.center},count:c.count,radius:c.radius}));
  const buildings=BUILTIN_WORLD.props.buildings
    .filter(b=>finite(b.x)&&finite(b.z)&&distance(b,point)<radius)
    .map(b=>({id:b.id??null,kind:b.kind,position:{x:b.x,z:b.z},rot:b.rot}));
  return {npcs,camps,buildings};
}
export function createNativeWocTerrain(scene,{
  seed=42,start=nativeWorldStart,onProgress
}={}){
  if(!finite(start.x)||!finite(start.z)||!finite(seed))throw Error("invalid-native-start");
  const terrain=buildTerrain(seed,start);
  scene.add(terrain.group);
  let disposed=false,current=null;
  async function ensureAt(point){
    if(disposed)throw Error("native-terrain-disposed");
    const zone=zoneAt(point.x,point.z);
    if(!terrain.isZoneLoaded(zone.id)){
      await terrain.ensureZone(zone,(done,total)=>onProgress?.({zone:zone.name,done,total}));
    }
    current=zone.id;
    return {id:zone.id,name:zone.name,terrainHeight:nativeWorldHeight(point.x,point.z,seed)};
  }
  return {
    source:WOC_SOURCE_COMMIT,playerStart:{...start},zoneCount:ZONES.length,
    terrainGroup:terrain.group,
    ready:ensureAt(start),
    async ensureAt(point){return ensureAt(point)},
    update(point,far=85){if(!disposed)terrain.update(point.x,point.z,far)},
    getZoneId(){return current},
    getRoster(point,radius=100){return nativeWorldRosterAround(point,radius)},
    dispose(){if(disposed)return;disposed=true;terrain.cancelStreaming();terrain.dispose();scene.remove(terrain.group);}
  };
}
