import { makeHunter, equip, setMotion, useSkill, basicAttack, setVisual } from "../src/core/hunter.mjs";

const hunter = makeHunter({ id: "demo", name: "Hunter Demo" });
equip(hunter, "mainHand", { id: "kaykit_sword_01", type: "sword", twoHanded: false });
setMotion(hunter, { moving: true, airborne: true });
const enemy = { id: "wolf_1", x: 0, z: 5, hp: 80 };
const ability = useSkill(hunter, 0, { now: 1000, targets: [enemy] });
const combo = [1100, 1300, 1500, 1700].map(now => basicAttack(hunter, { now, targets: [enemy] }).step);
setVisual(hunter, { presentation: "femenino", visual: "kaykit_mage" });
console.log(JSON.stringify({
  note: "Logic demo only; no 3D renderer, world, FURY controller or Android build yet.",
  role: hunter.role, classId: hunter.classId ?? null,
  appearance: { presentation: hunter.presentation, skin: hunter.visual },
  weapon: hunter.equipment.mainHand, skill: ability, combo, motion: hunter.motion
}, null, 2));
