#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { LootTablesManager, LootTable } from './Manager';

type Cmd =
  | { op: 'list' }
  | { op: 'create'; table: LootTable }
  | { op: 'simulate'; tableId: string; count: number }
  | { op: 'dump'; id: string };

function main(){
  const sample = process.argv[2] || 'LootTablesPure/sample_tables.json';
  const commands = process.argv[3] || '';
  const mgr = new LootTablesManager();
  if (fs.existsSync(sample)){
    const j = JSON.parse(fs.readFileSync(path.resolve(sample),'utf-8')) as {tables:LootTable[]};
    for(const t of j.tables) mgr.create(t);
  }
  const cmds:Cmd[] = commands? JSON.parse(fs.readFileSync(path.resolve(commands),'utf-8')) : [{op:'list'} as Cmd];
  const outputs:any[] = [];
  for(const c of cmds){
    if(c.op==='list') outputs.push({ op:'list', status:'ok', result:mgr.list(), issues:[] });
    else if(c.op==='create') outputs.push(mgr.create(c.table));
    else if(c.op==='simulate') outputs.push(mgr.rollLoot(c.tableId, c.count));
    else if(c.op==='dump') outputs.push(mgr.dump(c.id));
  }
  console.log(JSON.stringify({outputs}, null, 2));
}
if(require.main===module) main();