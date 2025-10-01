#!/usr/bin/env tsx

/**
 * MIFF Systematic Testing Framework
 * 
 * Tests every module's CLI harness systematically
 * Validates module functionality and integration points
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

interface TestResult {
  moduleName: string;
  modulePath: string;
  cliPath?: string;
  status: 'PASS' | 'FAIL' | 'SKIP' | 'ERROR';
  duration: number;
  output: string[];
  errors: string[];
  warnings: string[];
  hasCLI: boolean;
  hasTestMethod: boolean;
  cliCommands: string[];
  moduleExports: string[];
  dependencies: string[];
  implementationStatus: 'real' | 'scaffolded' | 'broken' | 'unknown';
}

interface TestSuite {
  totalModules: number;
  passed: number;
  failed: number;
  skipped: number;
  errors: number;
  totalDuration: number;
  results: TestResult[];
  summary: {
    modulesWithCLI: number;
    modulesWithoutCLI: number;
    realModules: number;
    scaffoldedModules: number;
    brokenModules: number;
    cliCommandsTested: number;
    averageTestDuration: number;
  };
}

class SystematicTestingFramework {
  private results: TestSuite;
  private modulePaths: string[] = [];
  private timeoutMs = 10000; // 10 second timeout per test

  constructor() {
    this.results = {
      totalModules: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: 0,
      totalDuration: 0,
      results: [],
      summary: {
        modulesWithCLI: 0,
        modulesWithoutCLI: 0,
        realModules: 0,
        scaffoldedModules: 0,
        brokenModules: 0,
        cliCommandsTested: 0,
        averageTestDuration: 0
      }
    };
  }

  async runAllTests(): Promise<TestSuite> {
    console.log('🧪 Starting Systematic Testing Framework...');
    
    // Discover all modules
    await this.discoverModules();
    
    console.log(`📦 Found ${this.modulePaths.length} modules to test`);
    
    // Test each module
    for (const modulePath of this.modulePaths) {
      await this.testModule(modulePath);
    }
    
    // Analyze results
    this.analyzeResults();
    
    console.log('✅ Testing complete!');
    return this.results;
  }

  private async discoverModules(): Promise<void> {
    const pureDir = '/workspace/miff/pure';
    const cliDir = '/workspace/cli';
    
    // Find all Pure modules
    try {
      const pureModules = await this.findModulesInDirectory(pureDir);
      this.modulePaths.push(...pureModules);
    } catch (error) {
      console.warn(`⚠️  Could not scan pure modules: ${error}`);
    }
    
    // Find CLI modules
    try {
      const cliModules = await this.findModulesInDirectory(cliDir);
      this.modulePaths.push(...cliModules);
    } catch (error) {
      console.warn(`⚠️  Could not scan CLI modules: ${error}`);
    }
  }

  private async findModulesInDirectory(dir: string): Promise<string[]> {
    const modules: string[] = [];
    
    try {
      const fs = await import('fs');
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Check for index.ts or main module file
          const indexPath = join(fullPath, 'index.ts');
          const cliPath = join(fullPath, 'cliHarness.ts');
          
          if (fs.existsSync(indexPath)) {
            modules.push(indexPath);
          }
          if (fs.existsSync(cliPath)) {
            modules.push(cliPath);
          }
          
          // Recursively search subdirectories
          const subModules = await this.findModulesInDirectory(fullPath);
          modules.push(...subModules);
        } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
          modules.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not scan directory ${dir}: ${error}`);
    }
    
    return modules;
  }

  private async testModule(modulePath: string): Promise<void> {
    const startTime = Date.now();
    const moduleName = this.extractModuleName(modulePath);
    
    console.log(`🔍 Testing ${moduleName}...`);
    
    const result: TestResult = {
      moduleName,
      modulePath,
      status: 'SKIP',
      duration: 0,
      output: [],
      errors: [],
      warnings: [],
      hasCLI: false,
      hasTestMethod: false,
      cliCommands: [],
      moduleExports: [],
      dependencies: [],
      implementationStatus: 'unknown'
    };

    try {
      // Analyze module content
      await this.analyzeModule(modulePath, result);
      
      // Test CLI if available
      if (result.hasCLI) {
        await this.testCLI(modulePath, result);
      }
      
      // Test module loading
      await this.testModuleLoading(modulePath, result);
      
      result.duration = Date.now() - startTime;
      
      // Determine final status
      if (result.errors.length > 0) {
        result.status = 'ERROR';
        this.results.errors++;
      } else if (result.warnings.length > 0) {
        result.status = 'FAIL';
        this.results.failed++;
      } else if (result.status === 'SKIP') {
        result.status = 'PASS';
        this.results.passed++;
      }
      
    } catch (error) {
      result.status = 'ERROR';
      result.errors.push(`Test execution failed: ${error}`);
      result.duration = Date.now() - startTime;
      this.results.errors++;
    }
    
    this.results.results.push(result);
    this.results.totalModules++;
    this.results.totalDuration += result.duration;
  }

  private async analyzeModule(modulePath: string, result: TestResult): Promise<void> {
    try {
      const fs = await import('fs');
      const content = fs.readFileSync(modulePath, 'utf-8');
      
      // Check for CLI indicators
      result.hasCLI = this.hasCLIIndicators(content);
      result.hasTestMethod = this.hasTestMethod(content);
      
      // Extract exports and dependencies
      result.moduleExports = this.extractExports(content);
      result.dependencies = this.extractDependencies(content);
      
      // Determine implementation status
      result.implementationStatus = this.determineImplementationStatus(content, result);
      
      // Look for CLI commands
      if (result.hasCLI) {
        result.cliCommands = this.extractCLICommands(content);
      }
      
    } catch (error) {
      result.errors.push(`Module analysis failed: ${error}`);
    }
  }

  private async testCLI(modulePath: string, result: TestResult): Promise<void> {
    try {
      // Try to run CLI with help command
      const cliPath = modulePath.endsWith('cliHarness.ts') ? modulePath : 
                     modulePath.replace('index.ts', 'cliHarness.ts');
      
      if (existsSync(cliPath)) {
        result.cliPath = cliPath;
        
        // Test help command
        const helpOutput = this.runCLICommand(cliPath, ['--help']);
        if (helpOutput.success) {
          result.output.push('Help command: SUCCESS');
          result.output.push(...helpOutput.output);
        } else {
          result.errors.push(`Help command failed: ${helpOutput.error}`);
        }
        
        // Test other common commands
        const commands = ['test', 'status', 'info', 'version'];
        for (const cmd of commands) {
          const cmdOutput = this.runCLICommand(cliPath, [cmd]);
          if (cmdOutput.success) {
            result.output.push(`${cmd} command: SUCCESS`);
          } else {
            result.warnings.push(`${cmd} command: ${cmdOutput.error}`);
          }
        }
        
      } else {
        result.warnings.push('CLI harness file not found');
      }
      
    } catch (error) {
      result.errors.push(`CLI testing failed: ${error}`);
    }
  }

  private async testModuleLoading(modulePath: string, result: TestResult): Promise<void> {
    try {
      // Try to load the module
      const loadOutput = this.runModuleLoad(modulePath);
      if (loadOutput.success) {
        result.output.push('Module loading: SUCCESS');
        result.output.push(...loadOutput.output);
      } else {
        result.errors.push(`Module loading failed: ${loadOutput.error}`);
      }
      
    } catch (error) {
      result.errors.push(`Module loading test failed: ${error}`);
    }
  }

  private hasCLIIndicators(content: string): boolean {
    return /#!/.test(content) ||
           /process\.argv/.test(content) ||
           /commander/.test(content) ||
           /Command/.test(content) ||
           /cliHarness/.test(content);
  }

  private hasTestMethod(content: string): boolean {
    return /test\s*\(/.test(content) ||
           /\.test\s*\(/.test(content) ||
           /describe\s*\(/.test(content) ||
           /it\s*\(/.test(content);
  }

  private extractExports(content: string): string[] {
    const exports: string[] = [];
    
    // ES6 exports
    const es6Exports = content.match(/export\s+(default\s+)?(class|interface|type|function|const|let|var)\s+(\w+)/g);
    if (es6Exports) {
      es6Exports.forEach(exp => {
        const match = exp.match(/(class|interface|type|function|const|let|var)\s+(\w+)/);
        if (match) exports.push(match[2]);
      });
    }
    
    return [...new Set(exports)];
  }

  private extractDependencies(content: string): string[] {
    const imports: string[] = [];
    
    // ES6 imports
    const es6Imports = content.match(/import\s+.*from\s+['"]([^'"]+)['"]/g);
    if (es6Imports) {
      es6Imports.forEach(imp => {
        const match = imp.match(/from\s+['"]([^'"]+)['"]/);
        if (match) imports.push(match[1]);
      });
    }
    
    return [...new Set(imports)];
  }

  private extractCLICommands(content: string): string[] {
    const commands: string[] = [];
    
    // Look for command definitions
    const commandMatches = content.match(/\.command\s*\(\s*['"]([^'"]+)['"]/g);
    if (commandMatches) {
      commandMatches.forEach(match => {
        const cmdMatch = match.match(/['"]([^'"]+)['"]/);
        if (cmdMatch) commands.push(cmdMatch[1]);
      });
    }
    
    // Look for help text patterns
    const helpMatches = content.match(/Usage:\s*([^\n]+)/g);
    if (helpMatches) {
      helpMatches.forEach(match => {
        const usageMatch = match.match(/Usage:\s*([^\n]+)/);
        if (usageMatch) {
          const usage = usageMatch[1].trim();
          const parts = usage.split(/\s+/);
          parts.forEach(part => {
            if (part.startsWith('-') || part.startsWith('<') || part.startsWith('[')) {
              commands.push(part);
            }
          });
        }
      });
    }
    
    return [...new Set(commands)];
  }

  private determineImplementationStatus(content: string, result: TestResult): 'real' | 'scaffolded' | 'broken' | 'unknown' {
    // Check for broken indicators
    if (result.errors.length > 0 || content.includes('throw new Error')) {
      return 'broken';
    }
    
    // Check for scaffolded indicators
    if (content.includes('TODO') || 
        content.includes('FIXME') || 
        content.includes('mock') ||
        content.includes('simulate') ||
        result.moduleExports.length === 0) {
      return 'scaffolded';
    }
    
    // Check for real implementation indicators
    if (result.moduleExports.length > 0 && 
        result.dependencies.length > 0 && 
        !content.includes('TODO') &&
        !content.includes('mock')) {
      return 'real';
    }
    
    return 'unknown';
  }

  private runCLICommand(cliPath: string, args: string[]): { success: boolean; output: string[]; error: string } {
    try {
      const command = `npx tsx "${cliPath}" ${args.join(' ')}`;
      const output = execSync(command, { 
        timeout: this.timeoutMs,
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

  private runModuleLoad(modulePath: string): { success: boolean; output: string[]; error: string } {
    try {
      const command = `npx tsx -e "import('${modulePath}').then(m => console.log('Module loaded:', Object.keys(m))).catch(e => console.error('Error:', e.message))"`;
      const output = execSync(command, { 
        timeout: this.timeoutMs,
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

  private extractModuleName(modulePath: string): string {
    const parts = modulePath.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.replace('.ts', '').replace('index', '');
  }

  private analyzeResults(): void {
    this.results.results.forEach(result => {
      if (result.hasCLI) {
        this.results.summary.modulesWithCLI++;
      } else {
        this.results.summary.modulesWithoutCLI++;
      }
      
      switch (result.implementationStatus) {
        case 'real':
          this.results.summary.realModules++;
          break;
        case 'scaffolded':
          this.results.summary.scaffoldedModules++;
          break;
        case 'broken':
          this.results.summary.brokenModules++;
          break;
      }
      
      this.results.summary.cliCommandsTested += result.cliCommands.length;
    });
    
    this.results.summary.averageTestDuration = this.results.totalDuration / this.results.totalModules;
  }

  generateReport(): string {
    const timestamp = new Date().toISOString().split('T')[0];
    
    let report = `MIFF Systematic Testing Framework Report
Generated: ${new Date().toISOString()}
========================================

SUMMARY
-------
Total Modules Tested: ${this.results.totalModules}
Passed: ${this.results.passed}
Failed: ${this.results.failed}
Skipped: ${this.results.skipped}
Errors: ${this.results.errors}
Total Duration: ${this.results.totalDuration}ms
Average Test Duration: ${this.results.summary.averageTestDuration.toFixed(2)}ms

Module Status:
- Real Modules: ${this.results.summary.realModules}
- Scaffolded Modules: ${this.results.summary.scaffoldedModules}
- Broken Modules: ${this.results.summary.brokenModules}

CLI Status:
- Modules with CLI: ${this.results.summary.modulesWithCLI}
- Modules without CLI: ${this.results.summary.modulesWithoutCLI}
- Total CLI Commands Tested: ${this.results.summary.cliCommandsTested}

DETAILED RESULTS
----------------
`;

    this.results.results.forEach(result => {
      report += `\n${result.moduleName}:
  Path: ${result.modulePath}
  Status: ${result.status}
  Duration: ${result.duration}ms
  Implementation: ${result.implementationStatus}
  Has CLI: ${result.hasCLI}
  Has Test Method: ${result.hasTestMethod}
  Exports: ${result.moduleExports.length}
  Dependencies: ${result.dependencies.length}
  CLI Commands: ${result.cliCommands.join(', ') || 'None'}
  
  Output:
${result.output.map(line => `    ${line}`).join('\n')}
  
  Errors:
${result.errors.map(error => `    ${error}`).join('\n')}
  
  Warnings:
${result.warnings.map(warning => `    ${warning}`).join('\n')}
`;
    });

    return report;
  }
}

// Main execution
async function main() {
  const framework = new SystematicTestingFramework();
  const results = await framework.runAllTests();
  
  // Generate and save report
  const report = framework.generateReport();
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = `/workspace/docs/archive/test-results/${timestamp}-testing-framework-report.txt`;
  
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
  console.log(`   Total Modules: ${results.totalModules}`);
  console.log(`   Passed: ${results.passed}`);
  console.log(`   Failed: ${results.failed}`);
  console.log(`   Errors: ${results.errors}`);
  console.log(`   Real Modules: ${results.summary.realModules}`);
  console.log(`   Modules with CLI: ${results.summary.modulesWithCLI}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}