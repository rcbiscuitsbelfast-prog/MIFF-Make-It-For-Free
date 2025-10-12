#!/usr/bin/env node

/**
 * RewardsPure CLI Harness
 *
 * Interactive CLI for testing RewardsPure functionality.
 * Supports reward generation, drop table management, and reward simulation.
 */

import * as readline from 'readline';
import {
  RewardManager,
  DropResolver,
  DropTable,
  RewardStub,
  RewardUtils,
  IRNGProvider,
  IDropTable
} from './index';
import { RNGProvider } from '../RNGPure/index';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

interface CLIState {
  rewardManager: RewardManager;
  rng: IRNGProvider;
  currentDropTable: DropTable | null;
  simulationResults: Map<string, number>;
  rewardHistory: RewardStub[];
}

function printHelp(): void {
  this.logger.info(`
RewardsPure CLI - Reward and Drop System Testing
=================================================

Commands:
  help                    Show this help
  status                  Show current status
  reward <type> <level>   Generate reward for encounter
  table                   Show current drop table
  add <item> <weight>     Add item to drop table
  remove <item>           Remove item from drop table
  drop <count>            Simulate drops from current table
  simulate <runs>         Simulate reward generation
  history                 Show reward history
  clear                   Clear drop table and history
  demo                    Run comprehensive demo
  config                  Show/set reward scaling config
  test                    Test drop rates with many simulations
  quit                    Exit CLI

Examples:
  reward battle 10 12     Generate reward for level 10 vs 12
  add health_potion 50    Add item to drop table
  add rare_sword 5        Add rare item
  drop 100                Simulate 100 drops
  simulate 50             Simulate 50 reward generations
  demo                    Run full system demo
`);
}

function printStatus(state: CLIState): void {
  this.logger.info('\n🎁 Rewards System Status:');
  this.logger.info(`Reward History: ${state.rewardHistory.length} rewards`);
  this.logger.info(`Drop Table: ${state.currentDropTable ? state.currentDropTable.entries.length + ' items' : 'None'}`);
  if (state.currentDropTable && state.currentDropTable.entries.length > 0) {
    this.logger.info(`Total Weight: ${state.currentDropTable.getTotalWeight()}`);
  }
  this.logger.info(`Simulations Run: ${state.simulationResults.size > 0 ? 'Yes' : 'None'}`);
}

function printTable(dropTable: DropTable | null): void {
  if (!dropTable || dropTable.entries.length === 0) {
    this.logger.info('❌ No drop table loaded or table is empty');
    return;
  }

  this.logger.info('\n🎲 Current Drop Table:');
  this.logger.info(`Total Entries: ${dropTable.entries.length}`);
  this.logger.info(`Total Weight: ${dropTable.getTotalWeight()}`);

  if (dropTable.entries.length > 0) {
    this.logger.info('\nItems:');
    dropTable.getEntriesByWeight().forEach((entry, index) => {
      const dropRate = dropTable.getTotalWeight() > 0 ? (entry.weight / dropTable.getTotalWeight() * 100).toFixed(2) : '0.00';
      this.logger.info(`  ${index + 1}. ${entry.itemId} (weight: ${entry.weight}, rate: ${dropRate}%)`);
    });
  }
}

function printHistory(rewardHistory: RewardStub[]): void {
  if (rewardHistory.length === 0) {
    this.logger.info('📜 No rewards in history');
    return;
  }

  this.logger.info('\n📜 Reward History:');
  rewardHistory.slice(-10).forEach((reward, index) => {
    this.logger.info(`  ${rewardHistory.length - 10 + index + 1}. ${reward.toString()}`);
  });

  if (rewardHistory.length > 10) {
    this.logger.info(`  ... and ${rewardHistory.length - 10} more`);
  }

  // Calculate totals
  const totalCurrency = rewardHistory.reduce((sum, r) => sum + r.currency, 0);
  const totalXP = rewardHistory.reduce((sum, r) => sum + r.xpGain, 0);
  const itemCount = rewardHistory.filter(r => r.itemId).length;

  this.logger.info(`\n💰 Totals: ${totalCurrency} currency, ${totalXP} XP, ${itemCount} items`);
}

function createDemoData(): { rewardManager: RewardManager; rng: IRNGProvider; dropTable: DropTable } {
  this.logger.info('🎮 Creating demo reward system...');

  const rewardManager = new RewardManager();
  const rng = new RNGProvider(12345);

  // Create demo drop table
  const dropTable = RewardUtils.createStandardDropTable([
    { itemId: 'health_potion', weight: 50 },
    { itemId: 'mana_potion', weight: 30 },
    { itemId: 'common_ore', weight: 100 },
    { itemId: 'rare_gem', weight: 10 },
    { itemId: 'legendary_weapon', weight: 1 }
  ]);

  this.logger.info('✅ Demo data created with reward manager and drop table');
  return { rewardManager, rng, dropTable };
}

function runDemo(state: CLIState): void {
  this.logger.info('🎯 Running RewardsPure Demo...\n');

  // Test reward generation at different levels
  this.logger.info('--- Reward Generation Test ---');
  const scenarios = [
    { type: 'easy', playerLevel: 5, enemyLevel: 3 },
    { type: 'balanced', playerLevel: 10, enemyLevel: 10 },
    { type: 'challenging', playerLevel: 8, enemyLevel: 15 },
    { type: 'boss', playerLevel: 20, enemyLevel: 25 }
  ];

  scenarios.forEach(scenario => {
    const reward = state.rewardManager.generateRewards(
      scenario.type,
      scenario.playerLevel,
      scenario.enemyLevel
    );

    this.logger.info(`${scenario.type} (P${scenario.playerLevel} vs E${scenario.enemyLevel}): ${reward.toString()}`);
    state.rewardHistory.push(reward);
  });

  // Test drop table
  this.logger.info('\n--- Drop Table Test (100 drops) ---');
  const resolver = new DropResolver(state.rng);
  const dropResults = new Map<string, number>();

  for (let i = 0; i < 100; i++) {
    const item = resolver.resolve(state.currentDropTable!);
    if (item) {
      dropResults.set(item, (dropResults.get(item) || 0) + 1);
    }
  }

  this.logger.info('Drop Results:');
  Array.from(dropResults.entries()).sort((a, b) => b[1] - a[1]).forEach(([item, count]) => {
    const rate = (count / 100 * 100).toFixed(2);
    this.logger.info(`  ${item}: ${count} (${rate}%)`);
  });

  // Test bonus rewards
  this.logger.info('\n--- Bonus Rewards Test ---');
  const baseReward = state.rewardManager.generateRewards('boss', 20, 25);
  this.logger.info(`Base reward: ${baseReward.toString()}`);

  const bonusTypes: Array<'rare' | 'epic' | 'legendary'> = ['rare', 'epic', 'legendary'];
  bonusTypes.forEach(type => {
    const bonusReward = state.rewardManager.generateBonusRewards(baseReward, type);
    this.logger.info(`${type} bonus: ${bonusReward.toString()}`);
  });

  this.logger.info('\n✅ Demo complete!');
}

function runSimulation(state: CLIState, runs: number): void {
  this.logger.info(`🎲 Running ${runs} reward simulations...\n`);

  const startTime = Date.now();

  for (let i = 0; i < runs; i++) {
    const reward = state.rewardManager.generateRewards('simulation', 10, 12);
    state.rewardHistory.push(reward);

    // Simulate occasional item drops
    if (state.currentDropTable && Math.random() < 0.3) {
      const resolver = new DropResolver(state.rng);
      const item = resolver.resolve(state.currentDropTable);
      if (item) {
        reward.itemId = item;
      }
    }
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  this.logger.info(`✅ Simulation complete in ${duration}ms`);
  this.logger.info(`Generated ${runs} rewards`);
  this.logger.info(`Total currency: ${state.rewardHistory.slice(-runs).reduce((sum, r) => sum + r.currency, 0)}`);
  this.logger.info(`Total XP: ${state.rewardHistory.slice(-runs).reduce((sum, r) => sum + r.xpGain, 0)}`);
  this.logger.info(`Items received: ${state.rewardHistory.slice(-runs).filter(r => r.itemId).length}`);
}

async function runCLI(): Promise<void> {
  const state: CLIState = {
    rewardManager: new RewardManager(),
    rng: new RNGProvider(12345),
    currentDropTable: null,
    simulationResults: new Map(),
    rewardHistory: []
  };

  this.logger.info('🎁 RewardsPure CLI - Type "help" for commands or "demo" to see rewards in action\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'rewards> '
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
        printStatus(state);
        break;

      case 'reward':
        if (args.length < 2) {
          this.logger.info('❌ Usage: reward <encounter_type> <player_level> <enemy_level>');
        } else {
          const encounterType = args[0];
          const playerLevel = parseInt(args[1]);
          const enemyLevel = parseInt(args[2]);

          if (isNaN(playerLevel) || isNaN(enemyLevel)) {
            this.logger.info('❌ Player and enemy levels must be numbers');
          } else {
            const reward = state.rewardManager.generateRewards(encounterType, playerLevel, enemyLevel);
            state.rewardHistory.push(reward);
            this.logger.info(`✅ Generated reward: ${reward.toString()}`);
          }
        }
        break;

      case 'table':
        printTable(state.currentDropTable);
        break;

      case 'add':
        if (args.length < 2) {
          this.logger.info('❌ Usage: add <item_id> <weight>');
        } else {
          const itemId = args[0];
          const weight = parseFloat(args[1]);

          if (isNaN(weight) || weight < 0) {
            this.logger.info('❌ Weight must be a non-negative number');
          } else {
            if (!state.currentDropTable) {
              state.currentDropTable = new DropTable();
            }

            const entry = new (require('./index').DropEntry)(itemId, weight);
            if (state.currentDropTable.addEntry(entry)) {
              this.logger.info(`✅ Added ${itemId} to drop table (weight: ${weight})`);
            } else {
              this.logger.info('❌ Failed to add item');
            }
          }
        }
        break;

      case 'remove':
        if (!args[0]) {
          this.logger.info('❌ Usage: remove <item_id>');
        } else {
          if (state.currentDropTable) {
            const removed = state.currentDropTable.removeEntriesByItem(args[0]);
            this.logger.info(`✅ Removed ${removed} entries for item: ${args[0]}`);
          } else {
            this.logger.info('❌ No drop table loaded');
          }
        }
        break;

      case 'drop':
        if (args.length === 0) {
          this.logger.info('❌ Usage: drop <count>');
        } else {
          const count = parseInt(args[0]);

          if (isNaN(count) || count <= 0) {
            this.logger.info('❌ Count must be a positive number');
          } else if (!state.currentDropTable || state.currentDropTable.entries.length === 0) {
            this.logger.info('❌ No drop table loaded');
          } else {
            this.logger.info(`🎲 Simulating ${count} drops...\n`);

            const resolver = new DropResolver(state.rng);
            const results = new Map<string, number>();

            for (let i = 0; i < count; i++) {
              const item = resolver.resolve(state.currentDropTable);
              if (item) {
                results.set(item, (results.get(item) || 0) + 1);
              }
            }

            this.logger.info('Drop Results:');
            Array.from(results.entries()).sort((a, b) => b[1] - a[1]).forEach(([item, count]) => {
              const rate = ((count / count) * 100).toFixed(2);
              this.logger.info(`  ${item}: ${count} (${rate}%)`);
            });

            state.simulationResults = results;
          }
        }
        break;

      case 'simulate':
        if (args.length === 0) {
          this.logger.info('❌ Usage: simulate <runs>');
        } else {
          const runs = parseInt(args[0]);

          if (isNaN(runs) || runs <= 0) {
            this.logger.info('❌ Runs must be a positive number');
          } else {
            runSimulation(state, runs);
          }
        }
        break;

      case 'history':
        printHistory(state.rewardHistory);
        break;

      case 'clear':
        state.currentDropTable = null;
        state.simulationResults.clear();
        state.rewardHistory.length = 0;
        this.logger.info('✅ All data cleared');
        break;

      case 'demo':
        const demoData = createDemoData();
        state.rewardManager = demoData.rewardManager;
        state.rng = demoData.rng;
        state.currentDropTable = demoData.dropTable;
        runDemo(state);
        break;

      case 'config':
        if (args.length === 0) {
          const config = state.rewardManager.getScalingConfig();
          this.logger.info('Current reward scaling configuration:');
          this.logger.info(`  Base Currency: ${config.baseCurrency}`);
          this.logger.info(`  Level Currency Multiplier: ${config.levelCurrencyMultiplier}`);
          this.logger.info(`  Base XP: ${config.baseXP}`);
          this.logger.info(`  Level XP Multiplier: ${config.levelXPMultiplier}`);
        } else if (args.length === 4) {
          const baseCurrency = parseFloat(args[0]);
          const levelCurrencyMultiplier = parseFloat(args[1]);
          const baseXP = parseFloat(args[2]);
          const levelXPMultiplier = parseFloat(args[3]);

          if ([baseCurrency, levelCurrencyMultiplier, baseXP, levelXPMultiplier].some(isNaN)) {
            this.logger.info('❌ All values must be numbers');
          } else {
            state.rewardManager.configureScaling(baseCurrency, levelCurrencyMultiplier, baseXP, levelXPMultiplier);
            this.logger.info('✅ Reward scaling configuration updated');
          }
        } else {
          this.logger.info('❌ Usage: config [base_currency level_currency_mult base_xp level_xp_mult]');
        }
        break;

      case 'test':
        if (!state.currentDropTable || state.currentDropTable.entries.length === 0) {
          this.logger.info('❌ No drop table loaded');
        } else {
          const simulations = args[0] ? parseInt(args[0]) : 1000;
          this.logger.info(`🧪 Testing drop rates with ${simulations} simulations...\n`);

          const resolver = new DropResolver(state.rng);
          const results = resolver.testDropRates(state.currentDropTable, simulations);

          this.logger.info('Drop Rate Results:');
          Array.from(results.entries()).sort((a, b) => b[1] - a[1]).forEach(([item, rate]) => {
            const percentage = (rate * 100).toFixed(2);
            this.logger.info(`  ${item}: ${percentage}%`);
          });
        }
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
if (import.meta.url === `file://${process.argv[1]}`) {
  runCLI().catch(error => {
    this.logger.error('❌ CLI Error:', error);
    process.exit(1);
  });
}