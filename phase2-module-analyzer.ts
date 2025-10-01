#!/usr/bin/env tsx

/**
 * Phase 2 Module Analyzer
 * 
 * Analyzes all modules to identify what needs to be done in Phase 2
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

interface ModuleAnalysis {
  name: string;
  path: string;
  hasCLI: boolean;
  hasIndex: boolean;
  hasManager: boolean;
  isReal: boolean;
  isScaffolded: boolean;
  isBroken: boolean;
  hasMocks: boolean;
  hasTODOs: boolean;
  dependencies: string[];
  exports: string[];
  needsCLI: boolean;
  needsFixes: string[];
}

class Phase2ModuleAnalyzer {
  private modules: ModuleAnalysis[] = [];
  private pureDir = '/workspace/miff/pure';

  async analyzeAllModules(): Promise<ModuleAnalysis[]> {
    console.log('🔍 Analyzing all modules for Phase 2...');
    
    await this.scanPureModules();
    this.categorizeModules();
    
    console.log(`📊 Analyzed ${this.modules.length} modules`);
    return this.modules;
  }

  private async scanPureModules(): Promise<void> {
    try {
      const entries = readdirSync(this.pureDir);
      
      for (const entry of entries) {
        const fullPath = join(this.pureDir, entry);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          await this.analyzeModule(entry, fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not scan pure modules: ${error}`);
    }
  }

  private async analyzeModule(moduleName: string, modulePath: string): Promise<void> {
    const analysis: ModuleAnalysis = {
      name: moduleName,
      path: modulePath,
      hasCLI: false,
      hasIndex: false,
      hasManager: false,
      isReal: false,
      isScaffolded: false,
      isBroken: false,
      hasMocks: false,
      hasTODOs: false,
      dependencies: [],
      exports: [],
      needsCLI: false,
      needsFixes: []
    };

    try {
      // Check for CLI harness
      const cliPath = join(modulePath, 'cliHarness.ts');
      analysis.hasCLI = existsSync(cliPath);

      // Check for index file
      const indexPath = join(modulePath, 'index.ts');
      analysis.hasIndex = existsSync(indexPath);

      // Check for manager file
      const managerPath = join(modulePath, 'Manager.ts');
      analysis.hasManager = existsSync(managerPath);

      // Analyze content if index exists
      if (analysis.hasIndex) {
        const content = readFileSync(indexPath, 'utf-8');
        analysis.dependencies = this.extractDependencies(content);
        analysis.exports = this.extractExports(content);
        analysis.hasMocks = this.hasMocks(content);
        analysis.hasTODOs = this.hasTODOs(content);
        
        // Determine module status
        if (content.length > 100 && !analysis.hasMocks && !analysis.hasTODOs) {
          analysis.isReal = true;
        } else if (content.length < 100 || analysis.hasMocks || analysis.hasTODOs) {
          analysis.isScaffolded = true;
        }
      }

      // Determine if CLI is needed
      if (analysis.isReal && !analysis.hasCLI) {
        analysis.needsCLI = true;
        analysis.needsFixes.push('Missing CLI harness');
      }

      // Check for other issues
      if (analysis.hasMocks) {
        analysis.needsFixes.push('Contains mock implementations');
      }
      if (analysis.hasTODOs) {
        analysis.needsFixes.push('Contains TODO comments');
      }
      if (analysis.dependencies.length === 0 && analysis.isReal) {
        analysis.needsFixes.push('No dependencies (may be isolated)');
      }

      this.modules.push(analysis);
      
    } catch (error) {
      console.warn(`⚠️  Could not analyze module ${moduleName}: ${error}`);
    }
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    const es6Imports = content.match(/import\s+.*from\s+['"]([^'"]+)['"]/g);
    if (es6Imports) {
      es6Imports.forEach(imp => {
        const match = imp.match(/from\s+['"]([^'"]+)['"]/);
        if (match) {
          dependencies.push(match[1]);
        }
      });
    }
    return dependencies;
  }

  private extractExports(content: string): string[] {
    const exports: string[] = [];
    const es6Exports = content.match(/export\s+(default\s+)?(class|interface|type|function|const|let|var)\s+(\w+)/g);
    if (es6Exports) {
      es6Exports.forEach(exp => {
        const match = exp.match(/(class|interface|type|function|const|let|var)\s+(\w+)/);
        if (match) exports.push(match[2]);
      });
    }
    return exports;
  }

  private hasMocks(content: string): boolean {
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

  private categorizeModules(): void {
    this.modules.forEach(module => {
      if (module.needsFixes.length > 0) {
        module.isBroken = true;
      }
    });
  }

  generateReport(): string {
    const timestamp = new Date().toISOString().split('T')[0];
    
    let report = `Phase 2 Module Analysis Report
Generated: ${new Date().toISOString()}
========================================

SUMMARY
-------
Total Modules: ${this.modules.length}
Real Modules: ${this.modules.filter(m => m.isReal).length}
Scaffolded Modules: ${this.modules.filter(m => m.isScaffolded).length}
Broken Modules: ${this.modules.filter(m => m.isBroken).length}
Modules Needing CLI: ${this.modules.filter(m => m.needsCLI).length}

MODULES NEEDING CLI HARNESSES
-----------------------------
${this.modules.filter(m => m.needsCLI).map(m => 
  `- ${m.name} (${m.path})`
).join('\n')}

MODULES WITH ISSUES
-------------------
${this.modules.filter(m => m.needsFixes.length > 0).map(m => 
  `- ${m.name}: ${m.needsFixes.join(', ')}`
).join('\n')}

DETAILED ANALYSIS
-----------------
`;

    this.modules.forEach(module => {
      report += `\n${module.name}:
  Path: ${module.path}
  Status: ${module.isReal ? 'Real' : module.isScaffolded ? 'Scaffolded' : 'Unknown'}
  Has CLI: ${module.hasCLI}
  Has Index: ${module.hasIndex}
  Has Manager: ${module.hasManager}
  Dependencies: ${module.dependencies.length}
  Exports: ${module.exports.length}
  Issues: ${module.needsFixes.join(', ') || 'None'}
  Needs CLI: ${module.needsCLI}
`;
    });

    return report;
  }
}

// Main execution
async function main() {
  const analyzer = new Phase2ModuleAnalyzer();
  const modules = await analyzer.analyzeAllModules();
  
  // Generate and save report
  const report = analyzer.generateReport();
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = `/workspace/docs/archive/test-results/${timestamp}-phase2-module-analysis.txt`;
  
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
  console.log(`   Total Modules: ${modules.length}`);
  console.log(`   Real Modules: ${modules.filter(m => m.isReal).length}`);
  console.log(`   Modules Needing CLI: ${modules.filter(m => m.needsCLI).length}`);
  console.log(`   Modules with Issues: ${modules.filter(m => m.needsFixes.length > 0).length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}