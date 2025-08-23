#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { CombatManager } from './CombatManager';

type Cmd =
  | { op: 'list' }
  | { op: 'create'; id: string; hp: number; atk: number; def: number }
  | { op: 'simulate'; attackerId: string; defenderId: string }
  | { op: 'dump'; id: string };

function main(){
  const sample = process.argv[2] || 'CombatCorePure/sample_combat.json';
  const commands = process.argv[3] || '';
  const mgr = new CombatManager();
  if (fs.existsSync(sample)){
    const j = JSON.parse(fs.readFileSync(path.resolve(sample), 'utf-8')) as {entities:{id:string;hp:number;atk:number;def:number}[]};
    for(const e of j.entities) mgr.create(e.id, e.hp, e.atk, e.def);
  }
  const cmds:Cmd[] = commands? JSON.parse(fs.readFileSync(path.resolve(commands), 'utf-8')) : [{op:'list'} as Cmd];
  const outputs:any[] = [];
  for(const c of cmds){
    if(c.op==='list') outputs.push({op:'list', ids:mgr.list()});
    else if(c.op==='create') outputs.push(mgr.create(c.id, c.hp, c.atk, c.def));
    else if(c.op==='simulate') outputs.push(mgr.simulate(c.attackerId, c.defenderId));
    else if(c.op==='dump') { const e=mgr.get(c.id); outputs.push(e? {op:'dump', id:e.id, hp:e.hp} : {op:'dump', id:c.id, missing:true}); }
  }
  console.log(JSON.stringify({outputs}, null, 2));
}
if(require.main===module) main();