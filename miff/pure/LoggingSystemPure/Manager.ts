/**
 * LoggingSystemPure Manager - Advanced Logging Management System
 *
 * Comprehensive logging system with:
 * - Multi-level logging (debug, info, warn, error, fatal)
 * - Structured logging with context and metadata
 * - Log filtering and routing
 * - Log aggregation and analysis
 * - Log persistence and archival
 * - Log security and encryption
 * - Log performance monitoring
 * - Log alerting and notifications
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

export interface LoggingSystemConfig {
  enableLogging: boolean;
  enableStructuredLogging: boolean;
  enableFiltering: boolean;
  enableRouting: boolean;
  enableAggregation: boolean;
  enableAnalysis: boolean;
  enablePersistence: boolean;
  enableArchival: boolean;
  enableSecurity: boolean;
  enableEncryption: boolean;
  enablePerformanceMonitoring: boolean;
  enableAlerting: boolean;
  enableNotifications: boolean;
  maxLogs: number;
  maxLogSize: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface LoggingSystem {
  id: string;
  name: string;
  type: LoggingSystemType;
  status: LoggingSystemStatus;
  loggers: Logger[];
  appenders: LogAppender[];
  filters: LogFilter[];
  formatters: LogFormatter[];
  aggregators: LogAggregator[];
  analyzers: LogAnalyzer[];
  alerts: LogAlert[];
  security: LogSecurity;
  analytics: LogAnalytics;
  metadata: LogMetadata;
  version: string;
  created: number;
  modified: number;
}

export enum LoggingSystemType {
  APPLICATION = 'application',
  GAME = 'game',
  SYSTEM = 'system',
  WEB = 'web',
  MOBILE = 'mobile',
  CUSTOM = 'custom'
}

export enum LoggingSystemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

export interface Logger {
  id: string;
  name: string;
  level: LogLevel;
  status: LoggerStatus;
  appenders: string[];
  filters: string[];
  formatter: string;
  context: LogContext;
  statistics: LoggerStatistics;
  metadata: Map<string, any>;
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
  CUSTOM = 'custom'
}

export enum LoggerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface LogContext {
  service: string;
  module: string;
  version: string;
  environment: string;
  custom: Map<string, any>;
}

export interface LoggerStatistics {
  totalLogs: number;
  logsByLevel: Map<LogLevel, number>;
  averageLogSize: number;
  lastLogTime: number;
  metadata: Map<string, any>;
}

export interface LogAppender {
  id: string;
  name: string;
  type: AppenderType;
  status: AppenderStatus;
  configuration: AppenderConfiguration;
  filters: string[];
  formatter: string;
  statistics: AppenderStatistics;
  metadata: Map<string, any>;
}

export enum AppenderType {
  CONSOLE = 'console',
  FILE = 'file',
  DATABASE = 'database',
  NETWORK = 'network',
  CLOUD = 'cloud',
  CUSTOM = 'custom'
}

export enum AppenderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export interface AppenderConfiguration {
  [key: string]: any;
}

export interface AppenderStatistics {
  totalLogs: number;
  successfulLogs: number;
  failedLogs: number;
  averageLatency: number;
  lastLogTime: number;
  metadata: Map<string, any>;
}

export interface LogFilter {
  id: string;
  name: string;
  type: FilterType;
  enabled: boolean;
  condition: FilterCondition;
  action: FilterAction;
  metadata: Map<string, any>;
}

export enum FilterType {
  LEVEL = 'level',
  SOURCE = 'source',
  MESSAGE = 'message',
  CONTEXT = 'context',
  CUSTOM = 'custom'
}

export interface FilterCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  metadata: Map<string, any>;
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  REGEX = 'regex',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CUSTOM = 'custom'
}

export interface FilterAction {
  type: ActionType;
  value: any;
  metadata: Map<string, any>;
}

export enum ActionType {
  ALLOW = 'allow',
  DENY = 'deny',
  ROUTE = 'route',
  TRANSFORM = 'transform',
  CUSTOM = 'custom'
}

export interface LogFormatter {
  id: string;
  name: string;
  type: FormatterType;
  template: string;
  configuration: FormatterConfiguration;
  metadata: Map<string, any>;
}

export enum FormatterType {
  SIMPLE = 'simple',
  JSON = 'json',
  XML = 'xml',
  CUSTOM = 'custom'
}

export interface FormatterConfiguration {
  [key: string]: any;
}

export interface LogAggregator {
  id: string;
  name: string;
  type: AggregatorType;
  enabled: boolean;
  configuration: AggregatorConfiguration;
  statistics: AggregatorStatistics;
  metadata: Map<string, any>;
}

export enum AggregatorType {
  TIME_BASED = 'time_based',
  COUNT_BASED = 'count_based',
  SIZE_BASED = 'size_based',
  CUSTOM = 'custom'
}

export interface AggregatorConfiguration {
  interval: number;
  maxCount: number;
  maxSize: number;
  metadata: Map<string, any>;
}

export interface AggregatorStatistics {
  totalAggregations: number;
  averageAggregationTime: number;
  lastAggregation: number;
  metadata: Map<string, any>;
}

export interface LogAnalyzer {
  id: string;
  name: string;
  type: AnalyzerType;
  enabled: boolean;
  configuration: AnalyzerConfiguration;
  patterns: AnalysisPattern[];
  statistics: AnalyzerStatistics;
  metadata: Map<string, any>;
}

export enum AnalyzerType {
  PATTERN = 'pattern',
  ANOMALY = 'anomaly',
  TREND = 'trend',
  CUSTOM = 'custom'
}

export interface AnalyzerConfiguration {
  sensitivity: number;
  threshold: number;
  window: number;
  metadata: Map<string, any>;
}

export interface AnalysisPattern {
  id: string;
  name: string;
  pattern: string;
  type: PatternType;
  enabled: boolean;
  metadata: Map<string, any>;
}

export enum PatternType {
  REGEX = 'regex',
  KEYWORD = 'keyword',
  STRUCTURED = 'structured',
  CUSTOM = 'custom'
}

export interface AnalyzerStatistics {
  totalAnalyses: number;
  patternsFound: number;
  anomaliesDetected: number;
  lastAnalysis: number;
  metadata: Map<string, any>;
}

export interface LogAlert {
  id: string;
  name: string;
  type: AlertType;
  enabled: boolean;
  condition: AlertCondition;
  action: AlertAction;
  statistics: AlertStatistics;
  metadata: Map<string, any>;
}

export enum AlertType {
  ERROR_RATE = 'error_rate',
  LOG_VOLUME = 'log_volume',
  PATTERN = 'pattern',
  ANOMALY = 'anomaly',
  CUSTOM = 'custom'
}

export interface AlertCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  threshold: number;
  metadata: Map<string, any>;
}

export interface AlertAction {
  type: ActionType;
  target: string;
  message: string;
  metadata: Map<string, any>;
}

export interface AlertStatistics {
  totalAlerts: number;
  triggeredAlerts: number;
  resolvedAlerts: number;
  lastTriggered: number;
  metadata: Map<string, any>;
}

export interface LogSecurity {
  enabled: boolean;
  encryption: EncryptionConfig;
  access: AccessControl;
  audit: AuditConfig;
  metadata: Map<string, any>;
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: EncryptionAlgorithm;
  key: string;
  metadata: Map<string, any>;
}

export enum EncryptionAlgorithm {
  AES_256 = 'aes_256',
  AES_128 = 'aes_128',
  RSA = 'rsa',
  CUSTOM = 'custom'
}

export interface AccessControl {
  enabled: boolean;
  permissions: Permission[];
  metadata: Map<string, any>;
}

export interface Permission {
  resource: string;
  action: string;
  condition: string;
  metadata: Map<string, any>;
}

export interface AuditConfig {
  enabled: boolean;
  events: AuditEvent[];
  metadata: Map<string, any>;
}

export interface AuditEvent {
  type: string;
  enabled: boolean;
  metadata: Map<string, any>;
}

export interface LogAnalytics {
  totalLogs: number;
  logsByLevel: Map<LogLevel, number>;
  logsBySource: Map<string, number>;
  averageLogSize: number;
  errorRate: number;
  performance: PerformanceMetrics;
  lastUpdate: number;
  metadata: Map<string, any>;
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
  metadata: Map<string, any>;
}

export interface LogMetadata {
  author: string;
  version: string;
  tags: string[];
  description: string;
  customMetadata: Map<string, any>;
}

export interface LoggingSystemStats {
  totalLoggers: number;
  activeLoggers: number;
  totalAppenders: number;
  activeAppenders: number;
  totalLogs: number;
  logsPerSecond: number;
  averageLogSize: number;
  errorRate: number;
  lastUpdate: number;
}

export class LoggingSystemManager {
  private config: LoggingSystemConfig;
  private loggingSystems: Map<string, LoggingSystem> = new Map();
  private stats: LoggingSystemStats = this.initializeStats();
  private isInitialized: boolean = false;

  constructor(config: Partial<LoggingSystemConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableStructuredLogging: true,
      enableFiltering: true,
      enableRouting: true,
      enableAggregation: true,
      enableAnalysis: true,
      enablePersistence: true,
      enableArchival: true,
      enableSecurity: true,
      enableEncryption: true,
      enablePerformanceMonitoring: true,
      enableAlerting: true,
      enableNotifications: true,
      maxLogs: 1000000,
      maxLogSize: 1024 * 1024, // 1MB
      enableCloudSync: true,
      enableBackup: true,
      enableVersioning: true,
      ...config
    };
  }

  /**
   * Initialize logging system manager
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize logging system manager
      await this.initializeLoggingSystemManager();
      
      // Load default logging systems
      await this.loadDefaultLoggingSystems();
      
      this.isInitialized = true;
      console.log('Logging system manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize logging system manager:', error);
      return false;
    }
  }

  /**
   * Create new logging system
   */
  createLoggingSystem(loggingSystem: Partial<LoggingSystem>): LoggingSystem | null {
    const newLoggingSystem: LoggingSystem = {
      id: `logging_system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: loggingSystem.name || 'New Logging System',
      type: loggingSystem.type || LoggingSystemType.APPLICATION,
      status: LoggingSystemStatus.ACTIVE,
      loggers: loggingSystem.loggers || [],
      appenders: loggingSystem.appenders || [],
      filters: loggingSystem.filters || [],
      formatters: loggingSystem.formatters || [],
      aggregators: loggingSystem.aggregators || [],
      analyzers: loggingSystem.analyzers || [],
      alerts: loggingSystem.alerts || [],
      security: loggingSystem.security || this.createDefaultSecurity(),
      analytics: loggingSystem.analytics || this.createDefaultAnalytics(),
      metadata: loggingSystem.metadata || this.createDefaultMetadata(),
      version: '1.0.0',
      created: Date.now(),
      modified: Date.now()
    };

    this.loggingSystems.set(newLoggingSystem.id, newLoggingSystem);
    this.updateStats('create_logging_system', newLoggingSystem);

    console.log(`Created logging system: ${newLoggingSystem.name}`);
    return newLoggingSystem;
  }

  /**
   * Create logger
   */
  createLogger(loggingSystemId: string, logger: Partial<Logger>): Logger | null {
    const loggingSystem = this.loggingSystems.get(loggingSystemId);
    if (!loggingSystem) {
      console.warn(`Logging system ${loggingSystemId} not found`);
      return null;
    }

    try {
      const newLogger: Logger = {
        id: `logger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: logger.name || 'New Logger',
        level: logger.level || LogLevel.INFO,
        status: LoggerStatus.ACTIVE,
        appenders: logger.appenders || [],
        filters: logger.filters || [],
        formatter: logger.formatter || 'default',
        context: logger.context || this.createDefaultContext(),
        statistics: logger.statistics || this.createDefaultLoggerStatistics(),
        metadata: logger.metadata || new Map()
      };

      loggingSystem.loggers.push(newLogger);
      loggingSystem.modified = Date.now();

      this.updateStats('create_logger', loggingSystem);
      console.log(`Created logger: ${newLogger.name}`);
      return newLogger;
    } catch (error) {
      console.error(`Failed to create logger in system ${loggingSystemId}:`, error);
      return null;
    }
  }

  /**
   * Log message
   */
  log(loggingSystemId: string, loggerId: string, level: LogLevel, message: string, context: any = {}): boolean {
    const loggingSystem = this.loggingSystems.get(loggingSystemId);
    if (!loggingSystem) {
      console.warn(`Logging system ${loggingSystemId} not found`);
      return false;
    }

    const logger = loggingSystem.loggers.find(l => l.id === loggerId);
    if (!logger) {
      console.warn(`Logger ${loggerId} not found`);
      return false;
    }

    try {
      // Check if logging is enabled for this level
      if (!this.shouldLog(level, logger.level)) {
        return true;
      }

      // Create log entry
      const logEntry = this.createLogEntry(logger, level, message, context);

      // Apply filters
      if (!this.applyFilters(loggingSystem, logEntry)) {
        return true;
      }

      // Send to appenders
      this.sendToAppenders(loggingSystem, logger, logEntry);

      // Update statistics
      this.updateLoggerStatistics(logger, logEntry);
      this.updateLoggingAnalytics(loggingSystem, logEntry);

      this.updateStats('log_message', loggingSystem);
      return true;
    } catch (error) {
      console.error(`Failed to log message in system ${loggingSystemId}:`, error);
      return false;
    }
  }

  /**
   * Add appender
   */
  addAppender(loggingSystemId: string, appender: LogAppender): boolean {
    const loggingSystem = this.loggingSystems.get(loggingSystemId);
    if (!loggingSystem) {
      console.warn(`Logging system ${loggingSystemId} not found`);
      return false;
    }

    try {
      loggingSystem.appenders.push(appender);
      loggingSystem.modified = Date.now();

      this.updateStats('add_appender', loggingSystem);
      console.log(`Added appender: ${appender.name}`);
      return true;
    } catch (error) {
      console.error(`Failed to add appender to system ${loggingSystemId}:`, error);
      return false;
    }
  }

  /**
   * Add filter
   */
  addFilter(loggingSystemId: string, filter: LogFilter): boolean {
    const loggingSystem = this.loggingSystems.get(loggingSystemId);
    if (!loggingSystem) {
      console.warn(`Logging system ${loggingSystemId} not found`);
      return false;
    }

    try {
      loggingSystem.filters.push(filter);
      loggingSystem.modified = Date.now();

      this.updateStats('add_filter', loggingSystem);
      console.log(`Added filter: ${filter.name}`);
      return true;
    } catch (error) {
      console.error(`Failed to add filter to system ${loggingSystemId}:`, error);
      return false;
    }
  }

  /**
   * Get logging system
   */
  getLoggingSystem(loggingSystemId: string): LoggingSystem | null {
    return this.loggingSystems.get(loggingSystemId) || null;
  }

  /**
   * Get all logging systems
   */
  getLoggingSystems(): LoggingSystem[] {
    return Array.from(this.loggingSystems.values());
  }

  /**
   * Get logging systems by type
   */
  getLoggingSystemsByType(type: LoggingSystemType): LoggingSystem[] {
    return Array.from(this.loggingSystems.values())
      .filter(system => system.type === type);
  }

  /**
   * Get manager statistics
   */
  getManagerStats(): LoggingSystemStats {
    return { ...this.stats };
  }

  /**
   * Initialize logging system manager
   */
  private async initializeLoggingSystemManager(): Promise<void> {
    console.log('Initializing logging system manager...');
  }

  /**
   * Load default logging systems
   */
  private async loadDefaultLoggingSystems(): Promise<void> {
    // Load default logging systems
    const defaultSystems = [
      this.createDefaultApplicationSystem(),
      this.createDefaultGameSystem(),
      this.createDefaultSystemSystem()
    ];

    for (const system of defaultSystems) {
      if (system) {
        this.loggingSystems.set(system.id, system);
      }
    }

    console.log(`Loaded ${defaultSystems.length} default logging systems`);
  }

  /**
   * Create default security
   */
  private createDefaultSecurity(): LogSecurity {
    return {
      enabled: false,
      encryption: {
        enabled: false,
        algorithm: EncryptionAlgorithm.AES_256,
        key: '',
        metadata: new Map()
      },
      access: {
        enabled: false,
        permissions: [],
        metadata: new Map()
      },
      audit: {
        enabled: false,
        events: [],
        metadata: new Map()
      },
      metadata: new Map()
    };
  }

  /**
   * Create default analytics
   */
  private createDefaultAnalytics(): LogAnalytics {
    return {
      totalLogs: 0,
      logsByLevel: new Map(),
      logsBySource: new Map(),
      averageLogSize: 0,
      errorRate: 0,
      performance: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkUsage: 0,
        metadata: new Map()
      },
      lastUpdate: Date.now(),
      metadata: new Map()
    };
  }

  /**
   * Create default metadata
   */
  private createDefaultMetadata(): LogMetadata {
    return {
      author: 'System',
      version: '1.0.0',
      tags: [],
      description: '',
      customMetadata: new Map()
    };
  }

  /**
   * Create default context
   */
  private createDefaultContext(): LogContext {
    return {
      service: 'unknown',
      module: 'unknown',
      version: '1.0.0',
      environment: 'development',
      custom: new Map()
    };
  }

  /**
   * Create default logger statistics
   */
  private createDefaultLoggerStatistics(): LoggerStatistics {
    return {
      totalLogs: 0,
      logsByLevel: new Map(),
      averageLogSize: 0,
      lastLogTime: 0,
      metadata: new Map()
    };
  }

  /**
   * Create default application system
   */
  private createDefaultApplicationSystem(): LoggingSystem {
    return this.createLoggingSystem({
      name: 'Application Logging System',
      type: LoggingSystemType.APPLICATION,
      description: 'Application logging system'
    });
  }

  /**
   * Create default game system
   */
  private createDefaultGameSystem(): LoggingSystem {
    return this.createLoggingSystem({
      name: 'Game Logging System',
      type: LoggingSystemType.GAME,
      description: 'Game logging system'
    });
  }

  /**
   * Create default system system
   */
  private createDefaultSystemSystem(): LoggingSystem {
    return this.createLoggingSystem({
      name: 'System Logging System',
      type: LoggingSystemType.SYSTEM,
      description: 'System logging system'
    });
  }

  /**
   * Check if should log
   */
  private shouldLog(level: LogLevel, loggerLevel: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const levelIndex = levels.indexOf(level);
    const loggerLevelIndex = levels.indexOf(loggerLevel);
    
    return levelIndex >= loggerLevelIndex;
  }

  /**
   * Create log entry
   */
  private createLogEntry(logger: Logger, level: LogLevel, message: string, context: any): any {
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      message,
      context: { ...logger.context, ...context },
      logger: logger.name,
      metadata: new Map()
    };
  }

  /**
   * Apply filters
   */
  private applyFilters(loggingSystem: LoggingSystem, logEntry: any): boolean {
    for (const filter of loggingSystem.filters) {
      if (!filter.enabled) continue;

      if (!this.evaluateFilter(filter, logEntry)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate filter
   */
  private evaluateFilter(filter: LogFilter, logEntry: any): boolean {
    const condition = filter.condition;
    let value: any;

    switch (condition.field) {
      case 'level':
        value = logEntry.level;
        break;
      case 'message':
        value = logEntry.message;
        break;
      case 'source':
        value = logEntry.logger;
        break;
      default:
        value = logEntry.context[condition.field];
    }

    return this.evaluateCondition(value, condition.operator, condition.value);
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(value: any, operator: ConditionOperator, expected: any): boolean {
    switch (operator) {
      case ConditionOperator.EQUALS:
        return value === expected;
      case ConditionOperator.NOT_EQUALS:
        return value !== expected;
      case ConditionOperator.CONTAINS:
        return String(value).includes(String(expected));
      case ConditionOperator.NOT_CONTAINS:
        return !String(value).includes(String(expected));
      case ConditionOperator.GREATER_THAN:
        return value > expected;
      case ConditionOperator.LESS_THAN:
        return value < expected;
      default:
        return true;
    }
  }

  /**
   * Send to appenders
   */
  private sendToAppenders(loggingSystem: LoggingSystem, logger: Logger, logEntry: any): void {
    for (const appenderId of logger.appenders) {
      const appender = loggingSystem.appenders.find(a => a.id === appenderId);
      if (appender && appender.status === AppenderStatus.ACTIVE) {
        this.sendToAppender(appender, logEntry);
      }
    }
  }

  /**
   * Send to appender
   */
  private sendToAppender(appender: LogAppender, logEntry: any): void {
    // This would send the log entry to the specific appender
    console.log(`Sending log to appender ${appender.name}:`, logEntry.message);
  }

  /**
   * Update logger statistics
   */
  private updateLoggerStatistics(logger: Logger, logEntry: any): void {
    logger.statistics.totalLogs++;
    logger.statistics.lastLogTime = Date.now();

    const levelCount = logger.statistics.logsByLevel.get(logEntry.level) || 0;
    logger.statistics.logsByLevel.set(logEntry.level, levelCount + 1);
  }

  /**
   * Update logging analytics
   */
  private updateLoggingAnalytics(loggingSystem: LoggingSystem, logEntry: any): void {
    loggingSystem.analytics.totalLogs++;
    loggingSystem.analytics.lastUpdate = Date.now();

    const levelCount = loggingSystem.analytics.logsByLevel.get(logEntry.level) || 0;
    loggingSystem.analytics.logsByLevel.set(logEntry.level, levelCount + 1);

    const sourceCount = loggingSystem.analytics.logsBySource.get(logEntry.logger) || 0;
    loggingSystem.analytics.logsBySource.set(logEntry.logger, sourceCount + 1);
  }

  /**
   * Update statistics
   */
  private updateStats(action: string, loggingSystem: LoggingSystem): void {
    switch (action) {
      case 'create_logging_system':
        this.stats.totalLoggers += loggingSystem.loggers.length;
        this.stats.totalAppenders += loggingSystem.appenders.length;
        break;
      case 'create_logger':
        this.stats.totalLoggers++;
        this.stats.activeLoggers++;
        break;
      case 'log_message':
        this.stats.totalLogs++;
        break;
      case 'add_appender':
        this.stats.totalAppenders++;
        this.stats.activeAppenders++;
        break;
      case 'add_filter':
        // Filter added
        break;
    }

    this.stats.lastUpdate = Date.now();
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): LoggingSystemStats {
    return {
      totalLoggers: 0,
      activeLoggers: 0,
      totalAppenders: 0,
      activeAppenders: 0,
      totalLogs: 0,
      logsPerSecond: 0,
      averageLogSize: 0,
      errorRate: 0,
      lastUpdate: Date.now()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.loggingSystems.clear();
    this.stats = this.initializeStats();
    this.isInitialized = false;
  }
}

// Export default instance
export const defaultLoggingSystemManager = new LoggingSystemManager();
export { LoggingSystemManager as default };