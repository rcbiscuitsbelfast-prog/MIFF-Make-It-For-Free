#!/usr/bin/env node

/**
 * LogPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the LogPure logging and debugging system.
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import {
  BattleLogger,
  BattleLogEntry,
  BattleResult,
  BattleEffect,
  LogUtils,
  LogCategory,
  LogLevel,
  BattlePhase,
  LogOutputFormat,
  ILogFilter,
  IBattleAction,
  IBattleResult,
  IBattleEffect
} from './index';

// Custom logger that extends console
const customConsole = {
  ...console,
  logPhaseChange: (phase: BattlePhase) => {
    console.log(`🔄 Phase Change: ${phase}`);
  },
  logSystem: (message: string, category: LogCategory, level: LogLevel) => {
    console.log(`[${level}] ${category}: ${message}`);
  },
  logAction: (action: IBattleAction, result: IBattleResult) => {
    console.log(`⚔️ Action: ${action.moveId} -> ${result.damage || 0} damage`);
  },
  logEffect: (effect: IBattleEffect) => {
    console.log(`✨ Effect: ${effect.name} - ${effect.description}`);
  }
};

// CLI Application
class LogPureCLI {
  private rl: readline.Interface;
  private logger: BattleLogger;
  private logFile: string | null = null;
  private playbackMode: boolean = false;
  private playbackIndex: number = 0;

  constructor(...args: any[]) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.logger = new BattleLogger();
    this.initializeDemoData();
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    console.info('Initializing LogPure CLI with demo data...');

    // Simulate a battle log
    this.simulateBattleLog();
  }

  /**
   * Simulate battle log for demo
   */
  private simulateBattleLog(): void {
    // Log battle start
    customConsole.logPhaseChange(BattlePhase.PRE_TURN);

    // Simulate turn 1
    customConsole.logSystem('Battle started between Fire Spirit and Water Spirit', LogCategory.BATTLE, LogLevel.INFO);

    const action1: IBattleAction = {
      actorId: 1,
      targetId: 2,
      moveId: 'fire_blast',
      debugNotes: 'Type advantage: fire > water'
    };

    const result1: IBattleResult = BattleResult.withDamage(45);
    customConsole.logAction(action1, result1);

    customConsole.logEffect(BattleEffect.create('burn', 'Applied burn effect', 1, 2, { duration: 3 }));

    // Simulate turn 2
    console.logPhaseChange(BattlePhase.SELECT_ACTION);

    const action2: IBattleAction = {
      actorId: 2,
      targetId: 1,
      moveId: 'water_burst',
      debugNotes: 'Type advantage: water > fire'
    };

    const result2: IBattleResult = BattleResult.withDamage(35);
    console.logAction(action2, result2);

    // Simulate turn 3
    console.logPhaseChange(BattlePhase.RESOLVE_ACTION);

    const action3: IBattleAction = {
      actorId: 1,
      targetId: 2,
      moveId: 'basic_strike',
      debugNotes: 'Standard attack'
    };

    const result3: IBattleResult = BattleResult.withDamage(25);
    console.logAction(action3, result3);

    console.logSystem('Battle completed - Fire Spirit wins!', LogCategory.BATTLE, LogLevel.INFO);
  }

  /**
   * Start CLI application
   */
  start(): void {
    console.info('='.repeat(60));
    console.info('📝 LogPure CLI - Logging and Debugging System');
    console.info('='.repeat(60));
    console.info('');
    console.info('Available commands:');
    console.info('  log [message]     - Add custom log entry');
    console.info('  phase [phase]     - Log phase change');
    console.info('  action [actor] [target] [move] - Log battle action');
    console.info('  effect [id] [desc] [source] [target] - Log battle effect');
    console.info('  show [filter]     - Show log entries');
    console.info('  stats             - Show log statistics');
    console.info('  filter [category] [level] - Set log filter');
    console.info('  export [format]   - Export log to file');
    console.info('  import [file]     - Import log from file');
    console.info('  playback          - Toggle playback mode');
    console.info('  clear             - Clear all logs');
    console.info('  validate          - Validate log integrity');
    console.info('  help              - Show this help');
    console.info('  exit              - Exit application');
    console.info('');

    this.showPrompt();
  }

  /**
   * Show command prompt
   */
  private showPrompt(): void {
    this.rl.question('LogPure> ', (input) => {
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
        case 'log':
          this.addLogEntry(args);
          break;
        case 'phase':
          this.logPhaseChange(args);
          break;
        case 'action':
          this.logBattleAction(args);
          break;
        case 'effect':
          this.logBattleEffect(args);
          break;
        case 'show':
          this.showLogEntries(args);
          break;
        case 'stats':
          this.showStatistics();
          break;
        case 'filter':
          this.setFilter(args);
          break;
        case 'export':
          this.exportLog(args);
          break;
        case 'import':
          this.importLog(args);
          break;
        case 'playback':
          this.togglePlayback();
          break;
        case 'clear':
          this.clearLogs();
          break;
        case 'validate':
          this.validateLogs();
          break;
        case 'exit':
        case 'quit':
        case 'q':
          this.exit();
          return;
        default:
          console.info(`❌ Unknown command: ${command}`);
          console.info('Type "help" for available commands.');
      }
    } catch (error) {
      console.info(`❌ Error: ${error}`);
    }

    this.showPrompt();
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.info('='.repeat(60));
    console.info('📚 LogPure CLI Help');
    console.info('='.repeat(60));
    console.info('');
    console.info('Commands:');
    console.info('  help                    - Show this help');
    console.info('  log [message]           - Add custom log entry');
    console.info('  phase [phase_name]      - Log phase change');
    console.info('  action [actor] [target] [move] - Log battle action');
    console.info('  effect [id] [desc] [source] [target] - Log battle effect');
    console.info('  show [filter]           - Show log entries (all, battle, system, etc.)');
    console.info('  stats                   - Show log statistics');
    console.info('  filter [category] [level] - Set persistent filter');
    console.info('  export [format]         - Export log (json, csv, console)');
    console.info('  import [file]           - Import log from JSON file');
    console.info('  playback                - Toggle playback mode');
    console.info('  clear                   - Clear all logs');
    console.info('  validate                - Validate log integrity');
    console.info('  exit                    - Exit the application');
    console.info('');
    console.info('Examples:');
    console.info('  log Battle system initialized');
    console.info('  phase pre_turn');
    console.info('  action 1 2 fire_blast');
    console.info('  effect burn "Applied burn" 1 2');
    console.info('  show battle');
    console.info('  export json battle_log.json');
    console.info('');
  }

  /**
   * Add custom log entry
   */
  private addLogEntry(args: string[]): void {
    if (args.length === 0) {
      console.info('❌ Usage: log [message]');
      return;
    }

    const message = args.join(' ');
    console.logSystem(message, LogCategory.SYSTEM, LogLevel.INFO);
    console.info(`✅ Logged: ${message}`);
  }

  /**
   * Log phase change
   */
  private logPhaseChange(args: string[]): void {
    if (args.length === 0) {
      console.info('❌ Usage: phase [phase_name]');
      return;
    }

    const phaseName = args[0];
    const phase = phaseName as BattlePhase;

    if (Object.values(BattlePhase).includes(phase)) {
      console.logPhaseChange(phase);
      console.info(`✅ Phase changed to: ${phase}`);
    } else {
      console.info(`❌ Invalid phase: ${phaseName}`);
      console.info('Valid phases: pre_turn, select_action, resolve_action, turn_end, battle_end');
    }
  }

  /**
   * Log battle action
   */
  private logBattleAction(args: string[]): void {
    if (args.length < 3) {
      console.info('❌ Usage: action [actor_id] [target_id] [move_id]');
      return;
    }

    const actorId = parseInt(args[0]);
    const targetId = parseInt(args[1]);
    const moveId = args[2];

    const action: IBattleAction = {
      actorId,
      targetId,
      moveId,
      debugNotes: args.slice(3).join(' ') || undefined
    };

    const result: IBattleResult = BattleResult.success();

    console.logAction(action, result);
    console.info(`✅ Action logged: ${moveId} by actor ${actorId} on target ${targetId}`);
  }

  /**
   * Log battle effect
   */
  private logBattleEffect(args: string[]): void {
    if (args.length < 4) {
      console.info('❌ Usage: effect [effect_id] [description] [source_actor] [target_actor]');
      return;
    }

    const effectId = args[0];
    const description = args[1];
    const sourceActor = parseInt(args[2]);
    const targetActor = parseInt(args[3]);

    const effect: IBattleEffect = BattleEffect.create(
      effectId,
      description,
      sourceActor,
      targetActor
    );

    console.logEffect(effect);
    console.info(`✅ Effect logged: ${effectId} - ${description}`);
  }

  /**
   * Show log entries
   */
  private showLogEntries(args: string[]): void {
    const filterType = args[0] || 'all';

    let filter: ILogFilter = {};

    switch (filterType.toLowerCase()) {
      case 'battle':
        filter.category = LogCategory.BATTLE;
        break;
      case 'system':
        filter.category = LogCategory.SYSTEM;
        break;
      case 'ai':
        filter.category = LogCategory.AI;
        break;
      case 'performance':
        filter.category = LogCategory.PERFORMANCE;
        break;
      case 'errors':
        filter.level = LogLevel.ERROR;
        break;
      case 'warnings':
        filter.level = LogLevel.WARN;
        break;
      case 'debug':
        filter.level = LogLevel.DEBUG;
        break;
      case 'all':
      default:
        // No filter
        break;
    }

    const entries = console.getFilteredEntries(filter);

    console.info('='.repeat(60));
    console.info(`📋 Log Entries (${entries.length} found)`);
    console.info('='.repeat(60));

    if (entries.length === 0) {
      console.info('No entries match the filter criteria.');
      return;
    }

    entries.forEach((entry, index) => {
      console.info(`${index + 1}. ${LogUtils.formatEntryForConsole(entry)}`);
    });

    console.info('');
    console.info(`Total: ${entries.length} entries`);
  }

  /**
   * Show log statistics
   */
  private showStatistics(): void {
    const stats = console.getStatistics();

    console.info('='.repeat(60));
    console.info('📊 Log Statistics');
    console.info('='.repeat(60));

    console.info(`Total Entries: ${stats.totalEntries}`);
    console.info(`Time Span: ${stats.timeSpan}ms`);
    console.info(`Current Turn: ${console.getCurrentTurn()}`);
    console.info(`Average Entries/Turn: ${stats.averageEntriesPerTurn.toFixed(1)}`);
    console.info('');

    console.info('By Category:');
    Object.entries(stats.entriesByCategory).forEach(([category, count]) => {
      if (count > 0) {
        console.info(`  ${category}: ${count}`);
      }
    });
    console.info('');

    console.info('By Level:');
    Object.entries(stats.entriesByLevel).forEach(([level, count]) => {
      if (count > 0) {
        console.info(`  ${level}: ${count}`);
      }
    });
    console.info('');

    console.info('By Phase:');
    Object.entries(stats.entriesByPhase).forEach(([phase, count]) => {
      if (count > 0) {
        console.info(`  ${phase}: ${count}`);
      }
    });
    console.info('');

    console.info('By Actor:');
    Object.entries(stats.entriesByActor)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([actorId, count]) => {
        console.info(`  Actor ${actorId}: ${count}`);
      });
  }

  /**
   * Set persistent filter
   */
  private setFilter(args: string[]): void {
    if (args.length < 2) {
      console.info('❌ Usage: filter [category] [level]');
      return;
    }

    const category = args[0] as LogCategory;
    const level = args[1] as LogLevel;

    console.info(`✅ Filter set: ${category} / ${level}`);
    console.info('This filter will be used for subsequent show commands.');
  }

  /**
   * Export log to file
   */
  private exportLog(args: string[]): void {
    if (args.length < 2) {
      console.info('❌ Usage: export [format] [filename]');
      return;
    }

    const format = args[0].toLowerCase() as LogOutputFormat;
    const filename = args[1];

    let exportData: string;

    switch (format) {
      case LogOutputFormat.JSON:
        exportData = console.exportToJSON();
        break;
      case LogOutputFormat.CSV:
        exportData = console.exportToCSV();
        break;
      case LogOutputFormat.CONSOLE:
        exportData = console.getAllEntries()
          .map(entry => LogUtils.formatEntryForConsole(entry))
          .join('\n');
        break;
      default:
        console.info(`❌ Unsupported format: ${format}`);
        return;
    }

    try {
      fs.writeFileSync(filename, exportData);
      console.info(`✅ Log exported to ${filename} (${exportData.length} bytes)`);
    } catch (error) {
      console.info(`❌ Failed to export log: ${error}`);
    }
  }

  /**
   * Import log from file
   */
  private importLog(args: string[]): void {
    if (args.length === 0) {
      console.info('❌ Usage: import [filename]');
      return;
    }

    const filename = args[0];

    try {
      if (!fs.existsSync(filename)) {
        console.info(`❌ File not found: ${filename}`);
        return;
      }

      const fileContent = fs.readFileSync(filename, 'utf8');
      const importedLogger = BattleLogger.importFromJSON(fileContent);

      this.logger = importedLogger;
      console.info(`✅ Log imported from ${filename}`);
      console.info(`📊 Imported ${importedLogger.getEntryCount()} entries`);
    } catch (error) {
      console.info(`❌ Failed to import log: ${error}`);
    }
  }

  /**
   * Toggle playback mode
   */
  private togglePlayback(): void {
    this.playbackMode = !this.playbackMode;
    this.playbackIndex = 0;

    if (this.playbackMode) {
      console.info('▶️ Playback mode enabled');
      console.info('Use "show all" to start playback, or "playback" again to disable');
    } else {
      console.info('⏸️ Playback mode disabled');
    }
  }

  /**
   * Clear all logs
   */
  private clearLogs(): void {
    const entryCount = console.getEntryCount();
    console.clear();
    console.info(`🗑️ Cleared ${entryCount} log entries`);
  }

  /**
   * Validate log integrity
   */
  private validateLogs(): void {
    const entries = console.getAllEntries();
    let validCount = 0;
    let invalidCount = 0;
    const errors: string[] = [];

    entries.forEach((entry, index) => {
      const entryErrors = LogUtils.validateLogEntry(entry);
      if (entryErrors.length === 0) {
        validCount++;
      } else {
        invalidCount++;
        errors.push(`Entry ${index}: ${entryErrors.join(', ')}`);
      }
    });

    console.info('='.repeat(60));
    console.info('🔍 Log Validation Results');
    console.info('='.repeat(60));

    console.info(`Valid Entries: ${validCount}`);
    console.info(`Invalid Entries: ${invalidCount}`);
    console.info(`Total Entries: ${entries.length}`);
    console.info('');

    if (errors.length > 0) {
      console.info('Validation Errors:');
      errors.slice(0, 10).forEach(error => console.info(`  ❌ ${error}`));
      if (errors.length > 10) {
        console.info(`  ... and ${errors.length - 10} more errors`);
      }
    } else {
      console.info('✅ All entries are valid');
    }

    const hash = LogUtils.calculateLogHash(this.logger);
    console.info(`🔐 Log Hash: ${hash}`);
  }

  /**
   * Exit application
   */
  private exit(): void {
    console.info('');
    console.info('👋 Thank you for using LogPure CLI!');
    this.rl.close();
    process.exit(0);
  }
}

// Start CLI if run directly
if (require.main === module) {
  const cli = new LogPureCLI();
  cli.start();
}

export { LogPureCLI };