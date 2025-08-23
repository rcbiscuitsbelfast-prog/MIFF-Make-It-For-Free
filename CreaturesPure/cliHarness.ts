#!/usr/bin/env -S node --no-warnings
import fs from 'fs';

// Minimal in-memory data model to avoid Unity deps
interface Stats { level:number; hp:number; attack:number; defense:number; speed:number }
interface Creature { id:string; nameId:string; speciesId:string; isCaptured:boolean; stats:Stats; moves:string[] }
interface Species { id:string; nameId:string; baseHp:number; baseAttack:number; baseDefense:number; baseSpeed:number; captureRate:number; allowedMoves:string[] }

const rand = (max:number)=>Math.floor(Math.random()*max);

class World {
  creatures: Creature[] = [];
  party: string[] = [];
  species: Record<string, Species> = {};
  createdIds: string[] = [];
  constructor(speciesPath:string){
    const txt = fs.readFileSync(speciesPath,'utf-8');
    const data = JSON.parse(txt) as {species:Species[]};
    for(const s of data.species) this.species[s.id]=s;
  }
  create(speciesId:string, level:number){
    const s = this.species[speciesId];
    const id = Math.random().toString(36).slice(2);
    const c: Creature = { id, nameId:s.nameId, speciesId:s.id, isCaptured:false,
      stats:{level, hp:s.baseHp+level*2, attack:s.baseAttack+level, defense:s.baseDefense+level, speed:s.baseSpeed+level},
      moves:s.allowedMoves };
    this.creatures.push(c);
    this.createdIds.push(id);
    return c;
  }
  resolveId(val:string){ const m = /^\$(\d+)$/.exec(val||''); if(m){ const idx=Number(m[1]); return this.createdIds[idx]; } return val; }
  addToParty(id:string){ id=this.resolveId(id); if(!this.party.includes(id) && this.party.length<6){ this.party.push(id); return true;} return false; }
  removeFromParty(id:string){ id=this.resolveId(id); const i=this.party.indexOf(id); if(i>=0){ this.party.splice(i,1); return true;} return false; }
  swap(a:number,b:number){ if(a<0||b<0||a>=this.party.length||b>=this.party.length) return false; [this.party[a],this.party[b]]=[this.party[b],this.party[a]]; return true; }
  encounter(speciesId:string, level:number){ const c=this.create(speciesId, level); return c; }
  attemptCapture(id:string){ id=this.resolveId(id); const cr=this.creatures.find(x=>x.id===id)!; const s=this.species[cr.speciesId]; const ok = rand(100)<s.captureRate; if(ok){ cr.isCaptured=true; this.addToParty(cr.id);} return ok; }
  dump(){ return { creatures:this.creatures, party:this.party }; }
}

type Cmd = { op:string; [k:string]:any };

function run(speciesPath:string, cmds:Cmd[]){
  const w = new World(speciesPath);
  const log:string[]=[];
  for(const c of cmds){
    if(c.op==='create'){ const cr=w.create(c.speciesId,c.level); log.push(`CREATE ${cr.id} ${cr.speciesId} L${cr.stats.level}`); }
    else if(c.op==='party:add'){ const ok=w.addToParty(c.id); log.push(`PARTY ADD ${w.resolveId(c.id)} -> ${ok}`); }
    else if(c.op==='party:remove'){ const ok=w.removeFromParty(c.id); log.push(`PARTY REMOVE ${w.resolveId(c.id)} -> ${ok}`); }
    else if(c.op==='party:swap'){ const ok=w.swap(c.a,c.b); log.push(`PARTY SWAP ${c.a}<->${c.b} -> ${ok}`); }
    else if(c.op==='encounter:start'){ const cr=w.encounter(c.speciesId,c.level); log.push(`ENCOUNTER ${cr.id} ${cr.speciesId}`); }
    else if(c.op==='encounter:capture'){ const ok=w.attemptCapture(c.id); log.push(`CAPTURE ${w.resolveId(c.id)} -> ${ok}`); }
    else if(c.op==='dump'){ /* no-op */ }
  }
  return { log, state:w.dump() };
}

function main(){
  const speciesPath = process.argv[2];
  const cmdPath = process.argv[3];
  if(!speciesPath||!cmdPath){ console.error('Usage: cliHarness.ts <species.json> <commands.json>'); process.exit(1); }
  const cmds:Cmd[] = JSON.parse(fs.readFileSync(cmdPath,'utf-8'));
  const out = run(speciesPath, cmds);
  console.log(JSON.stringify(out,null,2));
}

if(require.main===module) main();