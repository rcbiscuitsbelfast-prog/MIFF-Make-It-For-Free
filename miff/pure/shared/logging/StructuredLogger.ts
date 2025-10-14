/**
 * StructuredLogger - High-performance structured logging system
 * 
 * Replaces console.log statements with a structured logging system that
 * supports log levels, filtering, and performance optimization.
 * 
 * @version 1.0.0
 * @author MIFF Framework Performance Team
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface LogEntry {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  timestamp: string;
  level: LogLevel;
  message: string;
  module: string;
  context?: Record<string, any>;
  error?: Error;
  performance?: {
    duration?: number;
    memory?: number;
    cpu?: number;
  };
}

export interface LoggerConfig {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  maxEntries: number;
  flushInterval: number;
  performanceMonitoring: boolean;
  modules: {
    [moduleName: string]: LogLevel;
  };
}

export class StructuredLogger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];
  private timers: Map<string, number> = new Map();
  private performanceData: Map<string, number[]> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      maxEntries: 10000,
      flushInterval: 5000,
      performanceMonitoring: true,
      modules: {},
      ...config
    };

    this.startFlushTimer();
  }

  /**
   * Log an error message
   */
  error(): void {
    this.log(LogLevel.ERROR, module, message, context, error);
  }

  /**
   * Log a warning message
   */
  warn(): void {
    this.log(LogLevel.WARN, module, message, context);
  }

  /**
   * Log an info message
   */
  info(): void {
    this.log(LogLevel.INFO, module, message, context);
  }

  /**
   * Log a debug message
   */
  debug(): void {
    this.log(LogLevel.DEBUG, module, message, context);
  }

  /**
   * Log a trace message
   */
  trace(): void {
    this.log(LogLevel.TRACE, module, message, context);
  }

  /**
   * Start a performance timer
   */
  startTimer(): string {
    const timerId = `${module}:${operation}:${Date.now()}`;
    this.timers.set(timerId, performance.now());
    return timerId;
  }

  /**
   * End a performance timer and log the duration
   */
  endTimer(): number {
    const startTime = this.timers.get(timerId);
    if (!startTime) {
      this.warn('StructuredLogger', `Timer not found: ${timerId}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(timerId);

    // Track performance data
    if (this.config.performanceMonitoring) {
      const [module] = timerId.split(':');
      if (!this.performanceData.has(module)) {
        this.performanceData.set(module, []);
      }
      const data = this.performanceData.get(module)!;
      data.push(duration);
      if (data.length > 100) {
        data.shift(); // Keep only last 100 measurements
      }
    }

    // Log performance
    this.debug('StructuredLogger', `Timer completed: ${timerId}`, {
      ...context,
      duration: Math.round(duration * 100) / 100
    });

    return duration;
  }

  /**
   * Log performance metrics
   */
  logPerformance(): void {
    this.debug(module, `Performance: ${operation}`, {
      ...context,
      duration: Math.round(duration * 100) / 100,
      memory: this.getMemoryUsage(),
      cpu: this.getCPUUsage()
    });
  }

  /**
   * Get performance statistics for a module
   */
  getPerformanceStats(module: string): {
    average: number;
    min: number;
    max: number;
    count: number;
    p95: number;
    p99: number;
  } | null {
    const data = this.performanceData.get(module);
    if (!data || data.length === 0) {
      return null;
    }

    const sorted = [...data].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    const average = sum / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const p95Index = Math.floor(count * 0.95);
    const p99Index = Math.floor(count * 0.99);
    const p95 = sorted[p95Index];
    const p99 = sorted[p99Index];

    return { average, min, max, count, p95, p99 };
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, module: string, message: string, context?: Record<string, any>, error?: Error): void {
    // Check if logging is enabled for this module and level
    if (!this.shouldLog(module, level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      module,
      context,
      error,
      performance: this.config.performanceMonitoring ? {
        memory: this.getMemoryUsage(),
        cpu: this.getCPUUsage()
      } : undefined
    };

    // Add to entries
    this.entries.push(entry);

    // Trim entries if needed
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }

    // Output to console if enabled
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // Output to file if enabled
    if (this.config.enableFile) {
      this.outputToFile(entry);
    }

    // Output to remote if enabled
    if (this.config.enableRemote) {
      this.outputToRemote(entry);
    }
  }

  /**
   * Check if logging should occur for this module and level
   */
  private shouldLog(module: string, level: LogLevel): boolean {
    // Check global level
    if (level > this.config.level) {
      return false;
    }

    // Check module-specific level
    const moduleLevel = this.config.modules[module];
    if (moduleLevel !== undefined && level > moduleLevel) {
      return false;
    }

    return true;
  }

  /**
   * Output log entry to console
   */
  private outputToConsole(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp.split('T')[1].split('.')[0];
    const prefix = `[${timestamp}] [${levelName}] [${entry.module}]`;

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.context || '', entry.error || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.context || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.context || '');
        break;
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.context || '');
        break;
      case LogLevel.TRACE:
        console.trace(prefix, entry.message, entry.context || '');
        break;
    }
  }

  /**
   * Output log entry to file (placeholder)
   */
  private outputToFile(entry: LogEntry): void {
    // TODO: Implement in next phase
    // This would write to a log file with rotation
  }

  /**
   * Output log entry to remote (placeholder)
   */
  private outputToRemote(entry: LogEntry): void {
    // TODO: Implement in next phase
    // This would send logs to a remote service
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return Math.round(process.memoryUsage().heapUsed / 1024 / 1024); // MB
    }
    return 0;
  }

  /**
   * Get CPU usage (placeholder)
   */
  private getCPUUsage(): number {
    // TODO: Implement in next phase
    return 0;
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Flush logs (placeholder)
   */
  private flush(): void {
    // TODO: Implement in next phase
    // This would flush logs to file or remote service
  }

  /**
   * Get recent log entries
   */
  getRecentEntries(count: number = 100): LogEntry[] {
    return this.entries.slice(-count);
  }

  /**
   * Get log entries by module
   */
  getEntriesByModule(module: string, count: number = 100): LogEntry[] {
    return this.entries
      .filter(entry => entry.module === module)
      .slice(-count);
  }

  /**
   * Get log entries by level
   */
  getEntriesByLevel(level: LogLevel, count: number = 100): LogEntry[] {
    return this.entries
      .filter(entry => entry.level === level)
      .slice(-count);
  }

  /**
   * Clear all log entries
   */
  clear(): void {
    this.entries = [];
    this.timers.clear();
    this.performanceData.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(): void {
    this.config = { ...this.config, ...newConfig };
    this.startFlushTimer();
  }

  /**
   * Destroy logger and cleanup
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.clear();
  }
}

// Export default instance
export const logger = new StructuredLogger();
export { StructuredLogger as default };