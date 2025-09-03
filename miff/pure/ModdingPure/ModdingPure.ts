/**
 * ModdingPure.ts - Modding and Plugin Management System
 * 
 * Inspired by Crystal Space SCF plugin framework and Godot export templates.
 * Provides plugin discovery, loading, and management capabilities for MIFF games.
 * 
 * Crystal Space SCF (Shared Class Factory) provides a plugin architecture where
 * plugins register their classes with a central factory. Godot's export templates
 * allow for platform-specific builds and custom export configurations.
 * 
 * This module adapts these concepts to provide a pure, remix-safe modding system
 * that supports plugin discovery, dependency management, and asset bundling.
 */

const QUIET = process.env.TEST_CLI === '1';
function log(...args: any[]) { if (!QUIET) console.log(...args); }
function warn(...args: any[]) { if (!QUIET) console.warn(...args); }
function error(...args: any[]) { if (!QUIET) console.error(...args); }

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  dependencies: string[];
  entryPoint: string;
  assets: string[];
  metadata: Record<string, any>;
}

export interface PluginConfig {
  id: string;
  enabled: boolean;
  loadOrder: number;
  settings: Record<string, any>;
}

export interface PluginInstance {
  id: string;
  manifest: PluginManifest;
  config: PluginConfig;
  entryPoint: any;
  assets: Map<string, any>;
  dependencies: PluginInstance[];
  status: 'loading' | 'loaded' | 'error' | 'disabled';
  error?: string;
}

export interface ModdingConfig {
  pluginDirectory: string;
  autoLoad: boolean;
  dependencyResolution: 'strict' | 'loose';
  assetBundling: boolean;
  hotReload: boolean;
  maxPlugins: number;
}

export interface AssetBundle {
  id: string;
  name: string;
  assets: Map<string, any>;
  metadata: Record<string, any>;
  size: number;
  checksum: string;
}

export interface ExportTemplate {
  id: string;
  name: string;
  platform: string;
  target: string;
  config: Record<string, any>;
  assets: string[];
  dependencies: string[];
}

/**
 * Plugin Discovery and Loading System
 * 
 * Discovers plugins in the plugin directory and manages their lifecycle.
 * Uses SCF-like conventions for plugin structure and registration.
 */
export class PluginDiscovery {
  private plugins: Map<string, PluginInstance> = new Map();
  private config: ModdingConfig;

  constructor(config: ModdingConfig) {
    this.config = config;
  }

  /**
   * Discover plugins in the plugin directory
   */
  async discoverPlugins(): Promise<PluginInstance[]> {
    log(`🔍 Discovering plugins in ${this.config.pluginDirectory}...`);
    
    // In a real implementation, this would scan the filesystem
    // For now, we'll return mock plugins
    const mockPlugins = this.createMockPlugins();
    
    for (const plugin of mockPlugins) {
      this.plugins.set(plugin.id, plugin);
    }
    
    log(`✅ Discovered ${mockPlugins.length} plugins`);
    return mockPlugins;
  }

  /**
   * Load a plugin by ID
   */
  async loadPlugin(id: string): Promise<PluginInstance> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Plugin not found: ${id}`);
    }

    if (plugin.status === 'loaded') {
      return plugin;
    }

    log(`📦 Loading plugin: ${plugin.manifest.name} (${plugin.manifest.version})`);
    
    try {
      // Check dependencies
      await this.resolveDependencies(plugin);
      
      // Load entry point (in real implementation, this would be dynamic import)
      plugin.entryPoint = this.createMockEntryPoint(plugin.manifest);
      
      // Load assets
      await this.loadPluginAssets(plugin);
      
      plugin.status = 'loaded';
      log(`✅ Plugin loaded: ${plugin.manifest.name}`);
      
    } catch (err) {
      plugin.status = 'error';
      const message = (err && (err as any).message) ? (err as any).message : 'Unknown error';
      plugin.error = message;
      error(`❌ Failed to load plugin ${plugin.manifest.name}:`, message);
    }

    return plugin;
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(id: string): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      return false;
    }

    log(`📦 Unloading plugin: ${plugin.manifest.name}`);
    
    // Cleanup plugin resources
    plugin.assets.clear();
    plugin.entryPoint = null;
    plugin.status = 'disabled';
    
    log(`✅ Plugin unloaded: ${plugin.manifest.name}`);
    return true;
  }

  /**
   * Get all loaded plugins
   */
  getLoadedPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values()).filter(p => p.status === 'loaded');
  }

  /**
   * Get plugin by ID
   */
  getPlugin(id: string): PluginInstance | undefined {
    return this.plugins.get(id);
  }

  /**
   * Resolve plugin dependencies
   */
  private async resolveDependencies(plugin: PluginInstance): Promise<void> {
    const dependencies: PluginInstance[] = [];
    
    for (const depId of plugin.manifest.dependencies) {
      const dep = this.plugins.get(depId);
      if (!dep) {
        throw new Error(`Dependency not found: ${depId}`);
      }
      
      if (dep.status !== 'loaded') {
        await this.loadPlugin(depId);
      }
      
      dependencies.push(dep);
    }
    
    plugin.dependencies = dependencies;
  }

  /**
   * Load plugin assets
   */
  private async loadPluginAssets(plugin: PluginInstance): Promise<void> {
    for (const assetPath of plugin.manifest.assets) {
      // In a real implementation, this would load actual assets
      const asset = await this.loadAsset(assetPath);
      plugin.assets.set(assetPath, asset);
    }
  }

  /**
   * Load an asset from path
   */
  private async loadAsset(path: string): Promise<any> {
    // Mock asset loading
    return {
      path,
      type: this.getAssetType(path),
      data: `mock_data_for_${path}`,
      size: Math.floor(Math.random() * 1000) + 100
    };
  }

  /**
   * Get asset type from path
   */
  private getAssetType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return 'image';
      case 'mp3':
      case 'wav':
      case 'ogg':
        return 'audio';
      case 'json':
        return 'data';
      case 'txt':
        return 'text';
      default:
        return 'unknown';
    }
  }

  /**
   * Create mock entry point for plugin
   */
  private createMockEntryPoint(manifest: PluginManifest): any {
    return {
      initialize: () => {
        log(`🎮 Initializing plugin: ${manifest.name}`);
        return { success: true };
      },
      update: (delta: number) => {
        // Plugin update logic
      },
      cleanup: () => {
        log(`🧹 Cleaning up plugin: ${manifest.name}`);
      }
    };
  }

  /**
   * Create mock plugins for testing
   */
  private createMockPlugins(): PluginInstance[] {
    return [
      {
        id: 'ui-enhancements',
        manifest: {
          id: 'ui-enhancements',
          name: 'UI Enhancements',
          version: '1.0.0',
          description: 'Enhanced user interface components',
          author: 'MIFF Community',
          license: 'MIT',
          dependencies: [],
          entryPoint: './ui-enhancements.js',
          assets: ['assets/ui/button.png', 'assets/ui/panel.json'],
          metadata: { category: 'ui', priority: 'high' }
        },
        config: {
          id: 'ui-enhancements',
          enabled: true,
          loadOrder: 1,
          settings: { theme: 'dark', animations: true }
        },
        entryPoint: null,
        assets: new Map(),
        dependencies: [],
        status: 'loading'
      },
      {
        id: 'physics-extended',
        manifest: {
          id: 'physics-extended',
          name: 'Extended Physics',
          version: '2.1.0',
          description: 'Advanced physics simulation',
          author: 'Physics Labs',
          license: 'GPL-3.0',
          dependencies: ['core-physics'],
          entryPoint: './physics-extended.js',
          assets: ['assets/physics/particles.json', 'assets/physics/forces.dat'],
          metadata: { category: 'physics', complexity: 'advanced' }
        },
        config: {
          id: 'physics-extended',
          enabled: true,
          loadOrder: 2,
          settings: { gravity: -9.81, airResistance: 0.1 }
        },
        entryPoint: null,
        assets: new Map(),
        dependencies: [],
        status: 'loading'
      },
      {
        id: 'core-physics',
        manifest: {
          id: 'core-physics',
          name: 'Core Physics',
          version: '1.5.0',
          description: 'Basic physics engine',
          author: 'MIFF Core Team',
          license: 'MIT',
          dependencies: [],
          entryPoint: './core-physics.js',
          assets: ['assets/physics/basic.json'],
          metadata: { category: 'core', required: true }
        },
        config: {
          id: 'core-physics',
          enabled: true,
          loadOrder: 0,
          settings: { enabled: true }
        },
        entryPoint: null,
        assets: new Map(),
        dependencies: [],
        status: 'loading'
      }
    ];
  }
}

/**
 * Asset Pipeline and Bundling System
 * 
 * Manages asset bundling and export templates inspired by Godot's export system.
 */
export class AssetPipeline {
  private bundles: Map<string, AssetBundle> = new Map();
  private templates: Map<string, ExportTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Create an asset bundle
   */
  async createBundle(
    id: string,
    name: string,
    assets: Map<string, any>,
    metadata: Record<string, any> = {}
  ): Promise<AssetBundle> {
    log(`📦 Creating asset bundle: ${name}`);

    const bundle: AssetBundle = {
      id,
      name,
      assets,
      metadata,
      size: this.calculateBundleSize(assets),
      checksum: this.calculateChecksum(assets)
    };

    this.bundles.set(id, bundle);
    log(`✅ Bundle created: ${name} (${bundle.size} bytes)`);
    
    return bundle;
  }

  /**
   * Export bundle for specific platform
   */
  async exportBundle(
    bundleId: string,
    templateId: string,
    outputPath: string
  ): Promise<string> {
    const bundle = this.bundles.get(bundleId);
    const template = this.templates.get(templateId);

    if (!bundle) {
      throw new Error(`Bundle not found: ${bundleId}`);
    }
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    log(`🚀 Exporting bundle ${bundle.name} for ${template.platform}...`);

    // Apply template configuration
    const exportedAssets = this.applyTemplateConfig(bundle, template);
    
    // Generate export manifest
    const manifest = this.generateExportManifest(bundle, template, exportedAssets);
    
    // In a real implementation, this would write files to disk
    const exportPath = `${outputPath}/${bundle.id}-${template.platform}.json`;
    
    log(`✅ Bundle exported to: ${exportPath}`);
    return exportPath;
  }

  /**
   * Get available export templates
   */
  getExportTemplates(): ExportTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Add custom export template
   */
  addExportTemplate(template: ExportTemplate): void {
    this.templates.set(template.id, template);
    log(`📋 Added export template: ${template.name}`);
  }

  /**
   * Calculate bundle size
   */
  private calculateBundleSize(assets: Map<string, any>): number {
    let totalSize = 0;
    for (const asset of assets.values()) {
      totalSize += asset.size || 0;
    }
    return totalSize;
  }

  /**
   * Calculate bundle checksum
   */
  private calculateChecksum(assets: Map<string, any>): string {
    // Simple checksum calculation
    const assetList = Array.from(assets.entries())
      .map(([path, asset]) => `${path}:${asset.size}`)
      .sort()
      .join('|');
    
    return Buffer.from(assetList).toString('base64').substring(0, 16);
  }

  /**
   * Apply template configuration to bundle
   */
  private applyTemplateConfig(bundle: AssetBundle, template: ExportTemplate): Map<string, any> {
    const exportedAssets = new Map<string, any>();
    
    for (const [path, asset] of bundle.assets) {
      // Check if asset should be included based on template
      if (this.shouldIncludeAsset(path, template)) {
        // Apply template-specific transformations
        const transformedAsset = this.transformAsset(asset, template);
        exportedAssets.set(path, transformedAsset);
      }
    }
    
    return exportedAssets;
  }

  /**
   * Check if asset should be included in export
   */
  private shouldIncludeAsset(path: string, template: ExportTemplate): boolean {
    // Check if asset is in template's asset list
    if (template.assets.length > 0) {
      return template.assets.some(pattern => path.includes(pattern));
    }
    
    // Default: include all assets
    return true;
  }

  /**
   * Transform asset for specific platform
   */
  private transformAsset(asset: any, template: ExportTemplate): any {
    // Apply platform-specific transformations
    const transformed = { ...asset };
    
    switch (template.platform) {
      case 'web':
        // Optimize for web delivery
        transformed.compressed = true;
        transformed.format = 'webp';
        break;
      case 'mobile':
        // Optimize for mobile
        transformed.compressed = true;
        transformed.format = 'png';
        break;
      case 'desktop':
        // High quality for desktop
        transformed.compressed = false;
        transformed.format = 'original';
        break;
    }
    
    return transformed;
  }

  /**
   * Generate export manifest
   */
  private generateExportManifest(
    bundle: AssetBundle,
    template: ExportTemplate,
    assets: Map<string, any>
  ): any {
    return {
      bundle: {
        id: bundle.id,
        name: bundle.name,
        version: bundle.metadata.version || '1.0.0'
      },
      template: {
        id: template.id,
        platform: template.platform,
        target: template.target
      },
      assets: Array.from(assets.entries()).map(([path, asset]) => ({
        path,
        size: asset.size,
        type: asset.type,
        checksum: asset.checksum || 'unknown'
      })),
      metadata: {
        ...bundle.metadata,
        exportTimestamp: new Date().toISOString(),
        exportTemplate: template.id
      }
    };
  }

  /**
   * Initialize default export templates
   */
  private initializeTemplates(): void {
    const defaultTemplates: ExportTemplate[] = [
      {
        id: 'web-html5',
        name: 'Web HTML5',
        platform: 'web',
        target: 'html5',
        config: {
          compression: true,
          format: 'webp',
          minify: true
        },
        assets: ['*.png', '*.jpg', '*.json'],
        dependencies: []
      },
      {
        id: 'mobile-android',
        name: 'Mobile Android',
        platform: 'mobile',
        target: 'android',
        config: {
          compression: true,
          format: 'png',
          quality: 'high'
        },
        assets: ['*.png', '*.mp3', '*.json'],
        dependencies: ['android-support']
      },
      {
        id: 'desktop-windows',
        name: 'Desktop Windows',
        platform: 'desktop',
        target: 'windows',
        config: {
          compression: false,
          format: 'original',
          quality: 'maximum'
        },
        assets: ['*'],
        dependencies: []
      }
    ];

    for (const template of defaultTemplates) {
      this.templates.set(template.id, template);
    }
  }
}

/**
 * Main Modding System
 * 
 * Coordinates plugin discovery, asset pipeline, and export functionality.
 */
export class ModdingSystem {
  private discovery: PluginDiscovery;
  private pipeline: AssetPipeline;
  private config: ModdingConfig;

  constructor(config: ModdingConfig) {
    this.config = config;
    this.discovery = new PluginDiscovery(config);
    this.pipeline = new AssetPipeline();
  }

  /**
   * Initialize the modding system
   */
  async initialize(): Promise<void> {
    log('🎮 Initializing modding system...');
    
    if (this.config.autoLoad) {
      await this.discovery.discoverPlugins();
      await this.loadEnabledPlugins();
    }
    
    log('✅ Modding system initialized');
  }

  /**
   * Load all enabled plugins
   */
  async loadEnabledPlugins(): Promise<PluginInstance[]> {
    const plugins = await this.discovery.discoverPlugins();
    const enabledPlugins = plugins.filter(p => p.config.enabled);
    
    // Sort by load order
    enabledPlugins.sort((a, b) => a.config.loadOrder - b.config.loadOrder);
    
    const loadedPlugins: PluginInstance[] = [];
    
    for (const plugin of enabledPlugins) {
      try {
        const loaded = await this.discovery.loadPlugin(plugin.id);
        loadedPlugins.push(loaded);
      } catch (error) {
        console.error(`Failed to load plugin ${plugin.manifest.name}:`, error);
      }
    }
    
    return loadedPlugins;
  }

  /**
   * Get all loaded plugins
   */
  getLoadedPlugins(): PluginInstance[] {
    return this.discovery.getLoadedPlugins();
  }

  /**
   * Get plugin by ID
   */
  getPlugin(id: string): PluginInstance | undefined {
    return this.discovery.getPlugin(id);
  }

  /**
   * Create asset bundle from plugins
   */
  async createPluginBundle(pluginIds: string[]): Promise<AssetBundle> {
    const assets = new Map<string, any>();
    
    for (const pluginId of pluginIds) {
      const plugin = this.discovery.getPlugin(pluginId);
      if (plugin && plugin.status === 'loaded') {
        // Merge plugin assets
        for (const [path, asset] of plugin.assets) {
          assets.set(`${pluginId}/${path}`, asset);
        }
      }
    }
    
    const bundle = await this.pipeline.createBundle(
      `bundle-${Date.now()}`,
      `Plugin Bundle (${pluginIds.join(', ')})`,
      assets,
      { plugins: pluginIds, timestamp: new Date().toISOString() }
    );
    
    return bundle;
  }

  /**
   * Export bundle for platform
   */
  async exportBundle(
    bundleId: string,
    templateId: string,
    outputPath: string
  ): Promise<string> {
    return this.pipeline.exportBundle(bundleId, templateId, outputPath);
  }

  /**
   * Get available export templates
   */
  getExportTemplates(): ExportTemplate[] {
    return this.pipeline.getExportTemplates();
  }

  /**
   * Generate modding report
   */
  generateReport(): any {
    const plugins = this.getLoadedPlugins();
    const templates = this.getExportTemplates();
    
    return {
      system: {
        config: this.config,
        status: 'active',
        timestamp: new Date().toISOString()
      },
      plugins: {
        total: plugins.length,
        loaded: plugins.filter(p => p.status === 'loaded').length,
        errors: plugins.filter(p => p.status === 'error').length,
        list: plugins.map(p => ({
          id: p.id,
          name: p.manifest.name,
          version: p.manifest.version,
          status: p.status,
          dependencies: p.manifest.dependencies.length
        }))
      },
      assets: {
        templates: templates.length,
        available: templates.map(t => ({
          id: t.id,
          name: t.name,
          platform: t.platform,
          target: t.target
        }))
      }
    };
  }
}

/**
 * Factory function to create a modding system
 */
export function createModdingSystem(config: ModdingConfig): ModdingSystem {
  return new ModdingSystem(config);
}

/**
 * Factory function to create a plugin discovery system
 */
export function createPluginDiscovery(config: ModdingConfig): PluginDiscovery {
  return new PluginDiscovery(config);
}

/**
 * Factory function to create an asset pipeline
 */
export function createAssetPipeline(): AssetPipeline {
  return new AssetPipeline();
}