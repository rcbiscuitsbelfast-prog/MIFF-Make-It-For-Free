#!/usr/bin/env tsx

/**
 * Phase 2 Mock Implementation Analyzer
 * 
 * Identifies modules with mock implementations that need to be replaced
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

interface MockAnalysis {
  module: string;
  file: string;
  mockTypes: string[];
  mockCount: number;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

class Phase2MockAnalyzer {
  private mocks: MockAnalysis[] = [];
  private pureDir = '/workspace/miff/pure';

  async analyzeMockImplementations(): Promise<MockAnalysis[]> {
    console.log('🔍 Analyzing mock implementations...');
    
    await this.scanAllModules();
    this.categorizeMocks();
    
    console.log(`📊 Found ${this.mocks.length} mock implementations`);
    return this.mocks;
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
    try {
      // Check for TypeScript files
      const files = readdirSync(modulePath);
      for (const file of files) {
        if (file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.d.ts')) {
          const filePath = join(modulePath, file);
          const content = readFileSync(filePath, 'utf-8');
          await this.analyzeFile(moduleName, file, content);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not analyze module ${moduleName}: ${error}`);
    }
  }

  private async analyzeFile(moduleName: string, fileName: string, content: string): Promise<void> {
    const mockPatterns = [
      { pattern: /mock|Mock|MOCK/g, type: 'mock', severity: 'high' },
      { pattern: /fake|Fake|FAKE/g, type: 'fake', severity: 'high' },
      { pattern: /stub|Stub|STUB/g, type: 'stub', severity: 'high' },
      { pattern: /simulate|Simulate|SIMULATE/g, type: 'simulate', severity: 'medium' },
      { pattern: /setTimeout.*resolve|setTimeout.*reject/g, type: 'timeout_mock', severity: 'high' },
      { pattern: /Math\.random/g, type: 'random_mock', severity: 'medium' },
      { pattern: /console\.log.*mock|console\.log.*fake/g, type: 'console_mock', severity: 'low' },
      { pattern: /return\s*\{\s*[^}]*mock|return\s*\{\s*[^}]*fake/g, type: 'return_mock', severity: 'high' },
      { pattern: /TODO.*mock|TODO.*fake|FIXME.*mock|FIXME.*fake/g, type: 'todo_mock', severity: 'high' },
      { pattern: /placeholder|Placeholder|PLACEHOLDER/g, type: 'placeholder', severity: 'medium' },
      { pattern: /not implemented|NotImplemented|NOT_IMPLEMENTED/g, type: 'not_implemented', severity: 'high' },
      { pattern: /throw new Error.*not implemented|throw new Error.*TODO/g, type: 'error_placeholder', severity: 'high' }
    ];

    const foundMocks: string[] = [];
    let totalMockCount = 0;

    for (const { pattern, type, severity } of mockPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        foundMocks.push(type);
        totalMockCount += matches.length;
      }
    }

    if (foundMocks.length > 0) {
      const severity = this.determineSeverity(foundMocks, totalMockCount);
      const description = this.generateDescription(foundMocks, totalMockCount);

      this.mocks.push({
        module: moduleName,
        file: fileName,
        mockTypes: foundMocks,
        mockCount: totalMockCount,
        severity,
        description
      });
    }
  }

  private determineSeverity(mockTypes: string[], count: number): 'high' | 'medium' | 'low' {
    const highSeverityTypes = ['mock', 'fake', 'stub', 'timeout_mock', 'return_mock', 'todo_mock', 'not_implemented', 'error_placeholder'];
    const hasHighSeverity = mockTypes.some(type => highSeverityTypes.includes(type));
    
    if (hasHighSeverity || count > 10) return 'high';
    if (count > 5) return 'medium';
    return 'low';
  }

  private generateDescription(mockTypes: string[], count: number): string {
    const uniqueTypes = [...new Set(mockTypes)];
    const typeDescriptions = uniqueTypes.map(type => {
      switch (type) {
        case 'mock': return 'mock implementations';
        case 'fake': return 'fake data';
        case 'stub': return 'stub methods';
        case 'simulate': return 'simulation code';
        case 'timeout_mock': return 'timeout-based mocks';
        case 'random_mock': return 'random-based mocks';
        case 'console_mock': return 'console logging mocks';
        case 'return_mock': return 'mock return values';
        case 'todo_mock': return 'TODO mock implementations';
        case 'placeholder': return 'placeholder implementations';
        case 'not_implemented': return 'not implemented methods';
        case 'error_placeholder': return 'error placeholders';
        default: return type;
      }
    });

    return `${count} instances of ${typeDescriptions.join(', ')}`;
  }

  private categorizeMocks(): void {
    // Sort by severity and count
    this.mocks.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.mockCount - a.mockCount;
    });
  }

  generateReport(): string {
    const timestamp = new Date().toISOString().split('T')[0];
    
    let report = `Phase 2 Mock Implementation Analysis Report
Generated: ${new Date().toISOString()}
========================================

SUMMARY
-------
Total Mock Implementations: ${this.mocks.length}
High Severity: ${this.mocks.filter(m => m.severity === 'high').length}
Medium Severity: ${this.mocks.filter(m => m.severity === 'medium').length}
Low Severity: ${this.mocks.filter(m => m.severity === 'low').length}

HIGH PRIORITY MOCK IMPLEMENTATIONS
----------------------------------
`;

    const highPriority = this.mocks.filter(m => m.severity === 'high');
    if (highPriority.length === 0) {
      report += 'No high priority mock implementations found.\n';
    } else {
      highPriority.forEach(mock => {
        report += `${mock.module}/${mock.file}:
  Types: ${mock.mockTypes.join(', ')}
  Count: ${mock.mockCount}
  Description: ${mock.description}
`;
      });
    }

    report += `\nMEDIUM PRIORITY MOCK IMPLEMENTATIONS
------------------------------------
`;

    const mediumPriority = this.mocks.filter(m => m.severity === 'medium');
    if (mediumPriority.length === 0) {
      report += 'No medium priority mock implementations found.\n';
    } else {
      mediumPriority.forEach(mock => {
        report += `${mock.module}/${mock.file}:
  Types: ${mock.mockTypes.join(', ')}
  Count: ${mock.mockCount}
  Description: ${mock.description}
`;
      });
    }

    report += `\nLOW PRIORITY MOCK IMPLEMENTATIONS
----------------------------------
`;

    const lowPriority = this.mocks.filter(m => m.severity === 'low');
    if (lowPriority.length === 0) {
      report += 'No low priority mock implementations found.\n';
    } else {
      lowPriority.forEach(mock => {
        report += `${mock.module}/${mock.file}:
  Types: ${mock.mockTypes.join(', ')}
  Count: ${mock.mockCount}
  Description: ${mock.description}
`;
      });
    }

    report += `\nRECOMMENDATIONS
---------------
`;

    if (highPriority.length > 0) {
      report += `- Replace ${highPriority.length} high priority mock implementations immediately
`;
    }

    if (mediumPriority.length > 0) {
      report += `- Address ${mediumPriority.length} medium priority mock implementations
`;
    }

    if (lowPriority.length > 0) {
      report += `- Review ${lowPriority.length} low priority mock implementations
`;
    }

    report += `- Focus on core modules first (CombatPure, ItemsPure, TeamsPure, StatusEffectsPure)
- Replace mocks with real implementations or proper fallbacks
- Add proper error handling for unimplemented features
- Document mock implementations that are intentionally temporary
`;

    return report;
  }
}

// Main execution
async function main() {
  const analyzer = new Phase2MockAnalyzer();
  const mocks = await analyzer.analyzeMockImplementations();
  
  // Generate and save report
  const report = analyzer.generateReport();
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = `/workspace/docs/archive/test-results/${timestamp}-phase2-mock-analysis.txt`;
  
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
  console.log(`   Total Mock Implementations: ${mocks.length}`);
  console.log(`   High Severity: ${mocks.filter(m => m.severity === 'high').length}`);
  console.log(`   Medium Severity: ${mocks.filter(m => m.severity === 'medium').length}`);
  console.log(`   Low Severity: ${mocks.filter(m => m.severity === 'low').length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}