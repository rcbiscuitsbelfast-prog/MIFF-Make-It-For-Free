#!/usr/bin/env -S node --no-warnings

function linearToDb(linear:number){
  if(linear<=0.0001) return -80;
  return 20*Math.log10(Math.max(0.0001, Math.min(1, linear)));
}

class MixerSim {
  musicDb:number = 0;
  sfxDb:number = 0;
  setMusicVolume(linear:number){ this.musicDb = linearToDb(linear); }
  setSfxVolume(linear:number){ this.sfxDb = linearToDb(linear); }
  dump(){ return { MusicVolume: this.musicDb, SFXVolume: this.sfxDb }; }
}

type Cmd = { op:string; channel?:'music'|'sfx'; value?:number };

function run(cmds:Cmd[]){
  const m = new MixerSim();
  const log:string[]=[];
  for(const c of cmds){
    if(c.op==='setVolume'){
      if(c.channel==='music'){ m.setMusicVolume(Number(c.value)); log.push(`MUSIC ${c.value}`); }
      else if(c.channel==='sfx'){ m.setSfxVolume(Number(c.value)); log.push(`SFX ${c.value}`); }
    } else if(c.op==='dumpMixerState'){ /* no-op */ }
  }
  return { log, mixer: m.dump() };
}

function main(){
  const cmdPath = process.argv[2];
  if(!cmdPath){ console.error('Usage: cliHarness.ts <commands.json>'); process.exit(1);} 
  const cmds:Cmd[] = JSON.parse(require('fs').readFileSync(cmdPath,'utf-8'));
  const out = run(cmds);
  console.log(JSON.stringify(out,null,2));
}

if(require.main===module) main();