import { buildTerrain } from "../../.vendor/world-of-claudecraft/src/render/terrain.ts";
import { nativeWorldHeight, nativeWorldSummary, nativeWorldStart, nativeWorldZone } from "./native-woc-source.mjs";
const summary=nativeWorldSummary();
const start=nativeWorldStart;
console.info("HIGHFLY_WOC_REAL_SOURCE",summary,nativeWorldZone(start.x,start.z),
  nativeWorldHeight(start.x,start.z,42));

console.info("NATIVE_WOC_0447_TERRAIN_RENDERER",typeof buildTerrain);
