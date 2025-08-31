#!/usr/bin/env ts-node

import { mapInputs, InputEvent, Binding } from './index';
import fs from 'fs';

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: ts-node cliHarness.ts <input-file>');
  process.exit(1);
}

try {
  const input = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  const events: InputEvent[] = input.events;
  const bindings: Binding[] = input.bindings;
  
  const result = mapInputs(events, bindings);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}