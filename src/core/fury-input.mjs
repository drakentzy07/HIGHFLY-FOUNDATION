// HIGHFLY-authored FURY input intents. Physics and animation integration still pending.
import { basicAttack, setFacing, setMotion, useSkill } from "./hunter.mjs";
const valid=n=>typeof n==="number"&&Number.isFinite(n);
const norm=d=>{
  if(!valid(d?.x)||!valid(d?.z))throw Error("direction-invalid");
  const length=Math.hypot(d.x,d.z);
  if(!length)throw Error("direction-zero");
  return {x:d.x/length,z:d.z/length};
};
export function cameraRelativeStick(x,y,yaw=0){
  if(![x,y,yaw].every(valid))throw Error("stick-invalid");
  const length=Math.hypot(x,y), power=Math.min(1,length);
  if(length<0.08)return {x:0,z:0,magnitude:0};
  const sx=x/length, sy=y/length;
  return {x:(sx*Math.cos(yaw)+sy*Math.sin(yaw))*power,
    z:(sy*Math.cos(yaw)-sx*Math.sin(yaw))*power,magnitude:power};
}
export function createFuryInput(hunter){
  let aiming=null, jumpCount=0, nextDash=0;
  return {
    stick(x,y,yaw=0){
      const v=cameraRelativeStick(x,y,yaw);
      setMotion(hunter,{moving:v.magnitude>0});
      if(v.magnitude>0)setFacing(hunter,{x:v.x,z:v.z});
      return {kind:"move-intent",...v,needsPhysics:true};
    },
    beginAim(slot,dir=hunter.facing){
      if(!Number.isInteger(slot)||slot<0||slot>=4)throw Error("slot-invalid");
      aiming={slot,dir:norm(dir)};
      return {kind:"aim-preview",slot,dir:aiming.dir};
    },
    dragAim(dir){
      if(!aiming)throw Error("aim-inactive");
      aiming.dir=norm(dir);
      return {kind:"aim-preview",slot:aiming.slot,dir:aiming.dir};
    },
    cancelAim(){
      const canceled=aiming!==null;
      aiming=null;
      return {kind:"aim-cancel",canceled};
    },
    releaseAim({now,targets=[],preference="nearest"}={}){
      if(!aiming)return {ok:false,reason:"aim-inactive"};
      const {slot,dir}=aiming;
      aiming=null;
      return useSkill(hunter,slot,{now,aim:dir,targets,preference});
    },
    tapSkill(slot,{now,targets=[],preference="nearest"}={}){
      if(aiming)return {ok:false,reason:"aim-in-progress"};
      return useSkill(hunter,slot,{now,targets,preference});
    },
    attack({now,targets=[]}={}){
      return basicAttack(hunter,{now,targets});
    },
    jump(direction="forward"){
      if(!["forward","back","left","right"].includes(direction))throw Error("jump-dir-invalid");
      if(jumpCount===2)return {ok:false,reason:"jump-limit"};
      jumpCount++;
      setMotion(hunter,{airborne:true});
      return {ok:true,kind:jumpCount===2?"double-jump":"jump",
        flip:jumpCount===2?direction:null,needsPhysics:true,needsAnimation:true};
    },
    land(){jumpCount=0;setMotion(hunter,{airborne:false});return {kind:"land"};},
    dash(now,dir=hunter.facing){
      if(!valid(now)||now<0)throw Error("time-invalid");
      if(now<nextDash)return {ok:false,reason:"dash-cooldown"};
      nextDash=now+600;
      setMotion(hunter,{dashing:true});
      return {ok:true,kind:"dash-intent",dir:norm(dir),distance:4,
        durationMs:180,needsCollision:true,needsPhysics:true};
    },
    endDash(){setMotion(hunter,{dashing:false});return {kind:"dash-ended"};},
    get state(){return {aiming:!!aiming,jumps:jumpCount,nextDash};}
  };
}
