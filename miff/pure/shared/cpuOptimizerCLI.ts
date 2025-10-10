#!/usr/bin/env tsx

/**
 * CPU Optimization CLI Tool
 * 
 * Command-line interface for CPU optimization, performance monitoring,
 * and resource management for the MIFF framework.
 */

import { CPUOptimizer, OptimizationResult, CPUMetrics } from './CPUOptimizer.js';
import * as fs from 'fs';
import * as path from 'path';

class CPUOptimizerCLI {
  private optimizer: CPUOptimizer;

  constructor() {
    this.optimizer = new CPUOptimizer();
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'optimize':
          await this.optimizeCPU(args.slice(1));
          break;
        case 'metrics':
          await this.showMetrics(args.slice(1));
          break;
        case 'cache':
          await this.manageCache(args.slice(1));
          break;
        case 'pools':
          await this.manageResourcePools(args.slice(1));
          break;
        case 'results':
          await this.showResults(args.slice(1));
          break;
        case 'reset':
          await this.resetOptimizations(args.slice(1));
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  private async optimizeCPU(args: string[]): Promise<void> {
    const outputFile = args[0] || 'cpu-optimization-results.json';

    console.log('🚀 Starting CPU optimization...');
    
    const results = await this.optimizer.optimizeCPU();
    
    // Save results
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    console.log('✅ CPU optimization completed');
    console.log(`📄 Results saved to ${outputFile}`);

    // Display summary
    console.log('\n📊 CPU Optimization Summary:');
    console.log(`Optimizations Applied: ${results.length}`);
    
    const totalImprovement = results.reduce((sum, result) => sum + result.improvement, 0);
    const averageImprovement = totalImprovement / results.length;
    
    console.log(`Average Improvement: ${averageImprovement.toFixed(2)}%`);
    
    results.forEach(result => {
      const statusIcon = result.status === 'applied' ? '✅' : 
                        result.status === 'failed' ? '❌' : '⏳';
      console.log(`  ${statusIcon} ${result.description}: ${result.improvement.toFixed(2)}% improvement`);
    });
  }

  private async showMetrics(args: string[]): Promise<void> {
    const outputFile = args[0] || 'cpu-metrics.json';

    console.log('📊 Collecting CPU metrics...');
    
    const metrics = await this.optimizer.getCPUMetrics();
    
    // Save metrics
    fs.writeFileSync(outputFile, JSON.stringify(metrics, null, 2));
    
    console.log('✅ CPU metrics collected');
    console.log(`📄 Metrics saved to ${outputFile}`);

    // Display metrics
    console.log('\n📊 Current CPU Metrics:');
    console.log(`CPU Usage: ${metrics.usage.toFixed(2)}%`);
    console.log(`Load Average: ${metrics.loadAverage.map(avg => avg.toFixed(2)).join(', ')}`);
    console.log(`Process Count: ${metrics.processCount}`);
    console.log(`Memory Usage: ${metrics.memory.toFixed(2)} MB`);
    console.log(`Response Time: ${metrics.responseTime.toFixed(2)} ms`);
    console.log(`Throughput: ${metrics.throughput.toFixed(2)} ops/sec`);
  }

  private async manageCache(args: string[]): Promise<void> {
    const subcommand = args[0];

    switch (subcommand) {
      case 'stats':
        await this.showCacheStats();
        break;
      case 'clear':
        await this.clearCache();
        break;
      case 'set':
        await this.setCacheValue(args.slice(1));
        break;
      case 'get':
        await this.getCacheValue(args.slice(1));
        break;
      default:
        console.log('Cache management commands:');
        console.log('  stats  - Show cache statistics');
        console.log('  clear  - Clear all cache entries');
        console.log('  set <key> <value> [ttl] - Set cache value');
        console.log('  get <key> - Get cache value');
        break;
    }
  }

  private async showCacheStats(): Promise<void> {
    console.log('📊 Cache Statistics:');
    
    const stats = this.optimizer.getCacheStats();
    
    console.log(`Cache Size: ${stats.size} entries`);
    console.log(`Hit Rate: ${(stats.hitRate * 100).toFixed(2)}%`);
    console.log(`Total Accesses: ${stats.totalAccesses}`);
    console.log(`Average Access Time: ${stats.averageAccessTime.toFixed(2)} ms`);
  }

  private async clearCache(): Promise<void> {
    this.optimizer.clearCache();
    console.log('✅ Cache cleared');
  }

  private async setCacheValue(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.error('Usage: cache set <key> <value> [ttl]');
      return;
    }

    const key = args[0];
    const value = args[1];
    const ttl = args[2] ? parseInt(args[2]) : 300000; // 5 minutes default

    this.optimizer.cache(key, value, ttl);
    console.log(`✅ Cached value for key: ${key}`);
  }

  private async getCacheValue(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.error('Usage: cache get <key>');
      return;
    }

    const key = args[0];
    const value = this.optimizer.getCached(key);
    
    if (value !== null) {
      console.log(`✅ Cache hit for key: ${key}`);
      console.log(`Value: ${JSON.stringify(value)}`);
    } else {
      console.log(`❌ Cache miss for key: ${key}`);
    }
  }

  private async manageResourcePools(args: string[]): Promise<void> {
    const subcommand = args[0];

    switch (subcommand) {
      case 'stats':
        await this.showResourcePoolStats();
        break;
      case 'list':
        await this.listResourcePools();
        break;
      default:
        console.log('Resource pool management commands:');
        console.log('  stats - Show resource pool statistics');
        console.log('  list  - List all resource pools');
        break;
    }
  }

  private async showResourcePoolStats(): Promise<void> {
    console.log('📊 Resource Pool Statistics:');
    
    const stats = this.optimizer.getResourcePoolStats();
    
    for (const [id, poolStats] of stats.entries()) {
      console.log(`\n${id}:`);
      console.log(`  Max Size: ${poolStats.maxSize}`);
      console.log(`  Current Size: ${poolStats.currentSize}`);
      console.log(`  Available: ${poolStats.available}`);
      console.log(`  In Use: ${poolStats.inUse}`);
      console.log(`  Utilization: ${poolStats.utilization.toFixed(2)}%`);
    }
  }

  private async listResourcePools(): Promise<void> {
    console.log('📋 Resource Pools:');
    
    const stats = this.optimizer.getResourcePoolStats();
    const poolIds = Array.from(stats.keys());
    
    poolIds.forEach(id => {
      console.log(`  - ${id}`);
    });
  }

  private async showResults(args: string[]): Promise<void> {
    const outputFile = args[0] || 'optimization-results.json';

    console.log('📊 Optimization Results:');
    
    const results = this.optimizer.getOptimizationResults();
    
    if (results.length === 0) {
      console.log('No optimization results available. Run "optimize" first.');
      return;
    }

    // Save results
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    console.log(`📄 Results saved to ${outputFile}`);

    // Display results
    results.forEach(result => {
      const statusIcon = result.status === 'applied' ? '✅' : 
                        result.status === 'failed' ? '❌' : '⏳';
      console.log(`\n${statusIcon} ${result.description}`);
      console.log(`  Type: ${result.type}`);
      console.log(`  Improvement: ${result.improvement.toFixed(2)}%`);
      console.log(`  Status: ${result.status}`);
      console.log(`  Timestamp: ${result.timestamp.toISOString()}`);
    });
  }

  private async resetOptimizations(args: string[]): Promise<void> {
    this.optimizer.resetOptimizationResults();
    console.log('✅ Optimization results reset');
  }

  private showHelp(): void {
    console.log(`
🚀 MIFF CPU Optimizer CLI

Usage: tsx cpuOptimizerCLI.ts <command> [options]

Commands:
  optimize [output]              Run CPU optimization
  metrics [output]               Show current CPU metrics
  cache <subcommand>             Manage cache
  pools <subcommand>             Manage resource pools
  results [output]               Show optimization results
  reset                         Reset optimization results
  help                          Show this help

Cache Subcommands:
  stats                         Show cache statistics
  clear                         Clear all cache entries
  set <key> <value> [ttl]       Set cache value
  get <key>                     Get cache value

Resource Pool Subcommands:
  stats                         Show resource pool statistics
  list                          List all resource pools

Examples:
  tsx cpuOptimizerCLI.ts optimize
  tsx cpuOptimizerCLI.ts optimize results.json
  tsx cpuOptimizerCLI.ts metrics
  tsx cpuOptimizerCLI.ts cache stats
  tsx cpuOptimizerCLI.ts cache set mykey myvalue 60000
  tsx cpuOptimizerCLI.ts cache get mykey
  tsx cpuOptimizerCLI.ts pools stats
  tsx cpuOptimizerCLI.ts results
  tsx cpuOptimizerCLI.ts reset

Optimization Types:
  - cache: Intelligent caching system
  - lazy_loading: Lazy loading for heavy operations
  - async_processing: Async processing and concurrency control
  - resource_pooling: Resource pooling for better management
  - memory: Memory usage and garbage collection optimization

Metrics:
  - CPU Usage: Current CPU utilization percentage
  - Load Average: System load average over 1, 5, and 15 minutes
  - Process Count: Number of running processes
  - Memory Usage: Current memory usage in MB
  - Response Time: Average response time in milliseconds
  - Throughput: Operations per second
`);
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new CPUOptimizerCLI();
  cli.run().catch(console.error);
}

export default CPUOptimizerCLI;