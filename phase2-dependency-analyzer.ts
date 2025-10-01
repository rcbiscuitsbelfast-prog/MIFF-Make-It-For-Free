#!/usr/bin/env tsx

/**
 * Phase 2 Dependency Analyzer
 * 
 * Analyzes module dependencies and identifies circular dependencies
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

interface ModuleDependency {
  module: string;
  dependencies: string[];
  dependents: string[];
  circularDependencies: string[];
  missingDependencies: string[];
}

class Phase2DependencyAnalyzer {
  private modules: Map<string, ModuleDependency> = new Map();
  private pureDir = '/workspace/miff/pure';

  async analyzeDependencies(): Promise<Map<string, ModuleDependency>> {
    console.log('🔍 Analyzing module dependencies...');
    
    await this.scanAllModules();
    this.identifyCircularDependencies();
    this.identifyMissingDependencies();
    
    console.log(`📊 Analyzed ${this.modules.size} modules`);
    return this.modules;
  }

  private async scanAllModules(): Promise<void> {
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
    const dependency: ModuleDependency = {
      module: moduleName,
      dependencies: [],
      dependents: [],
      circularDependencies: [],
      missingDependencies: []
    };

    try {
      // Check for index.ts
      const indexPath = join(modulePath, 'index.ts');
      if (existsSync(indexPath)) {
        const content = readFileSync(indexPath, 'utf-8');
        dependency.dependencies = this.extractDependencies(content);
      }

      // Check for other TypeScript files
      const files = readdirSync(modulePath);
      for (const file of files) {
        if (file.endsWith('.ts') && file !== 'index.ts') {
          const filePath = join(modulePath, file);
          const content = readFileSync(filePath, 'utf-8');
          const fileDeps = this.extractDependencies(content);
          dependency.dependencies.push(...fileDeps);
        }
      }

      // Remove duplicates
      dependency.dependencies = [...new Set(dependency.dependencies)];

      this.modules.set(moduleName, dependency);
      
    } catch (error) {
      console.warn(`⚠️  Could not analyze module ${moduleName}: ${error}`);
    }
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    
    // ES6 imports
    const es6Imports = content.match(/import\s+.*from\s+['"]([^'"]+)['"]/g);
    if (es6Imports) {
      es6Imports.forEach(imp => {
        const match = imp.match(/from\s+['"]([^'"]+)['"]/);
        if (match) {
          let dep = match[1];
          
          // Convert relative imports to module names
          if (dep.startsWith('../')) {
            dep = dep.replace('../', '');
          } else if (dep.startsWith('./')) {
            dep = dep.replace('./', '');
          }
          
          // Remove file extensions
          dep = dep.replace(/\.(ts|js)$/, '');
          
          dependencies.push(dep);
        }
      });
    }

    // CommonJS requires
    const commonJSRequires = content.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
    if (commonJSRequires) {
      commonJSRequires.forEach(req => {
        const match = req.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/);
        if (match) {
          let dep = match[1];
          
          // Convert relative imports to module names
          if (dep.startsWith('../')) {
            dep = dep.replace('../', '');
          } else if (dep.startsWith('./')) {
            dep = dep.replace('./', '');
          }
          
          // Remove file extensions
          dep = dep.replace(/\.(ts|js)$/, '');
          
          dependencies.push(dep);
        }
      });
    }

    return dependencies;
  }

  private identifyCircularDependencies(): void {
    for (const [moduleName, dependency] of this.modules) {
      const visited = new Set<string>();
      const recursionStack = new Set<string>();
      
      this.detectCircularDependency(moduleName, visited, recursionStack, []);
    }
  }

  private detectCircularDependency(
    moduleName: string, 
    visited: Set<string>, 
    recursionStack: Set<string>, 
    path: string[]
  ): void {
    if (recursionStack.has(moduleName)) {
      // Found a circular dependency
      const cycleStart = path.indexOf(moduleName);
      const cycle = path.slice(cycleStart).concat(moduleName);
      
      // Add circular dependency to all modules in the cycle
      cycle.forEach(module => {
        const dep = this.modules.get(module);
        if (dep) {
          dep.circularDependencies.push(cycle.join(' -> '));
        }
      });
      
      return;
    }

    if (visited.has(moduleName)) {
      return;
    }

    visited.add(moduleName);
    recursionStack.add(moduleName);
    path.push(moduleName);

    const dependency = this.modules.get(moduleName);
    if (dependency) {
      for (const dep of dependency.dependencies) {
        this.detectCircularDependency(dep, visited, recursionStack, [...path]);
      }
    }

    recursionStack.delete(moduleName);
  }

  private identifyMissingDependencies(): void {
    for (const [moduleName, dependency] of this.modules) {
      for (const dep of dependency.dependencies) {
        if (!this.modules.has(dep)) {
          dependency.missingDependencies.push(dep);
        }
      }
    }
  }

  generateReport(): string {
    const timestamp = new Date().toISOString().split('T')[0];
    
    let report = `Phase 2 Dependency Analysis Report
Generated: ${new Date().toISOString()}
========================================

SUMMARY
-------
Total Modules: ${this.modules.size}
Modules with Dependencies: ${Array.from(this.modules.values()).filter(m => m.dependencies.length > 0).length}
Modules with Circular Dependencies: ${Array.from(this.modules.values()).filter(m => m.circularDependencies.length > 0).length}
Modules with Missing Dependencies: ${Array.from(this.modules.values()).filter(m => m.missingDependencies.length > 0).length}

CIRCULAR DEPENDENCIES
--------------------
`;

    const circularDeps = Array.from(this.modules.values()).filter(m => m.circularDependencies.length > 0);
    if (circularDeps.length === 0) {
      report += 'No circular dependencies found.\n';
    } else {
      circularDeps.forEach(module => {
        report += `${module.module}:\n`;
        module.circularDependencies.forEach(cycle => {
          report += `  - ${cycle}\n`;
        });
      });
    }

    report += `\nMISSING DEPENDENCIES
-------------------
`;

    const missingDeps = Array.from(this.modules.values()).filter(m => m.missingDependencies.length > 0);
    if (missingDeps.length === 0) {
      report += 'No missing dependencies found.\n';
    } else {
      missingDeps.forEach(module => {
        report += `${module.module}:\n`;
        module.missingDependencies.forEach(dep => {
          report += `  - ${dep}\n`;
        });
      });
    }

    report += `\nDETAILED DEPENDENCY ANALYSIS
-------------------------------
`;

    Array.from(this.modules.values()).forEach(module => {
      report += `\n${module.module}:
  Dependencies: ${module.dependencies.length}
  Dependents: ${module.dependents.length}
  Circular Dependencies: ${module.circularDependencies.length}
  Missing Dependencies: ${module.missingDependencies.length}
  
  Dependencies: ${module.dependencies.join(', ') || 'None'}
  Missing: ${module.missingDependencies.join(', ') || 'None'}
  Circular: ${module.circularDependencies.join(', ') || 'None'}
`;
    });

    return report;
  }
}

// Main execution
async function main() {
  const analyzer = new Phase2DependencyAnalyzer();
  const modules = await analyzer.analyzeDependencies();
  
  // Generate and save report
  const report = analyzer.generateReport();
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = `/workspace/docs/archive/test-results/${timestamp}-phase2-dependency-analysis.txt`;
  
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
  console.log(`   Total Modules: ${modules.size}`);
  console.log(`   Circular Dependencies: ${Array.from(modules.values()).filter(m => m.circularDependencies.length > 0).length}`);
  console.log(`   Missing Dependencies: ${Array.from(modules.values()).filter(m => m.missingDependencies.length > 0).length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}