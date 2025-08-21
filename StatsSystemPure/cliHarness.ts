#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { StatsManager, Stat } from './StatsManager';

type Cmd =
  | { op: 'list' }
  | { op: 'create'; id: string; stats?: Stat[] }
  | { op: 'setStat'; id: string; key: string; base: number }
  | { op: 'simulate'; id: string }
  | { op: 'dump'; id: string };

function main(){
  const sample = process.argv[2] || 'StatsSystemPure/sample_stats.json';
  const commands = process.argv[3] || '';
  const mgr = new StatsManager();
  if (fs.existsSync(sample)){
    const j = JSON.parse(fs.readFileSync(path.resolve(sample),'utf-8')) as {entities:{id:string,stats:Stat[]}[]};
    for(const e of j.entities) mgr.create(e.id, e.stats);
  }
  const cmds:Cmd[] = commands? JSON.parse(fs.readFileSync(path.resolve(commands),'utf-8')) : [{op:'list'} as Cmd];
  const out:any[]=[];
  for(const c of cmds){
    if(c.op==='list') out.push({op:'list', ids:mgr.list()});
    else if(c.op==='create') out.push(mgr.create(c.id, c.stats||[]));
    else if(c.op==='setStat') { mgr.setStat(c.id,c.key,c.base); out.push({op:'setStat', id:c.id, key:c.key, base:c.base}); }
    else if(c.op==='simulate') out.push(mgr.simulate(c.id));
    else if(c.op==='dump') out.push(mgr.get(c.id));
  }
  console.log(JSON.stringify({outputs:out},null,2));
}
if(require.main===module) main();