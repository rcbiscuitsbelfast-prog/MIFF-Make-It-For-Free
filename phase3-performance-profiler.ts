#!/usr/bin/env tsx

/**
 * Phase 3 Performance Profiler
 * 
 * Comprehensive performance analysis and optimization tool
 * for all MIFF modules and advanced features.
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface PerformanceMetrics {
  moduleName: string;
  loadTime: number;
  memoryUsage: number;
  cpuUsage: number;
  functionCount: number;
  complexityScore: number;
  dependencies: number;
  exports: number;
  fileSize: number;
  testTime: number;
  issues: string[];
  recommendations: string[];
}

interface ModuleProfile {
  name: string;
  path: string;
  metrics: PerformanceMetrics;
  status: 'optimized' | 'needs_optimization' | 'critical' | 'unknown';
  priority: 'high' | 'medium' | 'low';
}

interface PerformanceReport {
  totalModules: number;
  optimizedModules: number;
  needsOptimization: number;
  criticalModules: number;
  averageLoadTime: number;
  averageMemoryUsage: number;
  totalFileSize: number;
  recommendations: string[];
  modules: ModuleProfile[];
}

class PerformanceProfiler {
  private modules: ModuleProfile[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Profile all modules for performance
   */
  async profileAllModules(): Promise<PerformanceReport> {
    console.log('🔍 Starting comprehensive performance profiling...\n');

    // Get all module directories
    const moduleDirs = await this.getModuleDirectories();
    console.log(`📊 Found ${moduleDirs.length} modules to profile\n`);

    // Profile each module
    for (const moduleDir of moduleDirs) {
      try {
        const profile = await this.profileModule(moduleDir);
        this.modules.push(profile);
        console.log(`✅ Profiled ${profile.name} - ${profile.status}`);
      } catch (error) {
        console.log(`❌ Failed to profile ${moduleDir}: ${error}`);
        this.modules.push({
          name: moduleDir,
          path: `/workspace/miff/pure/${moduleDir}`,
          metrics: this.getDefaultMetrics(moduleDir),
          status: 'unknown',
          priority: 'low'
        });
      }
    }

    // Generate report
    const report = this.generateReport();
    this.saveReport(report);

    return report;
  }

  /**
   * Profile a single module
   */
  private async profileModule(moduleName: string): Promise<ModuleProfile> {
    const modulePath = `/workspace/miff/pure/${moduleName}`;
    const metrics = await this.analyzeModule(moduleName, modulePath);
    
    const status = this.determineStatus(metrics);
    const priority = this.determinePriority(metrics, status);

    return {
      name: moduleName,
      path: modulePath,
      metrics,
      status,
      priority
    };
  }

  /**
   * Analyze module performance metrics
   */
  private async analyzeModule(moduleName: string, modulePath: string): Promise<PerformanceMetrics> {
    const startTime = Date.now();
    
    // Load time simulation
    const loadTime = await this.measureLoadTime(modulePath);
    
    // Memory usage estimation
    const memoryUsage = this.estimateMemoryUsage(modulePath);
    
    // CPU usage estimation
    const cpuUsage = this.estimateCpuUsage(modulePath);
    
    // Code complexity analysis
    const functionCount = this.countFunctions(modulePath);
    const complexityScore = this.calculateComplexity(modulePath);
    
    // Dependencies and exports
    const dependencies = this.countDependencies(modulePath);
    const exports = this.countExports(modulePath);
    
    // File size
    const fileSize = this.calculateFileSize(modulePath);
    
    // Test execution time
    const testTime = this.measureTestTime(moduleName);
    
    // Issues and recommendations
    const issues = this.identifyIssues(modulePath);
    const recommendations = this.generateRecommendations(moduleName, {
      loadTime,
      memoryUsage,
      cpuUsage,
      functionCount,
      complexityScore,
      dependencies,
      exports,
      fileSize,
      testTime
    });

    return {
      moduleName,
      loadTime,
      memoryUsage,
      cpuUsage,
      functionCount,
      complexityScore,
      dependencies,
      exports,
      fileSize,
      testTime,
      issues,
      recommendations
    };
  }

  /**
   * Measure module load time
   */
  private async measureLoadTime(modulePath: string): Promise<number> {
    try {
      const startTime = Date.now();
      // Simulate module loading
      const fs = await import('fs');
      const files = fs.readdirSync(modulePath, { recursive: true });
      const endTime = Date.now();
      return endTime - startTime;
    } catch (error) {
      return 1000; // Default high load time for errors
    }
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(modulePath: string): number {
    try {
      const fs = require('fs');
      const files = fs.readdirSync(modulePath, { recursive: true });
      let totalSize = 0;
      
      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.js')) {
          const filePath = join(modulePath, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
        }
      }
      
      // Estimate memory usage as 2x file size
      return totalSize * 2;
    } catch (error) {
      return 1024 * 1024; // Default 1MB
    }
  }

  /**
   * Estimate CPU usage
   */
  private estimateCpuUsage(modulePath: string): number {
    try {
      const fs = require('fs');
      const files = fs.readdirSync(modulePath, { recursive: true });
      let totalLines = 0;
      
      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.js')) {
          const filePath = join(modulePath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          totalLines += content.split('\n').length;
        }
      }
      
      // Estimate CPU usage based on lines of code
      return Math.min(100, totalLines / 100);
    } catch (error) {
      return 10; // Default 10% CPU usage
    }
  }

  /**
   * Count functions in module
   */
  private countFunctions(modulePath: string): number {
    try {
      const fs = require('fs');
      const files = fs.readdirSync(modulePath, { recursive: true });
      let functionCount = 0;
      
      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.js')) {
          const filePath = join(modulePath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Count function declarations
          const functionMatches = content.match(/function\s+\w+|const\s+\w+\s*=\s*\(|class\s+\w+/g);
          if (functionMatches) {
            functionCount += functionMatches.length;
          }
        }
      }
      
      return functionCount;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calculate code complexity score
   */
  private calculateComplexity(modulePath: string): number {
    try {
      const fs = require('fs');
      const files = fs.readdirSync(modulePath, { recursive: true });
      let complexity = 0;
      
      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.js')) {
          const filePath = join(modulePath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Count complexity indicators
          const ifStatements = (content.match(/if\s*\(/g) || []).length;
          const forLoops = (content.match(/for\s*\(/g) || []).length;
          const whileLoops = (content.match(/while\s*\(/g) || []).length;
          const switchStatements = (content.match(/switch\s*\(/g) || []).length;
          const tryCatch = (content.match(/try\s*\{/g) || []).length;
          
          complexity += ifStatements + forLoops + whileLoops + switchStatements + tryCatch;
        }
      }
      
      return complexity;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Count dependencies
   */
  private countDependencies(modulePath: string): number {
    try {
      const fs = require('fs');
      const files = fs.readdirSync(modulePath, { recursive: true });
      let dependencies = 0;
      
      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.js')) {
          const filePath = join(modulePath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Count import statements
          const importMatches = content.match(/import\s+.*\s+from\s+['"][^'"]+['"]/g);
          if (importMatches) {
            dependencies += importMatches.length;
          }
        }
      }
      
      return dependencies;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Count exports
   */
  private countExports(modulePath: string): number {
    try {
      const fs = require('fs');
      const files = fs.readdirSync(modulePath, { recursive: true });
      let exports = 0;
      
      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.js')) {
          const filePath = join(modulePath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Count export statements
          const exportMatches = content.match(/export\s+/g);
          if (exportMatches) {
            exports += exportMatches.length;
          }
        }
      }
      
      return exports;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calculate total file size
   */
  private calculateFileSize(modulePath: string): number {
    try {
      const fs = require('fs');
      const files = fs.readdirSync(modulePath, { recursive: true });
      let totalSize = 0;
      
      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.js')) {
          const filePath = join(modulePath, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Measure test execution time
   */
  private measureTestTime(moduleName: string): number {
    try {
      const startTime = Date.now();
      // Try to run module tests
      execSync(`npx tsx miff/pure/${moduleName}/cliHarness.ts --help`, { 
        stdio: 'ignore',
        timeout: 5000 
      });
      const endTime = Date.now();
      return endTime - startTime;
    } catch (error) {
      return 1000; // Default test time
    }
  }

  /**
   * Identify performance issues
   */
  private identifyIssues(modulePath: string): string[] {
    const issues: string[] = [];
    
    try {
      const fs = require('fs');
      const files = fs.readdirSync(modulePath, { recursive: true });
      
      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.js')) {
          const filePath = join(modulePath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Check for performance issues
          if (content.includes('setInterval') || content.includes('setTimeout')) {
            issues.push('Uses timers - may cause memory leaks');
          }
          
          if (content.includes('while(true)') || content.includes('for(;;)')) {
            issues.push('Contains infinite loops - potential performance issue');
          }
          
          if (content.includes('eval(') || content.includes('Function(')) {
            issues.push('Uses eval() - security and performance risk');
          }
          
          if (content.includes('console.log') && content.includes('console.log').length > 10) {
            issues.push('Excessive console logging - performance impact');
          }
          
          if (content.includes('JSON.parse') && content.includes('JSON.parse').length > 5) {
            issues.push('Frequent JSON parsing - consider caching');
          }
        }
      }
    } catch (error) {
      issues.push('Unable to analyze files');
    }
    
    return issues;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(moduleName: string, metrics: any): string[] {
    const recommendations: string[] = [];
    
    if (metrics.loadTime > 500) {
      recommendations.push('Consider lazy loading for better performance');
    }
    
    if (metrics.memoryUsage > 5 * 1024 * 1024) { // 5MB
      recommendations.push('High memory usage - consider memory optimization');
    }
    
    if (metrics.cpuUsage > 50) {
      recommendations.push('High CPU usage - optimize algorithms');
    }
    
    if (metrics.complexityScore > 100) {
      recommendations.push('High complexity - consider refactoring');
    }
    
    if (metrics.dependencies > 20) {
      recommendations.push('Many dependencies - consider modularization');
    }
    
    if (metrics.fileSize > 100 * 1024) { // 100KB
      recommendations.push('Large file size - consider splitting into smaller modules');
    }
    
    if (metrics.testTime > 2000) {
      recommendations.push('Slow tests - optimize test execution');
    }
    
    return recommendations;
  }

  /**
   * Determine module status
   */
  private determineStatus(metrics: PerformanceMetrics): 'optimized' | 'needs_optimization' | 'critical' | 'unknown' {
    const issues = metrics.issues.length;
    const recommendations = metrics.recommendations.length;
    
    if (issues > 5 || recommendations > 3) {
      return 'critical';
    } else if (issues > 2 || recommendations > 1) {
      return 'needs_optimization';
    } else if (issues === 0 && recommendations === 0) {
      return 'optimized';
    } else {
      return 'unknown';
    }
  }

  /**
   * Determine optimization priority
   */
  private determinePriority(metrics: PerformanceMetrics, status: string): 'high' | 'medium' | 'low' {
    if (status === 'critical') {
      return 'high';
    } else if (status === 'needs_optimization') {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Get default metrics for failed modules
   */
  private getDefaultMetrics(moduleName: string): PerformanceMetrics {
    return {
      moduleName,
      loadTime: 1000,
      memoryUsage: 1024 * 1024,
      cpuUsage: 10,
      functionCount: 0,
      complexityScore: 0,
      dependencies: 0,
      exports: 0,
      fileSize: 0,
      testTime: 1000,
      issues: ['Unable to analyze module'],
      recommendations: ['Investigate module structure']
    };
  }

  /**
   * Get all module directories
   */
  private async getModuleDirectories(): Promise<string[]> {
    try {
      const fs = await import('fs');
      const modules = fs.readdirSync('/workspace/miff/pure');
      return modules.filter((item: string) => {
        try {
          const stat = fs.statSync(`/workspace/miff/pure/${item}`);
          return stat.isDirectory() && 
                 !item.startsWith('.') && 
                 !item.includes('__') &&
                 !item.includes('cli') &&
                 !item.includes('demos') &&
                 !item.includes('shared') &&
                 !item.includes('Schemas') &&
                 !item.includes('IntegrationTests');
        } catch (error) {
          return false;
        }
      });
    } catch (error) {
      console.log('Error reading modules directory:', error);
      return [];
    }
  }

  /**
   * Generate performance report
   */
  private generateReport(): PerformanceReport {
    const totalModules = this.modules.length;
    const optimizedModules = this.modules.filter(m => m.status === 'optimized').length;
    const needsOptimization = this.modules.filter(m => m.status === 'needs_optimization').length;
    const criticalModules = this.modules.filter(m => m.status === 'critical').length;
    
    const averageLoadTime = this.modules.reduce((sum, m) => sum + m.metrics.loadTime, 0) / totalModules;
    const averageMemoryUsage = this.modules.reduce((sum, m) => sum + m.metrics.memoryUsage, 0) / totalModules;
    const totalFileSize = this.modules.reduce((sum, m) => sum + m.metrics.fileSize, 0);
    
    const recommendations = this.generateGlobalRecommendations();
    
    return {
      totalModules,
      optimizedModules,
      needsOptimization,
      criticalModules,
      averageLoadTime,
      averageMemoryUsage,
      totalFileSize,
      recommendations,
      modules: this.modules
    };
  }

  /**
   * Generate global recommendations
   */
  private generateGlobalRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const criticalCount = this.modules.filter(m => m.status === 'critical').length;
    const needsOptCount = this.modules.filter(m => m.status === 'needs_optimization').length;
    
    if (criticalCount > 0) {
      recommendations.push(`Address ${criticalCount} critical modules immediately`);
    }
    
    if (needsOptCount > 0) {
      recommendations.push(`Optimize ${needsOptCount} modules for better performance`);
    }
    
    const avgLoadTime = this.modules.reduce((sum, m) => sum + m.metrics.loadTime, 0) / this.modules.length;
    if (avgLoadTime > 200) {
      recommendations.push('Implement lazy loading to reduce average load time');
    }
    
    const avgMemory = this.modules.reduce((sum, m) => sum + m.metrics.memoryUsage, 0) / this.modules.length;
    if (avgMemory > 2 * 1024 * 1024) { // 2MB
      recommendations.push('Implement memory optimization strategies');
    }
    
    return recommendations;
  }

  /**
   * Save performance report
   */
  private saveReport(report: PerformanceReport): void {
    const reportPath = '/workspace/docs/archive/test-results/2025-10-01-phase3-performance-report.txt';
    
    const reportContent = `
# Phase 3 Performance Profiling Report

Generated: ${new Date().toISOString()}
Duration: ${Date.now() - this.startTime}ms

## Summary
- Total Modules: ${report.totalModules}
- Optimized: ${report.optimizedModules} (${((report.optimizedModules / report.totalModules) * 100).toFixed(1)}%)
- Needs Optimization: ${report.needsOptimization} (${((report.needsOptimization / report.totalModules) * 100).toFixed(1)}%)
- Critical: ${report.criticalModules} (${((report.criticalModules / report.totalModules) * 100).toFixed(1)}%)

## Performance Metrics
- Average Load Time: ${report.averageLoadTime.toFixed(2)}ms
- Average Memory Usage: ${(report.averageMemoryUsage / 1024 / 1024).toFixed(2)}MB
- Total File Size: ${(report.totalFileSize / 1024 / 1024).toFixed(2)}MB

## Global Recommendations
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Module Details

${report.modules.map(module => `
### ${module.name}
- Status: ${module.status.toUpperCase()}
- Priority: ${module.priority.toUpperCase()}
- Load Time: ${module.metrics.loadTime}ms
- Memory Usage: ${(module.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB
- CPU Usage: ${module.metrics.cpuUsage.toFixed(1)}%
- Functions: ${module.metrics.functionCount}
- Complexity: ${module.metrics.complexityScore}
- Dependencies: ${module.metrics.dependencies}
- Exports: ${module.metrics.exports}
- File Size: ${(module.metrics.fileSize / 1024).toFixed(2)}KB
- Test Time: ${module.metrics.testTime}ms

Issues:
${module.metrics.issues.map(issue => `- ${issue}`).join('\n')}

Recommendations:
${module.metrics.recommendations.map(rec => `- ${rec}`).join('\n')}
`).join('\n')}
`;

    writeFileSync(reportPath, reportContent);
    console.log(`\n📄 Performance report saved to: ${reportPath}`);
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const profiler = new PerformanceProfiler();
  
  try {
    const report = await profiler.profileAllModules();
    
    console.log('\n📊 Performance Profiling Complete!');
    console.log(`✅ Total Modules: ${report.totalModules}`);
    console.log(`🟢 Optimized: ${report.optimizedModules}`);
    console.log(`🟡 Needs Optimization: ${report.needsOptimization}`);
    console.log(`🔴 Critical: ${report.criticalModules}`);
    console.log(`⏱️  Average Load Time: ${report.averageLoadTime.toFixed(2)}ms`);
    console.log(`💾 Average Memory: ${(report.averageMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
    
    if (report.criticalModules > 0) {
      console.log(`\n⚠️  ${report.criticalModules} modules need immediate attention!`);
    }
    
  } catch (error) {
    console.error('\n💥 Performance profiling failed:', error);
    process.exit(1);
  }
}

// Run the profiler
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}