// This module relies on the EXACT approved WOC v0.44.7 MIT SOURCE,
// supplied by a pinned read-only CI checkout. It imports NO WOC art/media.
import { groundHeight, waterLevelAt } from "../../.vendor/world-of-claudecraft/src/sim/world.ts";
import { BUILTIN_WORLD, PLAYER_START, ROADS, ZONES, zoneAt } from "../../.vendor/world-of-claudecraft/src/sim/data.ts";

export const WOC_SOURCE_COMMIT = "493c35a108cef6c8aa290e8793107b1cd117886e";
export const nativeWorldStart = Object.freeze({x:PLAYER_START.x,z:PLAYER_START.z});
export function nativeWorldHeight(x,z,seed=42){
  return groundHeight(x,z,seed);
}
export function nativeWaterLevelAt(x,z,seed=42){
  return waterLevelAt(x,z,seed);
}
export function nativeWorldZone(x,z){
  const zone=zoneAt(x,z);
  return {id:zone.id,name:zone.name,levelMin:zone.levelMin,
    levelMax:zone.levelMax,zMin:zone.zMin,zMax:zone.zMax};
}
export function nativeWorldSummary(){
  return {
    source:WOC_SOURCE_COMMIT,
    zones:ZONES.map(z=>({id:z.id,name:z.name,xMin:z.xMin??-180,xMax:z.xMax??180,
      zMin:z.zMin,zMax:z.zMax})),
    roads:ROADS.length,
    roadPoints:ROADS.reduce((n,p)=>n+p.length,0),
    camps:BUILTIN_WORLD.camps.length,
    npcs:BUILTIN_WORLD.npcs.length,
    playerStart:{...nativeWorldStart}
  };
}
