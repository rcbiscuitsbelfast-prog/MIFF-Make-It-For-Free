#!/usr/bin/env tsx

/**
 * MIFF Automated Module Scanner
 * 
 * Comprehensive analysis of all 649+ files in the MIFF project
 * Categorizes modules, detects mocks, TODOs, and implementation status
 */

import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { join, extname, basename, dirname } from 'path';

interface ModuleAnalysis {
  path: string;
  name: string;
  type: 'module' | 'cli' | 'test' | 'config' | 'documentation' | 'other';
  size: number;
  lines: number;
  hasExports: boolean;
  hasImports: boolean;
  hasTestMethod: boolean;
  hasCLI: boolean;
  hasMockImplementation: boolean;
  hasTODOs: boolean;
  hasFIXMEs: boolean;
  hasHACKs: boolean;
  hasConsoleLogs: boolean;
  hasErrors: boolean;
  dependencies: string[];
  exports: string[];
  issues: string[];
  implementationStatus: 'real' | 'scaffolded' | 'broken' | 'unknown';
  lastModified: Date;
}

interface ScanResults {
  totalFiles: number;
  modules: ModuleAnalysis[];
  summary: {
    realModules: number;
    scaffoldedModules: number;
    brokenModules: number;
    unknownModules: number;
    totalLines: number;
    totalSize: number;
    filesWithTODOs: number;
    filesWithMocks: number;
    filesWithErrors: number;
  };
  categories: {
    [key: string]: ModuleAnalysis[];
  };
  recommendations: string[];
}

class ModuleScanner {
  private results: ScanResults;
  private fileExtensions = ['.ts', '.js', '.tsx', '.jsx', '.json', '.md'];
  private excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
  private excludeFiles = ['package-lock.json', 'yarn.lock', '.DS_Store'];

  constructor() {
    this.results = {
      totalFiles: 0,
      modules: [],
      summary: {
        realModules: 0,
        scaffoldedModules: 0,
        brokenModules: 0,
        unknownModules: 0,
        totalLines: 0,
        totalSize: 0,
        filesWithTODOs: 0,
        filesWithMocks: 0,
        filesWithErrors: 0
      },
      categories: {},
      recommendations: []
    };
  }

  async scanProject(rootPath: string = '/workspace'): Promise<ScanResults> {
    console.log('🔍 Starting comprehensive MIFF module scan...');
    console.log(`📁 Scanning: ${rootPath}`);
    
    await this.scanDirectory(rootPath);
    this.analyzeResults();
    this.generateRecommendations();
    
    console.log(`✅ Scan complete! Analyzed ${this.results.totalFiles} files`);
    return this.results;
  }

  private async scanDirectory(dirPath: string, relativePath: string = ''): Promise<void> {
    try {
      const entries = readdirSync(dirPath);
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        const relativeEntryPath = join(relativePath, entry);
        
        // Skip excluded directories
        if (this.excludeDirs.includes(entry)) {
          continue;
        }
        
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          await this.scanDirectory(fullPath, relativeEntryPath);
        } else if (stat.isFile()) {
          const ext = extname(entry);
          if (this.fileExtensions.includes(ext) && !this.excludeFiles.includes(entry)) {
            await this.analyzeFile(fullPath, relativeEntryPath);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not scan directory ${dirPath}: ${error}`);
    }
  }

  private async analyzeFile(filePath: string, relativePath: string): Promise<void> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const stat = statSync(filePath);
      
      const analysis: ModuleAnalysis = {
        path: relativePath,
        name: basename(filePath, extname(filePath)),
        type: this.determineFileType(relativePath, content),
        size: stat.size,
        lines: content.split('\n').length,
        hasExports: this.hasExports(content),
        hasImports: this.hasImports(content),
        hasTestMethod: this.hasTestMethod(content),
        hasCLI: this.hasCLI(content),
        hasMockImplementation: this.hasMockImplementation(content),
        hasTODOs: this.hasTODOs(content),
        hasFIXMEs: this.hasFIXMEs(content),
        hasHACKs: this.hasHACKs(content),
        hasConsoleLogs: this.hasConsoleLogs(content),
        hasErrors: this.hasErrors(content),
        dependencies: this.extractDependencies(content),
        exports: this.extractExports(content),
        issues: [],
        implementationStatus: 'unknown',
        lastModified: stat.mtime
      };

      // Determine implementation status
      analysis.implementationStatus = this.determineImplementationStatus(analysis);
      
      // Identify issues
      this.identifyIssues(analysis);
      
      this.results.modules.push(analysis);
      this.results.totalFiles++;
      
      // Update summary
      this.results.summary.totalLines += analysis.lines;
      this.results.summary.totalSize += analysis.size;
      
      if (analysis.hasTODOs) this.results.summary.filesWithTODOs++;
      if (analysis.hasMockImplementation) this.results.summary.filesWithMocks++;
      if (analysis.hasErrors) this.results.summary.filesWithErrors++;
      
    } catch (error) {
      console.warn(`⚠️  Could not analyze file ${filePath}: ${error}`);
    }
  }

  private determineFileType(relativePath: string, content: string): ModuleAnalysis['type'] {
    if (relativePath.includes('/cli/') || relativePath.includes('cli/')) {
      return 'cli';
    }
    if (relativePath.includes('/test/') || relativePath.includes('test/') || relativePath.includes('.test.')) {
      return 'test';
    }
    if (relativePath.includes('/pure/') || relativePath.includes('Pure')) {
      return 'module';
    }
    if (relativePath.endsWith('.md') || relativePath.includes('/docs/')) {
      return 'documentation';
    }
    if (relativePath.endsWith('.json') || relativePath.includes('config')) {
      return 'config';
    }
    return 'other';
  }

  private hasExports(content: string): boolean {
    return /export\s+(default\s+)?(class|interface|type|function|const|let|var)/.test(content) ||
           /module\.exports\s*=/.test(content) ||
           /exports\./.test(content);
  }

  private hasImports(content: string): boolean {
    return /import\s+.*from\s+['"]/.test(content) ||
           /require\s*\(/.test(content);
  }

  private hasTestMethod(content: string): boolean {
    return /test\s*\(/.test(content) ||
           /\.test\s*\(/.test(content) ||
           /describe\s*\(/.test(content) ||
           /it\s*\(/.test(content);
  }

  private hasCLI(content: string): boolean {
    return /#!/.test(content) ||
           /process\.argv/.test(content) ||
           /commander/.test(content) ||
           /Command/.test(content);
  }

  private hasMockImplementation(content: string): boolean {
    const mockPatterns = [
      /mock/i,
      /fake/i,
      /stub/i,
      /simulate/i,
      /setTimeout.*resolve/i,
      /Math\.random/i,
      /console\.log.*mock/i,
      /return\s*\{\s*[^}]*mock/i
    ];
    
    return mockPatterns.some(pattern => pattern.test(content));
  }

  private hasTODOs(content: string): boolean {
    return /TODO|FIXME|HACK|XXX|NOTE/i.test(content);
  }

  private hasFIXMEs(content: string): boolean {
    return /FIXME/i.test(content);
  }

  private hasHACKs(content: string): boolean {
    return /HACK/i.test(content);
  }

  private hasConsoleLogs(content: string): boolean {
    return /console\.(log|warn|error|info|debug)/.test(content);
  }

  private hasErrors(content: string): boolean {
    return /throw\s+new\s+Error|Error:|TypeError|ReferenceError|SyntaxError/.test(content);
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
    
    // CommonJS requires
    const commonjsImports = content.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
    if (commonjsImports) {
      commonjsImports.forEach(req => {
        const match = req.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/);
        if (match) imports.push(match[1]);
      });
    }
    
    return [...new Set(imports)];
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
    
    // Named exports
    const namedExports = content.match(/export\s*\{\s*([^}]+)\s*\}/g);
    if (namedExports) {
      namedExports.forEach(exp => {
        const match = exp.match(/\{\s*([^}]+)\s*\}/);
        if (match) {
          const names = match[1].split(',').map(name => name.trim().split(' as ')[0].trim());
          exports.push(...names);
        }
      });
    }
    
    return [...new Set(exports)];
  }

  private determineImplementationStatus(analysis: ModuleAnalysis): ModuleAnalysis['implementationStatus'] {
    // Check for broken indicators
    if (analysis.hasErrors || analysis.dependencies.some(dep => dep.includes('missing') || dep.includes('undefined'))) {
      return 'broken';
    }
    
    // Check for scaffolded indicators
    if (analysis.hasMockImplementation || 
        analysis.hasTODOs || 
        analysis.lines < 50 ||
        (analysis.type === 'module' && !analysis.hasExports)) {
      return 'scaffolded';
    }
    
    // Check for real implementation indicators
    if (analysis.type === 'module' && 
        analysis.hasExports && 
        analysis.lines > 100 && 
        !analysis.hasMockImplementation &&
        !analysis.hasTODOs) {
      return 'real';
    }
    
    return 'unknown';
  }

  private identifyIssues(analysis: ModuleAnalysis): void {
    const issues: string[] = [];
    
    if (analysis.hasErrors) {
      issues.push('Contains error handling or throws errors');
    }
    
    if (analysis.hasMockImplementation) {
      issues.push('Contains mock/simulated implementation');
    }
    
    if (analysis.hasTODOs) {
      issues.push('Contains TODO/FIXME comments');
    }
    
    if (analysis.type === 'module' && !analysis.hasExports) {
      issues.push('Module has no exports');
    }
    
    if (analysis.type === 'module' && analysis.lines < 50) {
      issues.push('Module is very small (likely incomplete)');
    }
    
    if (analysis.dependencies.length === 0 && analysis.type === 'module') {
      issues.push('Module has no dependencies (may be isolated)');
    }
    
    analysis.issues = issues;
  }

  private analyzeResults(): void {
    // Categorize modules
    this.results.modules.forEach(module => {
      const category = module.type;
      if (!this.results.categories[category]) {
        this.results.categories[category] = [];
      }
      this.results.categories[category].push(module);
    });
    
    // Count implementation status
    this.results.modules.forEach(module => {
      switch (module.implementationStatus) {
        case 'real':
          this.results.summary.realModules++;
          break;
        case 'scaffolded':
          this.results.summary.scaffoldedModules++;
          break;
        case 'broken':
          this.results.summary.brokenModules++;
          break;
        case 'unknown':
          this.results.summary.unknownModules++;
          break;
      }
    });
  }

  private generateRecommendations(): void {
    const recommendations: string[] = [];
    
    if (this.results.summary.brokenModules > 0) {
      recommendations.push(`Fix ${this.results.summary.brokenModules} broken modules`);
    }
    
    if (this.results.summary.scaffoldedModules > 0) {
      recommendations.push(`Implement ${this.results.summary.scaffoldedModules} scaffolded modules`);
    }
    
    if (this.results.summary.filesWithTODOs > 0) {
      recommendations.push(`Address ${this.results.summary.filesWithTODOs} files with TODO comments`);
    }
    
    if (this.results.summary.filesWithMocks > 0) {
      recommendations.push(`Replace ${this.results.summary.filesWithMocks} files with mock implementations`);
    }
    
    const modulesWithoutCLI = this.results.modules.filter(m => 
      m.type === 'module' && !m.hasCLI && m.implementationStatus === 'real'
    );
    if (modulesWithoutCLI.length > 0) {
      recommendations.push(`Add CLI harnesses to ${modulesWithoutCLI.length} modules`);
    }
    
    this.results.recommendations = recommendations;
  }

  generateReport(): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = `/workspace/docs/archive/test-results/${timestamp}-module-scanner-report.txt`;
    
    let report = `MIFF Automated Module Scanner Report
Generated: ${new Date().toISOString()}
========================================

SUMMARY
-------
Total Files Scanned: ${this.results.totalFiles}
Total Lines: ${this.results.summary.totalLines.toLocaleString()}
Total Size: ${(this.results.summary.totalSize / 1024 / 1024).toFixed(2)} MB

Implementation Status:
- Real Modules: ${this.results.summary.realModules}
- Scaffolded Modules: ${this.results.summary.scaffoldedModules}
- Broken Modules: ${this.results.summary.brokenModules}
- Unknown Status: ${this.results.summary.unknownModules}

Issues Found:
- Files with TODOs: ${this.results.summary.filesWithTODOs}
- Files with Mocks: ${this.results.summary.filesWithMocks}
- Files with Errors: ${this.results.summary.filesWithErrors}

CATEGORIES
----------
`;

    Object.entries(this.results.categories).forEach(([category, modules]) => {
      report += `\n${category.toUpperCase()} (${modules.length} files):\n`;
      modules.forEach(module => {
        report += `  ${module.path} [${module.implementationStatus}] (${module.lines} lines)\n`;
        if (module.issues.length > 0) {
          report += `    Issues: ${module.issues.join(', ')}\n`;
        }
      });
    });

    report += `\n\nRECOMMENDATIONS
---------------
${this.results.recommendations.map(rec => `- ${rec}`).join('\n')}

DETAILED MODULE ANALYSIS
------------------------
`;

    this.results.modules.forEach(module => {
      report += `\n${module.path}:
  Type: ${module.type}
  Status: ${module.implementationStatus}
  Size: ${module.size} bytes, ${module.lines} lines
  Exports: ${module.exports.length}
  Dependencies: ${module.dependencies.length}
  Features: ${[
    module.hasExports ? 'exports' : '',
    module.hasImports ? 'imports' : '',
    module.hasTestMethod ? 'tests' : '',
    module.hasCLI ? 'CLI' : '',
    module.hasMockImplementation ? 'mocks' : '',
    module.hasTODOs ? 'TODOs' : '',
    module.hasConsoleLogs ? 'console' : ''
  ].filter(Boolean).join(', ')}
  Issues: ${module.issues.join(', ') || 'None'}
`;
    });

    return report;
  }
}

// Main execution
async function main() {
  const scanner = new ModuleScanner();
  const results = await scanner.scanProject();
  
  // Generate and save report
  const report = scanner.generateReport();
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = `/workspace/docs/archive/test-results/${timestamp}-module-scanner-report.txt`;
  
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
  console.log(`   Total Files: ${results.totalFiles}`);
  console.log(`   Real Modules: ${results.summary.realModules}`);
  console.log(`   Scaffolded: ${results.summary.scaffoldedModules}`);
  console.log(`   Broken: ${results.summary.brokenModules}`);
  console.log(`   Files with TODOs: ${results.summary.filesWithTODOs}`);
  console.log(`   Files with Mocks: ${results.summary.filesWithMocks}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}