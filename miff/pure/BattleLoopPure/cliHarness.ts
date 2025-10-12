#!/usr/bin/env node

/**
 * BattleLoopPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the BattleLoopPure battle loop management system.
 */

import * as readline from 'readline';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import {
  BattlePhaseManager,
  BattleAction,
  BattlePhase,
  BattleLoopManager,
  BattleLoopConfig,
  BattleState
} from './index';

// Mock RNG Provider for CLI
class MockRNGProvider {
  private logger: StructuredLogger;
  private seed: number = 0;

  setSeed(seed: number): void {
    this.seed = seed;
  }

  nextInt(min: number = 0, max: number = 100): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return Math.floor((this.seed / 233280) * (max - min)) + min;
  }

  nextFloat(min: number = 0, max: number = 1): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return ((this.seed / 233280) * (max - min)) + min;
  }

  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// CLI Application
class BattleLoopPureCLI {
  private rl: readline.Interface;
  private controller: BattleLoopManager;
  private availableActors: number[] = [1, 2]; // Player and AI
  private availableMoves: Record<number, string[]> = {
    1: ['attack', 'defend', 'heal', 'special'],
    2: ['attack', 'defend', 'heal', 'special']
  };
  private battleHistory: BattleState[] = [];
  private currentTurn: number = 0;

  constructor() {
    this.logger = new StructuredLogger({ module: 'MockRNGProvider' });
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const rng = new MockRNGProvider();
    this.controller = new BattleLoopManager();

    this.initializeDemo();
  }

  /**
   * Initialize demo data
   */
  private initializeDemo(): void {
    this.logger.info('Initializing BattleLoopPure CLI...');

    // Create a simple action selector for demo
    const actionSelector = (actorId: number, availableMoves: string[]) => {
      const moveIndex = Math.floor(Math.random() * availableMoves.length);
      const moveId = availableMoves[moveIndex];

      return actorId === 1 
        ? BattleAction.player(actorId, actorId === 1 ? 2 : 1, moveId, 50)
        : BattleAction.ai(actorId, actorId === 1 ? 2 : 1, moveId, 50);
    };

    // Run a few demo turns
    this.runDemoTurns(actionSelector);
  }

  /**
   * Run demo turns
   */
  private runDemoTurns(actionSelector: (actorId: number, availableMoves: string[]) => BattleAction): void {
    this.logger.info('Running demo battle turns...');

    for (let i = 0; i < 3; i++) {
      const seed = 1000 + i;
      // Start the battle if not already active
      if (!this.controller.getState().isActive) {
        this.controller.start();
      }

      // Advance to next turn
      this.controller.nextTurn();
      
      const state = this.controller.getState();
      this.battleHistory.push(state);
      this.currentTurn = state.currentTurn;

      this.logger.info(`Demo Turn ${state.currentTurn} completed. Active: ${state.isActive}`);
    }

    this.logger.info('Demo completed. Use "battle" command to run custom battles.');
  }

  /**
   * Start CLI application
   */
  start(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('⚔️ BattleLoopPure CLI - Battle Loop Management System');
    this.logger.info('='.repeat(60));
    this.logger.info('');
    this.logger.info('Available commands:');
    this.logger.info('  battle [turns]    - Run battle simulation');
    this.logger.info('  phase             - Show current phase');
    this.logger.info('  state             - Show current battle state');
    this.logger.info('  history           - Show battle history');
    this.logger.info('  stats             - Show battle statistics');
    this.logger.info('  actors            - Show available actors');
    this.logger.info('  moves             - Show available moves');
    this.logger.info('  addactor [id]     - Add actor to battle');
    this.logger.info('  addmove [actor] [move] - Add move to actor');
    this.logger.info('  clear             - Clear battle state');
    this.logger.info('  demo              - Run demo battle');
    this.logger.info('  help              - Show this help');
    this.logger.info('  exit              - Exit application');
    this.logger.info('');

    this.showPrompt();
  }

  /**
   * Show command prompt
   */
  private showPrompt(): void {
    this.rl.question('BattleLoop> ', (input) => {
      this.processCommand(input.trim());
    });
  }

  /**
   * Process user command
   */
  private async processCommand(input: string): Promise<void> {
    if (!input) {
      this.showPrompt();
      return;
    }

    const parts = input.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'help':
        case 'h':
          this.showHelp();
          break;
        case 'battle':
        case 'b':
          await this.runBattle(args);
          break;
        case 'phase':
        case 'p':
          this.showCurrentPhase();
          break;
        case 'state':
        case 's':
          this.showBattleState();
          break;
        case 'history':
        case 'hist':
          this.showBattleHistory();
          break;
        case 'stats':
          this.showStatistics();
          break;
        case 'actors':
        case 'a':
          this.showActors();
          break;
        case 'moves':
        case 'm':
          this.showMoves();
          break;
        case 'addactor':
          this.addActor(args);
          break;
        case 'addmove':
          this.addMove(args);
          break;
        case 'clear':
        case 'c':
          this.clearBattle();
          break;
        case 'demo':
        case 'd':
          this.runDemo();
          break;
        case 'exit':
        case 'quit':
        case 'q':
          this.exit();
          return;
        default:
          this.logger.info(`❌ Unknown command: ${command}`);
          this.logger.info('Type "help" for available commands.');
      }
    } catch (error) {
      this.logger.info(`❌ Error: ${error}`);
    }

    this.showPrompt();
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('📚 BattleLoopPure CLI Help');
    this.logger.info('='.repeat(60));
    this.logger.info('');
    this.logger.info('Commands:');
    this.logger.info('  help                    - Show this help');
    this.logger.info('  battle [turns]          - Run battle simulation');
    this.logger.info('  phase                   - Show current phase');
    this.logger.info('  state                   - Show current battle state');
    this.logger.info('  history                 - Show battle history');
    this.logger.info('  stats                   - Show battle statistics');
    this.logger.info('  actors                  - Show available actors');
    this.logger.info('  moves                   - Show available moves');
    this.logger.info('  addactor [id]           - Add actor to battle');
    this.logger.info('  addmove [actor] [move]  - Add move to actor');
    this.logger.info('  clear                   - Clear battle state');
    this.logger.info('  demo                    - Run demo battle');
    this.logger.info('  exit                    - Exit the application');
    this.logger.info('');
    this.logger.info('Examples:');
    this.logger.info('  battle 5                - Run 5-turn battle');
    this.logger.info('  addactor 3              - Add actor with ID 3');
    this.logger.info('  addmove 1 fireball      - Add fireball move to actor 1');
    this.logger.info('  state                   - Show current state');
    this.logger.info('');
  }

  /**
   * Run battle simulation
   */
  private async runBattle(args: string[]): Promise<void> {
    const turnCount = parseInt(args[0]) || 3;

    this.logger.info(`⚔️ Starting battle simulation for ${turnCount} turns...`);

    const actionSelector = (actorId: number, availableMoves: string[]) => {
      // Simple AI: choose random move
      const moveIndex = Math.floor(Math.random() * availableMoves.length);
      const moveId = availableMoves[moveIndex];

      const targetId = actorId === 1 ? 2 : 1; // Target opposite actor

      return actorId === 1 
        ? BattleAction.player(actorId, targetId, moveId, 50)
        : BattleAction.ai(actorId, targetId, moveId, 50);
    };

    for (let turn = 1; turn <= turnCount; turn++) {
      const seed = Date.now() + turn;
      this.logger.info(`📍 Turn ${turn} (Seed: ${seed})`);

      // Start the battle if not already active
      if (!this.controller.getState().isActive) {
        this.controller.start();
      }

      // Advance to next turn
      this.controller.nextTurn();
      
      const state = this.controller.getState();
      this.battleHistory.push(state);
      this.currentTurn = state.currentTurn;

      this.logger.info(`   Turn: ${state.currentTurn}`);
      this.logger.info(`   Active: ${state.isActive}`);
      this.logger.info(`   Paused: ${state.isPaused}`);

      if (state.winner) {
        this.logger.info(`🏁 Battle ended: Winner ${state.winner} (${state.reason})`);
        break;
      }

      // Small delay for readability
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.logger.info('✅ Battle simulation completed!');
  }

  /**
   * Show current phase
   */
  private showCurrentPhase(): void {
    const state = this.controller.getState();
    this.logger.info('='.repeat(60));
    this.logger.info('📍 Current Battle State');
    this.logger.info('='.repeat(60));

    this.logger.info(`Current Turn: ${state.currentTurn}`);
    this.logger.info(`Active: ${state.isActive}`);
    this.logger.info(`Paused: ${state.isPaused}`);
    if (state.winner) {
      this.logger.info(`Winner: ${state.winner} (${state.reason})`);
    }
  }

  /**
   * Show current battle state
   */
  private showBattleState(): void {
    const state = this.controller.getState();

    this.logger.info('='.repeat(60));
    this.logger.info('📊 Current Battle State');
    this.logger.info('='.repeat(60));

    this.logger.info(`Current Turn: ${state.currentTurn}`);
    this.logger.info(`Active: ${state.isActive}`);
    this.logger.info(`Paused: ${state.isPaused}`);
    if (state.winner) {
      this.logger.info(`Winner: ${state.winner} (${state.reason})`);
    }

    this.logger.info('Battle History:');
    this.battleHistory.slice(-3).forEach((historyState, index) => {
      this.logger.info(`  ${index + 1}. Turn ${historyState.currentTurn} - Active: ${historyState.isActive}`);
    });
  }

  /**
   * Show battle history
   */
  private showBattleHistory(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('📜 Battle History');
    this.logger.info('='.repeat(60));

    if (this.battleHistory.length === 0) {
      this.logger.info('No battle history available.');
      return;
    }

    this.battleHistory.forEach((state, index) => {
      this.logger.info(`Turn ${state.currentTurn}:`);
      this.logger.info(`  Active: ${state.isActive}`);
      this.logger.info(`  Paused: ${state.isPaused}`);
      if (state.winner) {
        this.logger.info(`  Winner: ${state.winner} (${state.reason})`);
      }
      this.logger.info('');
    });

    this.logger.info(`Total Turns: ${this.battleHistory.length}`);
    this.logger.info(`Current Turn: ${this.currentTurn}`);
  }

  /**
   * Show battle statistics
   */
  private showStatistics(): void {
    const state = this.controller.getState();
    const config = this.controller.getConfig();

    this.logger.info('='.repeat(60));
    this.logger.info('📈 Battle Statistics');
    this.logger.info('='.repeat(60));

    this.logger.info(`Current Turn: ${state.currentTurn}`);
    this.logger.info(`Max Turns: ${config.maxTurns}`);
    this.logger.info(`Timeout: ${config.timeoutMs}ms`);
    this.logger.info(`Auto Resolve: ${config.enableAutoResolve}`);
    this.logger.info(`Replay Enabled: ${config.enableReplay}`);
    this.logger.info(`Battle History: ${this.battleHistory.length} turns`);
  }

  /**
   * Show available actors
   */
  private showActors(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('👥 Available Actors');
    this.logger.info('='.repeat(60));

    this.logger.info(`Total Actors: ${this.availableActors.length}`);
    this.availableActors.forEach((actorId, index) => {
      const moves = this.availableMoves[actorId] || [];
      this.logger.info(`${index + 1}. Actor ${actorId} - Moves: ${moves.join(', ')}`);
    });
  }

  /**
   * Show available moves
   */
  private showMoves(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('🎯 Available Moves');
    this.logger.info('='.repeat(60));

    this.logger.info('Moves by Actor:');
    Object.entries(this.availableMoves).forEach(([actorId, moves]) => {
      this.logger.info(`Actor ${actorId}: ${moves.join(', ')}`);
    });

    this.logger.info('All Moves:');
    const allMoves = Array.from(new Set(
      Object.values(this.availableMoves).flat()
    )).sort();

    allMoves.forEach((move, index) => {
      const actors = Object.entries(this.availableMoves)
        .filter(([, moves]) => moves.includes(move))
        .map(([actorId]) => actorId);

      this.logger.info(`${index + 1}. ${move} (Actors: ${actors.join(', ')})`);
    });
  }

  /**
   * Add actor to battle
   */
  private addActor(args: string[]): void {
    if (args.length === 0) {
      this.logger.info('❌ Usage: addactor [actor_id]');
      return;
    }

    const actorId = parseInt(args[0]);
    if (isNaN(actorId) || actorId <= 0) {
      this.logger.info('❌ Invalid actor ID. Must be a positive number.');
      return;
    }

    if (this.availableActors.includes(actorId)) {
      this.logger.info(`❌ Actor ${actorId} already exists.`);
      return;
    }

    this.availableActors.push(actorId);
    this.availableMoves[actorId] = ['attack', 'defend']; // Default moves

    this.logger.info(`✅ Added Actor ${actorId} with default moves: attack, defend`);
  }

  /**
   * Add move to actor
   */
  private addMove(args: string[]): void {
    if (args.length < 2) {
      this.logger.info('❌ Usage: addmove [actor_id] [move_name]');
      return;
    }

    const actorId = parseInt(args[0]);
    const moveName = args[1];

    if (!this.availableActors.includes(actorId)) {
      this.logger.info(`❌ Actor ${actorId} not found. Use "addactor" first.`);
      return;
    }

    if (!this.availableMoves[actorId]) {
      this.availableMoves[actorId] = [];
    }

    if (this.availableMoves[actorId].includes(moveName)) {
      this.logger.info(`❌ Move "${moveName}" already exists for actor ${actorId}.`);
      return;
    }

    this.availableMoves[actorId].push(moveName);
    this.logger.info(`✅ Added move "${moveName}" to actor ${actorId}`);
  }

  /**
   * Clear battle state
   */
  private clearBattle(): void {
    this.controller.stop();
    this.battleHistory = [];
    this.currentTurn = 0;

    this.logger.info('🗑️ Battle state cleared');
    this.logger.info('Use "demo" to run a new demo or "battle" to start a custom battle.');
  }

  /**
   * Run demo battle
   */
  private runDemo(): void {
    this.clearBattle();

    const actionSelector = (actorId: number, availableMoves: string[]) => {
      const moveIndex = Math.floor(Math.random() * availableMoves.length);
      const moveId = availableMoves[moveIndex];

      return actorId === 1 
        ? BattleAction.player(actorId, actorId === 1 ? 2 : 1, moveId, 50)
        : BattleAction.ai(actorId, actorId === 1 ? 2 : 1, moveId, 50);
    };

    this.runDemoTurns(actionSelector);
  }

  /**
   * Exit application
   */
  private exit(): void {
    this.logger.info('');
    this.logger.info('👋 Thank you for using BattleLoopPure CLI!');
    this.rl.close();
    process.exit(0);
  }
}

// Start CLI if run directly
if (require.main === module) {
  const cli = new BattleLoopPureCLI();
  cli.start();
}

export { BattleLoopPureCLI };