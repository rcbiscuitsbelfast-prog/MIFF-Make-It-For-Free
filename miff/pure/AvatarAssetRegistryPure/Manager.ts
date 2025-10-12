/**
 * AvatarAssetRegistryPure Manager - Advanced Avatar Asset Registry Management System
 *
 * Comprehensive avatar asset registry system with:
 * - Avatar asset cataloging and indexing
 * - Asset dependency tracking
 * - Asset versioning and updates
 * - Cross-platform asset support
 * - Performance optimization
 * - Real-time asset monitoring
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { StructuredLogger, LogLevel } from '../shared/logging/StructuredLogger';
import { PerformanceOptimizer } from '../shared/performance/PerformanceOptimizer';
import { MemoryManager } from '../shared/memory/MemoryManager';
import { StandardErrorHandler, ErrorCode, ErrorSeverity } from '../shared/error/StandardErrorHandler';

export interface AvatarAssetRegistryConfig {
  enableAssetCataloging: boolean;
  enableDependencyTracking: boolean;
  enableAssetVersioning: boolean;
  enableCrossPlatformSupport: boolean;
  enablePerformanceOptimization: boolean;
  enableRealTimeMonitoring: boolean;
  maxAssets: number;
  maxDependencies: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface AvatarAssetRegistry {
  id: string;
  name: string;
  type: RegistryType;
  status: RegistryStatus;
  assets: AvatarAsset[];
  dependencies: AssetDependency[];
  categories: AssetCategory[];
  tags: AssetTag[];
  analytics: RegistryAnalytics;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

export interface AvatarAsset {
  id: string;
  name: string;
  type: AssetType;
  category: string;
  tags: string[];
  path: string;
  size: number; // bytes
  hash: string;
  version: string;
  dependencies: string[];
  metadata: AssetMetadata;
  status: AssetStatus;
  lastModified: Date;
}

export interface AssetDependency {
  id: string;
  assetId: string;
  dependencyId: string;
  type: DependencyType;
  required: boolean;
  version: string;
  metadata: Record<string, any>;
}

export interface AssetCategory {
  id: string;
  name: string;
  description: string;
  parentCategory?: string;
  assets: string[];
  metadata: Record<string, any>;
}

export interface AssetTag {
  id: string;
  name: string;
  description: string;
  color: string;
  assets: string[];
  metadata: Record<string, any>;
}

export interface AssetMetadata {
  author: string;
  description: string;
  license: string;
  createdDate: Date;
  modifiedDate: Date;
  fileFormat: string;
  resolution?: { width: number; height: number };
  duration?: number; // seconds
  quality: AssetQuality;
  [key: string]: any;
}

export interface RegistryAnalytics {
  totalAssets: number;
  activeAssets: number;
  totalCategories: number;
  totalTags: number;
  averageAssetSize: number;
  dependencyCount: number;
  lastUpdated: Date;
}

export type RegistryType = 'master' | 'user' | 'shared' | 'system' | 'custom';
export type RegistryStatus = 'active' | 'inactive' | 'error' | 'maintenance';
export type AssetType = 'texture' | 'model' | 'animation' | 'sound' | 'script' | 'shader' | 'material' | 'prefab';
export type AssetStatus = 'available' | 'loading' | 'loaded' | 'cached' | 'error' | 'missing';
export type DependencyType = 'required' | 'optional' | 'conditional' | 'exclusive';
export type AssetQuality = 'low' | 'medium' | 'high' | 'ultra';

export class AvatarAssetRegistryManager {
  private logger: StructuredLogger;
  private performanceOptimizer: PerformanceOptimizer;
  private memoryManager: MemoryManager;
  private errorHandler: StandardErrorHandler;
  private config: AvatarAssetRegistryConfig;
  private registries: Map<string, AvatarAssetRegistry> = new Map();
  private isInitialized: boolean = false;
  private startTime: Date;

  constructor(config?: Partial<AvatarAssetRegistryConfig>) {
    this.logger = new StructuredLogger({ module: 'AvatarAssetRegistryManager' });
    this.performanceOptimizer = new PerformanceOptimizer();
    this.memoryManager = new MemoryManager();
    this.errorHandler = new StandardErrorHandler();
    this.startTime = new Date();

    this.config = {
      enableAssetCataloging: true,
      enableDependencyTracking: true,
      enableAssetVersioning: true,
      enableCrossPlatformSupport: true,
      enablePerformanceOptimization: true,
      enableRealTimeMonitoring: true,
      maxAssets: 10000,
      maxDependencies: 50000,
      enableCloudSync: false,
      enableBackup: true,
      enableVersioning: true,
      ...config
    };
  }

  /**
   * Initialize the Avatar Asset Registry Manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Avatar Asset Registry Manager already initialized');
      return;
    }

    try {
      this.logger.info('Initializing Avatar Asset Registry Manager...');

      // Initialize performance optimizer
      if (this.config.enablePerformanceOptimization) {
        await this.performanceOptimizer.initialize();
      }

      // Initialize memory manager
      if (this.config.enableRealTimeMonitoring) {
        await this.memoryManager.initialize();
      }

      this.isInitialized = true;
      this.logger.info('Avatar Asset Registry Manager initialized successfully');

    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to initialize Avatar Asset Registry Manager');
      throw error;
    }
  }

  /**
   * Create a new avatar asset registry
   */
  async createRegistry(registryData: Omit<AvatarAssetRegistry, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'analytics'>): Promise<AvatarAssetRegistry> {
    if (!this.isInitialized) {
      throw new Error('Avatar Asset Registry Manager not initialized');
    }

    try {
      const registry: AvatarAssetRegistry = {
        ...registryData,
        id: this.generateRegistryId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        analytics: {
          totalAssets: 0,
          activeAssets: 0,
          totalCategories: 0,
          totalTags: 0,
          averageAssetSize: 0,
          dependencyCount: 0,
          lastUpdated: new Date()
        }
      };

      this.registries.set(registry.id, registry);
      this.updateAnalytics();

      this.logger.info('Avatar asset registry created', { registryId: registry.id, registryName: registry.name });
      return registry;

    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to create avatar asset registry');
      throw error;
    }
  }

  /**
   * Get an avatar asset registry by ID
   */
  getRegistry(registryId: string): AvatarAssetRegistry | null {
    if (!this.isInitialized) {
      throw new Error('Avatar Asset Registry Manager not initialized');
    }

    return this.registries.get(registryId) || null;
  }

  /**
   * Update an avatar asset registry
   */
  async updateRegistry(registryId: string, updates: Partial<AvatarAssetRegistry>): Promise<AvatarAssetRegistry | null> {
    if (!this.isInitialized) {
      throw new Error('Avatar Asset Registry Manager not initialized');
    }

    try {
      const registry = this.registries.get(registryId);
      if (!registry) {
        this.logger.warn('Registry not found', { registryId });
        return null;
      }

      const updatedRegistry: AvatarAssetRegistry = {
        ...registry,
        ...updates,
        updatedAt: new Date(),
        version: this.incrementVersion(registry.version)
      };

      this.registries.set(registryId, updatedRegistry);
      this.updateAnalytics();

      this.logger.info('Avatar asset registry updated', { registryId, registryName: updatedRegistry.name });
      return updatedRegistry;

    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to update avatar asset registry');
      throw error;
    }
  }

  /**
   * Delete an avatar asset registry
   */
  async deleteRegistry(registryId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Avatar Asset Registry Manager not initialized');
    }

    try {
      const registry = this.registries.get(registryId);
      if (!registry) {
        this.logger.warn('Registry not found', { registryId });
        return false;
      }

      this.registries.delete(registryId);
      this.updateAnalytics();

      this.logger.info('Avatar asset registry deleted', { registryId, registryName: registry.name });
      return true;

    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to delete avatar asset registry');
      throw error;
    }
  }

  /**
   * Get all avatar asset registries
   */
  getAllRegistries(): AvatarAssetRegistry[] {
    if (!this.isInitialized) {
      throw new Error('Avatar Asset Registry Manager not initialized');
    }

    return Array.from(this.registries.values());
  }

  /**
   * Get registries by type
   */
  getRegistriesByType(type: RegistryType): AvatarAssetRegistry[] {
    if (!this.isInitialized) {
      throw new Error('Avatar Asset Registry Manager not initialized');
    }

    return Array.from(this.registries.values()).filter(registry => registry.type === type);
  }

  /**
   * Get registries by status
   */
  getRegistriesByStatus(status: RegistryStatus): AvatarAssetRegistry[] {
    if (!this.isInitialized) {
      throw new Error('Avatar Asset Registry Manager not initialized');
    }

    return Array.from(this.registries.values()).filter(registry => registry.status === status);
  }

  /**
   * Add an asset to a registry
   */
  async addAsset(registryId: string, assetData: Omit<AvatarAsset, 'id' | 'lastModified'>): Promise<AvatarAsset | null> {
    if (!this.isInitialized) {
      throw new Error('Avatar Asset Registry Manager not initialized');
    }

    try {
      const registry = this.registries.get(registryId);
      if (!registry) {
        this.logger.warn('Registry not found', { registryId });
        return null;
      }

      const asset: AvatarAsset = {
        ...assetData,
        id: this.generateAssetId(),
        lastModified: new Date()
      };

      registry.assets.push(asset);
      this.updateAnalytics();

      this.logger.info('Asset added to registry', { registryId, assetId: asset.id, assetName: asset.name });
      return asset;

    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to add asset to registry');
      return null;
    }
  }

  /**
   * Remove an asset from a registry
   */
  async removeAsset(registryId: string, assetId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Avatar Asset Registry Manager not initialized');
    }

    try {
      const registry = this.registries.get(registryId);
      if (!registry) {
        this.logger.warn('Registry not found', { registryId });
        return false;
      }

      const assetIndex = registry.assets.findIndex(asset => asset.id === assetId);
      if (assetIndex === -1) {
        this.logger.warn('Asset not found', { registryId, assetId });
        return false;
      }

      registry.assets.splice(assetIndex, 1);
      this.updateAnalytics();

      this.logger.info('Asset removed from registry', { registryId, assetId });
      return true;

    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to remove asset from registry');
      return false;
    }
  }

  /**
   * Search assets in a registry
   */
  searchAssets(registryId: string, query: string, filters?: {
    type?: AssetType;
    category?: string;
    tags?: string[];
    status?: AssetStatus;
  }): AvatarAsset[] {
    if (!this.isInitialized) {
      throw new Error('Avatar Asset Registry Manager not initialized');
    }

    try {
      const registry = this.registries.get(registryId);
      if (!registry) {
        this.logger.warn('Registry not found', { registryId });
        return [];
      }

      let results = registry.assets;

      // Apply text search
      if (query) {
        const searchTerm = query.toLowerCase();
        results = results.filter(asset => 
          asset.name.toLowerCase().includes(searchTerm) ||
          asset.metadata.description?.toLowerCase().includes(searchTerm) ||
          asset.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Apply filters
      if (filters) {
        if (filters.type) {
          results = results.filter(asset => asset.type === filters.type);
        }
        if (filters.category) {
          results = results.filter(asset => asset.category === filters.category);
        }
        if (filters.tags && filters.tags.length > 0) {
          results = results.filter(asset => 
            filters.tags!.some(tag => asset.tags.includes(tag))
          );
        }
        if (filters.status) {
          results = results.filter(asset => asset.status === filters.status);
        }
      }

      this.logger.debug('Asset search completed', { registryId, query, resultCount: results.length });
      return results;

    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to search assets');
      return [];
    }
  }

  /**
   * Get assets by category
   */
  getAssetsByCategory(registryId: string, category: string): AvatarAsset[] {
    if (!this.isInitialized) {
      throw new Error('Avatar Asset Registry Manager not initialized');
    }

    try {
      const registry = this.registries.get(registryId);
      if (!registry) {
        this.logger.warn('Registry not found', { registryId });
        return [];
      }

      return registry.assets.filter(asset => asset.category === category);

    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to get assets by category');
      return [];
    }
  }

  /**
   * Get assets by tag
   */
  getAssetsByTag(registryId: string, tag: string): AvatarAsset[] {
    if (!this.isInitialized) {
      throw new Error('Avatar Asset Registry Manager not initialized');
    }

    try {
      const registry = this.registries.get(registryId);
      if (!registry) {
        this.logger.warn('Registry not found', { registryId });
        return [];
      }

      return registry.assets.filter(asset => asset.tags.includes(tag));

    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to get assets by tag');
      return [];
    }
  }

  /**
   * Add a category to a registry
   */
  async addCategory(registryId: string, categoryData: Omit<AssetCategory, 'id'>): Promise<AssetCategory | null> {
    if (!this.isInitialized) {
      throw new Error('Avatar Asset Registry Manager not initialized');
    }

    try {
      const registry = this.registries.get(registryId);
      if (!registry) {
        this.logger.warn('Registry not found', { registryId });
        return null;
      }

      const category: AssetCategory = {
        ...categoryData,
        id: this.generateCategoryId()
      };

      registry.categories.push(category);
      this.updateAnalytics();

      this.logger.info('Category added to registry', { registryId, categoryId: category.id, categoryName: category.name });
      return category;

    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to add category to registry');
      return null;
    }
  }

  /**
   * Add a tag to a registry
   */
  async addTag(registryId: string, tagData: Omit<AssetTag, 'id'>): Promise<AssetTag | null> {
    if (!this.isInitialized) {
      throw new Error('Avatar Asset Registry Manager not initialized');
    }

    try {
      const registry = this.registries.get(registryId);
      if (!registry) {
        this.logger.warn('Registry not found', { registryId });
        return null;
      }

      const tag: AssetTag = {
        ...tagData,
        id: this.generateTagId()
      };

      registry.tags.push(tag);
      this.updateAnalytics();

      this.logger.info('Tag added to registry', { registryId, tagId: tag.id, tagName: tag.name });
      return tag;

    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to add tag to registry');
      return null;
    }
  }

  /**
   * Generate a unique registry ID
   */
  private generateRegistryId(): string {
    return `registry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique asset ID
   */
  private generateAssetId(): string {
    return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique category ID
   */
  private generateCategoryId(): string {
    return `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique tag ID
   */
  private generateTagId(): string {
    return `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Increment version number
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  /**
   * Update analytics
   */
  private updateAnalytics(): void {
    const registries = Array.from(this.registries.values());
    const totalAssets = registries.reduce((sum, r) => sum + r.assets.length, 0);
    const activeAssets = registries.reduce((sum, r) => sum + r.assets.filter(a => a.status === 'available').length, 0);
    const totalCategories = registries.reduce((sum, r) => sum + r.categories.length, 0);
    const totalTags = registries.reduce((sum, r) => sum + r.tags.length, 0);
    const totalSize = registries.reduce((sum, r) => sum + r.assets.reduce((s, a) => s + a.size, 0), 0);
    const totalDependencies = registries.reduce((sum, r) => sum + r.dependencies.length, 0);

    for (const registry of registries) {
      registry.analytics = {
        totalAssets: registry.assets.length,
        activeAssets: registry.assets.filter(a => a.status === 'available').length,
        totalCategories: registry.categories.length,
        totalTags: registry.tags.length,
        averageAssetSize: registry.assets.length > 0 ? 
          registry.assets.reduce((sum, a) => sum + a.size, 0) / registry.assets.length : 0,
        dependencyCount: registry.dependencies.length,
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Get system statistics
   */
  getStatistics(): {
    totalRegistries: number;
    activeRegistries: number;
    registriesByType: Record<RegistryType, number>;
    registriesByStatus: Record<RegistryStatus, number>;
    totalAssets: number;
    activeAssets: number;
    totalCategories: number;
    totalTags: number;
    averageAssetSize: number;
    uptime: number;
  } {
    if (!this.isInitialized) {
      throw new Error('Avatar Asset Registry Manager not initialized');
    }

    const registries = Array.from(this.registries.values());
    const activeRegistries = registries.filter(r => r.status === 'active');
    const totalAssets = registries.reduce((sum, r) => sum + r.assets.length, 0);
    const activeAssets = registries.reduce((sum, r) => sum + r.assets.filter(a => a.status === 'available').length, 0);
    const totalCategories = registries.reduce((sum, r) => sum + r.categories.length, 0);
    const totalTags = registries.reduce((sum, r) => sum + r.tags.length, 0);
    const totalSize = registries.reduce((sum, r) => sum + r.assets.reduce((s, a) => s + a.size, 0), 0);

    const registriesByType: Record<RegistryType, number> = {
      master: 0,
      user: 0,
      shared: 0,
      system: 0,
      custom: 0
    };

    const registriesByStatus: Record<RegistryStatus, number> = {
      active: 0,
      inactive: 0,
      error: 0,
      maintenance: 0
    };

    for (const registry of registries) {
      registriesByType[registry.type]++;
      registriesByStatus[registry.status]++;
    }

    return {
      totalRegistries: registries.length,
      activeRegistries: activeRegistries.length,
      registriesByType,
      registriesByStatus,
      totalAssets,
      activeAssets,
      totalCategories,
      totalTags,
      averageAssetSize: totalAssets > 0 ? totalSize / totalAssets : 0,
      uptime: Date.now() - this.startTime.getTime()
    };
  }

  /**
   * Destroy the Avatar Asset Registry Manager
   */
  async destroy(): Promise<void> {
    this.logger.info('Destroying Avatar Asset Registry Manager...');

    this.registries.clear();
    this.isInitialized = false;

    this.logger.info('Avatar Asset Registry Manager destroyed');
  }
}

// Export default instance
export const avatarAssetRegistryManager = new AvatarAssetRegistryManager();
export default avatarAssetRegistryManager;