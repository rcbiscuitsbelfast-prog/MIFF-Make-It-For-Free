/**
 * MIFFError - Standardized error handling for MIFF framework
 * Provides consistent error structure and handling across all modules
 */

export enum ErrorCode {
  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  
  // Module errors
  MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',
  MODULE_INITIALIZATION_FAILED = 'MODULE_INITIALIZATION_FAILED',
  MODULE_DEPENDENCY_MISSING = 'MODULE_DEPENDENCY_MISSING',
  
  // Security errors
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  REQUEST_FAILED = 'REQUEST_FAILED',
  
  // File system errors
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  QUERY_FAILED = 'QUERY_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  
  // Game logic errors
  GAME_STATE_ERROR = 'GAME_STATE_ERROR',
  INVALID_ACTION = 'INVALID_ACTION',
  RESOURCE_UNAVAILABLE = 'RESOURCE_UNAVAILABLE',
  
  // Performance errors
  PERFORMANCE_ERROR = 'PERFORMANCE_ERROR',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR'
}

export interface ErrorContext {
  module?: string;
  function?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  timestamp?: string;
  stack?: string;
  [key: string]: any;
}

export class MIFFError extends Error {
  public readonly code: ErrorCode;
  public readonly context: ErrorContext;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly module: string;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    context: ErrorContext = {},
    isOperational: boolean = true
  ) {
    super(message);
    
    this.name = 'MIFFError';
    this.code = code;
    this.context = {
      timestamp: new Date().toISOString(),
      ...context
    };
    this.isOperational = isOperational;
    this.timestamp = this.context.timestamp!;
    this.module = context.module || 'Unknown';

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, MIFFError.prototype);

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MIFFError);
    }
  }

  /**
   * Create error from another error
   */
  static fromError(
    error: Error,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    context: ErrorContext = {}
  ): MIFFError {
    return new MIFFError(
      error.message,
      code,
      {
        ...context,
        originalError: error.name,
        originalStack: error.stack
      }
    );
  }

  /**
   * Create validation error
   */
  static validation(
    message: string,
    field?: string,
    value?: any,
    context: ErrorContext = {}
  ): MIFFError {
    return new MIFFError(
      message,
      ErrorCode.VALIDATION_ERROR,
      {
        ...context,
        field,
        value
      }
    );
  }

  /**
   * Create security error
   */
  static security(
    message: string,
    violation: string,
    context: ErrorContext = {}
  ): MIFFError {
    return new MIFFError(
      message,
      ErrorCode.SECURITY_VIOLATION,
      {
        ...context,
        violation
      }
    );
  }

  /**
   * Create module error
   */
  static module(
    message: string,
    moduleName: string,
    operation: string,
    context: ErrorContext = {}
  ): MIFFError {
    return new MIFFError(
      message,
      ErrorCode.MODULE_INITIALIZATION_FAILED,
      {
        ...context,
        module: moduleName,
        operation
      }
    );
  }

  /**
   * Create network error
   */
  static network(
    message: string,
    url?: string,
    statusCode?: number,
    context: ErrorContext = {}
  ): MIFFError {
    return new MIFFError(
      message,
      ErrorCode.NETWORK_ERROR,
      {
        ...context,
        url,
        statusCode
      }
    );
  }

  /**
   * Create performance error
   */
  static performance(
    message: string,
    metric: string,
    value: number,
    threshold: number,
    context: ErrorContext = {}
  ): MIFFError {
    return new MIFFError(
      message,
      ErrorCode.PERFORMANCE_ERROR,
      {
        ...context,
        metric,
        value,
        threshold
      }
    );
  }

  /**
   * Check if error is operational
   */
  isOperationalError(): boolean {
    return this.isOperational;
  }

  /**
   * Get error severity
   */
  getSeverity(): 'low' | 'medium' | 'high' | 'critical' {
    switch (this.code) {
      case SECURITY_VIOLATION:
      case UNAUTHORIZED_ACCESS:
        return 'critical';
      case MODULE_INITIALIZATION_FAILED:
      case DATABASE_ERROR:
      case MEMORY_LIMIT_EXCEEDED:
        return 'high';
      case NETWORK_ERROR:
      case PERFORMANCE_ERROR:
      case TIMEOUT_ERROR:
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      isOperational: this.isOperational,
      timestamp: this.timestamp,
      module: this.module,
      severity: this.getSeverity()
    };
  }

  /**
   * Convert to string
   */
  toString(): string {
    return `${this.name}: ${this.message} (${this.code})`;
  }

  /**
   * Get user-friendly message
   */
  getUserMessage(): string {
    switch (this.code) {
      case VALIDATION_ERROR:
        return 'Please check your input and try again.';
      case SECURITY_VIOLATION:
        return 'A security issue was detected. Please contact support.';
      case MODULE_NOT_FOUND:
        return 'The requested feature is not available.';
      case NETWORK_ERROR:
        return 'Network connection failed. Please check your internet connection.';
      case PERFORMANCE_ERROR:
        return 'The operation is taking longer than expected. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

// Export convenience functions
export const createError = (
  message: string,
  code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
  context: ErrorContext = {}
): MIFFError => new MIFFError(message, code, context);

export const createValidationError = (
  message: string,
  field?: string,
  value?: any,
  context: ErrorContext = {}
): MIFFError => MIFFError.validation(message, field, value, context);

export const createSecurityError = (
  message: string,
  violation: string,
  context: ErrorContext = {}
): MIFFError => MIFFError.security(message, violation, context);

export const createModuleError = (
  message: string,
  moduleName: string,
  operation: string,
  context: ErrorContext = {}
): MIFFError => MIFFError.module(message, moduleName, operation, context);