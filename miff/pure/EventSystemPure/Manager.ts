/**
 * EventSystemPure Manager - Advanced Event System Management
 *
 * Comprehensive event system management with:
 * - Event creation and management
 * - Event handling and dispatching
 * - Event filtering and routing
 * - Event persistence and recovery
 * - Performance optimization
 * - Real-time event monitoring
 * - Event analytics and reporting
 */

export interface EventSystemConfig {
  // Auto-added common properties
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
  enableEventManagement: boolean;
  enableEventHandling: boolean;
  enableEventFiltering: boolean;
  enableEventPersistence: boolean;
  enableEventRecovery: boolean;
  enablePerformanceOptimization: boolean;
  enableRealTimeMonitoring: boolean;
  enableEventAnalytics: boolean;
  enableEventReporting: boolean;
  maxEvents: number;
  maxHandlers: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface EventSystemManager {
  // Auto-added common properties
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
  id: string;
  name: string;
  type: EventSystemManagerType;
  status: EventSystemManagerStatus;
  events: Event[];
  handlers: EventHandler[];
  filters: EventFilter[];
  routes: EventRoute[];
  performanceMetrics: EventSystemPerformanceMetrics;
  analytics: EventSystemAnalytics;
  reporting: EventSystemReporting;
  cloudSync: CloudSyncConfig;
  backup: BackupConfig;
  versioning: VersioningConfig;
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export type EventSystemManagerType = 'game' | 'web' | 'mobile' | 'desktop' | 'custom';
export type EventSystemManagerStatus = 'active' | 'inactive' | 'maintenance' | 'error';

export interface Event {
  // Auto-added common properties
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
  id: string;
  name: string;
  type: EventType;
  status: EventStatus;
  data: EventData;
  metadata: EventMetadata;
  timestamp: number;
  source: EventSource;
  target: EventTarget;
  priority: EventPriority;
  persistence: EventPersistence;
  metadata: Record<string, any>;
}

export type EventType = 'user' | 'system' | 'network' | 'database' | 'custom';
export type EventStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface EventData {
  // Auto-added common properties
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
  payload: any;
  schema: DataSchema;
  validation: ValidationRules;
  encryption: EncryptionSettings;
}

export interface DataSchema {
  // Auto-added common properties
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
  type: string;
  properties: Record<string, PropertySchema>;
  required: string[];
  additionalProperties: boolean;
}

export interface PropertySchema {
  // Auto-added common properties
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
  type: string;
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  items?: PropertySchema;
  properties?: Record<string, PropertySchema>;
}

export interface ValidationRules {
  // Auto-added common properties
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
  enabled: boolean;
  strict: boolean;
  custom: CustomValidation[];
}

export interface CustomValidation {
  // Auto-added common properties
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
  field: string;
  rule: string;
  message: string;
  severity: ValidationSeverity;
}

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface EncryptionSettings {
  // Auto-added common properties
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
  enabled: boolean;
  algorithm: string;
  key: string;
  iv: string;
}

export interface EventMetadata {
  // Auto-added common properties
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
  version: string;
  category: string;
  tags: string[];
  correlationId: string;
  causationId: string;
  userId: string;
  sessionId: string;
  requestId: string;
}

export interface EventSource {
  // Auto-added common properties
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
  id: string;
  type: SourceType;
  name: string;
  version: string;
  location: string;
}

export type SourceType = 'user' | 'system' | 'service' | 'external' | 'custom';

export interface EventTarget {
  // Auto-added common properties
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
  id: string;
  type: TargetType;
  name: string;
  endpoint: string;
  method: string;
}

export type TargetType = 'handler' | 'service' | 'queue' | 'database' | 'custom';

export type EventPriority = 'low' | 'normal' | 'high' | 'critical' | 'urgent';

export interface EventPersistence {
  // Auto-added common properties
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
  enabled: boolean;
  ttl: number;
  storage: StorageSettings;
  replication: ReplicationSettings;
}

export interface StorageSettings {
  // Auto-added common properties
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
  type: StorageType;
  location: string;
  compression: boolean;
  encryption: boolean;
}

export type StorageType = 'memory' | 'file' | 'database' | 'cloud' | 'custom';

export interface ReplicationSettings {
  // Auto-added common properties
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
  enabled: boolean;
  replicas: number;
  strategy: ReplicationStrategy;
  consistency: ConsistencyLevel;
}

export type ReplicationStrategy = 'master_slave' | 'master_master' | 'peer_to_peer' | 'custom';
export type ConsistencyLevel = 'eventual' | 'strong' | 'weak' | 'custom';

export interface EventHandler {
  // Auto-added common properties
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
  id: string;
  name: string;
  type: HandlerType;
  status: HandlerStatus;
  events: string[];
  filter: EventFilter;
  action: HandlerAction;
  retry: RetrySettings;
  timeout: TimeoutSettings;
  performance: HandlerPerformance;
  metadata: Record<string, any>;
}

export type HandlerType = 'function' | 'service' | 'queue' | 'webhook' | 'custom';
export type HandlerStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export interface EventFilter {
  // Auto-added common properties
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
  id: string;
  name: string;
  conditions: FilterCondition[];
  logic: FilterLogic;
  enabled: boolean;
}

export interface FilterCondition {
  // Auto-added common properties
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
  field: string;
  operator: FilterOperator;
  value: any;
  caseSensitive: boolean;
}

export type FilterOperator = 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'regex' | 'custom';
export type FilterLogic = 'and' | 'or' | 'not';

export interface HandlerAction {
  // Auto-added common properties
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
  type: ActionType;
  target: string;
  parameters: Record<string, any>;
  transform: DataTransform;
  validate: boolean;
}

export type ActionType = 'call' | 'send' | 'store' | 'log' | 'notify' | 'custom';

export interface DataTransform {
  // Auto-added common properties
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
  enabled: boolean;
  rules: TransformRule[];
  output: OutputFormat;
}

export interface TransformRule {
  // Auto-added common properties
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
  field: string;
  operation: TransformOperation;
  parameters: Record<string, any>;
}

export type TransformOperation = 'map' | 'filter' | 'aggregate' | 'enrich' | 'validate' | 'custom';

export interface OutputFormat {
  // Auto-added common properties
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
  type: string;
  schema: DataSchema;
  template: string;
}

export interface RetrySettings {
  // Auto-added common properties
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
  enabled: boolean;
  maxAttempts: number;
  delay: number;
  backoff: BackoffStrategy;
  jitter: boolean;
}

export type BackoffStrategy = 'fixed' | 'exponential' | 'linear' | 'custom';

export interface TimeoutSettings {
  // Auto-added common properties
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
  enabled: boolean;
  duration: number;
  action: TimeoutAction;
}

export type TimeoutAction = 'fail' | 'retry' | 'skip' | 'custom';

export interface HandlerPerformance {
  // Auto-added common properties
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
  totalProcessed: number;
  successRate: number;
  averageLatency: number;
  maxLatency: number;
  minLatency: number;
  errorRate: number;
  lastProcessed: number;
}

export interface EventRoute {
  // Auto-added common properties
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
  id: string;
  name: string;
  source: string;
  destination: string;
  filter: EventFilter;
  transform: DataTransform;
  priority: number;
  enabled: boolean;
  metadata: Record<string, any>;
}

export interface EventSystemPerformanceMetrics {
  // Auto-added common properties
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
  totalEvents: number;
  processedEvents: number;
  failedEvents: number;
  totalHandlers: number;
  activeHandlers: number;
  averageProcessingTime: number;
  averageLatency: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
}

export interface EventSystemAnalytics {
  // Auto-added common properties
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
  totalEvents: number;
  processedEvents: number;
  eventTypeDistribution: EventTypeDistribution[];
  handlerPerformanceDistribution: HandlerPerformanceDistribution[];
  performanceTrends: PerformanceTrend[];
}

export interface EventTypeDistribution {
  // Auto-added common properties
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
  type: EventType;
  count: number;
  percentage: number;
  averageProcessingTime: number;
}

export interface HandlerPerformanceDistribution {
  // Auto-added common properties
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
  handlerId: string;
  name: string;
  processedEvents: number;
  successRate: number;
  averageLatency: number;
}

export interface PerformanceTrend {
  // Auto-added common properties
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
  timestamp: number;
  events: number;
  processed: number;
  failed: number;
  latency: number;
  throughput: number;
  memory: number;
  cpu: number;
}

export interface EventSystemReporting {
  // Auto-added common properties
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
  enabled: boolean;
  interval: number;
  format: 'json' | 'csv' | 'xml';
  destination: string;
  includeMetrics: boolean;
  includeAnalytics: boolean;
  includeEvents: boolean;
  lastReport: number;
}

export interface CloudSyncConfig {
  // Auto-added common properties
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
  enabled: boolean;
  provider: string;
  region: string;
  bucket: string;
  interval: number;
  lastSync: number;
}

export interface BackupConfig {
  // Auto-added common properties
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
  enabled: boolean;
  interval: number;
  retention: number;
  destination: string;
  lastBackup: number;
}

export interface VersioningConfig {
  // Auto-added common properties
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
  enabled: boolean;
  currentVersion: string;
  versions: Version[];
  autoUpdate: boolean;
  lastUpdate: number;
}

export interface Version {
  // Auto-added common properties
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
  version: string;
  timestamp: number;
  changes: string[];
  compatible: boolean;
}

export interface EventSystemOutput {
  // Auto-added common properties
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
  op: string;
  status: 'ok' | 'error';
  result?: any;
  issues?: string[];
}

export class EventSystemPure {
  private managers: Map<string, EventSystemManager> = new Map();
  private config: EventSystemConfig;
  private performanceMetrics: EventSystemPerformanceMetrics;
  private analytics: EventSystemAnalytics;

  constructor(config: Partial<EventSystemConfig> = {}) {
    this.config = {
      enableEventManagement: true,
      enableEventHandling: true,
      enableEventFiltering: true,
      enableEventPersistence: true,
      enableEventRecovery: true,
      enablePerformanceOptimization: true,
      enableRealTimeMonitoring: true,
      enableEventAnalytics: true,
      enableEventReporting: true,
      maxEvents: 1000000,
      maxHandlers: 10000,
      enableCloudSync: false,
      enableBackup: false,
      enableVersioning: false,
      ...config
    };

    this.performanceMetrics = {
      totalEvents: 0,
      processedEvents: 0,
      failedEvents: 0,
      totalHandlers: 0,
      activeHandlers: 0,
      averageProcessingTime: 0,
      averageLatency: 0,
      throughput: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      uptime: 0
    };

    this.analytics = {
      totalEvents: 0,
      processedEvents: 0,
      eventTypeDistribution: [],
      handlerPerformanceDistribution: [],
      performanceTrends: []
    };
  }

  /**
   * Create a new event system manager
   */
  createManager(): EventSystemOutput {
    if (!this.config.enableEventManagement) {
      return {
        op: 'create-manager',
        status: 'error',
        issues: ['Event management is disabled']
      };
    }

    const manager: EventSystemManager = {
      id: managerData.id || `eventsystem-${Date.now()}`,
      name: managerData.name || 'Unnamed Event System Manager',
      type: managerData.type || 'game',
      status: 'active',
      events: [],
      handlers: [],
      filters: [],
      routes: [],
      performanceMetrics: {
        totalEvents: 0,
        processedEvents: 0,
        failedEvents: 0,
        totalHandlers: 0,
        activeHandlers: 0,
        averageProcessingTime: 0,
        averageLatency: 0,
        throughput: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        uptime: 0
      },
      analytics: {
        totalEvents: 0,
        processedEvents: 0,
        eventTypeDistribution: [],
        handlerPerformanceDistribution: [],
        performanceTrends: []
      },
      reporting: {
        enabled: false,
        interval: 300000, // 5 minutes
        format: 'json',
        destination: '',
        includeMetrics: true,
        includeAnalytics: true,
        includeEvents: true,
        lastReport: 0
      },
      cloudSync: {
        enabled: false,
        provider: '',
        region: '',
        bucket: '',
        interval: 3600000, // 1 hour
        lastSync: 0
      },
      backup: {
        enabled: false,
        interval: 86400000, // 24 hours
        retention: 7,
        destination: '',
        lastBackup: 0
      },
      versioning: {
        enabled: false,
        currentVersion: '1.0.0',
        versions: [],
        autoUpdate: false,
        lastUpdate: 0
      },
      metadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...managerData
    };

    this.managers.set(manager.id, manager);

    return {
      op: 'create-manager',
      status: 'ok',
      result: manager
    };
  }

  /**
   * Get manager by ID
   */
  getManager(): EventSystemOutput {
    const manager = this.managers.get(managerId);
    if (!manager) {
      return {
        op: 'get-manager',
        status: 'error',
        issues: [`Manager ${managerId} not found`]
      };
    }

    return {
      op: 'get-manager',
      status: 'ok',
      result: manager
    };
  }

  /**
   * Create event
   */
  createEvent(): EventSystemOutput {
    const manager = this.managers.get(managerId);
    if (!manager) {
      return {
        op: 'create-event',
        status: 'error',
        issues: [`Manager ${managerId} not found`]
      };
    }

    if (manager.events.length >= this.config.maxEvents) {
      return {
        op: 'create-event',
        status: 'error',
        issues: ['Maximum number of events reached']
      };
    }

    const newEvent: Event = {
      id: event.id || `event-${Date.now()}`,
      name: event.name || 'Unnamed Event',
      type: event.type || 'user',
      status: 'pending',
      data: event.data || {
        payload: {},
        schema: {
          type: 'object',
          properties: {},
          required: [],
          additionalProperties: true
        },
        validation: {
          enabled: true,
          strict: false,
          custom: []
        },
        encryption: {
          enabled: false,
          algorithm: 'AES-256',
          key: '',
          iv: ''
        }
      },
      metadata: event.metadata || {
        version: '1.0.0',
        category: 'general',
        tags: [],
        correlationId: '',
        causationId: '',
        userId: '',
        sessionId: '',
        requestId: ''
      },
      timestamp: Date.now(),
      source: event.source || {
        id: 'system',
        type: 'system',
        name: 'System',
        version: '1.0.0',
        location: 'local'
      },
      target: event.target || {
        id: 'default',
        type: 'handler',
        name: 'Default Handler',
        endpoint: '',
        method: 'POST'
      },
      priority: event.priority || 'normal',
      persistence: event.persistence || {
        enabled: false,
        ttl: 3600000, // 1 hour
        storage: {
          type: 'memory',
          location: '',
          compression: false,
          encryption: false
        },
        replication: {
          enabled: false,
          replicas: 1,
          strategy: 'master_slave',
          consistency: 'eventual'
        }
      },
      metadata: {},
      ...event
    };

    manager.events.push(newEvent);
    manager.updatedAt = Date.now();
    this.performanceMetrics.totalEvents++;

    return {
      op: 'create-event',
      status: 'ok',
      result: newEvent
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): EventSystemPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get analytics
   */
  getAnalytics(): EventSystemAnalytics {
    return { ...this.analytics };
  }

  /**
   * Get all managers
   */
  getAllManagers(): EventSystemManager[] {
    return Array.from(this.managers.values());
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(): void {
    const now = Date.now();
    let totalEvents = 0;
    let processedEvents = 0;
    let failedEvents = 0;
    let totalHandlers = 0;
    let activeHandlers = 0;

    for (const manager of this.managers.values()) {
      totalEvents += manager.events.length;
      processedEvents += manager.events.filter(e => e.status === 'completed').length;
      failedEvents += manager.events.filter(e => e.status === 'failed').length;
      totalHandlers += manager.handlers.length;
      activeHandlers += manager.handlers.filter(h => h.status === 'active').length;
    }

    this.performanceMetrics.totalEvents = totalEvents;
    this.performanceMetrics.processedEvents = processedEvents;
    this.performanceMetrics.failedEvents = failedEvents;
    this.performanceMetrics.totalHandlers = totalHandlers;
    this.performanceMetrics.activeHandlers = activeHandlers;
    this.performanceMetrics.uptime = now - (this.performanceMetrics.uptime || now);
  }
}