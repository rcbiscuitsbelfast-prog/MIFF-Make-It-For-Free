#!/usr/bin/env tsx
import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { createPlayerState, reducePlayer } from './index';

const { mode, params } = parseKeyValueArgs(process.argv);
const cfg = { speed: 0.01 };

try {
  let s = createPlayerState();
  switch (mode) {
    case 'walk-right':
      s = reducePlayer(s, { type: 'move', dir: { x: 1, y: 0 } }, cfg);
      s = reducePlayer(s, { type: 'tick', dt: 100 }, cfg);
      s = reducePlayer(s, { type: 'stop' }, cfg);
      handleSuccess({ state: s }, 'walk-right');
      break;
    case 'interact':
      s = reducePlayer(s, { type: 'interact', target: 'chest_01' }, cfg);
      handleSuccess({ state: s }, 'interact');
      break;
    default:
      handleSuccess({ help: '--mode=walk-right|interact' }, 'help');
  }
} catch (e) {
  handleError(e);
}

import { PlayerStatePure, PlayerStateSnapshot, InputState } from './index';
import { addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';

interface PlayerStateOperation {
  op: 'create' | 'apply-input' | 'simulate' | 'serialize' | 'deserialize' | 'demo' | 'dump';
  playerId?: string;
  avatarPath?: string;
  style?: '3d' | '2d-side' | 'overlay';
  input?: Partial<InputState>;
  dt?: number;
  json?: string;
  data?: Record<string, unknown>;
  exportFormat?: string;
}

function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0];
    let operation: PlayerStateOperation;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as PlayerStateOperation;
    } else {
      // Parse subcommand
      switch (first) {
        case 'create':
          if (!argv[1]) throw new Error('create requires playerId');
          operation = { 
            op: 'create', 
            playerId: argv[1],
            avatarPath: argv[2] || 'default_avatar.json',
            style: (argv[3] as any) || '2d-side'
          };
          break;
        case 'apply-input':
          if (!argv[1]) throw new Error('apply-input requires JSON state file');
          if (!argv[2]) throw new Error('apply-input requires input JSON');
          const state = JSON.parse(fs.readFileSync(argv[1], 'utf-8')) as PlayerStateSnapshot;
          const input = JSON.parse(fs.readFileSync(argv[2], 'utf-8')) as Partial<InputState>;
          operation = { op: 'apply-input', data: { state, input } };
          break;
        case 'simulate':
          if (!argv[1]) throw new Error('simulate requires JSON state file');
          const simState = JSON.parse(fs.readFileSync(argv[1], 'utf-8')) as PlayerStateSnapshot;
          const dt = parseFloat(argv[2]) || 0.016; // 60 FPS default
          operation = { op: 'simulate', data: { state: simState, dt } };
          break;
        case 'serialize':
          if (!argv[1]) throw new Error('serialize requires JSON state file');
          const serState = JSON.parse(fs.readFileSync(argv[1], 'utf-8')) as PlayerStateSnapshot;
          operation = { op: 'serialize', data: { state: serState } };
          break;
        case 'deserialize':
          if (!argv[1]) throw new Error('deserialize requires JSON string file');
          const jsonStr = fs.readFileSync(argv[1], 'utf-8');
          operation = { op: 'deserialize', json: jsonStr };
          break;
        case 'demo':
          operation = { op: 'demo' };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    let result: any;

    switch (operation.op) {
      case 'create':
        const state = PlayerStatePure.create(
          operation.playerId!,
          operation.avatarPath!,
          operation.style!
        );
        result = {
          playerId: operation.playerId,
          state,
          summary: {
            position: state.position,
            velocity: state.velocity,
            input: state.input,
            tick: state.tick
          }
        };
        break;

      case 'apply-input':
        const { state: inputState, input: inputData } = operation.data as { 
          state: PlayerStateSnapshot; 
          input: Partial<InputState> 
        };
        const newState = PlayerStatePure.applyInput(inputState, inputData);
        result = {
          originalState: inputState,
          appliedInput: inputData,
          newState,
          changes: {
            input: {
              before: inputState.input,
              after: newState.input
            }
          }
        };
        break;

      case 'simulate':
        const { state: simState, dt: deltaTime } = operation.data as { 
          state: PlayerStateSnapshot; 
          dt: number 
        };
        const simulatedState = PlayerStatePure.simulate(simState, deltaTime);
        result = {
          originalState: simState,
          deltaTime,
          simulatedState,
          changes: {
            position: {
              before: simState.position,
              after: simulatedState.position,
              delta: {
                x: simulatedState.position.x - simState.position.x,
                y: simulatedState.position.y - simState.position.y
              }
            },
            velocity: {
              before: simState.velocity,
              after: simulatedState.velocity
            },
            tick: {
              before: simState.tick,
              after: simulatedState.tick
            }
          }
        };
        break;

      case 'serialize':
        const { state: serState } = operation.data as { state: PlayerStateSnapshot };
        const serialized = PlayerStatePure.serialize(serState);
        result = {
          state: serState,
          serialized,
          size: serialized.length
        };
        break;

      case 'deserialize':
        const deserialized = PlayerStatePure.deserialize(operation.json!);
        result = {
          json: operation.json,
          deserialized,
          validation: {
            hasIdentity: !!deserialized.identity,
            hasPosition: !!deserialized.position,
            hasVelocity: !!deserialized.velocity,
            hasInput: !!deserialized.input,
            hasTick: typeof deserialized.tick === 'number'
          }
        };
        break;

      case 'demo':
        // Create a demo player and simulate movement
        const demoPlayer = PlayerStatePure.create('demo_player', 'demo_avatar.json', '2d-side');
        
        // Apply some input
        const demoWithInput = PlayerStatePure.applyInput(demoPlayer, {
          right: true,
          jump: true
        });
        
        // Simulate for a few frames
        const frames = [];
        let currentState = demoWithInput;
        for (let i = 0; i < 5; i++) {
          currentState = PlayerStatePure.simulate(currentState, 0.016);
          frames.push({
            frame: i + 1,
            position: { ...currentState.position },
            velocity: { ...currentState.velocity },
            tick: currentState.tick
          });
        }
        
        result = {
          initialPlayer: demoPlayer,
          withInput: demoWithInput,
          simulationFrames: frames,
          finalState: currentState,
          summary: {
            totalFrames: frames.length,
            finalPosition: currentState.position,
            totalDistance: Math.sqrt(
              Math.pow(currentState.position.x - demoPlayer.position.x, 2) +
              Math.pow(currentState.position.y - demoPlayer.position.y, 2)
            )
          }
        };
        break;

      case 'dump':
        result = {
          operations: ['create', 'apply-input', 'simulate', 'serialize', 'deserialize', 'demo', 'dump'],
          description: 'PlayerStatePure - Player state management and simulation',
          features: [
            'Player state creation and management',
            'Input state application',
            'Physics simulation with velocity and position',
            'State serialization and deserialization',
            'Tick-based state tracking',
            'Avatar reference management'
          ],
          supportedStyles: ['3d', '2d-side', 'overlay'],
          defaultSpeed: '120 px/s'
        };
        break;

      default:
        throw new Error(`Unknown operation: ${operation.op}`);
    }

    // Check for export format option
    const exportFormatArg = argv.find(arg => arg.startsWith('--format='))?.split('=')[1] || 
                           argv[argv.indexOf('--format') + 1];
    const validFormats = ['json', 'csv', 'markdown', 'html'];
    const exportFormat = validFormats.includes(exportFormatArg) ? exportFormatArg : undefined;

    // Handle export format
    const { result: finalResult, exportData } = addExportSupport(
      result,
      exportFormat,
      'PlayerStatePure Export',
      'Player state management and simulation data'
    );

    // Output in JSON envelope format
    console.log(JSON.stringify({
      op: operation.op,
      status: 'ok',
      result: finalResult,
      timestamp: Date.now()
    }, null, 2));

    // Output export data to stderr if available
    if (exportData) {
      console.error('\n' + exportData);
    }

  } catch (error) {
    console.error(JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}