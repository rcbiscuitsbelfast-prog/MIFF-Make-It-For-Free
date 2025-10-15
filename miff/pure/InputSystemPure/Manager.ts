/**
 * InputSystemPure Manager - Advanced Input System Management
 *
 * Comprehensive input system management with:
 * - Input device management and handling
 * - Input mapping and configuration
 * - Input events and callbacks
 * - Input validation and filtering
 * - Performance optimization
 * - Real-time input monitoring
 * - Input analytics and reporting
 */

export interface InputSystemConfig {
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
  enableInputManagement: boolean;
  enableInputMapping: boolean;
  enableInputEvents: boolean;
  enableInputValidation: boolean;
  enableInputFiltering: boolean;
  enablePerformanceOptimization: boolean;
  enableRealTimeMonitoring: boolean;
  enableInputAnalytics: boolean;
  enableInputReporting: boolean;
  maxDevices: number;
  maxMappings: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface InputSystemManager {
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
  type: InputSystemManagerType;
  devices: InputDevice[];
  mappings: InputMapping[];
  events: InputEvent[];
  filters: InputFilter[];
  performanceMetrics: InputSystemPerformanceMetrics;
  analytics: InputSystemAnalytics;
  reporting: InputSystemReporting;
  cloudSync: CloudSyncConfig;
  backup: BackupConfig;
  versioning: VersioningConfig;
}

export type InputSystemManagerType = 'game' | 'application' | 'simulation' | 'custom';
export type InputSystemManagerStatus = 'active' | 'inactive' | 'maintenance' | 'error';

export interface InputDevice {
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
  type: DeviceType;
  capabilities: DeviceCapabilities;
  properties: DeviceProperties;
  mapping: string;
}

export type DeviceType = 'keyboard' | 'mouse' | 'gamepad' | 'touch' | 'vr' | 'ar' | 'custom';
export type DeviceStatus = 'connected' | 'disconnected' | 'error' | 'maintenance';

export interface DeviceCapabilities {
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
  buttons: number;
  axes: number;
  hats: number;
  forceFeedback: boolean;
  haptic: boolean;
  motion: boolean;
  touch: boolean;
}

export interface DeviceProperties {
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
  vendor: string;
  product: string;
  version: string;
  serial: string;
  driver: string;
  firmware: string;
}

export interface InputMapping {
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
  deviceId: string;
  type: MappingType;
  source: InputSource;
  target: InputTarget;
  modifiers: InputModifier[];
  conditions: InputCondition[];
  enabled: boolean;
}

export type MappingType = 'button' | 'axis' | 'hat' | 'key' | 'gesture' | 'custom';

export interface InputSource {
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
  type: SourceType;
  code: string;
  value: number;
  threshold: number;
  deadzone: number;
}

export type SourceType = 'button' | 'axis' | 'hat' | 'key' | 'gesture' | 'custom';

export interface InputTarget {
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
  action: string;
  value: number;
  scale: number;
  offset: number;
  clamp: ClampSettings;
}

export interface ClampSettings {
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
  min: number;
  max: number;
  wrap: boolean;
}

export interface InputModifier {
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
  type: ModifierType;
  value: number;
  operation: ModifierOperation;
}

export type ModifierType = 'scale' | 'offset' | 'deadzone' | 'sensitivity' | 'custom';
export type ModifierOperation = 'add' | 'multiply' | 'divide' | 'power' | 'custom';

export interface InputCondition {
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
  type: ConditionType;
  value: any;
  operator: ConditionOperator;
  logic: LogicOperator;
}

export type ConditionType = 'device' | 'state' | 'time' | 'context' | 'custom';
export type ConditionOperator = 'equals' | 'not_equals' | 'greater' | 'less' | 'contains';
export type LogicOperator = 'and' | 'or' | 'not';

export interface InputEvent {
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
  deviceId: string;
  mappingId: string;
  processed: boolean;
}

export type EventType = 'pressed' | 'released' | 'moved' | 'held' | 'gesture' | 'custom';

export interface EventData {
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
  source: InputSource;
  target: InputTarget;
  value: number;
  delta: number;
  duration: number;
  modifiers: InputModifier[];
}

export interface InputFilter {
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
  type: FilterType;
  enabled: boolean;
  settings: FilterSettings;
}

export type FilterType = 'deadzone' | 'smoothing' | 'threshold' | 'noise' | 'custom';

export interface FilterSettings {
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
  deadzone: DeadzoneSettings;
  smoothing: SmoothingSettings;
  threshold: ThresholdSettings;
  noise: NoiseSettings;
}

export interface DeadzoneSettings {
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
  value: number;
  type: DeadzoneType;
}

export type DeadzoneType = 'circular' | 'square' | 'cross' | 'custom';

export interface SmoothingSettings {
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
  factor: number;
  method: SmoothingMethod;
}

export type SmoothingMethod = 'linear' | 'exponential' | 'gaussian' | 'custom';

export interface ThresholdSettings {
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
  value: number;
  hysteresis: number;
}

export interface NoiseSettings {
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
  threshold: number;
  reduction: number;
}

export interface InputSystemPerformanceMetrics {
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
  totalDevices: number;
  activeDevices: number;
  totalMappings: number;
  activeMappings: number;
  totalEvents: number;
  processedEvents: number;
  averageLatency: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
}

export interface InputSystemAnalytics {
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
  averageLatency: number;
  deviceUsage: DeviceUsage[];
  mappingUsage: MappingUsage[];
  eventDistribution: EventDistribution[];
  performanceTrends: PerformanceTrend[];
}

export interface DeviceUsage {
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
  deviceId: string;
  type: DeviceType;
  events: number;
  usage: number;
  averageLatency: number;
}

export interface MappingUsage {
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
  mappingId: string;
  type: MappingType;
  events: number;
  usage: number;
  successRate: number;
}

export interface EventDistribution {
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
  averageLatency: number;
}

export interface PerformanceTrend {
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
  devices: number;
  events: number;
  latency: number;
  memory: number;
  cpu: number;
}

export interface InputSystemReporting {
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
  changes: string[];
  compatible: boolean;
}

export interface InputSystemOutput {
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
  issues?: string[];
}

export class InputSystemPure {
  private managers: Map<string, InputSystemManager> = new Map();
  private config: InputSystemConfig;
  private performanceMetrics: InputSystemPerformanceMetrics;
  private analytics: InputSystemAnalytics;

  constructor(config: Partial<InputSystemConfig> = {}) {
    this.config = {
      enableInputManagement: true,
      enableInputMapping: true,
      enableInputEvents: true,
      enableInputValidation: true,
      enableInputFiltering: true,
      enablePerformanceOptimization: true,
      enableRealTimeMonitoring: true,
      enableInputAnalytics: true,
      enableInputReporting: true,
      maxDevices: 100,
      maxMappings: 1000,
      enableCloudSync: false,
      enableBackup: false,
      enableVersioning: false,
      ...config
    };

    this.performanceMetrics = {
      totalDevices: 0,
      activeDevices: 0,
      totalMappings: 0,
      activeMappings: 0,
      totalEvents: 0,
      processedEvents: 0,
      averageLatency: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      uptime: 0
    };

    this.analytics = {
      totalEvents: 0,
      averageLatency: 0,
      deviceUsage: [],
      mappingUsage: [],
      eventDistribution: [],
      performanceTrends: []
    };
  }

  /**
   * Create a new input system manager
   */
  createManager(): InputSystemOutput {
    if (!this.config.enableInputManagement) {
      return {
        op: 'create-manager',
        status: 'error',
        issues: ['Input management is disabled']
      };
    }

    const manager: InputSystemManager = {
      id: managerData.id || `input-${Date.now()}`,
      name: managerData.name || 'Unnamed Input System Manager',
      type: managerData.type || 'game',
      status: 'active',
      devices: [],
      mappings: [],
      events: [],
      filters: [],
      performanceMetrics: {
        totalDevices: 0,
        activeDevices: 0,
        totalMappings: 0,
        activeMappings: 0,
        totalEvents: 0,
        processedEvents: 0,
        averageLatency: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        uptime: 0
      },
      analytics: {
        totalEvents: 0,
        averageLatency: 0,
        deviceUsage: [],
        mappingUsage: [],
        eventDistribution: [],
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
  getManager(): InputSystemOutput {
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
   * Register input device
   */
  registerDevice(): InputSystemOutput {
    const manager = this.managers.get(managerId);
    if (!manager) {
      return {
        op: 'register-device',
        status: 'error',
        issues: [`Manager ${managerId} not found`]
      };
    }

    if (manager.devices.length >= this.config.maxDevices) {
      return {
        op: 'register-device',
        status: 'error',
        issues: ['Maximum number of devices reached']
      };
    }

    const newDevice: InputDevice = {
      id: device.id || `device-${Date.now()}`,
      name: device.name || 'Unnamed Device',
      type: device.type || 'keyboard',
      status: 'connected',
      capabilities: device.capabilities || {
        buttons: 0,
        axes: 0,
        hats: 0,
        forceFeedback: false,
        haptic: false,
        motion: false,
        touch: false
      },
      properties: device.properties || {
        vendor: 'Unknown',
        product: 'Unknown',
        version: '1.0.0',
        serial: '',
        driver: 'Unknown',
        firmware: '1.0.0'
      },
      mapping: device.mapping || '',
      metadata: {},
      ...device
    };

    manager.devices.push(newDevice);
    manager.updatedAt = Date.now();
    this.performanceMetrics.totalDevices++;
    this.performanceMetrics.activeDevices++;

    return {
      op: 'register-device',
      status: 'ok',
      result: newDevice
    };
  }

  /**
   * Create input mapping
   */
  createMapping(): InputSystemOutput {
    const manager = this.managers.get(managerId);
    if (!manager) {
      return {
        op: 'create-mapping',
        status: 'error',
        issues: [`Manager ${managerId} not found`]
      };
    }

    if (manager.mappings.length >= this.config.maxMappings) {
      return {
        op: 'create-mapping',
        status: 'error',
        issues: ['Maximum number of mappings reached']
      };
    }

    const newMapping: InputMapping = {
      id: mapping.id || `mapping-${Date.now()}`,
      name: mapping.name || 'Unnamed Mapping',
      deviceId: mapping.deviceId || '',
      type: mapping.type || 'button',
      source: mapping.source || {
        type: 'button',
        code: '',
        value: 0,
        threshold: 0.5,
        deadzone: 0.1
      },
      target: mapping.target || {
        action: '',
        value: 0,
        scale: 1,
        offset: 0,
        clamp: {
          enabled: false,
          min: 0,
          max: 1,
          wrap: false
        }
      },
      modifiers: mapping.modifiers || [],
      conditions: mapping.conditions || [],
      enabled: true,
      metadata: {},
      ...mapping
    };

    manager.mappings.push(newMapping);
    manager.updatedAt = Date.now();
    this.performanceMetrics.totalMappings++;
    this.performanceMetrics.activeMappings++;

    return {
      op: 'create-mapping',
      status: 'ok',
      result: newMapping
    };
  }

  /**
   * Process input event
   */
  processEvent(): InputSystemOutput {
    const manager = this.managers.get(managerId);
    if (!manager) {
      return {
        op: 'process-event',
        status: 'error',
        issues: [`Manager ${managerId} not found`]
      };
    }

    const startTime = Date.now();
    
    const newEvent: InputEvent = {
      id: event.id || `event-${Date.now()}`,
      type: event.type || 'pressed',
      deviceId: event.deviceId || '',
      mappingId: event.mappingId || '',
      data: event.data || {
        source: { type: 'button', code: '', value: 0, threshold: 0.5, deadzone: 0.1 },
        target: { action: '', value: 0, scale: 1, offset: 0, clamp: { enabled: false, min: 0, max: 1, wrap: false } },
        value: 0,
        delta: 0,
        duration: 0,
        modifiers: []
      },
      timestamp: Date.now(),
      processed: false,
      metadata: {},
      ...event
    };

    // Find matching mapping
    const mapping = manager.mappings.find(m => 
      m.deviceId === newEvent.deviceId && 
      m.enabled &&
      this.matchesMapping(m, newEvent)
    );

    if (mapping) {
      newEvent.mappingId = mapping.id;
      newEvent.processed = true;
    }

    manager.events.push(newEvent);
    manager.updatedAt = Date.now();
    this.performanceMetrics.totalEvents++;
    if (newEvent.processed) {
      this.performanceMetrics.processedEvents++;
    }

    const latency = Date.now() - startTime;
    this.performanceMetrics.averageLatency = 
      (this.performanceMetrics.averageLatency * (this.performanceMetrics.totalEvents - 1) + latency) / 
      this.performanceMetrics.totalEvents;

    return {
      op: 'process-event',
      status: 'ok',
      result: {
        eventId: newEvent.id,
        processed: newEvent.processed,
        mappingId: newEvent.mappingId,
        latency
      }
    };
  }

  /**
   * Check if event matches mapping
   */
  private matchesMapping(mapping: InputMapping, event: InputEvent): boolean {
    // Simple matching logic - in reality this would be more complex
    return mapping.source.type === event.data.source.type &&
           mapping.source.code === event.data.source.code;
  }

  /**
   * Create input filter
   */
  createFilter(): InputSystemOutput {
    const manager = this.managers.get(managerId);
    if (!manager) {
      return {
        op: 'create-filter',
        status: 'error',
        issues: [`Manager ${managerId} not found`]
      };
    }

    const newFilter: InputFilter = {
      id: filter.id || `filter-${Date.now()}`,
      name: filter.name || 'Unnamed Filter',
      type: filter.type || 'deadzone',
      enabled: true,
      settings: filter.settings || {
        deadzone: {
          enabled: true,
          value: 0.1,
          type: 'circular'
        },
        smoothing: {
          enabled: false,
          factor: 0.5,
          method: 'linear'
        },
        threshold: {
          enabled: false,
          value: 0.5,
          hysteresis: 0.1
        },
        noise: {
          enabled: false,
          threshold: 0.01,
          reduction: 0.5
        }
      },
      metadata: {},
      ...filter
    };

    manager.filters.push(newFilter);
    manager.updatedAt = Date.now();

    return {
      op: 'create-filter',
      status: 'ok',
      result: newFilter
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): InputSystemPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get analytics
   */
  getAnalytics(): InputSystemAnalytics {
    return { ...this.analytics };
  }

  /**
   * Get all managers
   */
  getAllManagers(): InputSystemManager[] {
    return Array.from(this.managers.values());
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(): void {
    const now = Date.now();
    let totalDevices = 0;
    let activeDevices = 0;
    let totalMappings = 0;
    let activeMappings = 0;
    let totalEvents = 0;
    let processedEvents = 0;

    for (const manager of this.managers.values()) {
      totalDevices += manager.devices.length;
      activeDevices += manager.devices.filter(d => d.status === 'connected').length;
      totalMappings += manager.mappings.length;
      activeMappings += manager.mappings.filter(m => m.enabled).length;
      totalEvents += manager.events.length;
      processedEvents += manager.events.filter(e => e.processed).length;
    }

    this.performanceMetrics.totalDevices = totalDevices;
    this.performanceMetrics.activeDevices = activeDevices;
    this.performanceMetrics.totalMappings = totalMappings;
    this.performanceMetrics.activeMappings = activeMappings;
    this.performanceMetrics.totalEvents = totalEvents;
    this.performanceMetrics.processedEvents = processedEvents;
    this.performanceMetrics.uptime = now - (this.performanceMetrics.uptime || now);
  }
}