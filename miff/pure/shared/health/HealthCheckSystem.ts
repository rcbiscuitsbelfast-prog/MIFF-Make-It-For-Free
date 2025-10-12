import { StructuredLogger } from '../logging/StructuredLogger';
import { StandardErrorHandler } from '../error/StandardErrorHandler';

/**
 * Health Check System - Comprehensive production health monitoring
 * Provides real-time health status, diagnostics, and alerting
 */

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  timestamp: Date;
  uptime: number;
  version: string;
  checks: HealthCheck[];
  summary: HealthSummary;
  metadata: Record<string, any>;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  message: string;
  duration: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface HealthSummary {
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  skipped: number;
  successRate: number;
}

export interface HealthCheckConfig {
  timeout: number;
  retries: number;
  interval: number;
  enabled: boolean;
  critical: boolean;
}

export interface HealthCheckRegistry {
  checks: Map<string, HealthCheckConfig>;
  dependencies: Map<string, string[]>;
  alerts: Map<string, AlertConfig>;
}

export interface AlertConfig {
  enabled: boolean;
  threshold: number;
  cooldown: number;
  channels: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class HealthCheckSystem {
  private logger: StructuredLogger;
  private errorHandler: StandardErrorHandler;
  private registry: HealthCheckRegistry;
  private isInitialized: boolean = false;
  private startTime: Date;
  private version: string;

  constructor() {
    this.logger = new StructuredLogger({ module: 'HealthCheckSystem' });
    this.errorHandler = new StandardErrorHandler();
    this.registry = {
      checks: new Map(),
      dependencies: new Map(),
      alerts: new Map()
    };
    this.startTime = new Date();
    this.version = '1.0.0';
  }

  /**
   * Initialize the health check system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Health check system already initialized');
      return;
    }

    try {
      this.logger.info('Initializing health check system...');
      
      // Register core health checks
      await this.registerCoreChecks();
      
      // Register module health checks
      await this.registerModuleChecks();
      
      // Register system health checks
      await this.registerSystemChecks();
      
      this.isInitialized = true;
      this.logger.info('Health check system initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize health check system', { error: error.message });
      throw error;
    }
  }

  /**
   * Register core health checks
   */
  private async registerCoreChecks(): Promise<void> {
    // TypeScript compilation check
    this.registry.checks.set('typescript-compilation', {
      timeout: 30000,
      retries: 2,
      interval: 60000,
      enabled: true,
      critical: true
    });

    // Test suite check
    this.registry.checks.set('test-suite', {
      timeout: 60000,
      retries: 1,
      interval: 300000,
      enabled: true,
      critical: true
    });

    // Memory usage check
    this.registry.checks.set('memory-usage', {
      timeout: 5000,
      retries: 1,
      interval: 30000,
      enabled: true,
      critical: false
    });

    // Disk space check
    this.registry.checks.set('disk-space', {
      timeout: 10000,
      retries: 1,
      interval: 60000,
      enabled: true,
      critical: true
    });

    // Network connectivity check
    this.registry.checks.set('network-connectivity', {
      timeout: 15000,
      retries: 2,
      interval: 60000,
      enabled: true,
      critical: true
    });
  }

  /**
   * Register module health checks
   */
  private async registerModuleChecks(): Promise<void> {
    // Manager files check
    this.registry.checks.set('manager-files', {
      timeout: 10000,
      retries: 1,
      interval: 300000,
      enabled: true,
      critical: true
    });

    // Capability files check
    this.registry.checks.set('capability-files', {
      timeout: 10000,
      retries: 1,
      interval: 300000,
      enabled: true,
      critical: true
    });

    // CLI harnesses check
    this.registry.checks.set('cli-harnesses', {
      timeout: 15000,
      retries: 1,
      interval: 300000,
      enabled: true,
      critical: false
    });

    // Test coverage check
    this.registry.checks.set('test-coverage', {
      timeout: 30000,
      retries: 1,
      interval: 600000,
      enabled: true,
      critical: false
    });
  }

  /**
   * Register system health checks
   */
  private async registerSystemChecks(): Promise<void> {
    // Security check
    this.registry.checks.set('security-scan', {
      timeout: 45000,
      retries: 1,
      interval: 1800000,
      enabled: true,
      critical: true
    });

    // Performance check
    this.registry.checks.set('performance-test', {
      timeout: 60000,
      retries: 1,
      interval: 1800000,
      enabled: true,
      critical: false
    });

    // Documentation check
    this.registry.checks.set('documentation', {
      timeout: 20000,
      retries: 1,
      interval: 3600000,
      enabled: true,
      critical: false
    });
  }

  /**
   * Run all health checks
   */
  async runHealthChecks(): Promise<HealthStatus> {
    this.logger.info('Running comprehensive health checks...');
    
    const checks: HealthCheck[] = [];
    const startTime = Date.now();
    
    try {
      // Run all registered checks
      for (const [checkName, config] of this.registry.checks) {
        if (config.enabled) {
          const check = await this.runHealthCheck(checkName, config);
          checks.push(check);
        }
      }
      
      // Calculate summary
      const summary = this.calculateSummary(checks);
      
      // Determine overall status
      const status = this.determineOverallStatus(checks);
      
      const healthStatus: HealthStatus = {
        status,
        timestamp: new Date(),
        uptime: Date.now() - this.startTime.getTime(),
        version: this.version,
        checks,
        summary,
        metadata: {
          totalChecks: checks.length,
          executionTime: Date.now() - startTime,
          systemInfo: await this.getSystemInfo()
        }
      };
      
      this.logger.info('Health checks completed', { 
        status, 
        successRate: summary.successRate,
        executionTime: healthStatus.metadata.executionTime
      });
      
      return healthStatus;
      
    } catch (error) {
      this.logger.error('Health check execution failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Run a specific health check
   */
  private async runHealthCheck(name: string, config: HealthCheckConfig): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      let result: HealthCheck;
      
      switch (name) {
        case 'typescript-compilation':
          result = await this.checkTypeScriptCompilation();
          break;
        case 'test-suite':
          result = await this.checkTestSuite();
          break;
        case 'memory-usage':
          result = await this.checkMemoryUsage();
          break;
        case 'disk-space':
          result = await this.checkDiskSpace();
          break;
        case 'network-connectivity':
          result = await this.checkNetworkConnectivity();
          break;
        case 'manager-files':
          result = await this.checkManagerFiles();
          break;
        case 'capability-files':
          result = await this.checkCapabilityFiles();
          break;
        case 'cli-harnesses':
          result = await this.checkCLIHarnesses();
          break;
        case 'test-coverage':
          result = await this.checkTestCoverage();
          break;
        case 'security-scan':
          result = await this.checkSecurityScan();
          break;
        case 'performance-test':
          result = await this.checkPerformanceTest();
          break;
        case 'documentation':
          result = await this.checkDocumentation();
          break;
        default:
          result = {
            name,
            status: 'skip',
            message: 'Unknown health check',
            duration: 0,
            timestamp: new Date(),
            metadata: {}
          };
      }
      
      result.duration = Date.now() - startTime;
      return result;
      
    } catch (error) {
      return {
        name,
        status: 'fail',
        message: `Health check failed: ${error.message}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Check TypeScript compilation
   */
  private async checkTypeScriptCompilation(): Promise<HealthCheck> {
    try {
      const { execSync } = require('child_process');
      execSync('npx tsc --noEmit', { timeout: 30000 });
      
      return {
        name: 'typescript-compilation',
        status: 'pass',
        message: 'TypeScript compilation successful',
        duration: 0,
        timestamp: new Date(),
        metadata: {}
      };
    } catch (error) {
      return {
        name: 'typescript-compilation',
        status: 'fail',
        message: 'TypeScript compilation failed',
        duration: 0,
        timestamp: new Date(),
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Check test suite
   */
  private async checkTestSuite(): Promise<HealthCheck> {
    try {
      const { execSync } = require('child_process');
      execSync('npm test', { timeout: 60000 });
      
      return {
        name: 'test-suite',
        status: 'pass',
        message: 'Test suite passed',
        duration: 0,
        timestamp: new Date(),
        metadata: {}
      };
    } catch (error) {
      return {
        name: 'test-suite',
        status: 'fail',
        message: 'Test suite failed',
        duration: 0,
        timestamp: new Date(),
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Check memory usage
   */
  private async checkMemoryUsage(): Promise<HealthCheck> {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
    
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let message = 'Memory usage normal';
    
    if (heapUsedPercent > 90) {
      status = 'fail';
      message = 'Memory usage critical';
    } else if (heapUsedPercent > 75) {
      status = 'warn';
      message = 'Memory usage high';
    }
    
    return {
      name: 'memory-usage',
      status,
      message,
      duration: 0,
      timestamp: new Date(),
      metadata: { ...memUsageMB, heapUsedPercent: Math.round(heapUsedPercent) }
    };
  }

  /**
   * Check disk space
   */
  private async checkDiskSpace(): Promise<HealthCheck> {
    try {
      const { execSync } = require('child_process');
      const output = execSync('df -h /', { encoding: 'utf8' });
      const lines = output.trim().split('\n');
      const data = lines[1].split(/\s+/);
      const usedPercent = parseInt(data[4].replace('%', ''));
      
      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let message = 'Disk space normal';
      
      if (usedPercent > 95) {
        status = 'fail';
        message = 'Disk space critical';
      } else if (usedPercent > 85) {
        status = 'warn';
        message = 'Disk space low';
      }
      
      return {
        name: 'disk-space',
        status,
        message,
        duration: 0,
        timestamp: new Date(),
        metadata: { usedPercent, total: data[1], used: data[2], available: data[3] }
      };
    } catch (error) {
      return {
        name: 'disk-space',
        status: 'fail',
        message: 'Disk space check failed',
        duration: 0,
        timestamp: new Date(),
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Check network connectivity
   */
  private async checkNetworkConnectivity(): Promise<HealthCheck> {
    try {
      const { execSync } = require('child_process');
      execSync('ping -c 1 8.8.8.8', { timeout: 15000 });
      
      return {
        name: 'network-connectivity',
        status: 'pass',
        message: 'Network connectivity normal',
        duration: 0,
        timestamp: new Date(),
        metadata: {}
      };
    } catch (error) {
      return {
        name: 'network-connectivity',
        status: 'fail',
        message: 'Network connectivity failed',
        duration: 0,
        timestamp: new Date(),
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Check manager files
   */
  private async checkManagerFiles(): Promise<HealthCheck> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const pureDir = './miff/pure';
      const entries = fs.readdirSync(pureDir);
      let managerCount = 0;
      let totalModules = 0;
      
      for (const entry of entries) {
        const entryPath = path.join(pureDir, entry);
        const stat = fs.statSync(entryPath);
        
        if (stat.isDirectory() && entry.endsWith('Pure')) {
          totalModules++;
          const managerPath = path.join(entryPath, 'Manager.ts');
          if (fs.existsSync(managerPath)) {
            managerCount++;
          }
        }
      }
      
      const coverage = (managerCount / totalModules) * 100;
      
      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let message = 'Manager files coverage normal';
      
      if (coverage < 90) {
        status = 'fail';
        message = 'Manager files coverage insufficient';
      } else if (coverage < 95) {
        status = 'warn';
        message = 'Manager files coverage low';
      }
      
      return {
        name: 'manager-files',
        status,
        message,
        duration: 0,
        timestamp: new Date(),
        metadata: { managerCount, totalModules, coverage: Math.round(coverage) }
      };
    } catch (error) {
      return {
        name: 'manager-files',
        status: 'fail',
        message: 'Manager files check failed',
        duration: 0,
        timestamp: new Date(),
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Check capability files
   */
  private async checkCapabilityFiles(): Promise<HealthCheck> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const pureDir = './miff/pure';
      const entries = fs.readdirSync(pureDir);
      let capabilityCount = 0;
      let totalModules = 0;
      
      for (const entry of entries) {
        const entryPath = path.join(pureDir, entry);
        const stat = fs.statSync(entryPath);
        
        if (stat.isDirectory() && entry.endsWith('Pure')) {
          totalModules++;
          const capabilityPath = path.join(entryPath, 'capabilities.ts');
          if (fs.existsSync(capabilityPath)) {
            capabilityCount++;
          }
        }
      }
      
      const coverage = (capabilityCount / totalModules) * 100;
      
      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let message = 'Capability files coverage normal';
      
      if (coverage < 90) {
        status = 'fail';
        message = 'Capability files coverage insufficient';
      } else if (coverage < 95) {
        status = 'warn';
        message = 'Capability files coverage low';
      }
      
      return {
        name: 'capability-files',
        status,
        message,
        duration: 0,
        timestamp: new Date(),
        metadata: { capabilityCount, totalModules, coverage: Math.round(coverage) }
      };
    } catch (error) {
      return {
        name: 'capability-files',
        status: 'fail',
        message: 'Capability files check failed',
        duration: 0,
        timestamp: new Date(),
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Check CLI harnesses
   */
  private async checkCLIHarnesses(): Promise<HealthCheck> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const pureDir = './miff/pure';
      const entries = fs.readdirSync(pureDir);
      let cliCount = 0;
      let totalModules = 0;
      
      for (const entry of entries) {
        const entryPath = path.join(pureDir, entry);
        const stat = fs.statSync(entryPath);
        
        if (stat.isDirectory() && entry.endsWith('Pure')) {
          totalModules++;
          const cliPath = path.join(entryPath, 'cliHarness.ts');
          if (fs.existsSync(cliPath)) {
            cliCount++;
          }
        }
      }
      
      const coverage = (cliCount / totalModules) * 100;
      
      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let message = 'CLI harnesses coverage normal';
      
      if (coverage < 70) {
        status = 'fail';
        message = 'CLI harnesses coverage insufficient';
      } else if (coverage < 80) {
        status = 'warn';
        message = 'CLI harnesses coverage low';
      }
      
      return {
        name: 'cli-harnesses',
        status,
        message,
        duration: 0,
        timestamp: new Date(),
        metadata: { cliCount, totalModules, coverage: Math.round(coverage) }
      };
    } catch (error) {
      return {
        name: 'cli-harnesses',
        status: 'fail',
        message: 'CLI harnesses check failed',
        duration: 0,
        timestamp: new Date(),
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Check test coverage
   */
  private async checkTestCoverage(): Promise<HealthCheck> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const pureDir = './miff/pure';
      const entries = fs.readdirSync(pureDir);
      let testCount = 0;
      let totalModules = 0;
      
      for (const entry of entries) {
        const entryPath = path.join(pureDir, entry);
        const stat = fs.statSync(entryPath);
        
        if (stat.isDirectory() && entry.endsWith('Pure')) {
          totalModules++;
          const testPath = path.join(entryPath, 'tests');
          if (fs.existsSync(testPath)) {
            const testFiles = fs.readdirSync(testPath).filter((file: string) => file.endsWith('.test.ts'));
            testCount += testFiles.length;
          }
        }
      }
      
      const coverage = (testCount / totalModules);
      
      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let message = 'Test coverage normal';
      
      if (coverage < 1) {
        status = 'fail';
        message = 'Test coverage insufficient';
      } else if (coverage < 2) {
        status = 'warn';
        message = 'Test coverage low';
      }
      
      return {
        name: 'test-coverage',
        status,
        message,
        duration: 0,
        timestamp: new Date(),
        metadata: { testCount, totalModules, coverage: Math.round(coverage * 100) / 100 }
      };
    } catch (error) {
      return {
        name: 'test-coverage',
        status: 'fail',
        message: 'Test coverage check failed',
        duration: 0,
        timestamp: new Date(),
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Check security scan
   */
  private async checkSecurityScan(): Promise<HealthCheck> {
    try {
      // Check for unsafe JSON.parse
      const { execSync } = require('child_process');
      const unsafeJson = execSync('grep -r "JSON\\.parse(" ./miff/pure --include="*.ts" | grep -v "SafeJSONParser" | wc -l', { encoding: 'utf8' }).trim();
      const unsafeCount = parseInt(unsafeJson);
      
      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let message = 'Security scan passed';
      
      if (unsafeCount > 50) {
        status = 'fail';
        message = 'Security scan failed - too many unsafe JSON.parse';
      } else if (unsafeCount > 20) {
        status = 'warn';
        message = 'Security scan warning - some unsafe JSON.parse';
      }
      
      return {
        name: 'security-scan',
        status,
        message,
        duration: 0,
        timestamp: new Date(),
        metadata: { unsafeJsonParse: unsafeCount }
      };
    } catch (error) {
      return {
        name: 'security-scan',
        status: 'fail',
        message: 'Security scan failed',
        duration: 0,
        timestamp: new Date(),
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Check performance test
   */
  private async checkPerformanceTest(): Promise<HealthCheck> {
    try {
      // Check for console.log statements
      const { execSync } = require('child_process');
      const consoleLogs = execSync('grep -r "console\\.log" ./miff/pure --include="*.ts" | wc -l', { encoding: 'utf8' }).trim();
      const logCount = parseInt(consoleLogs);
      
      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let message = 'Performance test passed';
      
      if (logCount > 100) {
        status = 'fail';
        message = 'Performance test failed - too many console.log';
      } else if (logCount > 50) {
        status = 'warn';
        message = 'Performance test warning - some console.log';
      }
      
      return {
        name: 'performance-test',
        status,
        message,
        duration: 0,
        timestamp: new Date(),
        metadata: { consoleLogs: logCount }
      };
    } catch (error) {
      return {
        name: 'performance-test',
        status: 'fail',
        message: 'Performance test failed',
        duration: 0,
        timestamp: new Date(),
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Check documentation
   */
  private async checkDocumentation(): Promise<HealthCheck> {
    try {
      const fs = require('fs');
      
      const requiredDocs = [
        'README.md',
        'CONTRIBUTING.md',
        'CHANGELOG.md',
        'LICENSE',
        'PHASE_1_COMPLETION_REPORT.md',
        'MIFF_FINAL_SUPER_AUDIT_REPORT_2025.md',
        'MIFF_PRODUCTION_READINESS_CERTIFICATE_2025.md'
      ];
      
      let foundDocs = 0;
      const missingDocs: string[] = [];
      
      for (const doc of requiredDocs) {
        if (fs.existsSync(doc)) {
          foundDocs++;
        } else {
          missingDocs.push(doc);
        }
      }
      
      const coverage = (foundDocs / requiredDocs.length) * 100;
      
      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let message = 'Documentation complete';
      
      if (coverage < 80) {
        status = 'fail';
        message = 'Documentation incomplete';
      } else if (coverage < 90) {
        status = 'warn';
        message = 'Documentation mostly complete';
      }
      
      return {
        name: 'documentation',
        status,
        message,
        duration: 0,
        timestamp: new Date(),
        metadata: { foundDocs, totalDocs: requiredDocs.length, coverage: Math.round(coverage), missingDocs }
      };
    } catch (error) {
      return {
        name: 'documentation',
        status: 'fail',
        message: 'Documentation check failed',
        duration: 0,
        timestamp: new Date(),
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Calculate health check summary
   */
  private calculateSummary(checks: HealthCheck[]): HealthSummary {
    const total = checks.length;
    const passed = checks.filter(c => c.status === 'pass').length;
    const failed = checks.filter(c => c.status === 'fail').length;
    const warnings = checks.filter(c => c.status === 'warn').length;
    const skipped = checks.filter(c => c.status === 'skip').length;
    const successRate = total > 0 ? (passed / total) * 100 : 0;
    
    return {
      total,
      passed,
      failed,
      warnings,
      skipped,
      successRate: Math.round(successRate * 100) / 100
    };
  }

  /**
   * Determine overall health status
   */
  private determineOverallStatus(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' | 'critical' {
    const criticalFailures = checks.filter(c => c.status === 'fail' && this.registry.checks.get(c.name)?.critical).length;
    const failures = checks.filter(c => c.status === 'fail').length;
    const warnings = checks.filter(c => c.status === 'warn').length;
    
    if (criticalFailures > 0) {
      return 'critical';
    } else if (failures > 2) {
      return 'unhealthy';
    } else if (failures > 0 || warnings > 3) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  /**
   * Get system information
   */
  private async getSystemInfo(): Promise<Record<string, any>> {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    return this.runHealthChecks();
  }

  /**
   * Get health check configuration
   */
  getHealthCheckConfig(name: string): HealthCheckConfig | undefined {
    return this.registry.checks.get(name);
  }

  /**
   * Update health check configuration
   */
  updateHealthCheckConfig(name: string, config: HealthCheckConfig): void {
    this.registry.checks.set(name, config);
  }

  /**
   * Destroy the health check system
   */
  async destroy(): Promise<void> {
    this.logger.info('Destroying health check system...');
    
    this.registry.checks.clear();
    this.registry.dependencies.clear();
    this.registry.alerts.clear();
    
    this.isInitialized = false;
    this.logger.info('Health check system destroyed');
  }
}

// Export default instance
export const healthCheckSystem = new HealthCheckSystem();
export default healthCheckSystem;