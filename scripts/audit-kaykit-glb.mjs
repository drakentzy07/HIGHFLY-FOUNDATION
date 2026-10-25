// Inspect approved KayKit GLB metadata without external packages or media redistribution.
import { readFileSync } from "node:fs";
const file=process.argv[2];
if(!file)throw Error("usage: node scripts/audit-kaykit-glb.mjs path.glb");
const bytes=readFileSync(file);
if(bytes.toString("ascii",0,4)!=="glTF"||bytes.readUInt32LE(4)!==2)
  throw Error("invalid-GLB-v2");
const chunkLength=bytes.readUInt32LE(12);
if(bytes.toString("ascii",16,20)!=="JSON")throw Error("missing-GLB-JSON");
const json=JSON.parse(bytes.toString("utf8",20,20+chunkLength));
const names=(json.nodes??[]).map(n=>n.name).filter(Boolean);
const faceNodes=names.filter(x=>/face|head|hair|eye|brow|skin|gender|male|female/i.test(x));
const meshNames=(json.meshes??[]).map(x=>x.name).filter(Boolean);
const morphMeshes=(json.meshes??[]).filter(m=>(m.primitives??[]).some(p=>p.targets?.length));
console.log(JSON.stringify({
  sourceFile:file,bytes:bytes.length,animations:(json.animations??[]).length,
  nodes:names.length,faceNodes,meshNames:meshNames.slice(0,55),
  morphTargetMeshes:morphMeshes.map(m=>m.name),
  skins:(json.skins??[]).map(s=>({name:s.name,joints:s.joints?.length})),
  images:(json.images??[]).length
},null,2));
