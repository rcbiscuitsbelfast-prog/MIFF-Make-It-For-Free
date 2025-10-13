#!/usr/bin/env tsx
import * as fs from 'fs';
import { TouchGestureManager, TouchEventLike } from './Manager';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) {
    console.error('Usage: tsx cliHarness.ts <events.json>');
    process.exit(1);
  }
  const events = SafeJSONParser.parse(fs.readFileSync(argv[0], 'utf-8')) as TouchEventLike[];
  const mgr = new TouchGestureManager();
  for (const e of events) mgr.feed(e);
  const gestures = mgr.analyze();
  console.info(JSON.stringify({ op: 'gestures:analyze', status: 'ok', result: gestures }, null, 2));
}

main();

