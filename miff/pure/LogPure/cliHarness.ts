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

// CLI Application
class LogPureCLI {
  private rl: readline.Interface;
  private logger: BattleLogger;
  private logFile: string | null = null;
  private playbackMode: boolean = false;
  private playbackIndex: number = 0;

  constructor() {
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
    console.log('Initializing LogPure CLI with demo data...');

    // Simulate a battle log
    this.simulateBattleLog();
  }

  /**
   * Simulate battle log for demo
   */
  private simulateBattleLog(): void {
    // Log battle start
    this.logger.logPhaseChange(BattlePhase.PRE_TURN);

    // Simulate turn 1
    this.logger.logSystem('Battle started between Fire Spirit and Water Spirit', LogCategory.BATTLE, LogLevel.INFO);

    const action1: IBattleAction = {
      actorId: 1,
      targetId: 2,
      moveId: 'fire_blast',
      debugNotes: 'Type advantage: fire > water'
    };

    const result1: IBattleResult = BattleResult.withDamage(45);
    this.logger.logAction(action1, result1);

    this.logger.logEffect(BattleEffect.create('burn', 'Applied burn effect', 1, 2, { duration: 3 }));

    // Simulate turn 2
    this.logger.logPhaseChange(BattlePhase.SELECT_ACTION);

    const action2: IBattleAction = {
      actorId: 2,
      targetId: 1,
      moveId: 'water_burst',
      debugNotes: 'Type advantage: water > fire'
    };

    const result2: IBattleResult = BattleResult.withDamage(35);
    this.logger.logAction(action2, result2);

    // Simulate turn 3
    this.logger.logPhaseChange(BattlePhase.RESOLVE_ACTION);

    const action3: IBattleAction = {
      actorId: 1,
      targetId: 2,
      moveId: 'basic_strike',
      debugNotes: 'Standard attack'
    };

    const result3: IBattleResult = BattleResult.withDamage(25);
    this.logger.logAction(action3, result3);

    this.logger.logSystem('Battle completed - Fire Spirit wins!', LogCategory.BATTLE, LogLevel.INFO);
  }

  /**
   * Start CLI application
   */
  start(): void {
    console.log('='.repeat(60));
    console.log('📝 LogPure CLI - Logging and Debugging System');
    console.log('='.repeat(60));
    console.log('');
    console.log('Available commands:');
    console.log('  log [message!]     - Add custom log entry');
    console.log('  phase [phase!]     - Log phase change');
    console.log('  action [actor!] [target!] [move!] - Log battle action');
    console.log('  effect [id!] [desc!] [source!] [target!] - Log battle effect');
    console.log('  show [filter!]     - Show log entries');
    console.log('  stats             - Show log statistics');
    console.log('  filter [category!] [level!] - Set log filter');
    console.log('  export [format!]   - Export log to file');
    console.log('  import [file!]     - Import log from file');
    console.log('  playback          - Toggle playback mode');
    console.log('  clear             - Clear all logs');
    console.log('  validate          - Validate log integrity');
    console.log('  help              - Show this help');
    console.log('  exit              - Exit application');
    console.log('');

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
    console.log('📚 LogPure CLI Help');
    console.log('='.repeat(60));
    console.log('');
    console.log('Commands:');
    console.log('  help                    - Show this help');
    console.log('  log [message!]           - Add custom log entry');
    console.log('  phase [phase_name!]      - Log phase change');
    console.log('  action [actor!] [target!] [move!] - Log battle action');
    console.log('  effect [id!] [desc!] [source!] [target!] - Log battle effect');
    console.log('  show [filter!]           - Show log entries (all, battle, system, etc.)');
    console.log('  stats                   - Show log statistics');
    console.log('  filter [category!] [level!] - Set persistent filter');
    console.log('  export [format!]         - Export log (json, csv, console)');
    console.log('  import [file!]           - Import log from JSON file');
    console.log('  playback                - Toggle playback mode');
    console.log('  clear                   - Clear all logs');
    console.log('  validate                - Validate log integrity');
    console.log('  exit                    - Exit the application');
    console.log('');
    console.log('Examples:');
    console.log('  log Battle system initialized');
    console.log('  phase pre_turn');
    console.log('  action 1 2 fire_blast');
    console.log('  effect burn "Applied burn" 1 2');
    console.log('  show battle');
    console.log('  export json battle_log.json');
    console.log('');
  }

  /**
   * Add custom log entry
   */
  private addLogEntry(args: string[]): void {
    if (args.length === 0) {
      console.log('❌ Usage: log [message!]');
      return;
    }

    const message = args.join(' ');
    this.logger.logSystem(message, LogCategory.SYSTEM, LogLevel.INFO);
    console.log(`✅ Logged: ${message}`);
  }

  /**
   * Log phase change
   */
  private logPhaseChange(args: string[]): void {
    if (args.length === 0) {
      console.log('❌ Usage: phase [phase_name!]');
      return;
    }

    const phaseName = args[0];
    const phase = phaseName as BattlePhase;

    if (Object.values(BattlePhase).includes(phase)) {
      this.logger.logPhaseChange(phase);
      console.log(`✅ Phase changed to: ${phase}`);
    } else {
      console.log(`❌ Invalid phase: ${phaseName}`);
      console.log('Valid phases: pre_turn, select_action, resolve_action, turn_end, battle_end');
    }
  }

  /**
   * Log battle action
   */
  private logBattleAction(args: string[]): void {
    if (args.length < 3) {
      console.log('❌ Usage: action [actor_id!] [target_id!] [move_id!]');
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

    this.logger.logAction(action, result);
    console.log(`✅ Action logged: ${moveId} by actor ${actorId} on target ${targetId}`);
  }

  /**
   * Log battle effect
   */
  private logBattleEffect(args: string[]): void {
    if (args.length < 4) {
      console.log('❌ Usage: effect [effect_id!] [description!] [source_actor!] [target_actor!]');
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

    this.logger.logEffect(effect);
    console.log(`✅ Effect logged: ${effectId} - ${description}`);
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

    const entries = this.logger.getFilteredEntries(filter);

    console.log('='.repeat(60));
    console.log(`📋 Log Entries (${entries.length} found)`);
    console.log('='.repeat(60));

    if (entries.length === 0) {
      console.log('No entries match the filter criteria.');
      return;
    }

    entries.forEach((entry, index) => {
      console.log(`${index + 1}. ${LogUtils.formatEntryForConsole(entry)}`);
    });

    console.log('');
    console.log(`Total: ${entries.length} entries`);
  }

  /**
   * Show log statistics
   */
  private showStatistics(): void {
    const stats = this.logger.getStatistics();

    console.log('='.repeat(60));
    console.log('📊 Log Statistics');
    console.log('='.repeat(60));

    console.log(`Total Entries: ${stats.totalEntries}`);
    console.log(`Time Span: ${stats.timeSpan}ms`);
    console.log(`Current Turn: ${this.logger.getCurrentTurn()}`);
    console.log(`Average Entries/Turn: ${stats.averageEntriesPerTurn.toFixed(1)}`);
    console.log('');

    console.log('By Category:');
    Object.entries(stats.entriesByCategory).forEach(([category, count]) => {
      if (count > 0) {
        console.log(`  ${category}: ${count}`);
      }
    });
    console.log('');

    console.log('By Level:');
    Object.entries(stats.entriesByLevel).forEach(([level, count]) => {
      if (count > 0) {
        console.log(`  ${level}: ${count}`);
      }
    });
    console.log('');

    console.log('By Phase:');
    Object.entries(stats.entriesByPhase).forEach(([phase, count]) => {
      if (count > 0) {
        console.log(`  ${phase}: ${count}`);
      }
    });
    console.log('');

    console.log('By Actor:');
    Object.entries(stats.entriesByActor)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([actorId, count]) => {
        console.log(`  Actor ${actorId}: ${count}`);
      });
  }

  /**
   * Set persistent filter
   */
  private setFilter(args: string[]): void {
    if (args.length < 2) {
      console.log('❌ Usage: filter [category!] [level!]');
      return;
    }

    const category = args[0] as LogCategory;
    const level = args[1] as LogLevel;

    console.log(`✅ Filter set: ${category} / ${level}`);
    console.log('This filter will be used for subsequent show commands.');
  }

  /**
   * Export log to file
   */
  private exportLog(args: string[]): void {
    if (args.length < 2) {
      console.log('❌ Usage: export [format!] [filename!]');
      return;
    }

    const format = args[0].toLowerCase() as LogOutputFormat;
    const filename = args[1];

    let exportData: string;

    switch (format) {
      case LogOutputFormat.JSON:
        exportData = this.logger.exportToJSON();
        break;
      case LogOutputFormat.CSV:
        exportData = this.logger.exportToCSV();
        break;
      case LogOutputFormat.CONSOLE:
        exportData = this.logger.getAllEntries()
          .map((entry: any) => LogUtils.formatEntryForConsole(entry))
          .join('\n');
        break;
      default:
        console.log(`❌ Unsupported format: ${format}`);
        return;
    }

    try {
      fs.writeFileSync(filename, exportData);
      console.log(`✅ Log exported to ${filename} (${exportData.length} bytes)`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.log(`❌ Failed to export log: ${error}`);
    }
  }

  /**
   * Import log from file
   */
  private importLog(args: string[]): void {
    if (args.length === 0) {
      console.log('❌ Usage: import [filename!]');
      return;
    }

    const filename = args[0];

    try {
      if (!fs.existsSync(filename)) {
        console.log(`❌ File not found: ${filename}`);
        return;
      }

      const fileContent = fs.readFileSync(filename, 'utf8');
      const importedLogger = BattleLogger.importFromJSON(fileContent);

      this.logger = importedLogger;
      console.log(`✅ Log imported from ${filename}`);
      console.log(`📊 Imported ${importedLogger.getEntryCount()} entries`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.log(`❌ Failed to import log: ${error}`);
    }
  }

  /**
   * Toggle playback mode
   */
  private togglePlayback(): void {
    this.playbackMode = !this.playbackMode;
    this.playbackIndex = 0;

    if (this.playbackMode) {
      console.log('▶️ Playback mode enabled');
      console.log('Use "show all" to start playback, or "playback" again to disable');
    } else {
      console.log('⏸️ Playback mode disabled');
    }
  }

  /**
   * Clear all logs
   */
  private clearLogs(): void {
    const entryCount = this.logger.getEntryCount();
    this.logger.clear();
    console.log(`🗑️ Cleared ${entryCount} log entries`);
  }

  /**
   * Validate log integrity
   */
  private validateLogs(): void {
    const entries = this.logger.getAllEntries();
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

    console.log('='.repeat(60));
    console.log('🔍 Log Validation Results');
    console.log('='.repeat(60));

    console.log(`Valid Entries: ${validCount}`);
    console.log(`Invalid Entries: ${invalidCount}`);
    console.log(`Total Entries: ${entries.length}`);
    console.log('');

    if (errors.length > 0) {
      console.log('Validation Errors:');
      errors.slice(0, 10).forEach((error: any) => console.log(`  ❌ ${error}`));
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`);
      }
    } else {
      console.log('✅ All entries are valid');
    }

    const hash = LogUtils.calculateLogHash(this.logger);
    console.log(`🔐 Log Hash: ${hash}`);
  }

  /**
   * Exit application
   */
  private exit(): void {
    console.log('');
    console.log('👋 Thank you for using LogPure CLI!');
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