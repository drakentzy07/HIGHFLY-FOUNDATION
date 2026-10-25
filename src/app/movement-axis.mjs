// Screen-space to world-space movement. WOC/FURY camera faces +Z at yaw 0
// with camera positioned behind (-Z); its on-screen right points toward -X.
// Keep this PURE and tested instead of flipping joystick visuals.
export function stickToWorld({x,y,yaw=0}){
  if(![x,y,yaw].every(Number.isFinite)) throw new Error("stick-invalid");
  const forward=-y, right=x;
  const length=Math.hypot(forward,right),magnitude=Math.min(1,length);
  if(length<=0.06)return {x:0,z:0,magnitude:0};
  const f=forward/length,r=right/length;
  return {
    x:(-r*Math.cos(yaw)+f*Math.sin(yaw))*magnitude,
    z:(f*Math.cos(yaw)+r*Math.sin(yaw))*magnitude,
    magnitude
  };
}
