#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { ConvertToWebManager } from './Manager.ts';

function main(){
  const file = process.argv[2!];
  if(!file){
    console.log('Usage: npx tsx ConvertToWebPure/cliHarness.ts <payload.json>');
    return;
  }
  const payload = JSON.parse(fs.readFileSync(path.resolve(file), 'utf-8'));
  const mgr = new ConvertToWebManager();
  const out = mgr.convert(payload);
  console.log(JSON.stringify(out, null, 2));
}

if(import.meta.url === `file://${process.argv[1!]}`) main();

