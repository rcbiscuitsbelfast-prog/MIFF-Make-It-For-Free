import { StructuredLogger } from '../logging/StructuredLogger';
import { StandardErrorHandler } from '../error/StandardErrorHandler';
import * as fs from 'fs';
import * as path from 'path';
import { SafeJSONParser } from '../security/SafeJSONParser';

/**
 * Asset Pipeline Validator - Ensures asset integrity and compatibility across bridge modules
 * Addresses asset pipeline validation gaps for UnityBridgePure, GodotBridgePure, UnrealBridgePure
 */

export interface AssetValidationRule {
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
  description: string;
  validator: (asset: AssetInfo) => ValidationResult;
  severity: 'error' | 'warning' | 'info';
  category: 'format' | 'size' | 'metadata' | 'compatibility' | 'security';
}

export interface AssetInfo {
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
  path: string;
  name: string;
  extension: string;
  size: number;
  lastModified: Date;
  metadata: Record<string, any>;
  bridge: 'unity' | 'godot' | 'unreal' | 'web';
}

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
  errors: string[];
  warnings: string[];
  suggestions: string[];
  metadata: Record<string, any>;
}

export interface AssetPipelineConfig {
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
  maxFileSize: number; // bytes
  allowedExtensions: string[];
  requiredMetadata: string[];
  bridgeSpecificRules: Record<string, AssetValidationRule[]>;
  validationTimeout: number; // milliseconds
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
  totalAssets: number;
  validAssets: number;
  invalidAssets: number;
  errors: number;
  warnings: number;
  suggestions: number;
  bridgeBreakdown: Record<string, {
    total: number;
    valid: number;
    invalid: number;
    errors: number;
    warnings: number;
  }>;
  criticalIssues: Array<{
    asset: string;
    issue: string;
    severity: string;
    suggestion: string;
  }>;
}

export class AssetPipelineValidator {
  
  private errorHandler: StandardErrorHandler;
  private config: AssetPipelineConfig;
  private rules: Map<string, AssetValidationRule> = new Map();
  private isInitialized: boolean = false;

  constructor(config?: Partial<AssetPipelineConfig>) {
    
    this.errorHandler = new StandardErrorHandler();
    this.config = this.mergeConfig(config);
  }

  /**
   * Initialize the asset pipeline validator
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Asset pipeline validator already initialized');
      return;
    }

    try {
      console.info('Initializing asset pipeline validator...');
      
      // Load validation rules
      await this.loadValidationRules();
      
      // Validate configuration
      this.validateConfiguration();
      
      this.isInitialized = true;
      console.info('Asset pipeline validator initialized successfully');
      
    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to initialize asset pipeline validator');
      throw error;
    }
  }

  /**
   * Validate a single asset
   */
  async validateAsset(assetPath: string, bridge: 'unity' | 'godot' | 'unreal' | 'web'): Promise<ValidationResult> {
    if (!this.isInitialized) {
      throw new Error('Asset pipeline validator not initialized');
    }

    try {
      // Get asset information
      const assetInfo = await this.getAssetInfo(assetPath, bridge);
      
      // Run validation rules
      const result = await this.runValidationRules(assetInfo, bridge);
      
      console.debug('Asset validation completed', {
        asset: assetPath,
        bridge,
        valid: result.valid,
        errorCount: result.errors.length,
        warningCount: result.warnings.length
      });
      
      return result;
      
    } catch (error) {
      this.errorHandler.handleError(error, `Failed to validate asset: ${assetPath}`);
      return {
        valid: false,
        errors: [`Validation failed: ${error.message}`],
        warnings: [],
        suggestions: ['Check asset file integrity and permissions'],
        metadata: {}
      };
    }
  }

  /**
   * Validate all assets in a directory
   */
  async validateDirectory(dirPath: string, bridge: 'unity' | 'godot' | 'unreal' | 'web'): Promise<ValidationReport> {
    if (!this.isInitialized) {
      throw new Error('Asset pipeline validator not initialized');
    }

    try {
      console.info('Starting directory validation', { dirPath, bridge });
      
      const assets = await this.discoverAssets(dirPath, bridge);
      const report: ValidationReport = {
        totalAssets: assets.length,
        validAssets: 0,
        invalidAssets: 0,
        errors: 0,
        warnings: 0,
        suggestions: 0,
        bridgeBreakdown: {},
        criticalIssues: []
      };

      // Initialize bridge breakdown
      report.bridgeBreakdown[bridge] = {
        total: assets.length,
        valid: 0,
        invalid: 0,
        errors: 0,
        warnings: 0
      };

      // Validate each asset
      for (const asset of assets) {
        const result = await this.validateAsset(asset.path, bridge);
        
        if (result.valid) {
          report.validAssets++;
          report.bridgeBreakdown[bridge].valid++;
        } else {
          report.invalidAssets++;
          report.bridgeBreakdown[bridge].invalid++;
        }
        
        report.errors += result.errors.length;
        report.warnings += result.warnings.length;
        report.suggestions += result.suggestions.length;
        report.bridgeBreakdown[bridge].errors += result.errors.length;
        report.bridgeBreakdown[bridge].warnings += result.warnings.length;
        
        // Add critical issues
        if (result.errors.length > 0) {
          report.criticalIssues.push({
            asset: asset.path,
            issue: result.errors[0],
            severity: 'error',
            suggestion: result.suggestions[0] || 'Fix validation errors'
          });
        }
      }

      console.info('Directory validation completed', {
        totalAssets: report.totalAssets,
        validAssets: report.validAssets,
        invalidAssets: report.invalidAssets,
        errorCount: report.errors,
        warningCount: report.warnings
      });

      return report;
      
    } catch (error) {
      this.errorHandler.handleError(error, `Failed to validate directory: ${dirPath}`);
      throw error;
    }
  }

  /**
   * Validate assets across multiple bridges
   */
  async validateCrossBridge(assetPath: string): Promise<Record<string, ValidationResult>> {
    const bridges: Array<'unity' | 'godot' | 'unreal' | 'web'> = ['unity', 'godot', 'unreal', 'web'];
    const results: Record<string, ValidationResult> = {};

    for (const bridge of bridges) {
      try {
        results[bridge] = await this.validateAsset(assetPath, bridge);
      } catch (error) {
        results[bridge] = {
          valid: false,
          errors: [`Bridge validation failed: ${error.message}`],
          warnings: [],
          suggestions: [`Check ${bridge} compatibility`],
          metadata: {}
        };
      }
    }

    return results;
  }

  /**
   * Get asset information
   */
  private async getAssetInfo(assetPath: string, bridge: 'unity' | 'godot' | 'unreal' | 'web'): Promise<AssetInfo> {
    const stats = await fs.promises.stat(assetPath);
    const parsedPath = path.parse(assetPath);
    
    // Load metadata if available
    let metadata: Record<string, any> = {};
    try {
      const metadataPath = assetPath + '.meta';
      if (await this.fileExists(metadataPath)) {
        const metadataContent = await fs.promises.readFile(metadataPath, 'utf-8');
        metadata = SafeJSONParser.parse(metadataContent);
      }
    } catch (error) {
      console.warn('Failed to load metadata', { assetPath, error: error.message });
    }

    return {
      path: assetPath,
      name: parsedPath.name,
      extension: parsedPath.ext.toLowerCase(),
      size: stats.size,
      lastModified: stats.mtime,
      metadata,
      bridge
    };
  }

  /**
   * Run validation rules for an asset
   */
  private async runValidationRules(asset: AssetInfo, bridge: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      metadata: {}
    };

    // Get bridge-specific rules
    const bridgeRules = this.config.bridgeSpecificRules[bridge] || [];
    
    // Run each rule
    for (const rule of bridgeRules) {
      try {
        const ruleResult = rule.validator(asset);
        
        if (!ruleResult.valid) {
          result.valid = false;
        }
        
        result.errors.push(...ruleResult.errors);
        result.warnings.push(...ruleResult.warnings);
        result.suggestions.push(...ruleResult.suggestions);
        
        // Merge metadata
        Object.assign(result.metadata, ruleResult.metadata);
        
      } catch (error) {
        console.warn('Rule validation failed', { rule: rule.id, error: error.message });
        result.warnings.push(`Rule ${rule.name} failed: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Discover assets in a directory
   */
  private async discoverAssets(dirPath: string, bridge: string): Promise<AssetInfo[]> {
    const assets: AssetInfo[] = [];
    
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isFile()) {
          const assetInfo = await this.getAssetInfo(fullPath, bridge as any);
          assets.push(assetInfo);
        } else if (entry.isDirectory()) {
          // Recursively discover assets in subdirectories
          const subAssets = await this.discoverAssets(fullPath, bridge);
          assets.push(...subAssets);
        }
      }
    } catch (error) {
      console.warn('Failed to discover assets in directory', { dirPath, error: error.message });
    }
    
    return assets;
  }

  /**
   * Load validation rules
   */
  private async loadValidationRules(): Promise<void> {
    // File size validation
    this.addRule({
      id: 'file-size',
      name: 'File Size Validation',
      description: 'Validates file size against maximum allowed size',
      validator: (asset) => {
        const result: ValidationResult = {
          valid: true,
          errors: [],
          warnings: [],
          suggestions: [],
          metadata: {}
        };

        if (asset.size > this.config.maxFileSize) {
          result.valid = false;
          result.errors.push(`File size ${asset.size} bytes exceeds maximum ${this.config.maxFileSize} bytes`);
          result.suggestions.push('Compress or optimize the asset');
        }

        return result;
      },
      severity: 'error',
      category: 'size'
    });

    // Extension validation
    this.addRule({
      id: 'file-extension',
      name: 'File Extension Validation',
      description: 'Validates file extension against allowed extensions',
      validator: (asset) => {
        const result: ValidationResult = {
          valid: true,
          errors: [],
          warnings: [],
          suggestions: [],
          metadata: {}
        };

        if (!this.config.allowedExtensions.includes(asset.extension)) {
          result.valid = false;
          result.errors.push(`File extension ${asset.extension} is not allowed`);
          result.suggestions.push(`Use one of: ${this.config.allowedExtensions.join(', ')}`);
        }

        return result;
      },
      severity: 'error',
      category: 'format'
    });

    // Metadata validation
    this.addRule({
      id: 'metadata-required',
      name: 'Required Metadata Validation',
      description: 'Validates presence of required metadata fields',
      validator: (asset) => {
        const result: ValidationResult = {
          valid: true,
          errors: [],
          warnings: [],
          suggestions: [],
          metadata: {}
        };

        for (const field of this.config.requiredMetadata) {
          if (!(field in asset.metadata)) {
            result.valid = false;
            result.errors.push(`Required metadata field '${field}' is missing`);
            result.suggestions.push(`Add metadata field '${field}' to ${asset.path}.meta`);
          }
        }

        return result;
      },
      severity: 'error',
      category: 'metadata'
    });

    // Bridge-specific rules
    this.loadBridgeSpecificRules();
  }

  /**
   * Load bridge-specific validation rules
   */
  private loadBridgeSpecificRules(): void {
    // Unity-specific rules
    this.config.bridgeSpecificRules.unity = [
      {
        id: 'unity-prefab-format',
        name: 'Unity Prefab Format',
        description: 'Validates Unity prefab format',
        validator: (asset) => {
          const result: ValidationResult = {
            valid: true,
            errors: [],
            warnings: [],
            suggestions: [],
            metadata: {}
          };

          if (asset.extension === '.prefab') {
            // Check for Unity-specific prefab structure
            if (!asset.metadata.guid) {
              result.valid = false;
              result.errors.push('Unity prefab missing GUID');
              result.suggestions.push('Generate GUID for prefab');
            }
          }

          return result;
        },
        severity: 'error',
        category: 'compatibility'
      }
    ];

    // Godot-specific rules
    this.config.bridgeSpecificRules.godot = [
      {
        id: 'godot-scene-format',
        name: 'Godot Scene Format',
        description: 'Validates Godot scene format',
        validator: (asset) => {
          const result: ValidationResult = {
            valid: true,
            errors: [],
            warnings: [],
            suggestions: [],
            metadata: {}
          };

          if (asset.extension === '.tscn') {
            // Check for Godot-specific scene structure
            if (!asset.metadata.resource_type) {
              result.valid = false;
              result.errors.push('Godot scene missing resource type');
              result.suggestions.push('Add resource_type to scene metadata');
            }
          }

          return result;
        },
        severity: 'error',
        category: 'compatibility'
      }
    ];

    // Unreal-specific rules
    this.config.bridgeSpecificRules.unreal = [
      {
        id: 'unreal-asset-format',
        name: 'Unreal Asset Format',
        description: 'Validates Unreal asset format',
        validator: (asset) => {
          const result: ValidationResult = {
            valid: true,
            errors: [],
            warnings: [],
            suggestions: [],
            metadata: {}
          };

          if (asset.extension === '.uasset') {
            // Check for Unreal-specific asset structure
            if (!asset.metadata.asset_class) {
              result.valid = false;
              result.errors.push('Unreal asset missing asset class');
              result.suggestions.push('Add asset_class to asset metadata');
            }
          }

          return result;
        },
        severity: 'error',
        category: 'compatibility'
      }
    ];

    // Web-specific rules
    this.config.bridgeSpecificRules.web = [
      {
        id: 'web-asset-optimization',
        name: 'Web Asset Optimization',
        description: 'Validates web asset optimization',
        validator: (asset) => {
          const result: ValidationResult = {
            valid: true,
            errors: [],
            warnings: [],
            suggestions: [],
            metadata: {}
          };

          // Check for web optimization
          if (asset.size > 1024 * 1024) { // 1MB
            result.warnings.push('Large asset may impact web performance');
            result.suggestions.push('Consider compressing or optimizing for web');
          }

          return result;
        },
        severity: 'warning',
        category: 'performance'
      }
    ];
  }

  /**
   * Add a validation rule
   */
  private addRule(rule: AssetValidationRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Merge configuration with defaults
   */
  private mergeConfig(config?: Partial<AssetPipelineConfig>): AssetPipelineConfig {
    const defaults: AssetPipelineConfig = {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedExtensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.mp3', '.wav', '.ogg', '.mp4', '.webm', '.fbx', '.obj', '.gltf', '.glb'],
      requiredMetadata: ['name', 'type', 'version'],
      bridgeSpecificRules: {},
      validationTimeout: 30000 // 30 seconds
    };

    return { ...defaults, ...config };
  }

  /**
   * Validate configuration
   */
  private validateConfiguration(): void {
    if (this.config.maxFileSize <= 0) {
      throw new Error('maxFileSize must be positive');
    }

    if (this.config.allowedExtensions.length === 0) {
      throw new Error('allowedExtensions cannot be empty');
    }

    if (this.config.validationTimeout <= 0) {
      throw new Error('validationTimeout must be positive');
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Destroy the validator
   */
  async destroy(): Promise<void> {
    console.info('Destroying asset pipeline validator...');
    
    this.rules.clear();
    this.isInitialized = false;
    
    console.info('Asset pipeline validator destroyed');
  }
}

// Export default instance
export const assetPipelineValidator = new AssetPipelineValidator();
export default assetPipelineValidator;