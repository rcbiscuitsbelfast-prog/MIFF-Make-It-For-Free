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
    this.logger.info('Initializing LogPure CLI with demo data...');

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
    this.logger.info('='.repeat(60));
    this.logger.info('📝 LogPure CLI - Logging and Debugging System');
    this.logger.info('='.repeat(60));
    this.logger.info('');
    this.logger.info('Available commands:');
    this.logger.info('  log [message]     - Add custom log entry');
    this.logger.info('  phase [phase]     - Log phase change');
    this.logger.info('  action [actor] [target] [move] - Log battle action');
    this.logger.info('  effect [id] [desc] [source] [target] - Log battle effect');
    this.logger.info('  show [filter]     - Show log entries');
    this.logger.info('  stats             - Show log statistics');
    this.logger.info('  filter [category] [level] - Set log filter');
    this.logger.info('  export [format]   - Export log to file');
    this.logger.info('  import [file]     - Import log from file');
    this.logger.info('  playback          - Toggle playback mode');
    this.logger.info('  clear             - Clear all logs');
    this.logger.info('  validate          - Validate log integrity');
    this.logger.info('  help              - Show this help');
    this.logger.info('  exit              - Exit application');
    this.logger.info('');

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
    this.logger.info('📚 LogPure CLI Help');
    this.logger.info('='.repeat(60));
    this.logger.info('');
    this.logger.info('Commands:');
    this.logger.info('  help                    - Show this help');
    this.logger.info('  log [message]           - Add custom log entry');
    this.logger.info('  phase [phase_name]      - Log phase change');
    this.logger.info('  action [actor] [target] [move] - Log battle action');
    this.logger.info('  effect [id] [desc] [source] [target] - Log battle effect');
    this.logger.info('  show [filter]           - Show log entries (all, battle, system, etc.)');
    this.logger.info('  stats                   - Show log statistics');
    this.logger.info('  filter [category] [level] - Set persistent filter');
    this.logger.info('  export [format]         - Export log (json, csv, console)');
    this.logger.info('  import [file]           - Import log from JSON file');
    this.logger.info('  playback                - Toggle playback mode');
    this.logger.info('  clear                   - Clear all logs');
    this.logger.info('  validate                - Validate log integrity');
    this.logger.info('  exit                    - Exit the application');
    this.logger.info('');
    this.logger.info('Examples:');
    this.logger.info('  log Battle system initialized');
    this.logger.info('  phase pre_turn');
    this.logger.info('  action 1 2 fire_blast');
    this.logger.info('  effect burn "Applied burn" 1 2');
    this.logger.info('  show battle');
    this.logger.info('  export json battle_log.json');
    this.logger.info('');
  }

  /**
   * Add custom log entry
   */
  private addLogEntry(args: string[]): void {
    if (args.length === 0) {
      this.logger.info('❌ Usage: log [message]');
      return;
    }

    const message = args.join(' ');
    this.logger.logSystem(message, LogCategory.SYSTEM, LogLevel.INFO);
    this.logger.info(`✅ Logged: ${message}`);
  }

  /**
   * Log phase change
   */
  private logPhaseChange(args: string[]): void {
    if (args.length === 0) {
      this.logger.info('❌ Usage: phase [phase_name]');
      return;
    }

    const phaseName = args[0];
    const phase = phaseName as BattlePhase;

    if (Object.values(BattlePhase).includes(phase)) {
      this.logger.logPhaseChange(phase);
      this.logger.info(`✅ Phase changed to: ${phase}`);
    } else {
      this.logger.info(`❌ Invalid phase: ${phaseName}`);
      this.logger.info('Valid phases: pre_turn, select_action, resolve_action, turn_end, battle_end');
    }
  }

  /**
   * Log battle action
   */
  private logBattleAction(args: string[]): void {
    if (args.length < 3) {
      this.logger.info('❌ Usage: action [actor_id] [target_id] [move_id]');
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
    this.logger.info(`✅ Action logged: ${moveId} by actor ${actorId} on target ${targetId}`);
  }

  /**
   * Log battle effect
   */
  private logBattleEffect(args: string[]): void {
    if (args.length < 4) {
      this.logger.info('❌ Usage: effect [effect_id] [description] [source_actor] [target_actor]');
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
    this.logger.info(`✅ Effect logged: ${effectId} - ${description}`);
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

    this.logger.info('='.repeat(60));
    this.logger.info(`📋 Log Entries (${entries.length} found)`);
    this.logger.info('='.repeat(60));

    if (entries.length === 0) {
      this.logger.info('No entries match the filter criteria.');
      return;
    }

    entries.forEach((entry, index) => {
      this.logger.info(`${index + 1}. ${LogUtils.formatEntryForConsole(entry)}`);
    });

    this.logger.info('');
    this.logger.info(`Total: ${entries.length} entries`);
  }

  /**
   * Show log statistics
   */
  private showStatistics(): void {
    const stats = this.logger.getStatistics();

    this.logger.info('='.repeat(60));
    this.logger.info('📊 Log Statistics');
    this.logger.info('='.repeat(60));

    this.logger.info(`Total Entries: ${stats.totalEntries}`);
    this.logger.info(`Time Span: ${stats.timeSpan}ms`);
    this.logger.info(`Current Turn: ${this.logger.getCurrentTurn()}`);
    this.logger.info(`Average Entries/Turn: ${stats.averageEntriesPerTurn.toFixed(1)}`);
    this.logger.info('');

    this.logger.info('By Category:');
    Object.entries(stats.entriesByCategory).forEach(([category, count]) => {
      if (count > 0) {
        this.logger.info(`  ${category}: ${count}`);
      }
    });
    this.logger.info('');

    this.logger.info('By Level:');
    Object.entries(stats.entriesByLevel).forEach(([level, count]) => {
      if (count > 0) {
        this.logger.info(`  ${level}: ${count}`);
      }
    });
    this.logger.info('');

    this.logger.info('By Phase:');
    Object.entries(stats.entriesByPhase).forEach(([phase, count]) => {
      if (count > 0) {
        this.logger.info(`  ${phase}: ${count}`);
      }
    });
    this.logger.info('');

    this.logger.info('By Actor:');
    Object.entries(stats.entriesByActor)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([actorId, count]) => {
        this.logger.info(`  Actor ${actorId}: ${count}`);
      });
  }

  /**
   * Set persistent filter
   */
  private setFilter(args: string[]): void {
    if (args.length < 2) {
      this.logger.info('❌ Usage: filter [category] [level]');
      return;
    }

    const category = args[0] as LogCategory;
    const level = args[1] as LogLevel;

    this.logger.info(`✅ Filter set: ${category} / ${level}`);
    this.logger.info('This filter will be used for subsequent show commands.');
  }

  /**
   * Export log to file
   */
  private exportLog(args: string[]): void {
    if (args.length < 2) {
      this.logger.info('❌ Usage: export [format] [filename]');
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
          .map(entry => LogUtils.formatEntryForConsole(entry))
          .join('\n');
        break;
      default:
        this.logger.info(`❌ Unsupported format: ${format}`);
        return;
    }

    try {
      fs.writeFileSync(filename, exportData);
      this.logger.info(`✅ Log exported to ${filename} (${exportData.length} bytes)`);
    } catch (error) {
      this.logger.info(`❌ Failed to export log: ${error}`);
    }
  }

  /**
   * Import log from file
   */
  private importLog(args: string[]): void {
    if (args.length === 0) {
      this.logger.info('❌ Usage: import [filename]');
      return;
    }

    const filename = args[0];

    try {
      if (!fs.existsSync(filename)) {
        this.logger.info(`❌ File not found: ${filename}`);
        return;
      }

      const fileContent = fs.readFileSync(filename, 'utf8');
      const importedLogger = BattleLogger.importFromJSON(fileContent);

      this.logger = importedLogger;
      this.logger.info(`✅ Log imported from ${filename}`);
      this.logger.info(`📊 Imported ${importedLogger.getEntryCount()} entries`);
    } catch (error) {
      this.logger.info(`❌ Failed to import log: ${error}`);
    }
  }

  /**
   * Toggle playback mode
   */
  private togglePlayback(): void {
    this.playbackMode = !this.playbackMode;
    this.playbackIndex = 0;

    if (this.playbackMode) {
      this.logger.info('▶️ Playback mode enabled');
      this.logger.info('Use "show all" to start playback, or "playback" again to disable');
    } else {
      this.logger.info('⏸️ Playback mode disabled');
    }
  }

  /**
   * Clear all logs
   */
  private clearLogs(): void {
    const entryCount = this.logger.getEntryCount();
    this.logger.clear();
    this.logger.info(`🗑️ Cleared ${entryCount} log entries`);
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

    this.logger.info('='.repeat(60));
    this.logger.info('🔍 Log Validation Results');
    this.logger.info('='.repeat(60));

    this.logger.info(`Valid Entries: ${validCount}`);
    this.logger.info(`Invalid Entries: ${invalidCount}`);
    this.logger.info(`Total Entries: ${entries.length}`);
    this.logger.info('');

    if (errors.length > 0) {
      this.logger.info('Validation Errors:');
      errors.slice(0, 10).forEach(error => this.logger.info(`  ❌ ${error}`));
      if (errors.length > 10) {
        this.logger.info(`  ... and ${errors.length - 10} more errors`);
      }
    } else {
      this.logger.info('✅ All entries are valid');
    }

    const hash = LogUtils.calculateLogHash(this.logger);
    this.logger.info(`🔐 Log Hash: ${hash}`);
  }

  /**
   * Exit application
   */
  private exit(): void {
    this.logger.info('');
    this.logger.info('👋 Thank you for using LogPure CLI!');
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