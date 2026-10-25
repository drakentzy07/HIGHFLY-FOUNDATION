// HIGHFLY F5: build inventory, NOT a license grant.
// Scan the complete pinned upstream files in the ephemeral CI runner.
// Only human-verified per-asset provenance may authorize public packaging.
import { readdirSync,statSync,existsSync,readFileSync } from "node:fs";
import { resolve,relative,extname,join,sep } from "node:path";
const base=resolve(process.argv[2]||"upstream/world-of-claudecraft");
function scan(root) {
 const acc=[],stack=[root];
 while(stack.length){
  const dir=stack.pop();if(!existsSync(dir))continue;
  for(const e of readdirSync(dir,{withFileTypes:true})){
   const p=join(dir,e.name);
   if(e.isDirectory())stack.push(p);
   else if(e.isFile()){const st=statSync(p);acc.push({p:relative(root,p).split(sep).join("/"),bytes:st.size});}
  }
 }
 return acc;
}
const group=(files,split)=>{
 const groups=new Map();
 for(const file of files){const key=split(file);
  const o=groups.get(key)||{name:key,count:0,bytes:0};
  o.count++;o.bytes+=file.bytes;groups.set(key,o);}
 return [...groups.values()].sort((a,b)=>b.bytes-a.bytes);
};
const pretty=b=>(b/(1024*1024)).toFixed(1)+" MiB";
const outputs=[
 ["SOURCE_PUBLIC",scan(join(base,"public"))],
 ["BUILT_DIST",scan(join(base,"dist"))]
];
for(const [label,files] of outputs){
 console.log("F5_INVENTORY",label,"FILES",files.length,
  "SIZE",pretty(files.reduce((sum,o)=>sum+o.bytes,0)));
 console.log("F5_TOP_CATEGORIES",label,JSON.stringify(group(files,f=>f.p.split("/").slice(0,2).join("/")).slice(0,16).map(o=>({...o,mb:pretty(o.bytes),bytes:undefined}))));
 console.log("F5_EXTENSION_CATEGORIES",label,JSON.stringify(group(files,f=>extname(f.p).toLowerCase()||"(none)").slice(0,16).map(o=>({...o,mb:pretty(o.bytes),bytes:undefined}))));
 console.log("F5_LARGEST_FILES",label,JSON.stringify(files.sort((a,b)=>b.bytes-a.bytes).slice(0,8).map(o=>({path:o.p,mb:pretty(o.bytes)}))));
}
console.log("F5_LICENSE_GATE=BLOCKED_BY_DEFAULT");
console.log("F5_PUBLISH_ELIGIBILITY=NO: exact-file provenance and restricted-asset removal required");

const credits=readFileSync(join(base,"CREDITS.md"),"utf8");
const categories=new Map();
for(const line of credits.split(/\\r?\\n/)){
  if(!line.startsWith("|")||/^\\|\\s*[-|: ]+\\|/.test(line))continue;
  const cells=line.split("|").slice(1,-1).map(c=>c.trim());
  if(cells.length<5)continue;
  const val=cells.at(-1).replace(/\\*\\*/g,"").trim();
  if(!["Yes","Yes, attribution required","Yes, under SIL OFL 1.1",
    "With the project only","No, permission required",
    "Non-commercial only, with attribution"].includes(val))continue;
  categories.set(val,(categories.get(val)||0)+1);
}
console.log("F5_WOC_CREDITS_DECLARED_ROWS_NOT_FILES",
  JSON.stringify(Object.fromEntries(categories)));
console.log("F5_PROJECT_ONLY_FORK_ALLOWED_BUT_NOT_STANDALONE_ASSETS");
