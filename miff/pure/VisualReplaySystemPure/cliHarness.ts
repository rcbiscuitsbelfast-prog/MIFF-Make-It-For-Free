#!/usr/bin/env ts-node

import { 
  createReplaySession, 
  recordFrame, 
  recordInputEvent, 
  updateReplayOutcome, 
  addCheckpoint, 
  generateReplayResult, 
  exportReplayData 
} from './index';
import * as fs from 'fs';

function createSeededRand(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function main() {
  const [,, cmdOrFile, ...rest] = process.argv;
  const isCommand = ['init', 'teardown', 'replay', 'export'].includes(cmdOrFile || '');
  const args = isCommand ? rest : [cmdOrFile, ...rest];
  const command = isCommand ? (cmdOrFile as 'init'|'teardown'|'replay'|'export') : 'replay';

  const opts: Record<string, any> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a?.startsWith('--')) {
      const k = a.slice(2);
      const v = args[i+1] && !args[i+1].startsWith('--') ? args[++i] : true;
      opts[k] = v;
    } else if (!opts.input) {
      opts.input = a;
    }
  }

  if (opts.seed) {
    (global as any).__VRSP_RAND__ = createSeededRand(String(opts.seed));
    const base = 1700000000000;
    let step = 0;
    (global as any).__VRSP_NOW__ = () => base + (step++ * 17);
  }

  if (command === 'init') {
    process.stdout.write(JSON.stringify({ op: 'init', module: 'VisualReplaySystemPure', status: 'ok', timestamp: Date.now() }));
    return;
  }
  if (command === 'teardown') {
    process.stdout.write(JSON.stringify({ op: 'teardown', module: 'VisualReplaySystemPure', status: 'ok', timestamp: Date.now() }));
    return;
  }

  try {
    const inputFile = opts.input;
    if (!inputFile) {
      console.error('Usage: ts-node cliHarness.ts replay <input-file> [--seed N] [--speed X] [--config path]');
      process.exit(1);
    }

    const input = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
    
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: expected JSON object');
    }
    
    // Allow export-only validation: if exportFormat provided without scenario/config,
    // fall back to reading a standard fixture from this module
    if (!input.scenarioId || !input.config) {
      if (input.exportFormat) {
        const fallback = JSON.parse(fs.readFileSync(require('path').resolve(__dirname, 'fixtures/visual_replay.json'), 'utf-8'));
        Object.assign(input, fallback);
      } else {
        throw new Error('Invalid input: missing required fields "scenarioId" and "config"');
      }
    }
    
    const { scenarioId, config, metadata = {}, frames = [], inputEvents = [], outcome = {} } = input;
    
    // Create replay session
    const session = createReplaySession(scenarioId, config, metadata);
    
    // Record frames if provided
    const recordedFrames = [];
    for (const frameData of frames) {
      const frame = recordFrame(
        session,
        frameData.frameNumber,
        frameData.gameState,
        frameData.inputState,
        frameData.visualHooks,
        frameData.metadata
      );
      recordedFrames.push(frame);
    }
    
    // Record input events if provided
    for (const eventData of inputEvents) {
      recordInputEvent(
        session,
        eventData.frameNumber,
        eventData.type,
        eventData.data
      );
    }
    
    // Update outcome if provided
    if (Object.keys(outcome).length > 0) {
      updateReplayOutcome(session, outcome);
    }
    
    // Add checkpoints if provided
    if (input.checkpoints) {
      for (const checkpointData of input.checkpoints) {
        addCheckpoint(
          session,
          checkpointData.frameNumber,
          checkpointData.description,
          checkpointData.passed,
          checkpointData.metrics
        );
      }
    }
    
    // Generate replay result
    const replayResult = generateReplayResult(session, recordedFrames);
    
    // Output JSON result
    // Emit only JSON on stdout; logs go to stderr
    process.stdout.write(JSON.stringify(replayResult));
    
    // Export in requested format if specified
    if (input.exportFormat) {
      const exported = exportReplayData(replayResult, input.exportFormat);
      if (input.exportFormat === 'csv' || input.exportFormat === 'summary') {
        console.error('\n' + exported);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});