#!/usr/bin/env -S node --no-warnings
import fs from 'fs';

type Cmd = { op:string; [k:string]:any };

class OverlaySim { log:string[]=[]; fadeIn(d:number){ this.log.push(`FADE_IN ${d}`);} fadeOut(d:number){ this.log.push(`FADE_OUT ${d}`);} tint(c:string,d:number){ this.log.push(`TINT ${c} ${d}`);} flash(c:string,d:number){ this.log.push(`FLASH ${c} ${d}`);} }
class LightingSim { preset:string='day'; setPreset(p:string){ this.preset=p; } dump(){ return {preset:this.preset}; } }
class TimedSim { events:{name:string,delay:number,repeat:number}[]=[]; schedule(n:string,d:number,r:number){ this.events.push({name:n,delay:d,repeat:r}); } }
class ZoneSim { zones:Record<string,{enter:string,exit:string}> = {}; define(id:string,enter:string,exit:string){ this.zones[id]={enter,exit}; } enter(id:string){ /* log only */ } }

function run(cmds:Cmd[]){
  const overlay=new OverlaySim(); const lighting=new LightingSim(); const timed=new TimedSim(); const zone=new ZoneSim();
  const log:string[]=[];
  for(const c of cmds){
    if(c.op==='triggerOverlay'){
      if(c.type==='fadeIn') overlay.fadeIn(c.duration); else if(c.type==='fadeOut') overlay.fadeOut(c.duration); else if(c.type==='tint') overlay.tint(c.color,c.duration); else if(c.type==='flash') overlay.flash(c.color,c.duration);
    } else if(c.op==='setLightingPreset'){
      lighting.setPreset(c.preset); log.push(`LIGHTING ${c.preset}`);
    } else if(c.op==='scheduleEvent'){
      timed.schedule(c.name,c.delay,c.repeat||0); log.push(`SCHEDULE ${c.name} ${c.delay} ${c.repeat||0}`);
    } else if(c.op==='defineZoneTrigger'){
      zone.define(c.id,c.onEnter,c.onExit); log.push(`ZONE ${c.id}`);
    }
  }
  return { log, overlay: overlay.log, lighting: lighting.dump(), timed: timed.events, zones: zone.zones };
}

function main(){
  const path = process.argv[2]; if(!path){ console.error('Usage: cliHarness.ts <commands.json>'); process.exit(1);} 
  const cmds:Cmd[] = JSON.parse(fs.readFileSync(path,'utf-8'));
  const out = run(cmds);
  console.log(JSON.stringify(out,null,2));
}
if(require.main===module) main();