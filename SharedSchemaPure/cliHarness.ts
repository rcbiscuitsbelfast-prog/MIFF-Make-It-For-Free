#!/usr/bin/env -S node --no-warnings
import { SharedSchemaManager } from './Manager';

type Cmd = { op: 'dumpTypes' } | { op: 'list' } | { op: 'dump' };

function main(){
  const mgr = new SharedSchemaManager();
  const cmdArg = process.argv[2] || 'dumpTypes';
  const cmd:Cmd = cmdArg==='dumpTypes' ? {op:'dumpTypes'} : cmdArg==='list' ? {op:'list'} : {op:'dump'};
  const outputs:any[]=[];
  if(cmd.op==='dumpTypes') outputs.push(mgr.dumpTypes());
  else if(cmd.op==='list') outputs.push({op:'list', status:'ok', issues:[], resolvedRefs:{}, types:mgr.listTypes()});
  else if(cmd.op==='dump') outputs.push({op:'dump', status:'ok', issues:[], resolvedRefs:{}, version:mgr.version()});
  console.log(JSON.stringify({outputs},null,2));
}
if(require.main===module) main();