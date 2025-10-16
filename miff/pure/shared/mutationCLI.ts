#!/usr/bin/env tsx

/**
 * Mutation Testing CLI Tool
 * 
 * Command-line interface for running mutation testing to validate test quality
 * across the MIFF framework.
 */

import { MutationTester, JestTestRunner } from './MutationTesting.js';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { SafeJSONParser } from '/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class MutationCLI {
  
  private mutationTester: MutationTester;

  constructor(...args: any[]) {
    
    const testRunner = new JestTestRunner();
    this.mutationTester = new MutationTester(testRunner);
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'test':
          await this.runMutationTesting(args.slice(1));
          break;
        case 'generate':
          await this.generateMutations(args.slice(1));
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

  private async runMutationTesting(args: string[]): Promise<void> {
    const targetPath = args[0] || 'miff/pure';
    const outputFile = args[1] || 'mutation-report.json';

    console.info(`🧬 Running mutation testing on ${targetPath}...`);

    // Find TypeScript files
    const files = glob.sync(`${targetPath}/**/*.ts`, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.test.ts', '**/*.spec.ts']
    });

    console.info(`📁 Found ${files.length} TypeScript files to test`);

    // Generate mutations for each file
    for (const file of files) {
      console.info(`🔄 Generating mutations for ${file}...`);
      await this.mutationTester.generateMutations(file);
    }

    // Run mutation testing
    const stats = await this.mutationTester.runMutationTesting();

    // Generate report
    const report = this.generateMutationReport(stats);
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));

    console.info('\n📊 Mutation Testing Results:');
    console.info(`Total mutations: ${stats.totalMutations}`);
    console.info(`Killed mutations: ${stats.killedMutations}`);
    console.info(`Survived mutations: ${stats.survivedMutations}`);
    console.info(`Error mutations: ${stats.errorMutations}`);
    console.info(`Mutation score: ${stats.mutationScore.toFixed(1)}%`);
    console.info(`Test quality: ${stats.testQuality}`);

    if (stats.recommendations.length > 0) {
      console.info('\n💡 Recommendations:');
      stats.recommendations.forEach((rec: any) => console.info(`  - ${rec}`));
    }

    console.info(`\n📄 Detailed report saved to ${outputFile}`);
  }

  private async generateMutations(args: string[]): Promise<void> {
    const targetPath = args[0] || 'miff/pure';
    const outputFile = args[1] || 'mutations.json';

    console.info(`🔬 Generating mutations for ${targetPath}...`);

    // Find TypeScript files
    const files = glob.sync(`${targetPath}/**/*.ts`, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.test.ts', '**/*.spec.ts']
    });

    const allMutations = [];

    for (const file of files) {
      console.info(`🔄 Processing ${file}...`);
      const mutations = await this.mutationTester.generateMutations(file);
      allMutations.push(...mutations);
    }

    // Save mutations to file
    fs.writeFileSync(outputFile, JSON.stringify(allMutations, null, 2));

    console.info(`✅ Generated ${allMutations.length} mutations`);
    console.info(`📄 Mutations saved to ${outputFile}`);

    // Show mutation breakdown by type
    const typeCounts = allMutations.reduce((acc, mutation) => {
      acc[mutation.type] = (acc[mutation.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.info('\n📊 Mutation breakdown by type:');
    for (const [type, count] of Object.entries(typeCounts)) {
      console.info(`  ${type}: ${count}`);
    }
  }

  private async generateReport(args: string[]): Promise<void> {
    const inputFile = args[0] || 'mutation-report.json';
    const outputFile = args[1] || 'mutation-report.html';

    if (!fs.existsSync(inputFile)) {
      console.error(`❌ Report file not found: ${inputFile}`);
      console.error('Run mutation testing first with: tsx mutationCLI.ts test');
      return;
    }

    const report = SafeJSONParser.parse(fs.readFileSync(inputFile, 'utf-8'));
    const html = this.generateHTMLReport(report);

    fs.writeFileSync(outputFile, html);
    console.info(`📄 HTML report generated: ${outputFile}`);
  }

  private generateMutationReport(stats: any): any {
    return {
      timestamp: new Date().toISOString(),
      stats,
      summary: {
        mutationScore: stats.mutationScore,
        testQuality: stats.testQuality,
        totalMutations: stats.totalMutations,
        killedMutations: stats.killedMutations,
        survivedMutations: stats.survivedMutations,
        errorMutations: stats.errorMutations
      },
      recommendations: stats.recommendations
    };
  }

  private generateHTMLReport(report: any): string {
    const { stats, summary, recommendations } = report;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>MIFF Mutation Testing Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #333; }
        .stat-label { color: #666; margin-top: 5px; }
        .quality-excellent { color: #28a745; }
        .quality-good { color: #17a2b8; }
        .quality-fair { color: #ffc107; }
        .quality-poor { color: #dc3545; }
        .recommendations { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .recommendation { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧬 MIFF Mutation Testing Report</h1>
        <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-value">${summary.mutationScore.toFixed(1)}%</div>
            <div class="stat-label">Mutation Score</div>
        </div>
        <div class="stat-card">
            <div class="stat-value quality-${summary.testQuality}">${summary.testQuality.toUpperCase()}</div>
            <div class="stat-label">Test Quality</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${summary.totalMutations}</div>
            <div class="stat-label">Total Mutations</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${summary.killedMutations}</div>
            <div class="stat-label">Killed Mutations</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${summary.survivedMutations}</div>
            <div class="stat-label">Survived Mutations</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${summary.errorMutations}</div>
            <div class="stat-label">Error Mutations</div>
        </div>
    </div>

    <div class="recommendations">
        <h3>💡 Recommendations</h3>
        ${recommendations.map((rec: string) => `<div class="recommendation">• ${rec}</div>`).join('')}
    </div>
</body>
</html>`;
  }

  private showHelp(): void {
    console.info(`
🧬 MIFF Mutation Testing CLI

Usage: tsx mutationCLI.ts <command> [options!]

Commands:
  test [path!] [output!]           Run mutation testing on specified path
  generate [path!] [output!]       Generate mutations without running tests
  report [input!] [output!]        Generate HTML report from mutation results
  help                          Show this help

Examples:
  tsx mutationCLI.ts test miff/pure
  tsx mutationCLI.ts test miff/pure/CombatPure mutation-results.json
  tsx mutationCLI.ts generate miff/pure mutations.json
  tsx mutationCLI.ts report mutation-results.json report.html

Mutation Types:
  - Arithmetic operators (+, -, *, /, %, **)
  - Relational operators (<, >, <=, >=, ==, !=, ===, !==)
  - Logical operators (&&, ||, !)
  - Return statements (true/false)
  - Numeric literals

Test Quality Levels:
  - Excellent: 90%+ mutation score
  - Good: 70-89% mutation score
  - Fair: 50-69% mutation score
  - Poor: <50% mutation score
`);
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new MutationCLI();
  cli.run().catch(console.error);
}

export default MutationCLI;