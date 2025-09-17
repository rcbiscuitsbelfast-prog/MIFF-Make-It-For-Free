#!/usr/bin/env tsx

import { RenderPayloadBuilder, createSampleFrame } from './Manager';
import { BridgeSchemaValidator } from '../BridgeSchemaPure/schema';
import * as fs from 'fs';
import * as path from 'path';

interface RenderPayloadOperation {
  op: 'build-sample' | 'validate' | 'build' | 'dump';
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0];
    let operation: RenderPayloadOperation;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as RenderPayloadOperation;
    } else {
      // Parse subcommand
      switch (first) {
        case 'build-sample':
          operation = { op: 'build-sample' };
          break;
        case 'validate':
          if (!argv[1]) throw new Error('validate requires a JSON file');
          const payload = JSON.parse(fs.readFileSync(argv[1], 'utf-8'));
          operation = { op: 'validate', data: payload };
          break;
        case 'build':
          operation = { op: 'build', config: { engine: argv[1] || 'unified' } };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    let result;
    switch (operation.op) {
      case 'build-sample':
        const samplePayload = createSampleFrame();
        result = {
          op: 'buildSample',
          status: 'ok',
          payload: samplePayload
        };
        break;

      case 'validate':
        if (!operation.data) throw new Error('validate requires data');
        const issues = BridgeSchemaValidator.validateRenderPayload(operation.data as any);
        result = {
          op: 'validate',
          status: issues.length === 0 ? 'ok' : 'error',
          issues
        };
        break;

      case 'build':
        const builder = new RenderPayloadBuilder();
        builder.addNode({
          id: 'demo_node',
          name: 'Demo Node',
          position: { x: 100, y: 200, z: 0 },
          props: { demo: true }
        });
        
        const buildResult = builder.build(operation.config || {});
        result = {
          op: 'build',
          status: buildResult.status,
          payload: buildResult.payload,
          issues: buildResult.issues
        };
        break;

      case 'dump':
        result = {
          op: 'dump',
          status: 'ok',
          info: {
            capabilities: ['build-sample', 'validate', 'build'],
            version: '1.0.0',
            schemaVersion: 'v1'
          }
        };
        break;

      default:
        throw new Error(`Unknown operation: ${(operation as any).op}`);
    }

    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    const errorResult = {
      op: 'error',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    };
    console.error(JSON.stringify(errorResult, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();

