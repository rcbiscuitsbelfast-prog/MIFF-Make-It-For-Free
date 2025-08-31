#!/usr/bin/env ts-node

import { beats, judge } from './index';
import fs from 'fs';

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: ts-node cliHarness.ts <input-file>');
  process.exit(1);
}

try {
  const input = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  const command = input.command;
  
  let result;
  if (command === 'beats') {
    const beatTimes = beats(input.bpm, input.count);
    result = {
      op: 'rhythm.beats',
      status: 'ok',
      bpm: input.bpm,
      count: input.count,
      beatTimes
    };
  } else if (command === 'judge') {
    const judgment = judge(input.tap, input.beat, input.window);
    result = {
      op: 'rhythm.judge',
      status: 'ok',
      tap: input.tap,
      beat: input.beat,
      window: input.window,
      judgment
    };
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
  
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}