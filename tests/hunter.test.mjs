import test from "node:test";
import assert from "node:assert/strict";
import {
  makeHunter, setVisual, equip, train, grantXp, setLoadout,
  setFacing, setMotion, useSkill, basicAttack, selectTarget, MAX_LEVEL
} from "../src/core/hunter.mjs";
import { SKILLS } from "../src/core/skills.mjs";
const hunter = () => makeHunter({ id: "tester", name: "Cazador" });

test("no class, class skills or talent tree fields", () => {
  const h = hunter();
  assert.equal(h.role, "hunter");
  assert.equal(h.classId, undefined);
  assert.equal(h.specialization, undefined);
  assert.equal(h.talents, undefined);
  assert.equal(h.activeSkills.length, 4);
});
test("appearance is cosmetic and preserves learned skills, weapons, level", () => {
  const h = hunter();
  equip(h,"mainHand",{id:"sword_1",type:"sword",twoHanded:false});
  grantXp(h,150);
  const prior = [...h.activeSkills];
  setVisual(h,{presentation:"femenino",visual:"kaykit_mage"});
  assert.equal(h.presentation,"femenino");
  assert.equal(h.visual,"kaykit_mage");
  assert.deepEqual(h.activeSkills,prior);
  assert.equal(h.equipment.mainHand.type,"sword");
  assert.equal(h.level,2);
});
test("all weapon types are universal; a two-handed weapon clears offhand", () => {
  const h = hunter();
  equip(h,"offHand",{id:"dagger_1",type:"dagger",twoHanded:false});
  equip(h,"mainHand",{id:"bow_1",type:"bow",twoHanded:true});
  assert.equal(h.equipment.offHand,null);
  assert.throws(()=>equip(h,"offHand",{id:"d2",type:"dagger",twoHanded:false}),/two-handed/);
});
test("training recalculates vitals and caps level at 20", () => {
  const h = hunter(), start = h.vitals.maxHp;
  train(h,"vit",3);
  assert.equal(h.vitals.maxHp,start+24);
  grantXp(h,1000000);
  assert.equal(h.level,MAX_LEVEL);
  assert.equal(h.stats.vit,8);
});
test("four skills learned, no category or visual checks", () => {
  const h = hunter();
  setVisual(h,{presentation:"femenino",visual:"kaykit_rogue"});
  setLoadout(h,["nova_ring","surge_dash","arc_bolt","blade_arc"]);
  assert.equal(h.activeSkills[0],"nova_ring");
  assert.throws(()=>setLoadout(h,["arc_bolt","arc_bolt","blade_arc","nova_ring"]),/distinct/);
});
test("line aiming respects direction and can actually miss", () => {
  const h = hunter();
  const behind = { id:"behind",x:0,z:-4,hp:5 };
  const ahead = { id:"ahead",x:0,z:5,hp:30 };
  assert.equal(selectTarget(h,SKILLS.arc_bolt,[behind,ahead]).id,"ahead");
  let cast=useSkill(h,0,{now:100,targets:[behind]});
  assert.equal(cast.ok,true);
  assert.equal(cast.missed,true);
  assert.equal(cast.focusedId,null);
  assert.equal(h.vitals.mana,60+5*5-18);
  assert.equal(useSkill(h,0,{now:101}).reason,"cooldown");
});
test("aimed skill executes while moving and airborne without motion lock", () => {
  const h=hunter();
  setMotion(h,{moving:true,airborne:true});
  const cast=useSkill(h,0,{now:100,aim:{x:1,z:0},targets:[{id:"wolf",x:3,z:0,hp:20}]});
  assert.equal(cast.focusedId,"wolf");
  assert.equal(cast.motionUnaffected,true);
  assert.equal(h.motion.moving,true);
  assert.equal(h.motion.airborne,true);
});
test("nearest versus lowest HP yields different focus", () => {
  const h=hunter(), targets=[{id:"near",x:0,z:2,hp:90},{id:"weak",x:0,z:5,hp:5}];
  assert.equal(selectTarget(h,SKILLS.arc_bolt,targets,"nearest").id,"near");
  assert.equal(selectTarget(h,SKILLS.arc_bolt,targets,"lowest_hp").id,"weak");
});
test("basic attack has 1-2-3-4 cycle; fourth is stronger; no forced halt", () => {
  const h=hunter(); setMotion(h,{moving:true,airborne:true});
  const strikes=[100,300,500,700].map(now=>basicAttack(h,{now,targets:[]}));
  assert.deepEqual(strikes.map(x=>x.step),[1,2,3,4]);
  assert.equal(strikes[3].damageMultiplier,1.6);
  assert.equal(strikes[3].inAir,true);
  assert.equal(strikes[3].motionUnaffected,true);
  assert.equal(basicAttack(h,{now:2000}).step,1);
});
test("invalid data cannot bypass basic guards", () => {
  const h=hunter();
  assert.throws(()=>setFacing(h,{x:0,z:0}),/aim-zero/);
  assert.throws(()=>train(h,"rage",1),/attribute-invalid/);
  assert.throws(()=>equip(h,"mainHand",{id:"wand",type:"invalid",twoHanded:false}),/weapon-type-invalid/);
});
