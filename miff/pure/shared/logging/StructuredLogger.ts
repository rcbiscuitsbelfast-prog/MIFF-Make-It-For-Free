/**
 * StructuredLogger - High-performance structured logging system
 * Replaces console.log with structured, production-ready logging
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  module?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  duration?: number;
  error?: {
    name: string;
    stack?: string;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  maxBufferSize: number;
  flushInterval: number;
  remoteEndpoint?: string;
  filePath?: string;
}

export class StructuredLogger {
  private static instance: StructuredLogger;
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;

  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      maxBufferSize: 1000,
      flushInterval: 5000,
      ...config
    };

    if (this.config.enableFile! || this.config.enableRemote) {
      this.startFlushTimer();
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<LoggerConfig>): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger(config);
    }
    return StructuredLogger.instance;
  }

  /**
   * Log error message
   */
  static error(message: string, context?: Record<string, any>, module?: string): void {
    StructuredLogger.getInstance().log(LogLevel.ERROR, message, context, module);
  }

  /**
   * Log warning message
   */
  static warn(message: string, context?: Record<string, any>, module?: string): void {
    StructuredLogger.getInstance().log(LogLevel.WARN, message, context, module);
  }

  /**
   * Log info message
   */
  static info(message: string, context?: Record<string, any>, module?: string): void {
    StructuredLogger.getInstance().log(LogLevel.INFO, message, context, module);
  }

  /**
   * Log debug message
   */
  static debug(message: string, context?: Record<string, any>, module?: string): void {
    StructuredLogger.getInstance().log(LogLevel.DEBUG, message, context, module);
  }

  /**
   * Log trace message
   */
  static trace(message: string, context?: Record<string, any>, module?: string): void {
    StructuredLogger.getInstance().log(LogLevel.TRACE, message, context, module);
  }

  /**
   * Log performance metric
   */
  static performance(
    operation: string, 
    duration: number, 
    context?: Record<string, any>
  ): void {
    StructuredLogger.getInstance().log(
      LogLevel.INFO, 
      `Performance: ${operation}`, 
      { ...context, duration, operation }, 
      'Performance'
    );
  }

  /**
   * Log security event
   */
  static security(
    event: string, 
    context?: Record<string, any>
  ): void {
    StructuredLogger.getInstance().log(
      LogLevel.WARN, 
      `Security: ${event}`, 
      { ...context, event }, 
      'Security'
    );
  }

  /**
   * Log business event
   */
  static business(
    event: string, 
    context?: Record<string, any>
  ): void {
    StructuredLogger.getInstance().log(
      LogLevel.INFO, 
      `Business: ${event}`, 
      { ...context, event }, 
      'Business'
    );
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel, 
    message: string, 
    context?: Record<string, any>, 
    module?: string
  ): void {
    if (level > this.config.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.sanitizeContext(context),
      module
    };

    // Add to buffer
    this.buffer.push(entry);

    // Output to console if enabled
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // Flush if buffer is full
    if (this.buffer.length >= this.config.maxBufferSize) {
      this.flush();
    }
  }

  /**
   * Output to console with appropriate formatting
   */
  private outputToConsole(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp;
    const module = entry.module ? `[${entry.module}]` : '';
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    
    const formattedMessage = `${timestamp} ${levelName} ${module} ${entry.message}${context}`;

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.TRACE:
        console.trace(formattedMessage);
        break;
    }
  }

  /**
   * Sanitize context to prevent sensitive data leakage
   */
  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;

    const sanitized = { ...context };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential'];

    for (const key in sanitized) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key!] = '[REDACTED!]';
      }
    }

    return sanitized;
  }

  /**
   * Start flush timer for file/remote logging
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Flush buffer to outputs
   */
  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const entries = [...this.buffer];
    this.buffer = [];

    try {
      if (this.config.enableFile) {
        await this.writeToFile(entries);
      }

      if (this.config.enableRemote) {
        await this.sendToRemote(entries);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Failed to flush logs:', err instanceof Error ? err.message : String(err));
    }
  }

  /**
   * Write logs to file
   */
  private async writeToFile(entries: LogEntry[]): Promise<void> {
    // Implementation would depend on file system access
    // For now, just log to console
    console.log(`Would write ${entries.length} entries to file`);
  }

  /**
   * Send logs to remote endpoint
   */
  private async sendToRemote(entries: LogEntry[]): Promise<void> {
    // Implementation would depend on HTTP client
    // For now, just log to console
    console.log(`Would send ${entries.length} entries to remote`);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current buffer size
   */
  getBufferSize(): number {
    return this.buffer.length;
  }

  /**
   * Force flush
   */
  async forceFlush(): Promise<void> {
    await this.flush();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Export convenience functions
export const log = {
  error: StructuredLogger.error,
  warn: StructuredLogger.warn,
  info: StructuredLogger.info,
  debug: StructuredLogger.debug,
  trace: StructuredLogger.trace,
  performance: StructuredLogger.performance,
  security: StructuredLogger.security,
  business: StructuredLogger.business
};