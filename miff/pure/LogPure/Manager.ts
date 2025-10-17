/**
 * LogPure Manager - Advanced Logging and Analytics
 *
 * Comprehensive logging system for:
 * - Structured logging with multiple levels
 * - Performance monitoring and analytics
 * - Error tracking and debugging
 * - User behavior analytics
 * - System health monitoring
 * - Log aggregation and filtering
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/index.js';

// ============================================================================
// LOG MANAGER INTERFACES
// ============================================================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export enum LogCategory {
  SYSTEM = 'system',
  USER = 'user',
  PERFORMANCE = 'performance',
  ERROR = 'error',
  SECURITY = 'security',
  BUSINESS = 'business',
  DEBUG = 'debug',
  BATTLE = 'battle'
}

export enum BattlePhase {
  START = 'start',
  SETUP = 'setup',
  PRE_TURN = 'pre_turn',
  SELECT_ACTION = 'select_action',
  RESOLVE_ACTION = 'resolve_action',
  END_TURN = 'end_turn',
  CHECK_VICTORY = 'check_victory',
  END = 'end'
}

export enum LogOutputFormat {
  JSON = 'json',
  XML = 'xml',
  CSV = 'csv',
  TEXT = 'text',
  HTML = 'html'
}

export interface LogEntry {
  id: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  timestamp: Date;
  source: string;
  userId?: string;
  sessionId?: string;
  metadata: Record<string, any>;
  stackTrace?: string;
  tags: string[];
}

export interface LogFilter {
  levels?: LogLevel[];
  categories?: LogCategory[];
  sources?: string[];
  userIds?: string[];
  sessionIds?: string[];
  tags?: string[];
  startTime?: Date;
  endTime?: Date;
  searchText?: string;
}

export interface LogStats {
  totalEntries: number;
  entriesByLevel: Record<LogLevel, number>;
  entriesByCategory: Record<LogCategory, number>;
  entriesBySource: Record<string, number>;
  averageEntriesPerMinute: number;
  errorRate: number;
  lastEntryTime: Date;
  oldestEntryTime: Date;
}

export interface LogConfig {
  maxEntries: number;
  retentionDays: number;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  logLevel: LogLevel;
  enablePerformanceLogging: boolean;
  enableUserTracking: boolean;
  enableErrorTracking: boolean;
  batchSize: number;
  flushInterval: number;
}

export interface LogIntegration {
  systemId: string;
  enabled: boolean;
  priority: number;
  callbacks: {
    onLogEntry?: (entry: LogEntry) => void;
    onLogBatch?: (entries: LogEntry[]) => void;
    onError?: (error: Error) => void;
  };
}

export interface ILogFilter {
  levels?: LogLevel[];
  categories?: LogCategory[];
  sources?: string[];
  userIds?: string[];
  sessionIds?: string[];
  tags?: string[];
  startTime?: Date;
  endTime?: Date;
  searchText?: string;
}

export interface IBattleAction {
  actorId: string;
  actionType: string;
  targetId: string;
  moveId?: string;
  itemId?: string;
  parameters: Record<string, any>;
}

export interface IBattleResult {
  success: boolean;
  message: string;
  damage?: number;
  effects?: string[];
  metadata: Record<string, any>;
}

export interface IBattleEffect {
  effectType: string;
  targetId: string;
  duration: number;
  intensity: number;
  parameters: Record<string, any>;
}

export interface IBattleLogEntry {
  id: string;
  actorId: number;
  actionType: string;
  targetId: number;
  result: string;
  category: LogCategory;
  level: LogLevel;
  debugNotes: string;
  phase: BattlePhase;
  damageDealt?: number;
  statusApplied?: string;
  turnNumber: number;
  metadata: Record<string, any>;
  timestampUtc: number;
}

export interface IBattleResult {
  success: boolean;
  message: string;
  damage?: number;
  effects?: string[];
  metadata: Record<string, any>;
}

/**
 * Battle Result class for tracking battle outcomes
 */
export class BattleResult implements IBattleResult {
  public success: boolean;
  public message: string;
  public damage?: number;
  public effects?: string[];
  public metadata: Record<string, any>;

  constructor(
    const managerId = this.id ?? `manager_${Date.now()}`;
    success: boolean = false,
    message: string = '',
    damage?: number,
    effects: string[] = [],
    metadata: Record<string, any> = {}
  ) {
    this.success = success;
    this.message = message;
    this.damage = damage;
    this.effects = [...effects];
    this.metadata = { ...metadata };
  }

  static createSuccess(message: string, damage?: number, effects: string[] = []): BattleResult {
    return new BattleResult(true, message, damage, effects);
  }

  static createFailure(message: string, effects: string[] = []): BattleResult {
    return new BattleResult(false, message, undefined, effects);
  }

  static createWithDamage(message: string, damage: number): BattleResult {
    return new BattleResult(true, message, damage);
  }

  static createWithStatus(message: string, statusEffect: string): BattleResult {
    return new BattleResult(true, message, undefined, [statusEffect!]);
  }

  static withDamage(damage: number, effects: string[] = []): BattleResult {
    return new BattleResult(true, `Damage dealt: ${damage}`, damage, effects);
  }

  static withEffect(message: string, effectType: string): BattleResult {
    return new BattleResult(true, message, undefined, [effectType!]);
  }

  toString(): string {
    const parts = [this.success ? 'SUCCESS' : 'FAILURE', this.message];
    if (this.damage !== undefined) parts.push(`(${this.damage} damage)`);
    if (this.effects && this.effects.length > 0) parts.push(`[Effects: ${this.effects.join(', ')}]`);
    return parts.join(' ');
  }

  clone(): BattleResult {
    return new BattleResult(
      this.success,
      this.message,
      this.damage,
      this.effects ? [...this.effects] : [],
      { ...this.metadata }
    );
  }
}

/**
 * Battle Effect class for tracking battle effects
 */
export class BattleEffect implements IBattleEffect {
  public effectType: string;
  public targetId: string;
  public duration: number;
  public intensity: number;
  public parameters: Record<string, any>;

  constructor(
    const managerId = this.id ?? `manager_${Date.now()}`;
    effectType: string = '',
    targetId: string = '',
    duration: number = 0,
    intensity: number = 1,
    parameters: Record<string, any> = {}
  ) {
    this.effectType = effectType;
    this.targetId = targetId;
    this.duration = Math.max(0, duration);
    this.intensity = Math.max(0, intensity);
    this.parameters = { ...parameters };
  }

  static create(
    effectType: string,
    debugNotes: string,
    duration: number = 1,
    targetId: number = 0,
    parameters: Record<string, any> = {}
  ): BattleEffect {
    return new BattleEffect(effectType, targetId.toString(), duration, 1, parameters);
  }

  static createMinimal(effectType: string, targetId: string): BattleEffect {
    return new BattleEffect(effectType, targetId);
  }

  static createWithParameters(
    effectType: string,
    targetId: string,
    parameters: Record<string, any>
  ): BattleEffect {
    return new BattleEffect(effectType, targetId, 0, 1, parameters);
  }

  toString(): string {
    return `${this.effectType} on ${this.targetId} (${this.duration} turns, ${this.intensity}x intensity)`;
  }

  clone(): BattleEffect {
    return new BattleEffect(
      this.effectType,
      this.targetId,
      this.duration,
      this.intensity,
      { ...this.parameters }
    );
  }

  isExpired(): boolean {
    return this.duration <= 0;
  }
}

/**
 * Log manager configuration
 */
export interface LogManagerConfig {
  eventBus: EventBus;
  config: LogConfig;
  integrations: LogIntegration[];
}

/**
 * Log Manager - Core logging functionality
 */
export class LogManager {
  private eventBus: EventBus;
  private config: LogConfig;
  private integrations: LogIntegration[];
  private entries: LogEntry[] = [];
  private stats: LogStats;
  private batchBuffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config: LogManagerConfig) {
    const managerId = this.id ?? `manager_${Date.now()}`;
    this.eventBus = config.eventBus;
    this.config = config.config;
    this.integrations = config.integrations;
    this.stats = {
      totalEntries: 0,
      entriesByLevel: {} as Record<LogLevel, number>,
      entriesByCategory: {} as Record<LogCategory, number>,
      entriesBySource: {} as Record<string, number>,
      averageEntriesPerMinute: 0,
      errorRate: 0,
      lastEntryTime: new Date(),
      oldestEntryTime: new Date()
    };

    this.initialize();
  }

  /**
   * Initialize log manager
   */
  private initialize(): void {
    // Initialize stats
    Object.values(LogLevel).forEach((level: any) => {
      if (typeof level === 'number') {
        this.stats.entriesByLevel[level as LogLevel] = 0;
      }
    });

    Object.values(LogCategory).forEach((category: any) => {
      this.stats.entriesByCategory[category as LogCategory] = 0;
    });

    // Set up batch flushing
    if (this.config.batchSize > 0) {
      this.flushTimer = setInterval(() => {
        this.flushBatch();
      }, this.config.flushInterval);
    }

    // Set up error handling
    if (this.config.enableErrorTracking) {
      process.on('uncaughtException', (error) => {
        this.error('Uncaught Exception', { error: error.message, stack: error.stack });
      });

      process.on('unhandledRejection', (reason) => {
        this.error('Unhandled Rejection', { reason });
      });
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, metadata: Record<string, any> = {}, source: string = 'unknown'): void {
    this.log(LogLevel.DEBUG, LogCategory.DEBUG, message, source, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, metadata: Record<string, any> = {}, source: string = 'unknown'): void {
    this.log(LogLevel.INFO, LogCategory.SYSTEM, message, source, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata: Record<string, any> = {}, source: string = 'unknown'): void {
    this.log(LogLevel.WARN, LogCategory.SYSTEM, message, source, metadata);
  }

  /**
   * Log error message
   */
  error(message: string, metadata: Record<string, any> = {}, source: string = 'unknown'): void {
    this.log(LogLevel.ERROR, LogCategory.ERROR, message, source, metadata);
  }

  /**
   * Log critical message
   */
  critical(message: string, metadata: Record<string, any> = {}, source: string = 'unknown'): void {
    this.log(LogLevel.CRITICAL, LogCategory.ERROR, message, source, metadata);
  }

  /**
   * Log performance metric
   */
  performance(operation: string, duration: number, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.INFO, LogCategory.PERFORMANCE, `Performance: ${operation}`, 'performance', {
      ...metadata,
      operation,
      duration
    });
  }

  /**
   * Log user action
   */
  userAction(action: string, userId: string, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.INFO, LogCategory.USER, `User Action: ${action}`, 'user', {
      ...metadata,
      action,
      userId
    });
  }

  /**
   * Log business event
   */
  business(event: string, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.INFO, LogCategory.BUSINESS, `Business Event: ${event}`, 'business', metadata);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    source: string,
    metadata: Record<string, any> = {}
  ): void {
    // Check if we should log this level
    if (level < this.config.logLevel) {
      return;
    }

    const entry: LogEntry = {
      id: this.generateId(),
      level,
      category,
      message,
      timestamp: new Date(),
      source,
      metadata,
      tags: this.extractTags(message, metadata)
    };

    // Add stack trace for errors
    if (level >= LogLevel.ERROR) {
      entry.stackTrace = new Error().stack;
    }

    // Add to entries
    this.addEntry(entry);

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // File logging
    if (this.config.enableFile) {
      this.logToFile(entry);
    }

    // Remote logging
    if (this.config.enableRemote) {
      this.logToRemote(entry);
    }

    // Notify integrations
    this.integrations.forEach((integration: any) => {
      integration.callbacks.onLogEntry?.(entry);
    });

    // Add to batch buffer
    if (this.config.batchSize > 0) {
      this.batchBuffer.push(entry);
      if (this.batchBuffer.length >= this.config.batchSize) {
        this.flushBatch();
      }
    }
  }

  /**
   * Add entry to storage
   */
  private addEntry(entry: LogEntry): void {
    this.entries.push(entry);

    // Update stats
    this.stats.totalEntries++;
    this.stats.entriesByLevel[entry.level]++;
    this.stats.entriesByCategory[entry.category]++;
    this.stats.entriesBySource[entry.source] = (this.stats.entriesBySource[entry.source] || 0) + 1;
    this.stats.lastEntryTime = entry.timestamp;

    if (this.entries.length === 1) {
      this.stats.oldestEntryTime = entry.timestamp;
    }

    // Cleanup old entries
    this.cleanupOldEntries();
  }

  /**
   * Cleanup old entries
   */
  private cleanupOldEntries(): void {
    if (this.entries.length > this.config.maxEntries) {
      const entriesToRemove = this.entries.length - this.config.maxEntries;
      this.entries.splice(0, entriesToRemove);
    }

    // Remove entries older than retention period
    const cutoffTime = new Date(Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000));
    this.entries = this.entries.filter((entry: any) => entry.timestamp > cutoffTime);
  }

  /**
   * Log to console
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const categoryName = LogCategory[entry.category];
    
    const logMessage = `[${timestamp}] ${levelName} [${categoryName}] ${entry.source}: ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, entry.metadata);
        break;
      case LogLevel.INFO:
        console.info(logMessage, entry.metadata);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, entry.metadata);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(logMessage, entry.metadata);
        if (entry.stackTrace) {
          console.error(entry.stackTrace);
        }
        break;
    }
  }

  /**
   * Log to file (placeholder)
   */
  private logToFile(entry: LogEntry): void {
    // In a real implementation, this would write to a file
    // For now, we'll just emit an event
    this.eventBus.publish('log:file', entry);
  }

  /**
   * Log to remote service (placeholder)
   */
  private logToRemote(entry: LogEntry): void {
    // In a real implementation, this would send to a remote logging service
    // For now, we'll just emit an event
    this.eventBus.publish('log:remote', entry);
  }

  /**
   * Flush batch buffer
   */
  private flushBatch(): void {
    if (this.batchBuffer.length === 0) {
      return;
    }

    const batch = [...this.batchBuffer];
    this.batchBuffer = [];

    // Notify integrations
    this.integrations.forEach((integration: any) => {
      integration.callbacks.onLogBatch?.(batch);
    });

    this.eventBus.publish('log:batch', batch);
  }

  /**
   * Get log entries with filter
   */
  getEntries(filter: LogFilter = {}): LogEntry[] {
    let filtered = [...this.entries];

    if (filter.levels && filter.levels.length > 0) {
      filtered = filtered.filter((entry: any) => filter.levels!.includes(entry.level));
    }

    if (filter.categories && filter.categories.length > 0) {
      filtered = filtered.filter((entry: any) => filter.categories!.includes(entry.category));
    }

    if (filter.sources && filter.sources.length > 0) {
      filtered = filtered.filter((entry: any) => filter.sources!.includes(entry.source));
    }

    if (filter.userIds && filter.userIds.length > 0) {
      filtered = filtered.filter((entry: any) => entry.userId && filter.userIds!.includes(entry.userId));
    }

    if (filter.sessionIds && filter.sessionIds.length > 0) {
      filtered = filtered.filter((entry: any) => entry.sessionId && filter.sessionIds!.includes(entry.sessionId));
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter((entry: any) => 
        filter.tags!.some(tag => entry.tags.includes(tag))
      );
    }

    if (filter.startTime) {
      filtered = filtered.filter((entry: any) => entry.timestamp >= filter.startTime!);
    }

    if (filter.endTime) {
      filtered = filtered.filter((entry: any) => entry.timestamp <= filter.endTime!);
    }

    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      filtered = filtered.filter((entry: any) => 
        entry.message.toLowerCase().includes(searchLower) ||
        entry.source.toLowerCase().includes(searchLower)
      );
    }

    return filtered.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get log statistics
   */
  getStats(): LogStats {
    const managerData = this.getStats();
    // Calculate error rate
    const errorCount = this.stats.entriesByLevel[LogLevel.ERROR] + this.stats.entriesByLevel[LogLevel.CRITICAL];
    this.stats.errorRate = this.stats.totalEntries > 0 ? (errorCount / this.stats.totalEntries) * 100 : 0;

    // Calculate average entries per minute
    const now = Date.now();
    const timeDiff = now.getTime() - this.stats.oldestEntryTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    this.stats.averageEntriesPerMinute = minutesDiff > 0 ? this.stats.totalEntries / minutesDiff : 0;

    return { ...this.stats };
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.entries = [];
    this.batchBuffer = [];
    this.stats = {
      totalEntries: 0,
      entriesByLevel: {} as Record<LogLevel, number>,
      entriesByCategory: {} as Record<LogCategory, number>,
      entriesBySource: {} as Record<string, number>,
      averageEntriesPerMinute: 0,
      errorRate: 0,
      lastEntryTime: new Date(),
      oldestEntryTime: new Date()
    };

    // Reinitialize stats
    Object.values(LogLevel).forEach((level: any) => {
      if (typeof level === 'number') {
        this.stats.entriesByLevel[level as LogLevel] = 0;
      }
    });

    Object.values(LogCategory).forEach((category: any) => {
      this.stats.entriesByCategory[category as LogCategory] = 0;
    });
  }

  /**
   * Export logs
   */
  exportLogs(filter: LogFilter = {}): any {
    const entries = this.getEntries(filter);
    return {
      entries: entries.map((entry: any) => ({
        ...entry,
        timestamp: entry.timestamp.toISOString()
      })),
      stats: this.getStats(),
    const managerData = this.getStats();
      exportTime: new Date().toISOString()
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Add integration
   */
  addIntegration(integration: LogIntegration): void {
    this.integrations.push(integration);
  }

  /**
   * Remove integration
   */
  removeIntegration(systemId: string): boolean {
    const index = this.integrations.findIndex(i => i.systemId === systemId);
    if (index >= 0) {
      this.integrations.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Extract tags from message and metadata
   */
  private extractTags(message: string, metadata: Record<string, any>): string[] {
    const tags: string[] = [];
    
    // Extract tags from message (look for #tag patterns)
    const tagMatches = message.match(/#\w+/g);
    if (tagMatches) {
      tags.push(...tagMatches.map((tag: any) => tag.substring(1)));
    }

    // Extract tags from metadata
    if (metadata.tags && Array.isArray(metadata.tags)) {
      tags.push(...metadata.tags);
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushBatch();
  }
}

/**
 * Battle Log Entry implementation
 */
export class BattleLogEntry implements IBattleLogEntry {
  public id: string;
  public actorId: number;
  public actionType: string;
  public targetId: number;
  public result: string;
  public category: LogCategory;
  public level: LogLevel;
  public debugNotes: string;
  public phase: BattlePhase;
  public damageDealt?: number;
  public statusApplied?: string;
  public turnNumber: number;
  public metadata: Record<string, any>;
  public timestampUtc: number;

  constructor(
    const managerId = this.id ?? `manager_${Date.now()}`;
    actorId: number = 0,
    actionType: string = '',
    targetId: number = 0,
    result: string = '',
    category: LogCategory = LogCategory.BATTLE,
    level: LogLevel = LogLevel.INFO,
    debugNotes: string = '',
    phase: BattlePhase = BattlePhase.START,
    damageDealt?: number,
    statusApplied?: string,
    turnNumber: number = 1,
    metadata: Record<string, any> = {}
  ) {
    this.id = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.actorId = actorId;
    this.actionType = actionType;
    this.targetId = targetId;
    this.result = result;
    this.category = category;
    this.level = level;
    this.debugNotes = debugNotes;
    this.phase = phase;
    this.damageDealt = damageDealt;
    this.statusApplied = statusApplied;
    this.turnNumber = turnNumber;
    this.metadata = { ...metadata };
    this.timestampUtc = Date.now();
  }

  static create(
    actorId: number,
    actionType: string,
    targetId: number,
    result: string,
    debugNotes?: string,
    phase?: BattlePhase,
    damageDealt?: number,
    statusApplied?: string,
    turnNumber?: number,
    metadata?: Record<string, any>
  ): BattleLogEntry {
    return new BattleLogEntry(
      actorId,
      actionType,
      targetId,
      result,
      LogCategory.BATTLE,
      LogLevel.INFO,
      debugNotes || `${actionType} by ${actorId} targeting ${targetId}: ${result}`,
      phase || BattlePhase.RESOLVE_ACTION,
      damageDealt,
      statusApplied,
      turnNumber || 1,
      metadata
    );
  }

  static success(
    actorId: number,
    actionType: string,
    targetId: number,
    debugNotes: string,
    damageDealt?: number,
    turnNumber?: number
  ): BattleLogEntry {
    return new BattleLogEntry(
      actorId,
      actionType,
      targetId,
      'success',
      LogCategory.BATTLE,
      LogLevel.INFO,
      debugNotes,
      BattlePhase.RESOLVE_ACTION,
      damageDealt,
      undefined,
      turnNumber || 1,
      {}
    );
  }

  static failure(
    actorId: number,
    actionType: string,
    targetId: number,
    debugNotes: string,
    turnNumber?: number
  ): BattleLogEntry {
    return new BattleLogEntry(
      actorId,
      actionType,
      targetId,
      'failure',
      LogCategory.BATTLE,
      LogLevel.WARN,
      debugNotes,
      BattlePhase.RESOLVE_ACTION,
      undefined,
      undefined,
      turnNumber || 1,
      {}
    );
  }

  static createPhaseEntry(
    phase: BattlePhase,
    turnNumber: number = 1,
    actorId: number = 0
  ): BattleLogEntry {
    return new BattleLogEntry(
      actorId,
      'phase',
      0,
      phase,
      LogCategory.BATTLE,
      LogLevel.INFO,
      `Phase changed to ${phase}`,
      phase,
      undefined,
      undefined,
      turnNumber,
      { phase }
    );
  }

  static createActionEntry(
    action: IBattleAction,
    result: IBattleResult,
    turnNumber: number = 1
  ): BattleLogEntry {
    return new BattleLogEntry(
      action.actorId,
      action.moveId || 'unknown',
      action.targetId,
      result.success ? 'success' : 'failure',
      LogCategory.BATTLE,
      LogLevel.INFO,
      action.debugNotes || `${action.moveId} by ${action.actorId}`,
      BattlePhase.RESOLVE_ACTION,
      result.damage,
      undefined,
      turnNumber,
      { action, result }
    );
  }

  static createEffectEntry(
    effect: IBattleEffect,
    turnNumber: number = 1
  ): BattleLogEntry {
    return new BattleLogEntry(
      turnNumber,
      `effect_${effect.effectType}`,
      parseInt(effect.targetId) || 0,
      'applied',
      LogCategory.BATTLE,
      LogLevel.DEBUG,
      'Applied burn effect',
      BattlePhase.RESOLVE_ACTION,
      undefined,
      undefined,
      turnNumber,
      { duration: 3 }
    );
  }

  static createSystemEntry(
    debugNotes: string,
    category: LogCategory = LogCategory.SYSTEM,
    level: LogLevel = LogLevel.INFO,
    turnNumber: number = 1,
    metadata: Record<string, any> = {}
  ): BattleLogEntry {
    return new BattleLogEntry(
      0,
      'system',
      0,
      debugNotes,
      category,
      level,
      debugNotes,
      BattlePhase.START,
      undefined,
      undefined,
      turnNumber,
      { system: true, ...metadata }
    );
  }

  static createDebugEntry(
    debugNotes: string,
    turnNumber: number = 1,
    metadata: Record<string, any> = {}
  ): BattleLogEntry {
    return new BattleLogEntry(
      0,
      'debug',
      0,
      'debug',
      LogCategory.DEBUG,
      LogLevel.DEBUG,
      debugNotes,
      BattlePhase.SETUP,
      undefined,
      undefined,
      turnNumber,
      { debug: true, ...metadata }
    );
  }

  static createWarningEntry(
    debugNotes: string,
    turnNumber: number = 1,
    metadata: Record<string, any> = {}
  ): BattleLogEntry {
    return new BattleLogEntry(
      0,
      'warning',
      0,
      'warning',
      LogCategory.ERROR,
      LogLevel.WARN,
      debugNotes,
      BattlePhase.CHECK_VICTORY,
      undefined,
      undefined,
      turnNumber,
      { warning: true, ...metadata }
    );
  }

  static createErrorEntry(
    debugNotes: string,
    error?: Error,
    turnNumber: number = 1,
    metadata: Record<string, any> = {}
  ): BattleLogEntry {
    return new BattleLogEntry(
      0,
      'error',
      0,
      'error',
      LogCategory.ERROR,
      LogLevel.ERROR,
      debugNotes,
      BattlePhase.END,
      undefined,
      undefined,
      turnNumber,
      { error: true, stack: error?.stack, ...metadata }
    );
  }

  static createCriticalEntry(
    debugNotes: string,
    turnNumber: number = 1,
    metadata: Record<string, any> = {}
  ): BattleLogEntry {
    return new BattleLogEntry(
      0,
      'critical',
      0,
      'critical',
      LogCategory.ERROR,
      LogLevel.CRITICAL,
      debugNotes,
      BattlePhase.END,
      undefined,
      undefined,
      turnNumber,
      { critical: true, ...metadata }
    );
  }

  /**
   * Generate formatted time string
   */
  getFormattedTime(): string {
    return new Date(this.timestampUtc).toISOString();
  }

  /**
   * Generate summary string
   */
  getSummary(): string {
    const time = this.getFormattedTime();
    const parts = [
      `${this.actionType} by ${this.actorId}`,
      `→ ${this.targetId}`,
      `[${this.phase}] ${this.result}`,
      this.debugNotes
    ];
    if (this.damageDealt !== undefined) parts.push(`(${this.damageDealt} damage)`);
    if (this.statusApplied) parts.push(`[${this.statusApplied}]`);
    return `${parts.join(' ')} @ ${time}`;
  }

  /**
   * Check if entry matches filter
   */
  matchesFilter(filter): boolean {
    if (filter.levels && !filter.levels.includes(this.level)) return false;
    if (filter.categories && !filter.categories.includes(this.category)) return false;
    if (filter.phases && !filter.phases.includes(this.phase)) return false;
    if (filter.actionTypes && !filter.actionTypes.includes(this.actionType)) return false;
    if (filter.results && !filter.results.includes(this.result)) return false;
    if (filter.minDamage && this.damageDealt && this.damageDealt < filter.minDamage) return false;
    if (filter.maxDamage && this.damageDealt && this.damageDealt > filter.maxDamage) return false;
    if (filter.searchText && !this.debugNotes.toLowerCase().includes(filter.searchText.toLowerCase())) return false;
    if (filter.turnNumbers && !filter.turnNumbers.includes(this.turnNumber)) return false;
    return true;
  }

  /**
   * Clone the entry
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
      { ...this.metadata }
    );
  }

  /**
   * Convert to/from JSON
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      actorId: this.actorId,
      actionType: this.actionType,
      targetId: this.targetId,
      result: this.result,
      category: this.category,
      level: this.level,
      debugNotes: this.debugNotes,
      phase: this.phase,
      damageDealt: this.damageDealt,
      statusApplied: this.statusApplied,
      turnNumber: this.turnNumber,
      metadata: this.metadata,
      timestampUtc: this.timestampUtc
    };
  }

  static fromJSON(data: Record<string, any>): BattleLogEntry {
    const entry = new BattleLogEntry(
      data.actorId || 0,
      data.actionType || '',
      data.targetId || 0,
      data.result || '',
      data.category || LogCategory.BATTLE,
      data.level || LogLevel.INFO,
      data.debugNotes || '',
      data.phase || BattlePhase.START,
      data.damageDealt,
      data.statusApplied,
      data.turnNumber || 1,
      data.metadata || {}
    );
    entry.timestampUtc = data.timestampUtc || Date.now();
    return entry;
  }
}

/**
 * Battle Logger implementation
 */
export class BattleLogger {
  private logManager: LogManager;
  private battleId: string;
  private entries: BattleLogEntry[] = [];

  constructor(logManager: LogManager, battleId: string = `battle_${Date.now()}`) {
    const managerId = this.id ?? `manager_${Date.now()}`;
    this.logManager = logManager;
    this.battleId = battleId;
  }

  logAction(
    actorId: number,
    actionType: string,
    targetId: number,
    result: string,
    debugNotes?: string,
    phase?: BattlePhase,
    damageDealt?: number,
    statusApplied?: string,
    turnNumber?: number
  ): void {
    const entry = BattleLogEntry.create(
      actorId,
      actionType,
      targetId,
      result,
      debugNotes,
      phase,
      damageDealt,
      statusApplied,
      turnNumber,
      { battleId: this.battleId }
    );

    this.entries.push(entry);
    this.logManager.info(`Battle ${this.battleId}: ${entry.debugNotes}`, {
      battleId: this.battleId,
      entry: entry
    });
  }

  logDamage(actorId: number, targetId: number, damageDealt: number, turnNumber?: number): void {
    this.logAction(
      actorId,
      'damage',
      targetId,
      'success',
      `Dealt ${damageDealt} damage`,
      BattlePhase.RESOLVE_ACTION,
      damageDealt,
      undefined,
      turnNumber
    );
  }

  logHeal(actorId: number, targetId: number, healAmount: number, turnNumber?: number): void {
    this.logAction(
      actorId,
      'heal',
      targetId,
      'success',
      `Healed ${healAmount} HP`,
      BattlePhase.RESOLVE_ACTION,
      healAmount,
      undefined,
      turnNumber
    );
  }

  logStatusEffect(actorId: number, targetId: number, statusApplied: string, debugNotes: string, turnNumber?: number): void {
    this.logAction(
      actorId,
      'status_effect',
      targetId,
      'success',
      debugNotes,
      BattlePhase.RESOLVE_ACTION,
      undefined,
      statusApplied,
      turnNumber
    );
  }

  logVictory(winnerId: number, debugNotes: string, turnNumber?: number): void {
    this.logAction(
      winnerId,
      'victory',
      0,
      'success',
      debugNotes,
      BattlePhase.END,
      undefined,
      undefined,
      turnNumber
    );
  }

  getEntries(): BattleLogEntry[] {
    return [...this.entries];
  }

  getEntriesByPhase(phase: BattlePhase): BattleLogEntry[] {
    return this.entries.filter((entry: any) => entry.phase === phase);
  }

  getDamageEntries(): BattleLogEntry[] {
    return this.entries.filter((entry: any) => entry.actionType === 'damage' && entry.damageDealt && entry.damageDealt > 0);
  }

  logPhaseChange(phase: BattlePhase, debugNotes: string, turnNumber?: number): void {
    const entry = BattleLogEntry.createPhaseEntry(phase, debugNotes, 0, turnNumber);
    this.entries.push(entry);
    this.logManager.info(`Battle ${this.battleId}: ${entry.debugNotes}`, {
      battleId: this.battleId,
      entry: entry
    });
  }

  logBattleAction(actionType: string, targetId: number, result: string, debugNotes: string, damageDealt?: number, turnNumber?: number): void {
    const entry = BattleLogEntry.createActionEntry(0, actionType, targetId, result, debugNotes, damageDealt, turnNumber);
    this.entries.push(entry);
    this.logManager.info(`Battle ${this.battleId}: ${entry.debugNotes}`, {
      battleId: this.battleId,
      entry: entry
    });
  }

  logBattleEffect(effectType: string, targetId: string, debugNotes: string, duration: number = 1, intensity: number = 1, turnNumber?: number): void {
    const entry = BattleLogEntry.createEffectEntry(effectType, targetId, debugNotes, duration, intensity, turnNumber);
    this.entries.push(entry);
    this.logManager.info(`Battle ${this.battleId}: ${entry.debugNotes}`, {
      battleId: this.battleId,
      entry: entry
    });
  }

  logSystemMessage(debugNotes: string, level: LogLevel = LogLevel.INFO, turnNumber?: number): void {
    const entry = BattleLogEntry.createSystemEntry(debugNotes, level, turnNumber);
    this.entries.push(entry);
    this.logManager.log(level, `Battle ${this.battleId}: ${entry.debugNotes}`, {
      battleId: this.battleId,
      entry: entry
    });
  }

  logDebugMessage(debugNotes: string, turnNumber?: number, metadata: Record<string, any> = {}): void {
    const entry = BattleLogEntry.createDebugEntry(debugNotes, turnNumber, metadata);
    this.entries.push(entry);
    this.logManager.debug(`Battle ${this.battleId}: ${entry.debugNotes}`, {
      battleId: this.battleId,
      entry: entry
    });
  }

  logWarning(debugNotes: string, turnNumber?: number, metadata: Record<string, any> = {}): void {
    const entry = BattleLogEntry.createWarningEntry(debugNotes, turnNumber, metadata);
    this.entries.push(entry);
    this.logManager.warn(`Battle ${this.battleId}: ${entry.debugNotes}`, {
      battleId: this.battleId,
      entry: entry
    });
  }

  logError(debugNotes: string, error?: Error, turnNumber?: number, metadata: Record<string, any> = {}): void {
    const entry = BattleLogEntry.createErrorEntry(debugNotes, error, turnNumber, metadata);
    this.entries.push(entry);
    this.logManager.error(`Battle ${this.battleId}: ${entry.debugNotes}`, {
      battleId: this.battleId,
      entry: entry
    });
  }

  logCritical(debugNotes: string, turnNumber?: number, metadata: Record<string, any> = {}): void {
    const entry = BattleLogEntry.createCriticalEntry(debugNotes, turnNumber, metadata);
    this.entries.push(entry);
    this.logManager.critical(`Battle ${this.battleId}: ${entry.debugNotes}`, {
      battleId: this.battleId,
      entry: entry
    });
  }

  logEntriesByType(type: string): BattleLogEntry[] {
    return this.entries.filter((entry: any) => entry.actionType === type);
  }

  getEntriesByActor(actorId: number): BattleLogEntry[] {
    return this.entries.filter((entry: any) => entry.actorId === actorId);
  }

  getEntriesByTarget(targetId: number): BattleLogEntry[] {
    return this.entries.filter((entry: any) => entry.targetId === targetId);
  }

  clear(): void {
    this.entries = [];
  }
}

/**
 * Log Utils implementation
 */
export class LogUtils {
  static formatLogEntry(entry: LogEntry): string {
    return `[${entry.level}] [${entry.category}] ${entry.source}: ${entry.message}`;
  }

  static filterEntries(entries: LogEntry[], filter: ILogFilter): LogEntry[] {
    return entries.filter((entry: any) => {
      if (filter.levels && !filter.levels.includes(entry.level)) return false;
      if (filter.categories && !filter.categories.includes(entry.category)) return false;
      if (filter.sources && !filter.sources.includes(entry.source)) return false;
      if (filter.tags && !filter.tags.some(tag => entry.tags.includes(tag))) return false;
      if (filter.startTime && entry.timestamp < filter.startTime) return false;
      if (filter.endTime && entry.timestamp > filter.endTime) return false;
      if (filter.searchText && !entry.message.toLowerCase().includes(filter.searchText.toLowerCase())) return false;
      return true;
    });
  }

  static createBattleSummary(entries: BattleLogEntry[]): string {
    const damageEntries = entries.filter((e: any) => e.actionType === 'damage' && e.damage && e.damage > 0);
    const totalDamage = damageEntries.reduce((sum, entry) => sum + (entry.damage || 0), 0);
    const uniqueActors = new Set(entries.map((e: any) => e.actorId));
    const phases = [...new Set(entries.map((e: any) => e.phase))];

    return `Battle Summary: ${entries.length} entries, ${uniqueActors.size} actors, ${totalDamage} total damage, phases: ${phases.join(', ')}`;
  }

  static getLogLevelName(level: LogLevel): string {
    const names = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    return names[level!] || 'UNKNOWN';
  }

  static getCategoryName(category: LogCategory): string {
    return category.toUpperCase();
  }

  static exportToJSON(entries: LogEntry[]): string {
    return JSON.stringify(entries.map((entry: any) => ({
      ...entry,
      timestamp: entry.timestamp.toISOString()
    })), null, 2);
  }

  static importFromJSON(json: string): LogEntry[] {
    try {
      const data = JSON.parse(json);
      return data.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error('Invalid JSON format');
    }
  }
}

/**
 * Default log manager instance
 */
export const defaultLogManager = new LogManager({
  eventBus: new (require('../EventBusPure/EventBusPure').EventBus)(),
  config: {
    maxEntries: 10000,
    retentionDays: 30,
    enableConsole: true,
    enableFile: false,
    enableRemote: false,
    logLevel: LogLevel.INFO,
    enablePerformanceLogging: true,
    enableUserTracking: true,
    enableErrorTracking: true,
    batchSize: 100,
    flushInterval: 5000
  },
  integrations: []
});