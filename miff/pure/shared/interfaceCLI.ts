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
  
  private standardizer: InterfaceStandardizer;

  constructor(...args: any[]) {
    
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
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  private async standardizeInterfaces(args: string[]): Promise<void> {
    const rootPath = args[0] || 'miff/pure';
    const outputFile = args[1] || 'interface-standardization.json';

    console.info(`🔧 Standardizing interfaces in ${rootPath}...`);
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
    
    const results = await this.standardizer.standardizeAllInterfaces(rootPath);
    
    // Save results to file
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    console.info(`✅ Standardized interfaces for ${results.length} modules`);
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
    console.info(`📄 Results saved to ${outputFile}`);

    // Show summary
    const stats = this.standardizer.getStats();
    console.info('\n📊 Standardization Summary:');
    console.info(`Total modules: ${stats.totalModules}`);
    console.info(`Compliant modules: ${stats.compliantModules}`);
    console.info(`Non-compliant modules: ${stats.nonCompliantModules}`);
    console.info(`Average score: ${stats.averageScore.toFixed(1)}%`);
    console.info(`Critical issues: ${stats.criticalIssues}`);
    console.info(`Total recommendations: ${stats.recommendations}`);

    // Show non-compliant modules
    const nonCompliant = this.standardizer.getNonCompliantModules();
    if (nonCompliant.length > 0) {
      console.info('\n❌ Non-Compliant Modules:');
      nonCompliant.forEach(result => {
        console.info(`  ${result.module} (${result.interface}): ${result.score}%`);
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
        if (result.missingMethods.length > 0) {
          console.info(`    Missing methods: ${result.missingMethods.join(', ')}`);
        }
        if (result.missingProperties.length > 0) {
          console.info(`    Missing properties: ${result.missingProperties.join(', ')}`);
        }
      });
    }
  }

  private async checkCompliance(args: string[]): Promise<void> {
    const moduleName = args[0];
    
    if (!moduleName) {
      console.error('❌ Module name required');
      console.error('Usage: tsx interfaceCLI.ts check <module-name>');
      return;
    }

    console.info(`✅ Checking compliance for module: ${moduleName}`);
    
    const results = this.standardizer.getAllResults();
    const result = results.find(r => r.module === moduleName);
    
    if (!result) {
      console.error(`❌ Module not found: ${moduleName}`);
      return;
    }

    console.info(`\n📊 Compliance Check for ${result.module}:`);
    console.info(`Interface: ${result.interface}`);
    console.info(`Compliant: ${result.compliant ? 'Yes' : 'No'}`);
    console.info(`Score: ${result.score}%`);

    if (result.missingMethods.length > 0) {
      console.info(`\n❌ Missing Methods:`);
      result.missingMethods.forEach(method => console.info(`  - ${method}`));
    }

    if (result.extraMethods.length > 0) {
      console.info(`\n⚠️ Extra Methods:`);
      result.extraMethods.forEach(method => console.info(`  - ${method}`));
    }

    if (result.missingProperties.length > 0) {
      console.info(`\n❌ Missing Properties:`);
      result.missingProperties.forEach(prop => console.info(`  - ${prop}`));
    }

    if (result.extraProperties.length > 0) {
      console.info(`\n⚠️ Extra Properties:`);
      result.extraProperties.forEach(prop => console.info(`  - ${prop}`));
    }

    if (result.missingEvents.length > 0) {
      console.info(`\n❌ Missing Events:`);
      result.missingEvents.forEach(event => console.info(`  - ${event}`));
    }

    if (result.extraEvents.length > 0) {
      console.info(`\n⚠️ Extra Events:`);
      result.extraEvents.forEach(event => console.info(`  - ${event}`));
    }

    // Lifecycle compliance
    console.info(`\n🔄 Lifecycle Compliance:`);
    console.info(`  Initialize: ${result.lifecycleCompliance.initialize ? '✅' : '❌'}`);
    console.info(`  Destroy: ${result.lifecycleCompliance.destroy ? '✅' : '❌'}`);
    console.info(`  Update: ${result.lifecycleCompliance.update ? '✅' : '❌'}`);
    console.info(`  Reset: ${result.lifecycleCompliance.reset ? '✅' : '❌'}`);
    console.info(`  Pause: ${result.lifecycleCompliance.pause ? '✅' : '❌'}`);
    console.info(`  Resume: ${result.lifecycleCompliance.resume ? '✅' : '❌'}`);
    console.info(`  Score: ${result.lifecycleCompliance.score.toFixed(1)}%`);

    // Error handling compliance
    console.info(`\n🛡️ Error Handling Compliance:`);
    console.info(`  Throw on Error: ${result.errorHandlingCompliance.throwOnError ? '✅' : '❌'}`);
    console.info(`  Return Error: ${result.errorHandlingCompliance.returnError ? '✅' : '❌'}`);
    console.info(`  Log Errors: ${result.errorHandlingCompliance.logErrors ? '✅' : '❌'}`);
    console.info(`  Error Types: ${result.errorHandlingCompliance.errorTypes.join(', ')}`);
    console.info(`  Score: ${result.errorHandlingCompliance.score.toFixed(1)}%`);

    if (result.recommendations.length > 0) {
      console.info(`\n💡 Recommendations:`);
      result.recommendations.forEach(rec => console.info(`  - ${rec}`));
    }
  }

  private async generateReport(args: string[]): Promise<void> {
    const outputFile = args[0] || 'interface-compliance-report.html';

    console.info('📊 Generating interface compliance report...');
    
    const report = this.standardizer.generateComplianceReport();
    const html = this.generateHTMLReport(report);
    
    // Save report to file
    fs.writeFileSync(outputFile, html);
    
    console.info(`✅ Interface compliance report generated`);
    console.info(`📄 Report saved to ${outputFile}`);
  }

  private async fixInterfaces(args: string[]): Promise<void> {
    const moduleName = args[0];
    
    if (!moduleName) {
      console.error('❌ Module name required');
      console.error('Usage: tsx interfaceCLI.ts fix <module-name>');
      return;
    }

    console.info(`🔧 Fixing interface for module: ${moduleName}`);
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
    
    const results = this.standardizer.getAllResults();
    const result = results.find(r => r.module === moduleName);
    
    if (!result) {
      console.error(`❌ Module not found: ${moduleName}`);
      return;
    }

    if (result.compliant) {
      console.info(`✅ Module ${moduleName} is already compliant`);
      return;
    }

    console.info(`\n🔧 Fixing ${result.module} interface...`);
    
    // Generate fix suggestions
    const fixes = this.generateFixSuggestions(result);
    
    console.info(`\n💡 Fix Suggestions for ${result.module}:`);
    fixes.forEach(fix => console.info(`  - ${fix}`));
    
    // Save fix suggestions to file
    const fixFile = `${moduleName}-interface-fixes.md`;
    fs.writeFileSync(fixFile, this.generateFixMarkdown(result, fixes));
    
    console.info(`\n📄 Fix suggestions saved to ${fixFile}`);
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
    console.info(`
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