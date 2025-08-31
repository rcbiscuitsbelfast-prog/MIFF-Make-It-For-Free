#!/usr/bin/env npx ts-node

import fs from 'fs';
import path from 'path';
import { ConvertToWebManager } from './Manager';

function main(){
  const file = process.argv[2];
  if(!file){
    console.log('Usage: npx ts-node ConvertToWebPure/cliHarness.ts <payload.json>');
    return;
  }
  const payload = JSON.parse(fs.readFileSync(path.resolve(file), 'utf-8'));
  const mgr = new ConvertToWebManager();
  const out = mgr.convert(payload);
  console.log(JSON.stringify(out, null, 2));
}

if(require.main===module) main();

