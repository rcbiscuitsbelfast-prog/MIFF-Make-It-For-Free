#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { PhysicsManager, PhysicsWorld, Body } from './Manager';

type Cmd =
  | { op: 'list' }
  | { op: 'create'; body: Body }
  | { op: 'step'; dt: number }
  | { op: 'dump'; id: string };

function main(){
  const sample = process.argv[2] || 'PhysicsSystemPure/sample_world.json';
  const commands = process.argv[3] || '';
  const mgr = new PhysicsManager();
  if (fs.existsSync(sample)){
    const j = JSON.parse(fs.readFileSync(path.resolve(sample), 'utf-8')) as PhysicsWorld;
    mgr.load(j);
  }
  const cmds:Cmd[] = commands? JSON.parse(fs.readFileSync(path.resolve(commands), 'utf-8')) : [{op:'list'} as Cmd];
  const outputs:any[] = [];
  for(const c of cmds){
    if(c.op==='list') outputs.push(mgr.list());
    else if(c.op==='create') outputs.push(mgr.create(c.body));
    else if(c.op==='step') outputs.push(mgr.step(c.dt));
    else if(c.op==='dump') outputs.push(mgr.dump(c.id));
  }
  console.log(JSON.stringify({outputs}, null, 2));
}
if(require.main===module) main();