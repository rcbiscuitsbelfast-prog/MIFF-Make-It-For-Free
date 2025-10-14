#!/usr/bin/env node

/**
 * HUDPure CLI Harness
 *
 * Interactive CLI for testing HUDPure functionality.
 * Supports battle HUD management, real-time updates, and rendering simulation.
 */

import * as readline from 'readline';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import {
  BattleHUDModel,
  HUDManager,
  CLIHUDRenderer,
  SpiritHUDState,
  TurnHUDState,
  HUDPureUtils,
  IHUDUpdateEvent,
  HUDUpdateType
} from './index';

interface CLIState {
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
  hudManager: HUDManager;
  updateHistory: IHUDUpdateEvent[];
  simulationMode: boolean;
}

function printHelp(): void {
  console.info(`
HUDPure CLI - Battle HUD Management Testing
==========================================

Commands:
  help                    Show this help
  status                  Show current HUD status
  render                  Render current HUD
  add <side> <id> <name>  Add spirit to player/opponent
  update <id> <hp>        Update spirit HP
  damage <id> <amount>    Damage spirit
  heal <id> <amount>      Heal spirit
  status <id> <effect>    Add/remove status effect
  phase <phase> [active]  Change battle phase
  turn <number>           Set turn number
  round <number>          Set round number
  clear                   Clear HUD
  demo                    Run comprehensive demo
  simulate <turns>        Simulate battle progression
  history                 Show update history
  stats                   Show battle statistics
  quit                    Exit CLI

Sides: player, opponent
Phases: SelectAction, ResolveAction, TurnEnd, BattleEnd
Effects: poison, burn, freeze, stun, regen, shield, etc.

Examples:
  add player waterling Waterling 60 60
  add opponent ember Ember 45 45
  phase SelectAction waterling
  damage ember 14
  status waterling poison
  render
  simulate 5
  demo
`);
}

function printStatus(state: CLIState): void {
  const model = state.hudManager.getModel();

  console.info('\n🎮 HUD Status:');
  console.info(`Player Spirits: ${model.player.length}`);
  console.info(`Opponent Spirits: ${model.opponent.length}`);
  console.info(`Current Phase: ${model.turn.phaseName}`);
  console.info(`Active Spirit: ${model.turn.activeSpiritId || 'None'}`);
  console.info(`Update History: ${state.updateHistory.length} events`);
  console.info(`Simulation Mode: ${state.simulationMode ? 'Active' : 'Inactive'}`);
}

function printStats(state: CLIState): void {
  const model = state.hudManager.getModel();
  const stats = HUDPureUtils.calculateHealthStats(model);

  console.info('\n📊 Battle Statistics:');
  console.info(`Player Health Total: ${stats.playerTotal.toFixed(0)}%`);
  console.info(`Opponent Health Total: ${stats.opponentTotal.toFixed(0)}%`);
  console.info(`Player Health Average: ${stats.playerAverage.toFixed(1)}%`);
  console.info(`Opponent Health Average: ${stats.opponentAverage.toFixed(1)}%`);

  const livingSpirits = model.player.filter(s => !s.isKO);
  const koSpirits = model.player.filter(s => s.isKO);

  console.info(`Player Living: ${livingSpirits.length}/${model.player.length}`);
  console.info(`Player KO'd: ${koSpirits.length}/${model.player.length}`);

  const opponentLiving = model.opponent.filter(s => !s.isKO);
  const opponentKO = model.opponent.filter(s => s.isKO);

  console.info(`Opponent Living: ${opponentLiving.length}/${model.opponent.length}`);
  console.info(`Opponent KO'd: ${opponentKO.length}/${model.opponent.length}`);

  if (model.player.length > 0 || model.opponent.length > 0) {
    console.info(`\nPriority Order:`);
    const priorityOrder = HUDPureUtils.getSpiritsByPriority(model);
    priorityOrder.forEach((spirit, index) => {
      console.info(`  ${index + 1}. ${spirit.name} (${spirit.hpPercentage.toFixed(0)}% HP) ${spirit.isKO ? '[KO]' : ''}`);
    });
  }
}

function printHistory(updateHistory: IHUDUpdateEvent[]): void {
  if (updateHistory.length === 0) {
    console.info('📜 No updates in history');
    return;
  }

  console.info('\n📜 Update History (last 10):');
  updateHistory.slice(-10).forEach((event, index) => {
    const time = new Date(event.timestamp).toLocaleTimeString();
    const spiritInfo = event.spiritId ? ` [${event.spiritId}]` : '';
    console.info(`  ${updateHistory.length - 10 + index + 1}. ${time} - ${event.type}${spiritInfo}`);
  });

  if (updateHistory.length > 10) {
    console.info(`  ... and ${updateHistory.length - 10} more`);
  }
}

function createDemoData(): { hudManager: HUDManager; updateHistory: IHUDUpdateEvent[] } {
  console.info('🎮 Creating demo battle HUD...');

  // Create demo spirits
  const playerSpirits = [
    new SpiritHUDState('waterling', 'Waterling', 52, 60, [], 12, 'water'),
    new SpiritHUDState('sprout', 'Sprout', 0, 30, ['poison'], 8, 'grass')
  ];

  const opponentSpirits = [
    new SpiritHUDState('ember', 'Ember', 28, 45, [], 15, 'fire')
  ];

  const turnState = new TurnHUDState('SelectAction', 'waterling', 'water_burst -> ember', 1, 1);

  const hudModel = HUDPureUtils.createStandardHUD(playerSpirits, opponentSpirits, turnState);
  const renderer = new CLIHUDRenderer();
  const hudManager = new HUDManager(hudModel, renderer);

  const updateHistory: IHUDUpdateEvent[] = [];

  // Add update listener
  hudManager.onUpdate((event) => {
    updateHistory.push(event);
  });

  console.info('✅ Demo data created with battle in progress');
  return { hudManager, updateHistory };
}

function runDemo(state: CLIState): void {
  console.info('🎯 Running HUDPure Demo...\n');

  const demoData = createDemoData();
  state.hudManager = demoData.hudManager;
  state.updateHistory = demoData.updateHistory;

  console.info('Initial state:');
  console.info(state.hudManager.render());

  // Simulate damage resolution
  console.info('\n--- Simulating Damage Resolution ---');
  state.hudManager.updateSpirit('ember', { currentHP: 28 - 14 });

  console.info('\nAfter damage:');
  console.info(state.hudManager.render());

  // Change phase
  console.info('\n--- Changing to Resolution Phase ---');
  state.hudManager.changePhase('ResolveAction', 'waterling', 'water_burst -> ember (resolved)');

  console.info('\nAfter phase change:');
  console.info(state.hudManager.render());

  // Add status effect
  console.info('\n--- Adding Status Effects ---');
  state.hudManager.updateSpirit('ember', { statusEffects: ['burn'] });

  console.info('\nAfter status effect:');
  console.info(state.hudManager.render());

  console.info('\n✅ Demo complete!');
}

function runSimulation(state: CLIState, turns: number): void {
  console.info(`🎲 Running ${turns} turn simulation...\n`);

  const model = state.hudManager.getModel();
  if (model.player.length === 0 || model.opponent.length === 0) {
    console.info('❌ Need both player and opponent spirits for simulation');
    return;
  }

  // Create a copy for simulation
  const simManager = new HUDManager(
    HUDPureUtils.createStandardHUD(
      model.player.map(s => new SpiritHUDState(s.spiritId, s.name, s.currentHP, s.maxHP, s.statusEffects)),
      model.opponent.map(s => new SpiritHUDState(s.spiritId, s.name, s.currentHP, s.maxHP, s.statusEffects))
    )
  );

  for (let turn = 1; turn <= turns; turn++) {
    console.info(`\n--- Turn ${turn} ---`);

    // Random action phase
    const randomPlayer = simManager.getModel().player.filter(s => !s.isKO)[Math.floor(Math.random() * Math.max(1, simManager.getModel().player.filter(s => !s.isKO).length))];
    const randomOpponent = simManager.getModel().opponent.filter(s => !s.isKO)[Math.floor(Math.random() * Math.max(1, simManager.getModel().opponent.filter(s => !s.isKO).length))];

    if (randomPlayer && randomOpponent) {
      simManager.changePhase('SelectAction', randomPlayer.spiritId, `${randomPlayer.name}_attack -> ${randomOpponent.name}`);

      // Simulate damage
      const damage = Math.floor(Math.random() * 20) + 5;
      simManager.updateSpirit(randomOpponent.spiritId, { currentHP: Math.max(0, randomOpponent.currentHP - damage) });

      console.info(`  ${randomPlayer.name} attacks ${randomOpponent.name} for ${damage} damage!`);
      console.info(`  ${randomOpponent.name} HP: ${Math.max(0, randomOpponent.currentHP - damage)}/${randomOpponent.maxHP}`);
    }

    // Check for KO
    const livingOpponents = simManager.getModel().opponent.filter(s => !s.isKO);
    if (livingOpponents.length === 0) {
      console.info('  🎉 All opponents defeated! Battle simulation ends.');
      break;
    }

    // Add random status effect occasionally
    if (Math.random() < 0.3) {
      const statusEffects = ['poison', 'burn', 'freeze', 'stun', 'regen'];
      const randomEffect = statusEffects[Math.floor(Math.random() * statusEffects.length)];
      const targetSpirit = [...simManager.getModel().player, ...simManager.getModel().opponent]
        .filter(s => !s.isKO)[Math.floor(Math.random() * Math.max(1, simManager.getModel().player.length + simManager.getModel().opponent.length))];

      if (targetSpirit && !targetSpirit.hasStatusEffect(randomEffect)) {
        simManager.updateSpirit(targetSpirit.spiritId, { statusEffects: [...targetSpirit.statusEffects, randomEffect] });
        console.info(`  ${targetSpirit.name} gets ${randomEffect} status effect!`);
      }
    }
  }

  // Update main state with simulation results
  state.hudManager = simManager;
  console.info('\n✅ Simulation complete!');
  console.info(state.hudManager.render());
}

async function runCLI(): Promise<void> {
  const initialModel = HUDPureUtils.createStandardHUD([], [], { phaseName: 'Setup' });
  const renderer = new CLIHUDRenderer();
  const hudManager = new HUDManager(initialModel, renderer);

  const state: CLIState = {
    hudManager,
    updateHistory: [],
    simulationMode: false
  };

  // Add update listener
  hudManager.onUpdate((event) => {
    state.updateHistory.push(event);
  });

  console.info('🎮 HUDPure CLI - Type "help" for commands or "demo" to see battle HUD in action\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'hud> '
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

      case 'render':
        console.info('\n' + state.hudManager.render());
        break;

      case 'add':
        if (args.length < 4) {
          console.info('❌ Usage: add <side> <spirit_id> <name> <max_hp> [current_hp] [level] [element]');
        } else {
          const side = args[0];
          const spiritId = args[1];
          const name = args[2];
          const maxHP = parseInt(args[3]);
          const currentHP = args[4] ? parseInt(args[4]) : maxHP;
          const level = args[5] ? parseInt(args[5]) : undefined;
          const element = args[6];

          if (isNaN(maxHP) || maxHP <= 0) {
            console.info('❌ Max HP must be a positive number');
          } else if (isNaN(currentHP) || currentHP < 0) {
            console.info('❌ Current HP must be a non-negative number');
          } else {
            const spirit = HUDPureUtils.createSpirit(spiritId, name, currentHP, maxHP, { level, element });
            const success = state.hudManager['model'].addSpirit(spirit, side as 'player' | 'opponent');
            console.info(success ? `✅ Added ${name} to ${side}` : '❌ Failed to add spirit');
          }
        }
        break;

      case 'update':
        if (args.length < 2) {
          console.info('❌ Usage: update <spirit_id> <current_hp>');
        } else {
          const spiritId = args[0];
          const currentHP = parseInt(args[1]);

          if (isNaN(currentHP) || currentHP < 0) {
            console.info('❌ Current HP must be a non-negative number');
          } else {
            const success = state.hudManager.updateSpirit(spiritId, { currentHP });
            console.info(success ? `✅ Updated ${spiritId} HP to ${currentHP}` : '❌ Spirit not found');
          }
        }
        break;

      case 'damage':
        if (args.length < 2) {
          console.info('❌ Usage: damage <spirit_id> <amount>');
        } else {
          const spiritId = args[0];
          const amount = parseInt(args[1]);

          if (isNaN(amount) || amount <= 0) {
            console.info('❌ Damage amount must be a positive number');
          } else {
            const model = state.hudManager.getModel();
            const spirit = model.player.find(s => s.spiritId === spiritId) || model.opponent.find(s => s.spiritId === spiritId);
            if (spirit) {
              const actualDamage = spirit.takeDamage(amount);
              state.hudManager.updateSpirit(spiritId, { currentHP: spirit.currentHP });
              console.info(`✅ ${spirit.name} takes ${actualDamage} damage (${spirit.currentHP}/${spirit.maxHP} HP remaining)`);
            } else {
              console.info('❌ Spirit not found');
            }
          }
        }
        break;

      case 'heal':
        if (args.length < 2) {
          console.info('❌ Usage: heal <spirit_id> <amount>');
        } else {
          const spiritId = args[0];
          const amount = parseInt(args[1]);

          if (isNaN(amount) || amount <= 0) {
            console.info('❌ Heal amount must be a positive number');
          } else {
            const model = state.hudManager.getModel();
            const spirit = model.player.find(s => s.spiritId === spiritId) || model.opponent.find(s => s.spiritId === spiritId);
            if (spirit) {
              const actualHeal = spirit.heal(amount);
              state.hudManager.updateSpirit(spiritId, { currentHP: spirit.currentHP });
              console.info(`✅ ${spirit.name} heals ${actualHeal} HP (${spirit.currentHP}/${spirit.maxHP} HP)`);
            } else {
              console.info('❌ Spirit not found');
            }
          }
        }
        break;

      case 'status':
        if (args.length < 2) {
          console.info('❌ Usage: status <spirit_id> <effect>');
        } else {
          const spiritId = args[0];
          const effect = args[1];

          const model = state.hudManager.getModel();
          const spirit = model.player.find(s => s.spiritId === spiritId) || model.opponent.find(s => s.spiritId === spiritId);
          if (spirit) {
            if (spirit.hasStatusEffect(effect)) {
              spirit.removeStatusEffect(effect);
              state.hudManager.updateSpirit(spiritId, { statusEffects: spirit.statusEffects });
              console.info(`✅ Removed ${effect} from ${spirit.name}`);
            } else {
              spirit.addStatusEffect(effect);
              state.hudManager.updateSpirit(spiritId, { statusEffects: spirit.statusEffects });
              console.info(`✅ Added ${effect} to ${spirit.name}`);
            }
          } else {
            console.info('❌ Spirit not found');
          }
        }
        break;

      case 'phase':
        const phaseName = args[0];
        const activeSpiritId = args[1];

        if (!phaseName) {
          console.info('❌ Usage: phase <phase_name> [active_spirit_id]');
        } else {
          state.hudManager.changePhase(phaseName, activeSpiritId, `Action in ${phaseName} phase`);
          console.info(`✅ Changed to phase: ${phaseName}${activeSpiritId ? ` (active: ${activeSpiritId})` : ''}`);
        }
        break;

      case 'turn':
        if (args.length === 0) {
          console.info('❌ Usage: turn <number>');
        } else {
          const turnNumber = parseInt(args[0]);
          if (isNaN(turnNumber) || turnNumber < 0) {
            console.info('❌ Turn number must be a non-negative integer');
          } else {
            state.hudManager.updateTurn({ turnNumber });
            console.info(`✅ Set turn number to ${turnNumber}`);
          }
        }
        break;

      case 'round':
        if (args.length === 0) {
          console.info('❌ Usage: round <number>');
        } else {
          const roundNumber = parseInt(args[0]);
          if (isNaN(roundNumber) || roundNumber < 0) {
            console.info('❌ Round number must be a non-negative integer');
          } else {
            state.hudManager.updateTurn({ roundNumber });
            console.info(`✅ Set round number to ${roundNumber}`);
          }
        }
        break;

      case 'clear':
        state.hudManager.clear();
        state.updateHistory.length = 0;
        console.info('✅ HUD cleared');
        break;

      case 'demo':
        runDemo(state);
        break;

      case 'simulate':
        if (args.length === 0) {
          console.info('❌ Usage: simulate <turns>');
        } else {
          const turns = parseInt(args[0]);
          if (isNaN(turns) || turns <= 0) {
            console.info('❌ Turns must be a positive number');
          } else {
            runSimulation(state, turns);
          }
        }
        break;

      case 'history':
        printHistory(state.updateHistory);
        break;

      case 'stats':
        printStats(state);
        break;

      case 'quit':
      case 'exit':
      case 'q':
        console.info('👋 Goodbye!');
        rl.close();
        process.exit(0);

      default:
        if (command !== '') {
          console.info(`❌ Unknown command: ${command}. Type 'help' for available commands.`);
        }
    }

    rl.prompt();
  });

  rl.on('SIGINT', () => {
    console.info('\n👋 Goodbye!');
    rl.close();
    process.exit(0);
  });
}

// Main execution
if (require.main === module) {
  runCLI().catch(error => {
    console.error('❌ CLI Error:', error);
    process.exit(1);
  });
}