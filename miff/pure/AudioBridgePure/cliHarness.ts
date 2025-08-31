#!/usr/bin/env ts-node

import { process as processAudio, AudioCmd } from './index';
import * as fs from 'fs';

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: ts-node cliHarness.ts <input-file>');
  process.exit(1);
}

try {
  const input = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  const commands: AudioCmd[] = input.commands;
  
  const result = processAudio(commands);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}