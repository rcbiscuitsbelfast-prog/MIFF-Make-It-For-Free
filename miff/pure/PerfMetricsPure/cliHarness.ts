#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import { 
  PerfMetricsPure, 
  PerfConfig, 
  PerfSample, 
  PerfMetrics, 
  PerfStats 
} from './index';

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const configFile = args[1];
  
  let config: Partial<PerfConfig> = {};
  if (configFile && fs.existsSync(configFile)) {
    try {
      config = SafeJSONParser.parse(fs.readFileSync(path.resolve(configFile), 'utf-8'));
    } catch (error) {
      this.logger.error('Error loading config:', error);
      process.exit(1);
    }
  }

  const perf = new PerfMetricsPure(config);
  let result: any = { op: command, status: 'ok', result: null };

  try {
    switch (command) {
      case 'record':
        const sampleData = args[1];
        if (sampleData && fs.existsSync(sampleData)) {
          const samples = SafeJSONParser.parse(fs.readFileSync(path.resolve(sampleData), 'utf-8')) as PerfSample[];
          samples.forEach(sample => {
            perf.record(
              sample.dtMs, 
              sample.tickStartMs, 
              sample.tickEndMs, 
              sample.playersSimulated,
              sample.category,
              sample.metadata
            );
          });
          result.result = { message: `Recorded ${samples.length} samples` };
        } else {
          result.status = 'error';
          result.result = { error: 'Sample data file required' };
        }
        break;

      case 'snapshot':
        result.result = perf.snapshot();
        break;

      case 'getMetrics':
        result.result = perf.getMetrics();
        break;

      case 'getStats':
        result.result = perf.getStats();
        break;

      case 'export':
        const format = (args[1] as 'json' | 'csv' | 'markdown') || 'json';
        result.result = { data: perf.exportMetrics(format), format };
        break;

      case 'reset':
        perf.reset();
        result.result = { message: 'PerfMetricsPure reset successfully' };
        break;

      case 'updateConfig':
        const newConfigFile = args[1];
        if (newConfigFile && fs.existsSync(newConfigFile)) {
          const newConfig = SafeJSONParser.parse(fs.readFileSync(path.resolve(newConfigFile), 'utf-8'));
          perf.updateConfig(newConfig);
          result.result = { message: 'Configuration updated successfully' };
        } else {
          result.status = 'error';
          result.result = { error: 'Config file required' };
        }
        break;

      case 'demo':
        result.result = runDemo(perf);
        break;

      case 'help':
        result.result = {
          usage: 'PerfMetricsPure CLI Harness',
          commands: [
            'record [sampleFile] - Record performance samples',
            'snapshot - Get current performance snapshot',
            'getMetrics - Get comprehensive metrics',
            'getStats - Get performance statistics',
            'export [format] - Export metrics (json|csv|markdown)',
            'reset - Reset performance metrics',
            'updateConfig [configFile] - Update configuration',
            'demo - Run demonstration scenarios',
            'help - Show this help'
          ],
          examples: [
            'node cliHarness.ts record samples.json',
            'node cliHarness.ts snapshot',
            'node cliHarness.ts export csv',
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

  this.logger.info(JSON.stringify(result, null, 2));
}

function runDemo(perf: PerfMetricsPure): any {
  // Simulate various performance scenarios
  const scenarios = [
    { name: 'Excellent Performance', dtMs: 16.67, players: 100, category: 'rendering' },
    { name: 'Good Performance', dtMs: 20, players: 150, category: 'physics' },
    { name: 'Fair Performance', dtMs: 25, players: 200, category: 'ai' },
    { name: 'Poor Performance', dtMs: 40, players: 300, category: 'networking' },
    { name: 'Critical Performance', dtMs: 50, players: 500, category: 'database' }
  ];

  // Record samples for each scenario
  scenarios.forEach((scenario, index) => {
    for (let i = 0; i < 10; i++) {
      const tickStart = Date.now() - scenario.dtMs;
      const tickEnd = Date.now();
      perf.record(
        scenario.dtMs,
        tickStart,
        tickEnd,
        scenario.players,
        scenario.category,
        { scenario: scenario.name, iteration: i }
      );
    }
  });

  // Get metrics and stats
  const metrics = perf.getMetrics();
  const stats = perf.getStats();

  return {
    message: 'PerfMetricsPure Demo completed',
    scenarios: scenarios.map(s => s.name),
    metrics,
    stats,
    exportFormats: {
      json: perf.exportMetrics('json'),
      csv: perf.exportMetrics('csv'),
      markdown: perf.exportMetrics('markdown')
    }
  };
}

if (import.meta.url === `file://${process.argv[1]}`) main();