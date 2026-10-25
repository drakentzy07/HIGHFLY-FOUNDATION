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
console.log('F5_SCOPED_GITHUB_PAGES_PREFIX_READY',prefix);
