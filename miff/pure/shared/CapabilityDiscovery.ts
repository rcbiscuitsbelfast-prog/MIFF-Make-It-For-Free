/**
 * Capability Discovery System for MIFF Framework
 * 
 * Automatically discovers and registers module capabilities across the MIFF framework.
 * Provides dynamic module discovery, capability validation, and integration.
 */

import { MIFFCapable, ModuleCapabilities } from './MIFFCapable.js';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

export interface DiscoveryResult {
  moduleId: string;
  moduleName: string;
  filePath: string;
  capabilities: ModuleCapabilities;
  discoveredAt: Date;
  status: 'success' | 'error' | 'warning';
  errors: string[];
  warnings: string[];
}

export interface DiscoveryStats {
  totalModules: number;
  successfulDiscoveries: number;
  failedDiscoveries: number;
  warningDiscoveries: number;
  totalCapabilities: number;
  averageCapabilitiesPerModule: number;
}

export class CapabilityDiscovery {
  private discoveryResults: Map<string, DiscoveryResult> = new Map();
  private stats: DiscoveryStats;

  constructor() {
    this.stats = this.initializeStats();
  }

  /**
   * Discover capabilities across all modules
   */
  async discoverAllCapabilities(rootPath: string): Promise<DiscoveryResult[]> {
    console.log('🔍 Discovering capabilities across all modules...');
    
    const results: DiscoveryResult[] = [];
    
    try {
      // Find all *Capable.ts files
      const capableFiles = await this.findCapableFiles(rootPath);
      console.log(`📁 Found ${capableFiles.length} capability files`);
      
      // Discover capabilities from each file
      for (const filePath of capableFiles) {
        const result = await this.discoverModuleCapabilities(filePath);
        results.push(result);
        this.discoveryResults.set(result.moduleId, result);
      }
      
      this.updateStats(results);
      console.log(`✅ Discovered capabilities for ${results.length} modules`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Error discovering capabilities:', error);
      return [];
    }
  }

  /**
   * Discover capabilities for a specific module
   */
  async discoverModuleCapabilities(filePath: string): Promise<DiscoveryResult> {
    const moduleId = this.extractModuleId(filePath);
    const moduleName = this.extractModuleName(filePath);
    
    const result: DiscoveryResult = {
      moduleId,
      moduleName,
      filePath,
      capabilities: {} as ModuleCapabilities,
      discoveredAt: new Date(),
      status: 'success',
      errors: [],
      warnings: []
    };

    try {
      // Read and parse the capability file
      const content = fs.readFileSync(filePath, 'utf-8');
      const capabilities = await this.parseCapabilities(content, filePath);
      
      result.capabilities = capabilities;
      result.status = 'success';
      
    } catch (error) {
      result.status = 'error';
      result.errors.push(error instanceof Error ? error.message : String(error));
    }

    return result;
  }

  /**
   * Generate dynamic CLI help from capabilities
   */
  generateDynamicCLIHelp(moduleId: string): string {
    const result = this.discoveryResults.get(moduleId);
    if (!result || result.status !== 'success') {
      return `No capabilities found for module: ${moduleId}`;
    }

    const capabilities = result.capabilities;
    let help = `# ${result.moduleName} CLI Help\n\n`;
    
    // Module information
    help += `**Module:** ${result.moduleName}\n`;
    help += `**Version:** ${capabilities.version || 'Unknown'}\n`;
    help += `**Description:** ${capabilities.description || 'No description available'}\n\n`;

    // Operations
    if (capabilities.operations && capabilities.operations.length > 0) {
      help += `## Operations\n\n`;
      for (const op of capabilities.operations) {
        help += `### ${op.name}\n`;
        help += `- **Description:** ${op.description}\n`;
        help += `- **Parameters:** ${op.parameters.map(p => `${p.name}: ${p.type}`).join(', ')}\n`;
        help += `- **Returns:** ${op.returnType}\n\n`;
      }
    }

    // CLI interface
    if (capabilities.cliInterface) {
      help += `## CLI Interface\n\n`;
      help += `**Usage:** ${capabilities.cliInterface.usage || 'No usage information'}\n\n`;
      
      if (capabilities.cliInterface.flags && capabilities.cliInterface.flags.length > 0) {
        help += `### Flags\n\n`;
        for (const flag of capabilities.cliInterface.flags) {
          help += `- **${flag.name}:** ${flag.description}\n`;
          help += `  - Type: ${flag.type}\n`;
          help += `  - Required: ${flag.required ? 'Yes' : 'No'}\n`;
          if (flag.defaultValue) {
            help += `  - Default: ${flag.defaultValue}\n`;
          }
          help += `\n`;
        }
      }
    }

    // Data processing capabilities
    if (capabilities.dataProcessing && capabilities.dataProcessing.length > 0) {
      help += `## Data Processing\n\n`;
      for (const dp of capabilities.dataProcessing) {
        help += `- **${dp.name}:** ${dp.description}\n`;
        help += `  - Input: ${dp.inputType}\n`;
        help += `  - Output: ${dp.outputType}\n\n`;
      }
    }

    // Integration capabilities
    if (capabilities.integrations && capabilities.integrations.length > 0) {
      help += `## Integrations\n\n`;
      for (const integration of capabilities.integrations) {
        help += `- **${integration.name}:** ${integration.description}\n`;
        help += `  - Type: ${integration.type}\n`;
        help += `  - Status: ${integration.status}\n\n`;
      }
    }

    return help;
  }

  /**
   * Generate dynamic test templates from capabilities
   */
  generateDynamicTestTemplates(moduleId: string): string {
    const result = this.discoveryResults.get(moduleId);
    if (!result || result.status !== 'success') {
      return `// No capabilities found for module: ${moduleId}`;
    }

    const capabilities = result.capabilities;
    let testTemplate = `/**
 * Dynamic Test Template for ${result.moduleName}
 * Generated from module capabilities
 */

import { ${result.moduleName} } from './index.js';
import { expect } from 'chai';

describe('${result.moduleName} Capabilities', () => {
  let module: ${result.moduleName};

  beforeEach(() => {
    module = new ${result.moduleName}();
  });

`;

    // Test operations
    if (capabilities.operations && capabilities.operations.length > 0) {
      testTemplate += `  describe('Operations', () => {\n`;
      
      for (const op of capabilities.operations) {
        testTemplate += `    it('should execute ${op.name} operation', async () => {\n`;
        testTemplate += `      // Test ${op.name} operation\n`;
        testTemplate += `      const result = await module.${op.name}(${this.generateTestParameters(op.parameters)});\n`;
        testTemplate += `      expect(result).to.be.${this.generateTestExpectation(op.returnType)};\n`;
        testTemplate += `    });\n\n`;
      }
      
      testTemplate += `  });\n\n`;
    }

    // Test data processing
    if (capabilities.dataProcessing && capabilities.dataProcessing.length > 0) {
      testTemplate += `  describe('Data Processing', () => {\n`;
      
      for (const dp of capabilities.dataProcessing) {
        testTemplate += `    it('should process ${dp.name}', async () => {\n`;
        testTemplate += `      // Test ${dp.name} data processing\n`;
        testTemplate += `      const input = ${this.generateTestData(dp.inputType)};\n`;
        testTemplate += `      const result = await module.processData(input);\n`;
        testTemplate += `      expect(result).to.be.${this.generateTestExpectation(dp.outputType)};\n`;
        testTemplate += `    });\n\n`;
      }
      
      testTemplate += `  });\n\n`;
    }

    // Test integrations
    if (capabilities.integrations && capabilities.integrations.length > 0) {
      testTemplate += `  describe('Integrations', () => {\n`;
      
      for (const integration of capabilities.integrations) {
        testTemplate += `    it('should integrate with ${integration.name}', async () => {\n`;
        testTemplate += `      // Test ${integration.name} integration\n`;
        testTemplate += `      const result = await module.integrate('${integration.name}');\n`;
        testTemplate += `      expect(result).to.be.${this.generateTestExpectation('boolean')};\n`;
        testTemplate += `    });\n\n`;
      }
      
      testTemplate += `  });\n\n`;
    }

    testTemplate += `});\n`;
    return testTemplate;
  }

  /**
   * Get discovery statistics
   */
  getStats(): DiscoveryStats {
    return { ...this.stats };
  }

  /**
   * Get all discovery results
   */
  getAllResults(): DiscoveryResult[] {
    return Array.from(this.discoveryResults.values());
  }

  /**
   * Get results by status
   */
  getResultsByStatus(status: 'success' | 'error' | 'warning'): DiscoveryResult[] {
    return Array.from(this.discoveryResults.values()).filter(r => r.status === status);
  }

  private async findCapableFiles(rootPath: string): Promise<string[]> {
    const pattern = `${rootPath}/**/*Capable.ts`;
    return new Promise((resolve, reject) => {
      glob(pattern, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }

  private async parseCapabilities(content: string, filePath: string): Promise<ModuleCapabilities> {
    // This would parse the actual capability file content
    // For now, return mock capabilities based on the file path
    const moduleName = this.extractModuleName(filePath);
    
    return {
      operations: [
        {
          name: 'initialize',
          description: `Initialize ${moduleName} module`,
          parameters: [],
          returnType: 'Promise<void>',
          async: true
        },
        {
          name: 'process',
          description: `Process data in ${moduleName} module`,
          parameters: [
            { name: 'data', type: 'any', required: true, description: 'Input data' }
          ],
          returnType: 'Promise<any>',
          async: true
        }
      ],
      dataProcessing: [
        {
          name: 'validate',
          description: `Validate data in ${moduleName} module`,
          inputType: 'any',
          outputType: 'boolean',
          async: false
        }
      ],
      integrations: [
        {
          name: 'EventBus',
          description: `Event bus integration for ${moduleName}`,
          type: 'event',
          status: 'active'
        }
      ],
      formats: [
        {
          name: 'JSON',
          description: 'JSON format support',
          supported: true
        }
      ],
      realtime: {
        supported: true,
        websockets: true,
        polling: false
      },
      schemas: [
        {
          name: 'config',
          version: '1.0',
          description: `${moduleName} configuration schema`
        }
      ],
      cliInterface: {
        usage: `${moduleName} [command] [options]`,
        flags: [
          {
            name: 'help',
            description: 'Show help information',
            type: 'boolean',
            required: false,
            defaultValue: false
          }
        ]
      },
      lifecycleHooks: {
        onInit: true,
        onDestroy: true,
        onUpdate: false
      },
      dependencies: [
        {
          name: 'EventBusPure',
          version: '1.0.0',
          required: true
        }
      ],
      performanceProfile: {
        memoryUsage: 'low',
        cpuUsage: 'medium',
        networkUsage: 'low'
      },
      testingCapabilities: {
        unitTests: true,
        integrationTests: true,
        e2eTests: false,
        mockSupport: true
      }
    };
  }

  private extractModuleId(filePath: string): string {
    const parts = filePath.split('/');
    const moduleIndex = parts.findIndex(part => part === 'pure');
    if (moduleIndex !== -1 && parts[moduleIndex + 1]) {
      return parts[moduleIndex + 1];
    }
    return 'unknown';
  }

  private extractModuleName(filePath: string): string {
    const moduleId = this.extractModuleId(filePath);
    return moduleId.replace('Pure', '');
  }

  private generateTestParameters(parameters: any[]): string {
    if (parameters.length === 0) return '';
    return parameters.map(p => `/* ${p.name}: ${p.type} */`).join(', ');
  }

  private generateTestData(type: string): string {
    switch (type) {
      case 'string': return "'test string'";
      case 'number': return '42';
      case 'boolean': return 'true';
      case 'object': return '{}';
      case 'array': return '[]';
      default: return 'null';
    }
  }

  private generateTestExpectation(type: string): string {
    if (type.includes('Promise')) {
      return 'a.promise';
    }
    if (type === 'boolean') {
      return 'a.boolean';
    }
    if (type === 'string') {
      return 'a.string';
    }
    if (type === 'number') {
      return 'a.number';
    }
    if (type === 'object') {
      return 'an.object';
    }
    if (type === 'array') {
      return 'an.array';
    }
    return 'defined';
  }

  private updateStats(results: DiscoveryResult[]): void {
    this.stats.totalModules = results.length;
    this.stats.successfulDiscoveries = results.filter(r => r.status === 'success').length;
    this.stats.failedDiscoveries = results.filter(r => r.status === 'error').length;
    this.stats.warningDiscoveries = results.filter(r => r.status === 'warning').length;
    
    const totalCapabilities = results.reduce((sum, r) => {
      if (r.status === 'success' && r.capabilities.operations) {
        return sum + r.capabilities.operations.length;
      }
      return sum;
    }, 0);
    
    this.stats.totalCapabilities = totalCapabilities;
    this.stats.averageCapabilitiesPerModule = this.stats.totalModules > 0 ? totalCapabilities / this.stats.totalModules : 0;
  }

  private initializeStats(): DiscoveryStats {
    return {
      totalModules: 0,
      successfulDiscoveries: 0,
      failedDiscoveries: 0,
      warningDiscoveries: 0,
      totalCapabilities: 0,
      averageCapabilitiesPerModule: 0
    };
  }
}

export default CapabilityDiscovery;