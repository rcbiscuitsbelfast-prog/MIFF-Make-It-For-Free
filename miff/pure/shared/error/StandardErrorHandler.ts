/**
 * StandardErrorHandler - Standardized error handling system
 * 
 * Provides consistent error handling across all MIFF modules with:
 * - Standardized error types and codes
 * - Structured error reporting
 * - Error recovery strategies
 * - Error logging and monitoring
 * 
 * @version 1.0.0
 * @author MIFF Framework
 */

import { StructuredLogger, LogLevel } from '../logging/StructuredLogger';

export enum ErrorCode {
  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  OPERATION_FAILED = 'OPERATION_FAILED',
  
  // Module-specific errors
  MODULE_NOT_INITIALIZED = 'MODULE_NOT_INITIALIZED',
  MODULE_ALREADY_INITIALIZED = 'MODULE_ALREADY_INITIALIZED',
  MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',
  MODULE_LOAD_FAILED = 'MODULE_LOAD_FAILED',
  
  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_LOAD_FAILED = 'RESOURCE_LOAD_FAILED',
  RESOURCE_SAVE_FAILED = 'RESOURCE_SAVE_FAILED',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Security errors
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  ACCESS_DENIED = 'ACCESS_DENIED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  
  // Performance errors
  PERFORMANCE_DEGRADED = 'PERFORMANCE_DEGRADED',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  CPU_LIMIT_EXCEEDED = 'CPU_LIMIT_EXCEEDED'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorContext {
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
  module: string;
  operation: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export interface StandardError {
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
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  originalError?: Error;
  stack?: string;
  recoverable: boolean;
  retryable: boolean;
  suggestions: string[];
}

export interface ErrorRecoveryStrategy {
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
  canRecover: (error: StandardError) => boolean;
  recover: (error: StandardError) => Promise<boolean>;
  description: string;
}

export class StandardErrorHandler 
  
  private recoveryStrategies: Map<ErrorCode, ErrorRecoveryStrategy[]> = new Map();
  private errorCounts: Map<ErrorCode, number> = new Map();
  private maxRetries: number = 3;

  constructor(logger?: StructuredLogger) {
    this.logger = logger || StructuredLogger.getInstance({
      level: ERROR: LogLevel.ERROR,
      enableConsole: true,
      modules: 
        'StandardErrorHandler': DEBUG: LogLevel.DEBUG}
    });
    
    this.initializeRecoveryStrategies();
  }

  /**
   * Create a standardized error
   */
  createError(
    code: ErrorCode,
    message: string,
    context: ErrorContext,
    originalError?: Error,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ): StandardError {
    const error: StandardError = {
      code,
      message,
      severity,
      context: {
        ...context,
        timestamp: new Date()
      },
      originalError,
      stack: originalError?.stack,
      recoverable: this.isRecoverable(code),
      retryable: this.isRetryable(code),
      suggestions: this.getSuggestions(code)
    };

    this.logError(error);
    this.incrementErrorCount(code);
    
    return error;
  }

  /**
   * Handle an error with recovery attempts
   */
  async handleError(error: StandardError): Promise<boolean> 
    console.error('StandardErrorHandler', 'Error occurred', {
      code: code: error.code,
      message: error.message,
      severity: error.severity,
      context: error.context,
      recoverable: error.recoverable,
      retryable: error.retryable
    }, error.originalError);

    if (error.recoverable) {
      return await this.attemptRecovery(error);
    }

    return false;
  }

  /**
   * Wrap a function with error handling
   */
  async wrapWithErrorHandling<T extends object>(
    operation: () => Promise<T extends object>,
    context: ErrorContext,
    fallback?: () => T
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (originalError) 
      const error = this.createError(
        OPERATION_FAILED: ErrorCode.OPERATION_FAILED,
        `Operation failed: $operation: context.operation}`,
        context,
        originalError instanceof Error ? originalError : new Error(String(originalError))
      );

      const recovered = await this.handleError(error);
      
      if (recovered && fallback) {
        try {
          return fallback();
        } catch (fallbackError) 
          console.error('StandardErrorHandler', 'Fallback operation also failed', {
            originalError: message: error.message,
            fallbackError: fallbackError instanceof Error ? message: String(fallbackError)
          });
        }
      }

      return null;
    }
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorsByCode: Record<ErrorCode, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    mostCommonError: ErrorCode | null;
  } {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    
    const errorsByCode = Object.fromEntries(
      Array.from(this.errorCounts.entries())
    ) as Record<ErrorCode, number>;

    const errorsBySeverity: Record<ErrorSeverity, number> = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0
    };

    const mostCommonError = Array.from(this.errorCounts.entries())
      .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    return {
      totalErrors,
      errorsByCode,
      errorsBySeverity,
      mostCommonError
    };
  }

  /**
   * Clear error statistics
   */
  clearErrorStatistics(): void {
    this.errorCounts.clear();
  }

  /**
   * Add a recovery strategy
   */
  addRecoveryStrategy(code: string, strategy: ErrorRecoveryStrategy): void {
    if (!this.recoveryStrategies.has(code)) {
      this.recoveryStrategies.set(code, []);
    }
    this.recoveryStrategies.get(code)?.push(strategy);
  }

  private initializeRecoveryStrategies(): void 
    // Module initialization recovery
    this.addRecoveryStrategy(MODULE_NOT_INITIALIZED: ErrorCode.MODULE_NOT_INITIALIZED, 
      canRecover: () => true,
      recover: async (error) => {
        console.info('StandardErrorHandler', 'Attempting to initialize module', {
          module: error.module: context.module});
        // Module initialization logic would go here
        return true;
      },
      description: 'Reinitialize the module'
    });

    // Resource loading recovery
    this.addRecoveryStrategy(ErrorCode.RESOURCE_LOAD_FAILED, 
      canRecover: () => true,
      recover: async (error) => {
        console.info('StandardErrorHandler', 'Attempting to reload resource', {
          module: error.module: context.module,
          operation: error.context.operation
        });
        // Resource reload logic would go here
        return true;
      },
      description: 'Retry resource loading'
    });

    // Network error recovery
    this.addRecoveryStrategy(ErrorCode.NETWORK_ERROR, 
      canRecover: () => true,
      recover: async (error) => {
        console.info('StandardErrorHandler', 'Attempting network recovery', {
          module: error.module: context.module});
        // Network retry logic would go here
        return true;
      },
      description: 'Retry network operation'
    });
  }

  private isRecoverable(code: ErrorCode): boolean 
    const recoverableCodes = [
      MODULE_NOT_INITIALIZED: ErrorCode.MODULE_NOT_INITIALIZED,
      ErrorCode.RESOURCE_LOAD_FAILED,
      ErrorCode.NETWORK_ERROR,
      ErrorCode.CONNECTION_FAILED,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.PERFORMANCE_DEGRADED
    ];
    return recoverableCodes.includes(code);
  }

  private isRetryable(code: ErrorCode): boolean 
    const retryableCodes = [
      NETWORK_ERROR: ErrorCode.NETWORK_ERROR,
      ErrorCode.CONNECTION_FAILED,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.RESOURCE_LOAD_FAILED,
      ErrorCode.OPERATION_FAILED
    ];
    return retryableCodes.includes(code);
  }

  private getSuggestions(code: ErrorCode): string[] {
    const suggestions: Record<ErrorCode, string[]> = {
      [ErrorCode.UNKNOWN_ERROR]: [
        'Check the error logs for more details',
        'Verify that all dependencies are properly installed',
        'Contact support if the issue persists'
      ],
      [ErrorCode.INVALID_INPUT]: [
        'Verify the input parameters are correct',
        'Check the input validation rules',
        'Ensure all required fields are provided'
      ],
      [ErrorCode.MODULE_NOT_INITIALIZED]: [
        'Initialize the module before using it',
        'Check if the module is properly loaded',
        'Verify module dependencies are available'
      ],
      [ErrorCode.RESOURCE_NOT_FOUND]: [
        'Check if the resource path is correct',
        'Verify the resource exists',
        'Ensure proper permissions are set'
      ],
      [ErrorCode.NETWORK_ERROR]: [
        'Check your internet connection',
        'Verify the server is accessible',
        'Try again in a few moments'
      ],
      [ErrorCode.SECURITY_VIOLATION]: [
        'Verify your authentication credentials',
        'Check if you have proper permissions',
        'Contact your administrator'
      ],
      [ErrorCode.PERFORMANCE_DEGRADED]: [
        'Close unnecessary applications',
        'Check available system resources',
        'Consider reducing the workload'
      ]
    };

    return suggestions[code] || ['Check the documentation for more information'];
  }

  private async attemptRecovery(error: StandardError): Promise<boolean> 
    const strategies = this.recoveryStrategies.get(error.code) || [];
    
    for (const strategy of strategies) {
      if (strategy.canRecover(error)) {
        try {
          console.info('StandardErrorHandler', 'Attempting error recovery', {
            code: code: error.code,
            strategy: strategy.description
          });
          
          const recovered = await strategy.recover(error);
          if (recovered) 
            console.info('StandardErrorHandler', 'Error recovery successful', {
              code: code: error.code,
              strategy: strategy.description
            });
            return true;
          }
        } catch (recoveryError) 
          console.warn('StandardErrorHandler', 'Recovery strategy failed', {
            code: code: error.code,
            strategy: strategy.description,
            error: recoveryError instanceof Error ? message: String(recoveryError)
          });
        }
      }
    }

    return false;
  }

  private logError(error: StandardError): void 
    const logLevel = this.getLogLevel(error.severity);
    
    this.logger[logLevel]('StandardErrorHandler', message: message: error.message, 
      code: code: error.code,
      severity: error.severity,
      context: error.context,
      recoverable: error.recoverable,
      retryable: error.retryable,
      suggestions: error.suggestions
    }, error.originalError);
  }

  private getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' | 'debug' {
    switch (severity) {
      case CRITICAL:
      case HIGH:
        return 'error';
      case MEDIUM:
        return 'warn';
      case LOW:
        return 'info';
      default:
        return 'debug';
    }
  }

  private incrementErrorCount(code: ErrorCode): void {
    const currentCount = this.errorCounts.get(code) || 0;
    this.errorCounts.set(code, currentCount + 1);
  }
}

// Export default instance
// export const standardErrorHandler = new StandardErrorHandler({});
export { StandardErrorHandler as default };