/**
 * StateManagerPure Manager - Advanced State Management System
 *
 * Comprehensive state management system with:
 * - Application state management
 * - State persistence and synchronization
 * - State transitions and validation
 * - Performance optimization
 * - Real-time state monitoring
 * - State analytics and reporting
 */

export interface StateManagerConfig {
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
  enableStateManagement: boolean;
  enableStatePersistence: boolean;
  enableStateSynchronization: boolean;
  enableStateValidation: boolean;
  enablePerformanceOptimization: boolean;
  enableRealTimeMonitoring: boolean;
  enableStateAnalytics: boolean;
  enableStateReporting: boolean;
  maxStates: number;
  maxHistorySize: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface StateManagerManager {
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
  type: StateManagerManagerType;
  status: StateManagerManagerStatus;
  states: State[];
  transitions: StateTransition[];
  validators: StateValidator[];
  history: StateHistory[];
  subscriptions: StateSubscription[];
  performanceMetrics: StateManagerPerformanceMetrics;
  analytics: StateManagerAnalytics;
  reporting: StateManagerReporting;
  cloudSync: CloudSyncConfig;
  backup: BackupConfig;
  versioning: VersioningConfig;
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export type StateManagerManagerType = 'local' | 'global' | 'session' | 'persistent' | 'custom';
export type StateManagerManagerStatus = 'active' | 'inactive' | 'maintenance' | 'error';

export interface State {
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
  type: StateType;
  status: StateStatus;
  data: StateData;
  metadata: StateMetadata;
  validation: StateValidation;
  performance: StatePerformance;
  history: StateHistoryEntry[];
}

export type StateType = 'application' | 'user' | 'session' | 'component' | 'custom';
export type StateStatus = 'active' | 'inactive' | 'locked' | 'error';

export interface StateData {
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
  values: Record<string, any>;
  schema: StateSchema;
  version: string;
  checksum: string;
  lastModified: number;
}

export interface StateSchema {
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
  type: SchemaType;
  properties: Record<string, PropertyDefinition>;
  required: string[];
  additionalProperties: boolean;
  constraints: SchemaConstraint[];
}

export type SchemaType = 'object' | 'array' | 'primitive' | 'custom';

export interface PropertyDefinition {
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
  type: DataType;
  description: string;
  format: string;
  minimum: number;
  maximum: number;
  minLength: number;
  maxLength: number;
  pattern: string;
  enum: any[];
  default: any;
}

export type DataType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null' | 'custom';

export interface SchemaConstraint {
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
  type: ConstraintType;
  field: string;
  operator: ConstraintOperator;
  value: any;
  message: string;
}

export type ConstraintType = 'required' | 'type' | 'format' | 'range' | 'length' | 'pattern' | 'custom';
export type ConstraintOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'custom';

export interface StateMetadata {
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
  created: number;
  modified: number;
  accessed: number;
  size: number;
  tags: string[];
  description: string;
  owner: string;
  permissions: StatePermissions;
}

export interface StatePermissions {
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
  read: string[];
  write: string[];
  delete: string[];
  admin: string[];
}

export interface StateValidation {
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
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  lastValidated: number;
}

export interface ValidationError {
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
  message: string;
  value: any;
  path: string;
  code: string;
}

export interface ValidationWarning {
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
  message: string;
  value: any;
  path: string;
  code: string;
}

export interface StatePerformance {
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
  accessCount: number;
  averageAccessTime: number;
  memoryUsage: number;
  lastAccessed: number;
}

export interface StateHistoryEntry {
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
  timestamp: number;
  action: HistoryAction;
  changes: StateChange[];
  user: string;
  reason: string;
}

export type HistoryAction = 'create' | 'update' | 'delete' | 'restore' | 'custom';

export interface StateChange {
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
  oldValue: any;
  newValue: any;
  type: ChangeType;
}

export type ChangeType = 'add' | 'remove' | 'modify' | 'custom';

export interface StateTransition {
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
  from: string;
  to: string;
  condition: TransitionCondition;
  action: TransitionAction;
  validation: TransitionValidation;
  performance: TransitionPerformance;
  metadata: Record<string, any>;
}

export interface TransitionCondition {
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
  expression: string;
  variables: string[];
  operator: ConditionOperator;
  timeout: number;
}

export interface TransitionAction {
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
  parameters: Record<string, any>;
  async: boolean;
  timeout: number;
}

export type ActionType = 'transform' | 'validate' | 'notify' | 'persist' | 'custom';

export interface TransitionValidation {
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
  required: boolean;
  rules: ValidationRule[];
  timeout: number;
}

export interface ValidationRule {
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
  operator: ConstraintOperator;
  value: any;
  message: string;
}

export interface TransitionPerformance {
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
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecution: number;
}

export interface StateValidator {
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
  type: ValidatorType;
  status: ValidatorStatus;
  rules: ValidationRule[];
  configuration: ValidatorConfiguration;
  performance: ValidatorPerformance;
  metadata: Record<string, any>;
}

export type ValidatorType = 'schema' | 'business' | 'security' | 'custom';
export type ValidatorStatus = 'active' | 'inactive' | 'error';

export interface ValidatorConfiguration {
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
  strictMode: boolean;
  allowAdditionalProperties: boolean;
  coerceTypes: boolean;
  removeAdditional: boolean;
  useDefaults: boolean;
  validateSchema: boolean;
  addUsedSchema: boolean;
  verbose: boolean;
}

export interface ValidatorPerformance {
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
  totalValidations: number;
  successRate: number;
  averageValidationTime: number;
  memoryUsage: number;
  lastValidation: number;
}

export interface StateHistory {
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
  state: string;
  entries: StateHistoryEntry[];
  totalEntries: number;
  oldestEntry: number;
  newestEntry: number;
  performance: HistoryPerformance;
}

export interface HistoryPerformance {
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
  totalEntries: number;
  averageEntrySize: number;
  memoryUsage: number;
  lastAccess: number;
}

export interface StateSubscription {
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
  subscriber: string;
  state: string;
  events: SubscriptionEvent[];
  configuration: SubscriptionConfiguration;
  performance: SubscriptionPerformance;
  metadata: Record<string, any>;
}

export interface SubscriptionEvent {
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
  condition: EventCondition;
  action: EventAction;
  enabled: boolean;
}

export type EventType = 'change' | 'create' | 'update' | 'delete' | 'custom';

export interface EventCondition {
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
  operator: ConstraintOperator;
  value: any;
  logicalOperator: LogicalOperator;
  conditions: EventCondition[];
}

export type LogicalOperator = 'and' | 'or' | 'not' | 'custom';

export interface EventAction {
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
  parameters: Record<string, any>;
  async: boolean;
  timeout: number;
}

export interface SubscriptionConfiguration {
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
  immediate: boolean;
  batch: boolean;
  batchSize: number;
  batchTimeout: number;
  retry: boolean;
  maxRetries: number;
  retryDelay: number;
}

export interface SubscriptionPerformance {
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
  successRate: number;
  averageLatency: number;
  lastEvent: number;
}

export interface StateManagerPerformanceMetrics {
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
  totalStates: number;
  activeStates: number;
  totalTransitions: number;
  totalValidators: number;
  totalSubscriptions: number;
  totalHistoryEntries: number;
  averageStateSize: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
}

export interface StateManagerAnalytics {
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
  totalStates: number;
  totalTransitions: number;
  averageStateSize: number;
  stateTypeDistribution: StateTypeDistribution[];
  transitionTypeDistribution: TransitionTypeDistribution[];
  performanceTrends: PerformanceTrend[];
}

export interface StateTypeDistribution {
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
  type: StateType;
  count: number;
  percentage: number;
  averageSize: number;
}

export interface TransitionTypeDistribution {
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
  count: number;
  percentage: number;
  averageExecutionTime: number;
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
  states: number;
  transitions: number;
  memory: number;
  cpu: number;
  accessCount: number;
}

export interface StateManagerReporting {
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
  includeStates: boolean;
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

export interface StateManagerOutput {
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

export class StateManagerPure {
  private managers: Map<string, StateManagerManager> = new Map();
  private config: StateManagerConfig;
  private performanceMetrics: StateManagerPerformanceMetrics;
  private analytics: StateManagerAnalytics;

  constructor(config: Partial<StateManagerConfig> = {}) {
    this.config = {
      enableStateManagement: true,
      enableStatePersistence: true,
      enableStateSynchronization: true,
      enableStateValidation: true,
      enablePerformanceOptimization: true,
      enableRealTimeMonitoring: true,
      enableStateAnalytics: true,
      enableStateReporting: true,
      maxStates: 10000,
      maxHistorySize: 100000,
      enableCloudSync: false,
      enableBackup: false,
      enableVersioning: false,
      ...config
    };

    this.performanceMetrics = {
      totalStates: 0,
      activeStates: 0,
      totalTransitions: 0,
      totalValidators: 0,
      totalSubscriptions: 0,
      totalHistoryEntries: 0,
      averageStateSize: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      uptime: 0
    };

    this.analytics = {
      totalStates: 0,
      totalTransitions: 0,
      averageStateSize: 0,
      stateTypeDistribution: [],
      transitionTypeDistribution: [],
      performanceTrends: []
    };
  }

  /**
   * Create a new state manager
   */
  createManager(): StateManagerOutput {
    if (!this.config.enableStateManagement) {
      return {
        op: 'create-manager',
        status: 'error',
        issues: ['State management is disabled']
      };
    }

    const manager: StateManagerManager = {
      id: managerData.id || `statemanager-${Date.now()}`,
      name: managerData.name || 'Unnamed State Manager',
      type: managerData.type || 'local',
      status: 'active',
      states: [],
      transitions: [],
      validators: [],
      history: [],
      subscriptions: [],
      performanceMetrics: {
        totalStates: 0,
        activeStates: 0,
        totalTransitions: 0,
        totalValidators: 0,
        totalSubscriptions: 0,
        totalHistoryEntries: 0,
        averageStateSize: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        uptime: 0
      },
      analytics: {
        totalStates: 0,
        totalTransitions: 0,
        averageStateSize: 0,
        stateTypeDistribution: [],
        transitionTypeDistribution: [],
        performanceTrends: []
      },
      reporting: {
        enabled: false,
        interval: 300000, // 5 minutes
        format: 'json',
        destination: '',
        includeMetrics: true,
        includeAnalytics: true,
        includeStates: true,
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
  getManager(): StateManagerOutput {
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
   * Get performance metrics
   */
  getPerformanceMetrics(): StateManagerPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get analytics
   */
  getAnalytics(): StateManagerAnalytics {
    return { ...this.analytics };
  }

  /**
   * Get all managers
   */
  getAllManagers(): StateManagerManager[] {
    return Array.from(this.managers.values());
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(): void {
    const now = Date.now();
    let totalStates = 0;
    let activeStates = 0;
    let totalTransitions = 0;
    let totalValidators = 0;
    let totalSubscriptions = 0;
    let totalHistoryEntries = 0;

    for (const manager of this.managers.values()) {
      totalStates += manager.states.length;
      activeStates += manager.states.filter(s => s.status === 'active').length;
      totalTransitions += manager.transitions.length;
      totalValidators += manager.validators.length;
      totalSubscriptions += manager.subscriptions.length;
      totalHistoryEntries += manager.history.reduce((sum, h) => sum + h.entries.length, 0);
    }

    this.performanceMetrics.totalStates = totalStates;
    this.performanceMetrics.activeStates = activeStates;
    this.performanceMetrics.totalTransitions = totalTransitions;
    this.performanceMetrics.totalValidators = totalValidators;
    this.performanceMetrics.totalSubscriptions = totalSubscriptions;
    this.performanceMetrics.totalHistoryEntries = totalHistoryEntries;
    this.performanceMetrics.uptime = now - (this.performanceMetrics.uptime || now);
  }
}