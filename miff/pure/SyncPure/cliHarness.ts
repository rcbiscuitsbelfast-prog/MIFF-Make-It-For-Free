#!/usr/bin/env node

/**
 * SyncPure CLI Harness
 *
 * Interactive CLI for testing SyncPure functionality.
 * Supports sync level management, event processing, and challenge simulation.
 */

import * as readline from 'readline';
import {
  SyncManager,
  SyncEvent,
  SyncChallenge,
  SyncTrigger,
  SyncUtils,
  ISyncEventData
} from './index';

interface CLIState {
  syncManager: SyncManager;
  eventHistory: ISyncEventData[];
  currentChallenge: SyncChallenge | null;
}

function printHelp(): void {
  console.log(`
SyncPure CLI - Spirit Synchronization System Testing
=====================================================

Commands:
  help                    Show this help
  status                  Show sync status
  spirit <id>             Show specific spirit sync info
  add <id> <level>        Add spirit with initial sync level
  sync <id> <amount>      Add sync points to spirit
  reset <id>              Reset spirit sync to 0
  event <id> <trigger>    Trigger sync event for spirit
  thresholds <id> [vals]  Set thresholds for spirit
  challenge <bpm> <diff>  Create rhythm challenge
  play <accuracy>         Play current challenge
  battle <id> <diff>      Simulate battle sync gain
  item <id> <rarity>      Simulate item sync gain
  stats                   Show sync statistics
  history <limit>         Show sync event history
  clear                   Clear all sync data
  demo                    Run comprehensive demo
  simulate <events>       Simulate random sync events
  quit                    Exit CLI

Examples:
  add ember 25
  sync ember 10
  event ember battle_win
  challenge 120 2
  play 0.85
  demo
`);
}

function printStatus(state: CLIState): void {
  const allSpirits = state.syncManager.getAllSpirits();
  const stats = state.syncManager.getStatistics();

  console.log('\n🎵 Sync System Status:');
  console.log(`Total Spirits: ${allSpirits.length}`);
  console.log(`Total Events: ${stats.totalSyncEvents}`);
  console.log(`Total Sync Gained: ${stats.totalSyncGained}`);
  console.log(`Average per Event: ${stats.averageSyncPerEvent.toFixed(1)}`);
  console.log(`Highest Level: ${stats.highestSyncLevel}`);
  console.log(`Current Challenge: ${state.currentChallenge ? 'Active' : 'None'}`);
}

function printSpiritInfo(state: CLIState, spiritId: string): void {
  const entry = state.syncManager.getSyncEntry(spiritId);

  if (!entry) {
    console.log(`❌ Spirit '${spiritId}' not found`);
    return;
  }

  console.log(`\n👤 Spirit: ${spiritId}`);
  console.log(`Current Level: ${entry.currentLevel}`);
  console.log(`Thresholds: ${entry.thresholds.length > 0 ? entry.thresholds.join(', ') : 'None'}`);
  console.log(`Can Level Up: ${entry.canLevelUp ? 'Yes' : 'No'}`);
  console.log(`Progress: ${Math.round(entry.levelProgress * 100)}%`);
}

function createDemoData(): SyncManager {
  console.log('🎵 Creating demo sync system...');

  const syncManager = new SyncManager();

  // Create demo spirits
  syncManager.increaseSync('ember', 25);
  syncManager.increaseSync('ripple', 15);
  syncManager.increaseSync('sprout', 5);

  // Set thresholds
  syncManager.setThresholds('ember', SyncUtils.createStandardThresholds(100));
  syncManager.setThresholds('ripple', SyncUtils.createStandardThresholds(100));
  syncManager.setThresholds('sprout', SyncUtils.createStandardThresholds(100));

  console.log('✅ Demo data created with 3 spirits');
  return syncManager;
}

function runDemo(state: CLIState): void {
  console.log('🎯 Running SyncPure Demo...\n');

  const demoData = createDemoData();
  state.syncManager = demoData;

  // Simulate various sync events
  console.log('--- Simulating Sync Events ---\n');

  // Battle events
  console.log('⚔️ Battle Events:');
  state.syncManager.processSyncEvent('ember', SyncEvent.createBattleWin(1));
  console.log('  Ember wins easy battle (+10 sync)');

  state.syncManager.processSyncEvent('ripple', SyncEvent.createBattleWin(2));
  console.log('  Ripple wins normal battle (+20 sync)');

  // Item events
  console.log('🎒 Item Usage Events:');
  state.syncManager.processSyncEvent('ember', SyncEvent.createItemUsage('health_potion', 1));
  console.log('  Ember uses common item (+5 sync)');

  state.syncManager.processSyncEvent('sprout', SyncEvent.createItemUsage('legendary_weapon', 5));
  console.log('  Sprout uses legendary item (+40 sync)\n');

  // Show final results
  console.log('--- Final Sync Levels ---');
  state.syncManager.getAllSpirits().forEach(spiritId => {
    const level = state.syncManager.getSyncLevel(spiritId);
    console.log(`  ${spiritId}: Level ${level}`);
  });

  console.log('\n✅ Demo complete!');
}

async function runCLI(): Promise<void> {
  const syncManager = new SyncManager();
  const eventHistory: ISyncEventData[] = [];

  const state: CLIState = {
    syncManager,
    eventHistory,
    currentChallenge: null
  };

  console.log('🎵 SyncPure CLI - Type "help" for commands or "demo" to see sync system in action\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'sync> '
  });

  rl.prompt();

  rl.on('line', (input: string) => {
    const parts = input.trim().split(/\s+/);
    const command = parts[0!]?.toLowerCase() || '';
    const args = parts.slice(1);

    switch (command) {
      case 'help':
      case 'h':
        printHelp();
        break;

      case 'status':
        printStatus(state);
        break;

      case 'spirit':
        if (args.length === 0) {
          console.log('❌ Usage: spirit <spirit_id>');
        } else {
          printSpiritInfo(state, args[0!]);
        }
        break;

      case 'add':
        if (args.length < 2) {
          console.log('❌ Usage: add <spirit_id> <initial_level>');
        } else {
          const spiritId = args[0!];
          const initialLevel = parseInt(args[1!]);

          if (isNaN(initialLevel) || initialLevel < 0) {
            console.log('❌ Initial level must be a non-negative number');
          } else {
            state.syncManager.increaseSync(spiritId, initialLevel);
            state.syncManager.setThresholds(spiritId, SyncUtils.createStandardThresholds(100));
            console.log(`✅ Added ${spiritId} with initial sync level ${initialLevel}`);
          }
        }
        break;

      case 'sync':
        if (args.length < 2) {
          console.log('❌ Usage: sync <spirit_id> <amount>');
        } else {
          const spiritId = args[0!];
          const amount = parseInt(args[1!]);

          if (isNaN(amount) || amount <= 0) {
            console.log('❌ Sync amount must be a positive number');
          } else {
            const increase = state.syncManager.increaseSync(spiritId, amount);
            console.log(`✅ Added ${amount} sync to ${spiritId} (+${increase} levels)`);
          }
        }
        break;

      case 'reset':
        if (args.length === 0) {
          console.log('❌ Usage: reset <spirit_id>');
        } else {
          const spiritId = args[0!];
          const oldLevel = state.syncManager.resetSync(spiritId);
          console.log(`✅ Reset ${spiritId} sync from ${oldLevel} to 0`);
        }
        break;

      case 'event':
        if (args.length < 2) {
          console.log('❌ Usage: event <spirit_id> <trigger>');
        } else {
          const spiritId = args[0!];
          const triggerStr = args[1!];
          const tag = args[2!];

          let syncEvent: SyncEvent;

          switch (triggerStr.toLowerCase()) {
            case 'battle_win':
              const difficulty = tag ? parseInt(tag) : 1;
              syncEvent = SyncEvent.createBattleWin(difficulty);
              break;
            case 'item_usage':
              const rarity = (tag as any) || 'common';
              syncEvent = SyncEvent.createItemUsage(tag || 'unknown_item', SyncUtils.calculateItemSyncGain(rarity));
              break;
            case 'dialogue_choice':
              const emotionalWeight = tag ? parseFloat(tag) : 1;
              syncEvent = SyncEvent.createDialogueChoice(tag || 'unknown_choice', emotionalWeight);
              break;
            case 'rhythm_challenge_success':
              const accuracy = tag ? parseFloat(tag) : 0.8;
              syncEvent = SyncEvent.createRhythmChallenge(accuracy);
              break;
            default:
              console.log('❌ Unknown trigger. Use: battle_win, item_usage, dialogue_choice, rhythm_challenge_success');
              return;
          }

          const increase = state.syncManager.processSyncEvent(spiritId, syncEvent);
          console.log(`✅ Processed ${syncEvent.getSummary()} (+${increase} levels)`);
        }
        break;

      case 'thresholds':
        if (args.length < 1) {
          console.log('❌ Usage: thresholds <spirit_id> [threshold1 threshold2 ...]');
        } else {
          const spiritId = args[0!];
          const thresholds = args.slice(1).map((t: any) => parseInt(t)).filter((t: any) => !isNaN(t));

          if (thresholds.length === 0) {
            console.log('❌ At least one threshold value required');
          } else {
            const success = state.syncManager.setThresholds(spiritId, thresholds);
            console.log(success ? `✅ Set thresholds for ${spiritId}: ${thresholds.join(', ')}` : '❌ Failed');
          }
        }
        break;

      case 'challenge':
        if (args.length < 2) {
          console.log('❌ Usage: challenge <bpm> <difficulty>');
        } else {
          const bpm = parseFloat(args[0!]);
          const difficulty = parseInt(args[1!]);

          if (isNaN(bpm) || bpm < 60 || bpm > 200) {
            console.log('❌ BPM must be between 60 and 200');
          } else if (isNaN(difficulty) || difficulty < 1 || difficulty > 3) {
            console.log('❌ Difficulty must be between 1 and 3');
          } else {
            state.currentChallenge = new SyncChallenge(bpm, difficulty, `challenge_${Date.now()}`);
            console.log(`✅ Created ${state.currentChallenge.getDifficultyRating()} challenge at ${bpm} BPM`);
          }
        }
        break;

      case 'play':
        if (!state.currentChallenge) {
          console.log('❌ No challenge active. Create one with "challenge" command');
        } else if (args.length === 0) {
          console.log('❌ Usage: play <accuracy>');
        } else {
          const accuracy = parseFloat(args[0!]);

          if (isNaN(accuracy) || accuracy < 0 || accuracy > 1) {
            console.log('❌ Accuracy must be between 0.0 and 1.0');
          } else {
            const syncGain = state.currentChallenge.evaluatePerformance(accuracy);
            console.log(`🎵 Challenge completed! Accuracy: ${(accuracy * 100).toFixed(1)}%`);
            console.log(`   Sync gained: ${syncGain}`);

            // Apply to random spirit
            const spirits = state.syncManager.getAllSpirits();
            if (spirits.length > 0) {
              const randomSpirit = spirits[Math.floor(Math.random() * spirits.length)];
              state.syncManager.processSyncEvent(randomSpirit, SyncEvent.createRhythmChallenge(accuracy, state.currentChallenge.difficulty));
              console.log(`   Applied to ${randomSpirit}`);
            }

            state.currentChallenge = null;
          }
        }
        break;

      case 'battle':
        if (args.length < 2) {
          console.log('❌ Usage: battle <spirit_id> <difficulty>');
        } else {
          const spiritId = args[0!];
          const difficulty = parseInt(args[1!]);

          if (isNaN(difficulty) || difficulty < 1) {
            console.log('❌ Difficulty must be a positive number');
          } else {
            const syncGain = SyncUtils.calculateBattleSyncGain(10, 10 + difficulty, true, difficulty);
            const increase = state.syncManager.processSyncEvent(spiritId, SyncEvent.createBattleWin(difficulty));
            console.log(`⚔️ ${spiritId} wins battle (difficulty ${difficulty})`);
            console.log(`   Sync gained: ${syncGain} (+${increase} levels)`);
          }
        }
        break;

      case 'item':
        if (args.length < 2) {
          console.log('❌ Usage: item <spirit_id> <rarity>');
        } else {
          const spiritId = args[0!];
          const rarity = args[1!] as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

          if (!['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(rarity)) {
            console.log('❌ Rarity must be: common, uncommon, rare, epic, legendary');
          } else {
            const syncGain = SyncUtils.calculateItemSyncGain(rarity);
            const increase = state.syncManager.processSyncEvent(spiritId, SyncEvent.createItemUsage(`item_${rarity}`, syncGain));
            console.log(`🎒 ${spiritId} uses ${rarity} item`);
            console.log(`   Sync gained: ${syncGain} (+${increase} levels)`);
          }
        }
        break;

      case 'stats':
        const stats = state.syncManager.getStatistics();
        console.log('\n📊 Sync Statistics:');
        console.log(`Total Events: ${stats.totalSyncEvents}`);
        console.log(`Total Sync Gained: ${stats.totalSyncGained}`);
        console.log(`Average per Event: ${stats.averageSyncPerEvent.toFixed(1)}`);
        console.log(`Highest Level: ${stats.highestSyncLevel}`);
        console.log(`Most Active Spirit: ${stats.mostActiveSpirit || 'None'}`);
        break;

      case 'clear':
        state.syncManager.clear();
        state.eventHistory.length = 0;
        state.currentChallenge = null;
        console.log('✅ All sync data cleared');
        break;

      case 'demo':
        runDemo(state);
        break;

      case 'quit':
      case 'exit':
      case 'q':
        console.log('👋 Goodbye!');
        rl.close();
        process.exit(0);

      default:
        if (command !== '') {
          console.log(`❌ Unknown command: ${command}. Type 'help' for available commands.`);
        }
    }

    rl.prompt();
  });

  rl.on('SIGINT', () => {
    console.log('\n👋 Goodbye!');
    rl.close();
    process.exit(0);
  });
}

// Main execution
if (require.main === module) {
  runCLI().catch(error => {
    console.error('❌ CLI Error:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}