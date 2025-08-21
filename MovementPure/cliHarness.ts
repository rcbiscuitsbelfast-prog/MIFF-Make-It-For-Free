#!/usr/bin/env -S node --no-warnings
import fs from 'fs';

type Pattern = 'idle'|'patrol'|'follow'|'flee';

type NPC = { id:string; pattern:Pattern; waypoints?:[number,number][]; followTargetId?:string };

type Cmd = { op:string; [k:string]:any };

function run(cmds:Cmd[]){
  const npcs: Record<string,NPC> = {};
  const log:string[]=[];
  for(const c of cmds){
    if(c.op==='assignMovement'){
      const npc = npcs[c.id] || {id:c.id, pattern:'idle' as Pattern};
      npc.pattern = c.pattern;
      if(c.waypoints) npc.waypoints = c.waypoints;
      npcs[c.id] = npc;
      log.push(`ASSIGN ${c.id} ${c.pattern}`);
    } else if(c.op==='setFollowTarget'){
      const npc = npcs[c.id] || {id:c.id, pattern:'follow' as Pattern};
      npc.pattern = 'follow'; npc.followTargetId = c.targetId; npcs[c.id]=npc;
      log.push(`FOLLOW ${c.id} -> ${c.targetId}`);
    } else if(c.op==='simulateTick'){
      log.push(`TICK ${c.delta}`);
    }
  }
  return { log, npcs };
}

function main(){
  const path = process.argv[2]; if(!path){ console.error('Usage: cliHarness.ts <commands.json>'); process.exit(1);} 
  const cmds:Cmd[] = JSON.parse(fs.readFileSync(path,'utf-8'));
  const out = run(cmds);
  console.log(JSON.stringify(out,null,2));
}
if(require.main===module) main();