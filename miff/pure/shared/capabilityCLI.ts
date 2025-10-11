#!/usr/bin/env tsx

/**
 * Capability Introspection CLI Tool
 * 
 * Command-line interface for discovering, managing, and utilizing module capabilities
 * across the MIFF framework.
 */

import { CapabilityDiscovery, DiscoveryResult, DiscoveryStats } from './CapabilityDiscovery.js';
import { CapabilityRegistryManager } from './CapabilityRegistry.js';
import { EventBus } from '../EventBusPure/index.js';
import * as fs from 'fs';
import * as path from 'path';

class CapabilityCLI {
  private discovery: CapabilityDiscovery;
  private registry: CapabilityRegistryManager;

  constructor() {
    this.discovery = new CapabilityDiscovery();
    this.registry = new CapabilityRegistryManager(new EventBus());
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'discover':
          await this.discoverCapabilities(args.slice(1));
          break;
        case 'list':
          await this.listCapabilities(args.slice(1));
          break;
        case 'help':
          await this.generateHelp(args.slice(1));
          break;
        case 'test':
          await this.generateTests(args.slice(1));
          break;
        case 'report':
          await this.generateReport(args.slice(1));
          break;
        case 'validate':
          await this.validateCapabilities(args.slice(1));
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

  private async discoverCapabilities(args: string[]): Promise<void> {
    const rootPath = args[0] || 'miff/pure';
    const outputFile = args[1] || 'capability-discovery.json';

    console.log(`🔍 Discovering capabilities in ${rootPath}...`);
    
    const results = await this.discovery.discoverAllCapabilities(rootPath);
    
    // Save results to file
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    console.log(`✅ Discovered capabilities for ${results.length} modules`);
    console.log(`📄 Results saved to ${outputFile}`);

    // Show summary
    const stats = this.discovery.getStats();
    console.log('\n📊 Discovery Summary:');
    console.log(`Total modules: ${stats.totalModules}`);
    console.log(`Successful discoveries: ${stats.successfulDiscoveries}`);
    console.log(`Failed discoveries: ${stats.failedDiscoveries}`);
    console.log(`Warning discoveries: ${stats.warningDiscoveries}`);
    console.log(`Total capabilities: ${stats.totalCapabilities}`);
    console.log(`Average capabilities per module: ${stats.averageCapabilitiesPerModule.toFixed(1)}`);

    // Show failed discoveries
    const failed = this.discovery.getResultsByStatus('error');
    if (failed.length > 0) {
      console.log('\n❌ Failed Discoveries:');
      failed.forEach(result => {
        console.log(`  ${result.moduleName}: ${result.errors.join(', ')}`);
      });
    }
  }

  private async listCapabilities(args: string[]): Promise<void> {
    const moduleId = args[0];
    const outputFile = args[1];

    if (!moduleId) {
      console.error('❌ Module ID required');
      console.error('Usage: tsx capabilityCLI.ts list <module-id> [output-file]');
      return;
    }

    console.log(`📋 Listing capabilities for module: ${moduleId}`);
    
    const results = this.discovery.getAllResults();
    const result = results.find(r => r.moduleId === moduleId);
    
    if (!result) {
      console.error(`❌ Module not found: ${moduleId}`);
      return;
    }

    if (result.status !== 'success') {
      console.error(`❌ Module discovery failed: ${result.errors.join(', ')}`);
      return;
    }

    const capabilities = result.capabilities;
    
    console.log(`\n📊 ${result.moduleName} Capabilities:`);
    console.log(`Module ID: ${result.moduleId}`);
    console.log(`File Path: ${result.filePath}`);
    console.log(`Discovered: ${result.discoveredAt.toISOString()}`);

    // Operations
    if (capabilities.operations && capabilities.operations.length > 0) {
      console.log(`\n🔧 Operations (${capabilities.operations.length}):`);
      capabilities.operations.forEach(op => {
        console.log(`  ${op.name}: ${op.description}`);
        console.log(`    Input Schema: ${op.inputSchema.schemaId}`);
        console.log(`    Output Schema: ${op.outputSchema?.schemaId || 'none'}`);
        console.log(`    Complexity: ${op.complexity || 'medium'}`);
      });
    }

    // Data processing
    if (capabilities.dataProcessing && capabilities.dataProcessing.length > 0) {
      console.log(`\n📊 Data Processing (${capabilities.dataProcessing.length}):`);
      capabilities.dataProcessing.forEach(dp => {
        console.log(`  ${dp.name}: ${dp.description}`);
        console.log(`    Input: ${dp.inputTypes.join(', ')} → Output: ${dp.outputTypes.join(', ')}`);
      });
    }

    // Integrations
    if (capabilities.integrations && capabilities.integrations.length > 0) {
      console.log(`\n🔗 Integrations (${capabilities.integrations.length}):`);
      capabilities.integrations.forEach(integration => {
        console.log(`  ${integration.name}: ${integration.description}`);
        console.log(`    Type: ${integration.integrationType}, Target: ${integration.targetSystem || 'N/A'}`);
      });
    }

    // CLI interface (if available)
    console.log(`\n💻 CLI Interface: Available via module CLI`);

    // Save to file if requested
    if (outputFile) {
      const output = {
        moduleId: result.moduleId,
        moduleName: result.moduleName,
        capabilities: capabilities,
        discoveredAt: result.discoveredAt
      };
      fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
      console.log(`\n📄 Capabilities saved to ${outputFile}`);
    }
  }

  private async generateHelp(args: string[]): Promise<void> {
    const moduleId = args[0];
    const outputFile = args[1] || `${moduleId}-help.md`;

    if (!moduleId) {
      console.error('❌ Module ID required');
      console.error('Usage: tsx capabilityCLI.ts help <module-id> [output-file]');
      return;
    }

    console.log(`📖 Generating help for module: ${moduleId}`);
    
    const help = this.discovery.generateDynamicCLIHelp(moduleId);
    
    // Save help to file
    fs.writeFileSync(outputFile, help);
    
    console.log(`✅ Help generated for ${moduleId}`);
    console.log(`📄 Help saved to ${outputFile}`);
    
    // Show preview
    console.log('\n📖 Help Preview:');
    console.log(help.split('\n').slice(0, 20).join('\n'));
    if (help.split('\n').length > 20) {
      console.log('... (truncated)');
    }
  }

  private async generateTests(args: string[]): Promise<void> {
    const moduleId = args[0];
    const outputFile = args[1] || `${moduleId}-tests.test.ts`;

    if (!moduleId) {
      console.error('❌ Module ID required');
      console.error('Usage: tsx capabilityCLI.ts test <module-id> [output-file]');
      return;
    }

    console.log(`🧪 Generating tests for module: ${moduleId}`);
    
    const testTemplate = this.discovery.generateDynamicTestTemplates(moduleId);
    
    // Save test template to file
    fs.writeFileSync(outputFile, testTemplate);
    
    console.log(`✅ Test template generated for ${moduleId}`);
    console.log(`📄 Test template saved to ${outputFile}`);
    
    // Show preview
    console.log('\n🧪 Test Template Preview:');
    console.log(testTemplate.split('\n').slice(0, 30).join('\n'));
    if (testTemplate.split('\n').length > 30) {
      console.log('... (truncated)');
    }
  }

  private async generateReport(args: string[]): Promise<void> {
    const outputFile = args[0] || 'capability-report.html';

    console.log('📊 Generating capability report...');
    
    const results = this.discovery.getAllResults();
    const stats = this.discovery.getStats();
    
    const html = this.generateHTMLReport(results, stats);
    
    // Save report to file
    fs.writeFileSync(outputFile, html);
    
    console.log(`✅ Capability report generated`);
    console.log(`📄 Report saved to ${outputFile}`);
  }

  private async validateCapabilities(args: string[]): Promise<void> {
    const moduleId = args[0];

    if (!moduleId) {
      console.error('❌ Module ID required');
      console.error('Usage: tsx capabilityCLI.ts validate <module-id>');
      return;
    }

    console.log(`✅ Validating capabilities for module: ${moduleId}`);
    
    const results = this.discovery.getAllResults();
    const result = results.find(r => r.moduleId === moduleId);
    
    if (!result) {
      console.error(`❌ Module not found: ${moduleId}`);
      return;
    }

    console.log(`\n📊 Validation Results for ${result.moduleName}:`);
    console.log(`Status: ${result.status.toUpperCase()}`);
    
    if (result.errors.length > 0) {
      console.log(`Errors: ${result.errors.length}`);
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log(`Warnings: ${result.warnings.length}`);
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (result.status === 'success') {
      console.log('✅ Module capabilities are valid');
    } else {
      console.log('❌ Module capabilities have issues');
    }
  }

  private generateHTMLReport(results: DiscoveryResult[], stats: DiscoveryStats): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>MIFF Capability Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #333; }
        .stat-label { color: #666; margin-top: 5px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .module-list { margin: 20px 0; }
        .module-item { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .module-name { font-weight: bold; font-size: 1.2em; }
        .module-status { margin-top: 5px; }
        .capabilities { margin-top: 10px; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧩 MIFF Capability Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-value">${stats.totalModules}</div>
            <div class="stat-label">Total Modules</div>
        </div>
        <div class="stat-card">
            <div class="stat-value success">${stats.successfulDiscoveries}</div>
            <div class="stat-label">Successful</div>
        </div>
        <div class="stat-card">
            <div class="stat-value error">${stats.failedDiscoveries}</div>
            <div class="stat-label">Failed</div>
        </div>
        <div class="stat-card">
            <div class="stat-value warning">${stats.warningDiscoveries}</div>
            <div class="stat-label">Warnings</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.totalCapabilities}</div>
            <div class="stat-label">Total Capabilities</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.averageCapabilitiesPerModule.toFixed(1)}</div>
            <div class="stat-label">Avg per Module</div>
        </div>
    </div>

    <div class="module-list">
        <h3>Module Capabilities</h3>
        ${results.map(result => `
            <div class="module-item">
                <div class="module-name">${result.moduleName}</div>
                <div class="module-status">
                    Status: <span class="${result.status}">${result.status.toUpperCase()}</span> | 
                    Discovered: ${result.discoveredAt.toLocaleString()}
                </div>
                <div class="capabilities">
                    ${result.status === 'success' ? `
                        Operations: ${result.capabilities.operations?.length || 0} | 
                        Data Processing: ${result.capabilities.dataProcessing?.length || 0} | 
                        Integrations: ${result.capabilities.integrations?.length || 0}
                    ` : `
                        Errors: ${result.errors.join(', ')}
                    `}
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }

  private showHelp(): void {
    console.log(`
🧩 MIFF Capability Introspection CLI

Usage: tsx capabilityCLI.ts <command> [options]

Commands:
  discover [path] [output]        Discover capabilities across all modules
  list <module-id> [output]       List capabilities for specific module
  help <module-id> [output]       Generate dynamic CLI help for module
  test <module-id> [output]       Generate dynamic test templates
  report [output]                 Generate comprehensive capability report
  validate <module-id>            Validate module capabilities
  help                            Show this help

Examples:
  tsx capabilityCLI.ts discover miff/pure
  tsx capabilityCLI.ts discover miff/pure capabilities.json
  tsx capabilityCLI.ts list CombatPure
  tsx capabilityCLI.ts help CombatPure combat-help.md
  tsx capabilityCLI.ts test CombatPure combat-tests.test.ts
  tsx capabilityCLI.ts report capability-report.html
  tsx capabilityCLI.ts validate CombatPure

Capability Types:
  - Operations: Module functions and methods
  - Data Processing: Data transformation capabilities
  - Integrations: External system integrations
  - CLI Interface: Command-line interface definitions
  - Lifecycle Hooks: Module lifecycle management
  - Dependencies: Module dependencies and requirements
  - Performance Profile: Performance characteristics
  - Testing Capabilities: Test support and requirements
`);
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new CapabilityCLI();
  cli.run().catch(console.error);
}

export default CapabilityCLI;