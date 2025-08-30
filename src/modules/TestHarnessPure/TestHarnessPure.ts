/**
 * TestHarnessPure.ts
 * 
 * Inspired by Delta Engine hot-reload and live code injection patterns.
 * Provides pure, remix-safe testing harness and live code injection for MIFF games.
 * 
 * Attribution: Delta Engine (MIT License) - hot-reload and live code injection patterns
 */

export interface TestConfig {
  enabled: boolean;
  autoRun: boolean;
  watchMode: boolean;
  timeout: number;
  retries: number;
  parallel: boolean;
  categories: string[];
  outputFormat: 'json' | 'junit' | 'console';
}

export interface TestCase {
  id: string;
  name: string;
  category: string;
  description?: string;
  setup?: () => void | Promise<void>;
  teardown?: () => void | Promise<void>;
  test: () => void | Promise<void>;
  timeout?: number;
  retries?: number;
  metadata?: Record<string, any>;
}

export interface TestResult {
  testId: string;
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'skipped' | 'timeout';
  duration: number;
  error?: Error;
  retries: number;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  tests: TestCase[];
  setup?: () => void | Promise<void>;
  teardown?: () => void | Promise<void>;
  metadata?: Record<string, any>;
}

export interface TestReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    timeout: number;
    duration: number;
  };
  suites: Map<string, {
    name: string;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  }>;
  results: TestResult[];
  recommendations: string[];
}

export interface HotReloadConfig {
  enabled: boolean;
  watchPaths: string[];
  reloadDelay: number;
  validateBeforeReload: boolean;
  backupBeforeReload: boolean;
  onReload?: (filePath: string) => void;
}

export interface CodeInjection {
  id: string;
  target: string; // Function name or module path
  code: string;
  type: 'replace' | 'before' | 'after' | 'wrap';
  enabled: boolean;
  metadata?: Record<string, any>;
}

export class TestHarness {
  private config: TestConfig;
  private suites: Map<string, TestSuite>;
  private results: TestResult[];
  private observers: TestObserver[];
  private isRunning: boolean;
  private hotReloadConfig: HotReloadConfig;
  private codeInjections: Map<string, CodeInjection>;

  constructor(config: TestConfig, hotReloadConfig?: HotReloadConfig) {
    this.config = config;
    this.suites = new Map();
    this.results = [];
    this.observers = [];
    this.isRunning = false;
    this.hotReloadConfig = hotReloadConfig || {
      enabled: false,
      watchPaths: [],
      reloadDelay: 1000,
      validateBeforeReload: true,
      backupBeforeReload: true
    };
    this.codeInjections = new Map();

    if (config.autoRun) {
      this.runAll();
    }
  }

  // Test Suite Management
  addSuite(suite: TestSuite): void {
    this.suites.set(suite.id, suite);
    this.notifyObservers('suiteAdded', suite);
  }

  removeSuite(suiteId: string): void {
    const suite = this.suites.get(suiteId);
    if (suite) {
      this.suites.delete(suiteId);
      this.notifyObservers('suiteRemoved', suite);
    }
  }

  getSuite(suiteId: string): TestSuite | undefined {
    return this.suites.get(suiteId);
  }

  getAllSuites(): TestSuite[] {
    return Array.from(this.suites.values());
  }

  // Test Execution
  async runAll(): Promise<TestReport> {
    if (this.isRunning) {
      throw new Error('Test harness is already running');
    }

    this.isRunning = true;
    this.results = [];
    this.notifyObservers('testRunStarted', null);

    const startTime = performance.now();

    try {
      const suiteIds = Array.from(this.suites.keys());
      
      if (this.config.parallel) {
        await Promise.all(suiteIds.map(suiteId => this.runSuite(suiteId)));
      } else {
        for (const suiteId of suiteIds) {
          await this.runSuite(suiteId);
        }
      }
    } finally {
      this.isRunning = false;
      const duration = performance.now() - startTime;
      this.notifyObservers('testRunCompleted', { duration });
    }

    return this.generateReport();
  }

  async runSuite(suiteId: string): Promise<TestResult[]> {
    const suite = this.suites.get(suiteId);
    if (!suite) {
      throw new Error(`Test suite not found: ${suiteId}`);
    }

    this.notifyObservers('suiteStarted', suite);
    const suiteStartTime = performance.now();

    try {
      // Run suite setup
      if (suite.setup) {
        await suite.setup();
      }

      const results: TestResult[] = [];

      // Run tests
      for (const testCase of suite.tests) {
        const result = await this.runTest(testCase, suite);
        results.push(result);
        this.results.push(result);
      }

      // Run suite teardown
      if (suite.teardown) {
        await suite.teardown();
      }

      const suiteDuration = performance.now() - suiteStartTime;
      this.notifyObservers('suiteCompleted', { suite, duration: suiteDuration, results });

      return results;
    } catch (error) {
      this.notifyObservers('suiteFailed', { suite, error });
      throw error;
    }
  }

  async runTest(testCase: TestCase, suite?: TestSuite): Promise<TestResult> {
    const startTime = performance.now();
    let retries = 0;
    const maxRetries = testCase.retries || this.config.retries;

    this.notifyObservers('testStarted', testCase);

    while (retries <= maxRetries) {
      try {
        // Run test setup
        if (testCase.setup) {
          await testCase.setup();
        }

        // Execute test with timeout
        const timeout = testCase.timeout || this.config.timeout;
        const testPromise = testCase.test();
        
        const result = await Promise.race([
          testPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Test timeout')), timeout)
          )
        ]);

        // Run test teardown
        if (testCase.teardown) {
          await testCase.teardown();
        }

        const duration = performance.now() - startTime;
        const testResult: TestResult = {
          testId: testCase.id,
          name: testCase.name,
          category: testCase.category,
          status: 'passed',
          duration,
          retries,
          metadata: testCase.metadata,
          timestamp: Date.now()
        };

        this.notifyObservers('testPassed', testResult);
        return testResult;

      } catch (error) {
        retries++;
        
        if (retries > maxRetries) {
          const duration = performance.now() - startTime;
          const testResult: TestResult = {
            testId: testCase.id,
            name: testCase.name,
            category: testCase.category,
            status: error instanceof Error && error.message === 'Test timeout' ? 'timeout' : 'failed',
            duration,
            error: error as Error,
            retries,
            metadata: testCase.metadata,
            timestamp: Date.now()
          };

          this.notifyObservers('testFailed', testResult);
          return testResult;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    throw new Error('Unexpected test execution error');
  }

  // Hot Reload Management
  enableHotReload(config: HotReloadConfig): void {
    this.hotReloadConfig = { ...this.hotReloadConfig, ...config };
    
    if (this.hotReloadConfig.enabled) {
      this.startFileWatcher();
    }
  }

  disableHotReload(): void {
    this.hotReloadConfig.enabled = false;
    this.stopFileWatcher();
  }

  private startFileWatcher(): void {
    // In a real implementation, this would use fs.watch or similar
    console.log('[TestHarnessPure] Hot reload enabled for paths:', this.hotReloadConfig.watchPaths);
  }

  private stopFileWatcher(): void {
    console.log('[TestHarnessPure] Hot reload disabled');
  }

  // Code Injection Management
  injectCode(injection: CodeInjection): void {
    this.codeInjections.set(injection.id, injection);
    this.applyCodeInjection(injection);
    this.notifyObservers('codeInjected', injection);
  }

  removeCodeInjection(injectionId: string): void {
    const injection = this.codeInjections.get(injectionId);
    if (injection) {
      this.revertCodeInjection(injection);
      this.codeInjections.delete(injectionId);
      this.notifyObservers('codeInjectionRemoved', injection);
    }
  }

  private applyCodeInjection(injection: CodeInjection): void {
    if (!injection.enabled) return;

    try {
      // In a real implementation, this would modify the actual code
      // For now, we'll simulate the injection
      console.log(`[TestHarnessPure] Code injection applied: ${injection.id} -> ${injection.target}`);
      
      // Store original function if it exists
      const target = (globalThis as any)[injection.target];
      if (target && typeof target === 'function') {
        (globalThis as any)[`__original_${injection.target}`] = target;
      }

      // Apply injection based on type
      switch (injection.type) {
        case 'replace':
          (globalThis as any)[injection.target] = new Function(injection.code);
          break;
        case 'before':
          const originalBefore = (globalThis as any)[injection.target];
          (globalThis as any)[injection.target] = function(...args: any[]) {
            new Function(injection.code)();
            return originalBefore.apply(this, args);
          };
          break;
        case 'after':
          const originalAfter = (globalThis as any)[injection.target];
          (globalThis as any)[injection.target] = function(...args: any[]) {
            const result = originalAfter.apply(this, args);
            new Function(injection.code)();
            return result;
          };
          break;
        case 'wrap':
          const originalWrap = (globalThis as any)[injection.target];
          (globalThis as any)[injection.target] = new Function('original', injection.code)(originalWrap);
          break;
      }
    } catch (error) {
      console.error(`[TestHarnessPure] Code injection failed: ${injection.id}`, error);
    }
  }

  private revertCodeInjection(injection: CodeInjection): void {
    try {
      const originalKey = `__original_${injection.target}`;
      const original = (globalThis as any)[originalKey];
      
      if (original) {
        (globalThis as any)[injection.target] = original;
        delete (globalThis as any)[originalKey];
      } else {
        delete (globalThis as any)[injection.target];
      }
      
      console.log(`[TestHarnessPure] Code injection reverted: ${injection.id}`);
    } catch (error) {
      console.error(`[TestHarnessPure] Code injection revert failed: ${injection.id}`, error);
    }
  }

  // Observer Management
  addObserver(observer: TestObserver): void {
    this.observers.push(observer);
  }

  removeObserver(observerId: string): void {
    const index = this.observers.findIndex(o => o.id === observerId);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  private notifyObservers(event: string, data: any): void {
    this.observers.forEach(observer => {
      try {
        switch (event) {
          case 'testRunStarted':
            observer.onTestRunStarted?.();
            break;
          case 'testRunCompleted':
            observer.onTestRunCompleted?.(data);
            break;
          case 'suiteAdded':
            observer.onSuiteAdded?.(data);
            break;
          case 'suiteRemoved':
            observer.onSuiteRemoved?.(data);
            break;
          case 'suiteStarted':
            observer.onSuiteStarted?.(data);
            break;
          case 'suiteCompleted':
            observer.onSuiteCompleted?.(data);
            break;
          case 'suiteFailed':
            observer.onSuiteFailed?.(data);
            break;
          case 'testStarted':
            observer.onTestStarted?.(data);
            break;
          case 'testPassed':
            observer.onTestPassed?.(data);
            break;
          case 'testFailed':
            observer.onTestFailed?.(data);
            break;
          case 'codeInjected':
            observer.onCodeInjected?.(data);
            break;
          case 'codeInjectionRemoved':
            observer.onCodeInjectionRemoved?.(data);
            break;
        }
      } catch (error) {
        console.error('[TestHarnessPure] Observer error:', error);
      }
    });
  }

  // Report Generation
  generateReport(): TestReport {
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'passed').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      skipped: this.results.filter(r => r.status === 'skipped').length,
      timeout: this.results.filter(r => r.status === 'timeout').length,
      duration: this.results.reduce((sum, r) => sum + r.duration, 0)
    };

    // Calculate suite statistics
    const suites = new Map<string, {
      name: string;
      total: number;
      passed: number;
      failed: number;
      skipped: number;
      duration: number;
    }>();

    for (const suite of this.suites.values()) {
      const suiteResults = this.results.filter(r => 
        suite.tests.some(t => t.id === r.testId)
      );

      suites.set(suite.id, {
        name: suite.name,
        total: suiteResults.length,
        passed: suiteResults.filter(r => r.status === 'passed').length,
        failed: suiteResults.filter(r => r.status === 'failed').length,
        skipped: suiteResults.filter(r => r.status === 'skipped').length,
        duration: suiteResults.reduce((sum, r) => sum + r.duration, 0)
      });
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (summary.failed > 0) {
      recommendations.push(`${summary.failed} tests failed. Review test results for details.`);
    }
    
    if (summary.timeout > 0) {
      recommendations.push(`${summary.timeout} tests timed out. Consider increasing timeout values.`);
    }

    const slowTests = this.results
      .filter(r => r.duration > 1000)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
    
    if (slowTests.length > 0) {
      recommendations.push(`Slow tests detected: ${slowTests.map(t => t.name).join(', ')}`);
    }

    return {
      summary,
      suites,
      results: [...this.results],
      recommendations
    };
  }

  // Export Methods
  exportReport(format: 'json' | 'junit' | 'console' = 'json'): string {
    const report = this.generateReport();

    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      
      case 'junit':
        return this.exportToJUnit(report);
      
      case 'console':
        return this.exportToConsole(report);
      
      default:
        return JSON.stringify(report, null, 2);
    }
  }

  private exportToJUnit(report: TestReport): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<testsuites>\n';
    
    for (const [suiteId, suiteStats] of report.suites) {
      const suite = this.suites.get(suiteId);
      xml += `  <testsuite name="${suite?.name || suiteId}" tests="${suiteStats.total}" failures="${suiteStats.failed}" time="${(suiteStats.duration / 1000).toFixed(3)}">\n`;
      
      const suiteResults = this.results.filter(r => 
        suite?.tests.some(t => t.id === r.testId)
      );
      
      for (const result of suiteResults) {
        xml += `    <testcase name="${result.name}" time="${(result.duration / 1000).toFixed(3)}">\n`;
        if (result.status === 'failed' && result.error) {
          xml += `      <failure message="${result.error.message}">${result.error.stack}</failure>\n`;
        }
        xml += '    </testcase>\n';
      }
      
      xml += '  </testsuite>\n';
    }
    
    xml += '</testsuites>';
    return xml;
  }

  private exportToConsole(report: TestReport): string {
    let output = '=== Test Report ===\n\n';
    
    output += `Summary:\n`;
    output += `  Total: ${report.summary.total}\n`;
    output += `  Passed: ${report.summary.passed}\n`;
    output += `  Failed: ${report.summary.failed}\n`;
    output += `  Skipped: ${report.summary.skipped}\n`;
    output += `  Timeout: ${report.summary.timeout}\n`;
    output += `  Duration: ${(report.summary.duration / 1000).toFixed(2)}s\n\n`;
    
    output += `Suites:\n`;
    for (const [suiteId, stats] of report.suites) {
      output += `  ${stats.name}: ${stats.passed}/${stats.total} passed (${(stats.duration / 1000).toFixed(2)}s)\n`;
    }
    
    if (report.recommendations.length > 0) {
      output += `\nRecommendations:\n`;
      report.recommendations.forEach(rec => {
        output += `  - ${rec}\n`;
      });
    }
    
    return output;
  }

  // Utility Methods
  getResults(): TestResult[] {
    return [...this.results];
  }

  clearResults(): void {
    this.results = [];
  }

  getRunningStatus(): boolean {
    return this.isRunning;
  }
}

export interface TestObserver {
  id: string;
  onTestRunStarted?: () => void;
  onTestRunCompleted?: (data: { duration: number }) => void;
  onSuiteAdded?: (suite: TestSuite) => void;
  onSuiteRemoved?: (suite: TestSuite) => void;
  onSuiteStarted?: (suite: TestSuite) => void;
  onSuiteCompleted?: (data: { suite: TestSuite; duration: number; results: TestResult[] }) => void;
  onSuiteFailed?: (data: { suite: TestSuite; error: Error }) => void;
  onTestStarted?: (testCase: TestCase) => void;
  onTestPassed?: (result: TestResult) => void;
  onTestFailed?: (result: TestResult) => void;
  onCodeInjected?: (injection: CodeInjection) => void;
  onCodeInjectionRemoved?: (injection: CodeInjection) => void;
}

// CLI interface
export function createTestHarness(config: TestConfig, hotReloadConfig?: HotReloadConfig): TestHarness {
  return new TestHarness(config, hotReloadConfig);
}

// Export for CLI usage
export default TestHarness;