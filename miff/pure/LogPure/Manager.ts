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
  message: string;
  phase: BattlePhase;
  damage?: number;
  statusEffectId?: string;
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
    Object.values(LogLevel).forEach(level => {
      if (typeof level === 'number') {
        this.stats.entriesByLevel[level as LogLevel] = 0;
      }
    });

    Object.values(LogCategory).forEach(category => {
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
    this.integrations.forEach(integration => {
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
    this.entries = this.entries.filter(entry => entry.timestamp > cutoffTime);
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
    this.integrations.forEach(integration => {
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
      filtered = filtered.filter(entry => filter.levels!.includes(entry.level));
    }

    if (filter.categories && filter.categories.length > 0) {
      filtered = filtered.filter(entry => filter.categories!.includes(entry.category));
    }

    if (filter.sources && filter.sources.length > 0) {
      filtered = filtered.filter(entry => filter.sources!.includes(entry.source));
    }

    if (filter.userIds && filter.userIds.length > 0) {
      filtered = filtered.filter(entry => entry.userId && filter.userIds!.includes(entry.userId));
    }

    if (filter.sessionIds && filter.sessionIds.length > 0) {
      filtered = filtered.filter(entry => entry.sessionId && filter.sessionIds!.includes(entry.sessionId));
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(entry => 
        filter.tags!.some(tag => entry.tags.includes(tag))
      );
    }

    if (filter.startTime) {
      filtered = filtered.filter(entry => entry.timestamp >= filter.startTime!);
    }

    if (filter.endTime) {
      filtered = filtered.filter(entry => entry.timestamp <= filter.endTime!);
    }

    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.message.toLowerCase().includes(searchLower) ||
        entry.source.toLowerCase().includes(searchLower)
      );
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get log statistics
   */
  getStats(): LogStats {
    // Calculate error rate
    const errorCount = this.stats.entriesByLevel[LogLevel.ERROR] + this.stats.entriesByLevel[LogLevel.CRITICAL];
    this.stats.errorRate = this.stats.totalEntries > 0 ? (errorCount / this.stats.totalEntries) * 100 : 0;

    // Calculate average entries per minute
    const now = new Date();
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
    Object.values(LogLevel).forEach(level => {
      if (typeof level === 'number') {
        this.stats.entriesByLevel[level as LogLevel] = 0;
      }
    });

    Object.values(LogCategory).forEach(category => {
      this.stats.entriesByCategory[category as LogCategory] = 0;
    });
  }

  /**
   * Export logs
   */
  exportLogs(filter: LogFilter = {}): any {
    const entries = this.getEntries(filter);
    return {
      entries: entries.map(entry => ({
        ...entry,
        timestamp: entry.timestamp.toISOString()
      })),
      stats: this.getStats(),
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
      tags.push(...tagMatches.map(tag => tag.substring(1)));
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
  public message: string;
  public phase: BattlePhase;
  public damage?: number;
  public statusEffectId?: string;
  public metadata: Record<string, any>;
  public timestampUtc: number;

  constructor(
    actorId: number = 0,
    actionType: string = '',
    targetId: number = 0,
    result: string = '',
    category: LogCategory = LogCategory.BATTLE,
    level: LogLevel = LogLevel.INFO,
    message: string = '',
    phase: BattlePhase = BattlePhase.START,
    damage?: number,
    statusEffectId?: string,
    metadata: Record<string, any> = {}
  ) {
    this.id = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.actorId = actorId;
    this.actionType = actionType;
    this.targetId = targetId;
    this.result = result;
    this.category = category;
    this.level = level;
    this.message = message;
    this.phase = phase;
    this.damage = damage;
    this.statusEffectId = statusEffectId;
    this.metadata = { ...metadata };
    this.timestampUtc = Date.now();
  }

  static create(
    actorId: number,
    actionType: string,
    targetId: number,
    result: string,
    message?: string,
    phase?: BattlePhase,
    damage?: number,
    statusEffectId?: string,
    metadata?: Record<string, any>
  ): BattleLogEntry {
    return new BattleLogEntry(
      actorId,
      actionType,
      targetId,
      result,
      LogCategory.BATTLE,
      LogLevel.INFO,
      message || `${actionType} by ${actorId} targeting ${targetId}: ${result}`,
      phase || BattlePhase.RESOLVE_ACTION,
      damage,
      statusEffectId,
      metadata
    );
  }

  static success(
    actorId: number,
    actionType: string,
    targetId: number,
    message: string,
    damage?: number
  ): BattleLogEntry {
    return new BattleLogEntry(
      actorId,
      actionType,
      targetId,
      'success',
      LogCategory.BATTLE,
      LogLevel.INFO,
      message,
      BattlePhase.RESOLVE_ACTION,
      damage,
      undefined,
      {}
    );
  }

  static failure(
    actorId: number,
    actionType: string,
    targetId: number,
    message: string
  ): BattleLogEntry {
    return new BattleLogEntry(
      actorId,
      actionType,
      targetId,
      'failure',
      LogCategory.BATTLE,
      LogLevel.WARN,
      message,
      BattlePhase.RESOLVE_ACTION,
      undefined,
      undefined,
      {}
    );
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
    this.logManager = logManager;
    this.battleId = battleId;
  }

  logAction(
    actorId: number,
    actionType: string,
    targetId: number,
    result: string,
    message?: string,
    phase?: BattlePhase,
    damage?: number,
    statusEffectId?: string
  ): void {
    const entry = BattleLogEntry.create(
      actorId,
      actionType,
      targetId,
      result,
      message,
      phase,
      damage,
      statusEffectId,
      { battleId: this.battleId }
    );

    this.entries.push(entry);
    this.logManager.info(`Battle ${this.battleId}: ${entry.message}`, {
      battleId: this.battleId,
      entry: entry
    });
  }

  logDamage(actorId: number, targetId: number, damage: number): void {
    this.logAction(
      actorId,
      'damage',
      targetId,
      'success',
      `Dealt ${damage} damage`,
      BattlePhase.RESOLVE_ACTION,
      damage
    );
  }

  logHeal(actorId: number, targetId: number, healAmount: number): void {
    this.logAction(
      actorId,
      'heal',
      targetId,
      'success',
      `Healed ${healAmount} HP`,
      BattlePhase.RESOLVE_ACTION,
      healAmount
    );
  }

  logStatusEffect(actorId: number, targetId: number, effectId: string, message: string): void {
    this.logAction(
      actorId,
      'status_effect',
      targetId,
      'success',
      message,
      BattlePhase.RESOLVE_ACTION,
      undefined,
      effectId
    );
  }

  logVictory(winnerId: number, message: string): void {
    this.logAction(
      winnerId,
      'victory',
      0,
      'success',
      message,
      BattlePhase.END
    );
  }

  getEntries(): BattleLogEntry[] {
    return [...this.entries];
  }

  getEntriesByPhase(phase: BattlePhase): BattleLogEntry[] {
    return this.entries.filter(entry => entry.phase === phase);
  }

  getDamageEntries(): BattleLogEntry[] {
    return this.entries.filter(entry => entry.actionType === 'damage' && entry.damage && entry.damage > 0);
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
    return entries.filter(entry => {
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
    const damageEntries = entries.filter(e => e.actionType === 'damage' && e.damage && e.damage > 0);
    const totalDamage = damageEntries.reduce((sum, entry) => sum + (entry.damage || 0), 0);
    const uniqueActors = new Set(entries.map(e => e.actorId));
    const phases = [...new Set(entries.map(e => e.phase))];

    return `Battle Summary: ${entries.length} entries, ${uniqueActors.size} actors, ${totalDamage} total damage, phases: ${phases.join(', ')}`;
  }

  static getLogLevelName(level: LogLevel): string {
    const names = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    return names[level] || 'UNKNOWN';
  }

  static getCategoryName(category: LogCategory): string {
    return category.toUpperCase();
  }

  static exportToJSON(entries: LogEntry[]): string {
    return JSON.stringify(entries.map(entry => ({
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
    } catch (error) {
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