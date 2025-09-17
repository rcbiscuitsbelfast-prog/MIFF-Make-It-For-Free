#!/usr/bin/env tsx

import { PerfMetricsPure, PerfSample } from './index';
import { addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';

interface PerfMetricsOperation {
  op: 'record' | 'snapshot' | 'simulate' | 'benchmark' | 'dump';
  dtMs?: number;
  tickStartMs?: number;
  tickEndMs?: number;
  playersSimulated?: number;
  maxSamples?: number;
  iterations?: number;
  data?: Record<string, unknown>;
  exportFormat?: string;
}

function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0];
    let operation: PerfMetricsOperation;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as PerfMetricsOperation;
    } else {
      // Parse subcommand
      switch (first) {
        case 'record':
          if (!argv[1] || !argv[2] || !argv[3] || !argv[4]) {
            throw new Error('record requires dtMs, tickStartMs, tickEndMs, playersSimulated');
          }
          operation = { 
            op: 'record', 
            dtMs: parseFloat(argv[1]),
            tickStartMs: parseFloat(argv[2]),
            tickEndMs: parseFloat(argv[3]),
            playersSimulated: parseInt(argv[4])
          };
          break;
        case 'snapshot':
          operation = { op: 'snapshot' };
          break;
        case 'simulate':
          operation = { 
            op: 'simulate',
            maxSamples: parseInt(argv[1]) || 120,
            iterations: parseInt(argv[2]) || 50
          };
          break;
        case 'benchmark':
          operation = { 
            op: 'benchmark',
            iterations: parseInt(argv[1]) || 1000
          };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    const perfMetrics = new PerfMetricsPure(operation.maxSamples || 120);
    let result: any;

    switch (operation.op) {
      case 'record':
        perfMetrics.record(
          operation.dtMs!,
          operation.tickStartMs!,
          operation.tickEndMs!,
          operation.playersSimulated!
        );
        const snapshot = perfMetrics.snapshot();
        result = {
          recorded: {
            dtMs: operation.dtMs,
            tickStartMs: operation.tickStartMs,
            tickEndMs: operation.tickEndMs,
            playersSimulated: operation.playersSimulated,
            tickDuration: operation.tickEndMs! - operation.tickStartMs!
          },
          currentSnapshot: snapshot
        };
        break;

      case 'snapshot':
        result = {
          snapshot: perfMetrics.snapshot(),
          timestamp: Date.now()
        };
        break;

      case 'simulate':
        // Simulate realistic performance data
        const baseTime = Date.now();
        const samples: PerfSample[] = [];
        
        for (let i = 0; i < operation.iterations!; i++) {
          // Simulate varying performance
          const dtMs = 16 + Math.random() * 4; // 16-20ms (60-50 FPS)
          const tickStartMs = baseTime + i * 16;
          const tickEndMs = tickStartMs + dtMs + Math.random() * 2; // Some variation
          const playersSimulated = 1 + Math.floor(Math.random() * 10); // 1-10 players
          
          perfMetrics.record(dtMs, tickStartMs, tickEndMs, playersSimulated);
          samples.push({ dtMs, tickStartMs, tickEndMs, playersSimulated });
        }
        
        const finalSnapshot = perfMetrics.snapshot();
        
        result = {
          simulation: {
            iterations: operation.iterations,
            maxSamples: operation.maxSamples,
            samples: samples.slice(-10), // Show last 10 samples
            totalSamples: samples.length
          },
          finalSnapshot,
          analysis: {
            averageFPS: 1000 / finalSnapshot.avgDtMs,
            performanceGrade: finalSnapshot.avgTickMs < 16 ? 'Excellent' : 
                            finalSnapshot.avgTickMs < 20 ? 'Good' :
                            finalSnapshot.avgTickMs < 33 ? 'Fair' : 'Poor',
            stability: finalSnapshot.maxTickMs - finalSnapshot.minTickMs < 5 ? 'Stable' : 'Variable'
          }
        };
        break;

      case 'benchmark':
        // Run a performance benchmark
        const benchmarkStart = Date.now();
        const benchmarkSamples: PerfSample[] = [];
        
        // Simulate different load scenarios
        const scenarios = [
          { players: 1, name: 'Light Load' },
          { players: 5, name: 'Medium Load' },
          { players: 10, name: 'Heavy Load' },
          { players: 20, name: 'Extreme Load' }
        ];
        
        const scenarioResults: any[] = [];
        
        for (const scenario of scenarios) {
          const scenarioStart = Date.now();
          const scenarioMetrics = new PerfMetricsPure(50);
          
          for (let i = 0; i < 100; i++) {
            const dtMs = 16 + Math.random() * 4;
            const tickStartMs = scenarioStart + i * 16;
            const tickEndMs = tickStartMs + dtMs + (scenario.players * 0.1); // More players = more processing
            const playersSimulated = scenario.players;
            
            scenarioMetrics.record(dtMs, tickStartMs, tickEndMs, playersSimulated);
          }
          
          const scenarioSnapshot = scenarioMetrics.snapshot();
          scenarioResults.push({
            scenario: scenario.name,
            players: scenario.players,
            snapshot: scenarioSnapshot,
            fps: 1000 / scenarioSnapshot.avgDtMs,
            performance: scenarioSnapshot.avgTickMs < 16 ? 'Excellent' : 
                        scenarioSnapshot.avgTickMs < 20 ? 'Good' :
                        scenarioSnapshot.avgTickMs < 33 ? 'Fair' : 'Poor'
          });
        }
        
        const benchmarkEnd = Date.now();
        
        result = {
          benchmark: {
            totalDuration: benchmarkEnd - benchmarkStart,
            scenarios: scenarioResults,
            summary: {
              bestScenario: scenarioResults.reduce((best, current) => 
                current.fps > best.fps ? current : best
              ),
              worstScenario: scenarioResults.reduce((worst, current) => 
                current.fps < worst.fps ? current : worst
              ),
              averageFPS: scenarioResults.reduce((sum, s) => sum + s.fps, 0) / scenarioResults.length
            }
          }
        };
        break;

      case 'dump':
        result = {
          operations: ['record', 'snapshot', 'simulate', 'benchmark', 'dump'],
          description: 'PerfMetricsPure - Performance metrics collection and analysis',
          features: [
            'Performance sample recording',
            'Real-time metrics calculation',
            'Rolling window statistics',
            'Performance benchmarking',
            'Load testing scenarios',
            'FPS and frame time analysis'
          ],
          metrics: [
            'dtMs - Delta time in milliseconds',
            'tickStartMs - Tick start timestamp',
            'tickEndMs - Tick end timestamp',
            'playersSimulated - Number of players processed',
            'avgDtMs - Average delta time',
            'avgTickMs - Average tick duration',
            'maxTickMs - Maximum tick duration',
            'minTickMs - Minimum tick duration'
          ],
          defaultMaxSamples: 120,
          performanceGrades: {
            'Excellent': '< 16ms (60+ FPS)',
            'Good': '16-20ms (50-60 FPS)',
            'Fair': '20-33ms (30-50 FPS)',
            'Poor': '> 33ms (< 30 FPS)'
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
      'PerfMetricsPure Export',
      'Performance metrics and benchmarking data'
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
  main();
}