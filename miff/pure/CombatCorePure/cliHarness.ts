#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { CombatEngine } from './Manager';
import { InputSanitizer } from '../shared/security/InputSanitizer.js';

type Cmd =
  | { op: 'list' }
  | { op: 'create'; id: string; hp: number; atk: number; def: number }
  | { op: 'simulate'; attackerId: string; defenderId: string }
  | { op: 'dump'; id: string };

function main(){
  // SECURITY: Validate all inputs
  const sample = InputSanitizer.getSafeArg(2, {
    type: 'path',
    required: false,
    pattern: /\.json$/i,
    maxLength: 500
  }, 'CombatCorePure/sample_combat.json');
  
  const commands = InputSanitizer.getSafeArg(3, {
    type: 'path',
    required: false,
    pattern: /\.json$/i,
    maxLength: 500
  }, '');
  
  const mgr = new CombatEngine();
  if (fs.existsSync(sample)){
    const j = JSON.parse(fs.readFileSync(path.resolve(sample), 'utf-8')) as {entities:{id:string;hp:number;atk:number;def:number}[]};
    for(const e of j.entities) mgr.create(e.id, e.hp, e.atk, e.def);
  }
  const cmds:Cmd[] = commands? JSON.parse(fs.readFileSync(path.resolve(commands), 'utf-8')) : [{op:'list'} as Cmd];
  const outputs:any[]=[];
  for(const c of cmds){
    if(c.op==='list'){
      outputs.push({op:'list',entities:mgr.list()});
    }else if(c.op==='create'){
      mgr.create(c.id,c.hp,c.atk,c.def); outputs.push({op:'create',id:c.id});
    }else if(c.op==='simulate'){
      outputs.push(mgr.simulate(c.attackerId,c.defenderId));
    }else if(c.op==='dump'){
      const e= mgr.get(c.id); outputs.push({op:'dump',entity:e||null});
    }
  }
  console.log(JSON.stringify({outputs},null,2));
}
if(import.meta.url===`file://${process.argv[1!]}`) main();
