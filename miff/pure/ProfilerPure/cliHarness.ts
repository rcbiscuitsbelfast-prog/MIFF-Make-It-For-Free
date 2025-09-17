#!/usr/bin/env tsx

import { 
  Profiler, 
  ProfilerConfig, 
  ProfilerSample, 
  ProfilerMetric,
  ProfilerReport 
} from './ProfilerPure';
import { addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';

interface ProfilerOperation {
  op: 'create' | 'start' | 'stop' | 'begin-sample' | 'end-sample' | 'record-metric' | 'get-report' | 'demo' | 'dump';
  config?: ProfilerConfig;
  sampleName?: string;
  category?: string;
  metricId?: string;
  metricName?: string;
  metricValue?: number;
  metricUnit?: string;
  exportFormat?: string;
}

async function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0];
    let operation: ProfilerOperation;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as ProfilerOperation;
    } else {
      // Parse subcommand
      switch (first) {
        case 'create':
          const configFile = argv[1];
          const config = configFile && fs.existsSync(configFile) 
            ? JSON.parse(fs.readFileSync(configFile, 'utf-8'))
            : {
                enabled: true,
                maxFrames: 100,
                sampleRate: 60,
                categories: ['rendering', 'physics', 'ai', 'networking'],
                autoStart: false,
                outputFormat: 'json' as const
              };
          operation = { op: 'create', config };
          break;
        case 'start':
          operation = { op: 'start' };
          break;
        case 'stop':
          operation = { op: 'stop' };
          break;
        case 'begin-sample':
          if (!argv[1] || !argv[2]) throw new Error('begin-sample requires name and category');
          operation = { 
            op: 'begin-sample', 
            sampleName: argv[1],
            category: argv[2]
          };
          break;
        case 'end-sample':
          if (!argv[1]) throw new Error('end-sample requires sample name');
          operation = { op: 'end-sample', sampleName: argv[1] };
          break;
        case 'record-metric':
          if (!argv[1] || !argv[2] || !argv[3] || !argv[4]) {
            throw new Error('record-metric requires id, name, value, and unit');
          }
          operation = { 
            op: 'record-metric',
            metricId: argv[1],
            metricName: argv[2],
            metricValue: parseFloat(argv[3]),
            metricUnit: argv[4]
          };
          break;
        case 'get-report':
          operation = { op: 'get-report' };
          break;
        case 'demo':
          operation = { op: 'demo' };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    // Create profiler instance
    const profiler = new Profiler(operation.config || {
      enabled: true,
      maxFrames: 100,
      sampleRate: 60,
      categories: ['rendering', 'physics', 'ai', 'networking'],
      autoStart: false,
      outputFormat: 'json'
    });

    let result: any;

    switch (operation.op) {
      case 'create':
        result = {
          profiler: {
            config: profiler['config'],
            isRunning: profiler['isRunning'],
            frameCount: profiler['frames'].length
          }
        };
        break;

      case 'start':
        profiler.start();
        result = {
          action: 'started',
          isRunning: profiler['isRunning'],
          timestamp: Date.now()
        };
        break;

      case 'stop':
        profiler.stop();
        result = {
          action: 'stopped',
          isRunning: profiler['isRunning'],
          totalFrames: profiler['frames'].length,
          timestamp: Date.now()
        };
        break;

      case 'begin-sample':
        profiler.beginSample(operation.sampleName!, operation.category!);
        result = {
          action: 'sample_started',
          sampleName: operation.sampleName,
          category: operation.category,
          activeSamples: profiler['activeSamples'].size,
          timestamp: Date.now()
        };
        break;

      case 'end-sample':
        profiler.endSample(operation.sampleName!);
        result = {
          action: 'sample_ended',
          sampleName: operation.sampleName,
          activeSamples: profiler['activeSamples'].size,
          timestamp: Date.now()
        };
        break;

      case 'record-metric':
        profiler.recordMetric(
          operation.metricId!,
          operation.metricName!,
          operation.metricValue!,
          operation.metricUnit!
        );
        result = {
          action: 'metric_recorded',
          metric: {
            id: operation.metricId,
            name: operation.metricName,
            value: operation.metricValue,
            unit: operation.metricUnit
          },
          totalMetrics: profiler['metrics'].size,
          timestamp: Date.now()
        };
        break;

      case 'get-report':
        const report = profiler.generateReport();
        result = {
          report,
          timestamp: Date.now()
        };
        break;

      case 'demo':
        // Create a comprehensive profiling demo
        const demoProfiler = new Profiler({
          enabled: true,
          maxFrames: 10,
          sampleRate: 60,
          categories: ['rendering', 'physics', 'ai', 'networking', 'audio'],
          autoStart: true,
          outputFormat: 'json'
        });

        // Simulate a game frame with various operations
        for (let frame = 0; frame < 5; frame++) {
          demoProfiler.startFrame(frame);
          
          // Rendering phase
          demoProfiler.beginSample('render_setup', 'rendering');
          await new Promise(resolve => setTimeout(resolve, 2)); // Simulate work
          demoProfiler.endSample('render_setup');
          
          demoProfiler.beginSample('render_draw', 'rendering');
          await new Promise(resolve => setTimeout(resolve, 8)); // Simulate work
          demoProfiler.endSample('render_draw');
          
          // Physics phase
          demoProfiler.beginSample('physics_update', 'physics');
          await new Promise(resolve => setTimeout(resolve, 3)); // Simulate work
          demoProfiler.endSample('physics_update');
          
          // AI phase
          demoProfiler.beginSample('ai_decision', 'ai');
          await new Promise(resolve => setTimeout(resolve, 1)); // Simulate work
          demoProfiler.endSample('ai_decision');
          
          // Networking phase
          demoProfiler.beginSample('network_sync', 'networking');
          await new Promise(resolve => setTimeout(resolve, 1)); // Simulate work
          demoProfiler.endSample('network_sync');
          
          // Record some metrics
          demoProfiler.recordMetric('fps', 'Frames Per Second', 60 - Math.random() * 5, 'fps');
          demoProfiler.recordMetric('memory', 'Memory Usage', 100 + Math.random() * 50, 'MB');
          demoProfiler.recordMetric('cpu', 'CPU Usage', 20 + Math.random() * 30, '%');
          
          demoProfiler.endFrame();
        }

        const demoReport = demoProfiler.generateReport();
        demoProfiler.stop();

        result = {
          demo: {
            frames: demoProfiler['frames'].length,
            totalSamples: demoReport.samples.length,
            totalMetrics: demoReport.metrics.length,
            categories: Array.from(demoReport.categories.keys()),
            summary: demoReport.summary,
            recommendations: demoReport.recommendations
          },
          report: demoReport
        };
        break;

      case 'dump':
        result = {
          operations: ['create', 'start', 'stop', 'begin-sample', 'end-sample', 'record-metric', 'get-report', 'demo', 'dump'],
          description: 'ProfilerPure - Performance profiling and debugging system',
          features: [
            'Frame-based profiling',
            'Sample timing and hierarchy',
            'Metric collection and analysis',
            'Performance report generation',
            'Category-based organization',
            'Hot-reload support',
            'Performance recommendations'
          ],
          categories: ['rendering', 'physics', 'ai', 'networking', 'audio', 'input', 'ui'],
          outputFormats: ['json', 'csv', 'console'],
          defaultConfig: {
            enabled: true,
            maxFrames: 100,
            sampleRate: 60,
            categories: ['rendering', 'physics', 'ai', 'networking'],
            autoStart: false,
            outputFormat: 'json'
          }
        };
        break;

      default:
        throw new Error(`Unknown operation: ${operation.op}`);
    }

    // Check for export format option
    const exportFormatArg = argv.find(arg => arg.startsWith('--format='))?.split('=')[1] || 
                           argv[argv.indexOf('--format') + 1];
    const validFormats = ['json', 'csv', 'markdown', 'html'];
    const exportFormat = validFormats.includes(exportFormatArg) ? exportFormatArg : undefined;

    // Handle export format
    const { result: finalResult, exportData } = addExportSupport(
      result,
      exportFormat,
      'ProfilerPure Export',
      'Performance profiling and debugging data'
    );

    // Output in JSON envelope format
    console.log(JSON.stringify({
      op: operation.op,
      status: 'ok',
      result: finalResult,
      timestamp: Date.now()
    }, null, 2));

    // Output export data to stderr if available
    if (exportData) {
      console.error('\n' + exportData);
    }

  } catch (error) {
    console.error(JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}