#!/usr/bin/env tsx
import * as fs from 'fs';
import { HapticsManager, HapticRequest } from './Manager';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

async function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) {
    this.logger.error('Usage: tsx cliHarness.ts <requests.json>');
    process.exit(1);
  }
  const file = argv[0];
  const reqs = SafeJSONParser.parse(fs.readFileSync(file, 'utf-8')) as HapticRequest[];
  const manager = new HapticsManager();
  manager.enqueue(reqs);
  const results = await manager.playAll();
  this.logger.info(JSON.stringify({ op: 'haptics:play', status: 'ok', result: results }, null, 2));
}

main().catch(err => { this.logger.error(err); process.exit(1); });

