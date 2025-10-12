/**
 * TestRunner.ts - Advanced Test Management System
 *
 * Provides comprehensive test management for:
 * - Test execution and orchestration
 * - Test result analysis and reporting
 * - Test performance optimization
 * - Test data management
 * - Test environment management
 * - Test coverage analysis
 * - Test failure analysis and debugging
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../../EventBusPure/index.js';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

const execAsync = promisify(exec);

// ============================================================================
// TEST RUNNER INTERFACES
// ============================================================================

export enum TestStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  PENDING = 'pending',
  RUNNING = 'running',
  ERROR = 'error'
}

export enum TestType {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  E2E = 'e2e',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  GOLDEN = 'golden'
}

export enum TestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface TestConfig {
  testDirectory: string;
  outputDirectory: string;
  coverageDirectory: string;
  parallel: boolean;
  maxWorkers: number;
  timeout: number;
  retries: number;
  bail: boolean;
  verbose: boolean;
  watch: boolean;
  updateSnapshots: boolean;
  collectCoverage: boolean;
  coverageThreshold: number;
  testTypes: TestType[];
  excludePatterns: string[];
  includePatterns: string[];
  environment: Record<string, string>;
  setupFiles: string[];
  teardownFiles: string[];
  globalSetup: string;
  globalTeardown: string;
}

export interface TestResult {
  id: string;
  name: string;
  file: string;
  type: TestType;
  priority: TestPriority;
  status: TestStatus;
  duration: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  stackTrace?: string;
  assertions: TestAssertion[];
  coverage?: TestCoverage;
  retries: number;
  maxRetries: number;
  tags: string[];
  metadata: Record<string, any>;
}

export interface TestAssertion {
  id: string;
  description: string;
  passed: boolean;
  expected?: any;
  actual?: any;
  message?: string;
  duration: number;
}

export interface TestCoverage {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  files: number;
  details: TestCoverageFile[];
}

export interface TestCoverageFile {
  file: string;
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  uncoveredLines: number[];
}

export interface TestSuite {
  id: string;
  name: string;
  file: string;
  type: TestType;
  priority: TestPriority;
  status: TestStatus;
  duration: number;
  startTime: Date;
  endTime?: Date;
  tests: TestResult[];
  error?: string;
  stackTrace?: string;
  retries: number;
  maxRetries: number;
  tags: string[];
  metadata: Record<string, any>;
}

export interface TestReport {
  id: string;
  timestamp: Date;
  duration: number;
  status: TestStatus;
  totalSuites: number;
  totalTests: number;
  passedSuites: number;
  passedTests: number;
  failedSuites: number;
  failedTests: number;
  skippedSuites: number;
  skippedTests: number;
  suites: TestSuite[];
  coverage?: TestCoverage;
  summary: string;
  recommendations: string[];
  performance: TestPerformance;
}

export interface TestPerformance {
  totalDuration: number;
  averageTestDuration: number;
  slowestTest: string;
  fastestTest: string;
  memory: number;
  cpu: number;
  parallelEfficiency: number;
}

export interface TestEnvironment {
  name: string;
  config: TestConfig;
  status: 'idle' | 'running' | 'error';
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

/**
 * Test Runner - Core test management functionality
 */
export class TestRunner {
  private logger: StructuredLogger;
  private config: TestConfig;
  private eventBus: EventBus;
  private suites: Map<string, TestSuite> = new Map();
  private results: Map<string, TestResult> = new Map();
  private environments: Map<string, TestEnvironment> = new Map();
  private isRunning: boolean = false;
  private currentRunId?: string;

  constructor(config: TestConfig, eventBus: EventBus) {
    this.logger = new StructuredLogger({ module: 'TestRunner' });
    this.config = config;
    this.eventBus = eventBus;
    this.initialize();
  }

  /**
   * Initialize test runner
   */
  private initialize(): void {
    // Create output directories
    this.createDirectories();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize environments
    this.initializeEnvironments();
  }

  /**
   * Create necessary directories
   */
  private createDirectories(): void {
    const dirs = [
      this.config.outputDirectory,
      this.config.coverageDirectory,
      path.join(this.config.outputDirectory, 'reports'),
      path.join(this.config.outputDirectory, 'logs'),
      path.join(this.config.outputDirectory, 'artifacts')
    ];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    this.eventBus.subscribe('test:start', (data) => {
      this.handleTestStart(data);
    });
    
    this.eventBus.subscribe('test:end', (data) => {
      this.handleTestEnd(data);
    });
    
    this.eventBus.subscribe('test:error', (data) => {
      this.handleTestError(data);
    });
  }

  /**
   * Initialize test environments
   */
  private initializeEnvironments(): void {
    // Create default environment
    const defaultEnv: TestEnvironment = {
      name: 'default',
      config: this.config,
      status: 'idle'
    };
    
    this.environments.set('default', defaultEnv);
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<TestReport> {
    if (this.isRunning) {
      throw new Error('Test run already in progress');
    }
    
    this.isRunning = true;
    this.currentRunId = this.generateId();
    const startTime = new Date();
    
    try {
      // Discover test files
      const testFiles = await this.discoverTestFiles();
      
      // Run tests
      const results = await this.runTestFiles(testFiles);
      
      // Generate report
      const report = await this.generateReport(results, startTime);
      
      // Save report
      await this.saveReport(report);
      
      // Emit completion event
      this.eventBus.publish('test:complete', report);
      
      return report;
    } finally {
      this.isRunning = false;
      this.currentRunId = undefined;
    }
  }

  /**
   * Run specific test files
   */
  async runTestFiles(files: string[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    if (this.config.parallel) {
      // Run tests in parallel
      const chunks = this.chunkArray(files, this.config.maxWorkers);
      const promises = chunks.map(chunk => this.runTestChunk(chunk));
      const chunkResults = await Promise.all(promises);
      
      for (const chunkResult of chunkResults) {
        results.push(...chunkResult);
      }
    } else {
      // Run tests sequentially
      for (const file of files) {
        const fileResults = await this.runTestFile(file);
        results.push(...fileResults);
      }
    }
    
    return results;
  }

  /**
   * Run test chunk in parallel
   */
  private async runTestChunk(files: string[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    const promises = files.map(file => this.runTestFile(file));
    const fileResults = await Promise.all(promises);
    
    for (const fileResult of fileResults) {
      results.push(...fileResult);
    }
    
    return results;
  }

  /**
   * Run single test file
   */
  private async runTestFile(file: string): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    try {
      // Create test suite
      const suite = this.createTestSuite(file);
      this.suites.set(suite.id, suite);
      
      // Run Jest
      const jestResult = await this.runJest(file);
      
      // Parse results
      const parsedResults = this.parseJestResults(jestResult, file);
      
      // Update suite
      suite.tests = parsedResults;
      suite.status = this.calculateSuiteStatus(parsedResults);
      suite.endTime = new Date();
      suite.duration = suite.endTime.getTime() - suite.startTime.getTime();
      
      // Store results
      for (const result of parsedResults) {
        this.results.set(result.id, result);
        results.push(result);
      }
      
      // Emit suite completion
      this.eventBus.publish('test:suite:complete', suite);
      
    } catch (error: unknown) {
      // Handle test file error
      const errorResult: TestResult = {
        id: this.generateId(),
        name: `Error in ${file}`,
        file,
        type: TestType.UNIT,
        priority: TestPriority.HIGH,
        status: TestStatus.ERROR,
        duration: 0,
        startTime: new Date(),
        endTime: new Date(),
        error: error instanceof Error ? error.message : String(error),
        stackTrace: error instanceof Error ? error.stack : undefined,
        assertions: [],
        retries: 0,
        maxRetries: this.config.retries,
        tags: [],
        metadata: {}
      };
      
      results.push(errorResult);
      this.results.set(errorResult.id, errorResult);
    }
    
    return results;
  }

  /**
   * Run Jest for specific file
   */
  private async runJest(file: string): Promise<string> {
    const jestConfig = this.buildJestConfig();
    const jestCommand = `npx jest "${file}" --config="${jestConfig}" --json --verbose`;
    
    try {
      const { stdout, stderr } = await execAsync(jestCommand, {
        timeout: this.config.timeout,
        env: { ...process.env, ...this.config.environment }
      });
      
      if (stderr) {
        this.logger.warn('Jest stderr:', stderr);
      }
      
      return stdout;
    } catch (error: unknown) {
      // Jest returns non-zero exit code for test failures, but we still want the output
      const err: any = error as any;
      if (err.stdout) {
        return err.stdout as string;
      }
      throw error;
    }
  }

  /**
   * Build Jest configuration
   */
  private buildJestConfig(): string {
    const config = {
      testEnvironment: 'node',
      testMatch: this.config.includePatterns,
      testPathIgnorePatterns: this.config.excludePatterns,
      collectCoverage: this.config.collectCoverage,
      coverageDirectory: this.config.coverageDirectory,
      coverageThreshold: {
        global: {
          statements: this.config.coverageThreshold,
          branches: this.config.coverageThreshold,
          functions: this.config.coverageThreshold,
          lines: this.config.coverageThreshold
        }
      },
      maxWorkers: this.config.maxWorkers,
      timeout: this.config.timeout,
      bail: this.config.bail,
      verbose: this.config.verbose,
      setupFilesAfterEnv: this.config.setupFiles,
      globalSetup: this.config.globalSetup,
      globalTeardown: this.config.globalTeardown,
      reporters: ['default', 'json'],
      outputFile: path.join(this.config.outputDirectory, 'jest-results.json')
    };
    
    const configPath = path.join(this.config.outputDirectory, 'jest.config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    return configPath;
  }

  /**
   * Parse Jest results
   */
  private parseJestResults(jestOutput: string, file: string): TestResult[] {
    try {
      const jestResult = SafeJSONParser.parse(jestOutput);
      const results: TestResult[] = [];
      
      for (const testResult of jestResult.testResults) {
        for (const assertionResult of testResult.assertionResults) {
          const result: TestResult = {
            id: this.generateId(),
            name: assertionResult.title,
            file: testResult.name,
            type: this.determineTestType(file),
            priority: this.determineTestPriority(assertionResult.title),
            status: this.mapJestStatus(assertionResult.status),
            duration: assertionResult.duration || 0,
            startTime: new Date(testResult.startTime),
            endTime: new Date(testResult.endTime),
            error: assertionResult.failureMessages?.[0],
            stackTrace: assertionResult.failureMessages?.join('\n'),
            assertions: this.parseAssertions(assertionResult),
            retries: assertionResult.retries || 0,
            maxRetries: this.config.retries,
            tags: this.extractTags(assertionResult.title),
            metadata: {
              ancestorTitles: assertionResult.ancestorTitles,
              fullName: assertionResult.fullName
            }
          };
          
          results.push(result);
        }
      }
      
      return results;
    } catch (error: unknown) {
      this.logger.error('Error parsing Jest results:', error);
      return [];
    }
  }

  /**
   * Parse test assertions
   */
  private parseAssertions(assertionResult: any): TestAssertion[] {
    const assertions: TestAssertion[] = [];
    
    if (assertionResult.failureMessages) {
      for (const message of assertionResult.failureMessages) {
        assertions.push({
          id: this.generateId(),
          description: 'Test assertion',
          passed: false,
          message,
          duration: 0
        });
      }
    } else {
      assertions.push({
        id: this.generateId(),
        description: 'Test assertion',
        passed: true,
        duration: assertionResult.duration || 0
      });
    }
    
    return assertions;
  }

  /**
   * Map Jest status to TestStatus
   */
  private mapJestStatus(jestStatus: string): TestStatus {
    switch (jestStatus) {
      case 'passed':
        return TestStatus.PASSED;
      case 'failed':
        return TestStatus.FAILED;
      case 'skipped':
        return TestStatus.SKIPPED;
      case 'pending':
        return TestStatus.PENDING;
      default:
        return TestStatus.ERROR;
    }
  }

  /**
   * Determine test type from file path
   */
  private determineTestType(file: string): TestType {
    if (file.includes('e2e')) return TestType.E2E;
    if (file.includes('integration')) return TestType.INTEGRATION;
    if (file.includes('performance')) return TestType.PERFORMANCE;
    if (file.includes('security')) return TestType.SECURITY;
    if (file.includes('golden')) return TestType.GOLDEN;
    return TestType.UNIT;
  }

  /**
   * Determine test priority from test name
   */
  private determineTestPriority(testName: string): TestPriority {
    if (testName.includes('critical') || testName.includes('smoke')) return TestPriority.CRITICAL;
    if (testName.includes('important') || testName.includes('core')) return TestPriority.HIGH;
    if (testName.includes('optional') || testName.includes('nice-to-have')) return TestPriority.LOW;
    return TestPriority.MEDIUM;
  }

  /**
   * Extract tags from test name
   */
  private extractTags(testName: string): string[] {
    const tags: string[] = [];
    const tagPattern = /@(\w+)/g;
    let match;
    
    while ((match = tagPattern.exec(testName)) !== null) {
      tags.push(match[1]);
    }
    
    return tags;
  }

  /**
   * Calculate suite status
   */
  private calculateSuiteStatus(tests: TestResult[]): TestStatus {
    if (tests.length === 0) return TestStatus.SKIPPED;
    
    const hasFailures = tests.some(test => test.status === TestStatus.FAILED);
    const hasErrors = tests.some(test => test.status === TestStatus.ERROR);
    
    if (hasErrors) return TestStatus.ERROR;
    if (hasFailures) return TestStatus.FAILED;
    
    const allPassed = tests.every(test => test.status === TestStatus.PASSED);
    return allPassed ? TestStatus.PASSED : TestStatus.SKIPPED;
  }

  /**
   * Create test suite
   */
  private createTestSuite(file: string): TestSuite {
    return {
      id: this.generateId(),
      name: path.basename(file),
      file,
      type: this.determineTestType(file),
      priority: TestPriority.MEDIUM,
      status: TestStatus.RUNNING,
      duration: 0,
      startTime: new Date(),
      tests: [],
      retries: 0,
      maxRetries: this.config.retries,
      tags: [],
      metadata: {}
    };
  }

  /**
   * Discover test files
   */
  private async discoverTestFiles(): Promise<string[]> {
    const files: string[] = [];
    
    const discoverInDirectory = (dir: string): void => {
      if (!fs.existsSync(dir)) return;
      
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          discoverInDirectory(fullPath);
        } else if (entry.isFile()) {
          // Check if file matches test patterns
          const isTestFile = this.config.includePatterns.some(pattern => {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(entry.name);
          });
          
          const isExcluded = this.config.excludePatterns.some(pattern => {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(entry.name);
          });
          
          if (isTestFile && !isExcluded) {
            files.push(fullPath);
          }
        }
      }
    };
    
    discoverInDirectory(this.config.testDirectory);
    return files;
  }

  /**
   * Generate test report
   */
  private async generateReport(results: TestResult[], startTime: Date): Promise<TestReport> {
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    // Group results by suite
    const suites = Array.from(this.suites.values());
    
    // Calculate statistics
    const totalSuites = suites.length;
    const totalTests = results.length;
    const passedSuites = suites.filter(s => s.status === TestStatus.PASSED).length;
    const passedTests = results.filter(t => t.status === TestStatus.PASSED).length;
    const failedSuites = suites.filter(s => s.status === TestStatus.FAILED).length;
    const failedTests = results.filter(t => t.status === TestStatus.FAILED).length;
    const skippedSuites = suites.filter(s => s.status === TestStatus.SKIPPED).length;
    const skippedTests = results.filter(t => t.status === TestStatus.SKIPPED).length;
    
    // Calculate performance metrics
    const performance = this.calculatePerformanceMetrics(results);
    
    // Generate summary
    const summary = this.generateSummary({
      totalSuites,
      totalTests,
      passedSuites,
      passedTests,
      failedSuites,
      failedTests,
      skippedSuites,
      skippedTests,
      duration
    });
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(results, suites);
    
    // Determine overall status
    const status = failedTests > 0 ? TestStatus.FAILED : 
                  skippedTests === totalTests ? TestStatus.SKIPPED : 
                  TestStatus.PASSED;
    
    return {
      id: this.currentRunId!,
      timestamp: startTime,
      duration,
      status,
      totalSuites,
      totalTests,
      passedSuites,
      passedTests,
      failedSuites,
      failedTests,
      skippedSuites,
      skippedTests,
      suites,
      performance,
      summary,
      recommendations
    };
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(results: TestResult[]): TestPerformance {
    if (results.length === 0) {
      return {
        totalDuration: 0,
        averageTestDuration: 0,
        slowestTest: '',
        fastestTest: '',
        memory: 0,
        cpu: 0,
        parallelEfficiency: 0
      };
    }
    
    const durations = results.map(r => r.duration);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageTestDuration = totalDuration / results.length;
    
    const slowestTest = results.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest
    );
    
    const fastestTest = results.reduce((fastest, current) => 
      current.duration < fastest.duration ? current : fastest
    );
    
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const cpuUsage = process.cpuUsage().user / 1000000; // seconds
    
    const parallelEfficiency = this.config.parallel ? 
      (totalDuration / (totalDuration / this.config.maxWorkers)) * 100 : 100;
    
    return {
      totalDuration,
      averageTestDuration,
      slowestTest: slowestTest.name,
      fastestTest: fastestTest.name,
      memory: memoryUsage,
      cpu: cpuUsage,
      parallelEfficiency
    };
  }

  /**
   * Generate summary
   */
  private generateSummary(stats: any): string {
    const { totalSuites, totalTests, passedSuites, passedTests, failedSuites, failedTests, skippedSuites, skippedTests, duration } = stats;
    
    let summary = `Test Run Summary:\n`;
    summary += `  Total Suites: ${totalSuites} (${passedSuites} passed, ${failedSuites} failed, ${skippedSuites} skipped)\n`;
    summary += `  Total Tests: ${totalTests} (${passedTests} passed, ${failedTests} failed, ${skippedTests} skipped)\n`;
    summary += `  Duration: ${(duration / 1000).toFixed(2)}s\n`;
    
    if (failedTests > 0) {
      summary += `  Status: FAILED\n`;
    } else if (skippedTests === totalTests) {
      summary += `  Status: SKIPPED\n`;
    } else {
      summary += `  Status: PASSED\n`;
    }
    
    return summary;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(results: TestResult[], suites: TestSuite[]): string[] {
    const recommendations: string[] = [];
    
    // Check for slow tests
    const slowTests = results.filter(r => r.duration > 5000); // 5 seconds
    if (slowTests.length > 0) {
      recommendations.push(`Consider optimizing ${slowTests.length} slow tests (>5s)`);
    }
    
    // Check for flaky tests
    const flakyTests = results.filter(r => r.retries > 0);
    if (flakyTests.length > 0) {
      recommendations.push(`Investigate ${flakyTests.length} flaky tests that required retries`);
    }
    
    // Check for test coverage
    const uncoveredTests = results.filter(r => !r.coverage);
    if (uncoveredTests.length > 0) {
      recommendations.push(`Add coverage reporting for ${uncoveredTests.length} tests`);
    }
    
    // Check for test organization
    const unitTests = results.filter(r => r.type === TestType.UNIT);
    const integrationTests = results.filter(r => r.type === TestType.INTEGRATION);
    
    if (unitTests.length < integrationTests.length) {
      recommendations.push('Consider adding more unit tests for better test pyramid');
    }
    
    return recommendations;
  }

  /**
   * Save test report
   */
  private async saveReport(report: TestReport): Promise<void> {
    const reportPath = path.join(this.config.outputDirectory, 'reports', `test-report-${report.id}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Also save as HTML
    const htmlReport = this.generateHtmlReport(report);
    const htmlPath = path.join(this.config.outputDirectory, 'reports', `test-report-${report.id}.html`);
    fs.writeFileSync(htmlPath, htmlReport);
  }

  /**
   * Generate HTML report
   */
  private generateHtmlReport(report: TestReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - ${report.id}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .summary { margin: 20px 0; }
        .suite { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .test { margin: 5px 0; padding: 5px; }
        .passed { color: green; }
        .failed { color: red; }
        .skipped { color: orange; }
        .error { color: red; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Report</h1>
        <p>Run ID: ${report.id}</p>
        <p>Timestamp: ${report.timestamp.toISOString()}</p>
        <p>Duration: ${(report.duration / 1000).toFixed(2)}s</p>
        <p>Status: <span class="${report.status}">${report.status.toUpperCase()}</span></p>
    </div>
    
    <div class="summary">
        <h2>Summary</h2>
        <p>Total Suites: ${report.totalSuites} (${report.passedSuites} passed, ${report.failedSuites} failed, ${report.skippedSuites} skipped)</p>
        <p>Total Tests: ${report.totalTests} (${report.passedTests} passed, ${report.failedTests} failed, ${report.skippedTests} skipped)</p>
    </div>
    
    <div class="suites">
        <h2>Test Suites</h2>
        ${report.suites.map(suite => `
            <div class="suite">
                <h3>${suite.name} <span class="${suite.status}">(${suite.status})</span></h3>
                <p>File: ${suite.file}</p>
                <p>Duration: ${suite.duration}ms</p>
                <div class="tests">
                    ${suite.tests.map(test => `
                        <div class="test">
                            <span class="${test.status}">${test.name}</span>
                            ${test.error ? `<div class="error">${test.error}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    </div>
    
    <div class="recommendations">
        <h2>Recommendations</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>
    `;
  }

  /**
   * Handle test start event
   */
  private handleTestStart(data: any): void {
    // Implementation for handling test start events
  }

  /**
   * Handle test end event
   */
  private handleTestEnd(data: any): void {
    // Implementation for handling test end events
  }

  /**
   * Handle test error event
   */
  private handleTestError(data: any): void {
    // Implementation for handling test error events
  }

  /**
   * Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get test results
   */
  getTestResults(): TestResult[] {
    return Array.from(this.results.values());
  }

  /**
   * Get test suites
   */
  getTestSuites(): TestSuite[] {
    return Array.from(this.suites.values());
  }

  /**
   * Get test report
   */
  getTestReport(): TestReport | null {
    // Implementation would return the latest test report
    return null;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TestConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.isRunning = false;
    this.suites.clear();
    this.results.clear();
    this.environments.clear();
  }
}

/**
 * Default test runner instance
 */
export const defaultTestRunner = new TestRunner({
  testDirectory: './miff/pure',
  outputDirectory: './test-output',
  coverageDirectory: './coverage',
  parallel: true,
  maxWorkers: 4,
  timeout: 10000,
  retries: 2,
  bail: false,
  verbose: true,
  watch: false,
  updateSnapshots: false,
  collectCoverage: true,
  coverageThreshold: 80,
  testTypes: [TestType.UNIT, TestType.INTEGRATION, TestType.GOLDEN],
  excludePatterns: ['node_modules/**', 'dist/**', 'coverage/**'],
  includePatterns: ['**/*.test.ts', '**/*.spec.ts'],
  environment: {},
  setupFiles: [],
  teardownFiles: [],
  globalSetup: '',
  globalTeardown: ''
}, {} as EventBus);