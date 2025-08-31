#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { PathfindingManager } from './PathfindingManager';

type Cmd =
  | { op: 'list' }
  | { op: 'create'; grid: {width:number;height:number;blocks:{x:number;y:number}[]} }
  | { op: 'simulate'; start: {x:number;y:number}; goal: {x:number;y:number} }
  | { op: 'dump' };

function main(){
  const sample = process.argv[2] || 'PathfindingPure/sample_grid.json';
  const commands = process.argv[3] || '';
  const mgr = new PathfindingManager();
  if (fs.existsSync(sample)){
    const j = JSON.parse(fs.readFileSync(path.resolve(sample),'utf-8')) as {grid:{width:number;height:number;blocks:{x:number;y:number}[]}};
    mgr.load(j.grid);
  }
  const cmds:Cmd[] = commands? JSON.parse(fs.readFileSync(path.resolve(commands),'utf-8')) : [{op:'list'} as Cmd];
  const outputs:any[] = [];
  for(const c of cmds){
    if(c.op==='list') outputs.push({op:'list', grid:mgr.list()});
    else if(c.op==='create') { mgr.load(c.grid); outputs.push({op:'create', grid:mgr.list()}); }
    else if(c.op==='simulate') outputs.push({op:'simulate', path:mgr.findPath(c.start, c.goal)});
    else if(c.op==='dump') outputs.push({op:'dump', grid:mgr.dump()});
  }
  console.log(JSON.stringify({outputs}, null, 2));
}
if(require.main===module) main();