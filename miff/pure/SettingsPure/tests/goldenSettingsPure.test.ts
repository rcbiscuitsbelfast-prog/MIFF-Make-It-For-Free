import { describe, test, expect } from 'vitest';
import { runCLICommand } from '../../shared/testUtils';

describe('SettingsPure CLI Harness', () => {
  test('get - should get setting value', async () => {
    const result = await runCLICommand('SettingsPure', 'get', 'musicVolume');
    
    expect(result.op).toBe('get');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.key).toBe('musicVolume');
    expect(result.result.value).toBeDefined();
  });

  test('set - should set setting value', async () => {
    const result = await runCLICommand('SettingsPure', 'set', 'musicVolume', '0.9');
    
    expect(result.op).toBe('set');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.success).toBeDefined();
    expect(result.result.message).toBeDefined();
  });

  test('getCategory - should get category settings', async () => {
    const result = await runCLICommand('SettingsPure', 'getCategory', 'graphics');
    
    expect(result.op).toBe('getCategory');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
  });

  test('setCategory - should set category settings', async () => {
    const categoryData = JSON.stringify({ textureQuality: 'ultra', fullscreen: true });
    const result = await runCLICommand('SettingsPure', 'setCategory', 'graphics', categoryData);
    
    expect(result.op).toBe('setCategory');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.success).toBeDefined();
    expect(result.result.message).toBeDefined();
  });

  test('validate - should validate all settings', async () => {
    const result = await runCLICommand('SettingsPure', 'validate');
    
    expect(result.op).toBe('validate');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.isValid).toBeDefined();
    expect(result.result.errors).toBeDefined();
    expect(result.result.warnings).toBeDefined();
    expect(result.result.suggestions).toBeDefined();
  });

  test('reset - should reset all settings to defaults', async () => {
    const result = await runCLICommand('SettingsPure', 'reset');
    
    expect(result.op).toBe('reset');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.message).toBe('Settings reset to defaults');
  });

  test('resetCategory - should reset category to defaults', async () => {
    const result = await runCLICommand('SettingsPure', 'resetCategory', 'graphics');
    
    expect(result.op).toBe('resetCategory');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.success).toBeDefined();
    expect(result.result.message).toBeDefined();
  });

  test('getHistory - should get settings change history', async () => {
    const result = await runCLICommand('SettingsPure', 'getHistory');
    
    expect(result.op).toBe('getHistory');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(Array.isArray(result.result)).toBe(true);
  });

  test('getStats - should get settings statistics', async () => {
    const result = await runCLICommand('SettingsPure', 'getStats');
    
    expect(result.op).toBe('getStats');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.totalSettings).toBeDefined();
    expect(result.result.modifiedSettings).toBeDefined();
    expect(result.result.defaultSettings).toBeDefined();
    expect(result.result.categories).toBeDefined();
  });

  test('export json - should export settings in JSON format', async () => {
    const result = await runCLICommand('SettingsPure', 'export', 'json');
    
    expect(result.op).toBe('export');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.format).toBe('json');
    expect(result.result.data).toBeDefined();
  });

  test('export yaml - should export settings in YAML format', async () => {
    const result = await runCLICommand('SettingsPure', 'export', 'yaml');
    
    expect(result.op).toBe('export');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.format).toBe('yaml');
    expect(result.result.data).toBeDefined();
  });

  test('export markdown - should export settings in Markdown format', async () => {
    const result = await runCLICommand('SettingsPure', 'export', 'markdown');
    
    expect(result.op).toBe('export');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.format).toBe('markdown');
    expect(result.result.data).toBeDefined();
  });

  test('export html - should export settings in HTML format', async () => {
    const result = await runCLICommand('SettingsPure', 'export', 'html');
    
    expect(result.op).toBe('export');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.format).toBe('html');
    expect(result.result.data).toBeDefined();
  });

  test('save - should save settings to file', async () => {
    const result = await runCLICommand('SettingsPure', 'save', 'test_settings.json');
    
    expect(result.op).toBe('save');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.message).toBeDefined();
  });

  test('load - should load settings from file', async () => {
    const result = await runCLICommand('SettingsPure', 'load', 'test_settings.json');
    
    expect(result.op).toBe('load');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.success).toBeDefined();
    expect(result.result.message).toBeDefined();
  });

  test('demo - should run demonstration scenarios', async () => {
    const result = await runCLICommand('SettingsPure', 'demo');
    
    expect(result.op).toBe('demo');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.message).toBe('SettingsPure Demo completed');
    expect(result.result.scenarios).toBeDefined();
    expect(result.result.validation).toBeDefined();
    expect(result.result.stats).toBeDefined();
    expect(result.result.history).toBeDefined();
    expect(result.result.exportFormats).toBeDefined();
  });

  test('help - should show help information', async () => {
    const result = await runCLICommand('SettingsPure', 'help');
    
    expect(result.op).toBe('help');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.usage).toBeDefined();
    expect(result.result.commands).toBeDefined();
    expect(result.result.examples).toBeDefined();
  });

  test('invalid command - should return error', async () => {
    const result = await runCLICommand('SettingsPure', 'invalidCommand');
    
    expect(result.op).toBe('invalidCommand');
    expect(result.status).toBe('error');
    expect(result.result).toBeDefined();
    expect(result.result.error).toBeDefined();
  });
});