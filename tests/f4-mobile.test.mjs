import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stickToWorld } from "../src/app/movement-axis.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} expected ${b}`);
test("forward/back remain correct at default camera yaw",()=>{
  close(stickToWorld({x:0,y:-1,yaw:0}).z,1);
  close(stickToWorld({x:0,y:1,yaw:0}).z,-1);
});
test("left/right match visual camera axes, no inversion",()=>{
  close(stickToWorld({x:1,y:0,yaw:0}).x,-1);
  close(stickToWorld({x:-1,y:0,yaw:0}).x,1);
});
test("diagonals preserve both correct signs",()=>{
  const a=stickToWorld({x:1,y:-1,yaw:0});
  assert(a.x<0&&a.z>0);
  close(Math.hypot(a.x,a.z),1);
  const b=stickToWorld({x:-1,y:1,yaw:0});
  assert(b.x>0&&b.z<0);
});
test("rotating camera rotates joystick consistently",()=>{
  const a=stickToWorld({x:0,y:-1,yaw:Math.PI/2});
  close(a.x,1);close(a.z,0);
  const b=stickToWorld({x:1,y:0,yaw:Math.PI/2});
  close(b.x,0);close(b.z,1);
});
test("fullscreen from create and continue user gestures plus manual button",()=>{
  const code=read("src/app/main.js"),html=read("index.html");
  assert.match(code,/requestGameFullscreen\(\);enter\(saved\)/);
  assert.match(code,/requestGameFullscreen\(\);enter\(h\)/);
  assert.match(code,/root.requestFullscreen/);
  assert.match(html,/id="fullscreen-btn"/);
});
test("male grammatical label and fullscreen landscape PWA manifest",()=>{
  const html=read("index.html"),manifest=JSON.parse(read("public/manifest.webmanifest"));
  assert.match(html,/<option value="masculino">Masculino<\/option>/);
  assert.match(html,/<option value="femenino">Femenino<\/option>/);
  assert.equal(manifest.display,"fullscreen");
  assert.equal(manifest.orientation,"landscape");
});
