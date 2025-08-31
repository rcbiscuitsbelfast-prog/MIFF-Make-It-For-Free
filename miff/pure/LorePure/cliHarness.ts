#!/usr/bin/env -S node --no-warnings
import fs from 'fs';

type LoreEntry = { id:string; title:string; body:string; tags?:string[]; unlockHint?:string };

class Codex {
  unlocked = new Set<string>();
}

class LoreWorld {
  db = new Map<string, LoreEntry>();
  codex = new Codex();
  load(path:string){ const txt=fs.readFileSync(path,'utf-8'); const j=JSON.parse(txt) as {entries:LoreEntry[]}; this.db.clear(); for(const e of j.entries) this.db.set(e.id,e); }
  unlock(id:string){ if(this.db.has(id)) this.codex.unlocked.add(id); }
  isUnlocked(id:string){ return this.codex.unlocked.has(id); }
  list(){ return Array.from(this.codex.unlocked).map(id=>this.db.get(id)); }
  dump(){ return { unlocked: Array.from(this.codex.unlocked), entries: Array.from(this.db.values()) }; }
}

type Cmd = { op:string; [k:string]:any };

function run(cmds:Cmd[]){
  const w = new LoreWorld();
  const log:string[]=[];
  for(const c of cmds){
    if(c.op==='load'){ w.load(c.path); log.push(`LOAD ${c.path}`); }
    else if(c.op==='unlock'){ w.unlock(c.id); log.push(`UNLOCK ${c.id}`); }
    else if(c.op==='list'){ const arr=w.list(); log.push(`LIST ${arr.map(e=>e?.id).join(',')}`); }
    else if(c.op==='dump'){ /* no-op */ }
  }
  return { log, codex: w.dump() };
}

function main(){
  const cmdPath = process.argv[2];
  if(!cmdPath){ console.error('Usage: cliHarness.ts <commands.json>'); process.exit(1); }
  const cmds:Cmd[] = JSON.parse(fs.readFileSync(cmdPath,'utf-8'));
  const out = run(cmds);
  console.log(JSON.stringify(out,null,2));
}

if(require.main===module) main();