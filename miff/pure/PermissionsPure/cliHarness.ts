#!/usr/bin/env tsx
import * as fs from 'fs';
import { PermissionsManager, PermissionName } from './Manager';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 2) {
    this.logger.error('Usage: tsx cliHarness.ts <query|request> <permissionName>');
    process.exit(1);
  }
  const op = argv[0];
  const name = argv[1] as PermissionName;
  const mgr = new PermissionsManager();
  const res = op === 'request' ? await mgr.request(name) : await mgr.query(name);
  this.logger.info(JSON.stringify({ op: `perm:${op}`, status: 'ok', result: res }, null, 2));
}

main().catch(err => { this.logger.error(err); process.exit(1); });

