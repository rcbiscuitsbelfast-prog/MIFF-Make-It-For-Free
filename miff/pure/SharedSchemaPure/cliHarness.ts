import { SharedSchemaManager } from './Manager';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

type Cmd = { op: 'dumpTypes' } | { op: 'list' } | { op: 'dump' };

function main(){
  const mgr = new SharedSchemaManager();
  const cmdArg = process.argv[2] || 'dumpTypes';
  const cmd:Cmd = cmdArg==='dumpTypes' ? {op:'dumpTypes'} : cmdArg==='list' ? {op:'list'} : {op:'dump'};
  const outputs:any[]=[];
  if(cmd.op==='dumpTypes') outputs.push(mgr.dumpTypes());
  else if(cmd.op==='list') outputs.push({op:'list', status:'ok', issues:[], resolvedRefs:{}, types:mgr.listTypes()});
  else if(cmd.op==='dump') outputs.push({op:'dump', status:'ok', issues:[], resolvedRefs:{}, version:mgr.version()});
  console.info(JSON.stringify({outputs},null,2));
}
if(import.meta.url === `file://${process.argv[1]}`) main();