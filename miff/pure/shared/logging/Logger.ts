/**
 * Structured Logger for MIFF Framework
 * 
 * Professional logging utility to replace console.log throughout the codebase.
 * Provides log levels, context, timestamps, and production-safe logging.
 * 
 * @version 1.0.0
 * @author MIFF Framework Team
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  module: string;
  message: string;
  context?: LogContext;
  error?: Error;
}

export interface LoggerConfig {
  minLevel?: LogLevel;
  enableConsole?: boolean;
  enableFile?: boolean;
  enableRemote?: boolean;
  formatJson?: boolean;
  includeStackTrace?: boolean;
}

/**
 * Structured Logger Class
 * 
 * Usage:
 * ```typescript
 * const logger = Logger.create('ModuleName');
 * logger.info('User action', { userId: 123, action: 'click' });
 * logger.error('Operation failed', { error });
 * ```
 */
export class Logger {
  private module: string;
  private config: LoggerConfig;
  private static globalConfig: LoggerConfig = {
    minLevel: LogLevel.INFO,
    enableConsole: true,
    enableFile: false,
    enableRemote: false,
    formatJson: false,
    includeStackTrace: false
  };

  private constructor(module: string, config?: Partial<LoggerConfig>) {
    this.module = module;
    this.config = { ...Logger.globalConfig, ...config };
  }

  /**
   * Create a new logger instance for a module
   * 
   * @param module - Name of the module (e.g., 'TeamsPure', 'EventBus')
   * @param config - Optional logger configuration
   * @returns Logger instance
   */
  public static create(module: string, config?: Partial<LoggerConfig>): Logger {
    return new Logger(module, config);
  }

  /**
   * Configure global logger settings
   * 
   * @param config - Global configuration
   */
  public static configure(config: Partial<LoggerConfig>): void {
    Logger.globalConfig = { ...Logger.globalConfig, ...config };
  }

  /**
   * Debug level logging (development only)
   * 
   * @param message - Log message
   * @param context - Optional context data
   */
  public debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info level logging (general information)
   * 
   * @param message - Log message
   * @param context - Optional context data
   */
  public info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning level logging (potential issues)
   * 
   * @param message - Log message
   * @param context - Optional context data
   */
  public warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Error level logging (recoverable errors)
   * 
   * @param message - Log message
   * @param context - Optional context data with error
   */
  public error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Fatal level logging (unrecoverable errors)
   * 
   * @param message - Log message
   * @param context - Optional context data with error
   */
  public fatal(message: string, context?: LogContext): void {
    this.log(LogLevel.FATAL, message, context);
  }

  /**
   * Core logging method
   * 
   * @param level - Log level
   * @param message - Log message
   * @param context - Optional context data
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    // Check if log level meets minimum threshold
    if (level < this.config.minLevel!) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      module: this.module,
      message,
      context
    };

    // Extract error from context if present
    if (context?.error instanceof Error) {
      entry.error = context.error;
      delete context.error;
    }

    // Output to console if enabled
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Output to file if enabled (future implementation)
    if (this.config.enableFile) {
      this.logToFile(entry);
    }

    // Send to remote logging service if enabled (future implementation)
    if (this.config.enableRemote) {
      this.logToRemote(entry);
    }
  }

  /**
   * Format and output log entry to console
   * 
   * @param entry - Log entry to output
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelName}] [${entry.module}]`;

    if (this.config.formatJson) {
      // JSON format for log aggregation
      console.log(JSON.stringify(entry));
    } else {
      // Human-readable format
      const parts = [prefix, entry.message];
      
      if (entry.context && Object.keys(entry.context).length > 0) {
        parts.push(JSON.stringify(entry.context, null, 2));
      }

      if (entry.error) {
        parts.push(`Error: ${entry.error.message}`);
        if (this.config.includeStackTrace && entry.error.stack) {
          parts.push(entry.error.stack);
        }
      }

      const logMessage = parts.join(' ');

      // Use appropriate console method
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(logMessage);
          break;
        case LogLevel.INFO:
          console.info(logMessage);
          break;
        case LogLevel.WARN:
          console.warn(logMessage);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(logMessage);
          break;
      }
    }
  }

  /**
   * Write log entry to file (future implementation)
   * 
   * @param entry - Log entry to write
   */
  private logToFile(entry: LogEntry): void {
    // TODO: Implement file logging
    // - Rotate logs daily
    // - Compress old logs
    // - Max file size limits
  }

  /**
   * Send log entry to remote service (future implementation)
   * 
   * @param entry - Log entry to send
   */
  private logToRemote(entry: LogEntry): void {
    // TODO: Implement remote logging
    // - Send to log aggregation service (e.g., Logtail, Papertrail)
    // - Batch requests
    // - Retry on failure
  }

  /**
   * Create a child logger with additional context
   * 
   * @param childModule - Child module name
   * @returns New logger instance
   */
  public child(childModule: string): Logger {
    return Logger.create(`${this.module}.${childModule}`, this.config);
  }

  /**
   * Flush any pending logs (for graceful shutdown)
   */
  public async flush(): Promise<void> {
    // TODO: Implement log flushing for async transports
    await Promise.resolve();
  }
}

/**
 * Global logger instance for quick access
 */
export const globalLogger = Logger.create('MIFF');

/**
 * Helper function to configure logger for production
 */
export function configureProductionLogging(): void {
  Logger.configure({
    minLevel: LogLevel.INFO,
    enableConsole: false,
    enableFile: true,
    enableRemote: true,
    formatJson: true,
    includeStackTrace: false
  });
}

/**
 * Helper function to configure logger for development
 */
export function configureDevelopmentLogging(): void {
  Logger.configure({
    minLevel: LogLevel.DEBUG,
    enableConsole: true,
    enableFile: false,
    enableRemote: false,
    formatJson: false,
    includeStackTrace: true
  });
}

export default Logger;
