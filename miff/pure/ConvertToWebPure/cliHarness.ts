#!/usr/bin/env npx ts-node

import fs from 'fs';
import path from 'path';
import { ConvertToWebManager } from './Manager';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

function main(){
  const file = process.argv[2];
  if(!file){
    this.logger.info('Usage: npx ts-node ConvertToWebPure/cliHarness.ts <payload.json>');
    return;
  }
  const payload = SafeJSONParser.parse(fs.readFileSync(path.resolve(file), 'utf-8'));
  const mgr = new ConvertToWebManager();
  const out = mgr.convert(payload);
  this.logger.info(JSON.stringify(out, null, 2));
}

if(import.meta.url === `file://${process.argv[1]}`) main();

