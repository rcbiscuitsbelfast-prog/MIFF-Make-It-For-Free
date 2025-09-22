#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { 
  ModdingSystem, 
  PluginDiscovery, 
  AssetPipeline,
  ModdingConfig,
  PluginManifest,
  AssetBundle,
  ExportTemplate
} from './ModdingPure';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  const config: ModdingConfig = {
    pluginDirectory: './plugins',
    autoLoad: true,
    dependencyResolution: 'strict',
    assetBundling: true,
    hotReload: false,
    maxPlugins: 50
  };
  
  const system = new ModdingSystem(config);
  let result: any = { op: command, status: 'ok', result: null };

  try {
    switch (command) {
      case 'initialize':
        await system.initialize();
        result.result = { message: 'Modding system initialized' };
        break;

      case 'discoverPlugins':
        const plugins = await system.discovery.discoverPlugins();
        result.result = { plugins, count: plugins.length };
        break;

      case 'loadPlugin':
        const pluginId = args[1];
        if (pluginId) {
          const plugin = await system.discovery.loadPlugin(pluginId);
          result.result = { plugin, message: `Plugin loaded: ${plugin.manifest.name}` };
        } else {
          result.status = 'error';
          result.result = { error: 'Plugin ID required' };
        }
        break;

      case 'unloadPlugin':
        const unloadPluginId = args[1];
        if (unloadPluginId) {
          const success = await system.discovery.unloadPlugin(unloadPluginId);
          result.result = { success, message: success ? 'Plugin unloaded' : 'Failed to unload plugin' };
        } else {
          result.status = 'error';
          result.result = { error: 'Plugin ID required' };
        }
        break;

      case 'getLoadedPlugins':
        const loadedPlugins = system.getLoadedPlugins();
        result.result = { plugins: loadedPlugins, count: loadedPlugins.length };
        break;

      case 'getPlugin':
        const getPluginId = args[1];
        if (getPluginId) {
          const plugin = system.getPlugin(getPluginId);
          result.result = plugin || { error: 'Plugin not found' };
        } else {
          result.status = 'error';
          result.result = { error: 'Plugin ID required' };
        }
        break;

      case 'createBundle':
        const bundleId = args[1];
        const bundleName = args[2];
        const pluginIds = args[3] ? args[3].split(',') : [];
        if (bundleId && bundleName) {
          const bundle = await system.createPluginBundle(pluginIds);
          result.result = { bundle, message: `Bundle created: ${bundle.name}` };
        } else {
          result.status = 'error';
          result.result = { error: 'Bundle ID and Name required' };
        }
        break;

      case 'exportBundle':
        const exportBundleId = args[1];
        const templateId = args[2];
        const outputPath = args[3] || './exports';
        if (exportBundleId && templateId) {
          const exportPath = await system.exportBundle(exportBundleId, templateId, outputPath);
          result.result = { exportPath, message: 'Bundle exported successfully' };
        } else {
          result.status = 'error';
          result.result = { error: 'Bundle ID and Template ID required' };
        }
        break;

      case 'getExportTemplates':
        const templates = system.getExportTemplates();
        result.result = { templates, count: templates.length };
        break;

      case 'generateReport':
        const report = system.generateReport();
        result.result = report;
        break;

      case 'demo':
        result.result = await runDemo(system);
        break;

      case 'help':
        result.result = {
          usage: 'ModdingPure CLI Harness',
          commands: [
            'initialize - Initialize modding system',
            'discoverPlugins - Discover available plugins',
            'loadPlugin [id] - Load plugin by ID',
            'unloadPlugin [id] - Unload plugin by ID',
            'getLoadedPlugins - Get all loaded plugins',
            'getPlugin [id] - Get plugin by ID',
            'createBundle [id] [name] [pluginIds] - Create asset bundle',
            'exportBundle [bundleId] [templateId] [outputPath] - Export bundle',
            'getExportTemplates - Get available export templates',
            'generateReport - Generate modding system report',
            'demo - Run demonstration scenarios',
            'help - Show this help'
          ],
          examples: [
            'node cliHarness.ts initialize',
            'node cliHarness.ts loadPlugin ui-enhancements',
            'node cliHarness.ts createBundle my_bundle "My Bundle" ui-enhancements,physics-extended',
            'node cliHarness.ts demo'
          ]
        };
        break;

      default:
        result.status = 'error';
        result.result = { error: `Unknown command: ${command}` };
    }
  } catch (error) {
    result.status = 'error';
    result.result = { error: error instanceof Error ? error.message : 'Unknown error' };
  }

  console.log(JSON.stringify(result, null, 2));
}

async function runDemo(system: ModdingSystem): Promise<any> {
  // Initialize the system
  await system.initialize();
  
  // Discover and load plugins
  const plugins = await system.discovery.discoverPlugins();
  const loadedPlugins = await system.loadEnabledPlugins();
  
  // Create a bundle
  const bundle = await system.createPluginBundle(['ui-enhancements', 'physics-extended']);
  
  // Get export templates
  const templates = system.getExportTemplates();
  
  // Generate report
  const report = system.generateReport();
  
  return {
    message: 'ModdingPure Demo completed',
    scenarios: [
      'Plugin discovery and loading',
      'Asset bundling and export',
      'Export template management',
      'System reporting and statistics'
    ],
    plugins: plugins.length,
    loadedPlugins: loadedPlugins.length,
    bundle,
    templates: templates.length,
    report
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}