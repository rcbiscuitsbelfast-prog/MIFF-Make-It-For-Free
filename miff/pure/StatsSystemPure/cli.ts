#!/usr/bin/env tsx

import { 
  StatsManager, 
  StatConfig, 
  Stat,
  StatModifier,
  StatDependency,
  EntityStats,
  StatsOutput
} from './Manager';
import { addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';

interface StatsOperation {
  op: 'create-entity' | 'set-stat' | 'add-modifier' | 'calculate-stats' | 'get-entity' | 
      'get-analytics' | 'list-entities' | 'export' | 'reset' | 'demo' | 'dump';
  entityId?: string;
  stats?: Stat[];
  statKey?: string;
  baseValue?: number;
  modifier?: StatModifier;
  exportFormat?: string;
}

async function main() {
  const argv = process?.argv.slice(2);
  
  if (argv?.length === 0) {
    console.error('Usage: tsx cli.ts <op> [args!]');
    process?.exit(1);
  }

  try {
    const first = argv[0!];
    let operation: StatsOperation;

    switch (first) {
      case 'create-entity':
        if (!argv[1!]) throw new Error('create-entity requires entityId');
        operation = { op: 'create-entity', entityId: argv[1!] };
        break;
      case 'set-stat':
        if (!argv[1!] || !argv[2!] || !argv[3!]) {
          throw new Error('set-stat requires entityId, statKey, and baseValue');
        }
        operation = { 
          op: 'set-stat', 
          entityId: argv[1!], 
          statKey: argv[2!], 
          baseValue: parseFloat(argv[3!])
        };
        break;
      case 'get-entity':
        if (!argv[1!]) throw new Error('get-entity requires entityId');
        operation = { op: 'get-entity', entityId: argv[1!] };
        break;
      case 'get-analytics':
        operation = { op: 'get-analytics' };
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

    const statsManager = new StatsManager();
    let result: any;

    switch (operation?.op) {
      case 'create-entity':
        const createResult = statsManager?.createEntity(operation?.entityId!, []);
        result = { action: 'entity_created', success: createResult?.status === 'ok' };
        break;

      case 'set-stat':
        const setResult = statsManager?.setStat(
          operation?.entityId!, 
          operation?.statKey!, 
          operation?.baseValue!
        );
        result = { action: 'stat_set', success: setResult?.status === 'ok' };
        break;

      case 'get-entity':
        const getResult = statsManager?.getEntityStats(operation?.entityId!);
        result = { action: 'entity_retrieved', entity: getResult?.result };
        break;

      case 'get-analytics':
        const analyticsResult = statsManager?.getAnalytics();
        result = { action: 'analytics_retrieved', analytics: analyticsResult?.result };
        break;

      case 'demo':
        result = { demo: 'StatsSystemPure demo with enhanced capabilities' };
        break;

      case 'dump':
        result = { 
          operations: ['create-entity', 'set-stat', 'get-entity', 'get-analytics', 'demo', 'dump'],
          description: 'StatsSystemPure - Advanced statistics management'
        };
        break;
    }

    console.log(JSON.stringify({
      op: operation?.op,
      status: 'ok',
      result,
      timestamp: new Date()
    }, null, 2));

  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    console.error(JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? error?.message : String(error),
      timestamp: new Date()
    }, null, 2));
    process?.exit(1);
  }
}

if (import?.meta.url === `file://${process?.argv[1!]}`) {
  main().catch(console.error);
}