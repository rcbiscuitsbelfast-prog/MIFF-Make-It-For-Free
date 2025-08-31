#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import { CombatEngine, Combatant, Action } from './engine';

type Cmd = { op:string; [k:string]:any };

function run(cmds:Cmd[]){
  const eng = new CombatEngine();
  const log:string[]=[];
  for(const c of cmds){
    if(c.op==='addCombatant'){
      const ct:Combatant = { id:c.id, name:c.name, team:c.team, stats:{hp:c.hp,maxHp:c.maxHp,atk:c.atk,def:c.def,spd:c.spd} };
      eng.addCombatant(ct); log.push(`ADD ${c.id}`);
    } else if(c.op==='queueAction'){
      const a:Action = { actorId:c.actorId, type:c.type, targetId:c.targetId, itemId:c.itemId } as any;
      eng.enqueue(a); log.push(`ENQ ${c.actorId} ${c.type}`);
    } else if(c.op==='stepTurn'){
      eng.stepTurn(); log.push('STEP');
    } else if(c.op==='dump'){
      /* no-op */
    }
  }
  return { log, state: eng.state };
}

function main(){ const path=process.argv[2]; if(!path){ console.error('Usage: cliHarness.ts <commands.json>'); process.exit(1);} const cmds:Cmd[] = JSON.parse(fs.readFileSync(path,'utf-8')); const out = run(cmds); console.log(JSON.stringify(out,null,2)); }
if(require.main===module) main();