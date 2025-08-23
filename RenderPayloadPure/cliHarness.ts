#!/usr/bin/env npx ts-node

import fs from 'fs';
import path from 'path';
import { RenderPayloadBuilder, createSampleFrame } from './Manager';
import { BridgeSchemaValidator, RenderPayload } from '../BridgeSchemaPure/schema';

function printUsage(){
  console.log(`
RenderPayloadPure CLI - Build unified render payload frames

Usage:
  npx ts-node RenderPayloadPure/cliHarness.ts <command> [args]

Commands:
  build-sample                 Build and print a sample frame payload
  validate <payload.json>      Validate an existing payload file

Examples:
  npx ts-node RenderPayloadPure/cliHarness.ts build-sample
  npx ts-node RenderPayloadPure/cliHarness.ts validate BridgeSchemaPure/sample_render.json
`);
}

function main(){
  const args = process.argv.slice(2);
  const cmd = args[0];
  if(!cmd || cmd==='help' || cmd==='-h' || cmd==='--help'){
    printUsage();
    return;
  }

  if(cmd==='build-sample'){
    const payload = createSampleFrame();
    const out = { op: 'buildSample', status: 'ok', issues: [], payload };
    console.log(JSON.stringify(out, null, 2));
    return;
  }

  if(cmd==='validate'){
    if(args.length<2){
      console.error('Error: payload file required');
      printUsage();
      return;
    }
    const file = path.resolve(args[1]);
    const j:RenderPayload = JSON.parse(fs.readFileSync(file, 'utf-8'));
    const issues = BridgeSchemaValidator.validateRenderPayload(j);
    const status = issues.length===0? 'ok':'error';
    const out = { op: 'validate', status, issues };
    console.log(JSON.stringify(out, null, 2));
    return;
  }

  console.error('Error: Unknown command');
  printUsage();
}

if(require.main===module) main();

