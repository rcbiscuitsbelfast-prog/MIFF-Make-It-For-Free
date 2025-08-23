#!/usr/bin/env -S node --no-warnings
import fs from 'fs';

type LevelEntry = { level:number; nextLevelXp:number; statBoosts?:{stat:string,amount:number}[]; unlockedSkills?:string[] };

class XPWorld {
  levels: Record<string,{level:number,xp:number,nextLevelXp:number}> = {};
  curve: Record<number,LevelEntry> = {};
  loadCurve(path:string){ const j = JSON.parse(fs.readFileSync(path,'utf-8')) as {levels:LevelEntry[]}; for(const e of j.levels) this.curve[e.level]=e; }
  addXP(id:string, amt:number){ const s=this.levels[id]||{level:1,xp:0,nextLevelXp:this.curve[1]?.nextLevelXp||100}; s.xp+=amt; this.levels[id]=s; }
  getLevel(id:string){ return (this.levels[id]||{level:1}).level; }
  checkLevelUp(id:string){ const s=this.levels[id]||{level:1,xp:0,nextLevelXp:this.curve[1]?.nextLevelXp||100}; return s.xp>=s.nextLevelXp; }
  applyLevelUp(id:string){ const s=this.levels[id]||{level:1,xp:0,nextLevelXp:this.curve[1]?.nextLevelXp||100}; if(s.xp<s.nextLevelXp) return; s.level+=1; const nxt=this.curve[s.level]?.nextLevelXp||s.nextLevelXp+100; s.xp-=s.nextLevelXp; s.nextLevelXp=nxt; this.levels[id]=s; }
  dump(){ return this.levels; }
}

type Cmd = { op:string; [k:string]:any };

function run(cmds:Cmd[]){ const w=new XPWorld(); const log:string[]=[]; for(const c of cmds){ if(c.op==='loadCurve'){ w.loadCurve(c.path); log.push(`CURVE ${c.path}`);} else if(c.op==='addXP'){ w.addXP(c.id,c.amount); log.push(`XP ${c.id} +${c.amount}`);} else if(c.op==='getLevel'){ log.push(`LV ${c.id} ${w.getLevel(c.id)}`);} else if(c.op==='checkLevelUp'){ log.push(`CHK ${c.id} ${w.checkLevelUp(c.id)}`);} else if(c.op==='applyLevelUp'){ w.applyLevelUp(c.id); log.push(`UP ${c.id}`);} }
  return { log, levels: w.dump() };
}

function main(){ const path=process.argv[2]; if(!path){ console.error('Usage: cliHarness.ts <commands.json>'); process.exit(1);} const cmds:Cmd[] = JSON.parse(fs.readFileSync(path,'utf-8')); const out = run(cmds); console.log(JSON.stringify(out,null,2)); }
if(require.main===module) main();