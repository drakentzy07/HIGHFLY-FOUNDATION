import { allowResource } from './f5-legal-media-policy.mjs';
// HIGHFLY F5: public-media release gate. Default DENY for media with unknown provenance.
// The ORIGINAL WOC 0.44.7 engine/world code stays complete. This filter cannot
// certify a missing asset; media require evidence in WOC CREDITS.md or a listed CC0 pack.
// No GitHub Pages deploy permitted until the report is inspected and browser-QA passes.
import {readFile,writeFile,readdir,stat,mkdir,copyFile,rm} from 'node:fs/promises';
import {resolve,join,relative,dirname,extname,sep} from 'node:path';
const root=resolve(process.argv[2]||'upstream/world-of-claudecraft');
const dest=resolve(process.argv[3]||'f5-public-review');
const SRC=join(root,'dist');
if(dest===SRC||dest.startsWith(SRC+sep))throw Error('Cannot mutate original dist');
const mapText=await readFile(join(root,'src/render/assets/manifest.generated.ts'),'utf8');
const manifest=new Map([...mapText.matchAll(/"([^"]+)": "(\/media\/[^"]+)"/g)].map(m=>[m[2].slice(1),m[1]]));
if(manifest.size<300)throw Error('Upstream manifest missing assets: abort');
const credit=await readFile(join(root,'CREDITS.md'),'utf8');
for(const marker of ['With the project only','No, permission required','KayKit','Quaternius','Kenney'])if(!credit.includes(marker))throw Error('Upstream media license ledger changed: '+marker);
async function* walk(dir) {
  let names;try{names=await readdir(dir,{withFileTypes:true});}catch(e){if(e.code==='ENOENT')return;throw e;}
  for(const d of names){
    const p=join(dir,d.name);
    if(d.isDirectory())yield* walk(p);
    else if(d.isFile())yield p;
  }
}
await rm(dest,{recursive:true,force:true});
await mkdir(dest,{recursive:true});
const report={label:'F5 LEGAL-MEDIA SUBSET — not FULL visual fidelity',upstream:'WOC 0.44.7',approved:[],blocked:[],bytes:0,visualGaps:[],verifiedBy:'pinned upstream CREDITS.md + explicit whitelist',license: 'MIT code, CC0 approved media, WOC fork-only media; mandatory credits preserved'};
async function put(src,target) {
  await mkdir(dirname(target),{recursive:true});
  await copyFile(src,target);
  report.bytes+=(await stat(src)).size;
}
for await(const src of walk(SRC)){
  const rel=relative(SRC,src).split(sep).join('/');
  const ext=extname(rel).toLowerCase();
  let permit=null;
  if(rel.startsWith('media/')) {
    const logical=manifest.get(rel);permit=logical?allowResource(logical):null;
  } else if(rel.startsWith('assets/')) {
    permit=['.js','.css','.mjs','.wasm'].includes(ext)?'Compiled original MIT code (dependencies retain own licenses)':null;
  } else if(/^basis\/(?:basis_transcoder\.(?:js|wasm))$/.test(rel))permit='Apache-2.0 three.js Basis transcoder';
  else if(/^fonts\/[^/]+\.woff2$/.test(rel))permit='SIL OFL 1.1: font families recorded in WOC CREDITS.md';
  else if(['index.html','play.html','editor.html','highfly-f5-local.html','guide.html','manifest.webmanifest'].includes(rel))permit='Original MIT app/client entry';
  // Misc public static images/audio/brand/icon art remain BLOCKED unless individually licensed.
  if(permit){await put(src,join(dest,rel));report.approved.push({path:rel,credit:permit});}
  else report.blocked.push(rel);
}
// Some WOC loading-screen image elements use literal source URLs instead of
// assetUrl(). Restore only their project-fork-permitted raw aliases.
for(const [hashed,logical] of manifest){
  if(!/^textures\/loading\/[^/]+\.webp$/.test(logical))continue;
  if(!allowResource(logical))continue;
  try{await put(join(SRC,hashed),join(dest,logical));report.approved.push({path:logical,credit:'With project only: raw alias for licensed loading screen art'});}catch(e){throw Error('Missing permitted loading image original/hash: '+logical);}
}
for(const name of ['LICENSE','CREDITS.md','THIRD_PARTY_NOTICES.md']) {
  const p=join(root,name);try{await put(p,join(dest,name));}catch(e){if(name!=='THIRD_PARTY_NOTICES.md')throw e;}
}
const index=join(dest,'index.html');
let page=await readFile(index,'utf8');
page=page.replace(/<title[^>]*>[^<]*<\/title>/i,'<title>HIGHFLY F5 — Mundo de prueba</title>');
page=page.replace(/<meta name="apple-mobile-web-app-title" content="[^"]*"\s*\/>/,'<meta name="apple-mobile-web-app-title" content="HIGHFLY F5" />');
await writeFile(index,page,'utf8');
const launch=join(dest,'highfly-f5-local.html');
let home=await readFile(launch,'utf8');
home=home.replace('F5 LOCAL','F5 WEB').replace('funciona solo mientras el servidor local de desarrollo está abierto','funciona en un servidor de pruebas público y utiliza únicamente medios con permisos identificados').replace('href="/?lang=es"','href="./?lang=es"').replace('href="/editor"','href="./editor.html"');
await writeFile(launch,home,'utf8');
report.visualGaps=['Only a licensed subset of GLBs/textures included; some models fall back to procedural shapes','Unverified/rightholder-restricted UI, audio and maps are intentionally absent','Gameplay is original WOC with HIGHFLY compatibility controls; Hunter universal and FURY not finished'];
await writeFile(join(dest,'HIGHFLY_F5_RELEASE_SCOPE.json'),JSON.stringify({...report,approvedCount:report.approved.length,blockedCount:report.blocked.length},null,2));
console.log('F5_PUBLIC_SAFE_SUBSET',JSON.stringify({approved:report.approved.length,blocked:report.blocked.length,MiB:Math.round(report.bytes/1048576),sampleBlocked:report.blocked.slice(0,12),releaseReady:false}));
if(report.approved.length<100||report.blocked.length<100)throw Error('Unexpected media manifest inventory: fail closed');
