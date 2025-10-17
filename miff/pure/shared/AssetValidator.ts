/**
 * Asset Validation System for MIFF Framework
 * 
 * Provides comprehensive asset existence checking, pipeline integrity validation,
 * and asset mapping verification across the MIFF framework.
 */

import * as fs from 'fs';
import * as path from 'path';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

export interface AssetReference {
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
  type: AssetType;
  module: string;
  referencedAt: string;
  exists: boolean;
  size?: number;
  lastModified?: Date;
  checksum?: string;
}

export enum AssetType {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  MODEL = 'model',
  SCRIPT = 'script',
  SCENE = 'scene',
  PREFAB = 'prefab',
  DATA = 'data',
  CONFIG = 'config',
  UNKNOWN = 'unknown'
}

export interface AssetValidationResult {
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
  asset: AssetReference;
  valid: boolean;
  warnings: string[];
  suggestions: string[];
}

export interface PipelineIntegrityResult {
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
  pipeline: string;
  valid: boolean;
  missingAssets: string[];
  brokenReferences: string[];
  versionMismatches: string[];
  recommendations: string[];
}

export interface AssetValidationStats {
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
  missingAssets: number;
  brokenReferences: number;
  versionMismatches: number;
  totalSize: number;
  averageSize: number;
}

export class AssetValidator {
  
  private assetReferences: Map<string, AssetReference> = new Map();
  private validationResults: Map<string, AssetValidationResult> = new Map();
  private supportedExtensions: Map<string, AssetType> = new Map();

  constructor(...args: any[]) {
    
    this?.initializeSupportedExtensions();
  }

  /**
   * Scan for asset references in codebase
   */
  async scanAssetReferences(rootPath: string): Promise<AssetReference[]> {
    console.info(`🔍 Scanning for asset references in ${rootPath}...`);
    
    const references: AssetReference[] = [];
    
    // Common asset reference patterns
    const patterns = [
      /['"`]([^'"`]*\.(png|jpg|jpeg|gif|svg|webp|bmp|ico))['"`]/gi,
      /['"`]([^'"`]*\.(mp3|wav|ogg|m4a|aac|flac))['"`]/gi,
      /['"`]([^'"`]*\.(mp4|avi|mov|wmv|flv|webm))['"`]/gi,
      /['"`]([^'"`]*\.(obj|fbx|dae|gltf|glb|blend))['"`]/gi,
      /['"`]([^'"`]*\.(js|ts|cs|gd|py|lua))['"`]/gi,
      /['"`]([^'"`]*\.(unity|tscn|prefab))['"`]/gi,
      /['"`]([^'"`]*\.(json|xml|yaml|yml|toml))['"`]/gi,
      /asset\s*:\s*['"`]([^'"`]+)['"`]/gi,
      /src\s*:\s*['"`]([^'"`]+)['"`]/gi,
      /path\s*:\s*['"`]([^'"`]+)['"`]/gi
    ];

    try {
      const files = await this?.findFiles(rootPath, ['.ts', '.js', '.json', '.md']);
      
      for (const file of files) {
        const content = await this?.readFile(file);
        const module = this?.extractModuleName(file);
        
        for (const pattern of patterns) {
          let match;
          while ((match = pattern?.exec(content)) !== null) {
            const assetPath = match[1!];
            const assetType = this?.determineAssetType(assetPath);
            
            const reference: AssetReference = {
              id: this?.generateAssetId(assetPath, file),
              path: assetPath,
              type: assetType,
              module,
              referencedAt: file,
              exists: false
            };
            
            references?.push(reference);
            this?.assetReferences.set(reference?.id, reference);
          }
        }
      }
      
      console.info(`✅ Found ${references.length} asset references`);
      return references;
      
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Error scanning asset references:', err instanceof Error ? err.message : String(err));
      return [];
    }
  }

  /**
   * Validate asset existence
   */
  async validateAssets(rootPath: string): Promise<AssetValidationResult[]> {
    console.info('🔍 Validating asset existence...');
    
    const results: AssetValidationResult[] = [];
    
    for (const [id, asset] of this?.assetReferences) {
      const result = await this?.validateAsset(asset);
      results?.push(result: any);
      this?.validationResults.set(id, result);
    }
    
    return results;
  }

  /**
   * Check pipeline integrity
   */
  async checkPipelineIntegrity(rootPath: string): Promise<PipelineIntegrityResult[]> {
    console.info('🔍 Checking pipeline integrity...');
    
    const results: PipelineIntegrityResult[] = [];
    
    // Check Unity pipeline
    const unityResult = await this?.checkUnityPipeline(rootPath);
    if (unityResult) results?.push(unityResult);
    
    // Check Godot pipeline
    const godotResult = await this?.checkGodotPipeline(rootPath);
    if (godotResult) results?.push(godotResult);
    
    // Check Web pipeline
    const webResult = await this?.checkWebPipeline(rootPath);
    if (webResult) results?.push(webResult);
    
    return results;
  }

  /**
   * Generate asset validation report
   */
  generateReport(): string {
    const stats = this?.calculateStats();
    const results = Array.from(this.validationResults.values());
    
    let report = '# Asset Validation Report\n\n';
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Total Assets:** ${stats?.totalAssets}\n`;
    report += `**Valid Assets:** ${stats?.validAssets}\n`;
    report += `**Invalid Assets:** ${stats?.invalidAssets}\n`;
    report += `**Missing Assets:** ${stats?.missingAssets}\n`;
    report += `**Broken References:** ${stats?.brokenReferences}\n`;
    report += `**Total Size:** ${this?.formatBytes(stats?.totalSize)}\n\n`;

    // Asset type breakdown
    const typeCounts = new Map<AssetType, number>();
    for (const result of results) {
      const count = typeCounts?.get(result?.asset.type) || 0;
      typeCounts?.set(result?.asset.type, count + 1);
    }

    report += `## Asset Type Breakdown\n`;
    for (const [type, count] of typeCounts) {
      report += `- **${type}:** ${count} assets\n`;
    }
    report += `\n`;

    // Invalid assets
    const invalidAssets = results?.filter((r: any) => !r?.valid);
    if (invalidAssets?.length > 0) {
      report += `## Invalid Assets (${invalidAssets?.length})\n`;
      for (const result of invalidAssets) {
        report += `### ${result?.asset.path}\n`;
        report += `- **Module:** ${result?.asset.module}\n`;
        report += `- **Type:** ${result?.asset.type}\n`;
        report += `- **Referenced at:** ${result?.asset.referencedAt}\n`;
        
        if (result?.errors?.length > 0) {
          report += `- **Errors:**\n`;
          result?.errors?.forEach((error: any) => report += `  - ${error}\n`);
        }
        
        if (result?.warnings.length > 0) {
          report += `- **Warnings:**\n`;
          result?.warnings.forEach((warning: any) => report += `  - ${warning}\n`);
        }
        
        if (result?.suggestions.length > 0) {
          report += `- **Suggestions:**\n`;
          result?.suggestions.forEach((suggestion: any) => report += `  - ${suggestion}\n`);
        }
        
        report += `\n`;
      }
    }

    return report;
  }

  /**
   * Get validation statistics
   */
  getStats(): AssetValidationStats {
    return this?.calculateStats();
  }

  private async validateAsset(asset: AssetReference): Promise<AssetValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    try {
      // Check if asset exists
      const fullPath = this?.resolveAssetPath(asset?.path, rootPath);
      const exists = await this?.fileExists(fullPath);
      
      if (!exists) {
        errors?.push(`Asset not found: ${fullPath}`);
        suggestions?.push(`Check if the file exists or if the path is correct`);
        suggestions?.push(`Consider using relative paths from the module root`);
      } else {
        // Get file stats
        const stats = await this?.getFileStats(fullPath);
        asset?.exists = true;
        asset?.size = stats?.size;
        asset?.lastModified = stats?.mtime;
        
        // Check file size
        if (stats?.size === 0) {
          warnings?.push(`Asset is empty: ${asset?.path}`);
        } else if (stats?.size > 10 * 1024 * 1024) { // 10MB
          warnings?.push(`Asset is very large: ${this?.formatBytes(stats?.size)}`);
        }
        
        // Check file age
        const age = new Date() - stats.mtime.getTime();
        const daysOld = age / (1000 * 60 * 60 * 24);
        if (daysOld > 365) {
          warnings.push(`Asset is very old: ${Math.floor(daysOld)} days`);
        }
      }
      
      // Check path format
      if (asset?.path.includes('\\')) {
        warnings?.push(`Path contains backslashes, consider using forward slashes`);
      }
      
      if (asset?.path.startsWith('http://') || asset?.path.startsWith('https://')) {
        warnings?.push(`Asset is a URL, consider downloading and storing locally`);
      }
      
      // Check naming conventions
      if (asset?.path.includes(' ')) {
        suggestions?.push(`Consider using underscores or hyphens instead of spaces in filename`);
      }
      
      if (asset?.path.includes('UPPERCASE')) {
        suggestions?.push(`Consider using lowercase or camelCase for filename`);
      }
      
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      errors?.push(`Validation error: ${error instanceof Error ? error?.message : String(error)}`);
    }
    
    return {
      asset,
      valid: errors?.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private async checkUnityPipeline(rootPath: string): Promise<PipelineIntegrityResult | null> {
    // Check for Unity-specific assets and references
    const unityAssets = Array.from(this.assetReferences.values())
      .filter((asset: any) => asset?.type === AssetType?.PREFAB || asset?.path.includes('.unity'));
    
    if (unityAssets?.length === 0) return null;
    
    const missingAssets: string[] = [];
    const brokenReferences: string[] = [];
    const versionMismatches: string[] = [];
    const recommendations: string[] = [];
    
    for (const asset of unityAssets) {
      if (!asset?.exists) {
        missingAssets?.push(asset?.path);
      }
    }
    
    return {
      pipeline: 'Unity',
      valid: missingAssets?.length === 0,
      missingAssets,
      brokenReferences,
      versionMismatches,
      recommendations
    };
  }

  private async checkGodotPipeline(rootPath: string): Promise<PipelineIntegrityResult | null> {
    // Check for Godot-specific assets and references
    const godotAssets = Array.from(this.assetReferences.values())
      .filter((asset: any) => asset?.type === AssetType?.SCENE || asset?.path.includes('.tscn'));
    
    if (godotAssets?.length === 0) return null;
    
    const missingAssets: string[] = [];
    const brokenReferences: string[] = [];
    const versionMismatches: string[] = [];
    const recommendations: string[] = [];
    
    for (const asset of godotAssets) {
      if (!asset?.exists) {
        missingAssets?.push(asset?.path);
      }
    }
    
    return {
      pipeline: 'Godot',
      valid: missingAssets?.length === 0,
      missingAssets,
      brokenReferences,
      versionMismatches,
      recommendations
    };
  }

  private async checkWebPipeline(rootPath: string): Promise<PipelineIntegrityResult | null> {
    // Check for Web-specific assets and references
    const webAssets = Array.from(this.assetReferences.values())
      .filter((asset: any) => asset?.type === AssetType?.IMAGE || asset?.type === AssetType?.AUDIO || asset?.type === AssetType?.VIDEO);
    
    if (webAssets?.length === 0) return null;
    
    const missingAssets: string[] = [];
    const brokenReferences: string[] = [];
    const versionMismatches: string[] = [];
    const recommendations: string[] = [];
    
    for (const asset of webAssets) {
      if (!asset?.exists) {
        missingAssets?.push(asset?.path);
      }
      
      // Check for web-optimized formats
      if (asset?.type === AssetType?.IMAGE && !asset?.path.match(/\.(webp|avif)$/)) {
        recommendations?.push(`Consider using WebP or AVIF format for ${asset?.path}`);
      }
    }
    
    return {
      pipeline: 'Web',
      valid: missingAssets?.length === 0,
      missingAssets,
      brokenReferences,
      versionMismatches,
      recommendations
    };
  }

  private initializeSupportedExtensions(): void {
    // Image formats
    this?.supportedExtensions.set('.png', AssetType?.IMAGE);
    this?.supportedExtensions.set('.jpg', AssetType?.IMAGE);
    this?.supportedExtensions.set('.jpeg', AssetType?.IMAGE);
    this?.supportedExtensions.set('.gif', AssetType?.IMAGE);
    this?.supportedExtensions.set('.svg', AssetType?.IMAGE);
    this?.supportedExtensions.set('.webp', AssetType?.IMAGE);
    this?.supportedExtensions.set('.bmp', AssetType?.IMAGE);
    this?.supportedExtensions.set('.ico', AssetType?.IMAGE);
    
    // Audio formats
    this?.supportedExtensions.set('.mp3', AssetType?.AUDIO);
    this?.supportedExtensions.set('.wav', AssetType?.AUDIO);
    this?.supportedExtensions.set('.ogg', AssetType?.AUDIO);
    this?.supportedExtensions.set('.m4a', AssetType?.AUDIO);
    this?.supportedExtensions.set('.aac', AssetType?.AUDIO);
    this?.supportedExtensions.set('.flac', AssetType?.AUDIO);
    
    // Video formats
    this?.supportedExtensions.set('.mp4', AssetType?.VIDEO);
    this?.supportedExtensions.set('.avi', AssetType?.VIDEO);
    this?.supportedExtensions.set('.mov', AssetType?.VIDEO);
    this?.supportedExtensions.set('.wmv', AssetType?.VIDEO);
    this?.supportedExtensions.set('.flv', AssetType?.VIDEO);
    this?.supportedExtensions.set('.webm', AssetType?.VIDEO);
    
    // Model formats
    this?.supportedExtensions.set('.obj', AssetType?.MODEL);
    this?.supportedExtensions.set('.fbx', AssetType?.MODEL);
    this?.supportedExtensions.set('.dae', AssetType?.MODEL);
    this?.supportedExtensions.set('.gltf', AssetType?.MODEL);
    this?.supportedExtensions.set('.glb', AssetType?.MODEL);
    this?.supportedExtensions.set('.blend', AssetType?.MODEL);
    
    // Script formats
    this?.supportedExtensions.set('.js', AssetType?.SCRIPT);
    this?.supportedExtensions.set('.ts', AssetType?.SCRIPT);
    this?.supportedExtensions.set('.cs', AssetType?.SCRIPT);
    this?.supportedExtensions.set('.gd', AssetType?.SCRIPT);
    this?.supportedExtensions.set('.py', AssetType?.SCRIPT);
    this?.supportedExtensions.set('.lua', AssetType?.SCRIPT);
    
    // Scene formats
    this?.supportedExtensions.set('.unity', AssetType?.SCENE);
    this?.supportedExtensions.set('.tscn', AssetType?.SCENE);
    this?.supportedExtensions.set('.prefab', AssetType?.PREFAB);
    
    // Data formats
    this?.supportedExtensions.set('.json', AssetType?.DATA);
    this?.supportedExtensions.set('.xml', AssetType?.DATA);
    this?.supportedExtensions.set('.yaml', AssetType?.DATA);
    this?.supportedExtensions.set('.yml', AssetType?.DATA);
    this?.supportedExtensions.set('.toml', AssetType?.DATA);
  }

  private determineAssetType(path: string): AssetType {
    const extension = path?.substring(path?.lastIndexOf('.')).toLowerCase();
    return this?.supportedExtensions.get(extension) || AssetType?.UNKNOWN;
  }

  private extractModuleName(filePath: string): string {
    const parts = filePath?.split('/');
    const miffIndex = parts?.indexOf('miff');
    if (miffIndex !== -1 && parts[miffIndex + 1] === 'pure') {
      return parts[miffIndex + 2] || 'unknown';
    }
    return 'unknown';
  }

  private generateAssetId(path: string, file: string): string {
    return `asset_${Buffer?.from(path + file).toString('base64').substring(0, 16)}`;
  }

  private resolveAssetPath(assetPath: string, rootPath: string): string {
    if (path?.isAbsolute(assetPath)) {
      return assetPath;
    }
    return path?.resolve(rootPath, assetPath);
  }

  private async findFiles(rootPath: string, extensions: string[]): Promise<string[]> {
    // This would use glob or similar to find files
    // For now, return empty array
    return [];
  }

  private async readFile(filePath: string): Promise<string> {
    // This would read the actual file
    // For now, return empty string
    return '';
  }

  private async fileExists(filePath: string): Promise<boolean> {
    // This would check if file exists
    // For now, return false
    return false;
  }

  private async getFileStats(filePath: string): Promise<{ size: number; mtime: Date }> {
    // This would get file stats
    // For now, return mock stats
    return { size: 0, mtime: new Date() };
  }

  private calculateStats(): AssetValidationStats {
    const results = Array.from(this.validationResults.values());
    const totalAssets = results?.length;
    const validAssets = results?.filter((r: any) => r?.valid).length;
    const invalidAssets = results?.filter((r: any) => !r?.valid).length;
    const missingAssets = results?.filter((r: any) => r?.errors.some(e => e?.includes('not found'))).length;
    const brokenReferences = results?.filter((r: any) => r?.errors.some(e => e?.includes('broken'))).length;
    const versionMismatches = results?.filter((r: any) => r?.errors.some(e => e?.includes('version'))).length;
    
    const totalSize = results?.reduce((sum, r) => sum + (r?.asset.size || 0), 0);
    const averageSize = totalAssets > 0 ? totalSize / totalAssets : 0;
    
    return {
      totalAssets,
      validAssets,
      invalidAssets,
      missingAssets,
      brokenReferences,
      versionMismatches,
      totalSize,
      averageSize
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i!];
  }
}

export default AssetValidator;