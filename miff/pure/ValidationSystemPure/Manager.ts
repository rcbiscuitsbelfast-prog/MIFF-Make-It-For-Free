/**
 * ValidationSystemPure Manager - Advanced Validation System Management
 *
 * Comprehensive validation system management with:
 * - Data validation and verification
 * - Schema validation and enforcement
 * - Rule-based validation engine
 * - Performance optimization
 * - Real-time validation monitoring
 * - Validation analytics and reporting
 */

export interface ValidationSystemConfig {
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
  enableValidationManagement: boolean;
  enableDataValidation: boolean;
  enableSchemaValidation: boolean;
  enableRuleEngine: boolean;
  enablePerformanceOptimization: boolean;
  enableRealTimeMonitoring: boolean;
  enableValidationAnalytics: boolean;
  enableValidationReporting: boolean;
  maxValidators: number;
  maxRules: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface ValidationSystemManager {
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
  type: ValidationSystemManagerType;
  status: ValidationSystemManagerStatus;
  validators: Validator[];
  schemas: Schema[];
  rules: ValidationRule[];
  validations: Validation[];
  reports: ValidationReport[];
  performanceMetrics: ValidationSystemPerformanceMetrics;
  analytics: ValidationSystemAnalytics;
  reporting: ValidationSystemReporting;
  cloudSync: CloudSyncConfig;
  backup: BackupConfig;
  versioning: VersioningConfig;
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export type ValidationSystemManagerType = 'data' | 'schema' | 'rule' | 'hybrid' | 'custom';
export type ValidationSystemManagerStatus = 'active' | 'inactive' | 'maintenance' | 'error';

export interface Validator {
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
  schema: string;
  rules: string[];
  configuration: ValidatorConfiguration;
  performance: ValidatorPerformance;
  metadata: Record<string, any>;
}

export type ValidatorType = 'json' | 'xml' | 'yaml' | 'csv' | 'custom';
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
  format: string;
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

export interface Schema {
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
  type: SchemaType;
  version: string;
  status: SchemaStatus;
  definition: SchemaDefinition;
  validation: SchemaValidation;
  performance: SchemaPerformance;
  metadata: Record<string, any>;
}

export type SchemaType = 'json' | 'xml' | 'yaml' | 'avro' | 'protobuf' | 'custom';
export type SchemaStatus = 'draft' | 'active' | 'deprecated' | 'archived';

export interface SchemaDefinition {
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
  format: SchemaFormat;
  structure: SchemaStructure;
  constraints: SchemaConstraint[];
  examples: SchemaExample[];
}

export type SchemaFormat = 'json_schema' | 'xml_schema' | 'yaml_schema' | 'avro_schema' | 'custom';

export interface SchemaStructure {
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
  properties: Record<string, PropertyDefinition>;
  required: string[];
  additionalProperties: boolean;
  patternProperties: Record<string, PropertyDefinition>;
}

export type DataType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null' | 'custom';

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
  items: PropertyDefinition;
  properties: Record<string, PropertyDefinition>;
  required: string[];
  additionalProperties: boolean;
}

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

export interface SchemaExample {
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
  name: string;
  description: string;
  data: any;
  valid: boolean;
}

export interface SchemaValidation {
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

export interface SchemaPerformance {
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
  id: string;
  name: string;
  type: RuleType;
  status: RuleStatus;
  condition: RuleCondition;
  action: RuleAction;
  priority: number;
  performance: RulePerformance;
  metadata: Record<string, any>;
}

export type RuleType = 'validation' | 'transformation' | 'sanitization' | 'custom';
export type RuleStatus = 'active' | 'inactive' | 'error';

export interface RuleCondition {
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
  operator: ConditionOperator;
  value: any;
  logicalOperator: LogicalOperator;
  conditions: RuleCondition[];
}

export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'regex' | 'custom';
export type LogicalOperator = 'and' | 'or' | 'not' | 'custom';

export interface RuleAction {
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
  message: string;
  severity: ActionSeverity;
}

export type ActionType = 'reject' | 'warn' | 'transform' | 'sanitize' | 'custom';
export type ActionSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RulePerformance {
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
  memoryUsage: number;
  lastExecution: number;
}

export interface Validation {
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
  validator: string;
  data: any;
  status: ValidationStatus;
  result: ValidationResult;
  timestamp: number;
  duration: number;
  metadata: Record<string, any>;
}

export type ValidationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ValidationResult {
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
  score: number;
  suggestions: ValidationSuggestion[];
}

export interface ValidationSuggestion {
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
  suggestion: string;
  confidence: number;
}

export interface ValidationReport {
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
  type: ReportType;
  status: ReportStatus;
  validations: string[];
  summary: ReportSummary;
  details: ReportDetails;
  generatedAt: number;
  metadata: Record<string, any>;
}

export type ReportType = 'summary' | 'detailed' | 'error' | 'performance' | 'custom';
export type ReportStatus = 'generating' | 'completed' | 'failed';

export interface ReportSummary {
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
  validCount: number;
  invalidCount: number;
  warningCount: number;
  successRate: number;
  averageScore: number;
  totalDuration: number;
}

export interface ReportDetails {
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
  validations: ValidationDetail[];
  errors: ErrorDetail[];
  warnings: WarningDetail[];
  performance: PerformanceDetail;
}

export interface ValidationDetail {
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
  validator: string;
  status: ValidationStatus;
  score: number;
  duration: number;
  timestamp: number;
}

export interface ErrorDetail {
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
  count: number;
  percentage: number;
  examples: string[];
}

export interface WarningDetail {
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
  count: number;
  percentage: number;
  examples: string[];
}

export interface PerformanceDetail {
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
  averageValidationTime: number;
  slowestValidation: number;
  fastestValidation: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface ValidationSystemPerformanceMetrics {
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
  totalValidators: number;
  activeValidators: number;
  totalSchemas: number;
  totalRules: number;
  totalValidations: number;
  totalReports: number;
  averageValidationTime: number;
  successRate: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
}

export interface ValidationSystemAnalytics {
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
  totalValidators: number;
  totalValidations: number;
  averageValidationTime: number;
  validatorTypeDistribution: ValidatorTypeDistribution[];
  schemaTypeDistribution: SchemaTypeDistribution[];
  performanceTrends: PerformanceTrend[];
}

export interface ValidatorTypeDistribution {
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
  type: ValidatorType;
  count: number;
  percentage: number;
  averageValidationTime: number;
}

export interface SchemaTypeDistribution {
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
  count: number;
  percentage: number;
  averageValidationTime: number;
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
  validators: number;
  validations: number;
  validationTime: number;
  successRate: number;
  memory: number;
  cpu: number;
}

export interface ValidationSystemReporting {
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
  includeValidations: boolean;
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

export interface ValidationSystemOutput {
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

export class ValidationSystemPure {
  private managers: Map<string, ValidationSystemManager> = new Map();
  private config: ValidationSystemConfig;
  private performanceMetrics: ValidationSystemPerformanceMetrics;
  private analytics: ValidationSystemAnalytics;

  constructor(config: Partial<ValidationSystemConfig> = {}) {
    this.config = {
      enableValidationManagement: true,
      enableDataValidation: true,
      enableSchemaValidation: true,
      enableRuleEngine: true,
      enablePerformanceOptimization: true,
      enableRealTimeMonitoring: true,
      enableValidationAnalytics: true,
      enableValidationReporting: true,
      maxValidators: 1000,
      maxRules: 10000,
      enableCloudSync: false,
      enableBackup: false,
      enableVersioning: false,
      ...config
    };

    this.performanceMetrics = {
      totalValidators: 0,
      activeValidators: 0,
      totalSchemas: 0,
      totalRules: 0,
      totalValidations: 0,
      totalReports: 0,
      averageValidationTime: 0,
      successRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      uptime: 0
    };

    this.analytics = {
      totalValidators: 0,
      totalValidations: 0,
      averageValidationTime: 0,
      validatorTypeDistribution: [],
      schemaTypeDistribution: [],
      performanceTrends: []
    };
  }

  /**
   * Create a new validation system manager
   */
  createManager(): ValidationSystemOutput {
    if (!this.config.enableValidationManagement) {
      return {
        op: 'create-manager',
        status: 'error',
        issues: ['Validation system management is disabled']
      };
    }

    const manager: ValidationSystemManager = {
      id: managerData.id || `validationsystem-${Date.now()}`,
      name: managerData.name || 'Unnamed Validation System Manager',
      type: managerData.type || 'data',
      status: 'active',
      validators: [],
      schemas: [],
      rules: [],
      validations: [],
      reports: [],
      performanceMetrics: {
        totalValidators: 0,
        activeValidators: 0,
        totalSchemas: 0,
        totalRules: 0,
        totalValidations: 0,
        totalReports: 0,
        averageValidationTime: 0,
        successRate: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        uptime: 0
      },
      analytics: {
        totalValidators: 0,
        totalValidations: 0,
        averageValidationTime: 0,
        validatorTypeDistribution: [],
        schemaTypeDistribution: [],
        performanceTrends: []
      },
      reporting: {
        enabled: false,
        interval: 300000, // 5 minutes
        format: 'json',
        destination: '',
        includeMetrics: true,
        includeAnalytics: true,
        includeValidations: true,
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
  getManager(): ValidationSystemOutput {
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
  getPerformanceMetrics(): ValidationSystemPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get analytics
   */
  getAnalytics(): ValidationSystemAnalytics {
    return { ...this.analytics };
  }

  /**
   * Get all managers
   */
  getAllManagers(): ValidationSystemManager[] {
    return Array.from(this.managers.values());
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(): void {
    const now = Date.now();
    let totalValidators = 0;
    let activeValidators = 0;
    let totalSchemas = 0;
    let totalRules = 0;
    let totalValidations = 0;
    let totalReports = 0;

    for (const manager of this.managers.values()) {
      totalValidators += manager.validators.length;
      activeValidators += manager.validators.filter(v => v.status === 'active').length;
      totalSchemas += manager.schemas.length;
      totalRules += manager.rules.length;
      totalValidations += manager.validations.length;
      totalReports += manager.reports.length;
    }

    this.performanceMetrics.totalValidators = totalValidators;
    this.performanceMetrics.activeValidators = activeValidators;
    this.performanceMetrics.totalSchemas = totalSchemas;
    this.performanceMetrics.totalRules = totalRules;
    this.performanceMetrics.totalValidations = totalValidations;
    this.performanceMetrics.totalReports = totalReports;
    this.performanceMetrics.uptime = now - (this.performanceMetrics.uptime || now);
  }
}