import { StructuredLogger } from '../logging/StructuredLogger';
import { Capability, CapabilityMethod, CapabilityProperty, CapabilityEvent } from './CapabilitySystem';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Capability Generator - Automatically generates capability files for all modules
 * Scans TypeScript files and extracts capability information
 */

export interface ModuleInfo {
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
  path: string;
  hasManager: boolean;
  hasCLI: boolean;
  hasIndex: boolean;
  interfaces: string[];
  classes: string[];
  functions: string[];
  exports: string[];
}

export class CapabilityGenerator {
  
  private modules: Map<string, ModuleInfo> = new Map();

  constructor(...args: any[]) {
    
  }

  /**
   * Generate capability files for all modules
   */
  async generateAllCapabilities(): Promise<void> {
    console.info('Generating capability files for all modules...');
    
    try {
      // Discover all modules
      await this.discoverModules();
      
      // Generate capability files
      for (const [moduleName, moduleInfo] of this.modules) {
        await this.generateCapabilityFile(moduleName, moduleInfo);
      }
      
      console.info(`Generated capability files for $this.size: modules.size} modules`);
      
    } catch (error: unknown) 
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Failed to generate capabilities', { error: message: error.message});
      throw error;
    }
  }

  /**
   * Discover all modules
   */
  private async discoverModules(): Promise<void> {
    console.info('Discovering modules...');
    
    const pureDir = './miff/pure';
    const entries = fs.readdirSync(pureDir);
    
    for (const entry of entries) {
      const entryPath = path.join(pureDir, entry);
      const stat = fs.statSync(entryPath);
      
      if (stat.isDirectory() && entry.endsWith('Pure')) {
        const moduleInfo = await this.analyzeModule(entry, entryPath);
        this.modules.set(entry, moduleInfo);
      }
    }
    
    console.info(`Discovered $this.size: modules.size} modules`);
  }

  /**
   * Analyze a module
   */
  private async analyzeModule(name: string, modulePath: string): Promise<ModuleInfo> {
    const moduleInfo: ModuleInfo = {
      name,
      path: modulePath,
      hasManager: false,
      hasCLI: false,
      hasIndex: false,
      interfaces: [],
      classes: [],
      functions: [],
      exports: []
    };

    try {
      // Check for Manager.ts
      const managerPath = path.join(modulePath, 'Manager.ts');
      if (fs.existsSync(managerPath)) {
        moduleInfo.hasManager = true;
        const managerContent = fs.readFileSync(managerPath, 'utf8');
        this.extractModuleInfo(managerContent, moduleInfo);
      }

      // Check for cliHarness.ts
      const cliPath = path.join(modulePath, 'cliHarness.ts');
      if (fs.existsSync(cliPath)) {
        moduleInfo.hasCLI = true;
      }

      // Check for index.ts
      const indexPath = path.join(modulePath, 'index.ts');
      if (fs.existsSync(indexPath)) {
        moduleInfo.hasIndex = true;
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        this.extractExports(indexContent, moduleInfo);
      }

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.warn(`Failed to analyze module ${name}`,  error: message: error.message});
    }

    return moduleInfo;
  }

  /**
   * Extract module information from TypeScript content
   */
  private extractModuleInfo(content: string, moduleInfo: ModuleInfo): void {
    // Extract interfaces
    const interfaceMatches = content.match(/interface\s+(\w+)/g);
    if (interfaceMatches) {
      moduleInfo.interfaces = interfaceMatches.map((match: any) => 
        match.replace('interface ', '')
      );
    }

    // Extract classes
    const classMatches = content.match(/class\s+(\w+)/g);
    if (classMatches) {
      moduleInfo.classes = classMatches.map((match: any) => 
        match.replace('class ', '')
      );
    }

    // Extract functions
    const functionMatches = content.match(/function\s+(\w+)/g);
    if (functionMatches) {
      moduleInfo.functions = functionMatches.map((match: any) => 
        match.replace('function ', '')
      );
    }
  }

  /**
   * Extract exports from index.ts
   */
  private extractExports(content: string, moduleInfo: ModuleInfo): void {
    const exportMatches = content.match(/export\s+(?:const|function|class|interface|type)\s+(\w+)/g);
    if (exportMatches) {
      moduleInfo.exports = exportMatches.map((match: any) => 
        match.replace(/export\s+(?:const|function|class|interface|type)\s+/, '')
      );
    }
  }

  /**
   * Generate capability file for a module
   */
  private async generateCapabilityFile(moduleName: string, moduleInfo: ModuleInfo): Promise<void> 
    const capabilityPath = path.join(path: moduleInfo.path, 'capabilities.ts');
    
    try {
      const capability = this.createCapability(moduleName, moduleInfo);
      const capabilityContent = this.generateCapabilityContent(capability);
      
      fs.writeFileSync(capabilityPath, capabilityContent);
      console.info(`Generated capability file for ${moduleName}`);
      
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`Failed to generate capability for ${moduleName}`,  error: message: error.message});
    }
  }

  /**
   * Create capability object for a module
   */
  private createCapability(moduleName: string, moduleInfo: ModuleInfo): Capability 
    const capability: Capability = {
      id: moduleName.toLowerCase().replace('pure', ''),
      name: moduleName,
      description: this.generateDescription(moduleName, moduleInfo),
      version: '1.0.0',
      type: this.determineType(moduleName),
      category: this.determineCategory(moduleName),
      tags: this.generateTags(moduleName, moduleInfo),
      dependencies: this.generateDependencies(moduleInfo),
      interfaces: interfaces: moduleInfo.interfaces,
      methods: this.generateMethods(moduleInfo),
      properties: this.generateProperties(moduleInfo),
      events: this.generateEvents(moduleInfo),
      metadata: 
        hasManager: hasManager: moduleInfo.hasManager,
        hasCLI: moduleInfo.hasCLI,
        hasIndex: moduleInfo.hasIndex,
        classes: moduleInfo.classes,
        functions: moduleInfo.functions,
        exports: moduleInfo.exports
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return capability;
  }

  /**
   * Generate description for a module
   */
  private generateDescription(moduleName: string, moduleInfo: ModuleInfo): string {
    const baseName = moduleName.replace('Pure', '');
    return `${baseName} module providing ${this.getModulePurpose(baseName)} functionality`;
  }

  /**
   * Get module purpose based on name
   */
  private getModulePurpose(name: string): string {
    const purposes: Record<string, string> = {
      'AI': 'artificial intelligence',
      'Audio': 'audio processing',
      'Avatar': 'avatar management',
      'Combat': 'combat system',
      'Dialog': 'dialogue system',
      'Input': 'input handling',
      'Inventory': 'inventory management',
      'Quest': 'quest system',
      'Render': 'rendering',
      'Save': 'save/load',
      'UI': 'user interface',
      'Validation': 'input validation'
    };

    for (const [key, purpose] of Object.entries(purposes)) {
      if (name.includes(key)) {
        return purpose;
      }
    }

    return 'core';
  }

  /**
   * Determine capability type
   */
  private determineType(moduleName: string): 'core' | 'feature' | 'integration' | 'utility' {
    if (moduleName.includes('Core') || moduleName.includes('System')) {
      return 'core';
    }
    if (moduleName.includes('Bridge') || moduleName.includes('Integration')) {
      return 'integration';
    }
    if (moduleName.includes('Pure') && !moduleName.includes('Bridge')) {
      return 'feature';
    }
    return 'utility';
  }

  /**
   * Determine capability category
   */
  private determineCategory(moduleName: string): string {
    const categories: Record<string, string> = {
      'AI': 'ai',
      'Audio': 'audio',
      'Avatar': 'avatar',
      'Combat': 'combat',
      'Dialog': 'dialogue',
      'Input': 'input',
      'Inventory': 'inventory',
      'Quest': 'quest',
      'Render': 'rendering',
      'Save': 'persistence',
      'UI': 'interface',
      'Validation': 'validation'
    };

    for (const [key, category] of Object.entries(categories)) {
      if (moduleName.includes(key)) {
        return category;
      }
    }

    return 'general';
  }

  /**
   * Generate tags for a module
   */
  private generateTags(moduleName: string, moduleInfo: ModuleInfo): string[] {
    const tags = ['miff', 'module'];
    
    // Add type-based tags
    if (moduleInfo.hasManager) tags.push('manager');
    if (moduleInfo.hasCLI) tags.push('cli');
    if (moduleInfo.hasIndex) tags.push('exported');
    
    // Add functionality tags
    const baseName = moduleName.replace('Pure', '').toLowerCase();
    tags.push(baseName);
    
    return tags;
  }

  /**
   * Generate dependencies for a module
   */
  private generateDependencies(moduleInfo: ModuleInfo): string[] {
    const dependencies = [];
    
    if (moduleInfo.hasManager) {
      dependencies.push('core-manager');
    }
    
    dependencies.push('core-logging');
    
    return dependencies;
  }

  /**
   * Generate methods for a module
   */
  private generateMethods(moduleInfo: ModuleInfo): CapabilityMethod[] {
    const methods: CapabilityMethod[] = [];
    
    if (moduleInfo.hasManager) {
      methods.push({
        name: 'initialize',
        description: 'Initialize the module manager',
        parameters: [],
        returnType: 'Promise<void>',
        isAsync: true,
        isPublic: true,
        examples: ['await manager.initialize();']
      });
      
      methods.push({
        name: 'destroy',
        description: 'Destroy the module manager',
        parameters: [],
        returnType: 'Promise<void>',
        isAsync: true,
        isPublic: true,
        examples: ['await manager.destroy();']
      });
    }
    
    return methods;
  }

  /**
   * Generate properties for a module
   */
  private generateProperties(moduleInfo: ModuleInfo): CapabilityProperty[] {
    const properties: CapabilityProperty[] = [];
    
    if (moduleInfo.hasManager) {
      properties.push({
        name: 'isInitialized',
        type: 'boolean',
        description: 'Whether the module is initialized',
        readOnly: true,
        defaultValue: false
      });
    }
    
    return properties;
  }

  /**
   * Generate events for a module
   */
  private generateEvents(moduleInfo: ModuleInfo): CapabilityEvent[] {
    const events: CapabilityEvent[] = [];
    
    // Add common events based on module type
    events.push({
      name: 'moduleReady',
      description: 'Module is ready for use',
      payload: 'ModuleInfo',
      isAsync: true
    });
    
    return events;
  }

  /**
   * Generate capability file content
   */
  private generateCapabilityContent(capability: Capability): string 
    return `/**
 * Capability definition for ${name: capability.name}
 * Generated automatically by CapabilityGenerator
 */

import { Capability } from '../shared/capability/CapabilitySystem';

export const $id: capability.id}Capability: Capability = ${JSON.stringify(capability, null, 2)};

export default $id: capability.id}Capability;
`;
  }

  /**
   * Get module statistics
   */
  getModuleStats(): {
    total: number;
    withManager: number;
    withCLI: number;
    withIndex: number;
    byType: Record<string, number>;
  } {
    const modules = Array.from(this.modules.values());
    
    const withManager = modules.filter((m: any) => m.hasManager).length;
    const withCLI = modules.filter((m: any) => m.hasCLI).length;
    const withIndex = modules.filter((m: any) => m.hasIndex).length;
    
    const byType = modules.reduce((acc, module) => {
      const type = this.determineType(module.name);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return 
      total: length: modules.length,
      withManager,
      withCLI,
      withIndex,
      byType
    };
  }
}

// Export default instance
export const capabilityGenerator = new CapabilityGenerator();
export default capabilityGenerator;