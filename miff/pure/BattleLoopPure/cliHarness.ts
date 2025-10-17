#!/usr/bin/env node

/**
 * BattleLoopPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the BattleLoopPure battle loop management system.
 */

import * as readline from 'readline';
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

  shuffle<T extends object>(array: T[]): T[] {
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
    console.log('Initializing BattleLoopPure CLI...');

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
    console.log('Running demo battle turns...');

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

      console.log(`Demo Turn ${state.currentTurn} completed. Active: ${state.isActive}`);
    }

    console.log('Demo completed. Use "battle" command to run custom battles.');
  }

  /**
   * Start CLI application
   */
  start(): void {
    console.log('='.repeat(60));
    console.log('⚔️ BattleLoopPure CLI - Battle Loop Management System');
    console.log('='.repeat(60));
    console.log('');
    console.log('Available commands:');
    console.log('  battle [turns]    - Run battle simulation');
    console.log('  phase             - Show current phase');
    console.log('  state             - Show current battle state');
    console.log('  history           - Show battle history');
    console.log('  stats             - Show battle statistics');
    console.log('  actors            - Show available actors');
    console.log('  moves             - Show available moves');
    console.log('  addactor [id]     - Add actor to battle');
    console.log('  addmove [actor] [move] - Add move to actor');
    console.log('  clear             - Clear battle state');
    console.log('  demo              - Run demo battle');
    console.log('  help              - Show this help');
    console.log('  exit              - Exit application');
    console.log('');

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
          console.log(`❌ Unknown command: ${command}`);
          console.log('Type "help" for available commands.');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.log(`❌ Error: ${error}`);
    }

    this.showPrompt();
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log('='.repeat(60));
    console.log('📚 BattleLoopPure CLI Help');
    console.log('='.repeat(60));
    console.log('');
    console.log('Commands:');
    console.log('  help                    - Show this help');
    console.log('  battle [turns]          - Run battle simulation');
    console.log('  phase                   - Show current phase');
    console.log('  state                   - Show current battle state');
    console.log('  history                 - Show battle history');
    console.log('  stats                   - Show battle statistics');
    console.log('  actors                  - Show available actors');
    console.log('  moves                   - Show available moves');
    console.log('  addactor [id]           - Add actor to battle');
    console.log('  addmove [actor] [move]  - Add move to actor');
    console.log('  clear                   - Clear battle state');
    console.log('  demo                    - Run demo battle');
    console.log('  exit                    - Exit the application');
    console.log('');
    console.log('Examples:');
    console.log('  battle 5                - Run 5-turn battle');
    console.log('  addactor 3              - Add actor with ID 3');
    console.log('  addmove 1 fireball      - Add fireball move to actor 1');
    console.log('  state                   - Show current state');
    console.log('');
  }

  /**
   * Run battle simulation
   */
  private async runBattle(args: string[]): Promise<void> {
    const turnCount = parseInt(args[0]) || 3;

    console.log(`⚔️ Starting battle simulation for ${turnCount} turns...`);

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
      console.log(`📍 Turn ${turn} (Seed: ${seed})`);

      // Start the battle if not already active
      if (!this.controller.getState().isActive) {
        this.controller.start();
      }

      // Advance to next turn
      this.controller.nextTurn();
      
      const state = this.controller.getState();
      this.battleHistory.push(state);
      this.currentTurn = state.currentTurn;

      console.log(`   Turn: ${state.currentTurn}`);
      console.log(`   Active: ${state.isActive}`);
      console.log(`   Paused: ${state.isPaused}`);

      if (state.winner) {
        console.log(`🏁 Battle ended: Winner ${state.winner} (${state.reason})`);
        break;
      }

      // Small delay for readability
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('✅ Battle simulation completed!');
  }

  /**
   * Show current phase
   */
  private showCurrentPhase(): void {
    const state = this.controller.getState();
    console.log('='.repeat(60));
    console.log('📍 Current Battle State');
    console.log('='.repeat(60));

    console.log(`Current Turn: ${state.currentTurn}`);
    console.log(`Active: ${state.isActive}`);
    console.log(`Paused: ${state.isPaused}`);
    if (state.winner) {
      console.log(`Winner: ${state.winner} (${state.reason})`);
    }
  }

  /**
   * Show current battle state
   */
  private showBattleState(): void {
    const state = this.controller.getState();

    console.log('='.repeat(60));
    console.log('📊 Current Battle State');
    console.log('='.repeat(60));

    console.log(`Current Turn: ${state.currentTurn}`);
    console.log(`Active: ${state.isActive}`);
    console.log(`Paused: ${state.isPaused}`);
    if (state.winner) {
      console.log(`Winner: ${state.winner} (${state.reason})`);
    }

    console.log('Battle History:');
    this.battleHistory.slice(-3).forEach((historyState, index) => {
      console.log(`  ${index + 1}. Turn ${historyState.currentTurn} - Active: ${historyState.isActive}`);
    });
  }

  /**
   * Show battle history
   */
  private showBattleHistory(): void {
    console.log('='.repeat(60));
    console.log('📜 Battle History');
    console.log('='.repeat(60));

    if (this.battleHistory.length === 0) {
      console.log('No battle history available.');
      return;
    }

    this.battleHistory.forEach((state, index) => {
      console.log(`Turn ${state.currentTurn}:`);
      console.log(`  Active: ${state.isActive}`);
      console.log(`  Paused: ${state.isPaused}`);
      if (state.winner) {
        console.log(`  Winner: ${state.winner} (${state.reason})`);
      }
      console.log('');
    });

    console.log(`Total Turns: ${this.battleHistory.length}`);
    console.log(`Current Turn: ${this.currentTurn}`);
  }

  /**
   * Show battle statistics
   */
  private showStatistics(): void {
    const state = this.controller.getState();
    const config = this.controller.getConfig();

    console.log('='.repeat(60));
    console.log('📈 Battle Statistics');
    console.log('='.repeat(60));

    console.log(`Current Turn: ${state.currentTurn}`);
    console.log(`Max Turns: ${config.maxTurns}`);
    console.log(`Timeout: ${config.timeoutMs}ms`);
    console.log(`Auto Resolve: ${config.enableAutoResolve}`);
    console.log(`Replay Enabled: ${config.enableReplay}`);
    console.log(`Battle History: ${this.battleHistory.length} turns`);
  }

  /**
   * Show available actors
   */
  private showActors(): void {
    console.log('='.repeat(60));
    console.log('👥 Available Actors');
    console.log('='.repeat(60));

    console.log(`Total Actors: ${this.availableActors.length}`);
    this.availableActors.forEach((actorId, index) => {
      const moves = this.availableMoves[actorId] || [];
      console.log(`${index + 1}. Actor ${actorId} - Moves: ${moves.join(', ')}`);
    });
  }

  /**
   * Show available moves
   */
  private showMoves(): void {
    console.log('='.repeat(60));
    console.log('🎯 Available Moves');
    console.log('='.repeat(60));

    console.log('Moves by Actor:');
    Object.entries(this.availableMoves).forEach(([actorId, moves]) => {
      console.log(`Actor ${actorId}: ${moves.join(', ')}`);
    });

    console.log('All Moves:');
    const allMoves = Array.from(new Set(
      Object.values(this.availableMoves).flat()
    )).sort();

    allMoves.forEach((move, index) => {
      const actors = Object.entries(this.availableMoves)
        .filter(([, moves]) => moves.includes(move))
        .map(([actorId]) => actorId);

      console.log(`${index + 1}. ${move} (Actors: ${actors.join(', ')})`);
    });
  }

  /**
   * Add actor to battle
   */
  private addActor(args: string[]): void {
    if (args.length === 0) {
      console.log('❌ Usage: addactor [actor_id]');
      return;
    }

    const actorId = parseInt(args[0]);
    if (isNaN(actorId) || actorId <= 0) {
      console.log('❌ Invalid actor ID. Must be a positive number.');
      return;
    }

    if (this.availableActors.includes(actorId)) {
      console.log(`❌ Actor ${actorId} already exists.`);
      return;
    }

    this.availableActors.push(actorId);
    this.availableMoves[actorId] = ['attack', 'defend']; // Default moves

    console.log(`✅ Added Actor ${actorId} with default moves: attack, defend`);
  }

  /**
   * Add move to actor
   */
  private addMove(args: string[]): void {
    if (args.length < 2) {
      console.log('❌ Usage: addmove [actor_id] [move_name]');
      return;
    }

    const actorId = parseInt(args[0]);
    const moveName = args[1];

    if (!this.availableActors.includes(actorId)) {
      console.log(`❌ Actor ${actorId} not found. Use "addactor" first.`);
      return;
    }

    if (!this.availableMoves[actorId]) {
      this.availableMoves[actorId] = [];
    }

    if (this.availableMoves[actorId].includes(moveName)) {
      console.log(`❌ Move "${moveName}" already exists for actor ${actorId}.`);
      return;
    }

    this.availableMoves[actorId].push(moveName);
    console.log(`✅ Added move "${moveName}" to actor ${actorId}`);
  }

  /**
   * Clear battle state
   */
  private clearBattle(): void {
    this.controller.stop();
    this.battleHistory = [];
    this.currentTurn = 0;

    console.log('🗑️ Battle state cleared');
    console.log('Use "demo" to run a new demo or "battle" to start a custom battle.');
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
    console.log('');
    console.log('👋 Thank you for using BattleLoopPure CLI!');
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