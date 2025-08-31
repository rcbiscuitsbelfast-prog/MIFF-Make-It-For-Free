#!/usr/bin/env -S node --no-warnings
import fs from 'fs';

type Settings = { musicVolume:number; sfxVolume:number; language:string; showSubtitles:boolean };

class SettingsWorld {
  settings: Settings;
  defaults: Settings;
  constructor(initPath:string){ const txt=fs.readFileSync(initPath,'utf-8'); const j=JSON.parse(txt) as {settings:Settings}; this.settings={...j.settings}; this.defaults={...j.settings}; }
  get(key:string){ return (this.settings as any)[key]; }
  set(key:string, value:any){
    if(key==='musicVolume'||key==='sfxVolume'){ value=parseFloat(value); }
    else if(key==='showSubtitles'){ value=(value==='true'||value===true); }
    (this.settings as any)[key]=value;
  }
  dump(){ return this.settings; }
  reset(){ this.settings={...this.defaults}; }
}

type Cmd = { op:string; [k:string]:any };

function run(initPath:string, cmds:Cmd[]){
  const w = new SettingsWorld(initPath);
  const log:string[]=[];
  for(const c of cmds){
    if(c.op==='get'){ log.push(`GET ${c.key} -> ${w.get(c.key)}`); }
    else if(c.op==='set'){ w.set(c.key,c.value); log.push(`SET ${c.key} = ${c.value}`); }
    else if(c.op==='dump'){ /* no-op */ }
    else if(c.op==='reset'){ w.reset(); log.push('RESET'); }
  }
  return { log, settings: w.dump() };
}

function main(){
  const initPath = process.argv[2];
  const cmdPath = process.argv[3];
  if(!initPath||!cmdPath){ console.error('Usage: cliHarness.ts <init.json> <commands.json>'); process.exit(1); }
  const cmds:Cmd[] = JSON.parse(fs.readFileSync(cmdPath,'utf-8'));
  const out = run(initPath, cmds);
  console.log(JSON.stringify(out,null,2));
}

if(require.main===module) main();