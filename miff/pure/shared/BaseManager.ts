/**
 * BaseManager - Standardized Manager Base Class
 * 
 * Provides consistent patterns and interfaces for all MIFF Manager classes,
 * ensuring architectural consistency and maintainability across the framework.
 */

import { EventEmitter } from 'events';
import { MIFFCapable } from './MIFFCapable.js';

export interface ManagerConfig {
  id: string;
  name: string;
  version: string;
  enableLogging?: boolean;
  enableEvents?: boolean;
  enableMetrics?: boolean;
  maxCacheSize?: number;
  timeout?: number;
}

export interface ManagerState {
  initialized: boolean;
  running: boolean;
  paused: boolean;
  error?: Error;
  lastActivity: Date;
  operationCount: number;
  cacheSize: number;
}

export interface ManagerMetrics {
  operationsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  memory: number;
  cacheHitRate: number;
  uptime: number;
}

export interface ManagerOperation {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  success?: boolean;
  error?: Error;
  metadata?: Record<string, unknown>;
}

/**
 * Abstract base class for all MIFF Manager implementations
 * Provides standardized lifecycle, error handling, and monitoring
 */
export abstract class BaseManager extends EventEmitter {
  protected readonly config: ManagerConfig;
  protected state: ManagerState;
  protected metrics: ManagerMetrics;
  protected operations: Map<string, ManagerOperation> = new Map();
  protected cache: Map<string, unknown> = new Map();
  protected timers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: ManagerConfig) {
    super();
    this.config = {
      enableLogging: true,
      enableEvents: true,
      enableMetrics: true,
      maxCacheSize: 1000,
      timeout: 30000,
      ...config
    };

    this.state = {
      initialized: false,
      running: false,
      paused: false,
      lastActivity: new Date(),
      operationCount: 0,
      cacheSize: 0
    };

    this.metrics = {
      operationsPerSecond: 0,
      averageResponseTime: 0,
      errorRate: 0,
      memory: 0,
      cacheHitRate: 0,
      uptime: 0
    };

    // Set up metrics collection if enabled
    if (this.config.enableMetrics) {
      this.startMetricsCollection();
    }
  }

  /**
   * Initialize the manager - must be implemented by subclasses
   */
  public async initialize(): Promise<void> {
    if (this.state.initialized) {
      throw new Error(`Manager ${this.config.id} is already initialized`);
    }

    try {
      this.log('info', 'Initializing manager');
      await this.onInitialize();
      this.state.initialized = true;
      this.state.running = true;
      this.emit('initialized', { managerId: this.config.id });
      this.log('info', 'Manager initialized successfully');
    } catch (error) {
      this.state.error = error as Error;
      this.emit('error', { managerId: this.config.id, error });
      throw error;
    }
  }

  /**
   * Start the manager operations
   */
  public async start(): Promise<void> {
    if (!this.state.initialized) {
      throw new Error(`Manager ${this.config.id} must be initialized before starting`);
    }

    if (this.state.running) {
      this.log('warn', 'Manager is already running');
      return;
    }

    try {
      this.log('info', 'Starting manager');
      await this.onStart();
      this.state.running = true;
      this.state.paused = false;
      this.emit('started', { managerId: this.config.id });
      this.log('info', 'Manager started successfully');
    } catch (error) {
      this.state.error = error as Error;
      this.emit('error', { managerId: this.config.id, error });
      throw error;
    }
  }

  /**
   * Pause the manager operations
   */
  public async pause(): Promise<void> {
    if (!this.state.running) {
      throw new Error(`Manager ${this.config.id} is not running`);
    }

    try {
      this.log('info', 'Pausing manager');
      await this.onPause();
      this.state.paused = true;
      this.emit('paused', { managerId: this.config.id });
      this.log('info', 'Manager paused successfully');
    } catch (error) {
      this.state.error = error as Error;
      this.emit('error', { managerId: this.config.id, error });
      throw error;
    }
  }

  /**
   * Resume the manager operations
   */
  public async resume(): Promise<void> {
    if (!this.state.paused) {
      throw new Error(`Manager ${this.config.id} is not paused`);
    }

    try {
      this.log('info', 'Resuming manager');
      await this.onResume();
      this.state.paused = false;
      this.emit('resumed', { managerId: this.config.id });
      this.log('info', 'Manager resumed successfully');
    } catch (error) {
      this.state.error = error as Error;
      this.emit('error', { managerId: this.config.id, error });
      throw error;
    }
  }

  /**
   * Stop and cleanup the manager
   */
  public async destroy(): Promise<void> {
    try {
      this.log('info', 'Destroying manager');
      
      // Clear all timers
      for (const timer of this.timers.values()) {
        clearTimeout(timer);
      }
      this.timers.clear();

      // Clear cache
      this.cache.clear();

      // Call subclass cleanup
      await this.onDestroy();

      this.state.running = false;
      this.state.initialized = false;
      this.emit('destroyed', { managerId: this.config.id });
      this.log('info', 'Manager destroyed successfully');
    } catch (error) {
      this.state.error = error as Error;
      this.emit('error', { managerId: this.config.id, error });
      throw error;
    }
  }

  /**
   * Execute an operation with standardized tracking and error handling
   */
  protected async executeOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const operationId = `${operationName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const operationRecord: ManagerOperation = {
      id: operationId,
      name: operationName,
      startTime: new Date(),
      metadata
    };

    this.operations.set(operationId, operationRecord);
    this.state.operationCount++;
    this.state.lastActivity = new Date();

    try {
      this.log('debug', `Starting operation: ${operationName}`, { operationId, metadata });
      
      const result = await operation();
      
      operationRecord.endTime = new Date();
      operationRecord.success = true;
      
      this.emit('operationCompleted', { 
        managerId: this.config.id, 
        operationId, 
        operationName,
        duration: operationRecord.endTime.getTime() - operationRecord.startTime.getTime()
      });
      
      this.log('debug', `Completed operation: ${operationName}`, { operationId });
      
      return result;
    } catch (error) {
      operationRecord.endTime = new Date();
      operationRecord.success = false;
      operationRecord.error = error as Error;
      
      this.emit('operationFailed', { 
        managerId: this.config.id, 
        operationId, 
        operationName, 
        error 
      });
      
      this.log('error', `Failed operation: ${operationName}`, { operationId, error });
      
      throw error;
    } finally {
      // Clean up old operations to prevent memory leaks
      if (this.operations.size > 1000) {
        const oldestOperations = Array.from(this.operations.entries())
          .sort(([, a], [, b]) => a.startTime.getTime() - b.startTime.getTime())
          .slice(0, 500);
        
        for (const [id] of oldestOperations) {
          this.operations.delete(id);
        }
      }
    }
  }

  /**
   * Cache management utilities
   */
  protected setCacheValue(key: string, value: unknown, ttl?: number): void {
    if (this.cache.size >= this.config.maxCacheSize!) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
    this.state.cacheSize = this.cache.size;

    if (ttl) {
      const timer = setTimeout(() => {
        this.cache.delete(key);
        this.state.cacheSize = this.cache.size;
        this.timers.delete(key);
      }, ttl);
      
      this.timers.set(key, timer);
    }
  }

  protected getCacheValue<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  protected clearCache(): void {
    this.cache.clear();
    this.state.cacheSize = 0;
  }

  /**
   * Logging utility
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, metadata?: Record<string, unknown>): void {
    if (!this.config.enableLogging) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      managerId: this.config.id,
      message,
      metadata
    };

    // Emit log event for external logging systems
    if (this.config.enableEvents) {
      this.emit('log', logEntry);
    }

    // Basic console logging (can be replaced with proper logging system)
    console.log(`[${logEntry.timestamp}] ${level.toUpperCase()} [${this.config.id}]: ${message}`, metadata || '');
  }

  /**
   * Get current manager state
   */
  public getState(): ManagerState {
    return { ...this.state };
  }

  /**
   * Get current manager metrics
   */
  public getMetrics(): ManagerMetrics {
    return { ...this.metrics };
  }

  /**
   * Get manager configuration
   */
  public getConfig(): ManagerConfig {
    return { ...this.config };
  }

  /**
   * Health check
   */
  public isHealthy(): boolean {
    return this.state.initialized && 
           this.state.running && 
           !this.state.error &&
           (Date.now() - this.state.lastActivity.getTime()) < (this.config.timeout! * 2);
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    const metricsInterval = setInterval(() => {
      this.updateMetrics();
    }, 10000); // Update every 10 seconds

    this.timers.set('metrics', metricsInterval as any);
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    const now = Date.now();
    const recentOperations = Array.from(this.operations.values())
      .filter(op => op.endTime && (now - op.endTime.getTime()) < 60000); // Last minute

    if (recentOperations.length > 0) {
      this.metrics.operationsPerSecond = recentOperations.length / 60;
      
      const totalResponseTime = recentOperations.reduce((sum, op) => {
        return sum + (op.endTime!.getTime() - op.startTime.getTime());
      }, 0);
      this.metrics.averageResponseTime = totalResponseTime / recentOperations.length;
      
      const failedOperations = recentOperations.filter(op => !op.success);
      this.metrics.errorRate = failedOperations.length / recentOperations.length;
    }

    // Calculate cache hit rate (simplified)
    this.metrics.cacheHitRate = this.cache.size > 0 ? 0.8 : 0; // Placeholder calculation
    
    // Memory usage (simplified)
    this.metrics.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    
    // Uptime
    this.metrics.uptime = this.state.initialized ? now - this.state.lastActivity.getTime() : 0;
  }

  // Abstract methods that must be implemented by subclasses
  protected abstract onInitialize(): Promise<void>;
  protected abstract onStart(): Promise<void>;
  protected abstract onPause(): Promise<void>;
  protected abstract onResume(): Promise<void>;
  protected abstract onDestroy(): Promise<void>;
}

/**
 * Interface for managers that support MIFFCapable introspection
 */
export interface CapableManager extends BaseManager {
  getCapability(): MIFFCapable;
}

/**
 * Utility function to create a standardized manager configuration
 */
export function createManagerConfig(
  id: string,
  name: string,
  version: string = '1.0.0',
  options: Partial<ManagerConfig> = {}
): ManagerConfig {
  return {
    id,
    name,
    version,
    enableLogging: true,
    enableEvents: true,
    enableMetrics: true,
    maxCacheSize: 1000,
    timeout: 30000,
    ...options
  };
}