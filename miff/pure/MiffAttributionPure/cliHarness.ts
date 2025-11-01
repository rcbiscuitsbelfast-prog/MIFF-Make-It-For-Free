import fs from 'fs';
import path from 'path';
import { MiffAttributionManager } from './Manager.js';
import { getOverride } from './override';
import { InputSanitizer } from '../shared/security/InputSanitizer.ts';

type Cmd = { op: 'showAttribution' };

function main(){
  // SECURITY: Validate all inputs
  const cfgPath = InputSanitizer.getSafeArg(2, {
    type: 'path',
    required: false,
    pattern: /\.json$/i,
    maxLength: 500
  }, 'MiffAttributionPure/sample_config.json');
  
  const cmdsPath = InputSanitizer.getSafeArg(3, {
    type: 'path',
    required: false,
    pattern: /\.json$/i,
    maxLength: 500
  }, '');
  const mgr = new MiffAttributionManager();
  const ovr = getOverride?.();
  if(ovr) mgr.setOverride(ovr);
  const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(path.resolve(cfgPath),'utf-8')) : { message:'Powered by MIFF' };
  const commands:Cmd[] = cmdsPath? JSON.parse(fs.readFileSync(path.resolve(cmdsPath),'utf-8')) : [{op:'showAttribution'}];
  const outputs:any[] = [];
  for(const c of commands){ if(c.op==='showAttribution') outputs.push(mgr.showAttribution(cfg)); }
  console.log(JSON.stringify({outputs}, null, 2));
}
if(import.meta.url === `file://${process.argv[1!]}`) main();