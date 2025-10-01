#!/usr/bin/env tsx

/**
 * MIFF Integration Testing Framework
 * 
 * Tests all module combinations systematically
 * Validates cross-module interactions and dependencies
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

interface IntegrationTest {
  testName: string;
  modules: string[];
  testType: 'cli' | 'api' | 'data-flow' | 'dependency';
  status: 'PASS' | 'FAIL' | 'SKIP' | 'ERROR';
  duration: number;
  output: string[];
  errors: string[];
  warnings: string[];
  dependencies: string[];
  interactions: string[];
}

interface IntegrationSuite {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  errors: number;
  totalDuration: number;
  tests: IntegrationTest[];
  moduleMatrix: { [key: string]: string[] };
  criticalPaths: string[][];
  brokenIntegrations: string[];
}

class IntegrationTestingFramework {
  private results: IntegrationSuite;
  private coreModules = [
    'CombatPure',
    'ItemsPure', 
    'TeamsPure',
    'StatusEffectsPure',
    'AIPure',
    'RenderWorldPure',
    'WebSocketBridgePure',
    'ExportPipelinePure',
    'WebBridgePure',
    'DialogueSystemPure',
    'NPCsPure',
    'QuestsPure',
    'LocationPure',
    'EventBusPure',
    'RhythmSystemPure',
    'WorldManifestPure',
    'TestSystemPure',
    'InputSystemPure',
    'ZoneSystemPure',
    'RemixSystemPure',
    'UISystemPure'
  ];

  constructor() {
    this.results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: 0,
      totalDuration: 0,
      tests: [],
      moduleMatrix: {},
      criticalPaths: [],
      brokenIntegrations: []
    };
  }

  async runAllIntegrationTests(): Promise<IntegrationSuite> {
    console.log('🔗 Starting Integration Testing Framework...');
    
    // Build module matrix
    await this.buildModuleMatrix();
    
    // Test critical integration paths
    await this.testCriticalPaths();
    
    // Test module combinations
    await this.testModuleCombinations();
    
    // Test dependency chains
    await this.testDependencyChains();
    
    // Analyze results
    this.analyzeResults();
    
    console.log('✅ Integration testing complete!');
    return this.results;
  }

  private async buildModuleMatrix(): Promise<void> {
    console.log('📊 Building module dependency matrix...');
    
    for (const module of this.coreModules) {
      this.results.moduleMatrix[module] = await this.getModuleDependencies(module);
    }
  }

  private async getModuleDependencies(moduleName: string): Promise<string[]> {
    const dependencies: string[] = [];
    
    try {
      // Look for module files
      const modulePaths = [
        `/workspace/miff/pure/${moduleName}/index.ts`,
        `/workspace/miff/pure/${moduleName}.ts`,
        `/workspace/miff/pure/${moduleName}/cliHarness.ts`
      ];
      
      for (const path of modulePaths) {
        if (existsSync(path)) {
          const content = readFileSync(path, 'utf-8');
          const deps = this.extractDependencies(content);
          dependencies.push(...deps);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not analyze dependencies for ${moduleName}: ${error}`);
    }
    
    return [...new Set(dependencies)];
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    
    // ES6 imports
    const es6Imports = content.match(/import\s+.*from\s+['"]([^'"]+)['"]/g);
    if (es6Imports) {
      es6Imports.forEach(imp => {
        const match = imp.match(/from\s+['"]([^'"]+)['"]/);
        if (match) {
          const dep = match[1];
          // Extract module name from path
          const moduleName = dep.split('/').pop()?.replace('.ts', '') || dep;
          if (this.coreModules.includes(moduleName)) {
            dependencies.push(moduleName);
          }
        }
      });
    }
    
    return dependencies;
  }

  private async testCriticalPaths(): Promise<void> {
    console.log('🎯 Testing critical integration paths...');
    
    // Define critical paths
    const criticalPaths = [
      ['CombatPure', 'ItemsPure', 'TeamsPure'],
      ['CombatPure', 'StatusEffectsPure', 'AIPure'],
      ['RenderWorldPure', 'DialogueSystemPure', 'NPCsPure'],
      ['ExportPipelinePure', 'WebBridgePure', 'RenderWorldPure'],
      ['EventBusPure', 'CombatPure', 'ItemsPure', 'TeamsPure'],
      ['QuestsPure', 'NPCsPure', 'DialogueSystemPure'],
      ['WorldManifestPure', 'LocationPure', 'ZoneSystemPure'],
      ['InputSystemPure', 'UISystemPure', 'RenderWorldPure'],
      ['TestSystemPure', 'CombatPure', 'ItemsPure'],
      ['RemixSystemPure', 'RhythmSystemPure', 'InputSystemPure']
    ];
    
    this.results.criticalPaths = criticalPaths;
    
    for (const path of criticalPaths) {
      await this.testIntegrationPath(path, 'critical');
    }
  }

  private async testModuleCombinations(): Promise<void> {
    console.log('🔄 Testing module combinations...');
    
    // Test all pairs
    for (let i = 0; i < this.coreModules.length; i++) {
      for (let j = i + 1; j < this.coreModules.length; j++) {
        const module1 = this.coreModules[i];
        const module2 = this.coreModules[j];
        await this.testIntegrationPath([module1, module2], 'pair');
      }
    }
    
    // Test triplets
    for (let i = 0; i < this.coreModules.length; i++) {
      for (let j = i + 1; j < this.coreModules.length; j++) {
        for (let k = j + 1; k < this.coreModules.length; k++) {
          const module1 = this.coreModules[i];
          const module2 = this.coreModules[j];
          const module3 = this.coreModules[k];
          await this.testIntegrationPath([module1, module2, module3], 'triplet');
        }
      }
    }
  }

  private async testDependencyChains(): Promise<void> {
    console.log('⛓️  Testing dependency chains...');
    
    // Find dependency chains
    const chains = this.findDependencyChains();
    
    for (const chain of chains) {
      await this.testIntegrationPath(chain, 'dependency');
    }
  }

  private findDependencyChains(): string[][] {
    const chains: string[][] = [];
    const visited = new Set<string>();
    
    for (const module of this.coreModules) {
      if (!visited.has(module)) {
        const chain = this.buildDependencyChain(module, visited);
        if (chain.length > 1) {
          chains.push(chain);
        }
      }
    }
    
    return chains;
  }

  private buildDependencyChain(module: string, visited: Set<string>): string[] {
    if (visited.has(module)) {
      return [];
    }
    
    visited.add(module);
    const chain = [module];
    const dependencies = this.results.moduleMatrix[module] || [];
    
    for (const dep of dependencies) {
      if (this.coreModules.includes(dep)) {
        const subChain = this.buildDependencyChain(dep, visited);
        chain.unshift(...subChain);
      }
    }
    
    return chain;
  }

  private async testIntegrationPath(modules: string[], testType: string): Promise<void> {
    const startTime = Date.now();
    const testName = `${testType}_${modules.join('_')}`;
    
    console.log(`  Testing: ${testName}`);
    
    const test: IntegrationTest = {
      testName,
      modules,
      testType: testType as any,
      status: 'SKIP',
      duration: 0,
      output: [],
      errors: [],
      warnings: [],
      dependencies: [],
      interactions: []
    };

    try {
      // Test module loading
      await this.testModuleLoading(modules, test);
      
      // Test CLI interactions
      await this.testCLIInteractions(modules, test);
      
      // Test data flow
      await this.testDataFlow(modules, test);
      
      // Test API interactions
      await this.testAPIInteractions(modules, test);
      
      test.duration = Date.now() - startTime;
      
      // Determine status
      if (test.errors.length > 0) {
        test.status = 'ERROR';
        this.results.errors++;
      } else if (test.warnings.length > 0) {
        test.status = 'FAIL';
        this.results.failed++;
      } else {
        test.status = 'PASS';
        this.results.passed++;
      }
      
    } catch (error) {
      test.status = 'ERROR';
      test.errors.push(`Integration test failed: ${error}`);
      test.duration = Date.now() - startTime;
      this.results.errors++;
    }
    
    this.results.tests.push(test);
    this.results.totalTests++;
    this.results.totalDuration += test.duration;
  }

  private async testModuleLoading(modules: string[], test: IntegrationTest): Promise<void> {
    for (const module of modules) {
      try {
        const modulePath = this.findModulePath(module);
        if (modulePath) {
          const loadResult = this.runModuleLoad(modulePath);
          if (loadResult.success) {
            test.output.push(`${module}: Loaded successfully`);
          } else {
            test.errors.push(`${module}: Load failed - ${loadResult.error}`);
          }
        } else {
          test.warnings.push(`${module}: Module file not found`);
        }
      } catch (error) {
        test.errors.push(`${module}: Loading error - ${error}`);
      }
    }
  }

  private async testCLIInteractions(modules: string[], test: IntegrationTest): Promise<void> {
    for (const module of modules) {
      try {
        const cliPath = this.findCLIPath(module);
        if (cliPath) {
          const cliResult = this.runCLICommand(cliPath, ['--help']);
          if (cliResult.success) {
            test.output.push(`${module} CLI: Available`);
            test.interactions.push(`${module}:CLI`);
          } else {
            test.warnings.push(`${module} CLI: ${cliResult.error}`);
          }
        } else {
          test.warnings.push(`${module}: No CLI harness found`);
        }
      } catch (error) {
        test.warnings.push(`${module} CLI: ${error}`);
      }
    }
  }

  private async testDataFlow(modules: string[], test: IntegrationTest): Promise<void> {
    // Test data flow between modules
    for (let i = 0; i < modules.length - 1; i++) {
      const module1 = modules[i];
      const module2 = modules[i + 1];
      
      try {
        // Check if modules can share data
        const canShareData = this.checkDataCompatibility(module1, module2);
        if (canShareData) {
          test.output.push(`Data flow ${module1} -> ${module2}: Compatible`);
          test.interactions.push(`${module1}:${module2}:data`);
        } else {
          test.warnings.push(`Data flow ${module1} -> ${module2}: Incompatible`);
        }
      } catch (error) {
        test.warnings.push(`Data flow ${module1} -> ${module2}: ${error}`);
      }
    }
  }

  private async testAPIInteractions(modules: string[], test: IntegrationTest): Promise<void> {
    // Test API interactions between modules
    for (let i = 0; i < modules.length; i++) {
      for (let j = i + 1; j < modules.length; j++) {
        const module1 = modules[i];
        const module2 = modules[j];
        
        try {
          const hasAPI = this.checkAPICompatibility(module1, module2);
          if (hasAPI) {
            test.output.push(`API ${module1} <-> ${module2}: Compatible`);
            test.interactions.push(`${module1}:${module2}:api`);
          } else {
            test.warnings.push(`API ${module1} <-> ${module2}: No API compatibility`);
          }
        } catch (error) {
          test.warnings.push(`API ${module1} <-> ${module2}: ${error}`);
        }
      }
    }
  }

  private findModulePath(moduleName: string): string | null {
    const paths = [
      `/workspace/miff/pure/${moduleName}/index.ts`,
      `/workspace/miff/pure/${moduleName}.ts`
    ];
    
    for (const path of paths) {
      if (existsSync(path)) {
        return path;
      }
    }
    
    return null;
  }

  private findCLIPath(moduleName: string): string | null {
    const paths = [
      `/workspace/miff/pure/${moduleName}/cliHarness.ts`,
      `/workspace/cli/${moduleName.toLowerCase()}.ts`
    ];
    
    for (const path of paths) {
      if (existsSync(path)) {
        return path;
      }
    }
    
    return null;
  }

  private runModuleLoad(modulePath: string): { success: boolean; output: string[]; error: string } {
    try {
      const command = `npx tsx -e "import('${modulePath}').then(m => console.log('Module loaded:', Object.keys(m))).catch(e => console.error('Error:', e.message))"`;
      const output = execSync(command, { 
        timeout: 5000,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      return {
        success: true,
        output: output.split('\n').filter(line => line.trim()),
        error: ''
      };
    } catch (error: any) {
      return {
        success: false,
        output: [],
        error: error.message || 'Unknown error'
      };
    }
  }

  private runCLICommand(cliPath: string, args: string[]): { success: boolean; output: string[]; error: string } {
    try {
      const command = `npx tsx "${cliPath}" ${args.join(' ')}`;
      const output = execSync(command, { 
        timeout: 5000,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      return {
        success: true,
        output: output.split('\n').filter(line => line.trim()),
        error: ''
      };
    } catch (error: any) {
      return {
        success: false,
        output: [],
        error: error.message || 'Unknown error'
      };
    }
  }

  private checkDataCompatibility(module1: string, module2: string): boolean {
    // Simple compatibility check based on module types
    const combatModules = ['CombatPure', 'ItemsPure', 'TeamsPure', 'StatusEffectsPure'];
    const renderModules = ['RenderWorldPure', 'UISystemPure', 'DialogueSystemPure'];
    const systemModules = ['EventBusPure', 'TestSystemPure', 'InputSystemPure'];
    
    const module1Type = this.getModuleType(module1);
    const module2Type = this.getModuleType(module2);
    
    return module1Type === module2Type || 
           (module1Type === 'combat' && module2Type === 'combat') ||
           (module1Type === 'render' && module2Type === 'render') ||
           (module1Type === 'system' && module2Type === 'system');
  }

  private checkAPICompatibility(module1: string, module2: string): boolean {
    // Check if modules have compatible APIs
    const deps1 = this.results.moduleMatrix[module1] || [];
    const deps2 = this.results.moduleMatrix[module2] || [];
    
    return deps1.includes(module2) || deps2.includes(module1);
  }

  private getModuleType(moduleName: string): string {
    if (['CombatPure', 'ItemsPure', 'TeamsPure', 'StatusEffectsPure'].includes(moduleName)) {
      return 'combat';
    }
    if (['RenderWorldPure', 'UISystemPure', 'DialogueSystemPure'].includes(moduleName)) {
      return 'render';
    }
    if (['EventBusPure', 'TestSystemPure', 'InputSystemPure'].includes(moduleName)) {
      return 'system';
    }
    return 'other';
  }

  private analyzeResults(): void {
    // Find broken integrations
    this.results.brokenIntegrations = this.results.tests
      .filter(test => test.status === 'ERROR' || test.status === 'FAIL')
      .map(test => test.testName);
  }

  generateReport(): string {
    const timestamp = new Date().toISOString().split('T')[0];
    
    let report = `MIFF Integration Testing Framework Report
Generated: ${new Date().toISOString()}
========================================

SUMMARY
-------
Total Integration Tests: ${this.results.totalTests}
Passed: ${this.results.passed}
Failed: ${this.results.failed}
Skipped: ${this.results.skipped}
Errors: ${this.results.errors}
Total Duration: ${this.results.totalDuration}ms

Module Matrix:
${Object.entries(this.results.moduleMatrix).map(([module, deps]) => 
  `  ${module}: ${deps.join(', ') || 'No dependencies'}`
).join('\n')}

Critical Paths:
${this.results.criticalPaths.map(path => `  ${path.join(' -> ')}`).join('\n')}

Broken Integrations:
${this.results.brokenIntegrations.map(integration => `  ${integration}`).join('\n')}

DETAILED TEST RESULTS
--------------------
`;

    this.results.tests.forEach(test => {
      report += `\n${test.testName}:
  Modules: ${test.modules.join(', ')}
  Type: ${test.testType}
  Status: ${test.status}
  Duration: ${test.duration}ms
  Interactions: ${test.interactions.join(', ') || 'None'}
  
  Output:
${test.output.map(line => `    ${line}`).join('\n')}
  
  Errors:
${test.errors.map(error => `    ${error}`).join('\n')}
  
  Warnings:
${test.warnings.map(warning => `    ${warning}`).join('\n')}
`;
    });

    return report;
  }
}

// Main execution
async function main() {
  const framework = new IntegrationTestingFramework();
  const results = await framework.runAllIntegrationTests();
  
  // Generate and save report
  const report = framework.generateReport();
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = `/workspace/docs/archive/test-results/${timestamp}-integration-testing-report.txt`;
  
  // Ensure directory exists
  const fs = await import('fs');
  const path = await import('path');
  const dir = path.dirname(reportPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, report);
  
  console.log(`\n📊 Report saved to: ${reportPath}`);
  console.log(`\n📈 Summary:`);
  console.log(`   Total Tests: ${results.totalTests}`);
  console.log(`   Passed: ${results.passed}`);
  console.log(`   Failed: ${results.failed}`);
  console.log(`   Errors: ${results.errors}`);
  console.log(`   Broken Integrations: ${results.brokenIntegrations.length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}