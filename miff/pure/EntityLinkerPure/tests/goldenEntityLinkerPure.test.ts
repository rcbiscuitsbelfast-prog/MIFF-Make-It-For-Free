import { runCLICommand } from '../../shared/testUtils';

describe('EntityLinkerPure CLI Harness', () => {
  test('resolveRefs - should resolve entity references successfully', async () => {
    const result = await runCLICommand('EntityLinkerPure', 'resolveRefs', 'sample_links.json');
    
    expect(result.op).toBe('resolveRefs');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.statistics).toBeDefined();
    expect(result.result.resolvedRefs).toBeDefined();
    expect(result.result.issues).toBeDefined();
  });

  test('dumpLinks - should dump current link status', async () => {
    const result = await runCLICommand('EntityLinkerPure', 'dumpLinks');
    
    expect(result.op).toBe('dumpLinks');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.resolvedRefs).toBeDefined();
    expect(result.result.statistics).toBeDefined();
  });

  test('validate - should validate entity links', async () => {
    const result = await runCLICommand('EntityLinkerPure', 'validate', 'sample_links.json');
    
    expect(result.op).toBe('validate');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.isValid).toBeDefined();
    expect(result.result.score).toBeDefined();
    expect(result.result.recommendations).toBeDefined();
  });

  test('getStats - should return linker statistics', async () => {
    const result = await runCLICommand('EntityLinkerPure', 'getStats');
    
    expect(result.op).toBe('getStats');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.totalResolutions).toBeDefined();
    expect(result.result.successfulResolutions).toBeDefined();
    expect(result.result.failedResolutions).toBeDefined();
  });

  test('reset - should reset linker state', async () => {
    const result = await runCLICommand('EntityLinkerPure', 'reset');
    
    expect(result.op).toBe('reset');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.message).toBe('EntityLinkerManager reset successfully');
  });

  test('export json - should export links in JSON format', async () => {
    const result = await runCLICommand('EntityLinkerPure', 'export', 'json');
    
    expect(result.op).toBe('export');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.format).toBe('json');
    expect(result.result.data).toBeDefined();
  });

  test('export csv - should export links in CSV format', async () => {
    const result = await runCLICommand('EntityLinkerPure', 'export', 'csv');
    
    expect(result.op).toBe('export');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.format).toBe('csv');
    expect(result.result.data).toBeDefined();
  });

  test('export markdown - should export links in Markdown format', async () => {
    const result = await runCLICommand('EntityLinkerPure', 'export', 'markdown');
    
    expect(result.op).toBe('export');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.format).toBe('markdown');
    expect(result.result.data).toBeDefined();
  });

  test('demo - should run demonstration scenarios', async () => {
    const result = await runCLICommand('EntityLinkerPure', 'demo');
    
    expect(result.op).toBe('demo');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.message).toBe('EntityLinkerPure Demo completed');
    expect(result.result.scenarios).toBeDefined();
    expect(result.result.resolveResult).toBeDefined();
    expect(result.result.validationResult).toBeDefined();
    expect(result.result.stats).toBeDefined();
    expect(result.result.exportFormats).toBeDefined();
  });

  test('help - should show help information', async () => {
    const result = await runCLICommand('EntityLinkerPure', 'help');
    
    expect(result.op).toBe('help');
    expect(result.status).toBe('ok');
    expect(result.result).toBeDefined();
    expect(result.result.usage).toBeDefined();
    expect(result.result.commands).toBeDefined();
    expect(result.result.examples).toBeDefined();
  });

  test('invalid command - should return error', async () => {
    const result = await runCLICommand('EntityLinkerPure', 'invalidCommand');
    
    expect(result.op).toBe('invalidCommand');
    expect(result.status).toBe('error');
    expect(result.result).toBeDefined();
    expect(result.result.error).toBeDefined();
  });
});