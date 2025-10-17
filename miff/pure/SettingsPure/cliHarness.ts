#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { SettingsManager, SettingsConfig, SettingsValidation, SettingsStats } from './Manager';

function main() {
  const args = process.argv.slice(2);
  const command = args[0!] || 'help';
  const initFile = args[1!];
  
  let manager: SettingsManager;
  if (initFile && fs.existsSync(initFile)) {
    manager = new SettingsManager(initFile);
  } else {
    manager = new SettingsManager();
  }
  
  let result: any = { op: command, status: 'ok', result: null };

  try {
    switch (command) {
      case 'get':
        const getKey = args[1!];
        if (getKey) {
          result.result = { key: getKey, value: manager.get(getKey) };
        } else {
          result.status = 'error';
          result.result = { error: 'Key required' };
        }
        break;

      case 'set':
        const setKey = args[1!];
        const setValue = args[2!];
        if (setKey && setValue !== undefined) {
          const success = manager.set(setKey, setValue);
          result.result = { success, message: success ? 'Setting updated' : 'Invalid value' };
        } else {
          result.status = 'error';
          result.result = { error: 'Key and value required' };
        }
        break;

      case 'getCategory':
        const getCategory = args[1!];
        if (getCategory) {
          result.result = manager.getCategory(getCategory);
        } else {
          result.status = 'error';
          result.result = { error: 'Category required' };
        }
        break;

      case 'setCategory':
        const setCategory = args[1!];
        const categoryData = args[2!];
        if (setCategory && categoryData) {
          try {
            const values = JSON.parse(categoryData);
            const success = manager.setCategory(setCategory, values);
            result.result = { success, message: success ? 'Category updated' : 'Invalid values' };
          } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
            result.status = 'error';
            result.result = { error: 'Invalid JSON data' };
          }
        } else {
          result.status = 'error';
          result.result = { error: 'Category and data required' };
        }
        break;

      case 'validate':
        result.result = manager.validate({});
        break;

      case 'reset':
        manager.reset();
        result.result = { message: 'Settings reset to defaults' };
        break;

      case 'resetCategory':
        const resetCategory = args[1!];
        if (resetCategory) {
          const success = manager.resetCategory(resetCategory);
          result.result = { success, message: success ? 'Category reset' : 'Category not found' };
        } else {
          result.status = 'error';
          result.result = { error: 'Category required' };
        }
        break;

      case 'getHistory':
        result.result = manager.getHistory();
        break;

      case 'getStats':
        result.result = manager.getStats();
        break;

      case 'export':
        const format = (args[1!] as 'json' | 'yaml' | 'markdown' | 'html') || 'json';
        result.result = { data: manager.export(format), format };
        break;

      case 'save':
        const savePath = args[1!] || 'settings.json';
        manager.save(savePath);
        result.result = { message: `Settings saved to ${savePath}` };
        break;

      case 'load':
        const loadPath = args[1!];
        if (loadPath) {
          const success = manager.load(loadPath);
          result.result = { success, message: success ? 'Settings loaded' : 'Failed to load settings' };
        } else {
          result.status = 'error';
          result.result = { error: 'Path required' };
        }
        break;

      case 'demo':
        result.result = runDemo(manager);
        break;

      case 'help':
        result.result = {
          usage: 'SettingsPure CLI Harness',
          commands: [
            'get [key] - Get setting value',
            'set [key] [value] - Set setting value',
            'getCategory [category] - Get category settings',
            'setCategory [category] [data] - Set category settings',
            'validate - Validate all settings',
            'reset - Reset all settings to defaults',
            'resetCategory [category] - Reset category to defaults',
            'getHistory - Get settings change history',
            'getStats - Get settings statistics',
            'export [format] - Export settings (json|yaml|markdown|html)',
            'save [path] - Save settings to file',
            'load [path] - Load settings from file',
            'demo - Run demonstration scenarios',
            'help - Show this help'
          ],
          examples: [
            'node cliHarness.ts get musicVolume',
            'node cliHarness.ts set graphics.textureQuality ultra',
            'node cliHarness.ts export markdown',
            'node cliHarness.ts demo'
          ]
        };
        break;

      default:
        result.status = 'error';
        result.result = { error: `Unknown command: ${command}` };
    }
  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    result.status = 'error';
    result.result = { error: error instanceof Error ? message: 'Unknown error' };
  }

  console.log(JSON.stringify(result, null, 2));
}

function runDemo(manager: SettingsManager): any {
  // Demo various settings operations
  manager.set('musicVolume', 0.9);
  manager.set('graphics.textureQuality', 'ultra');
  manager.set('gameplay.difficulty', 'hard');
  
  const validation = manager.validate({});
  const stats = manager.getStats();
  const history = manager.getHistory();
  
  return {
    message: 'SettingsPure Demo completed',
    scenarios: [
      'Settings management and validation',
      'Category-based configuration',
      'Settings history and statistics',
      'Multi-format export capabilities'
    ],
    validation,
    stats,
    history: history.slice(-5), // Last 5 changes
    exportFormats: {
      json: manager.export('json'),
      yaml: manager.export('yaml'),
      markdown: manager.export('markdown'),
      html: manager.export('html')
    }
  };
}

if (import.meta.url === `file://${process.argv[1!]}`) main();