/**
 * SettingsPure Manager - Advanced Settings Management System
 *
 * Comprehensive settings management system with:
 * - Settings creation and management
 * - Configuration validation and schema
 * - Settings persistence and synchronization
 * - User preferences and customization
 * - Performance optimization
 * - Real-time settings monitoring
 * - Settings analytics and reporting
 */

export interface SettingsConfig {
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
  enableSettingsManagement: boolean;
  enableValidation: boolean;
  enablePersistence: boolean;
  enableSynchronization: boolean;
  enableCustomization: boolean;
  enablePerformanceOptimization: boolean;
  enableRealTimeMonitoring: boolean;
  enableSettingsAnalytics: boolean;
  enableSettingsReporting: boolean;
  maxSettings: number;
  maxCategories: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface SettingsManager {
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
  type: SettingsManagerType;
  status: SettingsManagerStatus;
  settings: Setting[];
  categories: SettingCategory[];
  schemas: SettingSchema[];
  profiles: SettingProfile[];
  performanceMetrics: SettingsPerformanceMetrics;
  analytics: SettingsAnalytics;
  reporting: SettingsReporting;
  cloudSync: CloudSyncConfig;
  backup: BackupConfig;
  versioning: VersioningConfig;
  
  // Missing methods that are being called
  get(key: string): any;
  set(key: string, value: any): boolean;
  getCategory(category: string): any;
  setCategory(category: string, settings: any): boolean;
  validate(): boolean;
  reset(): void;
  resetCategory(category: string): void;
  getHistory(): any[];
  getStats(): any;
  export(): any;
}

export type SettingsManagerType = 'application' | 'game' | 'user' | 'system' | 'custom';
export type SettingsManagerStatus = 'active' | 'inactive' | 'maintenance' | 'error';

export interface Setting {
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
  description: string;
  category: string;
  type: SettingType;
  value: any;
  defaultValue: any;
  constraints: SettingConstraints;
  validation: ValidationRules;
}

export type SettingType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum' | 'custom';

export interface SettingConstraints {
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
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: any[];
  required: boolean;
  readonly: boolean;
  hidden: boolean;
}

export interface ValidationRules {
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
  rules: ValidationRule[];
  errorHandling: ErrorHandling;
}

export interface ValidationRule {
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
  type: ValidationType;
  value: any;
  message: string;
  condition?: string;
}

export type ValidationType = 'required' | 'min' | 'max' | 'pattern' | 'enum' | 'custom';

export interface ErrorHandling {
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
  showError: boolean;
  fallbackValue: any;
  retryCount: number;
  retryDelay: number;
}

export interface SettingCategory {
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
  description: string;
  parent?: string;
  children: string[];
  order: number;
  icon: string;
  color: string;
}

export interface SettingSchema {
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
  description: string;
  structure: SchemaStructure;
  validation: ValidationRules;
  migration: MigrationRule[];
}

export interface SchemaStructure {
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
  root: SchemaNode;
  nodes: Record<string, SchemaNode>;
  relationships: SchemaRelationship[];
}

export interface SchemaNode {
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
  type: NodeType;
  required: boolean;
  properties: SchemaProperty[];
  children: string[];
  parent?: string;
}

export type NodeType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'custom';

export interface SchemaProperty {
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
  required: boolean;
  defaultValue: any;
  validation: ValidationConstraint[];
}

export interface ValidationConstraint {
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
  value: any;
  message: string;
}

export type ConstraintType = 'min' | 'max' | 'pattern' | 'enum' | 'custom';

export interface SchemaRelationship {
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
  from: string;
  to: string;
  type: RelationshipType;
  cardinality: Cardinality;
}

export type RelationshipType = 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many';
export type Cardinality = '1' | '0..1' | '1..*' | '0..*';

export interface MigrationRule {
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
  fromVersion: string;
  toVersion: string;
  steps: MigrationStep[];
  rollback: MigrationStep[];
}

export interface MigrationStep {
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
  type: StepType;
  field: string;
  operation: OperationType;
  value: any;
  condition?: string;
}

export type StepType = 'add' | 'remove' | 'modify' | 'rename' | 'transform' | 'custom';
export type OperationType = 'set' | 'copy' | 'move' | 'delete' | 'calculate' | 'custom';

export interface SettingProfile {
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
  description: string;
  type: ProfileType;
  settings: Record<string, any>;
}

export type ProfileType = 'default' | 'user' | 'system' | 'custom';

export interface SettingsPerformanceMetrics {
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
  totalSettings: number;
  totalCategories: number;
  totalProfiles: number;
  averageValidationTime: number;
  averagePersistenceTime: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
}

export interface SettingsAnalytics {
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
  totalSettings: number;
  averageValidationTime: number;
  validationSuccessRate: number;
  categoryDistribution: CategoryDistribution[];
  settingTypeDistribution: SettingTypeDistribution[];
  performanceTrends: PerformanceTrend[];
}

export interface CategoryDistribution {
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
  category: string;
  count: number;
  percentage: number;
  averageValue: any;
}

export interface SettingTypeDistribution {
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
  type: SettingType;
  count: number;
  percentage: number;
  averageValue: any;
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
  settings: number;
  validation: number;
  persistence: number;
  memory: number;
  cpu: number;
}

export interface SettingsReporting {
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
  includeSettings: boolean;
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

export interface SettingsOutput {
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

export class SettingsPure {
  private managers: Map<string, SettingsManager> = new Map();
  private config: SettingsConfig;
  private performanceMetrics: SettingsPerformanceMetrics;
  private analytics: SettingsAnalytics;

  constructor(config: Partial<SettingsConfig> = {}) {
    this.config = {
      enableSettingsManagement: true,
      enableValidation: true,
      enablePersistence: true,
      enableSynchronization: true,
      enableCustomization: true,
      enablePerformanceOptimization: true,
      enableRealTimeMonitoring: true,
      enableSettingsAnalytics: true,
      enableSettingsReporting: true,
      maxSettings: 10000,
      maxCategories: 100,
      enableCloudSync: false,
      enableBackup: false,
      enableVersioning: false,
      ...config
    };

    this.performanceMetrics = {
      totalSettings: 0,
      totalCategories: 0,
      totalProfiles: 0,
      averageValidationTime: 0,
      averagePersistenceTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      uptime: 0
    };

    this.analytics = {
      totalSettings: 0,
      averageValidationTime: 0,
      validationSuccessRate: 0,
      categoryDistribution: [],
      settingTypeDistribution: [],
      performanceTrends: []
    };
  }

  /**
   * Create a new settings manager
   */
  createManager(): SettingsOutput {
    if (!this.config.enableSettingsManagement) {
      return {
        op: 'create-manager',
        status: 'error',
        issues: ['Settings management is disabled']
      };
    }

    const manager: SettingsManager = {
      id: managerData.id || `settings-${Date.now()}`,
      name: managerData.name || 'Unnamed Settings Manager',
      type: managerData.type || 'application',
      status: 'active',
      settings: [],
      categories: [],
      schemas: [],
      profiles: [],
      performanceMetrics: {
        totalSettings: 0,
        totalCategories: 0,
        totalProfiles: 0,
        averageValidationTime: 0,
        averagePersistenceTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        uptime: 0
      },
      analytics: {
        totalSettings: 0,
        averageValidationTime: 0,
        validationSuccessRate: 0,
        categoryDistribution: [],
        settingTypeDistribution: [],
        performanceTrends: []
      },
      reporting: {
        enabled: false,
        interval: 300000, // 5 minutes
        format: 'json',
        destination: '',
        includeMetrics: true,
        includeAnalytics: true,
        includeSettings: true,
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
  getManager(): SettingsOutput {
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
   * Create setting
   */
  createSetting(): SettingsOutput {
    const manager = this.managers.get(managerId);
    if (!manager) {
      return {
        op: 'create-setting',
        status: 'error',
        issues: [`Manager ${managerId} not found`]
      };
    }

    if (manager.settings.length >= this.config.maxSettings) {
      return {
        op: 'create-setting',
        status: 'error',
        issues: ['Maximum number of settings reached']
      };
    }

    const newSetting: Setting = {
      id: setting.id || `setting-${Date.now()}`,
      name: setting.name || 'Unnamed Setting',
      description: setting.description || '',
      category: setting.category || 'general',
      type: setting.type || 'string',
      value: setting.value !== undefined ? setting.value : setting.defaultValue,
      defaultValue: setting.defaultValue !== undefined ? setting.defaultValue : this.getDefaultValue(setting.type || 'string'),
      constraints: setting.constraints || {
        required: false,
        readonly: false,
        hidden: false
      },
      validation: setting.validation || {
        enabled: true,
        rules: [],
        errorHandling: {
          showError: true,
          fallbackValue: null,
          retryCount: 0,
          retryDelay: 0
        }
      },
      metadata: {},
      ...setting
    };

    // Validate setting
    const validationResult = this.validateSetting(newSetting);
    if (!validationResult.valid) {
      return {
        op: 'create-setting',
        status: 'error',
        issues: validationResult.errors
      };
    }

    manager.settings.push(newSetting);
    manager.updatedAt = Date.now();
    this.performanceMetrics.totalSettings++;

    return {
      op: 'create-setting',
      status: 'ok',
      result: newSetting
    };
  }

  /**
   * Update setting value
   */
  updateSetting(): SettingsOutput {
    const manager = this.managers.get(managerId);
    if (!manager) {
      return {
        op: 'update-setting',
        status: 'error',
        issues: [`Manager ${managerId} not found`]
      };
    }

    const setting = manager.settings.find(s => s.id === settingId);
    if (!setting) {
      return {
        op: 'update-setting',
        status: 'error',
        issues: [`Setting ${settingId} not found`]
      };
    }

    if (setting.constraints.readonly) {
      return {
        op: 'update-setting',
        status: 'error',
        issues: ['Setting is readonly']
      };
    }

    const startTime = Date.now();
    
    // Validate new value
    const validationResult = this.validateSettingValue(setting, value);
    if (!validationResult.valid) {
      return {
        op: 'update-setting',
        status: 'error',
        issues: validationResult.errors
      };
    }

    setting.value = value;
    manager.updatedAt = Date.now();
    
    const validationTime = Date.now() - startTime;
    this.performanceMetrics.averageValidationTime = 
      (this.performanceMetrics.averageValidationTime * (this.performanceMetrics.totalSettings - 1) + validationTime) / 
      this.performanceMetrics.totalSettings;

    return {
      op: 'update-setting',
      status: 'ok',
      result: {
        settingId,
        value,
        validationTime
      }
    };
  }

  /**
   * Get setting value
   */
  getSetting(): SettingsOutput {
    const manager = this.managers.get(managerId);
    if (!manager) {
      return {
        op: 'get-setting',
        status: 'error',
        issues: [`Manager ${managerId} not found`]
      };
    }

    const setting = manager.settings.find(s => s.id === settingId);
    if (!setting) {
      return {
        op: 'get-setting',
        status: 'error',
        issues: [`Setting ${settingId} not found`]
      };
    }

    return {
      op: 'get-setting',
      status: 'ok',
      result: {
        settingId,
        value: setting.value,
        defaultValue: setting.defaultValue,
        type: setting.type,
        constraints: setting.constraints
      }
    };
  }

  /**
   * Create setting category
   */
  createCategory(): SettingsOutput {
    const manager = this.managers.get(managerId);
    if (!manager) {
      return {
        op: 'create-category',
        status: 'error',
        issues: [`Manager ${managerId} not found`]
      };
    }

    if (manager.categories.length >= this.config.maxCategories) {
      return {
        op: 'create-category',
        status: 'error',
        issues: ['Maximum number of categories reached']
      };
    }

    const newCategory: SettingCategory = {
      id: category.id || `category-${Date.now()}`,
      name: category.name || 'Unnamed Category',
      description: category.description || '',
      children: [],
      order: category.order || manager.categories.length,
      icon: category.icon || 'settings',
      color: category.color || '#000000',
      metadata: {},
      ...category
    };

    manager.categories.push(newCategory);
    manager.updatedAt = Date.now();
    this.performanceMetrics.totalCategories++;

    return {
      op: 'create-category',
      status: 'ok',
      result: newCategory
    };
  }

  /**
   * Get default value for setting type
   */
  private getDefaultValue(type: SettingType): any {
    switch (type) {
      case 'string':
        return '';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return {};
      case 'enum':
        return null;
      default:
        return null;
    }
  }

  /**
   * Validate setting
   */
  private validateSetting(setting: Setting): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (setting.constraints.required && (setting.value === null || setting.value === undefined)) {
      errors.push('Setting value is required');
    }

    // Check type constraints
    if (setting.value !== null && setting.value !== undefined) {
      const typeCheck = this.validateType(setting.value, setting.type);
      if (!typeCheck.valid) {
        errors.push(...typeCheck.errors);
      }
    }

    // Check constraints
    if (setting.type === 'number') {
      if (setting.constraints.min !== undefined && setting.value < setting.constraints.min) {
        errors.push(`Value must be at least ${setting.constraints.min}`);
      }
      if (setting.constraints.max !== undefined && setting.value > setting.constraints.max) {
        errors.push(`Value must be at most ${setting.constraints.max}`);
      }
    }

    if (setting.type === 'string') {
      if (setting.constraints.minLength !== undefined && setting.value.length < setting.constraints.minLength) {
        errors.push(`Value must be at least ${setting.constraints.minLength} characters`);
      }
      if (setting.constraints.maxLength !== undefined && setting.value.length > setting.constraints.maxLength) {
        errors.push(`Value must be at most ${setting.constraints.maxLength} characters`);
      }
      if (setting.constraints.pattern && !new RegExp(setting.constraints.pattern).test(setting.value)) {
        errors.push('Value does not match required pattern');
      }
    }

    if (setting.type === 'enum' && setting.constraints.enum) {
      if (!setting.constraints.enum.includes(setting.value)) {
        errors.push(`Value must be one of: ${setting.constraints.enum.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate setting value
   */
  private validateSettingValue(setting: Setting, value: any): { valid: boolean; errors: string[] } {
    const tempSetting = { ...setting, value };
    return this.validateSetting(tempSetting);
  }

  /**
   * Validate type
   */
  private validateType(value: any, type: SettingType): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push('Value must be a string');
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push('Value must be a number');
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push('Value must be a boolean');
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          errors.push('Value must be an array');
        }
        break;
      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          errors.push('Value must be an object');
        }
        break;
      case 'enum':
        // Enum validation is handled in validateSetting
        break;
      default:
        // Custom type validation would go here
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): SettingsPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get analytics
   */
  getAnalytics(): SettingsAnalytics {
    return { ...this.analytics };
  }

  /**
   * Get all managers
   */
  getAllManagers(): SettingsManager[] {
    return Array.from(this.managers.values());
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(): void {
    const now = Date.now();
    let totalSettings = 0;
    let totalCategories = 0;
    let totalProfiles = 0;

    for (const manager of this.managers.values()) {
      totalSettings += manager.settings.length;
      totalCategories += manager.categories.length;
      totalProfiles += manager.profiles.length;
    }

    this.performanceMetrics.totalSettings = totalSettings;
    this.performanceMetrics.totalCategories = totalCategories;
    this.performanceMetrics.totalProfiles = totalProfiles;
    this.performanceMetrics.uptime = now - (this.performanceMetrics.uptime || now);
  }
}