import { runCLICommand } from '../../shared/testUtils';

describe('PerfMetricsPure CLI Harness', () => {
  test('record - should record performance samples', async () => {
    const result = await runCLICommand('PerfMetricsPure', 'record', 'samples?.json');
    
    expect(result?.op).toBe('record');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.message).toBeDefined();
  });

  test('snapshot - should get current performance snapshot', async () => {
    const result = await runCLICommand('PerfMetricsPure', 'snapshot');
    
    expect(result?.op).toBe('snapshot');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.fps).toBeDefined();
    expect(result?.result.frameTime).toBeDefined();
    expect(result?.result.performance).toBeDefined();
    expect(result?.result.recommendations).toBeDefined();
  });

  test('getMetrics - should get comprehensive metrics', async () => {
    const result = await runCLICommand('PerfMetricsPure', 'getMetrics');
    
    expect(result?.op).toBe('getMetrics');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.samples).toBeDefined();
    expect(result?.result.snapshot).toBeDefined();
    expect(result?.result.history).toBeDefined();
    expect(result?.result.alerts).toBeDefined();
    expect(result?.result.trends).toBeDefined();
  });

  test('getStats - should get performance statistics', async () => {
    const result = await runCLICommand('PerfMetricsPure', 'getStats');
    
    expect(result?.op).toBe('getStats');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.totalSamples).toBeDefined();
    expect(result?.result.averageFPS).toBeDefined();
    expect(result?.result.performanceScore).toBeDefined();
    expect(result?.result.uptime).toBeDefined();
  });

  test('export json - should export metrics in JSON format', async () => {
    const result = await runCLICommand('PerfMetricsPure', 'export', 'json');
    
    expect(result?.op).toBe('export');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.format).toBe('json');
    expect(result?.result.data).toBeDefined();
  });

  test('export csv - should export metrics in CSV format', async () => {
    const result = await runCLICommand('PerfMetricsPure', 'export', 'csv');
    
    expect(result?.op).toBe('export');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.format).toBe('csv');
    expect(result?.result.data).toBeDefined();
  });

  test('export markdown - should export metrics in Markdown format', async () => {
    const result = await runCLICommand('PerfMetricsPure', 'export', 'markdown');
    
    expect(result?.op).toBe('export');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.format).toBe('markdown');
    expect(result?.result.data).toBeDefined();
  });

  test('reset - should reset performance metrics', async () => {
    const result = await runCLICommand('PerfMetricsPure', 'reset');
    
    expect(result?.op).toBe('reset');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.message).toBe('PerfMetricsPure reset successfully');
  });

  test('updateConfig - should update configuration', async () => {
    const result = await runCLICommand('PerfMetricsPure', 'updateConfig', 'config?.json');
    
    expect(result?.op).toBe('updateConfig');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.message).toBe('Configuration updated successfully');
  });

  test('demo - should run demonstration scenarios', async () => {
    const result = await runCLICommand('PerfMetricsPure', 'demo');
    
    expect(result?.op).toBe('demo');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.message).toBe('PerfMetricsPure Demo completed');
    expect(result?.result.scenarios).toBeDefined();
    expect(result?.result.metrics).toBeDefined();
    expect(result?.result.stats).toBeDefined();
    expect(result?.result.exportFormats).toBeDefined();
  });

  test('help - should show help information', async () => {
    const result = await runCLICommand('PerfMetricsPure', 'help');
    
    expect(result?.op).toBe('help');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.usage).toBeDefined();
    expect(result?.result.commands).toBeDefined();
    expect(result?.result.examples).toBeDefined();
  });

  test('invalid command - should return error', async () => {
    const result = await runCLICommand('PerfMetricsPure', 'invalidCommand');
    
    expect(result?.op).toBe('invalidCommand');
    expect(result?.status).toBe('error');
    expect(result?.result).toBeDefined();
    expect(result?.result.error).toBeDefined();
  });
});