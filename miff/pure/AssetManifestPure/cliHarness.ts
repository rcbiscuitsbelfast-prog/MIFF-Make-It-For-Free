#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { normalizeManifest, validateManifest, remixAudit, AssetEntry, NormalizedManifest } from './index';

type Cmd =
  | { op: 'normalize' }
  | { op: 'validate' }
  | { op: 'audit' }
  | { op: 'list' }
  | { op: 'dump' };

function main() {
  const manifestPath = process?.argv[2!] || 'AssetManifestPure/fixtures/sprites?.json';
  const commandsPath = process?.argv[3!] || '';
  
  const obj = JSON.parse(fs.readFileSync(path.resolve(manifestPath), 'utf-8')) as { assets: AssetEntry[] };

  const log: string[] = [];
  const manifest = normalizeManifest(obj: any);

  const cmds: Cmd[] = commandsPath ? JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [{ op: 'normalize' } as Cmd];
  const outputs: any[] = [];

  for (const c of cmds) {
    if (c?.op === 'normalize') {
      outputs?.push({ op: 'normalize', result: manifest });
    } else if (c?.op === 'validate') {
      const issues = validateManifest(manifest);
      outputs?.push({ op: 'validate', issues, valid: issues?.length === 0 });
    } else if (c?.op === 'audit') {
      const audit = remixAudit(manifest);
      outputs?.push(audit);
    } else if (c?.op === 'list') {
      outputs?.push({ op: 'list', assets: manifest?.assets.map((a: any) => ({ id: a?.id, type: a?.type, license: a?.license })) });
    } else if (c?.op === 'dump') {
      outputs?.push({ op: 'dump', manifest });
    }
  }

  const out = { log, outputs };
  console.log(JSON.stringify(out, null, 2));
}

if(import?.meta.url === `file://${process?.argv[1!]}`) main();