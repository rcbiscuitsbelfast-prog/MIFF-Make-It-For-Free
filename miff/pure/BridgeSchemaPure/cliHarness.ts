#!/usr/bin/env tsx

import { BridgeSchema } from './index';
import * as fs from 'fs';
import * as path from 'path';

interface BridgeSchemaOperation {
  op: 'validate' | 'generate' | 'convert' | 'dump';
  schema?: Record<string, unknown>;
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error('Usage: tsx cliHarness.ts <input-file>');
    process.exit(1);
  }

  try {
    const input = JSON.parse(fs.readFileSync(inputFile, 'utf-8')) as BridgeSchemaOperation;
    
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: expected JSON object');
    }
    
    if (!input.op) {
      throw new Error('Invalid input: missing required field "op"');
    }
    
    const schema = new BridgeSchema();
    const config = input.config || {
      version: '1.0.0',
      strict: true,
      validateReferences: true
    };
    
    let result;
    switch (input.op) {
      case 'validate':
        result = schema.validate(input.schema || {}, config);
        break;
      case 'generate':
        result = schema.generate(input.data || {}, config);
        break;
      case 'convert':
        result = schema.convert(input.data || {}, config);
        break;
      case 'dump':
        result = {
          op: 'dump',
          status: 'ok',
          info: {
            config,
            capabilities: ['validate', 'generate', 'convert'],
            version: '1.0.0'
          }
        };
        break;
      default:
        throw new Error(`Unknown operation: ${input.op}`);
    }
    
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if(import.meta.url === `file://${process.argv[1]}`) main();