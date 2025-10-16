#!/usr/bin/env ts-node

import { run, Cutscene } from './index';
import fs from 'fs';

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: ts-node cliHarness.ts <input-file>');
  process.exit(1);
}

try {
  const input = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  const cutscene: Cutscene = input.cutscene;
  
  const result = run(cutscene);
  console.log(JSON.stringify(result, null, 2));
} catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
  console.error('Error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
}