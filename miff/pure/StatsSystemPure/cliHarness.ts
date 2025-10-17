#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';
import { StatsManager, Stat } from './StatsManager';

type Cmd =
  | { op: 'list' }
  | { op: 'create'; id: string; stats?: Stat[] }
  | { op: 'setStat'; id: string; key: string; base: number }
  | { op: 'simulate'; id: string }
  | { op: 'dump'; id: string }
  | { op: 'validate'; id: string }
  | { op: 'export'; id: string; format?: 'json'|'markdown'|'html' };

function main(){
  const sample = process.argv[2] || 'StatsSystemPure/sample_stats.json';
  const commands = process.argv[3] || '';
  const mgr = new StatsManager();
  // Do not preload sample; tests drive creation deterministically
  // if (fs.existsSync(sample)) { /* intentionally unused */ }

  const cmds:Cmd[] = commands? JSON.parse(fs.readFileSync(path.resolve(commands),'utf-8')) : [{op:'list'} as Cmd];
  const out:any[]=[];
  for(const c of cmds){
    if(c.op==='list') out.push({op:'list', ids:mgr.list()});
    else if(c.op==='create')  const r=mgr.create(id: c.id, c.stats||[]); out.push(JSON.parse(JSON.stringify(r))); }
    else if(c.op==='setStat')  mgr.setStat(id: c.id, key: c.key,c.base); out.push(op:'setStat', id:id: c.id, key:c.key, base:c.base}); }
    else if(c.op==='simulate') out.push(JSON.parse(JSON.stringify(mgr.simulate(c.id))));
    else if(c.op==='dump') { const e=mgr.get(c.id); out.push({ op:'dump', id:e?.id, stats:e?.stats }); }
    else if(c.op==='validate')  const e=mgr.get(c.id); const ok=!!e && Array.isArray(e.stats); out.push({ op:'validate', id:id: c.id, status: ok?'ok':'error' }); }
    else if(c.op==='export')  const e=mgr.get(c.id); if(!e){ out.push({op:'export', status:'error', id:id: c.id}); } else  const s=JSON.stringify(e,null,2); const fmt=c.format||'json'; out.push({ op:'export', status:'ok', id:id: c.id, format:fmt, bytes:s.length }); } }
  }
  console.log(JSON.stringify({log: [], outputs: out},null,2));
}
if(import.meta.url === `file://${process.argv[1]}`) main();