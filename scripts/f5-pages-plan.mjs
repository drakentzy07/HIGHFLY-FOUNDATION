// F5 Pages full-world feasibility audit only. NEVER modifies or publishes media.
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readdir,stat,readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,relative,join,sep} from 'node:path';
const root=resolve(process.argv[2]||'upstream/world-of-claudecraft');
const out=resolve(process.argv[3]||'f5-pages-plan');
async function* walk(dir) {
  let names;
  try{names=await readdir(dir,{withFileTypes:true});}catch(e){if(e.code==='ENOENT')return;throw e;}
  for(const n of names){
    const p=join(dir,n.name);
    if(n.isDirectory())yield* walk(p);
    else if(n.isFile())yield p;
  }
}
async function sha(path) {
  const h=createHash('sha256');
  for await (const data of createReadStream(path)) h.update(data);
  return h.digest('hex');
}
const dist=join(root,'dist');
const groups=new Map();let total=0,files=0;
for await(const path of walk(dist)) {
  const st=await stat(path);
  const key=st.size+':'+await sha(path);
  const list=groups.get(key)||[];
  list.push(relative(dist,path).split(sep).join('/'));
  groups.set(key,list);total+=st.size;files++;
}
let bytesRepeated=0;const repeats=[];
for(const [key,paths] of groups){
  if(paths.length<2)continue;
  const size=Number(key.slice(0,key.indexOf(':')));
  bytesRepeated+=size*(paths.length-1);
  repeats.push({bytes:size,items:paths.length,paths:paths.slice(0,8)});
}
repeats.sort((a,b)=>b.bytes*(b.items-1)-a.bytes*(a.items-1));
const pageCap=1024**3;
const credits=await readFile(join(root,'CREDITS.md'),'utf8');
const buckets={YES:0,YES_WITH_ATTRIBUTION:0,PROJECT_ONLY:0,NO_PERMISSION:0,NONCOMMERCIAL:0,UNVERIFIED:0};
const creditPaths=[];
const backtick=String.fromCharCode(96);
for(const line of credits.split(/\r?\n/)){
  const cols=line.startsWith('|')?line.split('|').slice(1,-1).map(s=>s.trim()):[];
  if(cols.length<5)continue;
  const status=cols.at(-1).replaceAll('**','').trim();
  const matches=cols[0].split(backtick).filter(s=>s.startsWith('public/'));
  for(const media of matches)creditPaths.push({media,status});
}
for await(const p of walk(join(root,'public'))){
  const path=relative(root,p).split(sep).join('/');
  const matched=creditPaths.filter(x=>x.media===path);
  if(matched.some(x=>x.status==='No, permission required'))buckets.NO_PERMISSION++;
  else if(matched.some(x=>x.status==='Non-commercial only, with attribution'))buckets.NONCOMMERCIAL++;
  else if(matched.some(x=>x.status==='With the project only'))buckets.PROJECT_ONLY++;
  else if(matched.some(x=>x.status==='Yes, attribution required'||x.status==='Yes, under SIL OFL 1.1'))buckets.YES_WITH_ATTRIBUTION++;
  else if(matched.some(x=>x.status==='Yes'))buckets.YES++;
  else buckets.UNVERIFIED++;
}
await mkdir(out,{recursive:true});
const summary={
  note:'ANALYSIS ONLY: no media deleted, modified, uploaded or authorized. Identical hashes do not prove either URL can be removed without loader rewrites. Explicit individual path coverage only; all other paths UNVERIFIED.',
  upstream:'levy-street/world-of-claudecraft@493c35a108cef6c8aa290e8793107b1cd117886e',
  compiled:{files,bytes:total,GiB:Number((total/(1024**3)).toFixed(3))},
  duplicateHashes:{groups:repeats.length,redundantBytes:bytesRepeated,theoreticalUniqueBytes:total-bytesRepeated,potentialWithinPagesCap:total-bytesRepeated<=pageCap,largestGroups:repeats.slice(0,25)},
  licenseMapping:{exactPublicPaths:creditPaths.length,sourceFileCounts:buckets,allPublicFilesDocumented:buckets.UNVERIFIED===0},
  pages:{hardCapBytes:pageCap,ready:false,blockers:['Media rights not fully mapped','Native HIGHFLY FURY and universal Hunter not fully integrated','No validated production media manifest rewrite or public Android smoke test']}
};
await writeFile(join(out,'F5-PAGES-READINESS.json'),JSON.stringify(summary,null,2)+'\n');
console.log('F5_PAGES_READINESS_AUDIT',JSON.stringify({sizeGiB:summary.compiled.GiB,duplicates:repeats.length,redundantMiB:Math.round(bytesRepeated/1048576),theoreticalUniqueMiB:Math.round((total-bytesRepeated)/1048576),licenseMapping:buckets,pagesReady:false}));
