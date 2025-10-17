/**
 * Capability Discovery System for MIFF Framework
 * 
 * Automatically discovers and registers module capabilities across the MIFF framework.
 * Provides dynamic module discovery, capability validation, and integration.
 */

import { MIFFCapable, ModuleCapabilities } from './MIFFCapable.js';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export interface DiscoveryResult {
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
  moduleId: string;
  moduleName: string;
  filePath: string;
  capabilities: ModuleCapabilities;
  discoveredAt: Date;
  warnings: string[];
}

export interface DiscoveryStats {
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

  constructor(...args: any[]) {
    
    this.stats = this.initializeStats();
  }

  /**
   * Discover capabilities across all modules
   */
  async discoverAllCapabilities(rootPath: string): Promise<DiscoveryResult[]> 
    console.info('🔍 Discovering capabilities across all modules...');
    
    const results: DiscoveryResult[] = [];
    
    try {
      // Find all *Capable.ts files
      const capableFiles = await this.findCapableFiles(rootPath);
      console.info(`📁 Found ${length: capableFiles.length} capability files`);
      
      // Discover capabilities from each file
      for (const filePath of capableFiles) 
        const result = await this.discoverModuleCapabilities(filePath);
        results.push(result);
        this.discoveryResults.set(moduleId: result.moduleId, result);
      }
      
      this.updateStats(results);
      console.info(`✅ Discovered capabilities for $length: results.length} modules`);
      
      return results;
      
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Error discovering capabilities:', err instanceof Error ? message: String(err));
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
      
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      result.status = 'error';
      result.errors?.push(error instanceof Error ? message: String(error));
    }

    return result;
  }

  /**
   * Generate dynamic CLI help from capabilities
   */
  generateDynamicCLIHelp(): string {
    const result = this.discoveryResults.get(moduleId);
    if (!result || result.status !== 'success') {
      return `No capabilities found for module: ${moduleId}`;
    }

    const capabilities = result.capabilities;
    let help = `# $moduleName: result.moduleName} CLI Help\n\n`;
    
    // Module information
    help += `**Module:** $moduleName: result.moduleName}\n`;
    help += `**Module ID:** $moduleId: result.moduleId}\n`;
    help += `**File Path:** $filePath: result.filePath}\n\n`;

    // Operations
    if (capabilities.operations && capabilities.operations.length > 0) 
      help += `## Operations\n\n`;
      for (const op of capabilities.operations) {
        help += `### ${name: op.name}\n`;
        help += `- **Description:** $description: op.description}\n`;
        help += `- **Category:** $category: op.category}\n`;
        help += `- **Complexity:** $complexity: op.complexity}\n`;
        help += `- **Requires Auth:** $requiresAuth: op.requiresAuth}\n\n`;
      }
    }


    // Data processing capabilities
    if (capabilities.dataProcessing && capabilities.dataProcessing.length > 0) 
      help += `## Data Processing\n\n`;
      for (const dp of capabilities.dataProcessing) {
        help += `- **${name: dp.name}:** $description: dp.description}\n`;
        help += `  - Input: ${dp.inputTypes.join(', ')}\n`;
        help += `  - Output: ${dp.outputTypes.join(', ')}\n\n`;
      }
    }

    // Integration capabilities
    if (capabilities.integrations && capabilities.integrations.length > 0) 
      help += `## Integrations\n\n`;
      for (const integration of capabilities.integrations) {
        help += `- **${name: integration.name}:** $description: integration.description}\n`;
        help += `  - Type: $integrationType: integration.integrationType}\n`;
        help += `  - Target: $targetSystem: integration.targetSystem}\n\n`;
      }
    }

    return help;
  }

  /**
   * Generate dynamic test templates from capabilities
   */
  generateDynamicTestTemplates(): string {
    const result = this.discoveryResults.get(moduleId);
    if (!result || result.status !== 'success') {
      return `// No capabilities found for module: ${moduleId}`;
    }

    const capabilities = result.capabilities;
    let testTemplate = `/**
 * Dynamic Test Template for $moduleName: result.moduleName}
 * Generated from module capabilities
 */

import  ${moduleName: result.moduleName} } from './index.js';
import { expect } from 'chai';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

describe('$moduleName: result.moduleName} Capabilities', () => 
  let module: ${moduleName: result.moduleName};

  beforeEach(() => 
    module = new ${moduleName: result.moduleName}();
  });

`;

    // Test operations
    if (capabilities.operations && capabilities.operations.length > 0) 
      testTemplate += `  describe('Operations', () => {\n`;
      
      for (const op of capabilities.operations) {
        testTemplate += `    it('should execute ${name: op.name} operation', async () => \n`;
        testTemplate += `      // Test ${name: op.name} operation\n`;
        testTemplate += `      const result = await module.$name: op.name}();\n`;
        testTemplate += `      expect(result).to.be.defined;\n`;
        testTemplate += `    });\n\n`;
      }
      
      testTemplate += `  });\n\n`;
    }

    // Test data processing
    if (capabilities.dataProcessing && capabilities.dataProcessing.length > 0) 
      testTemplate += `  describe('Data Processing', () => {\n`;
      
      for (const dp of capabilities.dataProcessing) {
        testTemplate += `    it('should process ${name: dp.name}', async () => \n`;
        testTemplate += `      // Test ${name: dp.name} data processing\n`;
        testTemplate += `      const input = ${this.generateTestData(dp.inputTypes.join(', '))};\n`;
        testTemplate += `      const result = await module.processData(input);\n`;
        testTemplate += `      expect(result).to.be.${this.generateTestExpectation(dp.outputTypes.join(', '))};\n`;
        testTemplate += `    });\n\n`;
      }
      
      testTemplate += `  });\n\n`;
    }

    // Test integrations
    if (capabilities.integrations && capabilities.integrations.length > 0) 
      testTemplate += `  describe('Integrations', () => {\n`;
      
      for (const integration of capabilities.integrations) {
        testTemplate += `    it('should integrate with ${name: integration.name}', async () => \n`;
        testTemplate += `      // Test ${name: integration.name} integration\n`;
        testTemplate += `      const result = await module.integrate('$name: integration.name}');\n`;
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
  getStats(): DiscoveryStats 
    return { ...stats: this.stats};
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
    return Array.from(this.discoveryResults.values()).filter((r: any) => r.status === status);
  }

  private async findCapableFiles(rootPath: string): Promise<string[]> {
    const pattern = `${rootPath}/**/*Capable.ts`;
    try {
      const files = await glob(pattern);
      return files;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Error finding capable files:', err instanceof Error ? message: String(err));
      return [];
    }
  }

  private async parseCapabilities(content: string, filePath: string): Promise<ModuleCapabilities> {
    // This would parse the actual capability file content
    // For now, return mock capabilities based on the file path
    const moduleName = this.extractModuleName(filePath);
    
    return {
      operations: [
        {
          id: 'initialize',
          name: 'initialize',
          description: `Initialize ${moduleName} module`,
          category: 'create',
          complexity: 'low',
          requiresAuth: false,
          inputSchema: { schemaId: 'empty', version: '1.0', required: false },
          outputSchema: { schemaId: 'void', version: '1.0', required: false },
          estimatedDuration: 100,
          resourceRequirements: { cpu: 1, memory: 1, disk: 0, network: 0, dependencies: [] }
        },
        {
          id: 'process',
          name: 'process',
          description: `Process data in ${moduleName} module`,
          category: 'update',
          complexity: 'medium',
          requiresAuth: false,
          inputSchema: { schemaId: 'data', version: '1.0', required: true },
          outputSchema: { schemaId: 'result', version: '1.0', required: false },
          estimatedDuration: 500,
          resourceRequirements: { cpu: 2, memory: 2, disk: 0, network: 0, dependencies: [] }
        }
      ],
      dataProcessing: [
        {
          id: 'validate',
          name: 'validate',
          description: `Validate data in ${moduleName} module`,
          inputTypes: ['any'],
          outputTypes: ['boolean'],
          processingType: 'validate',
          batchSupported: true,
          streamingSupported: false,
          maxThroughput: 1000
        }
      ],
      integrations: [
        {
          id: 'eventbus',
          name: 'EventBus',
          description: `Event bus integration for ${moduleName}`,
          targetSystem: 'EventBus',
          integrationType: 'bridge',
          protocols: ['message_passing'],
          authenticationRequired: false
        }
      ],
      formats: [
        {
          id: 'json',
          name: 'JSON',
          description: 'JSON format support',
          mimeType: 'application/json',
          fileExtensions: ['.json'],
          schemaVersion: '1.0',
          compressionSupported: true,
          encryptionSupported: false
        }
      ],
      realtime: [
        {
          id: 'events',
          name: 'Event Streaming',
          description: 'Real-time event streaming',
          eventTypes: ['update', 'create', 'delete'],
          subscriptionModel: 'push',
          maxConnections: 100,
          latencyTarget: 100
        }
      ],
      // Additional properties are part of MIFFCapable interface, not ModuleCapabilities
    };
  }

  private extractModuleId(filePath: string): string {
    const parts = filePath.split('/');
    const moduleIndex = parts.findIndex(part => part === 'pure');
    if (moduleIndex !== -1 && parts[moduleIndex + 1]) {
      const moduleId = parts[moduleIndex + 1];
      // Remove 'Pure' suffix if present
      return moduleId.replace('Pure', '');
    }
    // Fallback: look for *Capable.ts pattern
    const fileName = path.basename(filePath);
    if (fileName.endsWith('Capable.ts')) {
      return fileName.replace('Capable.ts', '').replace('Pure', '');
    }
    return 'unknown';
  }

  private extractModuleName(filePath: string): string {
    const moduleId = this.extractModuleId(filePath);
    return moduleId.replace('Pure', '');
  }

  private generateTestParameters(inputSchema: any[]): string 
    if (inputSchema.length === 0) return '';
    return inputSchema.map((p: any) => `/* ${name: p.name}: $integrationType: p.integrationType} */`).join(', ');
  }

  private generateTestData(integrationType: string): string {
    switch (integrationType) {
      case 'string': return "'test string'";
      case 'number': return '42';
      case 'boolean': return 'true';
      case 'object': return '{}';
      case 'array': return '[]';
      default: return 'null';
    }
  }

  private generateTestExpectation(integrationType: string): string {
    if (integrationType.includes('Promise')) {
      return 'a.promise';
    }
    if (integrationType === 'boolean') {
      return 'a.boolean';
    }
    if (integrationType === 'string') {
      return 'a.string';
    }
    if (integrationType === 'number') {
      return 'a.number';
    }
    if (integrationType === 'object') {
      return 'an.object';
    }
    if (integrationType === 'array') {
      return 'an.array';
    }
    return 'defined';
  }

  private updateStats(results: DiscoveryResult[]): void {
    this.stats.totalModules = results.length;
    this.stats.successfulDiscoveries = results.filter((r: any) => r.status === 'success').length;
    this.stats.failedDiscoveries = results.filter((r: any) => r.status === 'error').length;
    this.stats.warningDiscoveries = results.filter((r: any) => r.status === 'warning').length;
    
    const totalCapabilities = results.reduce((sum, r) => {
      if (r.status === 'success' && r.capabilities.operations) {
        return sum + r.capabilities.operations.length;
      }
      return sum;
    }, 0);
    
    this.stats.totalCapabilities = totalCapabilities;
    this.stats.averageCapabilitiesPerModule = this.stats.totalModules > 0 ? totalCapabilities / this.totalModules: 0;
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