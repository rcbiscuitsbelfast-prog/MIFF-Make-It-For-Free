#!/usr/bin/env node

/**
 * Simple Test Coverage Analysis
 * 
 * This script provides a lightweight analysis of test coverage
 * without running the full test suite.
 */

const fs = require('fs');
const path = require('path');

class SimpleCoverageAnalysis {
  constructor() {
    this.priorityModules = [
      'TeamsPure',
      'CombatPure', 
      'ItemsPure',
      'UnrealBridgePure',
      'SceneBuilderPure'
    ];
    
    this.analysis = {
      modules: {},
      gaps: [],
      recommendations: []
    };
  }

  analyzeModuleStructure() {
    console.log('🔍 Analyzing module structure...');
    
    const pureDir = path.join(process.cwd(), 'miff', 'pure');
    
    if (!fs.existsSync(pureDir)) {
      console.error('❌ miff/pure directory not found');
      return;
    }
    
    const modules = fs.readdirSync(pureDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`📁 Found ${modules.length} modules: ${modules.join(', ')}`);
    
    for (const module of modules) {
      this.analyzeModule(module, path.join(pureDir, module));
    }
  }

  analyzeModule(moduleName, modulePath) {
    const analysis = {
      name: moduleName,
      path: modulePath,
      files: [],
      testFiles: [],
      hasIndex: false,
      hasTests: false,
      testCoverage: 'unknown'
    };
    
    // Find all TypeScript files
    const files = this.findFiles(modulePath, '.ts');
    analysis.files = files;
    
    // Find test files
    const testFiles = this.findFiles(modulePath, '.test.ts');
    analysis.testFiles = testFiles;
    analysis.hasTests = testFiles.length > 0;
    
    // Check for index file
    analysis.hasIndex = files.some(file => file.endsWith('index.ts'));
    
    // Estimate test coverage based on file structure
    analysis.testCoverage = this.estimateCoverage(analysis);
    
    this.analysis.modules[moduleName] = analysis;
    
    // Identify gaps
    if (!analysis.hasTests) {
      this.analysis.gaps.push({
        module: moduleName,
        issue: 'No test files found',
        priority: this.priorityModules.includes(moduleName) ? 'HIGH' : 'MEDIUM'
      });
    }
    
    if (!analysis.hasIndex) {
      this.analysis.gaps.push({
        module: moduleName,
        issue: 'No index.ts file found',
        priority: 'LOW'
      });
    }
  }

  findFiles(dir, extension) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          files.push(...this.findFiles(fullPath, extension));
        } else if (item.name.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not read directory ${dir}: ${error.message}`);
    }
    
    return files;
  }

  estimateCoverage(analysis) {
    if (!analysis.hasTests) return '0%';
    
    const testRatio = analysis.testFiles.length / Math.max(analysis.files.length, 1);
    
    if (testRatio >= 0.5) return 'High (70-90%)';
    if (testRatio >= 0.3) return 'Medium (40-70%)';
    if (testRatio >= 0.1) return 'Low (10-40%)';
    return 'Very Low (0-10%)';
  }

  generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    // Priority module recommendations
    for (const priorityModule of this.priorityModules) {
      const module = this.analysis.modules[priorityModule];
      
      if (module && !module.hasTests) {
        this.analysis.recommendations.push({
          type: 'PRIORITY_MODULE',
          module: priorityModule,
          message: `High-priority module ${priorityModule} needs test coverage`,
          actions: [
            'Create comprehensive unit tests',
            'Add integration tests',
            'Implement edge case testing',
            'Add performance tests'
          ]
        });
      }
    }
    
    // General recommendations
    this.analysis.recommendations.push({
      type: 'GENERAL',
      message: 'Improve overall test coverage',
      actions: [
        'Implement test coverage thresholds in CI/CD',
        'Add automated test generation',
        'Create test templates for new modules',
        'Implement mutation testing'
      ]
    });
  }

  generateReport() {
    console.log('📊 Generating coverage analysis report...');
    
    const reportPath = path.join(process.cwd(), 'docs', 'audit', 'simple-coverage-analysis.md');
    
    const report = `# Simple Test Coverage Analysis

## Executive Summary

- **Total Modules**: ${Object.keys(this.analysis.modules).length}
- **Modules with Tests**: ${Object.values(this.analysis.modules).filter(m => m.hasTests).length}
- **Modules without Tests**: ${Object.values(this.analysis.modules).filter(m => !m.hasTests).length}
- **Coverage Gaps Identified**: ${this.analysis.gaps.length}

## Module Analysis

${Object.entries(this.analysis.modules).map(([name, module]) => `
### ${name}
- **Path**: \`${module.path}\`
- **Files**: ${module.files.length}
- **Test Files**: ${module.testFiles.length}
- **Has Index**: ${module.hasIndex ? '✅' : '❌'}
- **Has Tests**: ${module.hasTests ? '✅' : '❌'}
- **Estimated Coverage**: ${module.testCoverage}
`).join('\n')}

## Coverage Gaps

${this.analysis.gaps.map(gap => `
### ${gap.module} (${gap.priority} Priority)
- **Issue**: ${gap.issue}
`).join('\n')}

## Recommendations

${this.analysis.recommendations.map(rec => `
### ${rec.type}
- **Module**: ${rec.module || 'N/A'}
- **Message**: ${rec.message}
- **Actions**:
${rec.actions.map(action => `  - ${action}`).join('\n')}
`).join('\n')}

## Next Steps

1. **Immediate Actions**:
   - Create test files for modules without tests
   - Focus on high-priority modules first
   - Implement basic unit tests

2. **Medium-term Goals**:
   - Achieve comprehensive test coverage
   - Implement automated test generation
   - Add integration testing

3. **Long-term Strategy**:
   - Maintain coverage thresholds
   - Implement mutation testing
   - Add performance testing

## Generated: ${new Date().toISOString()}
`;

    // Ensure directory exists
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, report);
    console.log(`✅ Coverage analysis report generated: ${reportPath}`);
  }

  run() {
    console.log('🚀 Starting simple coverage analysis...');
    
    try {
      this.analyzeModuleStructure();
      this.generateRecommendations();
      this.generateReport();
      
      console.log('✅ Simple coverage analysis completed');
      console.log(`📊 Modules analyzed: ${Object.keys(this.analysis.modules).length}`);
      console.log(`🔍 Gaps identified: ${this.analysis.gaps.length}`);
      console.log(`💡 Recommendations: ${this.analysis.recommendations.length}`);
      
    } catch (error) {
      console.error('❌ Coverage analysis failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const analysis = new SimpleCoverageAnalysis();
  analysis.run();
}

module.exports = SimpleCoverageAnalysis;