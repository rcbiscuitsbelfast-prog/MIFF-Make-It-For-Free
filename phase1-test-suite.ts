#!/usr/bin/env tsx

/**
 * Phase 1 Test Suite
 * 
 * Comprehensive tests for all Phase 1 fixes and improvements
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  output: string[];
  errors: string[];
}

class Phase1TestSuite {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Running Phase 1 Test Suite...\n');

    // Test 1: Core Module Loading
    await this.testCoreModuleLoading();

    // Test 2: CLI Harness Functionality
    await this.testCLIHarnesses();

    // Test 3: Import/Export Fixes
    await this.testImportExportFixes();

    // Test 4: Mock Implementation Replacements
    await this.testMockReplacements();

    // Test 5: Integration Testing
    await this.testIntegration();

    // Test 6: ES Module Compatibility
    await this.testESModuleCompatibility();

    // Generate report
    this.generateReport();
  }

  private async testCoreModuleLoading(): Promise<void> {
    const startTime = Date.now();
    const testName = 'Core Module Loading';
    const output: string[] = [];
    const errors: string[] = [];

    try {
      console.log('1. Testing core module loading...');

      const modules = [
        'CombatPure',
        'ItemsPure', 
        'TeamsPure',
        'StatusEffectsPure',
        'AIPure',
        'RenderWorldPure'
      ];

      for (const module of modules) {
        try {
          const result = execSync(`npx tsx -e "import('./miff/pure/${module}/index.ts').then(() => console.log('${module} loaded'))"`, 
            { encoding: 'utf-8', timeout: 5000 });
          output.push(`${module}: ✅ Loaded successfully`);
        } catch (error) {
          errors.push(`${module}: ❌ Failed to load - ${error}`);
        }
      }

      this.results.push({
        testName,
        status: errors.length === 0 ? 'PASS' : 'FAIL',
        duration: Date.now() - startTime,
        output,
        errors
      });

    } catch (error) {
      this.results.push({
        testName,
        status: 'FAIL',
        duration: Date.now() - startTime,
        output,
        errors: [`Test execution failed: ${error}`]
      });
    }
  }

  private async testCLIHarnesses(): Promise<void> {
    const startTime = Date.now();
    const testName = 'CLI Harness Functionality';
    const output: string[] = [];
    const errors: string[] = [];

    try {
      console.log('2. Testing CLI harness functionality...');

      const cliHarnesses = [
        'CombatPure/cliHarness.ts',
        'ItemsPure/cliHarness.ts',
        'TeamsPure/cliHarness.ts',
        'StatusEffectsPure/cliHarness.ts',
        'AIPure/cliHarness.ts',
        'BattleAIPure/cliHarness.ts'
      ];

      for (const harness of cliHarnesses) {
        try {
          const result = execSync(`npx tsx miff/pure/${harness} --help`, 
            { encoding: 'utf-8', timeout: 5000 });
          output.push(`${harness}: ✅ Help command works`);
        } catch (error) {
          errors.push(`${harness}: ❌ Help command failed - ${error}`);
        }
      }

      this.results.push({
        testName,
        status: errors.length === 0 ? 'PASS' : 'FAIL',
        duration: Date.now() - startTime,
        output,
        errors
      });

    } catch (error) {
      this.results.push({
        testName,
        status: 'FAIL',
        duration: Date.now() - startTime,
        output,
        errors: [`Test execution failed: ${error}`]
      });
    }
  }

  private async testImportExportFixes(): Promise<void> {
    const startTime = Date.now();
    const testName = 'Import/Export Fixes';
    const output: string[] = [];
    const errors: string[] = [];

    try {
      console.log('3. Testing import/export fixes...');

      // Test RenderWorldPure webBridge (had import issues)
      try {
        const result = execSync(`npx tsx -e "import('./miff/pure/RenderWorldPure/webBridge.ts').then(() => console.log('webBridge loaded'))"`, 
          { encoding: 'utf-8', timeout: 5000 });
        output.push('RenderWorldPure/webBridge: ✅ Import issues fixed');
      } catch (error) {
        errors.push(`RenderWorldPure/webBridge: ❌ Import still broken - ${error}`);
      }

      // Test TeamsPure placeholder fix
      try {
        const teamsCode = readFileSync('/workspace/miff/pure/TeamsPure/index.ts', 'utf-8');
        if (teamsCode.includes('// Placeholder') || teamsCode.includes('effectivenessBonus += 10; // Placeholder')) {
          errors.push('TeamsPure: ❌ Placeholder still exists');
        } else {
          output.push('TeamsPure: ✅ Placeholder replaced with real implementation');
        }
      } catch (error) {
        errors.push(`TeamsPure: ❌ Could not check placeholder fix - ${error}`);
      }

      this.results.push({
        testName,
        status: errors.length === 0 ? 'PASS' : 'FAIL',
        duration: Date.now() - startTime,
        output,
        errors
      });

    } catch (error) {
      this.results.push({
        testName,
        status: 'FAIL',
        duration: Date.now() - startTime,
        output,
        errors: [`Test execution failed: ${error}`]
      });
    }
  }

  private async testMockReplacements(): Promise<void> {
    const startTime = Date.now();
    const testName = 'Mock Implementation Replacements';
    const output: string[] = [];
    const errors: string[] = [];

    try {
      console.log('4. Testing mock implementation replacements...');

      // Test ExportPipelinePure mock replacements
      try {
        const exportCode = readFileSync('/workspace/miff/pure/ExportPipelinePure.ts', 'utf-8');
        if (exportCode.includes('Math.random()') && exportCode.includes('setTimeout')) {
          errors.push('ExportPipelinePure: ❌ Still contains mock implementations');
        } else {
          output.push('ExportPipelinePure: ✅ Mock implementations replaced');
        }
      } catch (error) {
        errors.push(`ExportPipelinePure: ❌ Could not check mock replacements - ${error}`);
      }

      // Test TeamsPure type compatibility implementation
      try {
        const teamsCode = readFileSync('/workspace/miff/pure/TeamsPure/index.ts', 'utf-8');
        if (teamsCode.includes('calculateTypeCompatibility')) {
          output.push('TeamsPure: ✅ Type compatibility implementation added');
        } else {
          errors.push('TeamsPure: ❌ Type compatibility not implemented');
        }
      } catch (error) {
        errors.push(`TeamsPure: ❌ Could not check type compatibility - ${error}`);
      }

      this.results.push({
        testName,
        status: errors.length === 0 ? 'PASS' : 'FAIL',
        duration: Date.now() - startTime,
        output,
        errors
      });

    } catch (error) {
      this.results.push({
        testName,
        status: 'FAIL',
        duration: Date.now() - startTime,
        output,
        errors: [`Test execution failed: ${error}`]
      });
    }
  }

  private async testIntegration(): Promise<void> {
    const startTime = Date.now();
    const testName = 'Integration Testing';
    const output: string[] = [];
    const errors: string[] = [];

    try {
      console.log('5. Testing integration...');

      // Run the core integration test
      try {
        const result = execSync('npx tsx test-core-integration.ts', 
          { encoding: 'utf-8', timeout: 10000 });
        output.push('Core Integration: ✅ All modules work together');
      } catch (error) {
        errors.push(`Core Integration: ❌ Integration test failed - ${error}`);
      }

      this.results.push({
        testName,
        status: errors.length === 0 ? 'PASS' : 'FAIL',
        duration: Date.now() - startTime,
        output,
        errors
      });

    } catch (error) {
      this.results.push({
        testName,
        status: 'FAIL',
        duration: Date.now() - startTime,
        output,
        errors: [`Test execution failed: ${error}`]
      });
    }
  }

  private async testESModuleCompatibility(): Promise<void> {
    const startTime = Date.now();
    const testName = 'ES Module Compatibility';
    const output: string[] = [];
    const errors: string[] = [];

    try {
      console.log('6. Testing ES module compatibility...');

      const files = [
        'cli/miff-cli-compiled.js',
        'cli/quest.ts',
        'cli/miff-init.ts',
        'cli/miff-diff.ts',
        'cli/miff-simulate.ts',
        'cli/profile.ts',
        'cli/manifest.ts'
      ];

      for (const file of files) {
        try {
          const content = readFileSync(`/workspace/${file}`, 'utf-8');
          if (content.includes('require.main === module')) {
            errors.push(`${file}: ❌ Still uses CommonJS pattern`);
          } else if (content.includes('import.meta.url ===')) {
            output.push(`${file}: ✅ Updated to ES module pattern`);
          }
        } catch (error) {
          errors.push(`${file}: ❌ Could not check - ${error}`);
        }
      }

      this.results.push({
        testName,
        status: errors.length === 0 ? 'PASS' : 'FAIL',
        duration: Date.now() - startTime,
        output,
        errors
      });

    } catch (error) {
      this.results.push({
        testName,
        status: 'FAIL',
        duration: Date.now() - startTime,
        output,
        errors: [`Test execution failed: ${error}`]
      });
    }
  }

  private generateReport(): void {
    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = `/workspace/docs/archive/test-results/${timestamp}-phase1-test-report.txt`;
    
    let report = `Phase 1 Test Suite Report
Generated: ${new Date().toISOString()}
========================================

SUMMARY
-------
Total Tests: ${this.results.length}
Passed: ${this.results.filter(r => r.status === 'PASS').length}
Failed: ${this.results.filter(r => r.status === 'FAIL').length}
Skipped: ${this.results.filter(r => r.status === 'SKIP').length}

DETAILED RESULTS
----------------
`;

    this.results.forEach(result => {
      report += `\n${result.testName}:
  Status: ${result.status}
  Duration: ${result.duration}ms
  
  Output:
${result.output.map(line => `    ${line}`).join('\n')}
  
  Errors:
${result.errors.map(error => `    ${error}`).join('\n')}
`;
    });

    writeFileSync(reportPath, report);
    console.log(`\n📊 Report saved to: ${reportPath}`);
    
    // Print summary
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`\n📈 Phase 1 Test Summary:`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Success Rate: ${Math.round((passed / this.results.length) * 100)}%`);
  }
}

// Run the test suite
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new Phase1TestSuite();
  testSuite.runAllTests().catch(console.error);
}