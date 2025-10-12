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
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class CPUOptimizerCLI {
  private logger: StructuredLogger;
  private optimizer: CPUOptimizer;

  constructor() {
    this.logger = new StructuredLogger({ module: 'CPUOptimizerCLI' });
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
      this.logger.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  private async optimizeCPU(args: string[]): Promise<void> {
    const outputFile = args[0] || 'cpu-optimization-results.json';

    this.logger.info('🚀 Starting CPU optimization...');
    
    const results = await this.optimizer.optimizeCPU();
    
    // Save results
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    this.logger.info('✅ CPU optimization completed');
    this.logger.info(`📄 Results saved to ${outputFile}`);

    // Display summary
    this.logger.info('\n📊 CPU Optimization Summary:');
    this.logger.info(`Optimizations Applied: ${results.length}`);
    
    const totalImprovement = results.reduce((sum, result) => sum + result.improvement, 0);
    const averageImprovement = totalImprovement / results.length;
    
    this.logger.info(`Average Improvement: ${averageImprovement.toFixed(2)}%`);
    
    results.forEach(result => {
      const statusIcon = result.status === 'applied' ? '✅' : 
                        result.status === 'failed' ? '❌' : '⏳';
      this.logger.info(`  ${statusIcon} ${result.description}: ${result.improvement.toFixed(2)}% improvement`);
    });
  }

  private async showMetrics(args: string[]): Promise<void> {
    const outputFile = args[0] || 'cpu-metrics.json';

    this.logger.info('📊 Collecting CPU metrics...');
    
    const metrics = await this.optimizer.getCPUMetrics();
    
    // Save metrics
    fs.writeFileSync(outputFile, JSON.stringify(metrics, null, 2));
    
    this.logger.info('✅ CPU metrics collected');
    this.logger.info(`📄 Metrics saved to ${outputFile}`);

    // Display metrics
    this.logger.info('\n📊 Current CPU Metrics:');
    this.logger.info(`CPU Usage: ${metrics.usage.toFixed(2)}%`);
    this.logger.info(`Load Average: ${metrics.loadAverage.map(avg => avg.toFixed(2)).join(', ')}`);
    this.logger.info(`Process Count: ${metrics.processCount}`);
    this.logger.info(`Memory Usage: ${metrics.memory.toFixed(2)} MB`);
    this.logger.info(`Response Time: ${metrics.responseTime.toFixed(2)} ms`);
    this.logger.info(`Throughput: ${metrics.throughput.toFixed(2)} ops/sec`);
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
        this.logger.info('Cache management commands:');
        this.logger.info('  stats  - Show cache statistics');
        this.logger.info('  clear  - Clear all cache entries');
        this.logger.info('  set <key> <value> [ttl] - Set cache value');
        this.logger.info('  get <key> - Get cache value');
        break;
    }
  }

  private async showCacheStats(): Promise<void> {
    this.logger.info('📊 Cache Statistics:');
    
    const stats = this.optimizer.getCacheStats();
    
    this.logger.info(`Cache Size: ${stats.size} entries`);
    this.logger.info(`Hit Rate: ${(stats.hitRate * 100).toFixed(2)}%`);
    this.logger.info(`Total Accesses: ${stats.totalAccesses}`);
    this.logger.info(`Average Access Time: ${stats.averageAccessTime.toFixed(2)} ms`);
  }

  private async clearCache(): Promise<void> {
    this.optimizer.clearCache();
    this.logger.info('✅ Cache cleared');
  }

  private async setCacheValue(args: string[]): Promise<void> {
    if (args.length < 2) {
      this.logger.error('Usage: cache set <key> <value> [ttl]');
      return;
    }

    const key = args[0];
    const value = args[1];
    const ttl = args[2] ? parseInt(args[2]) : 300000; // 5 minutes default

    this.optimizer.cacheValue(key, value, ttl);
    this.logger.info(`✅ Cached value for key: ${key}`);
  }

  private async getCacheValue(args: string[]): Promise<void> {
    if (args.length < 1) {
      this.logger.error('Usage: cache get <key>');
      return;
    }

    const key = args[0];
    const value = this.optimizer.getCached(key);
    
    if (value !== null) {
      this.logger.info(`✅ Cache hit for key: ${key}`);
      this.logger.info(`Value: ${JSON.stringify(value)}`);
    } else {
      this.logger.info(`❌ Cache miss for key: ${key}`);
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
        this.logger.info('Resource pool management commands:');
        this.logger.info('  stats - Show resource pool statistics');
        this.logger.info('  list  - List all resource pools');
        break;
    }
  }

  private async showResourcePoolStats(): Promise<void> {
    this.logger.info('📊 Resource Pool Statistics:');
    
    const stats = this.optimizer.getResourcePoolStats();
    
    for (const [id, poolStats] of stats.entries()) {
      this.logger.info(`\n${id}:`);
      this.logger.info(`  Max Size: ${poolStats.maxSize}`);
      this.logger.info(`  Current Size: ${poolStats.currentSize}`);
      this.logger.info(`  Available: ${poolStats.available}`);
      this.logger.info(`  In Use: ${poolStats.inUse}`);
      this.logger.info(`  Utilization: ${poolStats.utilization.toFixed(2)}%`);
    }
  }

  private async listResourcePools(): Promise<void> {
    this.logger.info('📋 Resource Pools:');
    
    const stats = this.optimizer.getResourcePoolStats();
    const poolIds = Array.from(stats.keys());
    
    poolIds.forEach(id => {
      this.logger.info(`  - ${id}`);
    });
  }

  private async showResults(args: string[]): Promise<void> {
    const outputFile = args[0] || 'optimization-results.json';

    this.logger.info('📊 Optimization Results:');
    
    const results = this.optimizer.getOptimizationResults();
    
    if (results.length === 0) {
      this.logger.info('No optimization results available. Run "optimize" first.');
      return;
    }

    // Save results
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    this.logger.info(`📄 Results saved to ${outputFile}`);

    // Display results
    results.forEach(result => {
      const statusIcon = result.status === 'applied' ? '✅' : 
                        result.status === 'failed' ? '❌' : '⏳';
      this.logger.info(`\n${statusIcon} ${result.description}`);
      this.logger.info(`  Type: ${result.type}`);
      this.logger.info(`  Improvement: ${result.improvement.toFixed(2)}%`);
      this.logger.info(`  Status: ${result.status}`);
      this.logger.info(`  Timestamp: ${result.timestamp.toISOString()}`);
    });
  }

  private async resetOptimizations(args: string[]): Promise<void> {
    this.optimizer.resetOptimizationResults();
    this.logger.info('✅ Optimization results reset');
  }

  private showHelp(): void {
    this.logger.info(`
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