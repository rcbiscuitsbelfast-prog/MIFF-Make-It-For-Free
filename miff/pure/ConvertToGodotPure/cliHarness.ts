#!/usr/bin/env npx ts-node

import fs from 'fs';
import path from 'path';
import { ConvertToGodotManager } from './Manager';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

function main(...args: any[]) {
  const file = process.argv[2];
  if(!file){
    console.info('Usage: npx ts-node ConvertToGodotPure/cliHarness.ts <payload.json>');
    return;
  }
  const payload = SafeJSONParser.parse(fs.readFileSync(path.resolve(file), 'utf-8'));
  const mgr = new ConvertToGodotManager();
  const out = mgr.convert(payload);
  console.info(JSON.stringify(out, null, 2));
}

if(import.meta.url === `file://${process.argv[1]}`) main();

