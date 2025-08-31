#!/usr/bin/env npx ts-node
import fs from 'fs';
import path from 'path';
import { normalizeManifest, validateManifest, remixAudit } from '../../miff/pure/index';

function main(){
  const file = process.argv[2];
  if(!file){
    console.log('Usage: npx ts-node cli/manifest.ts <manifest.json>');
    process.exit(1);
  }
  const raw = fs.readFileSync(path.resolve(file), 'utf-8');
  const data = JSON.parse(raw);
  const norm = normalizeManifest(data);
  const issues = validateManifest(norm);
  const audit = remixAudit(norm);
  console.log(JSON.stringify({ op:'manifest', status: issues.length? 'error':'ok', issues, audit, manifest: norm }, null, 2));
}

if(require.main===module) main();

