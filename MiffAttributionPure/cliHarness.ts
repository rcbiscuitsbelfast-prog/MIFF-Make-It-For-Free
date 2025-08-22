#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { MiffAttributionManager } from './Manager';
import { getOverride } from './override';

type Cmd = { op: 'showAttribution' };

function main(){
  const cfgPath = process.argv[2] || 'MiffAttributionPure/sample_config.json';
  const cmdsPath = process.argv[3] || '';
  const mgr = new MiffAttributionManager();
  const ovr = getOverride?.();
  if(ovr) mgr.setOverride(ovr);
  const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(path.resolve(cfgPath),'utf-8')) : { message:'Powered by MIFF' };
  const commands:Cmd[] = cmdsPath? JSON.parse(fs.readFileSync(path.resolve(cmdsPath),'utf-8')) : [{op:'showAttribution'}];
  const outputs:any[] = [];
  for(const c of commands){ if(c.op==='showAttribution') outputs.push(mgr.showAttribution(cfg)); }
  console.log(JSON.stringify({outputs}, null, 2));
}
if(require.main===module) main();