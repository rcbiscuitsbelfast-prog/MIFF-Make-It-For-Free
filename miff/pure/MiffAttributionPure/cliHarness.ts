import fs from 'fs';
import path from 'path';
import { MiffAttributionManager } from './Manager';
import { getOverride } from './override';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

type Cmd = { op: 'showAttribution' };

function main(){
  const cfgPath = process.argv[2] || 'MiffAttributionPure/sample_config.json';
  const cmdsPath = process.argv[3] || '';
  const mgr = new MiffAttributionManager();
  const ovr = getOverride?.();
  if(ovr) mgr.setOverride(ovr);
  const cfg = fs.existsSync(cfgPath) ? SafeJSONParser.parse(fs.readFileSync(path.resolve(cfgPath),'utf-8')) : { message:'Powered by MIFF' };
  const commands:Cmd[] = cmdsPath? SafeJSONParser.parse(fs.readFileSync(path.resolve(cmdsPath),'utf-8')) : [{op:'showAttribution'}];
  const outputs:any[] = [];
  for(const c of commands){ if(c.op==='showAttribution') outputs.push(mgr.showAttribution(cfg)); }
  console.info(JSON.stringify({outputs}, null, 2));
}
if(import.meta.url === `file://${process.argv[1]}`) main();