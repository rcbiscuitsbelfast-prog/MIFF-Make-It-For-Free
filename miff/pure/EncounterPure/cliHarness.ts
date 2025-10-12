#!/usr/bin/env node

/**
 * EncounterPure CLI Harness
 *
 * Interactive CLI for testing EncounterPure functionality.
 * Supports encounter table management, trigger configuration, and encounter simulation.
 */

import * as readline from 'readline';
import {
  EncounterController,
  EncounterTable,
  EncounterTrigger,
  PlayerState,
  TriggerType,
  EncounterUtils,
  IRNGProvider,
  IPlayerState
} from './index';
import { RNGProvider } from '../RNGPure/index';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

interface CLIState {
  controller: EncounterController;
  rng: IRNGProvider;
  currentZone: string;
  playerState: IPlayerState;
  simulationRunning: boolean;
}

function printHelp(): void {
  this.logger.info(`
EncounterPure CLI - Encounter Management Testing
===============================================

Commands:
  help                    Show this help
  status                  Show current status
  zone <id>               Set current zone
  table <zone>            Show encounter table for zone
  add <spirit> <weight>   Add encounter entry to current zone
  trigger <type> [param]  Add trigger to current zone
  simulate <steps>        Simulate encounter checks
  state                   Show player state
  setstate <tile> <time>  Set player tile type and time
  reset                   Reset steps since encounter
  clear                   Clear all tables and triggers
  demo                    Run comprehensive demo
  quit                    Exit CLI

Trigger Types:
  zone                    Zone entry trigger (no params)
  tile <tile_type>        Tile type trigger
  time <time_of_day>      Time of day trigger

Examples:
  zone newhaven
  add ember 40
  add ripple 35
  trigger tile grass
  trigger time night
  simulate 100
  demo
`);
}

function printStatus(controller: EncounterController, playerState: IPlayerState): void {
  this.logger.info('\n🏰 Encounter System Status:');
  this.logger.info(`Current Zone: ${playerState.zoneId}`);
  this.logger.info(`Tile Type: ${playerState.tileType}`);
  this.logger.info(`Time of Day: ${playerState.timeOfDay}`);
  this.logger.info(`Steps Since Last: ${playerState.stepsSinceLastEncounter}`);
  this.logger.info(`Tables: ${controller.getTableCount()}`);
  this.logger.info(`Triggers: ${controller.getTriggerCount()}`);

  const tables = controller.getAllTables();
  if (tables.length > 0) {
    this.logger.info('\n📋 Zones:');
    tables.forEach(table => {
      this.logger.info(`  ${table.zoneId}: ${table.entries.length} entries, ${table.getTotalWeight()} total weight`);
    });
  }
}

function printTable(controller: EncounterController, zoneId: string): void {
  const table = controller.getTable(zoneId);
  if (!table) {
    this.logger.info(`❌ No encounter table found for zone: ${zoneId}`);
    return;
  }

  this.logger.info(`\n📊 Encounter Table: ${table.zoneId}`);
  this.logger.info(`Total Entries: ${table.entries.length}`);
  this.logger.info(`Total Weight: ${table.getTotalWeight()}`);

  if (table.entries.length > 0) {
    this.logger.info('\nEntries:');
    table.getEntriesByWeight().forEach((entry, index) => {
      this.logger.info(`  ${index + 1}. ${entry.spiritId} (weight: ${entry.weight}, levels: ${entry.minLevel}-${entry.maxLevel})`);
    });
  } else {
    this.logger.info('  No entries in table');
  }
}

function printPlayerState(playerState: IPlayerState): void {
  this.logger.info('\n👤 Player State:');
  this.logger.info(`Zone: ${playerState.zoneId}`);
  this.logger.info(`Tile: ${playerState.tileType}`);
  this.logger.info(`Time: ${playerState.timeOfDay}`);
  this.logger.info(`Steps: ${playerState.stepsSinceLastEncounter}`);
}

function createDemoData(): { controller: EncounterController; rng: IRNGProvider } {
  this.logger.info('🎮 Creating demo encounter system...');

  const controller = new EncounterController();
  const rng = new RNGProvider(12345);

  // Create Newhaven encounter table
  const newhavenTable = EncounterUtils.createStandardTable('newhaven', [
    { spiritId: 'ember', weight: 40, minLevel: 3, maxLevel: 5 },
    { spiritId: 'ripple', weight: 35, minLevel: 3, maxLevel: 5 },
    { spiritId: 'sprout', weight: 25, minLevel: 2, maxLevel: 4 }
  ]);

  // Create Grassland encounter table
  const grasslandTable = EncounterUtils.createStandardTable('grassland', [
    { spiritId: 'sprout', weight: 50, minLevel: 2, maxLevel: 4 },
    { spiritId: 'ripple', weight: 30, minLevel: 2, maxLevel: 4 },
    { spiritId: 'stone', weight: 20, minLevel: 3, maxLevel: 5 }
  ]);

  // Create Cave encounter table
  const caveTable = EncounterUtils.createStandardTable('cave', [
    { spiritId: 'stone', weight: 45, minLevel: 4, maxLevel: 6 },
    { spiritId: 'ember', weight: 35, minLevel: 3, maxLevel: 5 },
    { spiritId: 'crystal', weight: 20, minLevel: 5, maxLevel: 7 }
  ]);

  controller.registerTable(newhavenTable);
  controller.registerTable(grasslandTable);
  controller.registerTable(caveTable);

  // Add triggers
  controller.registerTrigger(EncounterUtils.createTileTrigger('newhaven', 'grass'));
  controller.registerTrigger(EncounterUtils.createTileTrigger('grassland', 'grass'));
  controller.registerTrigger(EncounterUtils.createTimeTrigger('cave', 'night'));

  this.logger.info('✅ Demo data created with 3 zones and multiple triggers');
  return { controller, rng };
}

function runDemo(controller: EncounterController, rng: IRNGProvider): void {
  this.logger.info('🎯 Running EncounterPure Demo...\n');

  // Create demo player states
  const states = [
    new PlayerState('newhaven', 'grass', 'day', 0),
    new PlayerState('grassland', 'grass', 'day', 0),
    new PlayerState('cave', 'stone', 'night', 0)
  ];

  this.logger.info('Simulating encounters in different zones...\n');

  states.forEach((state, index) => {
    this.logger.info(`--- Zone ${index + 1}: ${state.zoneId} (${state.tileType}, ${state.timeOfDay}) ---`);

    let encounters = 0;
    let totalSteps = 0;
    const maxSteps = 200;

    while (totalSteps < maxSteps && encounters < 5) {
      state.incrementSteps();
      totalSteps++;

      const result = controller.checkForEncounter(state, rng);

      if (result.triggered) {
        encounters++;
        this.logger.info(`  Step ${totalSteps}: Encounter! ${result.spiritId} (level ${result.level})`);

        // Reset steps after encounter
        state.resetSteps();
      }
    }

    if (encounters === 0) {
      this.logger.info(`  No encounters in ${totalSteps} steps`);
    } else {
      this.logger.info(`  Total encounters: ${encounters} in ${totalSteps} steps`);
    }

    this.logger.info('');
  });

  // Show statistics
  this.logger.info('📊 Encounter Statistics:');
  this.logger.info(`Zones: ${controller.getTableCount()}`);
  this.logger.info(`Total Triggers: ${controller.getTriggerCount()}`);

  const tables = controller.getAllTables();
  tables.forEach(table => {
    this.logger.info(`  ${table.zoneId}: ${table.entries.length} spirits, ${table.getTotalWeight()} total weight`);
  });
}

async function runCLI(): Promise<void> {
  const state: CLIState = {
    controller: new EncounterController(),
    rng: new RNGProvider(12345),
    currentZone: 'newhaven',
    playerState: new PlayerState('newhaven', 'grass', 'day', 0),
    simulationRunning: false
  };

  this.logger.info('🎲 EncounterPure CLI - Type "help" for commands or "demo" to see encounters in action\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'encounter> '
  });

  rl.prompt();

  rl.on('line', (input: string) => {
    const parts = input.trim().split(/\s+/);
    const command = parts[0]?.toLowerCase() || '';
    const args = parts.slice(1);

    switch (command) {
      case 'help':
      case 'h':
        printHelp();
        break;

      case 'status':
        printStatus(state.controller, state.playerState);
        break;

      case 'zone':
        if (args.length === 0) {
          this.logger.info(`Current zone: ${state.currentZone}`);
        } else {
          state.currentZone = args[0];
          state.playerState.zoneId = state.currentZone;
          this.logger.info(`Set zone to: ${state.currentZone}`);
        }
        break;

      case 'table':
        const zoneId = args[0] || state.currentZone;
        printTable(state.controller, zoneId);
        break;

      case 'add':
        if (args.length < 2) {
          this.logger.info('❌ Usage: add <spirit_id> <weight> [min_level] [max_level]');
        } else {
          const spiritId = args[0];
          const weight = parseInt(args[1]);
          const minLevel = args[2] ? parseInt(args[2]) : 1;
          const maxLevel = args[3] ? parseInt(args[3]) : 5;

          if (isNaN(weight) || weight <= 0) {
            this.logger.info('❌ Weight must be a positive number');
          } else {
            const table = state.controller.getTable(state.currentZone);
            if (!table) {
              const newTable = EncounterUtils.createStandardTable(state.currentZone, []);
              state.controller.registerTable(newTable);
            }

            const updatedTable = state.controller.getTable(state.currentZone)!;
            const entry = new (require('./index').EncounterTableEntry)(
              state.currentZone,
              spiritId,
              weight,
              minLevel,
              maxLevel
            );

            if (updatedTable.addEntry(entry)) {
              this.logger.info(`✅ Added ${spiritId} to ${state.currentZone} (weight: ${weight})`);
            } else {
              this.logger.info('❌ Failed to add entry');
            }
          }
        }
        break;

      case 'trigger':
        if (args.length < 1) {
          this.logger.info('❌ Usage: trigger <type> [param]');
        } else {
          const triggerTypeStr = args[0];
          let triggerType: TriggerType;

          switch (triggerTypeStr) {
            case 'zone':
              triggerType = TriggerType.ZONE_ENTRY;
              break;
            case 'tile':
              if (args.length < 2) {
                this.logger.info('❌ Tile trigger requires tile type parameter');
                return;
              }
              triggerType = TriggerType.TILE_TYPE;
              break;
            case 'time':
              if (args.length < 2) {
                this.logger.info('❌ Time trigger requires time of day parameter');
                return;
              }
              triggerType = TriggerType.TIME_OF_DAY;
              break;
            default:
              this.logger.info('❌ Invalid trigger type. Use: zone, tile, or time');
              return;
          }

          const triggerParams: Record<string, string> = {};
          if (triggerType === TriggerType.TILE_TYPE) {
            triggerParams['tile'] = args[1];
          } else if (triggerType === TriggerType.TIME_OF_DAY) {
            triggerParams['time'] = args[1];
          }

          const trigger = new (require('./index').EncounterTrigger)(
            triggerType,
            triggerParams,
            state.currentZone
          );

          state.controller.registerTrigger(trigger);
          this.logger.info(`✅ Added ${triggerTypeStr} trigger to ${state.currentZone}`);
        }
        break;

      case 'simulate':
      case 'sim':
        if (args.length === 0) {
          this.logger.info('❌ Usage: simulate <steps>');
        } else {
          const steps = parseInt(args[0]);

          if (isNaN(steps) || steps <= 0) {
            this.logger.info('❌ Steps must be a positive number');
          } else {
            this.logger.info(`🎲 Simulating ${steps} encounter checks...`);

            let encounters = 0;
            for (let i = 0; i < steps; i++) {
              state.playerState.incrementSteps();
              const result = state.controller.checkForEncounter(state.playerState, state.rng);

              if (result.triggered) {
                encounters++;
                this.logger.info(`  Step ${i + 1}: Encounter! ${result.spiritId} (level ${result.level})`);
                state.playerState.resetSteps();
              }
            }

            this.logger.info(`\n📊 Simulation complete: ${encounters}/${steps} encounters (${((encounters / steps) * 100).toFixed(2)}%)`);
          }
        }
        break;

      case 'state':
        printPlayerState(state.playerState);
        break;

      case 'setstate':
        if (args.length < 2) {
          this.logger.info('❌ Usage: setstate <tile_type> <time_of_day>');
        } else {
          state.playerState.tileType = args[0];
          state.playerState.timeOfDay = args[1];
          this.logger.info(`✅ Set tile type to: ${args[0]}, time of day to: ${args[1]}`);
        }
        break;

      case 'reset':
        state.playerState.resetSteps();
        this.logger.info('✅ Steps reset to 0');
        break;

      case 'clear':
        state.controller.clear();
        this.logger.info('✅ All tables and triggers cleared');
        break;

      case 'demo':
        const demoData = createDemoData();
        state.controller = demoData.controller;
        state.rng = demoData.rng;
        state.currentZone = 'newhaven';
        state.playerState = new (require('./index').PlayerState)('newhaven', 'grass', 'day', 0);
        runDemo(state.controller, state.rng);
        break;

      case 'quit':
      case 'exit':
      case 'q':
        this.logger.info('👋 Goodbye!');
        rl.close();
        process.exit(0);

      default:
        if (command !== '') {
          this.logger.info(`❌ Unknown command: ${command}. Type 'help' for available commands.`);
        }
    }

    rl.prompt();
  });

  rl.on('SIGINT', () => {
    this.logger.info('\n👋 Goodbye!');
    rl.close();
    process.exit(0);
  });
}

// Main execution
if (require.main === module) {
  runCLI().catch(error => {
    this.logger.error('❌ CLI Error:', error);
    process.exit(1);
  });
}