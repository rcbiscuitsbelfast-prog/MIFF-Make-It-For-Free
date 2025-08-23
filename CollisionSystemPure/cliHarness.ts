#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { CollisionManager, AABB } from './Manager';

type Cmd =
  | { op: 'list' }
  | { op: 'upsert'; box: AABB }
  | { op: 'check' }
  | { op: 'resolve' }
  | { op: 'dump'; id: string };

function main(){
  const sample = process.argv[2] || 'CollisionSystemPure/sample_boxes.json';
  const commands = process.argv[3] || '';
  const mgr = new CollisionManager();
  if (fs.existsSync(sample)){
    const j = JSON.parse(fs.readFileSync(path.resolve(sample), 'utf-8')) as { boxes: AABB[] };
    mgr.load(j.boxes);
  }
  const cmds:Cmd[] = commands? JSON.parse(fs.readFileSync(path.resolve(commands), 'utf-8')) : [{op:'list'} as Cmd];
  const outputs:any[] = [];
  for(const c of cmds){
    if(c.op==='list') outputs.push(mgr.list());
    else if(c.op==='upsert') { mgr.upsert(c.box); outputs.push({ op:'upsert', id:c.box.id }); }
    else if(c.op==='check') outputs.push(mgr.check());
    else if(c.op==='resolve') outputs.push(mgr.resolve());
    else if(c.op==='dump') outputs.push(mgr.dump(c.id));
  }
  console.log(JSON.stringify({outputs}, null, 2));
}
if(require.main===module) main();