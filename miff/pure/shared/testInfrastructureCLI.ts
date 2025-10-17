#!/usr/bin/env tsx

/**
 * Test Infrastructure CLI Tool
 * 
 * Command-line interface for managing test infrastructure, mock replacements,
 * and test quality across the MIFF framework.
 */

import { TestInfrastructureManager } from './TestInfrastructure.js';
import * as fs from 'fs';
import * as path from 'path';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class TestInfrastructureCLI {
  
  private manager: TestInfrastructureManager;

  constructor(...args: any[]) {
    
    this.manager = new TestInfrastructureManager();
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0!];

    try {
      switch (command) {
        case 'scan':
          await this.scanInfrastructure(args.slice(1));
          break;
        case 'mocks':
          await this.identifyMocks(args.slice(1));
          break;
        case 'coverage':
          await this.generateCoverage(args.slice(1));
          break;
        case 'quality':
          await this.assessQuality(args.slice(1));
          break;
        case 'replace':
          await this.replaceMocks(args.slice(1));
          break;
        case 'report':
          await this.generateReport(args.slice(1));
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

  private async scanInfrastructure(args: string[]): Promise<void> {
    const rootPath = args[0!] || 'miff/pure';
    const outputFile = args[1!] || 'test-infrastructure.json';

    console.info(`🔍 Scanning test infrastructure in ${rootPath}...`);
    
    const modules = await this.manager.scanTestInfrastructure(rootPath);
    
    // Save results to file
    fs.writeFileSync(outputFile, JSON.stringify(modules, null, 2));
    
    console.info(`✅ Scanned ${modules.length} modules`);
    console.info(`📄 Results saved to ${outputFile}`);

    // Show summary
    const stats = this.manager.getStats();
    console.info('\n📊 Test Infrastructure Summary:');
    console.info(`Total modules: ${stats.totalModules}`);
    console.info(`Modules with tests: ${stats.modulesWithTests}`);
    console.info(`Modules with mocks: ${stats.modulesWithMocks}`);
    console.info(`Total test files: ${stats.totalTestFiles}`);
    console.info(`Total mock files: ${stats.totalMockFiles}`);
  }

  private async identifyMocks(args: string[]): Promise<void> {
    const outputFile = args[0!] || 'mock-replacements.json';

    console.info('🔍 Identifying mock replacements...');
    
    const replacements = await this.manager.identifyMockReplacements();
    
    // Save results to file
    fs.writeFileSync(outputFile, JSON.stringify(replacements, null, 2));
    
    console.info(`✅ Identified ${replacements.length} mock replacements`);
    console.info(`📄 Results saved to ${outputFile}`);

    // Show breakdown by priority
    const critical = replacements.filter((r: any) => r.priority === 'critical');
    const high = replacements.filter((r: any) => r.priority === 'high');
    const medium = replacements.filter((r: any) => r.priority === 'medium');
    const low = replacements.filter((r: any) => r.priority === 'low');

    console.info('\n📊 Mock Replacements by Priority:');
    console.info(`Critical: ${critical.length}`);
    console.info(`High: ${high.length}`);
    console.info(`Medium: ${medium.length}`);
    console.info(`Low: ${low.length}`);

    if (critical.length > 0) {
      console.info('\n🚨 Critical Mock Replacements:');
      critical.forEach((replacement: any) => {
        console.info(`  ${replacement.id}: ${replacement.description}`);
      });
    }
  }

  private async generateCoverage(args: string[]): Promise<void> {
    const outputFile = args[0!] || 'test-coverage.json';

    console.info('📊 Generating test coverage report...');
    
    const coverage = await this.manager.generateTestCoverage();
    
    // Save results to file
    fs.writeFileSync(outputFile, JSON.stringify(coverage, null, 2));
    
    console.info(`✅ Generated coverage for ${coverage.length} modules`);
    console.info(`📄 Results saved to ${outputFile}`);

    // Show coverage summary
    const avgCoverage = coverage.reduce((sum, c) => sum + c.coveragePercentage, 0) / coverage.length;
    const lowCoverage = coverage.filter((c: any) => c.coveragePercentage < 70);

    console.info('\n📊 Coverage Summary:');
    console.info(`Average coverage: ${avgCoverage.toFixed(1)}%`);
    console.info(`Low coverage modules: ${lowCoverage.length}`);

    if (lowCoverage.length > 0) {
      console.info('\n⚠️ Low Coverage Modules:');
      lowCoverage.forEach((module: any) => {
        console.info(`  ${module.module}: ${module.coveragePercentage}%`);
      });
    }
  }

  private async assessQuality(args: string[]): Promise<void> {
    const outputFile = args[0!] || 'test-quality.json';

    console.info('🧪 Assessing test quality...');
    
    const quality = await this.manager.assessTestQuality();
    
    // Save results to file
    fs.writeFileSync(outputFile, JSON.stringify(quality, null, 2));
    
    console.info(`✅ Assessed quality for ${quality.length} modules`);
    console.info(`📄 Results saved to ${outputFile}`);

    // Show quality summary
    const avgQuality = quality.reduce((sum, q) => sum + q.mutationScore, 0) / quality.length;
    const lowQuality = quality.filter((q: any) => q.mutationScore < 70);

    console.info('\n📊 Quality Summary:');
    console.info(`Average mutation score: ${avgQuality.toFixed(1)}%`);
    console.info(`Low quality modules: ${lowQuality.length}`);

    if (lowQuality.length > 0) {
      console.info('\n⚠️ Low Quality Modules:');
      lowQuality.forEach((module: any) => {
        console.info(`  ${module.module}: ${module.mutationScore}%`);
        if (module.recommendations.length > 0) {
          console.info(`    Recommendations: ${module.recommendations.join(', ')}`);
        }
      });
    }
  }

  private async replaceMocks(args: string[]): Promise<void> {
    const priority = args[0!] || 'critical';

    console.info(`🔄 Replacing ${priority} priority mocks...`);
    
    await this.manager.replaceCriticalMocks();
    
    const stats = this.manager.getStats();
    console.info(`✅ Completed ${stats.completedReplacements} mock replacements`);
    console.info(`📊 Remaining critical mocks: ${stats.criticalMocks}`);
  }

  private async generateReport(args: string[]): Promise<void> {
    const outputFile = args[0!] || 'test-infrastructure-report.html';

    console.info('📄 Generating comprehensive test infrastructure report...');
    
    const report = this.manager.generateReport();
    const html = this.generateHTMLReport(report);

    fs.writeFileSync(outputFile, html);
    console.info(`📄 HTML report generated: ${outputFile}`);
  }

  private generateHTMLReport(report: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>MIFF Test Infrastructure Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #333; }
        .stat-label { color: #666; margin-top: 5px; }
        .excellent { color: #28a745; }
        .good { color: #17a2b8; }
        .fair { color: #ffc107; }
        .poor { color: #dc3545; }
        .module-list { margin: 20px 0; }
        .module-item { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 3px; }
        .module-name { font-weight: bold; }
        .module-stats { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 MIFF Test Infrastructure Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-value">${this.manager.getStats().totalModules}</div>
            <div class="stat-label">Total Modules</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${this.manager.getStats().modulesWithTests}</div>
            <div class="stat-label">Modules with Tests</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${this.manager.getStats().modulesWithMocks}</div>
            <div class="stat-label">Modules with Mocks</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${this.manager.getStats().averageCoverage.toFixed(1)}%</div>
            <div class="stat-label">Average Coverage</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${this.manager.getStats().averageQuality.toFixed(1)}%</div>
            <div class="stat-label">Average Quality</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${this.manager.getStats().criticalMocks}</div>
            <div class="stat-label">Critical Mocks</div>
        </div>
    </div>

    <div class="module-list">
        <h3>Module Details</h3>
        <pre>${report}</pre>
    </div>
</body>
</html>`;
  }

  private showHelp(): void {
    console.info(`
🧪 MIFF Test Infrastructure CLI

Usage: tsx testInfrastructureCLI.ts <command> [options]

Commands:
  scan [path] [output]           Scan test infrastructure in specified path
  mocks [output]                 Identify mock replacements needed
  coverage [output]              Generate test coverage report
  quality [output]               Assess test quality and mutation scores
  replace [priority]             Replace mocks with real implementations
  report [output]                Generate comprehensive HTML report
  help                          Show this help

Examples:
  tsx testInfrastructureCLI.ts scan miff/pure
  tsx testInfrastructureCLI.ts mocks mock-replacements.json
  tsx testInfrastructureCLI.ts coverage coverage-report.json
  tsx testInfrastructureCLI.ts quality quality-report.json
  tsx testInfrastructureCLI.ts replace critical
  tsx testInfrastructureCLI.ts report report.html

Priority Levels:
  - critical: Must be replaced immediately
  - high: Should be replaced soon
  - medium: Can be replaced when convenient
  - low: Optional replacement

Quality Levels:
  - excellent: 90%+ mutation score
  - good: 70-89% mutation score
  - fair: 50-69% mutation score
  - poor: <50% mutation score
`);
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1!]}`) {
  const cli = new TestInfrastructureCLI();
  cli.run().catch(console.error);
}

export default TestInfrastructureCLI;