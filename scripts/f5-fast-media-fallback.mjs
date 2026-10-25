// Avoid hundreds of 404 x 3 attempts at world entry when restricted art was excluded.
// Does not add, generate or borrow any art; only bypasses fetch retries for files
// that the same explicit legal whitelist will not ship. Fallback is still QA-gated.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {allowResource} from './f5-legal-media-policy.mjs';
const root=resolve(process.argv[2]||'upstream/world-of-claudecraft');
const manifestText=await readFile(join(root,'src/render/assets/manifest.generated.ts'),'utf8');
const names=[...manifestText.matchAll(/"([^"]+)": "\/media\/[^"]+"/g)].map(m=>m[1]);
if(names.length<1000)throw Error('Incomplete pinned WOC asset manifest');
const allowed=names.filter(name=>allowResource(name));
if(allowed.length<100)throw Error('Asset whitelist unexpectedly small');
const file=join(root,'src/render/assets/loader.ts');
let s=await readFile(file,'utf8');
if(s.includes('f5ShouldSkip'))throw Error('WOC F5 media-loader patch is already present');
const declaration=[
  'const f5MediaAllowed = new Set<string>('+JSON.stringify(allowed)+');',
  'function f5ShouldSkip(url:string):boolean {',
  "  if(import.meta.env.VITE_HIGHFLY_F5_LICENSED_SUBSET !== '1')return false;",
  "  const logical=url.replace(/^\\/+/, '');",
  "  if(!/^(models|textures|env|vfx)\\//.test(logical))return false;",
  '  return !f5MediaAllowed.has(logical);',
  '}',,
  'function f5ProceduralGltf(url:string):GLTF {',,
  "  const group=new THREE.Group();",,
  "  group.name='HIGHFLY_F5_ORIGINAL_GEOMETRY_ONLY';",,
  "  const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0x84765d,roughness:1}));",,
  "  mesh.name='RIGHTS_SAFE_PLACEHOLDER';",,
  "  const n=mesh.geometry.getAttribute('position').count;",,
  "  const c=new Float32Array(n*3); c.fill(1);",,
  "  mesh.geometry.setAttribute('color',new THREE.BufferAttribute(c,3));",,
  "  const lod=new THREE.Group();lod.name='LOD0';lod.add(mesh);group.add(lod);",,
  "  return {scene:group,scenes:[group],animations:[],cameras:[],asset:{version:'2.0'},userData:{}} as unknown as GLTF;",,
  '}',,
  ''
].join('\n');
const anchor="let gltfLoader: GLTFLoader | null = null;";
if(!s.includes(anchor))throw Error('Loader location changed');
s=s.replace(anchor,declaration+anchor);
for(const method of ['loadGltf','loadTexture','loadKtx2Texture']) {
  const start=s.indexOf('export function '+method+'(');
  const at=s.indexOf('  const resolved = assetUrl(url);',start);
  if(start<0||at<0||at-start>800)throw Error('Expected WOC media-loading function not found: '+method);
  const guard=method==='loadGltf'
    ? "  if(f5ShouldSkip(url)){const logical=url.replace(/^\\/+/, '');if(/^(models\\/chars\\/|models\\/creatures\\/)/.test(logical))return Promise.reject(new Error('asset load failed: '+url+' (restricted character rig)'));return Promise.resolve(f5ProceduralGltf(url));}\n"
    : "  if(f5ShouldSkip(url))return Promise.reject(new Error('asset load failed: '+url+' (media excluded from permitted preview)'));\n";
  s=s.slice(0,at)+guard+s.slice(at);
}
await writeFile(file,s,'utf8');
console.log('F5_WOC_MEDIA_PRELOAD_SHORTCIRCUIT',JSON.stringify({manifestEntries:names.length,allowed:allowed.length,blocked:names.length-allowed.length}));
