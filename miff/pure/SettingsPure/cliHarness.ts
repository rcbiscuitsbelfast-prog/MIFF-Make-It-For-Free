#!/usr/bin/env tsx
import * as fs from 'fs';

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

type Cmd = { op:'get'|'set'|'dump'|'reset'|'validate'|'export'; key?:string; value?:any; format?:'json'|'markdown'|'html' };

function run(initPath:string, cmds:Cmd[]){
  const w = new SettingsWorld(initPath);
  const log:string[]=[];
  for(const c of cmds){
    if(c.op==='get'){ log.push(`GET ${c.key} -> ${w.get(c.key)}`); }
    else if(c.op==='set'){ w.set(c.key,c.value); log.push(`SET ${c.key} = ${c.value}`); }
    else if(c.op==='dump'){ /* no-op */ }
    else if(c.op==='reset'){ w.reset(); log.push('RESET'); }
    else if(c.op==='validate'){
      const issues:string[]=[];
      const s=w.dump() as any;
      if(typeof s.musicVolume!=='number') issues.push('musicVolume');
      if(typeof s.sfxVolume!=='number') issues.push('sfxVolume');
      if(typeof s.language!=='string') issues.push('language');
      if(typeof s.showSubtitles!=='boolean') issues.push('showSubtitles');
      log.push(`VALIDATE ${issues.length? 'error '+issues.join('|'):'ok'}`);
    }
    else if(c.op==='export'){
      const s = JSON.stringify(w.dump(), null, 2);
      if(c.format==='markdown') log.push('EXPORT markdown '+s.length+'b');
      else if(c.format==='html') log.push('EXPORT html '+s.length+'b');
      else log.push('EXPORT json');
    }
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

if(import.meta.url === `file://${process.argv[1]}`) main();