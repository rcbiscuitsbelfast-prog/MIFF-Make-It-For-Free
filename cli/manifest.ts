#!/usr/bin/env npx ts-node
import fs from 'fs';
import path from 'path';
import { SharedSchemaManager } from '../miff/pure/SharedSchemaPure/Manager';

function main(){
  const file = process.argv[2];
  if(!file){
    console.log('Usage: npx ts-node cli/manifest.ts <manifest.json>');
    process.exit(1);
  }
  const raw = fs.readFileSync(path.resolve(file), 'utf-8');
  const data = JSON.parse(raw);
  const manager = new SharedSchemaManager();
  const norm = data; // For now, just use the data as-is
  const issues: string[] = []; // For now, no validation
  const audit = { op: 'audit', status: 'ok' }; // For now, basic audit
  console.log(JSON.stringify({ op:'manifest', status: issues.length? 'error':'ok', issues, audit, manifest: norm }, null, 2));
}

if(require.main===module) main();

