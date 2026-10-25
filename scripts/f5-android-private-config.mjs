// F5 local-only Android identity. Never copy WOC media into HIGHFLY.
// Input is an already-cloned, pinned, privately held WOC 0.44.7 checkout.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const root=resolve(process.argv[2]||'.highfly-local/world-of-claudecraft-0447');
const packageJson=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
if(packageJson.name!=='world-of-claudecraft'||packageJson.version!=='0.44.7')throw Error('Expected WOC 0.44.7; abort.');
async function replaceExact(rel,replacements){
 const path=join(root,rel);let text=await readFile(path,'utf8');
 for(const [before,after] of replacements){
   if(text.includes(after))continue; // safe reruns
   if(!text.includes(before))throw Error('Unrecognized original file: '+rel+'; no patch');
   text=text.replace(before,after);
 }
 await writeFile(path,text,'utf8');
}
await replaceExact('capacitor.config.ts',[
 ["appId: 'com.worldofclaudecraft'","appId: 'com.highfly.f5local'"],
 ["appName: 'World of ClaudeCraft'","appName: 'HIGHFLY F5 LOCAL'"],
 ["autoUpdate: true","autoUpdate: false"],
 ["updateUrl: 'https://worldofclaudecraft.com/api/ota/updates'","updateUrl: 'https://localhost.invalid/highfly-f5-no-updates'"]
]);
await replaceExact('android/app/build.gradle',[
 ['applicationId "com.worldofclaudecraft"','applicationId "com.highfly.f5local"']
]);
console.log('F5_ANDROID_PRIVATE_IDENTITY_CONFIGURED; OTA_DISABLED; NO_PUBLIC_DISTRIBUTION');
