import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeHunter } from "../src/core/hunter.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("HIGHFLY first-entry screen and classless creator are connected",()=>{
  const html=read("index.html");
  for(const id of ["landing","creator","continue-btn","new-btn","create-btn","hunter-name",
    "hunter-presentation","hunter-visual","game","game-canvas","joystick","menu-btn"])
    assert.match(html,new RegExp('id="'+id+'"'));
  assert.doesNotMatch(html,/id="(class|specialization|talents)"/i);
});
test("browser entry loads and persists the canonical universal Hunter",()=>{
  const code=read("src/app/main.js");
  assert.match(code,/makeHunter\(/);
  assert.match(code,/loadHunter\(/);
  assert.match(code,/saveHunter\(/);
  assert.match(code,/bootWorld\(/);
  const h=makeHunter({id:"main",name:"Hunter"});
  assert.equal(h.classId,undefined);
  assert.equal(h.role,"hunter");
});
test("3D app renders a KayKit GLB and has touch camera + movement controls",()=>{
  const world=read("src/app/world.js"),ui=read("src/app/main.js");
  assert.match(world,/GLTFLoader/);
  assert.match(world,/loadAsync\(/);
  assert.match(world,/dragCamera\(/);
  assert.match(world,/setStick\(/);
  assert.match(ui,/pointerdown/);
  assert.match(ui,/pointermove/);
});
test("public deployment fetches pinned and hash-verified approved KayKit GLBs",()=>{
  const wf=read(".github/workflows/pages.yml");
  assert.match(wf,/672074b73ba276876a19e8816ecdc5241817ab47/);
  assert.match(wf,/git hash-object/);
  assert.match(wf,/actions\/deploy-pages/);
  assert.doesNotMatch(wf,/Quaternius|CraftPix/i);
});
test("temporary world clearly identified; no WOC licensed media silently imported",()=>{
  const html=read("index.html");
  assert.match(html,/provisional/i);
  assert.match(html,/ClaudeCraft 0\.44\.7/);
  const doc=read("docs/F3-ENTRY-WORLD.md");
  assert.match(doc,/no es todavía el mapa original/i);
});
