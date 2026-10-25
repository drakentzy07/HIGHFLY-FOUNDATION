import * as THREE from "three";
// Deterministic FOLIAGE POSITIONS from the original WOC v0.44.7 simulation.
// This is NOT random replacement placement. The art is the CC0 low-tier model
// family used by WOC's own foliage renderer, from the pinned same-source tag.
import { generateDecorationsInBounds } from "../../.vendor/world-of-claudecraft/src/sim/world.ts";
import {nativeWorldHeight} from "./native-woc-source.mjs";

const MODELS=Object.freeze({tree:"pine_1.glb",tree2:"oak_1.glb",rock:"rock_1.glb"});
export function foliageAtOriginalPositions(start,radius=80,seed=42){
  const raw=generateDecorationsInBounds(seed,{minX:start.x-radius,maxX:start.x+radius,
    minZ:start.z-radius,maxZ:start.z+radius});
  return raw.filter(d=>Math.hypot(d.x-start.x,d.z-start.z)<=radius).map(d=>({
    ...d,asset:(d.kind==="tree2"&&["marsh","dusk"].includes(d.biome))
      ?"twisted_1.glb":MODELS[d.kind],
    y:nativeWorldHeight(d.x,d.z,seed)
  }));
}
export async function renderAuthenticFoliage({scene,loader,start,seed=42,notice}){
  const points=foliageAtOriginalPositions(start,86,seed).slice(0,105);
  const glbs=new Map();const base=import.meta.env.BASE_URL+"assets/woc-cc0/";
  let placed=0;
  for(const d of points){
    if(!d.asset)continue;
    if(!glbs.has(d.asset))glbs.set(d.asset,loader.loadAsync(base+d.asset).then(o=>o.scene).catch(e=>{
      console.warn("WOC foliage CC0 asset missing:",d.asset,e);return null;
    }));
    const original=await glbs.get(d.asset);if(!original)continue;
    const m=original.clone(true),box=new THREE.Box3().setFromObject(m);
    const dimension=box.getSize(new THREE.Vector3());
    if(dimension.y<.001)continue;
    // WOC foliage's original low-tier species (pine_1, oak_1, twisted_1,
    // rock_1), original scatter position + decoration scale.
    const baseScale=d.asset==="pine_1.glb"?1.1:d.asset==="oak_1.glb"?1.15:
      d.asset==="twisted_1.glb"?.5:1;
    m.scale.setScalar(d.scale*baseScale);
    m.position.set(d.x-box.getCenter(new THREE.Vector3()).x*d.scale*baseScale,
      d.y-box.min.y*d.scale*baseScale-.05,
      d.z-box.getCenter(new THREE.Vector3()).z*d.scale*baseScale);
    m.rotation.y=(d.variant%16)*Math.PI/8;
    scene.add(m);placed++;
  }
  notice?.("Vegetación original WOC: "+placed+" árboles/rocas en puntos auténticos");
  return {count:placed,drawn:points.length};
}
