#!/usr/bin/env tsx

import { GodotBridge } from './Bridge';
import * as fs from 'fs';
import * as path from 'path';

interface GodotBridgeOperation {
  op: 'simulate' | 'render' | 'interop' | 'dump';
  module: string;
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op> <module> [json-file]');
    process.exit(1);
  }

  try {
    let input: GodotBridgeOperation;
    if (argv.length >= 2 && !argv[2]?.endsWith('.json')) {
      input = { op: argv[0] as any, module: argv[1] } as GodotBridgeOperation;
    } else if (argv.length >= 3) {
      const payload = argv[2] && fs.existsSync(argv[2]) ? JSON.parse(fs.readFileSync(argv[2], 'utf-8')) : {};
      input = { op: argv[0] as any, module: argv[1], data: payload } as GodotBridgeOperation;
    } else {
      const inputFile = argv[0];
      input = JSON.parse(fs.readFileSync(inputFile, 'utf-8')) as GodotBridgeOperation;
    }
    
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: expected JSON object');
    }
    
    if (!input.op || !input.module) {
      throw new Error('Invalid input: missing required fields "op" and "module"');
    }
    
    const bridge = new GodotBridge();
    const config = input.config || {
      targetVersion: '4.0',
      useGDScript: true,
      scenePath: '/scenes',
      scriptPath: '/scripts',
      resourcePath: '/resources'
    };
    
    let result;
    switch (input.op) {
      case 'simulate':
        result = bridge.simulate(input.module, input.data || {}, config);
        break;
      case 'render':
        result = bridge.render(input.module, input.data || {}, config);
        break;
      case 'interop':
        result = bridge.interop(input.module, input.data || {}, config);
        break;
      case 'dump':
        result = {
          op: 'dump',
          status: 'ok',
          info: {
            module: input.module,
            config,
            capabilities: ['simulate', 'render', 'interop'],
            engine: 'godot'
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