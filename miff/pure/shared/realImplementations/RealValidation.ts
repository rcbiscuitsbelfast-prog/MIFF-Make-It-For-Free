/**
 * Real Validation System Implementation
 * 
 * Replaces mock validation with actual validation logic.
 * Provides comprehensive schema validation, engine hints validation, and metadata validation.
 */

export interface ValidationResult {
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
  issues: ValidationIssue[];
  score?: number;
  suggestions?: string[];
}

export interface ValidationIssue {
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
  type: 'error' | 'warning' | 'info';
  field?: string;
  message: string;
  code: string;
  severity: number;
  suggestion?: string;
}

export interface SchemaValidationOptions {
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
  strict?: boolean;
  allowAdditionalProperties?: boolean;
  validateTypes?: boolean;
  validateRequired?: boolean;
}

export interface EngineHints {
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
  unity?: Record<string, unknown>;
  godot?: Record<string, unknown>;
  web?: Record<string, unknown>;
  unreal?: Record<string, unknown>;
}

export interface ValidationMetadata {
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
  schema: string;
  timestamp: Date;
  validator: string;
}

/**
 * Real Validation System implementation
 */
export class RealValidation {
  private schemaCache: Map<string, any> = new Map();
  private validationHistory: Array<{ schema: string; result: ValidationResult; timestamp: Date }> = [];

  /**
   * Validate data against a schema
   */
  public validateSchema(
    data: any, 
    schema: any, 
    options: SchemaValidationOptions = {}
  ): ValidationResult {
    const opts = {
      strict: true,
      allowAdditionalProperties: false,
      validateTypes: true,
      validateRequired: true,
      ...options
    };

    const issues: ValidationIssue[] = [];
    let score = 100;

    try {
      // Basic type validation
      if (opts.validateTypes) {
        this.validateTypes(data, schema, issues);
      }

      // Required field validation
      if (opts.validateRequired) {
        this.validateRequired(data, schema, issues);
      }

      // Additional properties validation
      if (!opts.allowAdditionalProperties) {
        this.validateAdditionalProperties(data, schema, issues);
      }

      // Schema-specific validations
      this.validateSchemaSpecific(data, schema, issues);

      // Calculate score based on issues
      score = this.calculateValidationScore(issues);

      const result: ValidationResult = {
        valid: issues.filter(i => i.type === 'error').length === 0,
        issues,
        score,
        suggestions: this.generateSuggestions(issues)
      };

      // Cache result
      this.cacheValidationResult(schema, result);

      return result;
    } catch (error) {
      return {
        valid: false,
        issues: [{
          type: 'error',
          message: `Validation failed: ${error}`,
          code: 'VALIDATION_ERROR',
          severity: 10
        }]
      };
    }
  }

  /**
   * Validate engine hints
   */
  public validateEngineHints(hints: EngineHints): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Validate Unity hints
    if (hints.unity) {
      this.validateUnityHints(hints.unity, issues);
    }

    // Validate Godot hints
    if (hints.godot) {
      this.validateGodotHints(hints.godot, issues);
    }

    // Validate Web hints
    if (hints.web) {
      this.validateWebHints(hints.web, issues);
    }

    // Validate Unreal hints
    if (hints.unreal) {
      this.validateUnrealHints(hints.unreal, issues);
    }

    return {
      valid: issues.filter(i => i.type === 'error').length === 0,
      issues,
      score: this.calculateValidationScore(issues),
      suggestions: this.generateSuggestions(issues)
    };
  }

  /**
   * Validate signals/events
   */
  public validateSignals(signals: any[]): ValidationResult {
    const issues: ValidationIssue[] = [];

    if (!Array.isArray(signals)) {
      issues.push({
        type: 'error',
        message: 'Signals must be an array',
        code: 'INVALID_SIGNALS_TYPE',
        severity: 8
      });
      return { valid: false, issues };
    }

    signals.forEach((signal, index) => {
      // Validate signal structure
      if (!signal.name || typeof signal.name !== 'string') {
        issues.push({
          type: 'error',
          field: `signals[${index}].name`,
          message: 'Signal name is required and must be a string',
          code: 'MISSING_SIGNAL_NAME',
          severity: 7
        });
      }

      // Validate signal parameters
      if (signal.parameters && !Array.isArray(signal.parameters)) {
        issues.push({
          type: 'warning',
          field: `signals[${index}].parameters`,
          message: 'Signal parameters should be an array',
          code: 'INVALID_SIGNAL_PARAMS',
          severity: 4
        });
      }

      // Validate signal connections
      if (signal.connectedTo && !Array.isArray(signal.connectedTo)) {
        issues.push({
          type: 'warning',
          field: `signals[${index}].connectedTo`,
          message: 'Signal connections should be an array',
          code: 'INVALID_SIGNAL_CONNECTIONS',
          severity: 3
        });
      }
    });

    return {
      valid: issues.filter(i => i.type === 'error').length === 0,
      issues,
      score: this.calculateValidationScore(issues),
      suggestions: this.generateSuggestions(issues)
    };
  }

  /**
   * Validate metadata
   */
  public validateMetadata(metadata: ValidationMetadata): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Validate version
    if (!metadata.version || typeof metadata.version !== 'string') {
      issues.push({
        type: 'error',
        field: 'version',
        message: 'Version is required and must be a string',
        code: 'MISSING_VERSION',
        severity: 8
      });
    } else if (!/^\d+\.\d+\.\d+/.test(metadata.version)) {
      issues.push({
        type: 'warning',
        field: 'version',
        message: 'Version should follow semantic versioning (x.y.z)',
        code: 'INVALID_VERSION_FORMAT',
        severity: 3
      });
    }

    // Validate schema
    if (!metadata.schema || typeof metadata.schema !== 'string') {
      issues.push({
        type: 'error',
        field: 'schema',
        message: 'Schema identifier is required',
        code: 'MISSING_SCHEMA',
        severity: 7
      });
    }

    // Validate timestamp
    if (!metadata.timestamp || !(metadata.timestamp instanceof Date)) {
      issues.push({
        type: 'warning',
        field: 'timestamp',
        message: 'Timestamp should be a valid Date object',
        code: 'INVALID_TIMESTAMP',
        severity: 2
      });
    }

    // Validate validator
    if (!metadata.validator || typeof metadata.validator !== 'string') {
      issues.push({
        type: 'info',
        field: 'validator',
        message: 'Validator identifier is recommended',
        code: 'MISSING_VALIDATOR',
        severity: 1
      });
    }

    return {
      valid: issues.filter(i => i.type === 'error').length === 0,
      issues,
      score: this.calculateValidationScore(issues),
      suggestions: this.generateSuggestions(issues)
    };
  }

  /**
   * Get validation statistics
   */
  public getValidationStats(): {
    totalValidations: number;
    successRate: number;
    commonIssues: Array<{ code: string; count: number }>;
  } {
    const total = this.validationHistory.length;
    const successful = this.validationHistory.filter(v => v.result.valid).length;
    
    // Count common issues
    const issueCounts: Map<string, number> = new Map();
    this.validationHistory.forEach(validation => {
      validation.result.issues.forEach(issue => {
        issueCounts.set(issue.code, (issueCounts.get(issue.code) || 0) + 1);
      });
    });

    const commonIssues = Array.from(issueCounts.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalValidations: total,
      successRate: total > 0 ? successful / total : 0,
      commonIssues
    };
  }

  /**
   * Validate data types
   */
  private validateTypes(data: any, schema: any, issues: ValidationIssue[]): void {
    if (schema.type) {
      const actualType = typeof data;
      const expectedType = schema.type;

      if (actualType !== expectedType) {
        issues.push({
          type: 'error',
          message: `Expected type ${expectedType}, got ${actualType}`,
          code: 'TYPE_MISMATCH',
          severity: 8
        });
      }
    }

    // Validate nested objects
    if (schema.properties && typeof data === 'object' && data !== null) {
      Object.keys(schema.properties).forEach(key => {
        if (data[key] !== undefined) {
          this.validateTypes(data[key], schema.properties[key], issues);
        }
      });
    }
  }

  /**
   * Validate required fields
   */
  private validateRequired(data: any, schema: any, issues: ValidationIssue[]): void {
    if (schema.required && Array.isArray(schema.required)) {
      schema.required.forEach((field: string) => {
        if (data[field] === undefined || data[field] === null) {
          issues.push({
            type: 'error',
            field,
            message: `Required field '${field}' is missing`,
            code: 'MISSING_REQUIRED_FIELD',
            severity: 9
          });
        }
      });
    }
  }

  /**
   * Validate additional properties
   */
  private validateAdditionalProperties(data: any, schema: any, issues: ValidationIssue[]): void {
    if (typeof data === 'object' && data !== null && schema.properties) {
      const allowedKeys = Object.keys(schema.properties);
      const dataKeys = Object.keys(data);

      dataKeys.forEach(key => {
        if (!allowedKeys.includes(key)) {
          issues.push({
            type: 'warning',
            field: key,
            message: `Additional property '${key}' is not allowed`,
            code: 'ADDITIONAL_PROPERTY',
            severity: 3
          });
        }
      });
    }
  }

  /**
   * Validate schema-specific rules
   */
  private validateSchemaSpecific(data: any, schema: any, issues: ValidationIssue[]): void {
    // Add specific validation rules based on schema patterns
    if (schema.format) {
      this.validateFormat(data, schema.format, issues);
    }

    if (schema.minimum !== undefined && typeof data === 'number') {
      if (data < schema.minimum) {
        issues.push({
          type: 'error',
          message: `Value ${data} is below minimum ${schema.minimum}`,
          code: 'BELOW_MINIMUM',
          severity: 6
        });
      }
    }

    if (schema.maximum !== undefined && typeof data === 'number') {
      if (data > schema.maximum) {
        issues.push({
          type: 'error',
          message: `Value ${data} is above maximum ${schema.maximum}`,
          code: 'ABOVE_MAXIMUM',
          severity: 6
        });
      }
    }
  }

  /**
   * Validate format constraints
   */
  private validateFormat(data: any, format: string, issues: ValidationIssue[]): void {
    if (typeof data !== 'string') return;

    switch (format) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) {
          issues.push({
            type: 'error',
            message: 'Invalid email format',
            code: 'INVALID_EMAIL',
            severity: 5
          });
        }
        break;
      case 'uuid':
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data)) {
          issues.push({
            type: 'error',
            message: 'Invalid UUID format',
            code: 'INVALID_UUID',
            severity: 5
          });
        }
        break;
      case 'uri':
        try {
          new URL(data);
        } catch {
          issues.push({
            type: 'error',
            message: 'Invalid URI format',
            code: 'INVALID_URI',
            severity: 5
          });
        }
        break;
    }
  }

  /**
   * Validate Unity-specific hints
   */
  private validateUnityHints(hints: Record<string, unknown>, issues: ValidationIssue[]): void {
    // Unity-specific validation logic
    if (hints.prefabPath && typeof hints.prefabPath === 'string') {
      if (!hints.prefabPath.endsWith('.prefab')) {
        issues.push({
          type: 'warning',
          field: 'unity.prefabPath',
          message: 'Unity prefab path should end with .prefab',
          code: 'INVALID_PREFAB_PATH',
          severity: 3
        });
      }
    }
  }

  /**
   * Validate Godot-specific hints
   */
  private validateGodotHints(hints: Record<string, unknown>, issues: ValidationIssue[]): void {
    // Godot-specific validation logic
    if (hints.scenePath && typeof hints.scenePath === 'string') {
      if (!hints.scenePath.endsWith('.tscn') && !hints.scenePath.endsWith('.scn')) {
        issues.push({
          type: 'warning',
          field: 'godot.scenePath',
          message: 'Godot scene path should end with .tscn or .scn',
          code: 'INVALID_SCENE_PATH',
          severity: 3
        });
      }
    }
  }

  /**
   * Validate Web-specific hints
   */
  private validateWebHints(hints: Record<string, unknown>, issues: ValidationIssue[]): void {
    // Web-specific validation logic
    if (hints.renderer && typeof hints.renderer === 'string') {
      const validRenderers = ['canvas', 'webgl', 'webgl2'];
      if (!validRenderers.includes(hints.renderer)) {
        issues.push({
          type: 'warning',
          field: 'web.renderer',
          message: `Invalid renderer: ${hints.renderer}. Valid options: ${validRenderers.join(', ')}`,
          code: 'INVALID_RENDERER',
          severity: 4
        });
      }
    }
  }

  /**
   * Validate Unreal-specific hints
   */
  private validateUnrealHints(hints: Record<string, unknown>, issues: ValidationIssue[]): void {
    // Unreal-specific validation logic
    if (hints.blueprintPath && typeof hints.blueprintPath === 'string') {
      if (!hints.blueprintPath.startsWith('/Game/')) {
        issues.push({
          type: 'info',
          field: 'unreal.blueprintPath',
          message: 'Unreal blueprint paths typically start with /Game/',
          code: 'BLUEPRINT_PATH_CONVENTION',
          severity: 2
        });
      }
    }
  }

  /**
   * Calculate validation score based on issues
   */
  private calculateValidationScore(issues: ValidationIssue[]): number {
    let score = 100;
    issues.forEach(issue => {
      score -= issue.severity;
    });
    return Math.max(0, score);
  }

  /**
   * Generate suggestions based on issues
   */
  private generateSuggestions(issues: ValidationIssue[]): string[] {
    const suggestions: string[] = [];
    
    issues.forEach(issue => {
      if (issue.suggestion) {
        suggestions.push(issue.suggestion);
      } else {
        // Generate generic suggestions based on issue type
        switch (issue.code) {
          case 'MISSING_REQUIRED_FIELD':
            suggestions.push(`Add the required field: ${issue.field}`);
            break;
          case 'TYPE_MISMATCH':
            suggestions.push('Check data types match schema requirements');
            break;
          case 'ADDITIONAL_PROPERTY':
            suggestions.push(`Remove or allow additional property: ${issue.field}`);
            break;
        }
      }
    });

    return [...new Set(suggestions)]; // Remove duplicates
  }

  /**
   * Cache validation result
   */
  private cacheValidationResult(schema: any, result: ValidationResult): void {
    const schemaKey = JSON.stringify(schema);
    this.validationHistory.push({
      schema: schemaKey,
      result,
      timestamp: new Date()
    });

    // Keep only last 100 validations
    if (this.validationHistory.length > 100) {
      this.validationHistory.shift();
    }
  }
}

/**
 * Create a real validation instance
 */
export function createRealValidation(): RealValidation {
  return new RealValidation();
}

/**
 * Global instance for common use
 */
export const globalValidation = new RealValidation();

/**
 * Legacy compatibility object that matches the mock interface
 */
/* export const realValidation = {
  validateSchema: (data: any, schema: any, options?: SchemaValidationOptions) => 
    globalValidation.validateSchema(data, schema, options),
  validateEngineHints: (hints: EngineHints) => 
    globalValidation.validateEngineHints(hints),
  validateSignals: (signals: any[]) => 
    globalValidation.validateSignals(signals),
  validateMetadata: (metadata: ValidationMetadata) => 
    globalValidation.validateMetadata(metadata),
  
  // Additional real functionality
  getValidationStats: () => globalValidation.getValidationStats()
};*/