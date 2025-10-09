/**
 * Capability Registry Implementation
 * 
 * Centralized registry for managing module capabilities across the MIFF framework.
 * Provides discovery, validation, and reporting capabilities.
 */

import { CapabilityManager, CapabilityRegistry } from './MIFFCapable.js';
import { EventBus } from '../EventBusPure/index.js';
import * as fs from 'fs';
import * as path from 'path';

export class CapabilityRegistryManager extends CapabilityManager {
  private dataPath: string;
  private isInitialized: boolean = false;

  constructor(eventBus: EventBus, dataPath: string = 'data/capabilities') {
    super(eventBus);
    this.dataPath = dataPath;
  }

  /**
   * Initialize the capability registry
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🧩 Initializing Capability Registry...');

    // Ensure data directory exists
    await this.ensureDataDirectory();

    // Load existing capabilities
    await this.loadCapabilities();

    // Auto-discover and register modules
    await this.autoDiscoverModules();

    this.isInitialized = true;
    console.log(`✅ Capability Registry initialized`);
  }

  /**
   * Auto-discover modules with MIFFCapable implementations
   */
  private async autoDiscoverModules(): Promise<void> {
    console.log('🔍 Auto-discovering modules with MIFFCapable implementations...');

    const modulesPath = path.join(process.cwd(), 'miff/pure');
    const moduleDirs = fs.readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const moduleDir of moduleDirs) {
      try {
        // Look for *Capable.ts files
        const capableFiles = fs.readdirSync(path.join(modulesPath, moduleDir))
          .filter(file => file.endsWith('Capable.ts'));

        for (const capableFile of capableFiles) {
          const modulePath = path.join(modulesPath, moduleDir, capableFile);
          const moduleName = capableFile.replace('Capable.ts', '');
          
          try {
            // Dynamic import of the capability module
            const module = await import(`../${moduleDir}/${capableFile}`);
            const CapableClass = module.default || module[`${moduleName}Capable`];
            
            if (CapableClass && typeof CapableClass === 'function') {
              const capability = new CapableClass();
              this.registerModule(capability);
              console.log(`📦 Registered capabilities for ${capability.moduleName}`);
            }
          } catch (error) {
            console.warn(`⚠️ Failed to load capabilities for ${moduleDir}/${capableFile}:`, error);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to scan module directory ${moduleDir}:`, error);
      }
    }
  }

  /**
   * Generate comprehensive capability report
   */
  async generateComprehensiveReport(): Promise<string> {
    let report = '# MIFF Capability Comprehensive Report\n\n';
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Total Modules:** 0\n\n`;

    // Executive Summary
    const totalOperations = 0;
    const totalIntegrations = 0;
    const totalFormats = 0;

    report += `## Executive Summary\n`;
    report += `- **Total Operations:** ${totalOperations}\n`;
    report += `- **Total Integrations:** ${totalIntegrations}\n`;
    report += `- **Total Formats:** ${totalFormats}\n`;
    report += `- **Average Operations per Module:** 0\n\n`;

    // Module Capabilities - TODO: Implement module listing
    report += `## Module Capabilities\n\n`;
    report += `No modules available.\n\n`;

      // Operations
      report += `#### Operations (${module.capabilities.operations.length})\n`;
      for (const op of module.capabilities.operations) {
        const complexityIcon = this.getComplexityIcon(op.complexity);
        report += `- ${complexityIcon} **${op.name}** (${op.category}): ${op.description}\n`;
        report += `  - Duration: ${op.estimatedDuration}ms | Memory: ${op.resourceRequirements.memory}MB\n`;
      }

      // Data Processing
      if (module.capabilities.dataProcessing.length > 0) {
        report += `\n#### Data Processing (${module.capabilities.dataProcessing.length})\n`;
        for (const dp of module.capabilities.dataProcessing) {
          report += `- **${dp.name}**: ${dp.description}\n`;
          report += `  - Types: ${dp.inputTypes.join(', ')} → ${dp.outputTypes.join(', ')}\n`;
          report += `  - Throughput: ${dp.maxThroughput} items/sec\n`;
        }
      }

      // Integrations
      if (module.capabilities.integrations.length > 0) {
        report += `\n#### Integrations (${module.capabilities.integrations.length})\n`;
        for (const integration of module.capabilities.integrations) {
          report += `- **${integration.name}** (${integration.targetSystem}): ${integration.description}\n`;
          report += `  - Type: ${integration.integrationType} | Protocols: ${integration.protocols.join(', ')}\n`;
        }
      }

      // Formats
      if (module.capabilities.formats.length > 0) {
        report += `\n#### Formats (${module.capabilities.formats.length})\n`;
        for (const format of module.capabilities.formats) {
          report += `- **${format.name}** (${format.mimeType}): ${format.description}\n`;
          report += `  - Extensions: ${format.fileExtensions.join(', ')} | Version: ${format.schemaVersion}\n`;
        }
      }

      // Performance Profile
      report += `\n#### Performance Profile\n`;
      report += `- **Memory:** ${module.performanceProfile.memory.baseUsage}MB base, ${module.performanceProfile.memory.peakUsage}MB peak\n`;
      report += `- **CPU:** ${module.performanceProfile.cpu.baseUsage}% base, ${module.performanceProfile.cpu.peakUsage}% peak\n`;
      report += `- **Scalability:** ${module.performanceProfile.scalability.maxConcurrentUsers} users, ${module.performanceProfile.scalability.maxDataSize}MB max data\n`;

      report += `\n---\n\n`;
    }

    // Capability Analysis
    report += `## Capability Analysis\n\n`;

    // Operation Categories
    const operationCategories = new Map<string, number>();
    for (const module of // TODO: Access registry through public methods.modules.values()) {
      for (const op of module.capabilities.operations) {
        const count = operationCategories.get(op.category) || 0;
        operationCategories.set(op.category, count + 1);
      }
    }

    report += `### Operation Categories\n`;
    for (const [category, count] of operationCategories) {
      report += `- **${category}:** ${count} operations\n`;
    }

    // Integration Types
    const integrationTypes = new Map<string, number>();
    for (const module of // TODO: Access registry through public methods.modules.values()) {
      for (const integration of module.capabilities.integrations) {
        const count = integrationTypes.get(integration.integrationType) || 0;
        integrationTypes.set(integration.integrationType, count + 1);
      }
    }

    report += `\n### Integration Types\n`;
    for (const [type, count] of integrationTypes) {
      report += `- **${type}:** ${count} integrations\n`;
    }

    // Performance Analysis
    report += `\n### Performance Analysis\n`;
    const memoryUsage = Array.from(// TODO: Access registry through public methods.modules.values())
      .map(m => m.performanceProfile.memory.peakUsage);
    const avgMemory = memoryUsage.reduce((sum, usage) => sum + usage, 0) / memoryUsage.length;
    const maxMemory = Math.max(...memoryUsage);

    report += `- **Average Peak Memory:** ${avgMemory.toFixed(1)}MB\n`;
    report += `- **Maximum Peak Memory:** ${maxMemory}MB\n`;
    report += `- **Memory Distribution:** ${memoryUsage.filter(m => m < 100).length} low, ${memoryUsage.filter(m => m >= 100 && m < 500).length} medium, ${memoryUsage.filter(m => m >= 500).length} high\n`;

    // Recommendations
    report += `\n## Recommendations\n\n`;
    
    // High memory usage modules
    const highMemoryModules = Array.from(// TODO: Access registry through public methods.modules.values())
      .filter(m => m.performanceProfile.memory.peakUsage > 500);
    if (highMemoryModules.length > 0) {
      report += `### High Memory Usage Modules\n`;
      for (const module of highMemoryModules) {
        report += `- **${module.moduleName}:** ${module.performanceProfile.memory.peakUsage}MB peak usage\n`;
      }
      report += `\nConsider optimizing memory usage or implementing memory pooling.\n\n`;
    }

    // Missing integrations
    const modulesWithoutIntegrations = Array.from(// TODO: Access registry through public methods.modules.values())
      .filter(m => m.capabilities.integrations.length === 0);
    if (modulesWithoutIntegrations.length > 0) {
      report += `### Modules Without Integrations\n`;
      for (const module of modulesWithoutIntegrations) {
        report += `- **${module.moduleName}:** Consider adding integration capabilities\n`;
      }
      report += `\n`;
    }

    return report;
  }

  /**
   * Generate capability discovery CLI help
   */
  generateDiscoveryHelp(): string {
    let help = '# MIFF Capability Discovery\n\n';
    help += `**Available Modules:** ${// TODO: Access registry through public methods.modules.size}\n\n`;

    help += `## Quick Discovery Commands\n\n`;
    help += `\`\`\`bash\n`;
    help += `# Find modules by operation\n`;
    help += `tsx capabilityCLI.ts find --operation create\n`;
    help += `tsx capabilityCLI.ts find --operation simulate\n\n`;
    help += `# Find modules by data type\n`;
    help += `tsx capabilityCLI.ts find --data-type Vector3\n`;
    help += `tsx capabilityCLI.ts find --data-type JSON\n\n`;
    help += `# Find modules by integration\n`;
    help += `tsx capabilityCLI.ts find --integration Unity\n`;
    help += `tsx capabilityCLI.ts find --integration MIFF\n\n`;
    help += `# Find modules by format\n`;
    help += `tsx capabilityCLI.ts find --format json\n`;
    help += `tsx capabilityCLI.ts find --format unity\n\n`;
    help += `# Generate dynamic CLI help\n`;
    help += `tsx capabilityCLI.ts help UnityBridgePure\n`;
    help += `tsx capabilityCLI.ts help GodotBridgePure\n\n`;
    help += `# Validate module capabilities\n`;
    help += `tsx capabilityCLI.ts validate UnityBridgePure\n`;
    help += `tsx capabilityCLI.ts validate --all\n`;
    help += `\`\`\`\n\n`;

    help += `## Available Modules\n\n`;
    for (const module of // TODO: Access registry through public methods.modules.values()) {
      help += `### ${module.moduleName}\n`;
      help += `- **ID:** ${module.moduleId}\n`;
      help += `- **Version:** ${module.version}\n`;
      help += `- **Operations:** ${module.capabilities.operations.length}\n`;
      help += `- **Integrations:** ${module.capabilities.integrations.length}\n`;
      help += `- **Formats:** ${module.capabilities.formats.length}\n\n`;
    }

    return help;
  }

  private async ensureDataDirectory(): Promise<void> {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  private async loadCapabilities(): Promise<void> {
    const capabilitiesPath = path.join(this.dataPath, 'capabilities.json');
    
    if (fs.existsSync(capabilitiesPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(capabilitiesPath, 'utf-8'));
        // Note: In a real implementation, you'd deserialize the capabilities
        console.log(`📂 Loaded capabilities from storage`);
      } catch (error) {
        console.warn('⚠️ Failed to load capabilities:', error);
      }
    }
  }

  private getComplexityIcon(complexity: string): string {
    switch (complexity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📝';
      case 'low': return 'ℹ️';
      default: return '❓';
    }
  }
}

export default CapabilityRegistryManager;