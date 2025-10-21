// runCLICommand removed from testUtils - using direct CLI execution

describe('ModdingPure CLI Harness', () => {
  test('initialize - should initialize modding system', async () => {
    const result = await runCLICommand('ModdingPure', 'initialize');
    
    expect(result.op).toBe('initialize');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.message).toBe('Modding system initialized');
  });

  test('discoverPlugins - should discover available plugins', async () => {
    const result = await runCLICommand('ModdingPure', 'discoverPlugins');
    
    expect(result.op).toBe('discoverPlugins');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.plugins).toBeDefined();
    expect(result.result.count).toBeDefined();
  });

  test('loadPlugin - should load plugin by ID', async () => {
    const result = await runCLICommand('ModdingPure', 'loadPlugin', 'ui-enhancements');
    
    expect(result.op).toBe('loadPlugin');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.plugin).toBeDefined();
    expect(result.result.message).toBeDefined();
  });

  test('unloadPlugin - should unload plugin by ID', async () => {
    const result = await runCLICommand('ModdingPure', 'unloadPlugin', 'ui-enhancements');
    
    expect(result.op).toBe('unloadPlugin');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.success).toBeDefined();
    expect(result.result.message).toBeDefined();
  });

  test('getLoadedPlugins - should get all loaded plugins', async () => {
    const result = await runCLICommand('ModdingPure', 'getLoadedPlugins');
    
    expect(result.op).toBe('getLoadedPlugins');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.plugins).toBeDefined();
    expect(result.result.count).toBeDefined();
  });

  test('getPlugin - should get plugin by ID', async () => {
    const result = await runCLICommand('ModdingPure', 'getPlugin', 'ui-enhancements');
    
    expect(result.op).toBe('getPlugin');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
  });

  test('createBundle - should create asset bundle', async () => {
    const result = await runCLICommand('ModdingPure', 'createBundle', 'demo_bundle', 'Demo Bundle', 'ui-enhancements,physics-extended');
    
    expect(result.op).toBe('createBundle');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.bundle).toBeDefined();
    expect(result.result.message).toBeDefined();
  });

  test('exportBundle - should export bundle', async () => {
    const result = await runCLICommand('ModdingPure', 'exportBundle', 'demo_bundle', 'web-html5', './exports');
    
    expect(result.op).toBe('exportBundle');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.exportPath).toBeDefined();
    expect(result.result.message).toBe('Bundle exported successfully');
  });

  test('getExportTemplates - should get available export templates', async () => {
    const result = await runCLICommand('ModdingPure', 'getExportTemplates');
    
    expect(result.op).toBe('getExportTemplates');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.templates).toBeDefined();
    expect(result.result.count).toBeDefined();
  });

  test('generateReport - should generate modding system report', async () => {
    const result = await runCLICommand('ModdingPure', 'generateReport');
    
    expect(result.op).toBe('generateReport');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.system).toBeDefined();
    expect(result.result.plugins).toBeDefined();
    expect(result.result.assets).toBeDefined();
  });

  test('demo - should run demonstration scenarios', async () => {
    const result = await runCLICommand('ModdingPure', 'demo');
    
    expect(result.op).toBe('demo');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.message).toBe('ModdingPure Demo completed');
    expect(result.result.scenarios).toBeDefined();
    expect(result.result.plugins).toBeDefined();
    expect(result.result.loadedPlugins).toBeDefined();
    expect(result.result.bundle).toBeDefined();
    expect(result.result.templates).toBeDefined();
    expect(result.result.report).toBeDefined();
  });

  test('help - should show help information', async () => {
    const result = await runCLICommand('ModdingPure', 'help');
    
    expect(result.op).toBe('help');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.usage).toBeDefined();
    expect(result.result.commands).toBeDefined();
    expect(result.result.examples).toBeDefined();
  });

  test('invalid command - should return error', async () => {
    const result = await runCLICommand('ModdingPure', 'invalidCommand');
    
    expect(result.op).toBe('invalidCommand');
    expect(result.status).toBe('error');
    expect(result.result).toBeDefined();
    expect(result.result.error).toBeDefined();
  });
});