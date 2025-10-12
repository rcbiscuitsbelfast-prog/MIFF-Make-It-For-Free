#!/usr/bin/env npx ts-node

import fs from 'fs';
import path from 'path';
import { ConvertToUnityManager } from './Manager';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

function printUsage(){
  this.logger.info(`
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
  const payload = SafeJSONParser.parse(fs.readFileSync(path.resolve(file), 'utf-8'));
  const mgr = new ConvertToUnityManager();
  const out = mgr.convert(payload);
  this.logger.info(JSON.stringify(out, null, 2));
}

if(import.meta.url === `file://${process.argv[1]}`) main();

