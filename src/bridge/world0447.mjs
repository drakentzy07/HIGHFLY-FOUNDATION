// HIGHFLY authored bridge. WOC 0.44.7 is a READ-ONLY data source here.
// Damage intents are NEVER applied to a WOC sim by this module.
import { useSkill, basicAttack } from "../core/hunter.mjs";
import { getSkill } from "../core/skills.mjs";
const finite = n => typeof n === "number" && Number.isFinite(n);
function assertWorld(w) {
  if (!(w?.entities instanceof Map) || !w.player?.pos ||
      !finite(w.player.pos.x) || !finite(w.player.pos.z))
    throw new Error("invalid-world");
}
export function collectEnemies(w, radius = 30) {
  assertWorld(w);
  if (!finite(radius) || radius < 0 || radius > 300) throw new Error("invalid-radius");
  const result = [];
  for (const e of w.entities.values()) {
    if (e?.kind !== "mob" || e.dead || !(e.hp > 0) ||
        !Number.isSafeInteger(e.id) || !finite(e.pos?.x) || !finite(e.pos?.z)) continue;
    const x = e.pos.x - w.player.pos.x, z = e.pos.z - w.player.pos.z;
    if (Math.hypot(x, z) <= radius) result.push({
      id: String(e.id), worldId: e.id, x, z, hp: e.hp,
      worldX: e.pos.x, worldZ: e.pos.z, alive: true
    });
  }
  return result;
}
export function castIntent({hunter, world, slot, now, aim = null, preference = "nearest"}) {
  const targets = collectEnemies(world);
  const result = useSkill(hunter, slot, { now, aim, targets, preference });
  if (!result.ok) return {...result, kind:"skill-intent", applied:false, hits:[]};
  const skill = getSkill(result.skillId);
  const byId = new Map(targets.map(t=>[t.id,t]));
  return {...result, kind:"skill-intent", applied:false, requiresAuthority:true,
    // Hit preview, NOT authoritative damage or guaranteed hostile targets.
    hits:result.hits.map(id=>{
      const t=byId.get(id);
      return {worldId:t.worldId, nominalDamage:skill.damage,
        worldPosition:{x:t.worldX,z:t.worldZ}};
    })};
}
export function attackIntent({hunter, world, now}) {
  const targets=collectEnemies(world,4);
  const result=basicAttack(hunter,{now,targets});
  const t=targets.find(t=>t.id===result.focusedId);
  return {...result,kind:"basic-intent",applied:false,requiresAuthority:true,
    hits:t?[{worldId:t.worldId,nominalDamage:(8+1.5*hunter.stats.str)*result.damageMultiplier}]:[]};
}
export function assertClassless(hunter) {
  if(hunter?.role!=="hunter" || ["classId","specId","specialization","talents"].some(k=>k in hunter))
    throw new Error("legacy-class-leak");
  return true;
}
