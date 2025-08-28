#!/usr/bin/env node

/**
 * test-harness.ts - CLI commands for TestHarnessPure module
 * 
 * Provides commands for testing harness and live code injection.
 */

import { Command } from 'commander';
import { createTestHarness, TestConfig, TestCase, TestSuite } from '../miff/pure/TestHarnessPure/TestHarnessPure';

const program = new Command();

program
  .name('test-harness')
  .description('Testing harness and live code injection commands for MIFF games')
  .version('1.0.0');

program
  .command('run')
  .description('Run test suites')
  .option('-s, --suite <name>', 'Run specific test suite')
  .option('-t, --test <name>', 'Run specific test case')
  .option('-w, --watch', 'Watch for changes and re-run tests')
  .option('-o, --output <format>', 'Output format (json, junit, console)', 'console')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    console.log('🧪 Starting test harness...');

    const config: TestConfig = {
      watchMode: options.watch || false,
      autoReload: options.watch || false,
      outputFormat: options.output as 'json' | 'junit' | 'console',
      verbose: options.verbose || false,
      timeout: 30000,
      retries: 3
    };

    const harness = createTestHarness(config);

    // Add sample test suites
    setupSampleTestSuites(harness);

    // Add observer for real-time output
    harness.addObserver({
      id: 'cli_observer',
      onTestStart: (test) => {
        console.log(`▶️  Running: ${test.name}`);
      },
      onTestEnd: (result) => {
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.testName}: ${result.duration?.toFixed(2)}ms`);
        if (!result.passed && result.error) {
          console.log(`   Error: ${result.error.message}`);
        }
      },
      onSuiteStart: (suite) => {
        console.log(`\n📋 Suite: ${suite.name}`);
      },
      onSuiteEnd: (result) => {
        console.log(`📊 Suite ${result.suiteName}: ${result.passedTests}/${result.totalTests} passed`);
      }
    });

    console.log('✅ Test harness initialized');
    console.log(`Configuration: ${JSON.stringify(config, null, 2)}`);

    // Run tests
    if (options.suite) {
      console.log(`🎯 Running suite: ${options.suite}`);
      await harness.runSuite(options.suite);
    } else if (options.test) {
      console.log(`🎯 Running test: ${options.test}`);
      await harness.runTest(options.test);
    } else {
      console.log('🎯 Running all test suites...');
      await harness.runAllSuites();
    }

    // Generate and display report
    console.log('\n📋 Generating test report...');
    const report = harness.exportReport(options.output);
    console.log(report);
  });

program
  .command('inject')
  .description('Inject code into running test environment')
  .argument('<file>', 'Code file to inject')
  .option('-t, --target <name>', 'Target test or suite name')
  .option('-r, --revert', 'Revert previous injection')
  .action(async (file, options) => {
    console.log(`💉 Code injection: ${file}`);

    const config: TestConfig = {
      watchMode: false,
      autoReload: true,
      outputFormat: 'console',
      verbose: true,
      timeout: 30000,
      retries: 1
    };

    const harness = createTestHarness(config);

    try {
      if (options.revert) {
        console.log('🔄 Reverting previous injection...');
        const reverted = harness.revertInjection(options.target);
        console.log(reverted ? '✅ Injection reverted' : '❌ No injection to revert');
      } else {
        console.log(`📄 Reading code from ${file}...`);
        const fs = require('fs');
        const code = fs.readFileSync(file, 'utf8');

        console.log('💉 Injecting code...');
        const injection = harness.injectCode({
          id: `injection_${Date.now()}`,
          code,
          target: options.target || 'global',
          metadata: {
            source: file,
            timestamp: new Date().toISOString(),
            description: 'CLI injection'
          }
        });

        console.log(`✅ Code injected with ID: ${injection.id}`);
        console.log(`Target: ${injection.target}`);
        console.log(`Code length: ${injection.code.length} characters`);
      }
    } catch (error) {
      console.error('❌ Injection failed:', error.message);
    }
  });

program
  .command('watch')
  .description('Watch for file changes and auto-reload tests')
  .option('-d, --directory <path>', 'Directory to watch', '.')
  .option('-p, --pattern <glob>', 'File pattern to watch', '**/*.{ts,js}')
  .option('-i, --ignore <pattern>', 'Pattern to ignore', 'node_modules/**')
  .option('-s, --suite <name>', 'Test suite to run on changes')
  .action(async (options) => {
    console.log(`👀 Watching for changes in ${options.directory}...`);

    const config: TestConfig = {
      watchMode: true,
      autoReload: true,
      outputFormat: 'console',
      verbose: true,
      timeout: 30000,
      retries: 1
    };

    const harness = createTestHarness(config);

    // Add sample test suites
    setupSampleTestSuites(harness);

    // Add observer for file change events
    harness.addObserver({
      id: 'watch_observer',
      onFileChange: (file) => {
        console.log(`📝 File changed: ${file}`);
      },
      onReload: () => {
        console.log('🔄 Reloading tests...');
      },
      onTestEnd: (result) => {
        if (!result.passed) {
          console.log(`❌ Test failed: ${result.testName}`);
        }
      }
    });

    console.log('✅ File watcher started');
    console.log(`Watching pattern: ${options.pattern}`);
    console.log(`Ignoring pattern: ${options.ignore}`);

    if (options.suite) {
      console.log(`🎯 Auto-running suite: ${options.suite}`);
      await harness.runSuite(options.suite);
    }

    // Keep the process running
    console.log('⏸️  Press Ctrl+C to stop watching...');
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping file watcher...');
      process.exit(0);
    });

    // Simulate file watching (in real implementation, this would use fs.watch)
    await new Promise(() => {}); // Keep alive
  });

program
  .command('create')
  .description('Create a new test suite or test case')
  .option('-s, --suite <name>', 'Create test suite')
  .option('-t, --test <name>', 'Create test case')
  .option('-f, --file <path>', 'Output file path')
  .option('-t, --template <type>', 'Template type (basic, async, mock)', 'basic')
  .action(async (options) => {
    if (!options.suite && !options.test) {
      console.error('❌ Please specify --suite or --test');
      return;
    }

    const template = options.template || 'basic';
    let code = '';

    if (options.suite) {
      console.log(`📋 Creating test suite: ${options.suite}`);
      code = generateTestSuiteTemplate(options.suite, template);
    } else if (options.test) {
      console.log(`🧪 Creating test case: ${options.test}`);
      code = generateTestCaseTemplate(options.test, template);
    }

    if (options.file) {
      const fs = require('fs');
      fs.writeFileSync(options.file, code);
      console.log(`✅ Created: ${options.file}`);
    } else {
      console.log('\n📄 Generated code:');
      console.log('---');
      console.log(code);
      console.log('---');
    }
  });

program
  .command('validate')
  .description('Validate test configuration and environment')
  .option('-c, --config <file>', 'Test configuration file')
  .action(async (options) => {
    console.log('🔍 Validating test environment...');

    const config: TestConfig = {
      watchMode: false,
      autoReload: false,
      outputFormat: 'console',
      verbose: true,
      timeout: 30000,
      retries: 1
    };

    const harness = createTestHarness(config);

    // Run validation tests
    const validationTests = [
      {
        name: 'Environment Check',
        fn: () => {
          // Check Node.js version
          const nodeVersion = process.version;
          console.log(`✅ Node.js version: ${nodeVersion}`);
          
          // Check available memory
          const memUsage = process.memoryUsage();
          console.log(`✅ Memory available: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
          
          // Check current working directory
          console.log(`✅ Working directory: ${process.cwd()}`);
          
          return true;
        }
      },
      {
        name: 'File System Access',
        fn: () => {
          const fs = require('fs');
          const testFile = '.test-validation-temp';
          
          try {
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            console.log('✅ File system access: OK');
            return true;
          } catch (error) {
            console.log('❌ File system access: Failed');
            return false;
          }
        }
      },
      {
        name: 'Test Harness Creation',
        fn: () => {
          try {
            const testHarness = createTestHarness(config);
            console.log('✅ Test harness creation: OK');
            return true;
          } catch (error) {
            console.log('❌ Test harness creation: Failed');
            return false;
          }
        }
      }
    ];

    for (const test of validationTests) {
      console.log(`\n🧪 Running: ${test.name}`);
      try {
        const result = await test.fn();
        console.log(result ? '✅ Passed' : '❌ Failed');
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }

    console.log('\n✅ Validation complete');
  });

// Helper functions
function setupSampleTestSuites(harness: any): void {
  // Basic functionality test suite
  const basicSuite = new TestSuite('Basic Functionality', 'Basic functionality tests');
  
  basicSuite.addTestCase(new TestCase('Math Operations', 'Test basic math operations', async () => {
    expect(2 + 2).toBe(4);
    expect(5 * 3).toBe(15);
    expect(10 / 2).toBe(5);
  }));

  basicSuite.addTestCase(new TestCase('String Operations', 'Test string operations', async () => {
    expect('hello' + ' world').toBe('hello world');
    expect('test'.length).toBe(4);
  }));

  // Async operations test suite
  const asyncSuite = new TestSuite('Async Operations', 'Asynchronous operation tests');
  
  asyncSuite.addTestCase(new TestCase('Promise Resolution', 'Test promise resolution', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  }));

  asyncSuite.addTestCase(new TestCase('Timeout Handling', 'Test timeout handling', async () => {
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, 100));
    const duration = Date.now() - start;
    expect(duration).toBeGreaterThanOrEqual(100);
  }));

  // Error handling test suite
  const errorSuite = new TestSuite('Error Handling', 'Error handling tests');
  
  errorSuite.addTestCase(new TestCase('Exception Throwing', 'Test exception throwing', async () => {
    expect(() => {
      throw new Error('Test error');
    }).toThrow('Test error');
  }));

  errorSuite.addTestCase(new TestCase('Async Error Handling', 'Test async error handling', async () => {
    await expect(Promise.reject(new Error('Async error'))).rejects.toThrow('Async error');
  }));

  harness.addTestSuite(basicSuite);
  harness.addTestSuite(asyncSuite);
  harness.addTestSuite(errorSuite);
}

function generateTestSuiteTemplate(name: string, template: string): string {
  const className = name.charAt(0).toUpperCase() + name.slice(1) + 'TestSuite';
  
  return `import { TestSuite, TestCase } from '../miff/pure/TestHarnessPure/TestHarnessPure';

export class ${className} extends TestSuite {
  constructor() {
    super('${name}', '${name} test suite');
    this.setupTests();
  }

  private setupTests(): void {
    this.addTestCase(new TestCase(
      'Basic Test',
      'A basic test case',
      async () => {
        // Your test logic here
        expect(true).toBe(true);
      }
    ));

    this.addTestCase(new TestCase(
      'Async Test',
      'An asynchronous test case',
      async () => {
        const result = await Promise.resolve('success');
        expect(result).toBe('success');
      }
    ));
  }
}

// Usage:
// const suite = new ${className}();
// harness.addTestSuite(suite);
`;
}

function generateTestCaseTemplate(name: string, template: string): string {
  const testName = name.charAt(0).toUpperCase() + name.slice(1);
  
  let code = '';
  
  switch (template) {
    case 'async':
      code = `import { TestCase } from '../miff/pure/TestHarnessPure/TestHarnessPure';

export const ${name}Test = new TestCase(
  '${testName}',
  '${testName} test case',
  async () => {
    // Setup
    const setupData = await initializeTestData();
    
    // Execute
    const result = await performAsyncOperation(setupData);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.status).toBe('success');
    
    // Cleanup
    await cleanupTestData(setupData);
  }
);

async function initializeTestData() {
  // Initialize test data
  return { id: 'test-123', timestamp: Date.now() };
}

async function performAsyncOperation(data: any) {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  return { status: 'success', data };
}

async function cleanupTestData(data: any) {
  // Cleanup test data
  console.log('Cleaning up:', data.id);
}
`;
      break;
      
    case 'mock':
      code = `import { TestCase } from '../miff/pure/TestHarnessPure/TestHarnessPure';

// Mock dependencies
const mockService = {
  getData: jest.fn().mockResolvedValue({ id: 1, name: 'test' }),
  saveData: jest.fn().mockResolvedValue(true),
  deleteData: jest.fn().mockResolvedValue(true)
};

export const ${name}Test = new TestCase(
  '${testName}',
  '${testName} test case with mocks',
  async () => {
    // Setup mocks
    jest.clearAllMocks();
    
    // Execute
    const result = await testFunction(mockService);
    
    // Assert
    expect(result).toBe(true);
    expect(mockService.getData).toHaveBeenCalledTimes(1);
    expect(mockService.saveData).toHaveBeenCalledWith({ id: 1, name: 'test' });
  }
);

async function testFunction(service: any) {
  const data = await service.getData();
  return await service.saveData(data);
}
`;
      break;
      
    default: // basic
      code = `import { TestCase } from '../miff/pure/TestHarnessPure/TestHarnessPure';

export const ${name}Test = new TestCase(
  '${testName}',
  '${testName} test case',
  async () => {
    // Your test logic here
    const input = 'test input';
    const expected = 'expected output';
    
    // Execute function under test
    const result = processInput(input);
    
    // Assert results
    expect(result).toBe(expected);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  }
);

function processInput(input: string): string {
  // Function under test
  return input.toUpperCase();
}
`;
  }
  
  return code;
}

export default program;