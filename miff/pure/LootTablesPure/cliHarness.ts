/**
 * CLI Harness for LootTablesPure
 * 
 * Provides comprehensive CLI interface for loot table management including
 * table creation, loot rolling, statistics, and multi-format export.
 * 
 * @module LootTablesPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { LootTablesManager, LootTable, LootEntry } from './Manager';
import { parseCLIArgs, formatOutput } from '../shared/cliHarnessUtils';

const { mode, args } = parseCLIArgs(process.argv);
const manager = new LootTablesManager();

// Parse additional arguments
const tableId = args.find(arg => arg.startsWith('--table-id='))?.split('=')[1] || 'loot_table_001';
const count = parseInt(args.find(arg => arg.startsWith('--count='))?.split('=')[1] || '1');
const seed = parseInt(args.find(arg => arg.startsWith('--seed='))?.split('=')[1] || '0') || undefined;
const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] as 'json' | 'manifest' | 'summary' | 'rolls' || 'json';
const rarity = args.find(arg => arg.startsWith('--rarity='))?.split('=')[1] || 'common';
const minWeight = parseInt(args.find(arg => arg.startsWith('--min-weight='))?.split('=')[1] || '0');
const maxWeight = parseInt(args.find(arg => arg.startsWith('--max-weight='))?.split('=')[1] || '100');

let output: any;

try {
  switch (mode) {
    case 'create':
      const newTable: LootTable = {
        id: tableId,
        name: args.find(arg => arg.startsWith('--name='))?.split('=')[1] || 'New Loot Table',
        entries: [
          {
            id: 'gold_coin',
            weight: 50,
            rarity: 'common',
            statRolls: [{ key: 'value', min: 1, max: 5 }]
          },
          {
            id: 'health_potion',
            weight: 20,
            rarity: 'common'
          }
        ],
        maxRolls: 3,
        metadata: { description: 'A new loot table' }
      };
      output = manager.createTable(newTable);
      break;

    case 'get':
      output = manager.getTable(tableId);
      break;

    case 'update':
      const updates: Partial<LootTable> = {};
      if (args.includes('--name')) {
        updates.name = args.find(arg => arg.startsWith('--name='))?.split('=')[1];
      }
      if (args.includes('--max-rolls')) {
        updates.maxRolls = parseInt(args.find(arg => arg.startsWith('--max-rolls='))?.split('=')[1] || '3');
      }
      output = manager.updateTable(tableId, updates);
      break;

    case 'delete':
      output = manager.deleteTable(tableId);
      break;

    case 'list':
      const filter: any = {};
      if (args.includes('--rarity')) filter.rarity = rarity;
      if (args.includes('--min-weight')) filter.minWeight = minWeight;
      if (args.includes('--max-weight')) filter.maxWeight = maxWeight;
      if (args.includes('--has-conditions')) filter.hasConditions = true;
      
      output = manager.listTables(filter);
      break;

    case 'roll':
      output = manager.rollLoot(tableId, count, seed);
      break;

    case 'stats':
      output = manager.getLootStats();
      break;

    case 'export':
      output = manager.exportTables(format);
      break;

    case 'reset':
      output = manager.resetTables();
      break;

    case 'demo':
      // Create a demo loot table with various rarities
      const demoTable: LootTable = {
        id: 'demo_loot_table',
        name: 'Demo Loot Table',
        entries: [
          {
            id: 'demo_gold',
            weight: 100,
            rarity: 'common',
            statRolls: [{ key: 'amount', min: 10, max: 50 }]
          },
          {
            id: 'demo_sword',
            weight: 30,
            rarity: 'uncommon',
            statRolls: [
              { key: 'damage', min: 8, max: 15 },
              { key: 'durability', min: 60, max: 100 }
            ]
          },
          {
            id: 'demo_ring',
            weight: 10,
            rarity: 'rare',
            statRolls: [
              { key: 'magic_power', min: 15, max: 30 }
            ]
          },
          {
            id: 'demo_artifact',
            weight: 2,
            rarity: 'legendary',
            statRolls: [
              { key: 'power', min: 50, max: 100 },
              { key: 'special_ability', min: 1, max: 5 }
            ]
          }
        ],
        maxRolls: 5,
        guaranteedDrops: ['demo_gold'],
        metadata: { description: 'Demo loot table with various rarities' }
      };
      
      const createResult = manager.createTable(demoTable);
      if (createResult.status === 'ok') {
        const rollResult = manager.rollLoot('demo_loot_table', 3);
        output = {
          op: 'demo',
          status: 'ok',
          result: {
            message: 'Demo loot table created and rolled',
            table: createResult.result,
            roll: rollResult.result
          }
        };
      } else {
        output = createResult;
      }
      break;

    case 'sample':
      // Create sample loot tables for testing
      const sampleTables = [
        {
          id: 'treasure_chest',
          name: 'Treasure Chest',
          entries: [
            {
              id: 'gold_coins',
              weight: 80,
              rarity: 'common',
              statRolls: [{ key: 'count', min: 5, max: 20 }]
            },
            {
              id: 'silver_ring',
              weight: 20,
              rarity: 'uncommon',
              statRolls: [{ key: 'value', min: 10, max: 25 }]
            }
          ],
          maxRolls: 2,
          metadata: { description: 'Basic treasure chest loot' }
        },
        {
          id: 'dragon_hoard',
          name: 'Dragon Hoard',
          entries: [
            {
              id: 'dragon_gold',
              weight: 100,
              rarity: 'epic',
              statRolls: [{ key: 'amount', min: 100, max: 500 }]
            },
            {
              id: 'dragon_scale',
              weight: 50,
              rarity: 'rare',
              statRolls: [
                { key: 'defense', min: 20, max: 40 },
                { key: 'durability', min: 80, max: 120 }
              ]
            },
            {
              id: 'dragon_heart',
              weight: 10,
              rarity: 'legendary',
              statRolls: [
                { key: 'magic_power', min: 100, max: 200 },
                { key: 'special_ability', min: 1, max: 3 }
              ]
            }
          ],
          guaranteedDrops: ['dragon_gold'],
          metadata: { description: 'Loot from defeating a dragon' }
        }
      ];

      const results = sampleTables.map(table => manager.createTable(table));
      output = {
        op: 'sample',
        status: 'ok',
        result: {
          message: 'Sample loot tables created',
          results: results.map(r => ({ status: r.status, table: r.result }))
        }
      };
      break;

    default:
      output = {
        op: 'help',
        status: 'ok',
        result: {
          availableCommands: [
            'create --table-id=<id> --name=<name>',
            'get --table-id=<id>',
            'update --table-id=<id> [--name=<name>] [--max-rolls=<count>]',
            'delete --table-id=<id>',
            'list [--rarity=<rarity>] [--min-weight=<min>] [--max-weight=<max>] [--has-conditions]',
            'roll --table-id=<id> --count=<count> [--seed=<seed>]',
            'stats',
            'export --format=<json|manifest|summary|rolls>',
            'reset',
            'demo',
            'sample'
          ],
          examples: [
            'node cliHarness.ts create --table-id=treasure_chest --name="Treasure Chest"',
            'node cliHarness.ts roll --table-id=basic_enemy_drops --count=3 --seed=12345',
            'node cliHarness.ts export --format=manifest',
            'node cliHarness.ts list --rarity=rare --min-weight=10'
          ]
        }
      };
  }
} catch (error) {
  output = {
    op: mode || 'unknown',
    status: 'error',
    issues: [error instanceof Error ? error.message : 'Unknown error']
  };
}

// Output valid JSON to stdout for test runner to consume
console.log(formatOutput(output));