#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { EntityLinkerManager, ExternalRefMaps, LinkInput } from './Manager';

type Cmd =
  | { op: 'resolveRefs' }
  | { op: 'dumpLinks' };

function main(){
  const sample = process.argv[2] || 'EntityLinkerPure/sample_links.json';
  const extern = process.argv[3] || 'EntityLinkerPure/sample_extern.json';
  const cmds = process.argv[4] || '';
  const mgr = new EntityLinkerManager();
  if (fs.existsSync(extern)){
    const m = JSON.parse(fs.readFileSync(path.resolve(extern), 'utf-8')) as ExternalRefMaps;
    mgr.inject(m);
  }
  const input:LinkInput = fs.existsSync(sample)
    ? JSON.parse(fs.readFileSync(path.resolve(sample),'utf-8')) as LinkInput
    : {};
  const commands:Cmd[] = cmds? JSON.parse(fs.readFileSync(path.resolve(cmds),'utf-8')) : [{op:'resolveRefs'}];
  const outputs:any[] = [];
  for(const c of commands){
    if(c.op==='resolveRefs') outputs.push(mgr.resolve(input));
    else if(c.op==='dumpLinks') outputs.push(mgr.dumpLinks());
  }
  console.log(JSON.stringify({outputs}, null, 2));
}
if(require.main===module) main();