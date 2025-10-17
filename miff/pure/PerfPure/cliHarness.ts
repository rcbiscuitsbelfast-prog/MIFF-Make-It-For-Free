#!/usr/bin/env node

/**
 * PerfPure CLI Harness
 *
 * Interactive CLI for testing PerfPure functionality.
 * Supports performance measurement, benchmarking, and profiling operations.
 */

import * as readline from 'readline';
import { PerfTimer, HighResPerfTimer, PerfProfiler, PerfUtils, defaultProfiler } from './index';

interface CLITest {
  name: string;
  description: string;
  fn: () => void | Promise<void>;
}

function printHelp(): void {
  console.log(`
PerfPure CLI - Performance Testing & Profiling
===============================================

Commands:
  help                    Show this help
  timer <label>           Create and run a simple timer
  benchmark <label> <n>   Run benchmark with N iterations
  profile <label>         Start profiling session
  stop <label>            Stop profiling session
  results                 Show all profiling results
  summary                 Show performance summary
  clear                   Clear all profiling data
  demo                    Run comprehensive demo
  test <name>             Run specific performance test
  quit                    Exit CLI

Tests:
  cpu                     CPU-intensive calculations
  memory                  Memory allocation patterns
  io                      File I/O operations
  math                    Complex mathematical operations
  array                   Array manipulation benchmarks
  object                  Object creation/destruction
  sort                    Sorting algorithm comparison

Examples:
  timer "My Operation"
  benchmark "Array Sort" 1000
  profile "Game Loop"
  demo
  test cpu
`);
}

function createDemoTests(): CLITest[] {
  return [
    {
      name: 'cpu',
      description: 'CPU-intensive calculations (Fibonacci)',
      fn: () => {
        function fibonacci(n: number): number {
          return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
        }

        for (let i = 0; i < 100; i++) {
          fibonacci(25);
        }
      }
    },
    {
      name: 'memory',
      description: 'Memory allocation patterns',
      fn: () => {
        const arrays: number[][] = [];
        for (let i = 0; i < 1000; i++) {
          const arr = new Array(1000);
          for (let j = 0; j < 1000; j++) {
            arr[j] = Math.random();
          }
          arrays.push(arr);
        }
        // Force garbage collection hint
        if (global.gc) {
          global.gc();
        }
      }
    },
    {
      name: 'io',
      description: 'File I/O operations (simulated)',
      fn: () => {
        // Simulate file I/O with string operations
        let data = '';
        for (let i = 0; i < 1000; i++) {
          data += `Line ${i}: ${'x'.repeat(100)}\n`;
        }
        const lines = data.split('\n');
        const filtered = lines.filter((_, i) => i % 2 === 0);
        const result = filtered.join('\n');
      }
    },
    {
      name: 'math',
      description: 'Complex mathematical operations',
      fn: () => {
        let result = 0;
        for (let i = 0; i < 10000; i++) {
          const x = i / 1000;
          result += Math.sin(x) * Math.cos(x) * Math.tan(x);
          result += Math.sqrt(Math.abs(x)) * Math.log(Math.abs(x) + 1);
          result += Math.pow(x, 1.5) * Math.exp(-Math.abs(x));
        }
      }
    },
    {
      name: 'array',
      description: 'Array manipulation benchmarks',
      fn: () => {
        const size = 10000;
        const arr = new Array(size);

        // Fill array
        for (let i = 0; i < size; i++) {
          arr[i] = Math.random();
        }

        // Sort
        arr.sort((a: any, b: any) => a - b);

        // Filter
        const filtered = arr.filter((x: any) => x > 0.5);

        // Map
        const mapped = filtered.map((x: any) => x * x);

        // Reduce
        const sum = mapped.reduce((acc, x) => acc + x, 0);

        // Reverse
        mapped.reverse();

        // Find operations
        const found = arr.find(x => x > 0.9);
        const foundIndex = arr.findIndex(x => x > 0.9);
      }
    },
    {
      name: 'object',
      description: 'Object creation/destruction patterns',
      fn: () => {
        class TestObject {
          public value: number;
          public data: string;

          constructor(value: number) {
            this.value = value;
            this.data = 'x'.repeat(100);
          }

          process(): number {
            return this.value * Math.random();
          }
        }

        const objects: TestObject[] = [];
        for (let i = 0; i < 5000; i++) {
          const obj = new TestObject(i);
          obj.process({});
          objects.push(obj);
        }

        // Process objects
        let total = 0;
        for (const obj of objects) {
          total += obj.process({});
        }

        // Clear references for GC
        objects.length = 0;
      }
    },
    {
      name: 'sort',
      description: 'Sorting algorithm comparison',
      fn: () => {
        const size = 5000;
        const arr1 = new Array(size);
        const arr2 = new Array(size);
        const arr3 = new Array(size);

        // Fill arrays with same data
        for (let i = 0; i < size; i++) {
          const val = Math.random();
          arr1[i] = val;
          arr2[i] = val;
          arr3[i] = val;
        }

        // Quick sort simulation (using built-in sort)
        arr1.sort((a: any, b: any) => a - b);

        // Bubble sort simulation
        for (let i = 0; i < size - 1; i++) {
          for (let j = 0; j < size - i - 1; j++) {
            if (arr2[j] > arr2[j + 1]) {
              [arr2[j], arr2[j + 1]] = [arr2[j + 1], arr2[j]];
            }
          }
        }

        // Merge sort simulation (simplified)
        const merge = (left: number[], right: number[]): number[] => {
          const result: number[] = [];
          let i = 0, j = 0;
          while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) {
              result.push(left[i++]);
            } else {
              result.push(right[j++]);
            }
          }
          return result.concat(left.slice(i)).concat(right.slice(j));
        };

        // Split and merge (simplified merge sort)
        const mid = Math.floor(size / 2);
        const left = arr3.slice(0, mid);
        const right = arr3.slice(mid);
        const merged = merge(left, right);
      }
    }
  ];
}

function runDemo(): void {
  console.log('🚀 Running PerfPure Comprehensive Demo...\n');

  const tests = createDemoTests();

  console.log(`Running ${tests.length} performance tests...\n`);

  tests.forEach((test, index) => {
    console.log(`--- Test ${index + 1}/${tests.length}: ${test.name} ---`);
    console.log(`${test.description}`);

    const timer = new HighResPerfTimer(`Demo_${test.name}`);
    try {
      test.fn();
      timer.stop();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      timer.dispose();
      console.log(`❌ Test failed: ${error}`);
    }

    console.log('');
  });

  // Show summary
  const summary = defaultProfiler.getSummary();
  console.log('📊 Overall Performance Summary:');
  console.log(`Total measurements: ${summary.totalMeasurements}`);
  console.log(`Average duration: ${summary.averageMs.toFixed(2)} ms`);
  console.log(`Min duration: ${summary.minMs.toFixed(2)} ms`);
  console.log(`Max duration: ${summary.maxMs.toFixed(2)} ms`);
  console.log(`Total time: ${summary.totalMs.toFixed(2)} ms`);
}

async function runCLI(): Promise<void> {
  console.log('⚡ PerfPure CLI - Type "help" for commands or "demo" to see performance testing in action\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'perf> '
  });

  rl.prompt();

  rl.on('line', (input: string) => {
    const parts = input.trim().split(/\s+/);
    const command = parts[0!]?.toLowerCase() || '';
    const args = parts.slice(1);

    switch (command) {
      case 'help':
      case 'h':
        printHelp();
        break;

      case 'timer':
      case 'time':
        if (args.length === 0) {
          console.log('❌ Usage: timer <label>');
        } else {
          const label = args.join(' ');
          console.log(`⏱️  Creating timer: "${label}"`);

          const timer = new PerfTimer(label);
          // Simulate some work
          let result = 0;
          for (let i = 0; i < 1000000; i++) {
            result += Math.random();
          }
          timer.dispose();

          console.log(`✅ Timer completed. Result: ${result.toFixed(2)}`);
        }
        break;

      case 'benchmark':
      case 'bench':
        if (args.length < 2) {
          console.log('❌ Usage: benchmark <label> <iterations>');
        } else {
          const label = args[0!];
          const iterations = parseInt(args[1!]);

          if (isNaN(iterations) || iterations <= 0) {
            console.log('❌ Iterations must be a positive number');
            break;
          }

          console.log(`🔬 Running benchmark: "${label}" (${iterations} iterations)`);

          PerfUtils.benchmark(label, iterations, () => {
            // Simulate work
            let result = 0;
            for (let i = 0; i < 1000; i++) {
              result += Math.sin(i) * Math.cos(i);
            }
          });
        }
        break;

      case 'profile':
      case 'start':
        if (args.length === 0) {
          console.log('❌ Usage: profile <label>');
        } else {
          const label = args.join(' ');
          const timer = defaultProfiler.start(label);
          console.log(`▶️  Started profiling: "${label}"`);
          console.log('💡 Use "stop <label>" when finished');
        }
        break;

      case 'stop':
      case 'end':
        if (args.length === 0) {
          console.log('❌ Usage: stop <label>');
        } else {
          const label = args.join(' ');
          const result = defaultProfiler.stop(label);
          if (result) {
            console.log(`⏹️  Stopped profiling: "${label}"`);
            console.log(`   Duration: ${result.durationMs.toFixed(2)} ms`);
          } else {
            console.log(`❌ No active timer found for: "${label}"`);
          }
        }
        break;

      case 'results':
      case 'list':
        const results = defaultProfiler.getResults();
        if (results.length === 0) {
          console.log('No profiling results available');
        } else {
          console.log('\n📋 Profiling Results:');
          results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.label}: ${result.durationMs.toFixed(2)} ms`);
          });
        }
        break;

      case 'summary':
      case 'stats':
        const summary = defaultProfiler.getSummary();
        console.log('\n📊 Performance Summary:');
        console.log(`Total measurements: ${summary.totalMeasurements}`);
        console.log(`Average duration: ${summary.averageMs.toFixed(2)} ms`);
        console.log(`Min duration: ${summary.minMs.toFixed(2)} ms`);
        console.log(`Max duration: ${summary.maxMs.toFixed(2)} ms`);
        console.log(`Total time: ${summary.totalMs.toFixed(2)} ms`);
        break;

      case 'clear':
        defaultProfiler.clear();
        console.log('✅ Cleared all profiling data');
        break;

      case 'demo':
        runDemo();
        break;

      case 'test':
        if (args.length === 0) {
          console.log('❌ Usage: test <name>');
          console.log('Available tests: cpu, memory, io, math, array, object, sort');
        } else {
          const testName = args[0!];
          const tests = createDemoTests();
          const test = tests.find(t => t.name === testName);

          if (test) {
            console.log(`🧪 Running test: ${test.name}`);
            console.log(`${test.description}`);

            const timer = new HighResPerfTimer(`Test_${testName}`);
            try {
              test.fn();
              timer.stop();
              console.log('✅ Test completed successfully');
            } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
              timer.dispose();
              console.log(`❌ Test failed: ${error}`);
            }
          } else {
            console.log(`❌ Unknown test: ${testName}`);
            console.log('Available tests: cpu, memory, io, math, array, object, sort');
          }
        }
        break;

      case 'quit':
      case 'exit':
      case 'q':
        console.log('👋 Goodbye!');
        rl.close();
        process.exit(0);

      default:
        if (command !== '') {
          console.log(`❌ Unknown command: ${command}. Type 'help' for available commands.`);
        }
    }

    rl.prompt();
  });

  rl.on('SIGINT', () => {
    console.log('\n👋 Goodbye!');
    rl.close();
    process.exit(0);
  });
}

// Main execution
if (require.main === module) {
  runCLI().catch(error => {
    console.error('❌ CLI Error:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}