#!/usr/bin/env npx ts-node

import fs from 'fs';
import path from 'path';
import { ConvertToUnityManager } from './Manager';

function printUsage(){
  console.log(`
ConvertToUnityPure CLI

Usage:
  npx ts-node ConvertToUnityPure/cliHarness.ts <payload.json>
`);
}

function main(){
  const file = process.argv[2];
  if(!file){
    printUsage();
    return;
  }
  const payload = JSON.parse(fs.readFileSync(path.resolve(file), 'utf-8'));
  const mgr = new ConvertToUnityManager();
  const out = mgr.convert(payload);
  console.log(JSON.stringify(out, null, 2));
}

if(require.main===module) main();

