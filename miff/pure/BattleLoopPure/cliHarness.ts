#!/usr/bin/env node

/**
 * BattleLoopPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the BattleLoopPure battle loop management system.
 */

import * as readline from 'readline';
import {
  BattleLoopController,
  BattlePhaseManager,
  ActionQueue,
  BattleEndManager,
  BattleAction,
  BattleResult,
  BattlePhase,
  ActionSource,
  BattleLoopUtils,
  IBattleState,
  ActionSelector
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
  private controller: BattleLoopController;
  private availableActors: number[] = [1, 2]; // Player and AI
  private availableMoves: Record<number, string[]> = {
    1: ['attack', 'defend', 'heal', 'special'],
    2: ['attack', 'defend', 'heal', 'special']
  };
  private battleHistory: IBattleState[] = [];
  private currentTurn: number = 0;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const rng = new MockRNGProvider();
    this.controller = new BattleLoopController(rng);

    this.initializeDemo();
  }

  /**
   * Initialize demo data
   */
  private initializeDemo(): void {
    console.log('Initializing BattleLoopPure CLI...');

    // Create a simple action selector for demo
    const actionSelector: ActionSelector = (actorId: number, availableMoves: string[]) => {
      const moveIndex = Math.floor(Math.random() * availableMoves.length);
      const moveId = availableMoves[moveIndex];

      return BattleAction.create(
        actorId,
        actorId === 1 ? 2 : 1, // Target opposite actor
        moveId,
        0,
        50,
        actorId === 1 ? ActionSource.PLAYER : ActionSource.AI,
        `Selected by ${actorId === 1 ? 'player' : 'AI'}`
      );
    };

    // Run a few demo turns
    this.runDemoTurns(actionSelector);
  }

  /**
   * Run demo turns
   */
  private runDemoTurns(actionSelector: ActionSelector): void {
    console.log('Running demo battle turns...');

    for (let i = 0; i < 3; i++) {
      const seed = 1000 + i;
      const state = this.controller.executeTurn(
        seed,
        actionSelector,
        this.availableActors,
        this.availableMoves
      );

      this.battleHistory.push(state);
      this.currentTurn = state.turnNumber;

      console.log(`Demo Turn ${state.turnNumber} completed. Phase: ${state.currentPhase}`);
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
    } catch (error) {
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

    const actionSelector: ActionSelector = (actorId: number, availableMoves: string[]) => {
      // Simple AI: choose random move
      const moveIndex = Math.floor(Math.random() * availableMoves.length);
      const moveId = availableMoves[moveIndex];

      const targetId = actorId === 1 ? 2 : 1; // Target opposite actor

      return BattleAction.create(
        actorId,
        targetId,
        moveId,
        0,
        50,
        actorId === 1 ? ActionSource.PLAYER : ActionSource.AI,
        `Selected by ${actorId === 1 ? 'player' : 'AI'}`
      );
    };

    for (let turn = 1; turn <= turnCount; turn++) {
      const seed = Date.now() + turn;
      console.log(`📍 Turn ${turn} (Seed: ${seed})`);

      const state = this.controller.executeTurn(
        seed,
        actionSelector,
        this.availableActors,
        this.availableMoves
      );

      this.battleHistory.push(state);
      this.currentTurn = state.turnNumber;

      console.log(`   Phase: ${state.currentPhase}`);
      console.log(`   Actions this turn: ${state.actionsThisTurn.length}`);
      console.log(`   Pending actions: ${state.pendingActions.length}`);
      console.log(`   Processed actions: ${state.processedActions.length}`);

      if (state.battleResult !== BattleResult.ONGOING) {
        console.log(`🏁 Battle ended: ${state.battleResult}`);
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
    const state = this.controller.getBattleState();
    const phaseManager = this.controller.getPhaseManager();

    console.log('='.repeat(60));
    console.log('📍 Current Battle Phase');
    console.log('='.repeat(60));

    console.log(`Current Phase: ${state.currentPhase}`);
    console.log(`Description: ${BattlePhaseManager.getPhaseDescription(state.currentPhase)}`);
    console.log(`Turn Number: ${state.turnNumber}`);
    console.log(`Phase History: ${phaseManager.getPhaseHistory().join(' → ')}`);

    const phaseCounts = phaseManager.getPhaseHistory().reduce((counts: Record<string, number>, phase: string) => {
      counts[phase] = (counts[phase] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    console.log('Phase Counts:');
    Object.entries(phaseCounts).forEach(([phase, count]) => {
      console.log(`  ${phase}: ${count}`);
    });
  }

  /**
   * Show current battle state
   */
  private showBattleState(): void {
    const state = this.controller.getBattleState();

    console.log('='.repeat(60));
    console.log('📊 Current Battle State');
    console.log('='.repeat(60));

    console.log(`Turn Number: ${state.turnNumber}`);
    console.log(`Current Phase: ${state.currentPhase}`);
    console.log(`Battle Result: ${state.battleResult}`);
    console.log(`Start Time: ${new Date(state.startTime).toLocaleString()}`);

    if (state.endTime) {
      console.log(`End Time: ${new Date(state.endTime).toLocaleString()}`);
      console.log(`Duration: ${state.endTime - state.startTime}ms`);
    }

    console.log(`Actions This Turn: ${state.actionsThisTurn.length}`);
    console.log(`Pending Actions: ${state.pendingActions.length}`);
    console.log(`Processed Actions: ${state.processedActions.length}`);

    if (state.actionsThisTurn.length > 0) {
      console.log('Recent Actions:');
      state.actionsThisTurn.slice(-3).forEach((action: any, index: number) => {
        console.log(`  ${index + 1}. ${action.getSummary()}`);
      });
    }

    if (state.metadata) {
      console.log('Metadata:');
      Object.entries(state.metadata).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }
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
      console.log(`Turn ${state.turnNumber}:`);
      console.log(`  Phase: ${state.currentPhase}`);
      console.log(`  Actions: ${state.actionsThisTurn.length}`);
      console.log(`  Pending: ${state.pendingActions.length}`);
      console.log(`  Processed: ${state.processedActions.length}`);
      console.log(`  Result: ${state.battleResult}`);

      if (state.actionsThisTurn.length > 0) {
        state.actionsThisTurn.forEach((action, actionIndex) => {
          console.log(`    Action ${actionIndex + 1}: ${action.getSummary()}`);
        });
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
    const stats = this.controller.getBattleStatistics();

    console.log('='.repeat(60));
    console.log('📈 Battle Statistics');
    console.log('='.repeat(60));

    console.log(`Total Actions: ${stats.totalActions}`);
    console.log(`Average Actions/Turn: ${stats.averageActionsPerTurn.toFixed(1)}`);
    console.log(`Battle Duration: ${stats.battleDuration}ms`);
    console.log(`Phases Executed: ${stats.phasesExecuted}`);

    console.log('Actions by Source:');
    Object.entries(stats.actionsBySource).forEach(([source, count]) => {
      console.log(`  ${source}: ${count}`);
    });

    console.log('Action Distribution:');
    const percentage = (count: number) => (count / stats.totalActions * 100).toFixed(1);
    Object.entries(stats.actionsBySource).forEach(([source, count]) => {
      console.log(`  ${source}: ${count} (${percentage(count)}%)`);
    });
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
    this.controller.reset();
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

    const actionSelector: ActionSelector = (actorId: number, availableMoves: string[]) => {
      const moveIndex = Math.floor(Math.random() * availableMoves.length);
      const moveId = availableMoves[moveIndex];

      return BattleAction.create(
        actorId,
        actorId === 1 ? 2 : 1,
        moveId,
        0,
        50,
        actorId === 1 ? ActionSource.PLAYER : ActionSource.AI,
        `Demo action by ${actorId === 1 ? 'player' : 'AI'}`
      );
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