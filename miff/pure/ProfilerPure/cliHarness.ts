#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { 
  Profiler, 
  ProfilerConfig, 
  ProfilerReport, 
  ProfilerFrame,
  ProfilerSample,
  ProfilerMetric,
  ProfilerObserver
} from './ProfilerPure';

function main() {
  const args = process.argv.slice(2);
  const command = args[0!] || 'help';
  const configFile = args[1!];
  
  let config: ProfilerConfig = {
    enabled: true,
    maxFrames: 100,
    sampleRate: 60,
    categories: ['default'],
    autoStart: false,
    outputFormat: 'json'
  };

  if (configFile && fs.existsSync(configFile)) {
    try {
      const loadedConfig = JSON.parse(fs.readFileSync(path.resolve(configFile), 'utf-8'));
      config = { ...config, ...loadedConfig };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Error loading config:', err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  }

  const profiler = new Profiler(config);
  let result: any = { op: command, status: 'ok', result: null };

  try {
    switch (command) {
      case 'start':
        profiler.start();
        result.result = { message: 'Profiler started successfully' };
        break;

      case 'stop':
        profiler.stop();
        result.result = { message: 'Profiler stopped successfully' };
        break;

      case 'startFrame':
        const frameNumber = parseInt(args[1!]) || 0;
        profiler.startFrame(frameNumber);
        result.result = { message: `Frame ${frameNumber} started` };
        break;

      case 'endFrame':
        profiler.endFrame();
        result.result = { message: 'Frame ended' };
        break;

      case 'beginSample':
        const sampleName = args[1!] || 'sample';
        const category = args[2!] || 'default';
        const newSampleId = profiler.beginSample(sampleName, category);
        result.result = { sampleId: newSampleId, message: `Sample '${sampleName}' started` };
        break;

      case 'endSample':
        const endSampleId = args[1!];
        if (endSampleId) {
          profiler.endSample(endSampleId);
          result.result = { message: `Sample ${endSampleId} ended` };
        } else {
          result.status = 'error';
          result.result = { error: 'Sample ID required' };
        }
        break;

      case 'recordMetric':
        const metricName = args[1!] || 'metric';
        const value = parseFloat(args[2!]) || 0;
        const unit = args[3!] || '';
        const metricCategory = args[4!] || 'default';
        profiler.recordMetric(metricName, value, unit, metricCategory);
        result.result = { message: `Metric '${metricName}' recorded` };
        break;

      case 'getCurrentFrame':
        const currentFrame = profiler.getCurrentFrame();
        result.result = currentFrame || { message: 'No active frame' };
        break;

      case 'getFrames':
        const frames = profiler.getFrames();
        result.result = { frames, count: frames.length };
        break;

      case 'getActiveSamples':
        const activeSamples = profiler.getActiveSamples();
        result.result = { samples: activeSamples, count: activeSamples.length };
        break;

      case 'getMetrics':
        const metrics = profiler.getMetrics();
        result.result = { metrics, count: metrics.length };
        break;

      case 'generateReport':
        const report = profiler.generateReport();
        result.result = report;
        break;

      case 'exportReport':
        const format = (args[1!] as 'json' | 'csv' | 'console') || 'json';
        const reportData = profiler.exportReport(format);
        result.result = { data: reportData, format };
        break;

      case 'reset':
        profiler.reset();
        result.result = { message: 'Profiler reset successfully' };
        break;

      case 'demo':
        result.result = runDemo(profiler);
        break;

      case 'help':
        result.result = {
          usage: 'ProfilerPure CLI Harness',
          commands: [
            'start - Start profiling',
            'stop - Stop profiling',
            'startFrame [frameNumber] - Start a new frame',
            'endFrame - End current frame',
            'beginSample [name] [category] - Begin a sample',
            'endSample [sampleId] - End a sample',
            'recordMetric [name] [value] [unit] [category] - Record a metric',
            'getCurrentFrame - Get current frame info',
            'getFrames - Get all frames',
            'getActiveSamples - Get active samples',
            'getMetrics - Get all metrics',
            'generateReport - Generate performance report',
            'exportReport [format] - Export report (json|csv|console)',
            'reset - Reset profiler',
            'demo - Run demonstration scenarios',
            'help - Show this help'
          ],
          examples: [
            'node cliHarness.ts start',
            'node cliHarness.ts beginSample "render" "graphics"',
            'node cliHarness.ts generateReport',
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
    result.result = { error: error instanceof Error ? error.message : 'Unknown error' };
  }

  console.log(JSON.stringify(result, null, 2));
}

function runDemo(profiler: Profiler): any {
  // Start profiling
  profiler.start();

  // Simulate a game frame
  profiler.startFrame(1);
  
  // Begin various samples
  const renderSample = profiler.beginSample('render', 'graphics');
  const physicsSample = profiler.beginSample('physics', 'simulation');
  const aiSample = profiler.beginSample('ai', 'logic');
  
  // Simulate some work
  const startTime = performance.now();
  while (performance.now() - startTime < 10) {
    // Simulate work
  }
  
  // End samples
  profiler.endSample(aiSample);
  profiler.endSample(physicsSample);
  profiler.endSample(renderSample);
  
  // Record some metrics
  profiler.recordMetric('fps', 60, 'fps', 'performance');
  profiler.recordMetric('memory', 128, 'MB', 'memory');
  profiler.recordMetric('drawCalls', 150, 'calls', 'rendering');
  
  // End frame
  profiler.endFrame();
  
  // Start another frame
  profiler.startFrame(2);
  
  const updateSample = profiler.beginSample('update', 'logic');
  const inputSample = profiler.beginSample('input', 'io');
  
  // Simulate more work
  const startTime2 = performance.now();
  while (performance.now() - startTime2 < 5) {
    // Simulate work
  }
  
  profiler.endSample(inputSample);
  profiler.endSample(updateSample);
  
  profiler.recordMetric('fps', 58, 'fps', 'performance');
  profiler.recordMetric('memory', 132, 'MB', 'memory');
  
  profiler.endFrame();
  
  // Stop profiling
  profiler.stop();
  
  // Get results
  const frames = profiler.getFrames();
  const report = profiler.generateReport();
  const stats = {
    totalFrames: frames.length,
    averageFrameTime: report.summary.averageFrameTime,
    totalSamples: report.samples.length,
    totalMetrics: report.metrics.length,
    recommendations: report.recommendations.length
  };

  return {
    message: 'ProfilerPure Demo completed',
    scenarios: [
      'Frame profiling with multiple samples',
      'Metric recording and tracking',
      'Performance analysis and reporting',
      'Category-based profiling'
    ],
    stats,
    report,
    exportFormats: {
      json: profiler.exportReport('json'),
      csv: profiler.exportReport('csv'),
      console: profiler.exportReport('console')
    }
  };
}

if (import.meta.url === `file://${process.argv[1!]}`) main();