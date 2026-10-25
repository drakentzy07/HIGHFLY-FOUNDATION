import { DEFAULT_SKILLS, getSkill } from "./skills.mjs";

// The design is intentionally classless. Warrior/Mage/Rogue are NEVER hidden class IDs.
// Character persistence can serialize this pure JSON snapshot directly.
export const MAX_LEVEL = 20;
export const TRAINABLE = Object.freeze(["str", "agi", "vit", "per", "int"]);
export const VISUAL_PRESETS = Object.freeze({
  kaykit_knight: Object.freeze({ asset: "Knight.glb", rig: "Rig_Medium", availableWhenImported: true }),
  kaykit_mage: Object.freeze({ asset: "Mage.glb", rig: "Rig_Medium", availableWhenImported: true }),
  kaykit_rogue: Object.freeze({ asset: "Rogue.glb", rig: "Rig_Medium", availableWhenImported: true }),
  kaykit_hooded: Object.freeze({ asset: "Rogue_Hooded.glb", rig: "Rig_Medium", availableWhenImported: true }),
  kaykit_barbarian: Object.freeze({ asset: "Barbarian.glb", rig: "Rig_Medium", availableWhenImported: true })
});
export const WEAPON_TYPES = Object.freeze(["sword", "dagger", "axe", "staff", "bow", "crossbow", "mace", "shield", "spear"]);

function ensure(ok, reason) { if (!ok) throw new Error(reason); }
function finite(n) { return typeof n === "number" && Number.isFinite(n); }
function clamp(n, low, high) { return Math.min(high, Math.max(low, n)); }
function maxVitals(h) {
  return { hp: 100 + 8 * h.stats.vit, mana: 60 + 5 * h.stats.int,
    energy: 100 + 2 * h.stats.agi };
}
export function makeHunter({ id, name, presentation = "masculino", visual = "kaykit_knight" } = {}) {
  ensure(typeof id === "string" && id.trim().length > 0, "id-required");
  ensure(typeof name === "string" && name.trim().length > 0, "name-required");
  ensure(["masculino", "femenino"].includes(presentation), "presentation-invalid");
  ensure(Object.hasOwn(VISUAL_PRESETS, visual), "visual-invalid");
  const hunter = {
    schemaVersion: 1, id, name: name.trim(), role: "hunter", level: 1, xp: 0,
    stats: { str: 5, agi: 5, vit: 5, per: 5, int: 5 },
    training: { str: 0, agi: 0, vit: 0, per: 0, int: 0 },
    presentation, visual, equipment: { mainHand: null, offHand: null },
    learnedSkills: [...DEFAULT_SKILLS], activeSkills: [...DEFAULT_SKILLS],
    cooldowns: {}, combo: { step: 0, lastAt: null }, facing: { x: 0, z: 1 },
    motion: { moving: false, airborne: false, dashing: false },
    vitals: { hp: 0, mana: 0, energy: 0, maxHp: 0, maxMana: 0, maxEnergy: 0 }
  };
  const maximums = maxVitals(hunter);
  hunter.vitals = { hp: maximums.hp, mana: maximums.mana, energy: maximums.energy,
    maxHp: maximums.hp, maxMana: maximums.mana, maxEnergy: maximums.energy };
  return hunter;
}
export function setVisual(h, { presentation = h.presentation, visual = h.visual }) {
  ensure(["masculino","femenino"].includes(presentation), "presentation-invalid");
  ensure(Object.hasOwn(VISUAL_PRESETS, visual), "visual-invalid");
  h.presentation = presentation;
  h.visual = visual;
  return h;
}
export function train(h, attribute, points = 1) {
  ensure(TRAINABLE.includes(attribute), "attribute-invalid");
  ensure(Number.isSafeInteger(points) && points > 0 && points <= 100, "points-invalid");
  h.training[attribute] += points;
  h.stats[attribute] += points;
  const oldHp = h.vitals.maxHp, oldMana = h.vitals.maxMana, oldEnergy = h.vitals.maxEnergy;
  const max = maxVitals(h);
  h.vitals.maxHp = max.hp; h.vitals.maxMana = max.mana; h.vitals.maxEnergy = max.energy;
  h.vitals.hp = clamp(h.vitals.hp + (max.hp - oldHp), 0, max.hp);
  h.vitals.mana = clamp(h.vitals.mana + (max.mana - oldMana), 0, max.mana);
  h.vitals.energy = clamp(h.vitals.energy + (max.energy - oldEnergy), 0, max.energy);
  return h;
}
export function grantXp(h, amount) {
  ensure(Number.isSafeInteger(amount) && amount >= 0, "xp-invalid");
  h.xp += amount;
  while (h.level < MAX_LEVEL && h.xp >= 100 * h.level) {
    h.xp -= 100 * h.level;
    h.level++;
  }
  return h;
}
export function equip(h, slot, weapon) {
  ensure(slot === "mainHand" || slot === "offHand", "slot-invalid");
  if (weapon !== null) {
    ensure(weapon && typeof weapon.id === "string" && weapon.id.length > 0, "weapon-id-invalid");
    ensure(WEAPON_TYPES.includes(weapon.type), "weapon-type-invalid");
    ensure(typeof weapon.twoHanded === "boolean", "weapon-hands-invalid");
    ensure(slot !== "offHand" || (!weapon.twoHanded && weapon.type !== "bow" && weapon.type !== "crossbow"),
      "offhand-incompatible");
  }
  if (slot === "offHand" && weapon && h.equipment.mainHand?.twoHanded) throw new Error("two-handed-mainhand");
  h.equipment[slot] = weapon === null ? null : { id: weapon.id, type: weapon.type, twoHanded: weapon.twoHanded };
  if (slot === "mainHand" && weapon?.twoHanded) h.equipment.offHand = null;
  // No class gate: the equipped object and grip dictate animations, not Warrior or Mage.
  return h;
}
export function learn(h, skillId) {
  ensure(getSkill(skillId), "skill-unknown");
  if (!h.learnedSkills.includes(skillId)) h.learnedSkills.push(skillId);
  return h;
}
export function setLoadout(h, ids) {
  ensure(Array.isArray(ids) && ids.length === 4 && new Set(ids).size === 4, "four-distinct-skills-required");
  ensure(ids.every(id => h.learnedSkills.includes(id) && getSkill(id)), "unlearned-skill");
  h.activeSkills = [...ids];
  return h;
}
export function setFacing(h, vector) {
  ensure(vector && finite(vector.x) && finite(vector.z), "aim-invalid");
  const len = Math.hypot(vector.x, vector.z);
  ensure(len > 0, "aim-zero");
  h.facing = { x: vector.x / len, z: vector.z / len };
  return h;
}
export function setMotion(h, partial) {
  for (const k of ["moving", "airborne", "dashing"])
    if (Object.hasOwn(partial, k)) {
      ensure(typeof partial[k] === "boolean", "motion-invalid");
      h.motion[k] = partial[k];
    }
  return h;
}
function withinShape(h, skill, target) {
  const dx = target.x, dz = target.z;
  if (!finite(dx) || !finite(dz)) return false;
  const length = Math.hypot(dx, dz);
  if (skill.shape === "circle") return length <= skill.radius;
  if (length > skill.reach) return false;
  if (length === 0) return true;
  const dot = (dx * h.facing.x + dz * h.facing.z) / length;
  if (dot <= 0) return false;
  if (skill.shape === "cone") return dot >= Math.cos(skill.arcDeg * Math.PI / 360);
  const lateral = Math.abs(dx * h.facing.z - dz * h.facing.x);
  return lateral <= skill.width / 2 && dot * length <= skill.reach;
}
export function eligibleTargets(h, skill, targets) {
  return targets.filter(t => t && t.alive !== false && typeof t.id === "string" &&
    finite(t.x) && finite(t.z) && withinShape(h, skill, t));
}
export function selectTarget(h, skill, targets, preference = "nearest") {
  ensure(["nearest", "lowest_hp"].includes(preference), "targeting-invalid");
  const choices = eligibleTargets(h, skill, targets);
  choices.sort((a, b) => preference === "nearest"
    ? Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z) || a.id.localeCompare(b.id)
    : (a.hp ?? Infinity) - (b.hp ?? Infinity) ||
      Math.hypot(a.x,a.z) - Math.hypot(b.x,b.z) || a.id.localeCompare(b.id));
  return choices[0] ?? null;
}
export function useSkill(h, slot, { now, targets = [], aim = null, preference = "nearest" } = {}) {
  ensure(Number.isFinite(now) && now >= 0, "time-invalid");
  ensure(Number.isInteger(slot) && slot >= 0 && slot < 4, "slot-invalid");
  const skill = getSkill(h.activeSkills[slot]);
  ensure(skill && h.learnedSkills.includes(skill.id), "skill-unavailable");
  if ((h.cooldowns[skill.id] ?? 0) > now) return { ok: false, reason: "cooldown" };
  if (h.vitals[skill.resource] < skill.cost) return { ok: false, reason: "resource" };
  // Explicit drag aim changes the facing. A released skill may still miss.
  if (aim !== null) setFacing(h, aim);
  h.vitals[skill.resource] -= skill.cost;
  h.cooldowns[skill.id] = now + skill.cooldownMs;
  const hits = eligibleTargets(h, skill, targets);
  const focused = selectTarget(h, skill, hits, preference);
  return { ok: true, skillId: skill.id, shape: skill.shape, hits: hits.map(t=>t.id),
    focusedId: focused?.id ?? null, missed: hits.length === 0,
    mobile: skill.mobile, motionUnaffected: true, dash: skill.dash === true };
}
export function basicAttack(h, { now, targets = [], maxReach = 2.7 } = {}) {
  ensure(Number.isFinite(now) && now >= 0, "time-invalid");
  const withinCombo = h.combo.lastAt !== null && now >= h.combo.lastAt && now - h.combo.lastAt <= 900;
  h.combo.step = withinCombo ? (h.combo.step % 4) + 1 : 1;
  h.combo.lastAt = now;
  const fakeSkill = { shape: "cone", reach: maxReach, arcDeg: 90 };
  const focused = selectTarget(h, fakeSkill, targets);
  const step = h.combo.step;
  return { ok: true, step, damageMultiplier: step === 4 ? 1.6 : 1,
    focusedId: focused?.id ?? null, missed: !focused, motionUnaffected: true,
    inAir: h.motion.airborne, weapon: h.equipment.mainHand?.type ?? "unarmed" };
}
export function snapshot(h) { return structuredClone(h); }
