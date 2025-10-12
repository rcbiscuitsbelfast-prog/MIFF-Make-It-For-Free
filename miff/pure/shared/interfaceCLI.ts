#!/usr/bin/env tsx

/**
 * Interface Standardization CLI Tool
 * 
 * Command-line interface for standardizing interfaces across the MIFF framework.
 */

import { InterfaceStandardizer } from './InterfaceStandardizer.js';
import * as fs from 'fs';
import * as path from 'path';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class InterfaceCLI {
  private logger: StructuredLogger;
  private standardizer: InterfaceStandardizer;

  constructor() {
    this.logger = new StructuredLogger({ module: 'InterfaceCLI' });
    this.standardizer = new InterfaceStandardizer();
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'standardize':
          await this.standardizeInterfaces(args.slice(1));
          break;
        case 'check':
          await this.checkCompliance(args.slice(1));
          break;
        case 'report':
          await this.generateReport(args.slice(1));
          break;
        case 'fix':
          await this.fixInterfaces(args.slice(1));
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      this.logger.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  private async standardizeInterfaces(args: string[]): Promise<void> {
    const rootPath = args[0] || 'miff/pure';
    const outputFile = args[1] || 'interface-standardization.json';

    this.logger.info(`🔧 Standardizing interfaces in ${rootPath}...`);
    
    const results = await this.standardizer.standardizeAllInterfaces(rootPath);
    
    // Save results to file
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    this.logger.info(`✅ Standardized interfaces for ${results.length} modules`);
    this.logger.info(`📄 Results saved to ${outputFile}`);

    // Show summary
    const stats = this.standardizer.getStats();
    this.logger.info('\n📊 Standardization Summary:');
    this.logger.info(`Total modules: ${stats.totalModules}`);
    this.logger.info(`Compliant modules: ${stats.compliantModules}`);
    this.logger.info(`Non-compliant modules: ${stats.nonCompliantModules}`);
    this.logger.info(`Average score: ${stats.averageScore.toFixed(1)}%`);
    this.logger.info(`Critical issues: ${stats.criticalIssues}`);
    this.logger.info(`Total recommendations: ${stats.recommendations}`);

    // Show non-compliant modules
    const nonCompliant = this.standardizer.getNonCompliantModules();
    if (nonCompliant.length > 0) {
      this.logger.info('\n❌ Non-Compliant Modules:');
      nonCompliant.forEach(result => {
        this.logger.info(`  ${result.module} (${result.interface}): ${result.score}%`);
        if (result.missingMethods.length > 0) {
          this.logger.info(`    Missing methods: ${result.missingMethods.join(', ')}`);
        }
        if (result.missingProperties.length > 0) {
          this.logger.info(`    Missing properties: ${result.missingProperties.join(', ')}`);
        }
      });
    }
  }

  private async checkCompliance(args: string[]): Promise<void> {
    const moduleName = args[0];
    
    if (!moduleName) {
      this.logger.error('❌ Module name required');
      this.logger.error('Usage: tsx interfaceCLI.ts check <module-name>');
      return;
    }

    this.logger.info(`✅ Checking compliance for module: ${moduleName}`);
    
    const results = this.standardizer.getAllResults();
    const result = results.find(r => r.module === moduleName);
    
    if (!result) {
      this.logger.error(`❌ Module not found: ${moduleName}`);
      return;
    }

    this.logger.info(`\n📊 Compliance Check for ${result.module}:`);
    this.logger.info(`Interface: ${result.interface}`);
    this.logger.info(`Compliant: ${result.compliant ? 'Yes' : 'No'}`);
    this.logger.info(`Score: ${result.score}%`);

    if (result.missingMethods.length > 0) {
      this.logger.info(`\n❌ Missing Methods:`);
      result.missingMethods.forEach(method => this.logger.info(`  - ${method}`));
    }

    if (result.extraMethods.length > 0) {
      this.logger.info(`\n⚠️ Extra Methods:`);
      result.extraMethods.forEach(method => this.logger.info(`  - ${method}`));
    }

    if (result.missingProperties.length > 0) {
      this.logger.info(`\n❌ Missing Properties:`);
      result.missingProperties.forEach(prop => this.logger.info(`  - ${prop}`));
    }

    if (result.extraProperties.length > 0) {
      this.logger.info(`\n⚠️ Extra Properties:`);
      result.extraProperties.forEach(prop => this.logger.info(`  - ${prop}`));
    }

    if (result.missingEvents.length > 0) {
      this.logger.info(`\n❌ Missing Events:`);
      result.missingEvents.forEach(event => this.logger.info(`  - ${event}`));
    }

    if (result.extraEvents.length > 0) {
      this.logger.info(`\n⚠️ Extra Events:`);
      result.extraEvents.forEach(event => this.logger.info(`  - ${event}`));
    }

    // Lifecycle compliance
    this.logger.info(`\n🔄 Lifecycle Compliance:`);
    this.logger.info(`  Initialize: ${result.lifecycleCompliance.initialize ? '✅' : '❌'}`);
    this.logger.info(`  Destroy: ${result.lifecycleCompliance.destroy ? '✅' : '❌'}`);
    this.logger.info(`  Update: ${result.lifecycleCompliance.update ? '✅' : '❌'}`);
    this.logger.info(`  Reset: ${result.lifecycleCompliance.reset ? '✅' : '❌'}`);
    this.logger.info(`  Pause: ${result.lifecycleCompliance.pause ? '✅' : '❌'}`);
    this.logger.info(`  Resume: ${result.lifecycleCompliance.resume ? '✅' : '❌'}`);
    this.logger.info(`  Score: ${result.lifecycleCompliance.score.toFixed(1)}%`);

    // Error handling compliance
    this.logger.info(`\n🛡️ Error Handling Compliance:`);
    this.logger.info(`  Throw on Error: ${result.errorHandlingCompliance.throwOnError ? '✅' : '❌'}`);
    this.logger.info(`  Return Error: ${result.errorHandlingCompliance.returnError ? '✅' : '❌'}`);
    this.logger.info(`  Log Errors: ${result.errorHandlingCompliance.logErrors ? '✅' : '❌'}`);
    this.logger.info(`  Error Types: ${result.errorHandlingCompliance.errorTypes.join(', ')}`);
    this.logger.info(`  Score: ${result.errorHandlingCompliance.score.toFixed(1)}%`);

    if (result.recommendations.length > 0) {
      this.logger.info(`\n💡 Recommendations:`);
      result.recommendations.forEach(rec => this.logger.info(`  - ${rec}`));
    }
  }

  private async generateReport(args: string[]): Promise<void> {
    const outputFile = args[0] || 'interface-compliance-report.html';

    this.logger.info('📊 Generating interface compliance report...');
    
    const report = this.standardizer.generateComplianceReport();
    const html = this.generateHTMLReport(report);
    
    // Save report to file
    fs.writeFileSync(outputFile, html);
    
    this.logger.info(`✅ Interface compliance report generated`);
    this.logger.info(`📄 Report saved to ${outputFile}`);
  }

  private async fixInterfaces(args: string[]): Promise<void> {
    const moduleName = args[0];
    
    if (!moduleName) {
      this.logger.error('❌ Module name required');
      this.logger.error('Usage: tsx interfaceCLI.ts fix <module-name>');
      return;
    }

    this.logger.info(`🔧 Fixing interface for module: ${moduleName}`);
    
    const results = this.standardizer.getAllResults();
    const result = results.find(r => r.module === moduleName);
    
    if (!result) {
      this.logger.error(`❌ Module not found: ${moduleName}`);
      return;
    }

    if (result.compliant) {
      this.logger.info(`✅ Module ${moduleName} is already compliant`);
      return;
    }

    this.logger.info(`\n🔧 Fixing ${result.module} interface...`);
    
    // Generate fix suggestions
    const fixes = this.generateFixSuggestions(result);
    
    this.logger.info(`\n💡 Fix Suggestions for ${result.module}:`);
    fixes.forEach(fix => this.logger.info(`  - ${fix}`));
    
    // Save fix suggestions to file
    const fixFile = `${moduleName}-interface-fixes.md`;
    fs.writeFileSync(fixFile, this.generateFixMarkdown(result, fixes));
    
    this.logger.info(`\n📄 Fix suggestions saved to ${fixFile}`);
  }

  private generateFixSuggestions(result: any): string[] {
    const fixes: string[] = [];
    
    if (result.missingMethods.length > 0) {
      fixes.push(`Implement missing methods: ${result.missingMethods.join(', ')}`);
    }
    
    if (result.missingProperties.length > 0) {
      fixes.push(`Add missing properties: ${result.missingProperties.join(', ')}`);
    }
    
    if (result.missingEvents.length > 0) {
      fixes.push(`Add missing events: ${result.missingEvents.join(', ')}`);
    }
    
    if (result.extraMethods.length > 0) {
      fixes.push(`Consider removing extra methods: ${result.extraMethods.join(', ')}`);
    }
    
    if (result.extraProperties.length > 0) {
      fixes.push(`Consider removing extra properties: ${result.extraProperties.join(', ')}`);
    }
    
    if (result.extraEvents.length > 0) {
      fixes.push(`Consider removing extra events: ${result.extraEvents.join(', ')}`);
    }
    
    if (result.lifecycleCompliance.score < 80) {
      fixes.push('Improve lifecycle method compliance');
    }
    
    if (result.errorHandlingCompliance.score < 80) {
      fixes.push('Improve error handling compliance');
    }
    
    return fixes;
  }

  private generateFixMarkdown(result: any, fixes: string[]): string {
    let markdown = `# Interface Fix Suggestions for ${result.module}\n\n`;
    markdown += `**Interface:** ${result.interface}\n`;
    markdown += `**Current Score:** ${result.score}%\n`;
    markdown += `**Compliant:** ${result.compliant ? 'Yes' : 'No'}\n\n`;
    
    markdown += `## Fix Suggestions\n\n`;
    fixes.forEach((fix, index) => {
      markdown += `${index + 1}. ${fix}\n`;
    });
    
    markdown += `\n## Detailed Analysis\n\n`;
    
    if (result.missingMethods.length > 0) {
      markdown += `### Missing Methods\n`;
      result.missingMethods.forEach((method: string) => {
        markdown += `- \`${method}\`\n`;
      });
      markdown += `\n`;
    }
    
    if (result.missingProperties.length > 0) {
      markdown += `### Missing Properties\n`;
      result.missingProperties.forEach((prop: string) => {
        markdown += `- \`${prop}\`\n`;
      });
      markdown += `\n`;
    }
    
    if (result.missingEvents.length > 0) {
      markdown += `### Missing Events\n`;
      result.missingEvents.forEach((event: string) => {
        markdown += `- \`${event}\`\n`;
      });
      markdown += `\n`;
    }
    
    return markdown;
  }

  private generateHTMLReport(report: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>MIFF Interface Compliance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #333; }
        .stat-label { color: #666; margin-top: 5px; }
        .compliant { color: #28a745; }
        .non-compliant { color: #dc3545; }
        .module-list { margin: 20px 0; }
        .module-item { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .module-name { font-weight: bold; font-size: 1.2em; }
        .module-status { margin-top: 5px; }
        .module-score { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔧 MIFF Interface Compliance Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-value">${this.standardizer.getStats().totalModules}</div>
            <div class="stat-label">Total Modules</div>
        </div>
        <div class="stat-card">
            <div class="stat-value compliant">${this.standardizer.getStats().compliantModules}</div>
            <div class="stat-label">Compliant</div>
        </div>
        <div class="stat-card">
            <div class="stat-value non-compliant">${this.standardizer.getStats().nonCompliantModules}</div>
            <div class="stat-label">Non-Compliant</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${this.standardizer.getStats().averageScore.toFixed(1)}%</div>
            <div class="stat-label">Average Score</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${this.standardizer.getStats().criticalIssues}</div>
            <div class="stat-label">Critical Issues</div>
        </div>
    </div>

    <div class="module-list">
        <h3>Module Compliance Details</h3>
        <pre>${report}</pre>
    </div>
</body>
</html>`;
  }

  private showHelp(): void {
    this.logger.info(`
🔧 MIFF Interface Standardization CLI

Usage: tsx interfaceCLI.ts <command> [options]

Commands:
  standardize [path] [output]      Standardize interfaces across all modules
  check <module>                   Check compliance for specific module
  report [output]                  Generate interface compliance report
  fix <module>                     Generate fix suggestions for module
  help                            Show this help

Examples:
  tsx interfaceCLI.ts standardize miff/pure
  tsx interfaceCLI.ts standardize miff/pure interfaces.json
  tsx interfaceCLI.ts check CombatPure
  tsx interfaceCLI.ts report compliance-report.html
  tsx interfaceCLI.ts fix CombatPure

Interface Standards:
  - manager: Manager modules (CombatPure, HealthSystemPure, etc.)
  - bridge: Bridge modules (UnityBridgePure, GodotBridgePure, etc.)
  - validator: Validator modules (BridgeSchemaPure, etc.)
  - processor: Processor modules (RenderPayloadPure, etc.)
  - renderer: Renderer modules (AudioPure, etc.)

Compliance Levels:
  - 90-100%: Excellent compliance
  - 80-89%: Good compliance
  - 70-79%: Fair compliance
  - 60-69%: Poor compliance
  - <60%: Critical issues
`);
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new InterfaceCLI();
  cli.run().catch(console.error);
}

export default InterfaceCLI;