#!/usr/bin/env node

/**
 * modding.ts - CLI commands for ModdingPure module
 * 
 * Provides commands for plugin management and asset bundling.
 */

import { Command } from 'commander';
import { 
  createModdingSystem, 
  createPluginDiscovery, 
  createAssetPipeline,
  ModdingConfig,
  ExportTemplate
} from '../miff/pure/ModdingPure/ModdingPure';

const program = new Command();

program
  .name('modding')
  .description('Plugin management and asset bundling commands for MIFF games')
  .version('1.0.0');

program
  .command('discover')
  .description('Discover plugins in plugin directory')
  .option('-d, --directory <path>', 'Plugin directory path', './plugins')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    console.log('🔍 Discovering plugins...');

    const config: ModdingConfig = {
      pluginDirectory: options.directory,
      autoLoad: false,
      dependencyResolution: 'strict',
      assetBundling: true,
      hotReload: false,
      maxPlugins: 100
    };

    const discovery = createPluginDiscovery(config);
    const plugins = await discovery.discoverPlugins();

    console.log(`✅ Discovered ${plugins.length} plugins:`);
    
    for (const plugin of plugins) {
      const status = plugin.status === 'loading' ? '⏳' : 
                    plugin.status === 'loaded' ? '✅' : 
                    plugin.status === 'error' ? '❌' : '⏸️';
      
      console.log(`  ${status} ${plugin.manifest.name} (${plugin.manifest.version})`);
      console.log(`    ID: ${plugin.id}`);
      console.log(`    Author: ${plugin.manifest.author}`);
      console.log(`    Dependencies: ${plugin.manifest.dependencies.length}`);
      
      if (options.verbose) {
        console.log(`    Description: ${plugin.manifest.description}`);
        console.log(`    License: ${plugin.manifest.license}`);
        console.log(`    Assets: ${plugin.manifest.assets.length}`);
        console.log(`    Enabled: ${plugin.config.enabled}`);
        console.log(`    Load Order: ${plugin.config.loadOrder}`);
      }
      console.log('');
    }
  });

program
  .command('load')
  .description('Load plugins')
  .option('-p, --plugin <id>', 'Load specific plugin by ID')
  .option('-a, --all', 'Load all enabled plugins')
  .option('-d, --directory <path>', 'Plugin directory path', './plugins')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    if (!options.plugin && !options.all) {
      console.error('❌ Please specify --plugin <id> or --all');
      return;
    }

    console.log('📦 Loading plugins...');

    const config: ModdingConfig = {
      pluginDirectory: options.directory,
      autoLoad: false,
      dependencyResolution: 'strict',
      assetBundling: true,
      hotReload: false,
      maxPlugins: 100
    };

    const discovery = createPluginDiscovery(config);
    await discovery.discoverPlugins();

    if (options.plugin) {
      console.log(`🎯 Loading plugin: ${options.plugin}`);
      try {
        const plugin = await discovery.loadPlugin(options.plugin);
        console.log(`✅ Plugin loaded: ${plugin.manifest.name}`);
        
        if (options.verbose) {
          console.log(`  Status: ${plugin.status}`);
          console.log(`  Dependencies: ${plugin.dependencies.length}`);
          console.log(`  Assets: ${plugin.assets.size}`);
        }
      } catch (error) {
        console.error(`❌ Failed to load plugin: ${error.message}`);
      }
    } else if (options.all) {
      console.log('🎯 Loading all enabled plugins...');
      const loadedPlugins = await discovery.getLoadedPlugins();
      
      for (const plugin of loadedPlugins) {
        if (plugin.config.enabled) {
          try {
            await discovery.loadPlugin(plugin.id);
            console.log(`✅ Loaded: ${plugin.manifest.name}`);
          } catch (error) {
            console.error(`❌ Failed to load ${plugin.manifest.name}: ${error.message}`);
          }
        }
      }
      
      const finalLoaded = discovery.getLoadedPlugins();
      console.log(`\n📊 Summary: ${finalLoaded.length} plugins loaded successfully`);
    }
  });

program
  .command('unload')
  .description('Unload plugins')
  .argument('<id>', 'Plugin ID to unload')
  .option('-d, --directory <path>', 'Plugin directory path', './plugins')
  .action(async (id, options) => {
    console.log(`📦 Unloading plugin: ${id}`);

    const config: ModdingConfig = {
      pluginDirectory: options.directory,
      autoLoad: false,
      dependencyResolution: 'strict',
      assetBundling: true,
      hotReload: false,
      maxPlugins: 100
    };

    const discovery = createPluginDiscovery(config);
    await discovery.discoverPlugins();

    const result = await discovery.unloadPlugin(id);
    
    if (result) {
      console.log(`✅ Plugin unloaded: ${id}`);
    } else {
      console.error(`❌ Plugin not found or already unloaded: ${id}`);
    }
  });

program
  .command('list')
  .description('List loaded plugins')
  .option('-d, --directory <path>', 'Plugin directory path', './plugins')
  .option('-s, --status <status>', 'Filter by status (loading, loaded, error, disabled)')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    console.log('📋 Listing plugins...');

    const config: ModdingConfig = {
      pluginDirectory: options.directory,
      autoLoad: false,
      dependencyResolution: 'strict',
      assetBundling: true,
      hotReload: false,
      maxPlugins: 100
    };

    const discovery = createPluginDiscovery(config);
    await discovery.discoverPlugins();

    let plugins = discovery.getLoadedPlugins();
    
    if (options.status) {
      plugins = plugins.filter(p => p.status === options.status);
    }

    console.log(`📊 Found ${plugins.length} plugins:`);
    
    for (const plugin of plugins) {
      const status = plugin.status === 'loading' ? '⏳' : 
                    plugin.status === 'loaded' ? '✅' : 
                    plugin.status === 'error' ? '❌' : '⏸️';
      
      console.log(`  ${status} ${plugin.manifest.name} (${plugin.manifest.version})`);
      console.log(`    ID: ${plugin.id}`);
      console.log(`    Status: ${plugin.status}`);
      
      if (options.verbose) {
        console.log(`    Author: ${plugin.manifest.author}`);
        console.log(`    Dependencies: ${plugin.dependencies.length}`);
        console.log(`    Assets: ${plugin.assets.size}`);
        console.log(`    Enabled: ${plugin.config.enabled}`);
        console.log(`    Load Order: ${plugin.config.loadOrder}`);
        
        if (plugin.error) {
          console.log(`    Error: ${plugin.error}`);
        }
      }
      console.log('');
    }
  });

program
  .command('bundle')
  .description('Create asset bundle from plugins')
  .option('-p, --plugins <ids>', 'Comma-separated list of plugin IDs')
  .option('-n, --name <name>', 'Bundle name', 'Plugin Bundle')
  .option('-o, --output <path>', 'Output directory', './bundles')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    if (!options.plugins) {
      console.error('❌ Please specify --plugins <ids>');
      return;
    }

    const pluginIds = options.plugins.split(',').map(id => id.trim());
    console.log(`📦 Creating bundle: ${options.name}`);
    console.log(`Plugins: ${pluginIds.join(', ')}`);

    const config: ModdingConfig = {
      pluginDirectory: './plugins',
      autoLoad: false,
      dependencyResolution: 'strict',
      assetBundling: true,
      hotReload: false,
      maxPlugins: 100
    };

    const system = createModdingSystem(config);
    await system.initialize();
    await system.loadEnabledPlugins();

    try {
      const bundle = await system.createPluginBundle(pluginIds);
      
      console.log(`✅ Bundle created: ${bundle.name}`);
      console.log(`  ID: ${bundle.id}`);
      console.log(`  Size: ${bundle.size} bytes`);
      console.log(`  Assets: ${bundle.assets.size}`);
      console.log(`  Checksum: ${bundle.checksum}`);
      
      if (options.verbose) {
        console.log('\n📋 Bundle assets:');
        for (const [path, asset] of bundle.assets) {
          console.log(`  ${path} (${asset.size} bytes, ${asset.type})`);
        }
        
        console.log('\n📋 Bundle metadata:');
        for (const [key, value] of Object.entries(bundle.metadata)) {
          console.log(`  ${key}: ${value}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Failed to create bundle: ${error.message}`);
    }
  });

program
  .command('export')
  .description('Export bundle for platform')
  .argument('<bundle-id>', 'Bundle ID to export')
  .argument('<template-id>', 'Export template ID')
  .option('-o, --output <path>', 'Output directory', './exports')
  .option('-v, --verbose', 'Verbose output')
  .action(async (bundleId, templateId, options) => {
    console.log(`🚀 Exporting bundle ${bundleId} with template ${templateId}...`);

    const config: ModdingConfig = {
      pluginDirectory: './plugins',
      autoLoad: false,
      dependencyResolution: 'strict',
      assetBundling: true,
      hotReload: false,
      maxPlugins: 100
    };

    const system = createModdingSystem(config);
    await system.initialize();

    try {
      const exportPath = await system.exportBundle(bundleId, templateId, options.output);
      
      console.log(`✅ Bundle exported to: ${exportPath}`);
      
      if (options.verbose) {
        const templates = system.getExportTemplates();
        const template = templates.find(t => t.id === templateId);
        
        if (template) {
          console.log('\n📋 Export template details:');
          console.log(`  Name: ${template.name}`);
          console.log(`  Platform: ${template.platform}`);
          console.log(`  Target: ${template.target}`);
          console.log(`  Assets: ${template.assets.join(', ')}`);
          console.log(`  Dependencies: ${template.dependencies.join(', ')}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Failed to export bundle: ${error.message}`);
    }
  });

program
  .command('templates')
  .description('List available export templates')
  .option('-p, --platform <platform>', 'Filter by platform (web, mobile, desktop)')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    console.log('📋 Available export templates:');

    const pipeline = createAssetPipeline();
    let templates = pipeline.getExportTemplates();
    
    if (options.platform) {
      templates = templates.filter(t => t.platform === options.platform);
    }

    console.log(`📊 Found ${templates.length} templates:`);
    
    for (const template of templates) {
      console.log(`  📋 ${template.name}`);
      console.log(`    ID: ${template.id}`);
      console.log(`    Platform: ${template.platform}`);
      console.log(`    Target: ${template.target}`);
      
      if (options.verbose) {
        console.log(`    Assets: ${template.assets.join(', ')}`);
        console.log(`    Dependencies: ${template.dependencies.join(', ')}`);
        console.log(`    Config: ${JSON.stringify(template.config, null, 2)}`);
      }
      console.log('');
    }
  });

program
  .command('add-template')
  .description('Add custom export template')
  .option('-i, --id <id>', 'Template ID')
  .option('-n, --name <name>', 'Template name')
  .option('-p, --platform <platform>', 'Platform (web, mobile, desktop, custom)')
  .option('-t, --target <target>', 'Target platform')
  .option('-a, --assets <patterns>', 'Comma-separated asset patterns')
  .option('-d, --dependencies <deps>', 'Comma-separated dependencies')
  .option('-c, --config <json>', 'Configuration JSON')
  .action(async (options) => {
    if (!options.id || !options.name || !options.platform || !options.target) {
      console.error('❌ Please specify --id, --name, --platform, and --target');
      return;
    }

    console.log(`📋 Adding custom export template: ${options.name}`);

    const template: ExportTemplate = {
      id: options.id,
      name: options.name,
      platform: options.platform,
      target: options.target,
      config: options.config ? JSON.parse(options.config) : {},
      assets: options.assets ? options.assets.split(',') : [],
      dependencies: options.dependencies ? options.dependencies.split(',') : []
    };

    const pipeline = createAssetPipeline();
    pipeline.addExportTemplate(template);
    
    console.log(`✅ Template added: ${template.name}`);
    console.log(`  ID: ${template.id}`);
    console.log(`  Platform: ${template.platform}`);
    console.log(`  Target: ${template.target}`);
    console.log(`  Assets: ${template.assets.length}`);
    console.log(`  Dependencies: ${template.dependencies.length}`);
  });

program
  .command('report')
  .description('Generate modding system report')
  .option('-d, --directory <path>', 'Plugin directory path', './plugins')
  .option('-f, --format <format>', 'Output format (json, console)', 'console')
  .option('-o, --output <file>', 'Output file path')
  .action(async (options) => {
    console.log('📊 Generating modding system report...');

    const config: ModdingConfig = {
      pluginDirectory: options.directory,
      autoLoad: true,
      dependencyResolution: 'strict',
      assetBundling: true,
      hotReload: false,
      maxPlugins: 100
    };

    const system = createModdingSystem(config);
    await system.initialize();

    const report = system.generateReport();

    if (options.format === 'json') {
      const jsonReport = JSON.stringify(report, null, 2);
      
      if (options.output) {
        const fs = require('fs');
        fs.writeFileSync(options.output, jsonReport);
        console.log(`✅ Report saved to: ${options.output}`);
      } else {
        console.log(jsonReport);
      }
    } else {
      // Console format
      console.log('\n🎮 Modding System Report');
      console.log('========================');
      
      console.log('\n📋 System Status:');
      console.log(`  Status: ${report.system.status}`);
      console.log(`  Plugin Directory: ${report.system.config.pluginDirectory}`);
      console.log(`  Auto Load: ${report.system.config.autoLoad}`);
      console.log(`  Asset Bundling: ${report.system.config.assetBundling}`);
      
      console.log('\n📦 Plugins:');
      console.log(`  Total: ${report.plugins.total}`);
      console.log(`  Loaded: ${report.plugins.loaded}`);
      console.log(`  Errors: ${report.plugins.errors}`);
      
      if (report.plugins.list.length > 0) {
        console.log('\n  Plugin List:');
        for (const plugin of report.plugins.list) {
          const status = plugin.status === 'loaded' ? '✅' : 
                        plugin.status === 'error' ? '❌' : '⏸️';
          console.log(`    ${status} ${plugin.name} (${plugin.version}) - ${plugin.status}`);
        }
      }
      
      console.log('\n📋 Export Templates:');
      console.log(`  Available: ${report.assets.templates}`);
      
      if (report.assets.available.length > 0) {
        console.log('\n  Template List:');
        for (const template of report.assets.available) {
          console.log(`    📋 ${template.name} (${template.platform}/${template.target})`);
        }
      }
      
      console.log('\n⏰ Generated:', report.system.timestamp);
    }
  });

program
  .command('validate')
  .description('Validate plugin configuration and dependencies')
  .option('-d, --directory <path>', 'Plugin directory path', './plugins')
  .option('-s, --strict', 'Strict dependency resolution')
  .action(async (options) => {
    console.log('🔍 Validating plugin configuration...');

    const config: ModdingConfig = {
      pluginDirectory: options.directory,
      autoLoad: false,
      dependencyResolution: options.strict ? 'strict' : 'loose',
      assetBundling: true,
      hotReload: false,
      maxPlugins: 100
    };

    const discovery = createPluginDiscovery(config);
    const plugins = await discovery.discoverPlugins();

    console.log(`📊 Validating ${plugins.length} plugins...`);
    
    let validCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const plugin of plugins) {
      console.log(`\n🔍 Validating: ${plugin.manifest.name}`);
      
      // Check manifest
      if (!plugin.manifest.name || plugin.manifest.name.trim() === '') {
        errors.push(`${plugin.id}: Empty plugin name`);
        errorCount++;
        continue;
      }
      
      if (!plugin.manifest.version || !/^\d+\.\d+\.\d+/.test(plugin.manifest.version)) {
        errors.push(`${plugin.id}: Invalid version format`);
        errorCount++;
        continue;
      }
      
      // Check dependencies
      for (const depId of plugin.manifest.dependencies) {
        const dep = plugins.find(p => p.id === depId);
        if (!dep) {
          errors.push(`${plugin.id}: Missing dependency ${depId}`);
          errorCount++;
        }
      }
      
      // Check for circular dependencies
      if (plugin.manifest.dependencies.includes(plugin.id)) {
        errors.push(`${plugin.id}: Circular dependency detected`);
        errorCount++;
        continue;
      }
      
      // Check load order
      if (plugin.config.loadOrder < 0) {
        errors.push(`${plugin.id}: Invalid load order (negative)`);
        errorCount++;
        continue;
      }
      
      validCount++;
      console.log(`  ✅ Valid`);
    }

    console.log('\n📊 Validation Results:');
    console.log(`  Valid: ${validCount}`);
    console.log(`  Errors: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Validation Errors:');
      for (const error of errors) {
        console.log(`  ${error}`);
      }
    } else {
      console.log('\n✅ All plugins are valid!');
    }
  });

export default program;