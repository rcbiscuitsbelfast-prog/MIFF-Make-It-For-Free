#!/usr/bin/env tsx
import * as fs from 'fs';
import { PermissionsManager, PermissionName } from './Manager';

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 2) {
    console.error('Usage: tsx cliHarness.ts <query|request> <permissionName>');
    process.exit(1);
  }
  const op = argv[0];
  const name = argv[1] as PermissionName;
  const mgr = new PermissionsManager();
  const res = op === 'request' ? await mgr.request(name) : await mgr.query(name);
  console.log(JSON.stringify({ op: `perm:${op}`, status: 'ok', result: res }, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });

