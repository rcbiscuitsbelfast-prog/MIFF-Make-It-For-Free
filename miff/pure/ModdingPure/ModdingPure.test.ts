/**
 * ModdingPure.test.ts - Tests for ModdingPure module
 * 
 * Tests plugin discovery, asset pipeline, and export functionality.
 */

import {
  createModdingSystem,
  createPluginDiscovery,
  createAssetPipeline,
  ModdingConfig,
  PluginManifest,
  ExportTemplate
} from './ModdingPure';

describe('ModdingPure', () => {
  let config: ModdingConfig;

  beforeEach(() => {
    config = {
      pluginDirectory: './plugins',
      autoLoad: false,
      dependencyResolution: 'strict',
      assetBundling: true,
      hotReload: false,
      maxPlugins: 100
    };
  });

  describe('PluginDiscovery', () => {
    it('should discover plugins', async () => {
      const discovery = createPluginDiscovery(config);
      const plugins = await discovery.discoverPlugins();

      expect(plugins).toBeDefined();
      expect(plugins.length).toBeGreaterThan(0);
      expect(plugins[0]).toHaveProperty('id');
      expect(plugins[0]).toHaveProperty('manifest');
      expect(plugins[0]).toHaveProperty('status');
    });

    it('should load plugin successfully', async () => {
      const discovery = createPluginDiscovery(config);
      await discovery.discoverPlugins();

      const plugin = await discovery.loadPlugin('ui-enhancements');
      
      expect(plugin.status).toBe('loaded');
      expect(plugin.entryPoint).toBeDefined();
      expect(plugin.assets.size).toBeGreaterThan(0);
    });

    it('should handle plugin dependencies', async () => {
      const discovery = createPluginDiscovery(config);
      await discovery.discoverPlugins();

      const plugin = await discovery.loadPlugin('physics-extended');
      
      expect(plugin.status).toBe('loaded');
      expect(plugin.dependencies.length).toBeGreaterThan(0);
      expect(plugin.dependencies[0].id).toBe('core-physics');
    });

    it('should fail to load plugin with missing dependency', async () => {
      const discovery = createPluginDiscovery(config);
      
      // Create a plugin with non-existent dependency
      const mockPlugin = {
        id: 'broken-plugin',
        manifest: {
          id: 'broken-plugin',
          name: 'Broken Plugin',
          version: '1.0.0',
          description: 'Plugin with missing dependency',
          author: 'Test',
          license: 'MIT',
          dependencies: ['non-existent-plugin'],
          entryPoint: './broken.js',
          assets: [],
          metadata: {}
        },
        config: {
          id: 'broken-plugin',
          enabled: true,
          loadOrder: 0,
          settings: {}
        },
        entryPoint: null,
        assets: new Map(),
        dependencies: [],
        status: 'loading' as const
      };

      // Mock the discoverPlugins method to return our broken plugin
      jest.spyOn(discovery as any, 'discoverPlugins').mockResolvedValue([mockPlugin]);
      jest.spyOn(discovery as any, 'createMockPlugins').mockReturnValue([mockPlugin]);

      await discovery.discoverPlugins();
      
      await expect(discovery.loadPlugin('broken-plugin')).rejects.toThrow('Dependency not found');
    });

    it('should unload plugin successfully', async () => {
      const discovery = createPluginDiscovery(config);
      await discovery.discoverPlugins();
      await discovery.loadPlugin('ui-enhancements');

      const result = await discovery.unloadPlugin('ui-enhancements');
      
      expect(result).toBe(true);
      const plugin = discovery.getPlugin('ui-enhancements');
      expect(plugin?.status).toBe('disabled');
    });

    it('should return loaded plugins only', async () => {
      const discovery = createPluginDiscovery(config);
      await discovery.discoverPlugins();
      await discovery.loadPlugin('ui-enhancements');
      await discovery.loadPlugin('core-physics');

      const loadedPlugins = discovery.getLoadedPlugins();
      
      expect(loadedPlugins.length).toBe(2);
      expect(loadedPlugins.every(p => p.status === 'loaded')).toBe(true);
    });
  });

  describe('AssetPipeline', () => {
    it('should create asset bundle', async () => {
      const pipeline = createAssetPipeline();
      const assets = new Map([
        ['test.png', { type: 'image', size: 1024, data: 'mock' }],
        ['test.json', { type: 'data', size: 512, data: 'mock' }]
      ]);

      const bundle = await pipeline.createBundle(
        'test-bundle',
        'Test Bundle',
        assets,
        { version: '1.0.0' }
      );

      expect(bundle.id).toBe('test-bundle');
      expect(bundle.name).toBe('Test Bundle');
      expect(bundle.assets.size).toBe(2);
      expect(bundle.size).toBe(1536); // 1024 + 512
      expect(bundle.checksum).toBeDefined();
    });

    it('should export bundle for platform', async () => {
      const pipeline = createAssetPipeline();
      const assets = new Map([
        ['test.png', { type: 'image', size: 1024, data: 'mock' }]
      ]);

      const bundle = await pipeline.createBundle('test-bundle', 'Test Bundle', assets);
      const exportPath = await pipeline.exportBundle('test-bundle', 'web-html5', './output');

      expect(exportPath).toContain('test-bundle-web.json');
    });

    it('should fail to export non-existent bundle', async () => {
      const pipeline = createAssetPipeline();
      
      await expect(
        pipeline.exportBundle('non-existent', 'web-html5', './output')
      ).rejects.toThrow('Bundle not found');
    });

    it('should fail to export with non-existent template', async () => {
      const pipeline = createAssetPipeline();
      const assets = new Map([
        ['test.png', { type: 'image', size: 1024, data: 'mock' }]
      ]);

      const bundle = await pipeline.createBundle('test-bundle', 'Test Bundle', assets);
      
      await expect(
        pipeline.exportBundle('test-bundle', 'non-existent', './output')
      ).rejects.toThrow('Template not found');
    });

    it('should return available export templates', () => {
      const pipeline = createAssetPipeline();
      const templates = pipeline.getExportTemplates();

      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some(t => t.platform === 'web')).toBe(true);
      expect(templates.some(t => t.platform === 'mobile')).toBe(true);
      expect(templates.some(t => t.platform === 'desktop')).toBe(true);
    });

    it('should add custom export template', () => {
      const pipeline = createAssetPipeline();
      const customTemplate: ExportTemplate = {
        id: 'custom-template',
        name: 'Custom Template',
        platform: 'custom',
        target: 'custom',
        config: { custom: true },
        assets: ['*.custom'],
        dependencies: []
      };

      pipeline.addExportTemplate(customTemplate);
      const templates = pipeline.getExportTemplates();
      
      expect(templates.some(t => t.id === 'custom-template')).toBe(true);
    });

    it('should apply platform-specific transformations', async () => {
      const pipeline = createAssetPipeline();
      const assets = new Map([
        ['test.png', { type: 'image', size: 1024, data: 'mock' }]
      ]);

      const bundle = await pipeline.createBundle('test-bundle', 'Test Bundle', assets);
      
      // Test web platform
      const webPath = await pipeline.exportBundle('test-bundle', 'web-html5', './output');
      expect(webPath).toContain('web');
      
      // Test mobile platform
      const mobilePath = await pipeline.exportBundle('test-bundle', 'mobile-android', './output');
      expect(mobilePath).toContain('mobile');
      
      // Test desktop platform
      const desktopPath = await pipeline.exportBundle('test-bundle', 'desktop-windows', './output');
      expect(desktopPath).toContain('desktop');
    });
  });

  describe('ModdingSystem', () => {
    it('should initialize successfully', async () => {
      const system = createModdingSystem(config);
      await system.initialize();

      // System should be initialized without errors
      expect(system).toBeDefined();
    });

    it('should load enabled plugins automatically', async () => {
      config.autoLoad = true;
      const system = createModdingSystem(config);
      await system.initialize();

      const loadedPlugins = system.getLoadedPlugins();
      expect(loadedPlugins.length).toBeGreaterThan(0);
    });

    it('should load enabled plugins manually', async () => {
      config.autoLoad = false;
      const system = createModdingSystem(config);
      await system.initialize();

      const loadedPlugins = await system.loadEnabledPlugins();
      expect(loadedPlugins.length).toBeGreaterThan(0);
    });

    it('should get plugin by ID', async () => {
      const system = createModdingSystem(config);
      await system.initialize();
      await system.loadEnabledPlugins();

      const plugin = system.getPlugin('ui-enhancements');
      expect(plugin).toBeDefined();
      expect(plugin?.manifest.name).toBe('UI Enhancements');
    });

    it('should create plugin bundle', async () => {
      const system = createModdingSystem(config);
      await system.initialize();
      await system.loadEnabledPlugins();

      const bundle = await system.createPluginBundle(['ui-enhancements', 'core-physics']);
      
      expect(bundle).toBeDefined();
      expect(bundle.name).toContain('Plugin Bundle');
      expect(bundle.metadata.plugins).toContain('ui-enhancements');
      expect(bundle.metadata.plugins).toContain('core-physics');
    });

    it('should export bundle for platform', async () => {
      const system = createModdingSystem(config);
      await system.initialize();
      await system.loadEnabledPlugins();

      const bundle = await system.createPluginBundle(['ui-enhancements']);
      const exportPath = await system.exportBundle(bundle.id, 'web-html5', './output');

      expect(exportPath).toContain(bundle.id);
      expect(exportPath).toContain('web');
    });

    it('should get available export templates', () => {
      const system = createModdingSystem(config);
      const templates = system.getExportTemplates();

      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some(t => t.platform === 'web')).toBe(true);
    });

    it('should generate comprehensive report', () => {
      const system = createModdingSystem(config);
      const report = system.generateReport();

      expect(report).toHaveProperty('system');
      expect(report).toHaveProperty('plugins');
      expect(report).toHaveProperty('assets');
      
      expect(report.system).toHaveProperty('config');
      expect(report.system).toHaveProperty('status');
      expect(report.system).toHaveProperty('timestamp');
      
      expect(report.plugins).toHaveProperty('total');
      expect(report.plugins).toHaveProperty('loaded');
      expect(report.plugins).toHaveProperty('errors');
      expect(report.plugins).toHaveProperty('list');
      
      expect(report.assets).toHaveProperty('templates');
      expect(report.assets).toHaveProperty('available');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete plugin lifecycle', async () => {
      const system = createModdingSystem(config);
      await system.initialize();

      // Discover and load plugins
      const loadedPlugins = await system.loadEnabledPlugins();
      expect(loadedPlugins.length).toBeGreaterThan(0);

      // Create bundle from loaded plugins
      const pluginIds = loadedPlugins.map(p => p.id);
      const bundle = await system.createPluginBundle(pluginIds);
      expect(bundle.assets.size).toBeGreaterThan(0);

      // Export bundle for different platforms
      const templates = system.getExportTemplates();
      for (const template of templates.slice(0, 2)) { // Test first 2 templates
        const exportPath = await system.exportBundle(bundle.id, template.id, './output');
        expect(exportPath).toContain(template.platform);
      }

      // Generate final report
      const report = system.generateReport();
      expect(report.plugins.loaded).toBe(loadedPlugins.length);
      expect(report.assets.templates).toBe(templates.length);
    });

    it('should handle plugin dependency resolution', async () => {
      const system = createModdingSystem(config);
      await system.initialize();

      // Load a plugin with dependencies
      const plugin = system.getPlugin('physics-extended');
      expect(plugin).toBeDefined();

      if (plugin) {
        await system.loadEnabledPlugins();
        const loadedPlugin = system.getPlugin('physics-extended');
        expect(loadedPlugin?.status).toBe('loaded');
        expect(loadedPlugin?.dependencies.length).toBeGreaterThan(0);
        
        // Check that dependency is also loaded
        const dependency = system.getPlugin('core-physics');
        expect(dependency?.status).toBe('loaded');
      }
    });

    it('should handle asset transformation for different platforms', async () => {
      const system = createModdingSystem(config);
      await system.initialize();
      await system.loadEnabledPlugins();

      // Create bundle with various asset types
      const assets = new Map([
        ['image.png', { type: 'image', size: 1024, data: 'mock' }],
        ['audio.mp3', { type: 'audio', size: 2048, data: 'mock' }],
        ['data.json', { type: 'data', size: 512, data: 'mock' }]
      ]);

      const bundle = await system.createPluginBundle(['ui-enhancements']);
      
      // Test export for different platforms
      const webExport = await system.exportBundle(bundle.id, 'web-html5', './output');
      const mobileExport = await system.exportBundle(bundle.id, 'mobile-android', './output');
      const desktopExport = await system.exportBundle(bundle.id, 'desktop-windows', './output');

      expect(webExport).toContain('web');
      expect(mobileExport).toContain('mobile');
      expect(desktopExport).toContain('desktop');
    });
  });

  describe('Error Handling', () => {
    it('should handle plugin loading errors gracefully', async () => {
      const discovery = createPluginDiscovery(config);
      
      // Mock a plugin that throws an error during loading
      const errorPlugin = {
        id: 'error-plugin',
        manifest: {
          id: 'error-plugin',
          name: 'Error Plugin',
          version: '1.0.0',
          description: 'Plugin that causes errors',
          author: 'Test',
          license: 'MIT',
          dependencies: [],
          entryPoint: './error.js',
          assets: [],
          metadata: {}
        },
        config: {
          id: 'error-plugin',
          enabled: true,
          loadOrder: 0,
          settings: {}
        },
        entryPoint: null,
        assets: new Map(),
        dependencies: [],
        status: 'loading' as const
      };

      jest.spyOn(discovery as any, 'discoverPlugins').mockResolvedValue([errorPlugin]);
      jest.spyOn(discovery as any, 'createMockEntryPoint').mockImplementation(() => {
        throw new Error('Plugin initialization failed');
      });

      await discovery.discoverPlugins();
      const plugin = await discovery.loadPlugin('error-plugin');
      
      expect(plugin.status).toBe('error');
      expect(plugin.error).toBeDefined();
    });

    it('should handle invalid plugin manifests', async () => {
      const discovery = createPluginDiscovery(config);
      
      // Mock a plugin with invalid manifest
      const invalidPlugin = {
        id: 'invalid-plugin',
        manifest: {
          id: 'invalid-plugin',
          name: '', // Invalid: empty name
          version: 'invalid-version', // Invalid: not semver
          description: 'Invalid plugin',
          author: 'Test',
          license: 'MIT',
          dependencies: ['non-existent'],
          entryPoint: '',
          assets: [],
          metadata: {}
        },
        config: {
          id: 'invalid-plugin',
          enabled: true,
          loadOrder: -1, // Invalid: negative load order
          settings: {}
        },
        entryPoint: null,
        assets: new Map(),
        dependencies: [],
        status: 'loading' as const
      };

      jest.spyOn(discovery as any, 'discoverPlugins').mockResolvedValue([invalidPlugin]);

      await discovery.discoverPlugins();
      
      // Should fail to load due to missing dependency
      await expect(discovery.loadPlugin('invalid-plugin')).rejects.toThrow('Dependency not found');
    });
  });
});