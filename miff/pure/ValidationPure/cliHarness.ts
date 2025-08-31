#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { ValidationManager, ValidationConfig, ValidationInput } from './Manager';

type Cmd = { op: 'validateAll' } | { op: 'reportIssues' };

function main(){
  const sample = process.argv[2] || 'ValidationPure/sample_input.json';
  const configPath = process.argv[3] || '';
  const cmdsPath = process.argv[4] || '';
  const mgr = new ValidationManager();
  if (configPath && fs.existsSync(configPath)){
    const cfg = JSON.parse(fs.readFileSync(path.resolve(configPath),'utf-8')) as ValidationConfig;
    mgr.configure(cfg);
  }
  const input:ValidationInput = fs.existsSync(sample)
    ? JSON.parse(fs.readFileSync(path.resolve(sample),'utf-8')) as ValidationInput
    : {};
  const commands:Cmd[] = cmdsPath? JSON.parse(fs.readFileSync(path.resolve(cmdsPath),'utf-8')) : [{op:'validateAll'}];
  const outputs:any[] = [];
  for(const c of commands){
    if(c.op==='validateAll') outputs.push(mgr.validateAll(input));
    else if(c.op==='reportIssues') outputs.push(mgr.reportIssues());
  }
  console.log(JSON.stringify({outputs}, null, 2));
}
if(require.main===module) main();