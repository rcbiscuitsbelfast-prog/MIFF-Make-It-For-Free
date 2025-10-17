/**
 * IntegrationManager.ts - Advanced Integration Management System
 *
 * Provides comprehensive integration capabilities for:
 * - Cross-module communication and coordination
 * - Event-driven architecture with advanced routing
 * - Plugin system for extensibility
 * - Performance monitoring and optimization
 * - Error handling and recovery
 * - Configuration management
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../../EventBusPure/index.js';

// ============================================================================
// INTEGRATION MANAGER INTERFACES
// ============================================================================

export enum IntegrationType {
  CORE = 'core',
  PLUGIN = 'plugin',
  EXTERNAL = 'external',
  BRIDGE = 'bridge',
  ADAPTER = 'adapter'
}

export enum IntegrationStatus {
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  DISABLED = 'disabled',
  UPDATING = 'updating'
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: IntegrationType;
  version: string;
  priority: number;
  dependencies: string[];
  enabled: boolean;
  autoStart: boolean;
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
  healthCheckInterval: number;
  maxMemoryUsage: number;
  maxCpuUsage: number;
  settings: Record<string, any>;
}

export interface IntegrationHealth {
  status: IntegrationStatus;
  lastCheck: Date;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  errorCount: number;
  successCount: number;
  averageResponseTime: number;
  lastError?: Error;
  metrics: Record<string, any>;
}

export interface IntegrationEvent {
  id: string;
  integrationId: string;
  type: string;
  data: any;
  timestamp: Date;
  priority: number;
  source: string;
  target?: string;
  correlationId?: string;
}

export interface IntegrationHook {
  id: string;
  integrationId: string;
  event: string;
  handler: (event: IntegrationEvent) => void | Promise<void>;
  priority: number;
  enabled: boolean;
  async: boolean;
  timeout: number;
}

export interface IntegrationMetrics {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  averageProcessingTime: number;
  peakMemoryUsage: number;
  peakCpuUsage: number;
  lastActivity: Date;
  errorRate: number;
  throughput: number;
}

export interface IntegrationManagerConfig {
  eventBus: EventBus;
  maxIntegrations: number;
  defaultTimeout: number;
  healthCheckInterval: number;
  metricsRetentionDays: number;
  enablePerformanceMonitoring: boolean;
  enableErrorRecovery: boolean;
  enableAutoScaling: boolean;
}

/**
 * Integration Manager - Core integration functionality
 */
export class IntegrationManager {
  private eventBus: EventBus;
  private config: IntegrationManagerConfig;
  private integrations: Map<string, IntegrationConfig> = new Map();
  private healthStatus: Map<string, IntegrationHealth> = new Map();
  private hooks: Map<string, IntegrationHook[]> = new Map();
  private metrics: Map<string, IntegrationMetrics> = new Map();
  private eventQueue: IntegrationEvent[] = [];
  private isProcessing: boolean = false;
  private healthCheckTimer?: NodeJS.Timeout;
  private metricsTimer?: NodeJS.Timeout;

  constructor(config: IntegrationManagerConfig) {
    this.eventBus = config.eventBus;
    this.config = config;
    this.initialize();
  }

  /**
   * Initialize integration manager
   */
  private initialize(): void {
    // Set up event listeners
    this.setupEventListeners();
    
    // Start health monitoring
    if (this.config.healthCheckInterval > 0) {
      this.startHealthMonitoring();
    }
    
    // Start metrics collection
    if (this.config.enablePerformanceMonitoring) {
      this.startMetricsCollection();
    }
    
    // Start event processing
    this.startEventProcessing();
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    this.eventBus.subscribe('integration:register', (data) => {
      this.registerIntegration(data);
    });
    
    this.eventBus.subscribe('integration:unregister', (data) => {
      this.unregisterIntegration(data.id);
    });
    
    this.eventBus.subscribe('integration:event', (data) => {
      this.processEvent(data);
    });
  }

  /**
   * Register integration
   */
  registerIntegration(config: IntegrationConfig): boolean {
    try {
      // Validate configuration
      if (!this.validateConfig(config)) {
        throw new Error(`Invalid configuration for integration ${config.id}`);
      }

      // Check dependencies
      if (!this.checkDependencies(config.dependencies)) {
        throw new Error(`Missing dependencies for integration ${config.id}`);
      }

      // Store configuration
      this.integrations.set(config.id, config);
      
      // Initialize health status
      this.healthStatus.set(config.id, {
        status: IntegrationStatus.INITIALIZING,
        lastCheck: new Date(),
        uptime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        errorCount: 0,
        successCount: 0,
        averageResponseTime: 0,
        metrics: {}
      });

      // Initialize metrics
      this.metrics.set(config.id, {
        totalEvents: 0,
        successfulEvents: 0,
        failedEvents: 0,
        averageProcessingTime: 0,
        peakMemoryUsage: 0,
        peakCpuUsage: 0,
        lastActivity: new Date(),
        errorRate: 0,
        throughput: 0
      });

      // Auto-start if enabled
      if (config.autoStart) {
        this.startIntegration(config.id);
      }

      this.eventBus.publish('integration:registered', { id: config.id, config });
      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.eventBus.publish('integration:error', { id: config.id, error });
      return false;
    }
  }

  /**
   * Unregister integration
   */
  unregisterIntegration(integrationId: string): boolean {
    const config = this.integrations.get(integrationId);
    if (!config) {
      return false;
    }

    // Stop integration if running
    this.stopIntegration(integrationId);
    
    // Remove from all maps
    this.integrations.delete(integrationId);
    this.healthStatus.delete(integrationId);
    this.metrics.delete(integrationId);
    this.hooks.delete(integrationId);
    
    this.eventBus.publish('integration:unregistered', { id: integrationId });
    return true;
  }

  /**
   * Start integration
   */
  startIntegration(integrationId: string): boolean {
    const config = this.integrations.get(integrationId);
    if (!config || !config.enabled) {
      return false;
    }

    const health = this.healthStatus.get(integrationId);
    if (!health) {
      return false;
    }

    try {
      health.status = IntegrationStatus.ACTIVE;
      health.lastCheck = new Date();
      
      this.eventBus.publish('integration:started', { id: integrationId });
      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      health.status = IntegrationStatus.ERROR;
      health.lastError = error as Error;
      this.eventBus.publish('integration:error', { id: integrationId, error });
      return false;
    }
  }

  /**
   * Stop integration
   */
  stopIntegration(integrationId: string): boolean {
    const health = this.healthStatus.get(integrationId);
    if (!health) {
      return false;
    }

    health.status = IntegrationStatus.INACTIVE;
    health.lastCheck = new Date();
    
    this.eventBus.publish('integration:stopped', { id: integrationId });
    return true;
  }

  /**
   * Add integration hook
   */
  addHook(hook: IntegrationHook): boolean {
    const hooks = this.hooks.get(hook.integrationId) || [];
    hooks.push(hook);
    hooks.sort((a: any, b: any) => b.priority - a.priority);
    this.hooks.set(hook.integrationId, hooks);
    return true;
  }

  /**
   * Remove integration hook
   */
  removeHook(integrationId: string, hookId: string): boolean {
    const hooks = this.hooks.get(integrationId);
    if (!hooks) {
      return false;
    }

    const index = hooks.findIndex(h => h.id === hookId);
    if (index === -1) {
      return false;
    }

    hooks.splice(index, 1);
    return true;
  }

  /**
   * Process integration event
   */
  processEvent(event: IntegrationEvent): void {
    this.eventQueue.push(event);
    
    if (!this.isProcessing) {
      this.processEventQueue();
    }
  }

  /**
   * Process event queue
   */
  private async processEventQueue(): Promise<void> {
    this.isProcessing = true;
    
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (!event) continue;

      await this.handleEvent(event);
    }
    
    this.isProcessing = false;
  }

  /**
   * Handle individual event
   */
  private async handleEvent(event: IntegrationEvent): Promise<void> {
    const startTime = Date.now();
    const integrationId = event.integrationId;
    const hooks = this.hooks.get(integrationId) || [];
    const metrics = this.metrics.get(integrationId);
    
    if (!metrics) {
      return;
    }

    try {
      // Execute hooks
      for (const hook of hooks) {
        if (!hook.enabled || hook.event !== event.type) {
          continue;
        }

        if (hook.async) {
          await this.executeHookAsync(hook, event);
        } else {
          this.executeHook(hook, event);
        }
      }

      // Update metrics
      const processingTime = Date.now() - startTime;
      this.updateMetrics(integrationId, true, processingTime);
      
      this.eventBus.publish('integration:eventProcessed', { event, processingTime });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.updateMetrics(integrationId, false, Date.now() - startTime);
      this.eventBus.publish('integration:eventError', { event, error });
    }
  }

  /**
   * Execute hook synchronously
   */
  private executeHook(hook: IntegrationHook, event: IntegrationEvent): void {
    try {
      hook.handler(event);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.eventBus.publish('integration:hookError', { hook, event, error });
    }
  }

  /**
   * Execute hook asynchronously
   */
  private async executeHookAsync(hook: IntegrationHook, event: IntegrationEvent): Promise<void> {
    try {
      await Promise.race([
        hook.handler(event),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Hook timeout')), hook.timeout)
        )
      ]);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.eventBus.publish('integration:hookError', { hook, event, error });
    }
  }

  /**
   * Update integration metrics
   */
  private updateMetrics(integrationId: string, success: boolean, processingTime: number): void {
    const metrics = this.metrics.get(integrationId);
    if (!metrics) return;

    metrics.totalEvents++;
    if (success) {
      metrics.successfulEvents++;
    } else {
      metrics.failedEvents++;
    }

    // Update average processing time
    metrics.averageProcessingTime = 
      (metrics.averageProcessingTime * (metrics.totalEvents - 1) + processingTime) / 
      metrics.totalEvents;

    // Update error rate
    metrics.errorRate = (metrics.failedEvents / metrics.totalEvents) * 100;

    // Update throughput (events per second)
    const now = Date.now();
    const timeDiff = now - metrics.lastActivity.getTime();
    if (timeDiff > 0) {
      metrics.throughput = (metrics.totalEvents / timeDiff) * 1000;
    }
    metrics.lastActivity = new Date();
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform health checks
   */
  private performHealthChecks(): void {
    for (const [integrationId, health] of this.healthStatus) {
      this.checkIntegrationHealth(integrationId, health);
    }
  }

  /**
   * Check individual integration health
   */
  private checkIntegrationHealth(integrationId: string, health: IntegrationHealth): void {
    const now = new Date();
    const config = this.integrations.get(integrationId);
    
    if (!config) {
      return;
    }

    // Update uptime
    health.uptime = now.getTime() - health.lastCheck.getTime();
    health.lastCheck = now;

    // Check memory usage
    if (process.memoryUsage) {
      const memUsage = process.memoryUsage();
      health.memoryUsage = memUsage.heapUsed / 1024 / 1024; // MB
      
      if (health.memoryUsage > config.maxMemoryUsage) {
        health.status = IntegrationStatus.ERROR;
        this.eventBus.publish('integration:memoryWarning', { id: integrationId, usage: health.memoryUsage });
      }
    }

    // Check error rate
    const metrics = this.metrics.get(integrationId);
    if (metrics && metrics.errorRate > 50) {
      health.status = IntegrationStatus.ERROR;
      this.eventBus.publish('integration:errorRateWarning', { id: integrationId, rate: metrics.errorRate });
    }

    // Auto-recovery
    if (this.config.enableErrorRecovery && health.status === IntegrationStatus.ERROR) {
      this.attemptRecovery(integrationId);
    }
  }

  /**
   * Attempt integration recovery
   */
  private attemptRecovery(integrationId: string): void {
    const config = this.integrations.get(integrationId);
    const health = this.healthStatus.get(integrationId);
    
    if (!config || !health) {
      return;
    }

    if (health.errorCount < config.retryAttempts) {
      health.errorCount++;
      health.status = IntegrationStatus.INITIALIZING;
      
      setTimeout(() => {
        this.startIntegration(integrationId);
      }, config.retryDelay);
      
      this.eventBus.publish('integration:recoveryAttempted', { id: integrationId, attempt: health.errorCount });
    } else {
      health.status = IntegrationStatus.DISABLED;
      this.eventBus.publish('integration:recoveryFailed', { id: integrationId });
    }
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsTimer = setInterval(() => {
      this.collectMetrics();
    }, 60000); // Every minute
  }

  /**
   * Collect system metrics
   */
  private collectMetrics(): void {
    for (const [integrationId, health] of this.healthStatus) {
      const metrics = this.metrics.get(integrationId);
      if (!metrics) continue;

      // Update peak usage
      if (health.memoryUsage > metrics.peakMemoryUsage) {
        metrics.peakMemoryUsage = health.memoryUsage;
      }
      if (health.cpuUsage > metrics.peakCpuUsage) {
        metrics.peakCpuUsage = health.cpuUsage;
      }
    }
  }

  /**
   * Start event processing
   */
  private startEventProcessing(): void {
    setInterval(() => {
      if (!this.isProcessing && this.eventQueue.length > 0) {
        this.processEventQueue();
      }
    }, 100);
  }

  /**
   * Validate integration configuration
   */
  private validateConfig(config: IntegrationConfig): boolean {
    return !!(
      config.id &&
      config.name &&
      config.type &&
      config.version &&
      typeof config.priority === 'number' &&
      Array.isArray(config.dependencies) &&
      typeof config.enabled === 'boolean'
    );
  }

  /**
   * Check integration dependencies
   */
  private checkDependencies(dependencies: string[]): boolean {
    return dependencies.every(dep => this.integrations.has(dep));
  }

  /**
   * Get integration status
   */
  getIntegrationStatus(integrationId: string): IntegrationHealth | null {
    return this.healthStatus.get(integrationId) || null;
  }

  /**
   * Get integration metrics
   */
  getIntegrationMetrics(integrationId: string): IntegrationMetrics | null {
    return this.metrics.get(integrationId) || null;
  }

  /**
   * Get all integrations
   */
  getAllIntegrations(): IntegrationConfig[] {
    return Array.from(this.integrations.values());
  }

  /**
   * Get active integrations
   */
  getActiveIntegrations(): IntegrationConfig[] {
    return this.getAllIntegrations().filter((config: any) => {
      const health = this.healthStatus.get(config.id);
      return health && health.status === IntegrationStatus.ACTIVE;
    });
  }

  /**
   * Get integration health summary
   */
  getHealthSummary(): Record<string, IntegrationHealth> {
    return Object.fromEntries(this.healthStatus);
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(): {
    totalIntegrations: number;
    activeIntegrations: number;
    totalEvents: number;
    averageProcessingTime: number;
    systemUptime: number;
  } {
    const integrations = this.getAllIntegrations();
    const activeIntegrations = this.getActiveIntegrations();
    const allMetrics = Array.from(this.metrics.values());
    
    return {
      totalIntegrations: integrations.length,
      activeIntegrations: activeIntegrations.length,
      totalEvents: allMetrics.reduce((sum, m) => sum + m.totalEvents, 0),
      averageProcessingTime: allMetrics.reduce((sum, m) => sum + m.averageProcessingTime, 0) / allMetrics.length || 0,
      systemUptime: Date.now() - this.startTime
    };
  }

  private startTime = Date.now();

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }
    
    this.integrations.clear();
    this.healthStatus.clear();
    this.hooks.clear();
    this.metrics.clear();
    this.eventQueue = [];
  }
}

/**
 * Default integration manager instance
 */
export const defaultIntegrationManager = new IntegrationManager({
  eventBus: new (require('../../EventBusPure/EventBusPure').EventBus)(),
  maxIntegrations: 100,
  defaultTimeout: 5000,
  healthCheckInterval: 30000,
  metricsRetentionDays: 7,
  enablePerformanceMonitoring: true,
  enableErrorRecovery: true,
  enableAutoScaling: false
});