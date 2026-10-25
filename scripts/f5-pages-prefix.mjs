// Scoped GH Pages prefix; keeps stable F4 at /HIGHFLY-FOUNDATION/
// and mounts full WOC 0.44.7 client only at /HIGHFLY-FOUNDATION/f5/.
import {readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const root=resolve(process.argv[2]||'upstream/world-of-claudecraft');
const prefix='/HIGHFLY-FOUNDATION/f5/';
async function patch(path,old,replacement) {
  const p=join(root,path),s=await readFile(p,'utf8');
  if(s.includes(replacement)){console.log('F5_PAGES_PREFIX_ALREADY_APPLIED',path);return}
  if(!s.includes(old))throw Error('Failed to find source anchor '+path);
  await writeFile(p,s.replace(old,replacement),'utf8');
}
await patch('vite.config.ts',"  base: '/',","  base: '/HIGHFLY-FOUNDATION/f5/',");
await patch('src/render/assets/ktx2_support.ts',"const TRANSCODER_PATH = '/basis/';","const TRANSCODER_PATH = import.meta.env.BASE_URL + 'basis/';");
await patch('src/render/assets/media.ts',"  return MEDIA_ASSETS[logical] ?? \`/\${logical}\`;","  return import.meta.env.BASE_URL + (MEDIA_ASSETS[logical] ?? \`/\${logical}\`).replace(/^\\/+/, '');");
await patch('src/main.ts',
  'const offlineAvailable = isOfflineModeAvailable(import.meta.env.DEV);',
  "const offlineAvailable = isOfflineModeAvailable(import.meta.env.DEV || import.meta.env.VITE_HIGHFLY_F5_OFFLINE === '1');");

// Media rights extend to SVGs embedded inside MIT TS/JS. Replace the reserved
// maker's mark and third-party social marks with an original neutral circle;
// don't infer that a bundled trademark SVG is MIT just because it is inline.
const iconFile=join(root,'src/ui/ui_icons.ts');
let iconSource=await readFile(iconFile,'utf8');
const restricted=/(\n\s*(?:'makers-mark'|discord|twitch|kick|youtube|steam|solana|usdc):\s*\n\s*)'[^']*',/g;
let replaced=0;
iconSource=iconSource.replace(restricted,(_all,pre)=>{replaced++;return pre+"'"+'<circle cx="256" cy="256" r="114" fill="none" stroke="currentColor" stroke-width="42"/>'+ "',";});
if(replaced<4)throw Error('Trademark/commissioned inline SVG patch does not match pinned WOC source');
await writeFile(iconFile,iconSource,'utf8');
console.log('F5_RESERVED_INLINE_BRAND_MARKS_REPLACED',replaced);
console.log('F5_SCOPED_GITHUB_PAGES_PREFIX_READY',prefix);
