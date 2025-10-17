import { runCLICommand } from '../../shared/testUtils';

describe('ProfilerPure CLI Harness', () => {
  test('start - should start profiling', async () => {
    const result = await runCLICommand('ProfilerPure', 'start');
    
    expect(result?.op).toBe('start');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.message).toBe('Profiler started successfully');
  });

  test('stop - should stop profiling', async () => {
    const result = await runCLICommand('ProfilerPure', 'stop');
    
    expect(result?.op).toBe('stop');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.message).toBe('Profiler stopped successfully');
  });

  test('startFrame - should start a new frame', async () => {
    const result = await runCLICommand('ProfilerPure', 'startFrame', '1');
    
    expect(result?.op).toBe('startFrame');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.message).toBe('Frame 1 started');
  });

  test('endFrame - should end current frame', async () => {
    const result = await runCLICommand('ProfilerPure', 'endFrame');
    
    expect(result?.op).toBe('endFrame');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.message).toBe('Frame ended');
  });

  test('beginSample - should begin a sample', async () => {
    const result = await runCLICommand('ProfilerPure', 'beginSample', 'render', 'graphics');
    
    expect(result?.op).toBe('beginSample');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.sampleId).toBeDefined();
    expect(result?.result.message).toBe("Sample 'render' started");
  });

  test('endSample - should end a sample', async () => {
    const result = await runCLICommand('ProfilerPure', 'endSample', 'sample_123');
    
    expect(result?.op).toBe('endSample');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.message).toBe('Sample sample_123 ended');
  });

  test('recordMetric - should record a metric', async () => {
    const result = await runCLICommand('ProfilerPure', 'recordMetric', 'fps', '60', 'fps', 'performance');
    
    expect(result?.op).toBe('recordMetric');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.message).toBe("Metric 'fps' recorded");
  });

  test('getCurrentFrame - should get current frame info', async () => {
    const result = await runCLICommand('ProfilerPure', 'getCurrentFrame');
    
    expect(result?.op).toBe('getCurrentFrame');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
  });

  test('getFrames - should get all frames', async () => {
    const result = await runCLICommand('ProfilerPure', 'getFrames');
    
    expect(result?.op).toBe('getFrames');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.frames).toBeDefined();
    expect(result?.result.count).toBeDefined();
  });

  test('getActiveSamples - should get active samples', async () => {
    const result = await runCLICommand('ProfilerPure', 'getActiveSamples');
    
    expect(result?.op).toBe('getActiveSamples');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.samples).toBeDefined();
    expect(result?.result.count).toBeDefined();
  });

  test('getMetrics - should get all metrics', async () => {
    const result = await runCLICommand('ProfilerPure', 'getMetrics');
    
    expect(result?.op).toBe('getMetrics');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.metrics).toBeDefined();
    expect(result?.result.count).toBeDefined();
  });

  test('generateReport - should generate performance report', async () => {
    const result = await runCLICommand('ProfilerPure', 'generateReport');
    
    expect(result?.op).toBe('generateReport');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.summary).toBeDefined();
    expect(result?.result.categories).toBeDefined();
    expect(result?.result.samples).toBeDefined();
    expect(result?.result.metrics).toBeDefined();
    expect(result?.result.recommendations).toBeDefined();
  });

  test('exportReport json - should export report in JSON format', async () => {
    const result = await runCLICommand('ProfilerPure', 'exportReport', 'json');
    
    expect(result?.op).toBe('exportReport');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.format).toBe('json');
    expect(result?.result.data).toBeDefined();
  });

  test('exportReport csv - should export report in CSV format', async () => {
    const result = await runCLICommand('ProfilerPure', 'exportReport', 'csv');
    
    expect(result?.op).toBe('exportReport');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.format).toBe('csv');
    expect(result?.result.data).toBeDefined();
  });

  test('exportReport console - should export report in console format', async () => {
    const result = await runCLICommand('ProfilerPure', 'exportReport', 'console');
    
    expect(result?.op).toBe('exportReport');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.format).toBe('console');
    expect(result?.result.data).toBeDefined();
  });

  test('reset - should reset profiler', async () => {
    const result = await runCLICommand('ProfilerPure', 'reset');
    
    expect(result?.op).toBe('reset');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.message).toBe('Profiler reset successfully');
  });

  test('demo - should run demonstration scenarios', async () => {
    const result = await runCLICommand('ProfilerPure', 'demo');
    
    expect(result?.op).toBe('demo');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.message).toBe('ProfilerPure Demo completed');
    expect(result?.result.scenarios).toBeDefined();
    expect(result?.result.stats).toBeDefined();
    expect(result?.result.report).toBeDefined();
    expect(result?.result.exportFormats).toBeDefined();
  });

  test('help - should show help information', async () => {
    const result = await runCLICommand('ProfilerPure', 'help');
    
    expect(result?.op).toBe('help');
    expect(result?.status).toBe('ok');
    expect(result?.result).toBeDefined();
    expect(result?.result.usage).toBeDefined();
    expect(result?.result.commands).toBeDefined();
    expect(result?.result.examples).toBeDefined();
  });

  test('invalid command - should return error', async () => {
    const result = await runCLICommand('ProfilerPure', 'invalidCommand');
    
    expect(result?.op).toBe('invalidCommand');
    expect(result?.status).toBe('error');
    expect(result?.result).toBeDefined();
    expect(result?.result.error).toBeDefined();
  });
});