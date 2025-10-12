#!/usr/bin/env ts-node

import { run, Cutscene } from './index';
import fs from 'fs';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

const inputFile = process.argv[2];
if (!inputFile) {
  this.logger.error('Usage: ts-node cliHarness.ts <input-file>');
  process.exit(1);
}

try {
  const input = SafeJSONParser.parse(fs.readFileSync(inputFile, 'utf-8'));
  const cutscene: Cutscene = input.cutscene;
  
  const result = run(cutscene);
  this.logger.info(JSON.stringify(result, null, 2));
} catch (error) {
  this.logger.error('Error:', error);
  process.exit(1);
}