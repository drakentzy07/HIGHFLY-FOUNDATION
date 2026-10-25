// F5-01: archive metadata only, NEVER copyrighted media binaries.
// Neither a folder name nor a CREDITS group label is a license grant for a file.
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, resolve, relative, sep, extname } from 'node:path';

const base = resolve(process.argv[2] || 'upstream/world-of-claudecraft');
const out = resolve(process.argv[3] || 'f5-audit-metadata');
const commit = '493c35a108cef6c8aa290e8793107b1cd117886e';
const statuses = ['Yes','Yes, attribution required','Yes, under SIL OFL 1.1','With the project only','No, permission required','Non-commercial only, with attribution'];
const media = new Set(['.glb','.gltf','.bin','.fbx','.obj','.mtl','.png','.jpg','.jpeg','.webp','.avif','.ktx','.ktx2','.basis','.hdr','.exr','.gif','.svg','.mp3','.ogg','.wav','.flac','.m4a','.mp4','.webm','.ttf','.otf','.woff','.woff2','.atlas','.psd','.blend']);
async function* walk(path) {
  let entries;
  try { entries=await readdir(path,{withFileTypes:true}); }
  catch(e) { if(e.code==='ENOENT') return; throw e; }
  for(const x of entries.sort((a,b)=>a.name.localeCompare(b.name,'en'))) {
    const p=join(path,x.name);
    if(x.isDirectory()) yield* walk(p);
    else if(x.isFile()) yield p;
  }
}
async function sha256(path) {
  const hash=createHash('sha256');
  for await(const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}
const credits=await readFile(join(base,'CREDITS.md'),'utf8');
const credit_entries=[];
for(const [i,line] of credits.split(/\r?\n/).entries()) {
  if(!line.startsWith('|') || /^\|\s*[-|: ]+\|/.test(line)) continue;
  const c=line.split('|').slice(1,-1).map(s=>s.trim());
  if(c.length<5) continue;
  const status=c.at(-1).replaceAll('**','').trim();
  if(!statuses.includes(status)) continue;
  credit_entries.push({line:i+1,assets:c[0],author:c[1],source:c[2],license:c[3],redistribution:status});
}
if(!credit_entries.length) throw Error('No legal ledger: blocking F5 audit');
const files=[];
for(const dir of ['public','src']) for await(const p of walk(join(base,dir))) {
  const ext=extname(p).toLowerCase();
  if(dir==='src' && !media.has(ext)) continue;
  files.push({path:relative(base,p).split(sep).join('/'),bytes:(await stat(p)).size,extension:ext,sha256:await sha256(p),license:'UNVERIFIED',credit_ledger_line:null,public_release_allowed:false});
}
if(!files.length) throw Error('No files: blocking F5 audit');
files.sort((a,b)=>a.path.localeCompare(b.path,'en'));
await mkdir(out,{recursive:true});
const info={upstream:'levy-street/world-of-claudecraft',commit,notice:'METADATA ONLY. MIT code license does not grant rights to media. Manual mapping required before publishing.'};
const summary={...info,files:files.length,bytes:files.reduce((n,f)=>n+f.bytes,0),ledger_rows:credit_entries.length,individually_verified:0,publication_allowed:false,credits_categories:Object.fromEntries(statuses.map(s=>[s,credit_entries.filter(r=>r.redistribution===s).length]))};
await Promise.all([
  writeFile(join(out,'F5-MEDIA-SHA256.json'),JSON.stringify({...info,files},null,2)+'\n'),
  writeFile(join(out,'F5-CREDITS-LEDGER.json'),JSON.stringify({...info,credit_entries},null,2)+'\n'),
  writeFile(join(out,'F5-STATUS.json'),JSON.stringify(summary,null,2)+'\n')
]);
console.log('F5_METADATA_ONLY_ASSET_SHA256',JSON.stringify(summary));
