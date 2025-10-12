#!/usr/bin/env tsx

import { 
  TestHarness, 
  TestConfig, 
  TestCase, 
  TestSuite, 
  TestResult,
  TestReport,
  HotReloadConfig,
  CodeInjection 
} from './TestHarnessPure';
import { addExportSupport } from '../shared/exportUtils';
import * as fs from 'fs';
import * as path from 'path';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

interface TestHarnessOperation {
  op: 'create' | 'add-suite' | 'add-test' | 'run' | 'run-suite' | 'run-test' | 'get-report' | 'demo' | 'dump';
  config?: TestConfig;
  suite?: TestSuite;
  test?: TestCase;
  suiteId?: string;
  testId?: string;
  exportFormat?: string;
}

async function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    this.logger.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0];
    let operation: TestHarnessOperation;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = SafeJSONParser.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as TestHarnessOperation;
    } else {
      // Parse subcommand
      switch (first) {
        case 'create':
          const configFile = argv[1];
          const config = configFile && fs.existsSync(configFile) 
            ? SafeJSONParser.parse(fs.readFileSync(configFile, 'utf-8'))
            : {
                enabled: true,
                autoRun: false,
                watchMode: false,
                timeout: 5000,
                retries: 3,
                parallel: false,
                categories: ['unit', 'integration', 'e2e'],
                outputFormat: 'json' as const
              };
          operation = { op: 'create', config };
          break;
        case 'add-suite':
          if (!argv[1]) throw new Error('add-suite requires suite JSON');
          operation = { op: 'add-suite', suite: SafeJSONParser.parse(argv[1]) };
          break;
        case 'add-test':
          if (!argv[1] || !argv[2]) throw new Error('add-test requires suiteId and test JSON');
          operation = { op: 'add-test', suiteId: argv[1], test: SafeJSONParser.parse(argv[2]) };
          break;
        case 'run':
          operation = { op: 'run' };
          break;
        case 'run-suite':
          if (!argv[1]) throw new Error('run-suite requires suiteId');
          operation = { op: 'run-suite', suiteId: argv[1] };
          break;
        case 'run-test':
          if (!argv[1] || !argv[2]) throw new Error('run-test requires suiteId and testId');
          operation = { op: 'run-test', suiteId: argv[1], testId: argv[2] };
          break;
        case 'get-report':
          operation = { op: 'get-report' };
          break;
        case 'demo':
          operation = { op: 'demo' };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    // Create test harness instance
    const testHarness = new TestHarness(operation.config || {
      enabled: true,
      autoRun: false,
      watchMode: false,
      timeout: 5000,
      retries: 3,
      parallel: false,
      categories: ['unit', 'integration', 'e2e'],
      outputFormat: 'json'
    });

    let result: any;

    switch (operation.op) {
      case 'create':
        result = {
          testHarness: {
            config: testHarness['config'],
            suites: testHarness['suites'].size,
            results: testHarness['results'].length,
            isRunning: testHarness['isRunning']
          }
        };
        break;

      case 'add-suite':
        testHarness.addSuite(operation.suite!);
        
        result = {
          action: 'suite_added',
          suite: {
            id: operation.suite!.id,
            name: operation.suite!.name,
            testCount: operation.suite!.tests.length
          },
          summary: {
            totalSuites: testHarness['suites'].size,
            totalTests: Array.from(testHarness['suites'].values()).reduce((sum, suite) => sum + suite.tests.length, 0)
          }
        };
        break;

      case 'add-test':
        testHarness.addTest(operation.suiteId!, operation.test!);
        
        result = {
          action: 'test_added',
          suiteId: operation.suiteId,
          test: {
            id: operation.test!.id,
            name: operation.test!.name,
            category: operation.test!.category
          },
          summary: {
            totalSuites: testHarness['suites'].size,
            totalTests: Array.from(testHarness['suites'].values()).reduce((sum, suite) => sum + suite.tests.length, 0)
          }
        };
        break;

      case 'run':
        const runReport = await testHarness.runAll();
        
        result = {
          action: 'all_tests_run',
          report: runReport,
          summary: {
            totalTests: runReport.summary.total,
            passed: runReport.summary.passed,
            failed: runReport.summary.failed,
            skipped: runReport.summary.skipped,
            timeout: runReport.summary.timeout,
            totalDuration: runReport.summary.duration
          }
        };
        break;

      case 'run-suite':
        const suiteResults = await testHarness.runSuite(operation.suiteId!);
        
        result = {
          action: 'suite_run',
          suiteId: operation.suiteId,
          results: suiteResults,
          summary: {
            totalTests: suiteResults.length,
            passed: suiteResults.filter(r => r.status === 'passed').length,
            failed: suiteResults.filter(r => r.status === 'failed').length,
            skipped: suiteResults.filter(r => r.status === 'skipped').length,
            timeout: suiteResults.filter(r => r.status === 'timeout').length,
            totalDuration: suiteResults.reduce((sum, r) => sum + r.duration, 0)
          }
        };
        break;

      case 'run-test':
        const testResult = await testHarness.runTest(operation.suiteId!, operation.testId!);
        
        result = {
          action: 'test_run',
          suiteId: operation.suiteId,
          testId: operation.testId,
          result: testResult,
          summary: {
            status: testResult.status,
            duration: testResult.duration,
            retries: testResult.retries,
            error: testResult.error?.message
          }
        };
        break;

      case 'get-report':
        const report = testHarness.generateReport();
        
        result = {
          report,
          summary: {
            total: report.summary.total,
            passed: report.summary.passed,
            failed: report.summary.failed,
            skipped: report.summary.skipped,
            timeout: report.summary.timeout,
            duration: report.summary.duration,
            successRate: ((report.summary.passed / report.summary.total) * 100).toFixed(1) + '%'
          }
        };
        break;

      case 'demo':
        // Create a comprehensive testing demo
        const demoHarness = new TestHarness({
          enabled: true,
          autoRun: false,
          watchMode: false,
          timeout: 3000,
          retries: 2,
          parallel: false,
          categories: ['unit', 'integration', 'demo'],
          outputFormat: 'json'
        });

        // Add demo test suites
        const mathSuite: TestSuite = {
          id: 'math_suite',
          name: 'Math Operations',
          description: 'Basic math operation tests',
          tests: [
            {
              id: 'add_test',
              name: 'Addition Test',
              category: 'unit',
              description: 'Test basic addition',
              test: () => {
                const result = 2 + 2;
                if (result !== 4) throw new Error(`Expected 4, got ${result}`);
              }
            },
            {
              id: 'multiply_test',
              name: 'Multiplication Test',
              category: 'unit',
              description: 'Test basic multiplication',
              test: () => {
                const result = 3 * 4;
                if (result !== 12) throw new Error(`Expected 12, got ${result}`);
              }
            },
            {
              id: 'divide_test',
              name: 'Division Test',
              category: 'unit',
              description: 'Test basic division',
              test: () => {
                const result = 10 / 2;
                if (result !== 5) throw new Error(`Expected 5, got ${result}`);
              }
            }
          ]
        };

        const stringSuite: TestSuite = {
          id: 'string_suite',
          name: 'String Operations',
          description: 'String manipulation tests',
          tests: [
            {
              id: 'concat_test',
              name: 'String Concatenation',
              category: 'unit',
              description: 'Test string concatenation',
              test: () => {
                const result = 'Hello' + ' ' + 'World';
                if (result !== 'Hello World') throw new Error(`Expected 'Hello World', got '${result}'`);
              }
            },
            {
              id: 'length_test',
              name: 'String Length',
              category: 'unit',
              description: 'Test string length',
              test: () => {
                const result = 'Test'.length;
                if (result !== 4) throw new Error(`Expected 4, got ${result}`);
              }
            },
            {
              id: 'failing_test',
              name: 'Intentionally Failing Test',
              category: 'demo',
              description: 'This test is designed to fail',
              test: () => {
                throw new Error('This test is designed to fail for demo purposes');
              }
            }
          ]
        };

        const asyncSuite: TestSuite = {
          id: 'async_suite',
          name: 'Async Operations',
          description: 'Asynchronous operation tests',
          tests: [
            {
              id: 'async_test',
              name: 'Async Test',
              category: 'integration',
              description: 'Test async operations',
              test: async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                const result = await Promise.resolve(42);
                if (result !== 42) throw new Error(`Expected 42, got ${result}`);
              }
            },
            {
              id: 'timeout_test',
              name: 'Timeout Test',
              category: 'demo',
              description: 'This test will timeout',
              timeout: 100,
              test: async () => {
                await new Promise(resolve => setTimeout(resolve, 200));
              }
            }
          ]
        };

        demoHarness.addSuite(mathSuite);
        demoHarness.addSuite(stringSuite);
        demoHarness.addSuite(asyncSuite);

        // Run all tests
        const demoReport = await demoHarness.runAll();

        result = {
          demo: {
            suites: {
              math: {
                id: mathSuite.id,
                name: mathSuite.name,
                testCount: mathSuite.tests.length
              },
              string: {
                id: stringSuite.id,
                name: stringSuite.name,
                testCount: stringSuite.tests.length
              },
              async: {
                id: asyncSuite.id,
                name: asyncSuite.name,
                testCount: asyncSuite.tests.length
              }
            },
            results: demoReport.results.map(r => ({
              testId: r.testId,
              name: r.name,
              category: r.category,
              status: r.status,
              duration: r.duration,
              retries: r.retries,
              error: r.error?.message
            })),
            report: {
              summary: demoReport.summary,
              recommendations: demoReport.recommendations
            },
            summary: {
              totalSuites: 3,
              totalTests: demoReport.summary.total,
              passed: demoReport.summary.passed,
              failed: demoReport.summary.failed,
              skipped: demoReport.summary.skipped,
              timeout: demoReport.summary.timeout,
              totalDuration: demoReport.summary.duration,
              successRate: ((demoReport.summary.passed / demoReport.summary.total) * 100).toFixed(1) + '%'
            }
          }
        };
        break;

      case 'dump':
        result = {
          operations: ['create', 'add-suite', 'add-test', 'run', 'run-suite', 'run-test', 'get-report', 'demo', 'dump'],
          description: 'TestHarnessPure - Testing harness and live code injection system',
          features: [
            'Test suite and test case management',
            'Synchronous and asynchronous test execution',
            'Test result tracking and reporting',
            'Hot-reload and live code injection',
            'Parallel and sequential test execution',
            'Test timeout and retry mechanisms',
            'Multiple output formats (JSON, JUnit, Console)',
            'Test categorization and filtering'
          ],
          testCategories: ['unit', 'integration', 'e2e', 'performance', 'demo'],
          outputFormats: ['json', 'junit', 'console'],
          defaultConfig: {
            enabled: true,
            autoRun: false,
            watchMode: false,
            timeout: 5000,
            retries: 3,
            parallel: false,
            categories: ['unit', 'integration', 'e2e'],
            outputFormat: 'json'
          },
          testStatuses: ['passed', 'failed', 'skipped', 'timeout']
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
      'TestHarnessPure Export',
      'Testing harness and test execution data'
    );

    // Output in JSON envelope format
    this.logger.info(JSON.stringify({
      op: operation.op,
      status: 'ok',
      result: finalResult,
      timestamp: Date.now()
    }, null, 2));

    // Output export data to stderr if available
    if (exportData) {
      this.logger.error('\n' + exportData);
    }

  } catch (error) {
    this.logger.error(JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}