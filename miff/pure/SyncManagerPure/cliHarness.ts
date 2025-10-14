#!/usr/bin/env tsx

import { SyncManagerPure, SnapshotPacket } from './index';
import { addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

interface SyncManagerOperation {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  op: 'diff' | 'snapshot' | 'simulate' | 'dump';
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
  exportFormat?: string;
}

interface PlayerStateSnapshot {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  identity: { playerId: string };
  position: { x: number; y: number };
  velocity: { x: number; y: number };
}

function main(...args: any[]) {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0];
    let operation: SyncManagerOperation;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = SafeJSONParser.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as SyncManagerOperation;
    } else {
      // Parse subcommand
      switch (first) {
        case 'diff':
          if (!argv[1] || !argv[2]) {
            throw new Error('diff requires two snapshot files');
          }
          const prev = SafeJSONParser.parse(fs.readFileSync(argv[1], 'utf-8')) as SnapshotPacket;
          const next = SafeJSONParser.parse(fs.readFileSync(argv[2], 'utf-8')) as SnapshotPacket;
          operation = { op: 'diff', data: { prev, next } };
          break;
        case 'snapshot':
          if (!argv[1]) {
            throw new Error('snapshot requires a tick number');
          }
          const tick = parseInt(argv[1]);
          const statesFile = argv[2] || 'sample_states.json';
          const states = SafeJSONParser.parse(fs.readFileSync(statesFile, 'utf-8')) as PlayerStateSnapshot[];
          operation = { op: 'snapshot', data: { tick, states } };
          break;
        case 'simulate':
          operation = { op: 'simulate' };
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
      case 'diff':
        const { prev, next } = operation.data as { prev: SnapshotPacket; next: SnapshotPacket };
        result = SyncManagerPure.diff(prev, next);
        break;

      case 'snapshot':
        const { tick, states } = operation.data as { tick: number; states: PlayerStateSnapshot[] };
        result = SyncManagerPure.snapshotFromStates(tick, states);
        break;

      case 'simulate':
        // Generate sample data for simulation
        const sampleStates: PlayerStateSnapshot[] = [
          {
            identity: { playerId: 'player1' },
            position: { x: 100, y: 200 },
            velocity: { x: 5, y: 0 }
          },
          {
            identity: { playerId: 'player2' },
            position: { x: 150, y: 250 },
            velocity: { x: -3, y: 2 }
          }
        ];
        
        const snapshot1 = SyncManagerPure.snapshotFromStates(1, sampleStates);
        
        // Move players for second snapshot
        const movedStates = sampleStates.map(state => ({
          ...state,
          position: {
            x: state.position.x + state.velocity.x,
            y: state.position.y + state.velocity.y
          }
        }));
        const snapshot2 = SyncManagerPure.snapshotFromStates(2, movedStates);
        
        const diff = SyncManagerPure.diff(snapshot1, snapshot2);
        
        result = {
          snapshot1,
          snapshot2,
          diff,
          summary: {
            totalPlayers: snapshot1.players.length,
            changedPlayers: diff.players.length,
            unchangedPlayers: snapshot1.players.length - diff.players.length
          }
        };
        break;

      case 'dump':
        result = {
          operations: ['diff', 'snapshot', 'simulate', 'dump'],
          description: 'SyncManagerPure - Network synchronization and delta compression',
          features: [
            'Snapshot packet generation',
            'Delta compression between snapshots',
            'Player state synchronization',
            'Network optimization'
          ]
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
      'SyncManagerPure Export',
      'Network synchronization and delta compression data'
    );

    // Output in JSON envelope format
    console.info(JSON.stringify({
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