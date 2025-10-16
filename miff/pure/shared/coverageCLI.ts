#!/usr/bin/env tsx

/**
 * Test Coverage CLI Tool
 * 
 * Command-line interface for analyzing test coverage across the MIFF framework.
 */

import { TestCoverageAnalyzer } from './TestCoverageAnalyzer.js';
import * as fs from 'fs';
import * as path from 'path';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class CoverageCLI {
  
  private analyzer: TestCoverageAnalyzer;

  constructor(...args: any[]) {
    
    this.analyzer = new TestCoverageAnalyzer();
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'analyze':
          await this.analyzeCoverage(args.slice(1));
          break;
        case 'module':
          await this.showModuleCoverage(args.slice(1));
          break;
        case 'export':
          await this.exportCoverage(args.slice(1));
          break;
        case 'recommendations':
          await this.showRecommendations(args.slice(1));
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  private async analyzeCoverage(args: string[]): Promise<void> {
    const rootPath = args[0] || 'miff/pure';
    const outputFile = args[1] || 'coverage-report.json';

    console.info(`📊 Analyzing test coverage in ${rootPath}...`);
    
    const report = await this.analyzer.analyzeCoverage(rootPath);
    
    // Save report to file
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    
    console.info(`✅ Coverage analysis completed`);
    console.info(`📄 Report saved to ${outputFile}`);

    // Show summary
    console.info('\n📊 Coverage Summary:');
    console.info(`Overall coverage: ${report.overallCoverage.toFixed(1)}%`);
    console.info(`Total files: ${report.totalFiles}`);
    console.info(`Total lines: ${report.totalLines}`);
    console.info(`Covered lines: ${report.coveredLines}`);
    console.info(`Modules analyzed: ${report.modules.length}`);

    if (report.criticalModules.length > 0) {
      console.info(`\n🚨 Critical modules (coverage < 50%): ${report.criticalModules.join(', ')}`);
    }

    if (report.recommendations.length > 0) {
      console.info('\n💡 Recommendations:');
      report.recommendations.forEach((rec: any) => console.info(`  - ${rec}`));
    }
  }

  private async showModuleCoverage(args: string[]): Promise<void> {
    const moduleName = args[0];
    
    if (!moduleName) {
      console.error('❌ Module name required');
      console.error('Usage: tsx coverageCLI.ts module <module-name>');
      return;
    }

    console.info(`📊 Coverage for module: ${moduleName}`);
    
    const coverage = this.analyzer.getModuleCoverage(moduleName);
    
    if (!coverage) {
      console.error(`❌ Module not found: ${moduleName}`);
      return;
    }

    console.info(`\n📊 ${moduleName} Coverage Details:`);
    console.info(`Total lines: ${coverage.totalLines}`);
    console.info(`Covered lines: ${coverage.coveredLines}`);
    console.info(`Coverage percentage: ${coverage.coveragePercentage.toFixed(1)}%`);
    console.info(`Branch coverage: ${coverage.branchCoverage.toFixed(1)}%`);
    console.info(`Function coverage: ${coverage.functionCoverage.toFixed(1)}%`);
    console.info(`Statement coverage: ${coverage.statementCoverage.toFixed(1)}%`);
    console.info(`Quality: ${coverage.quality.toUpperCase()}`);

    if (coverage.files.length > 0) {
      console.info('\n📁 File Coverage:');
      for (const file of coverage.files) {
        const fileCoverage = (file.coveredLines / file.totalLines) * 100;
        console.info(`  ${file.filePath}: ${fileCoverage.toFixed(1)}% (${file.coveredLines}/${file.totalLines})`);
      }
    }

    if (coverage.recommendations.length > 0) {
      console.info('\n💡 Recommendations:');
      coverage.recommendations.forEach((rec: any) => console.info(`  - ${rec}`));
    }
  }

  private async exportCoverage(args: string[]): Promise<void> {
    const format = args[0] || 'json';
    const outputFile = args[1] || `coverage-report.${format}`;

    if (!['json', 'html', 'csv'].includes(format)) {
      console.error('❌ Invalid format. Supported formats: json, html, csv');
      return;
    }

    console.info(`📄 Exporting coverage data as ${format.toUpperCase()}...`);
    
    const data = this.analyzer.exportCoverage(format as 'json' | 'html' | 'csv');
    
    fs.writeFileSync(outputFile, data);
    
    console.info(`✅ Coverage data exported to ${outputFile}`);
  }

  private async showRecommendations(args: string[]): Promise<void> {
    console.info('💡 Generating coverage recommendations...');
    
    const recommendations = this.analyzer.generateRecommendations();
    
    if (recommendations.length === 0) {
      console.info('✅ No specific recommendations at this time.');
      return;
    }

    console.info('\n💡 Coverage Recommendations:');
    recommendations.forEach((rec, index) => {
      console.info(`${index + 1}. ${rec}`);
    });

    // Show module-specific recommendations
    const modules = this.analyzer.getAllModuleCoverages();
    const lowCoverageModules = modules.filter(m => m.coveragePercentage < 70);
    
    if (lowCoverageModules.length > 0) {
      console.info('\n📊 Low Coverage Modules:');
      lowCoverageModules.forEach((module: any) => {
        console.info(`  ${module.module}: ${module.coveragePercentage.toFixed(1)}%`);
        if (module.recommendations.length > 0) {
          module.recommendations.forEach((rec: any) => console.info(`    - ${rec}`));
        }
      });
    }
  }

  private showHelp(): void {
    console.info(`
📊 MIFF Test Coverage CLI

Usage: tsx coverageCLI.ts <command> [options]

Commands:
  analyze [path] [output]         Analyze test coverage for all modules
  module <name>                   Show coverage details for specific module
  export <format> [output]        Export coverage data (json, html, csv)
  recommendations                 Show coverage recommendations
  help                           Show this help

Examples:
  tsx coverageCLI.ts analyze miff/pure
  tsx coverageCLI.ts analyze miff/pure coverage-report.json
  tsx coverageCLI.ts module CombatPure
  tsx coverageCLI.ts export html coverage-report.html
  tsx coverageCLI.ts export csv coverage-data.csv
  tsx coverageCLI.ts recommendations

Coverage Quality Levels:
  - excellent: 90%+ coverage
  - good: 80-89% coverage
  - fair: 70-79% coverage
  - poor: <70% coverage

Export Formats:
  - json: Machine-readable JSON format
  - html: Human-readable HTML report
  - csv: Spreadsheet-compatible CSV format
`);
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new CoverageCLI();
  cli.run().catch(console.error);
}

export default CoverageCLI;