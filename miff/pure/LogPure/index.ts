/**
 * LogPure - Logging and Debugging System
 *
 * A comprehensive logging and debugging system for battle events, CLI playback,
 * and golden validation. Supports structured log entries, battle replay,
 * and deterministic validation of battle outcomes.
 *
 * @module LogPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Log level enumeration
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Log category enumeration
 */
export enum LogCategory {
  BATTLE = 'battle',
  SYSTEM = 'system',
  AI = 'ai',
  PERFORMANCE = 'performance',
  NETWORK = 'network',
  VALIDATION = 'validation'
}

/**
 * Battle phase enumeration
 */
export enum BattlePhase {
  PRE_TURN = 'pre_turn',
  SELECT_ACTION = 'select_action',
  RESOLVE_ACTION = 'resolve_action',
  TURN_END = 'turn_end',
  BATTLE_END = 'battle_end'
}

/**
 * Battle log entry interface
 */
export interface IBattleLogEntry {
  timestampUtc: number;
  actorId: number;
  actionType: string;
  targetId: number;
  result: string;
  debugNotes?: string;
  phase?: string;
  damageDealt?: number;
  statusApplied?: string;
  turnNumber?: number;
  category: LogCategory;
  level: LogLevel;
  metadata?: Record<string, any>;
}

/**
 * Battle result interface
 */
export interface IBattleResult {
  success: boolean;
  damage?: number;
  statusApplied?: string;
  summary: string;
}

/**
 * Battle effect interface
 */
export interface IBattleEffect {
  effectId: string;
  description?: string;
  sourceActorId?: number;
  targetActorId?: number;
  metadata?: Record<string, any>;
}

/**
 * Battle action interface
 */
export interface IBattleAction {
  actorId: number;
  targetId?: number;
  moveId: string;
  debugNotes?: string;
  metadata?: Record<string, any>;
}

/**
 * Log filter interface
 */
export interface ILogFilter {
  category?: LogCategory;
  level?: LogLevel;
  actorId?: number;
  targetId?: number;
  actionType?: string;
  phase?: string;
  turnNumber?: number;
  startTime?: number;
  endTime?: number;
  limit?: number;
  offset?: number;
}

/**
 * Log statistics interface
 */
export interface ILogStatistics {
  totalEntries: number;
  entriesByCategory: Record<LogCategory, number>;
  entriesByLevel: Record<LogLevel, number>;
  entriesByPhase: Record<string, number>;
  entriesByActor: Record<number, number>;
  timeSpan: number;
  averageEntriesPerTurn: number;
}

/**
 * Log output format enumeration
 */
export enum LogOutputFormat {
  JSON = 'json',
  CONSOLE = 'console',
  CSV = 'csv',
  TABLE = 'table'
}

/**
 * Battle log entry implementation
 */
export class BattleLogEntry implements IBattleLogEntry {
  public timestampUtc: number;
  public actorId: number;
  public actionType: string;
  public targetId: number;
  public result: string;
  public debugNotes?: string;
  public phase?: string;
  public damageDealt?: number;
  public statusApplied?: string;
  public turnNumber?: number;
  public category: LogCategory;
  public level: LogLevel;
  public metadata?: Record<string, any>;

  constructor(
    actorId: number = 0,
    actionType: string = '',
    targetId: number = 0,
    result: string = '',
    category: LogCategory = LogCategory.BATTLE,
    level: LogLevel = LogLevel.INFO,
    debugNotes?: string,
    phase?: string,
    damageDealt?: number,
    statusApplied?: string,
    turnNumber?: number,
    metadata?: Record<string, any>
  ) {
    this.timestampUtc = Date.now();
    this.actorId = actorId;
    this.actionType = actionType;
    this.targetId = targetId;
    this.result = result;
    this.debugNotes = debugNotes;
    this.phase = phase;
    this.damageDealt = damageDealt;
    this.statusApplied = statusApplied;
    this.turnNumber = turnNumber;
    this.category = category;
    this.level = level;
    this.metadata = metadata;
  }

  /**
   * Create a phase change entry
   */
  static createPhaseEntry(phase: BattlePhase, turnNumber: number): BattleLogEntry {
    return new BattleLogEntry(
      0,
      'phase',
      0,
      phase,
      LogCategory.BATTLE,
      LogLevel.INFO,
      undefined,
      phase,
      undefined,
      undefined,
      turnNumber
    );
  }

  /**
   * Create an action entry
   */
  static createActionEntry(
    action: IBattleAction,
    result: IBattleResult,
    turnNumber: number
  ): BattleLogEntry {
    return new BattleLogEntry(
      action.actorId,
      action.moveId,
      action.targetId || 0,
      result.summary,
      LogCategory.BATTLE,
      result.success ? LogLevel.INFO : LogLevel.WARN,
      action.debugNotes,
      undefined,
      result.damage,
      result.statusApplied,
      turnNumber,
      action.metadata
    );
  }

  /**
   * Create an effect entry
   */
  static createEffectEntry(effect: IBattleEffect, turnNumber: number): BattleLogEntry {
    return new BattleLogEntry(
      effect.sourceActorId || 0,
      `effect_${effect.effectId}`,
      effect.targetActorId || 0,
      'applied',
      LogCategory.BATTLE,
      LogLevel.DEBUG,
      effect.description,
      undefined,
      undefined,
      undefined,
      turnNumber,
      effect.metadata
    );
  }

  /**
   * Create a system entry
   */
  static createSystemEntry(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    level: LogLevel = LogLevel.INFO
  ): BattleLogEntry {
    return new BattleLogEntry(
      0,
      'system',
      0,
      message,
      category,
      level
    );
  }

  /**
   * Get formatted timestamp
   */
  getFormattedTime(): string {
    return new Date(this.timestampUtc).toISOString();
  }

  /**
   * Get entry summary
   */
  getSummary(): string {
    const phaseInfo = this.phase ? ` [${this.phase}]` : '';
    const damageInfo = this.damageDealt ? ` (${this.damageDealt} dmg)` : '';
    const statusInfo = this.statusApplied ? ` [${this.statusApplied}]` : '';
    const turnInfo = this.turnNumber ? ` T${this.turnNumber}` : '';

    return `${this.actionType}${turnInfo}${phaseInfo}${damageInfo}${statusInfo}: ${this.result}`;
  }

  /**
   * Check if entry matches filter
   */
  matchesFilter(filter: ILogFilter): boolean {
    if (filter.category && this.category !== filter.category) return false;
    if (filter.level && this.level !== filter.level) return false;
    if (filter.actorId !== undefined && this.actorId !== filter.actorId) return false;
    if (filter.targetId !== undefined && this.targetId !== filter.targetId) return false;
    if (filter.actionType && !this.actionType.includes(filter.actionType)) return false;
    if (filter.phase && this.phase !== filter.phase) return false;
    if (filter.turnNumber !== undefined && this.turnNumber !== filter.turnNumber) return false;
    if (filter.startTime && this.timestampUtc < filter.startTime) return false;
    if (filter.endTime && this.timestampUtc > filter.endTime) return false;

    return true;
  }

  /**
   * Clone entry
   */
  clone(): BattleLogEntry {
    return new BattleLogEntry(
      this.actorId,
      this.actionType,
      this.targetId,
      this.result,
      this.category,
      this.level,
      this.debugNotes,
      this.phase,
      this.damageDealt,
      this.statusApplied,
      this.turnNumber,
      this.metadata ? { ...this.metadata } : undefined
    );
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      timestampUtc: this.timestampUtc,
      actorId: this.actorId,
      actionType: this.actionType,
      targetId: this.targetId,
      result: this.result,
      debugNotes: this.debugNotes,
      phase: this.phase,
      damageDealt: this.damageDealt,
      statusApplied: this.statusApplied,
      turnNumber: this.turnNumber,
      category: this.category,
      level: this.level,
      metadata: this.metadata
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): BattleLogEntry {
    const entry = new BattleLogEntry();
    Object.assign(entry, data);
    return entry;
  }
}

/**
 * Battle result implementation
 */
export class BattleResult implements IBattleResult {
  public success: boolean;
  public damage?: number;
  public statusApplied?: string;

  constructor(success: boolean, damage?: number, statusApplied?: string) {
    this.success = success;
    this.damage = damage;
    this.statusApplied = statusApplied;
  }

  get summary(): string {
    return this.success ? 'success' : 'failed';
  }

  static success(damage?: number, statusApplied?: string): BattleResult {
    return new BattleResult(true, damage, statusApplied);
  }

  static failure(): BattleResult {
    return new BattleResult(false);
  }

  static withDamage(damage: number): BattleResult {
    return new BattleResult(true, damage);
  }

  static withStatus(status: string): BattleResult {
    return new BattleResult(true, undefined, status);
  }
}

/**
 * Battle effect implementation
 */
export class BattleEffect implements IBattleEffect {
  public effectId: string;
  public description?: string;
  public sourceActorId?: number;
  public targetActorId?: number;
  public metadata?: Record<string, any>;

  constructor(
    effectId: string,
    description?: string,
    sourceActorId?: number,
    targetActorId?: number,
    metadata?: Record<string, any>
  ) {
    this.effectId = effectId;
    this.description = description;
    this.sourceActorId = sourceActorId;
    this.targetActorId = targetActorId;
    this.metadata = metadata;
  }

  static create(
    effectId: string,
    description?: string,
    sourceActorId?: number,
    targetActorId?: number,
    metadata?: Record<string, any>
  ): BattleEffect {
    return new BattleEffect(effectId, description, sourceActorId, targetActorId, metadata);
  }
}

/**
 * Battle logger implementation
 */
export class BattleLogger {
  private readonly entries: BattleLogEntry[] = [];
  private turnCounter: number = 0;
  private readonly maxEntries: number;

  constructor(maxEntries: number = 10000) {
    this.maxEntries = maxEntries;
  }

  /**
   * Log phase change
   */
  logPhaseChange(phase: BattlePhase): void {
    if (phase === BattlePhase.PRE_TURN) {
      this.turnCounter++;
    }

    this.addEntry(BattleLogEntry.createPhaseEntry(phase, this.turnCounter));
  }

  /**
   * Log battle action
   */
  logAction(action: IBattleAction, result: IBattleResult): void {
    this.addEntry(BattleLogEntry.createActionEntry(action, result, this.turnCounter));
  }

  /**
   * Log battle effect
   */
  logEffect(effect: IBattleEffect): void {
    this.addEntry(BattleLogEntry.createEffectEntry(effect, this.turnCounter));
  }

  /**
   * Log system message
   */
  logSystem(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    level: LogLevel = LogLevel.INFO
  ): void {
    this.addEntry(BattleLogEntry.createSystemEntry(message, category, level));
  }

  /**
   * Log debug message
   */
  logDebug(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    actorId: number = 0,
    targetId: number = 0
  ): void {
    const entry = new BattleLogEntry(
      actorId,
      'debug',
      targetId,
      message,
      category,
      LogLevel.DEBUG
    );
    this.addEntry(entry);
  }

  /**
   * Log warning message
   */
  logWarning(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    actorId: number = 0,
    targetId: number = 0
  ): void {
    const entry = new BattleLogEntry(
      actorId,
      'warning',
      targetId,
      message,
      category,
      LogLevel.WARN
    );
    this.addEntry(entry);
  }

  /**
   * Log error message
   */
  logError(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    actorId: number = 0,
    targetId: number = 0
  ): void {
    const entry = new BattleLogEntry(
      actorId,
      'error',
      targetId,
      message,
      category,
      LogLevel.ERROR
    );
    this.addEntry(entry);
  }

  /**
   * Add entry to log
   */
  private addEntry(entry: BattleLogEntry): void {
    this.entries.push(entry);

    // Trim if over capacity
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  /**
   * Get all entries
   */
  getAllEntries(): readonly BattleLogEntry[] {
    return [...this.entries];
  }

  /**
   * Get filtered entries
   */
  getFilteredEntries(filter: ILogFilter): BattleLogEntry[] {
    let filtered = this.entries.filter(entry => entry.matchesFilter(filter));

    // Apply limit and offset
    if (filter.offset) {
      filtered = filtered.slice(filter.offset);
    }

    if (filter.limit) {
      filtered = filtered.slice(0, filter.limit);
    }

    return filtered;
  }

  /**
   * Get entries by turn
   */
  getEntriesByTurn(turnNumber: number): BattleLogEntry[] {
    return this.entries.filter(entry => entry.turnNumber === turnNumber);
  }

  /**
   * Get entries by category
   */
  getEntriesByCategory(category: LogCategory): BattleLogEntry[] {
    return this.entries.filter(entry => entry.category === category);
  }

  /**
   * Get entries by level
   */
  getEntriesByLevel(level: LogLevel): BattleLogEntry[] {
    return this.entries.filter(entry => entry.level === level);
  }

  /**
   * Get current turn number
   */
  getCurrentTurn(): number {
    return this.turnCounter;
  }

  /**
   * Get entry count
   */
  getEntryCount(): number {
    return this.entries.length;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries.length = 0;
    this.turnCounter = 0;
  }

  /**
   * Get log statistics
   */
  getStatistics(): ILogStatistics {
    const totalEntries = this.entries.length;
    const entriesByCategory = this.getEntriesByCategoryCount();
    const entriesByLevel = this.getEntriesByLevelCount();
    const entriesByPhase = this.getEntriesByPhaseCount();
    const entriesByActor = this.getEntriesByActorCount();

    let timeSpan = 0;
    if (totalEntries > 0) {
      const firstTime = this.entries[0].timestampUtc;
      const lastTime = this.entries[totalEntries - 1].timestampUtc;
      timeSpan = lastTime - firstTime;
    }

    const averageEntriesPerTurn = this.turnCounter > 0 ? totalEntries / this.turnCounter : 0;

    return {
      totalEntries,
      entriesByCategory,
      entriesByLevel,
      entriesByPhase,
      entriesByActor,
      timeSpan,
      averageEntriesPerTurn
    };
  }

  private getEntriesByCategoryCount(): Record<LogCategory, number> {
    const counts: Record<LogCategory, number> = {
      [LogCategory.BATTLE]: 0,
      [LogCategory.SYSTEM]: 0,
      [LogCategory.AI]: 0,
      [LogCategory.PERFORMANCE]: 0,
      [LogCategory.NETWORK]: 0,
      [LogCategory.VALIDATION]: 0
    };

    this.entries.forEach(entry => {
      counts[entry.category]++;
    });

    return counts;
  }

  private getEntriesByLevelCount(): Record<LogLevel, number> {
    const counts: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.CRITICAL]: 0
    };

    this.entries.forEach(entry => {
      counts[entry.level]++;
    });

    return counts;
  }

  private getEntriesByPhaseCount(): Record<string, number> {
    const counts: Record<string, number> = {};

    this.entries.forEach(entry => {
      if (entry.phase) {
        counts[entry.phase] = (counts[entry.phase] || 0) + 1;
      }
    });

    return counts;
  }

  private getEntriesByActorCount(): Record<number, number> {
    const counts: Record<number, number> = {};

    this.entries.forEach(entry => {
      counts[entry.actorId] = (counts[entry.actorId] || 0) + 1;
    });

    return counts;
  }

  /**
   * Export log to JSON
   */
  exportToJSON(): string {
    return JSON.stringify(this.entries.map(entry => entry.toJSON()), null, 2);
  }

  /**
   * Export log to CSV
   */
  exportToCSV(): string {
    const headers = [
      'timestampUtc',
      'actorId',
      'actionType',
      'targetId',
      'result',
      'debugNotes',
      'phase',
      'damageDealt',
      'statusApplied',
      'turnNumber',
      'category',
      'level'
    ];

    let csv = headers.join(',') + '\n';

    this.entries.forEach(entry => {
      const values = [
        entry.timestampUtc,
        entry.actorId,
        `"${entry.actionType}"`,
        entry.targetId,
        `"${entry.result}"`,
        entry.debugNotes ? `"${entry.debugNotes}"` : '',
        entry.phase ? `"${entry.phase}"` : '',
        entry.damageDealt || '',
        entry.statusApplied ? `"${entry.statusApplied}"` : '',
        entry.turnNumber || '',
        entry.category,
        entry.level
      ];

      csv += values.join(',') + '\n';
    });

    return csv;
  }

  /**
   * Import log from JSON
   */
  static importFromJSON(jsonData: string): BattleLogger {
    const logger = new BattleLogger();
    const entries: Record<string, any>[] = JSON.parse(jsonData);

    entries.forEach(entryData => {
      const entry = BattleLogEntry.fromJSON(entryData);
      logger.entries.push(entry);

      if (entry.turnNumber && entry.turnNumber > logger.turnCounter) {
        logger.turnCounter = entry.turnNumber;
      }
    });

    return logger;
  }
}

/**
 * Utility functions for logging operations
 */
export const LogUtils = {
  /**
   * Format log entry for console output
   */
  formatEntryForConsole(entry: IBattleLogEntry): string {
    const timestamp = new Date(entry.timestampUtc).toLocaleTimeString();
    const levelIcon = LogUtils.getLevelIcon(entry.level);
    const categoryIcon = LogUtils.getCategoryIcon(entry.category);

    return `${timestamp} ${levelIcon} ${categoryIcon} ${entry.getSummary()}`;
  },

  /**
   * Get icon for log level
   */
  getLevelIcon(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '🐛';
      case LogLevel.INFO: return 'ℹ️';
      case LogLevel.WARN: return '⚠️';
      case LogLevel.ERROR: return '❌';
      case LogLevel.CRITICAL: return '🚨';
      default: return '📝';
    }
  },

  /**
   * Get icon for log category
   */
  getCategoryIcon(category: LogCategory): string {
    switch (category) {
      case LogCategory.BATTLE: return '⚔️';
      case LogCategory.SYSTEM: return '⚙️';
      case LogCategory.AI: return '🤖';
      case LogCategory.PERFORMANCE: return '📈';
      case LogCategory.NETWORK: return '🌐';
      case LogCategory.VALIDATION: return '✅';
      default: return '📋';
    }
  },

  /**
   * Create common log filter patterns
   */
  createFilter: {
    byCategory: (category: LogCategory): ILogFilter => ({ category }),
    byLevel: (level: LogLevel): ILogFilter => ({ level }),
    byActor: (actorId: number): ILogFilter => ({ actorId }),
    byTurn: (turnNumber: number): ILogFilter => ({ turnNumber }),
    byPhase: (phase: string): ILogFilter => ({ phase }),
    byTimeRange: (startTime: number, endTime: number): ILogFilter => ({ startTime, endTime }),
    lastNEntries: (count: number): ILogFilter => ({ limit: count }),
    errorsOnly: (): ILogFilter => ({ level: LogLevel.ERROR }),
    warningsAndAbove: (): ILogFilter => ({ level: LogLevel.WARN }),
    battleEventsOnly: (): ILogFilter => ({ category: LogCategory.BATTLE }),
    recentActivity: (minutes: number): ILogFilter => ({
      startTime: Date.now() - (minutes * 60 * 1000)
    })
  },

  /**
   * Validate log entry
   */
  validateLogEntry(entry: IBattleLogEntry): string[] {
    const errors: string[] = [];

    if (!entry.actionType || entry.actionType.trim() === '') {
      errors.push('Action type cannot be empty');
    }

    if (entry.timestampUtc <= 0) {
      errors.push('Timestamp must be valid');
    }

    if (entry.turnNumber !== undefined && entry.turnNumber < 0) {
      errors.push('Turn number cannot be negative');
    }

    return errors;
  },

  /**
   * Merge multiple loggers
   */
  mergeLoggers(loggers: BattleLogger[]): BattleLogger {
    const merged = new BattleLogger();

    loggers.forEach(logger => {
      logger.getAllEntries().forEach(entry => {
        merged.entries.push(entry);
      });

      if (logger.getCurrentTurn() > merged.turnCounter) {
        merged.turnCounter = logger.getCurrentTurn();
      }
    });

    // Sort by timestamp
    merged.entries.sort((a, b) => a.timestampUtc - b.timestampUtc);

    return merged;
  },

  /**
   * Create performance log entry
   */
  createPerformanceEntry(
    operation: string,
    durationMs: number,
    actorId: number = 0,
    metadata?: Record<string, any>
  ): BattleLogEntry {
    return new BattleLogEntry(
      actorId,
      `perf_${operation}`,
      0,
      `completed in ${durationMs}ms`,
      LogCategory.PERFORMANCE,
      LogLevel.DEBUG,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { operation, durationMs, ...metadata }
    );
  },

  /**
   * Create validation log entry
   */
  createValidationEntry(
    validationType: string,
    success: boolean,
    message: string,
    actorId: number = 0,
    metadata?: Record<string, any>
  ): BattleLogEntry {
    return new BattleLogEntry(
      actorId,
      `validation_${validationType}`,
      0,
      success ? 'passed' : 'failed',
      LogCategory.VALIDATION,
      success ? LogLevel.INFO : LogLevel.ERROR,
      message,
      undefined,
      undefined,
      undefined,
      undefined,
      { validationType, success, ...metadata }
    );
  },

  /**
   * Calculate log integrity hash
   */
  calculateLogHash(logger: BattleLogger): string {
    const entries = logger.getAllEntries();
    const hashData = entries
      .map(entry => `${entry.timestampUtc}-${entry.actorId}-${entry.actionType}-${entry.result}`)
      .join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < hashData.length; i++) {
      const char = hashData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16);
  }
};

/**
 * Default instances
 */
export const defaultBattleLogger = new BattleLogger();
export const defaultBattleResult = BattleResult.success();
export const defaultBattleEffect = BattleEffect.create('default');
export const defaultBattleLogEntry = new BattleLogEntry();