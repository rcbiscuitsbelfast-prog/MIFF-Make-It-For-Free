#!/usr/bin/env tsx
/**
 * Performance Benchmarking Script
 * 
 * Benchmarks critical MIFF modules and identifies optimization opportunities
 */

import { performance } from 'perf_hooks';

interface BenchmarkResult {
  name: string;
  avgTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
  iterations: number;
}

class Benchmarker {
  private results: BenchmarkResult[] = [];

  async benchmark(
    name: string,
    fn: () => void | Promise<void>,
    iterations: number = 1000
  ): Promise<BenchmarkResult> {
    const times: number[] = [];
    
    // Warmup
    for (let i = 0; i < 10; i++) {
      await fn();
    }
    
    // Actual benchmark
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const opsPerSecond = 1000 / avgTime;
    
    const result: BenchmarkResult = {
      name,
      avgTime,
      minTime,
      maxTime,
      opsPerSecond,
      iterations
    };
    
    this.results.push(result);
    return result;
  }

  printResults(): void {
    console.log('\n' + '='.repeat(80));
    console.log('PERFORMANCE BENCHMARK RESULTS');
    console.log('='.repeat(80));
    console.log();
    
    for (const result of this.results) {
      console.log(`${result.name}:`);
      console.log(`  Average: ${result.avgTime.toFixed(3)}ms`);
      console.log(`  Min:     ${result.minTime.toFixed(3)}ms`);
      console.log(`  Max:     ${result.maxTime.toFixed(3)}ms`);
      console.log(`  Ops/sec: ${Math.floor(result.opsPerSecond).toLocaleString()}`);
      console.log();
    }
    
    // Identify slow operations
    const slow = this.results.filter(r => r.avgTime > 1.0);
    if (slow.length > 0) {
      console.log('⚠️  SLOW OPERATIONS (>1ms):');
      for (const s of slow.sort((a, b) => b.avgTime - a.avgTime)) {
        console.log(`  • ${s.name}: ${s.avgTime.toFixed(3)}ms`);
      }
      console.log();
    }
    
    // Identify optimization opportunities
    const opportunities = this.results.filter(r => r.avgTime > 0.1 && r.avgTime < 1.0);
    if (opportunities.length > 0) {
      console.log('💡 OPTIMIZATION OPPORTUNITIES (0.1-1ms):');
      for (const o of opportunities.sort((a, b) => b.avgTime - a.avgTime)) {
        console.log(`  • ${o.name}: ${o.avgTime.toFixed(3)}ms`);
      }
      console.log();
    }
    
    // Fast operations
    const fast = this.results.filter(r => r.avgTime < 0.1);
    console.log(`✅ FAST OPERATIONS (<0.1ms): ${fast.length}/${this.results.length}`);
    console.log();
  }

  getResults(): BenchmarkResult[] {
    return this.results;
  }
}

async function main() {
  console.log('🔥 MIFF Performance Benchmarking');
  console.log('━'.repeat(80));
  
  const benchmarker = new Benchmarker();
  
  console.log('\n📊 Benchmarking Core Operations...\n');
  
  // RNG Operations
  console.log('Testing RNG...');
  const { default: RNG } = await import('../miff/pure/RNGPure/RNG.js');
  const rng = new RNG('benchmark-seed');
  
  await benchmarker.benchmark('RNG: next()', () => {
    rng.next();
  });
  
  await benchmarker.benchmark('RNG: float()', () => {
    rng.float();
  });
  
  await benchmarker.benchmark('RNG: range(1, 100)', () => {
    rng.range(1, 100);
  });
  
  // Array operations
  console.log('Testing array operations...');
  const testArray = Array.from({ length: 1000 }, (_, i) => i);
  const { RNGUtils } = await import('../miff/pure/RNGPure/RNGUtils.js');
  
  await benchmarker.benchmark('RNGUtils: shuffle(1000 items)', () => {
    RNGUtils.shuffle([...testArray], rng);
  }, 100);
  
  await benchmarker.benchmark('RNGUtils: pickRandom(1000 items)', () => {
    RNGUtils.pickRandom(testArray, rng);
  });
  
  // Logger operations
  console.log('Testing Logger...');
  const { logger } = await import('../miff/pure/shared/logging/Logger.js');
  
  await benchmarker.benchmark('Logger: info()', () => {
    logger.info('Benchmark message', { test: true });
  });
  
  await benchmarker.benchmark('Logger: debug()', () => {
    logger.debug('Benchmark message', { test: true });
  });
  
  await benchmarker.benchmark('Logger: error()', () => {
    logger.error('Benchmark error', { error: new Error('test') });
  });
  
  // EventBus operations
  console.log('Testing EventBus...');
  const { EventBusPure } = await import('../miff/pure/EventBusPure/EventBusPure.js');
  const eventBus = new EventBusPure();
  const handler = () => {};
  
  await benchmarker.benchmark('EventBus: on()', () => {
    eventBus.on('test-event', handler);
  });
  
  await benchmarker.benchmark('EventBus: emit()', () => {
    eventBus.emit('test-event', {});
  });
  
  await benchmarker.benchmark('EventBus: off()', () => {
    eventBus.off('test-event', handler);
  });
  
  // State operations
  console.log('Testing State...');
  const { StatePure } = await import('../miff/pure/StatePure/StatePure.js');
  const state = new StatePure({ test: 0 });
  
  await benchmarker.benchmark('State: get()', () => {
    state.get('test');
  });
  
  await benchmarker.benchmark('State: set()', () => {
    state.set({ test: Math.random() });
  });
  
  // Object operations
  console.log('Testing object creation...');
  
  await benchmarker.benchmark('Object creation: {}', () => {
    const obj = {};
  });
  
  await benchmarker.benchmark('Object creation: Object.create()', () => {
    const obj = Object.create(null);
  });
  
  await benchmarker.benchmark('Object creation: with properties', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
  });
  
  // Map vs Object
  console.log('Testing Map vs Object...');
  const testMap = new Map();
  const testObj: Record<string, number> = {};
  
  await benchmarker.benchmark('Map: set()', () => {
    testMap.set('key', 123);
  });
  
  await benchmarker.benchmark('Object: set property', () => {
    testObj['key'] = 123;
  });
  
  await benchmarker.benchmark('Map: get()', () => {
    testMap.get('key');
  });
  
  await benchmarker.benchmark('Object: get property', () => {
    testObj['key'];
  });
  
  // JSON operations
  console.log('Testing JSON...');
  const testData = {
    id: '123',
    name: 'Test',
    data: { nested: true, values: [1, 2, 3, 4, 5] }
  };
  
  await benchmarker.benchmark('JSON: stringify()', () => {
    JSON.stringify(testData);
  });
  
  const jsonString = JSON.stringify(testData);
  await benchmarker.benchmark('JSON: parse()', () => {
    JSON.parse(jsonString);
  });
  
  // Array search operations
  console.log('Testing array search...');
  const searchArray = Array.from({ length: 10000 }, (_, i) => i);
  
  await benchmarker.benchmark('Array: indexOf() (10k items)', () => {
    searchArray.indexOf(5000);
  }, 100);
  
  await benchmarker.benchmark('Array: includes() (10k items)', () => {
    searchArray.includes(5000);
  }, 100);
  
  await benchmarker.benchmark('Array: find() (10k items)', () => {
    searchArray.find(x => x === 5000);
  }, 100);
  
  // Set vs Array for lookups
  const testSet = new Set(searchArray);
  
  await benchmarker.benchmark('Set: has() (10k items)', () => {
    testSet.has(5000);
  }, 100);
  
  benchmarker.printResults();
  
  console.log('━'.repeat(80));
  console.log('✅ Benchmarking complete!');
}

main().catch(console.error);
