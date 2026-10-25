import test from "node:test";
import assert from "node:assert/strict";
import { makeHunter, learn, setLoadout } from "../src/core/hunter.mjs";
import { collectEnemies, castIntent, attackIntent, assertClassless } from "../src/bridge/world0447.mjs";
import { createFuryInput, cameraRelativeStick } from "../src/core/fury-input.mjs";
import { validateHunterSave, saveHunter, loadHunter, deleteHunter, memoryStorage } from "../src/core/hunter-save.mjs";

const mk=()=>{const h=makeHunter({id:"save-slot-1",name:"Hunter"});
  for(const id of ["arc_bolt","blade_arc","surge_dash","nova_ring"])learn(h,id);
  setLoadout(h,["arc_bolt","blade_arc","surge_dash","nova_ring"]);
  return h;};
function world(){
  const player={id:1,kind:"player",pos:{x:100,z:200},hp:200,dead:false};
  const wolf={id:2,kind:"mob",pos:{x:100,z:205},hp:80,dead:false};
  const behind={id:3,kind:"mob",pos:{x:100,z:197},hp:12,dead:false};
  const npc={id:4,kind:"npc",pos:{x:100,z:202},hp:100,dead:false};
  const corpse={id:5,kind:"mob",pos:{x:100,z:204},hp:0,dead:true};
  return {player,playerId:1,entities:new Map([player,wolf,behind,npc,corpse].map(e=>[e.id,e]))};
}
test("WOC entity coordinates become Hunter-relative X/Z targets",()=>{
  const targets=collectEnemies(world());
  assert.deepEqual(targets.map(t=>t.worldId),[2,3]);
  assert.equal(targets[0].z,5);
  assert.equal(targets[0].worldZ,205);
});
test("skill computes a hit intent WITHOUT changing the WOC entity HP",()=>{
  const w=world(), h=mk();
  const p=castIntent({world:w,hunter:h,slot:0,now:100});
  assert.equal(p.applied,false);
  assert.equal(p.requiresAuthority,true);
  assert.deepEqual(p.hits.map(t=>t.worldId),[2]);
  assert.equal(p.focusedId,"2");
  assert.equal(w.entities.get(2).hp,80);
});
test("directional line can miss an enemy behind player",()=>{
  const w=world(),h=mk();
  w.entities.delete(2);
  const p=castIntent({hunter:h,world:w,slot:0,now:100});
  assert.equal(p.missed,true);assert.deepEqual(p.hits,[]);
});
test("normal attack produces an intent rather than real damage",()=>{
  const w=world(),h=mk();w.entities.get(2).pos.z=202;
  const p=attackIntent({hunter:h,world:w,now:100});
  assert.equal(p.hits[0].worldId,2);
  assert.equal(p.applied,false);
  assert.equal(w.entities.get(2).hp,80);
});
test("class sneaking into an imported player fails",()=>{
  const h=mk();assert.equal(assertClassless(h),true);
  h.specId="warrior";assert.throws(()=>assertClassless(h),/legacy-class-leak/);
});
test("camera-relative movement rotates by camera yaw, never changes camera",()=>{
  assert(Math.abs(cameraRelativeStick(0,1,0).z-1)<1e-8);
  assert(Math.abs(cameraRelativeStick(0,1,Math.PI/2).x-1)<1e-8);
  assert.deepEqual(cameraRelativeStick(0,0),{x:0,z:0,magnitude:0});
});
test("cancel gesture does NOT cast or spend resource; release does",()=>{
  const h=mk(),f=createFuryInput(h);
  const initial=h.vitals.mana;
  f.beginAim(0);f.dragAim({x:1,z:0});f.cancelAim();
  assert.equal(h.vitals.mana,initial);
  assert.equal(f.releaseAim({now:100}).reason,"aim-inactive");
  f.beginAim(0);f.dragAim({x:1,z:0});
  const p=f.releaseAim({now:100,targets:[{id:"wolf",x:4,z:0,hp:25}]});
  assert.equal(p.focusedId,"wolf");
  assert.equal(h.vitals.mana,initial-18);
});
test("moving airborne hunter attacks and double-jumps then resets on land",()=>{
  const h=mk(),f=createFuryInput(h);
  f.stick(0,1);
  assert.equal(f.jump().kind,"jump");
  assert.equal(f.jump("back").flip,"back");
  assert.equal(f.jump().reason,"jump-limit");
  assert.equal(f.attack({now:100}).motionUnaffected,true);
  assert.equal(h.motion.moving,true);
  assert.equal(h.motion.airborne,true);
  f.land();assert.equal(f.jump().kind,"jump");
});
test("dash requests collision-resolved movement rather than teleportation",()=>{
  const f=createFuryInput(mk());
  const p=f.dash(200);
  assert.equal(p.needsCollision,true);assert.equal(p.durationMs,180);
  assert.equal(f.dash(201).reason,"dash-cooldown");
  f.endDash();
});
test("Hunter save/load preserves appearance, skills and classless identity",()=>{
  const h=mk(),store=memoryStorage();h.presentation="femenino";h.visual="kaykit_mage";
  assert.equal(validateHunterSave(h),true);saveHunter(store,h);
  const retrieved=loadHunter(store,h.id);
  assert.equal(retrieved.presentation,"femenino");
  assert.equal(retrieved.classId,undefined);
  retrieved.name="changed";
  assert.equal(loadHunter(store,h.id).name,"Hunter");
  deleteHunter(store,h.id);assert.equal(loadHunter(store,h.id),null);
});
test("save rejects malformed or class-based objects",()=>{
  const h=mk(),store=memoryStorage();
  h.classId="warrior";assert.throws(()=>saveHunter(store,h),/save-invalid/);
  store.setItem("highfly:hunter:v1:save-slot-1","{badjson");
  assert.equal(loadHunter(store,h.id),null);
  assert.equal(loadHunter(store,"no-such-slot"),null);
});
