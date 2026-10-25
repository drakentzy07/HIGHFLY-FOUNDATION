// Classless schema guard and storage adapter. No external packages.
import { getSkill } from "./skills.mjs";
import { VISUAL_PRESETS, TRAINABLE, WEAPON_TYPES } from "./hunter.mjs";
const prefix="highfly:hunter:v1:";
const finite=n=>typeof n==="number"&&Number.isFinite(n);
const record=o=>o!==null&&typeof o==="object"&&!Array.isArray(o);
const validWeapon=w=>w===null||(record(w)&&typeof w.id==="string"&&!!w.id&&
  WEAPON_TYPES.includes(w.type)&&typeof w.twoHanded==="boolean");
export function validateHunterSave(h) {
  if(!record(h)||h.schemaVersion!==1||h.role!=="hunter"||
    ["classId","specId","specialization","talents"].some(k=>k in h)||
    typeof h.id!=="string"||!h.id||h.id.length>100||
    typeof h.name!=="string"||!h.name||h.name.length>100||
    !["masculino","femenino"].includes(h.presentation)||
    !Object.hasOwn(VISUAL_PRESETS,h.visual)||
    !Number.isInteger(h.level)||h.level<1||h.level>20||
    !Number.isSafeInteger(h.xp)||h.xp<0)return false;
  if(![h.stats,h.training,h.vitals,h.equipment,h.cooldowns,h.facing,h.combo,h.motion].every(record))return false;
  if(!TRAINABLE.every(k=>finite(h.stats[k])&&h.stats[k]>=0&&finite(h.training[k])&&h.training[k]>=0))return false;
  for(const k of ["hp","mana","energy"]){
    const max="max"+k[0].toUpperCase()+k.slice(1);
    if(!finite(h.vitals[k])||!finite(h.vitals[max])||h.vitals[k]<0||
       h.vitals[max]<=0||h.vitals[k]>h.vitals[max])return false;
  }
  if(!validWeapon(h.equipment.mainHand)||!validWeapon(h.equipment.offHand)||
    (h.equipment.mainHand?.twoHanded&&h.equipment.offHand!==null))return false;
  if(!Array.isArray(h.learnedSkills)||!Array.isArray(h.activeSkills)||
    h.learnedSkills.length>128||h.activeSkills.length!==4||
    new Set(h.activeSkills).size!==4||
    !h.learnedSkills.every(s=>typeof s==="string"&&getSkill(s))||
    !h.activeSkills.every(s=>h.learnedSkills.includes(s)&&getSkill(s)))return false;
  if(!Object.entries(h.cooldowns).every(([k,v])=>getSkill(k)&&finite(v)&&v>=0)||
     !Number.isInteger(h.combo.step)||h.combo.step<0||h.combo.step>4||
     (h.combo.lastAt!==null&&(!finite(h.combo.lastAt)||h.combo.lastAt<0))||
     !finite(h.facing.x)||!finite(h.facing.z)||
     !["moving","airborne","dashing"].every(k=>typeof h.motion[k]==="boolean"))return false;
  return true;
}
function key(id){
  if(typeof id!=="string"||!id||id.length>100)throw Error("save-id-invalid");
  return prefix+encodeURIComponent(id);
}
export function saveHunter(storage,h){
  if(!validateHunterSave(h))throw Error("save-invalid");
  const data=JSON.stringify(h);
  if(data.length>50000)throw Error("save-too-large");
  storage.setItem(key(h.id),data);return true;
}
export function loadHunter(storage,id){
  const raw=storage.getItem(key(id));
  if(raw===null||raw.length>50000)return null;
  try{
    const h=JSON.parse(raw);
    return h.id===id&&validateHunterSave(h)?h:null;
  }catch{return null;}
}
export function deleteHunter(storage,id){storage.removeItem(key(id));}
export function memoryStorage(){
  const data=new Map();
  return {getItem(k){return data.get(k)??null;},
    setItem(k,v){data.set(k,String(v));},removeItem(k){data.delete(k);}};
}
