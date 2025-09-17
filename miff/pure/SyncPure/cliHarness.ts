#!/usr/bin/env tsx

import { addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';

interface SyncOperation {
  op: 'get-sync' | 'increase-sync' | 'reset-sync' | 'set-thresholds' | 'get-thresholds' | 'simulate' | 'dump';
  spiritId?: string;
  amount?: number;
  thresholds?: number[];
  data?: Record<string, unknown>;
  exportFormat?: string;
}

interface SpiritSyncData {
  spiritId: string;
  syncLevel: number;
  thresholds: number[];
}

class SyncManager {
  private spiritSync = new Map<string, number>();
  private spiritThresholds = new Map<string, number[]>();
  private changeEvents: Array<{ spiritId: string; newLevel: number; timestamp: number }> = [];

  getSyncLevel(spiritId: string): number {
    return this.spiritSync.get(spiritId) || 0;
  }

  increaseSync(spiritId: string, amount: number): boolean {
    if (!spiritId || amount <= 0) return false;
    
    const current = this.getSyncLevel(spiritId);
    const next = current + amount;
    this.spiritSync.set(spiritId, next);
    
    this.changeEvents.push({
      spiritId,
      newLevel: next,
      timestamp: Date.now()
    });
    
    return true;
  }

  resetSync(spiritId: string): boolean {
    if (!spiritId) return false;
    
    this.spiritSync.set(spiritId, 0);
    this.changeEvents.push({
      spiritId,
      newLevel: 0,
      timestamp: Date.now()
    });
    
    return true;
  }

  setThresholds(spiritId: string, thresholds: number[]): boolean {
    if (!spiritId) return false;
    
    const sortedThresholds = [...thresholds].sort((a, b) => a - b);
    this.spiritThresholds.set(spiritId, sortedThresholds);
    return true;
  }

  getThresholds(spiritId: string): number[] {
    return this.spiritThresholds.get(spiritId) || [];
  }

  getAllSpirits(): SpiritSyncData[] {
    const spirits: SpiritSyncData[] = [];
    
    // Get all spirits from sync map
    for (const [spiritId, syncLevel] of this.spiritSync) {
      spirits.push({
        spiritId,
        syncLevel,
        thresholds: this.getThresholds(spiritId)
      });
    }
    
    // Get spirits that only have thresholds
    for (const [spiritId, thresholds] of this.spiritThresholds) {
      if (!this.spiritSync.has(spiritId)) {
        spirits.push({
          spiritId,
          syncLevel: 0,
          thresholds
        });
      }
    }
    
    return spirits;
  }

  getChangeEvents(): typeof this.changeEvents {
    return [...this.changeEvents];
  }

  clearEvents(): void {
    this.changeEvents = [];
  }
}

function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0];
    let operation: SyncOperation;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as SyncOperation;
    } else {
      // Parse subcommand
      switch (first) {
        case 'get-sync':
          if (!argv[1]) throw new Error('get-sync requires spiritId');
          operation = { op: 'get-sync', spiritId: argv[1] };
          break;
        case 'increase-sync':
          if (!argv[1] || !argv[2]) throw new Error('increase-sync requires spiritId and amount');
          operation = { op: 'increase-sync', spiritId: argv[1], amount: parseInt(argv[2]) };
          break;
        case 'reset-sync':
          if (!argv[1]) throw new Error('reset-sync requires spiritId');
          operation = { op: 'reset-sync', spiritId: argv[1] };
          break;
        case 'set-thresholds':
          if (!argv[1] || !argv[2]) throw new Error('set-thresholds requires spiritId and thresholds array');
          const thresholds = JSON.parse(argv[2]);
          operation = { op: 'set-thresholds', spiritId: argv[1], thresholds };
          break;
        case 'get-thresholds':
          if (!argv[1]) throw new Error('get-thresholds requires spiritId');
          operation = { op: 'get-thresholds', spiritId: argv[1] };
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

    const syncManager = new SyncManager();
    let result: any;

    switch (operation.op) {
      case 'get-sync':
        const syncLevel = syncManager.getSyncLevel(operation.spiritId!);
        result = {
          spiritId: operation.spiritId,
          syncLevel,
          thresholds: syncManager.getThresholds(operation.spiritId!)
        };
        break;

      case 'increase-sync':
        const success = syncManager.increaseSync(operation.spiritId!, operation.amount!);
        const newLevel = syncManager.getSyncLevel(operation.spiritId!);
        result = {
          spiritId: operation.spiritId,
          success,
          newLevel,
          changeEvents: syncManager.getChangeEvents()
        };
        break;

      case 'reset-sync':
        const resetSuccess = syncManager.resetSync(operation.spiritId!);
        const resetLevel = syncManager.getSyncLevel(operation.spiritId!);
        result = {
          spiritId: operation.spiritId,
          success: resetSuccess,
          newLevel: resetLevel,
          changeEvents: syncManager.getChangeEvents()
        };
        break;

      case 'set-thresholds':
        const thresholdSuccess = syncManager.setThresholds(operation.spiritId!, operation.thresholds!);
        result = {
          spiritId: operation.spiritId,
          success: thresholdSuccess,
          thresholds: syncManager.getThresholds(operation.spiritId!)
        };
        break;

      case 'get-thresholds':
        const thresholds = syncManager.getThresholds(operation.spiritId!);
        result = {
          spiritId: operation.spiritId,
          thresholds
        };
        break;

      case 'simulate':
        // Simulate spirit taming progression
        syncManager.setThresholds('emberfox', [10, 25, 50, 100]);
        syncManager.setThresholds('glimmerbat', [15, 30, 60, 120]);
        
        syncManager.increaseSync('emberfox', 5);
        syncManager.increaseSync('emberfox', 8);
        syncManager.increaseSync('glimmerbat', 12);
        syncManager.increaseSync('emberfox', 15);
        
        result = {
          spirits: syncManager.getAllSpirits(),
          changeEvents: syncManager.getChangeEvents(),
          summary: {
            totalSpirits: syncManager.getAllSpirits().length,
            totalEvents: syncManager.getChangeEvents().length,
            maxSyncLevel: Math.max(...syncManager.getAllSpirits().map(s => s.syncLevel))
          }
        };
        break;

      case 'dump':
        result = {
          operations: ['get-sync', 'increase-sync', 'reset-sync', 'set-thresholds', 'get-thresholds', 'simulate', 'dump'],
          description: 'SyncPure - Spirit synchronization and threshold management',
          features: [
            'Spirit sync level tracking',
            'Threshold-based progression',
            'Change event logging',
            'Spirit taming simulation'
          ],
          sampleSpirits: ['emberfox', 'glimmerbat', 'shadowwolf', 'crystalwing']
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
      'SyncPure Export',
      'Spirit synchronization and threshold management data'
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