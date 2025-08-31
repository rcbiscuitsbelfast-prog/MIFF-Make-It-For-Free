#!/usr/bin/env -S node --no-warnings
import fs from 'fs';

type Zone = { id:string; name:string; bounds:[number,number,number,number]; tags?:string[] };

type Cmd = { op:string; [k:string]:any };

function run(cmds:Cmd[]){
  const zones: Record<string, Zone> = {};
  let currentMap = '';
  const log:string[]=[];
  for(const c of cmds){
    if(c.op==='loadMap'){ currentMap = c.name; log.push(`LOAD ${c.name}`); }
    else if(c.op==='defineZone'){ const z:Zone={id:c.id,name:c.name,bounds:c.bounds,tags:c.tags||[]}; zones[z.id]=z; log.push(`ZONE ${z.id}`); }
    else if(c.op==='linkTrigger'){ if(zones[c.id]){ log.push(`LINK ${c.id} ${c.onEnter}/${c.onExit}`);} }
  }
  return { log, map: currentMap, zones };
}

function main(){
  const path = process.argv[2]; if(!path){ console.error('Usage: cliHarness.ts <commands.json>'); process.exit(1);} 
  const cmds:Cmd[] = JSON.parse(fs.readFileSync(path,'utf-8'));
  const out = run(cmds);
  console.log(JSON.stringify(out,null,2));
}
if(require.main===module) main();