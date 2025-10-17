#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { LootTablesManager, LootTable, LootEntry } from './Manager';

type Cmd =
  | { op: 'list' }
  | { op: 'simulate'; tableId: string; count?: number; seed?: number }
  | { op: 'dump'; id: string }
  | { op: 'create'; table: LootTable }
  | { op: 'roll'; tableId: string; count?: number; seed?: number }
  | { op: 'stats'; tableId?: string }
  | { op: 'export'; tableId?: string; format?: 'json' | 'manifest' | 'summary' | 'rolls' };

function main() {
  const tablesPath = process.argv[2];
  const commandsPath = process.argv[3];
  
  if (!tablesPath || !commandsPath) {
    console.error('Usage: cliHarness.ts <tables.json> <commands.json>');
    process.exit(1);
  }

  const tablesData = JSON.parse(fs.readFileSync(tablesPath, 'utf-8'));
  const commands: Cmd[] = JSON.parse(fs.readFileSync(commandsPath, 'utf-8'));
  
  const manager = new LootTablesManager();
  const outputs: any[] = [];
  const log: string[] = [];

  // Load sample data (will add to existing default tables)
  if (tablesData.tables) {
    for (const table of tablesData.tables) {
      const result = manager.createTable(table);
      if (result.status === 'error') {
        log.push(`Error creating table ${table.id}: ${result.issues?.join(', ')}`);
        if (result.issues?.[0]?.includes('already exists')) {
          // Table already exists, update it instead
          const updateResult = manager.updateTable(table.id, table);
          if (updateResult.status === 'error') {
            log.push(`Error updating table ${table.id}: ${updateResult.issues?.join(', ')}`);
          }
        }
      }
    }
  }

  commands.forEach((cmd: any) => {
    try {
      switch (cmd.op) {
        case 'list':
          const listResult = manager.listTables();
          outputs.push({ op: 'list', status: 'ok', result: listResult });
          break;
          
        case 'simulate':
          const simulateResult = manager.rollLoot(cmd.tableId, cmd.count || 1, cmd.seed);
          outputs.push({ op: 'simulate', status: 'ok', result: simulateResult });
          break;
          
        case 'dump':
          const dumpResult = manager.getTable(cmd.id);
          if (dumpResult) {
            outputs.push({ op: 'dump', status: 'ok', result: dumpResult });
          } else {
            outputs.push({ op: 'dump', status: 'error', issues: [`Table ${cmd.id} not found`] });
          }
          break;
          
        case 'create':
          const createResult = manager.createTable(cmd.table);
          outputs.push({ op: 'create', status: 'ok', result: createResult });
          break;
          
        case 'roll':
          const rollResult = manager.rollLoot(cmd.tableId, cmd.count || 1, cmd.seed);
          outputs.push({ op: 'roll', status: 'ok', result: rollResult });
          break;
          
        case 'stats':
          const statsResult = manager.getStats(cmd.tableId);
          outputs.push({ op: 'stats', status: 'ok', result: statsResult });
          break;
          
        case 'export':
          const exportResult = manager.exportTable(cmd.tableId, cmd.format || 'json');
          outputs.push({ op: 'export', status: 'ok', result: exportResult });
          break;
          
        default:
          log.push(`Unknown command: ${(cmd as any).op}`);
          outputs.push({ op: (cmd as any).op, status: 'error', issues: [`Unknown command: ${(cmd as any).op}`] });
          break;
      }
    } catch (error: unknown) {
      log.push(`Error executing ${cmd.op}: ${error.message}`);
      outputs.push({ op: cmd.op, status: 'error', issues: [error.message] });
    }
  });

  console.log(JSON.stringify({ log, outputs }, null, 2));
}

main();