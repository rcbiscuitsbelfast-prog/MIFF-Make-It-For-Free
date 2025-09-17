#!/usr/bin/env tsx

import { RenderReplaySystem } from './index';
import * as fs from 'fs';
import * as path from 'path';

interface RenderReplayOperation {
  op: 'record' | 'playback' | 'analyze' | 'export' | 'dump';
  sessionId?: string;
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
    const input = JSON.parse(fs.readFileSync(inputFile, 'utf-8')) as RenderReplayOperation;
    
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: expected JSON object');
    }
    
    if (!input.op) {
      throw new Error('Invalid input: missing required field "op"');
    }
    
    const replaySystem = new RenderReplaySystem();
    const config = input.config || {
      frameRate: 60,
      quality: 'high',
      compression: true
    };
    
    let result;
    switch (input.op) {
      case 'record':
        result = replaySystem.startRecording(input.sessionId || 'default', config);
        break;
      case 'playback':
        result = replaySystem.playback(input.sessionId || 'default', config);
        break;
      case 'analyze':
        result = replaySystem.analyze(input.sessionId || 'default', config);
        break;
      case 'export':
        result = replaySystem.export(input.sessionId || 'default', config);
        break;
      case 'dump':
        result = {
          op: 'dump',
          status: 'ok',
          info: {
            sessionId: input.sessionId || 'default',
            config,
            capabilities: ['record', 'playback', 'analyze', 'export']
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