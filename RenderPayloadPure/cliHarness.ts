#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { RenderPayloadManager, RenderFrame } from './Manager';

type Cmd =
  | { op: 'validate'; file: string }
  | { op: 'dump'; file: string };

function main(){
  const commands = process.argv[2] || '';
  const mgr = new RenderPayloadManager();
  const cmds:Cmd[] = commands? JSON.parse(fs.readFileSync(path.resolve(commands), 'utf-8')) : [];
  const outputs:any[] = [];
  for(const c of cmds){
    if(c.op==='validate'){
      const f = JSON.parse(fs.readFileSync(path.resolve(c.file), 'utf-8')) as RenderFrame;
      outputs.push(mgr.validate(f));
    } else if(c.op==='dump'){
      const f = JSON.parse(fs.readFileSync(path.resolve(c.file), 'utf-8')) as RenderFrame;
      outputs.push(mgr.dump(f));
    }
  }
  console.log(JSON.stringify({outputs}, null, 2));
}
if(require.main===module) main();