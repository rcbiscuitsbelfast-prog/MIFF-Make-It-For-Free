# 🧩 MIFF Module Template

**Version:** 1.0  
**Last Updated:** 2025-01-08  
**Status:** Ready for Contributors

---

## 📋 **Module Implementation Guide**

This template provides a standardized way to implement modules in MIFF games, ensuring consistency, testability, and maintainability across all game systems.

### **How to Use This Template**
1. **Copy this template** to your module implementation directory
2. **Fill out all sections** according to your module design
3. **Follow MIFF patterns** for managers, schemas, and CLI integration
4. **Include comprehensive tests** for all module functionality
5. **Update module registry** when adding new modules

---

## 🧩 **Module Implementation**

### **Module Structure**

```
miff/pure/[ModuleName]Pure/
├── Manager.ts              # Main module manager
├── Schema.ts               # Module data schemas
├── CLI.ts                  # CLI harness implementation
├── Bridge.ts               # Bridge integration (if needed)
├── Capable.ts              # Capability introspection (if needed)
├── tests/                  # Test suite
│   ├── Manager.test.ts
│   ├── Schema.test.ts
│   └── CLI.test.ts
├── README.md               # Module documentation
└── index.ts                # Module exports
```

### **Module Schema Definition**

```typescript
// Schema.ts
export interface ModuleConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies: ModuleDependency[];
  capabilities: ModuleCapabilities;
  settings: ModuleSettings;
  metadata: ModuleMetadata;
}

export interface ModuleDependency {
  moduleId: string;
  version: string;
  type: 'required' | 'optional' | 'peer';
  description: string;
}

export interface ModuleCapabilities {
  operations: string[];
  dataTypes: string[];
  integrations: string[];
  hooks: string[];
  cliCommands: string[];
}

export interface ModuleSettings {
  enabled: boolean;
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  performanceMode: 'low' | 'medium' | 'high';
  customSettings: Record<string, any>;
}

export interface ModuleMetadata {
  created: Date;
  updated: Date;
  lastUsed: Date;
  usageCount: number;
  tags: string[];
  category: ModuleCategory;
}

export enum ModuleCategory {
  CORE = 'core',
  GAMEPLAY = 'gameplay',
  UI = 'ui',
  AUDIO = 'audio',
  GRAPHICS = 'graphics',
  NETWORK = 'network',
  STORAGE = 'storage',
  UTILITY = 'utility',
  BRIDGE = 'bridge',
  CUSTOM = 'custom'
}

// Module-specific data interfaces
export interface [ModuleName]Data {
  id: string;
  type: string;
  properties: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface [ModuleName]Options {
  // Define module-specific options
  [key: string]: any;
}

export interface [ModuleName]Result {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}
```

### **Module Manager Implementation**

```typescript
// Manager.ts
import { ModuleConfig, [ModuleName]Data, [ModuleName]Options, [ModuleName]Result } from './Schema.js';
import { EventEmitter } from 'events';

export class [ModuleName]Manager extends EventEmitter {
  private config: ModuleConfig;
  private data: Map<string, [ModuleName]Data> = new Map();
  private isInitialized: boolean = false;
  private stats: ModuleStats;

  constructor(config: Partial<ModuleConfig> = {}) {
    super();
    this.config = this.mergeConfig(config);
    this.stats = this.initializeStats();
  }

  /**
   * Initialize the module
   */
  async initialize(): Promise<[ModuleName]Result> {
    try {
      if (this.isInitialized) {
        return { success: true, data: 'Module already initialized' };
      }

      // Validate dependencies
      const dependencyCheck = await this.validateDependencies();
      if (!dependencyCheck.success) {
        return { success: false, error: dependencyCheck.error };
      }

      // Initialize module-specific resources
      await this.initializeResources();

      // Set up event listeners
      this.setupEventListeners();

      // Mark as initialized
      this.isInitialized = true;

      // Emit initialization event
      this.emit('module:initialized', { moduleId: this.config.id });

      return { success: true, data: 'Module initialized successfully' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Shutdown the module
   */
  async shutdown(): Promise<[ModuleName]Result> {
    try {
      if (!this.isInitialized) {
        return { success: true, data: 'Module not initialized' };
      }

      // Clean up resources
      await this.cleanupResources();

      // Clear data
      this.data.clear();

      // Mark as not initialized
      this.isInitialized = false;

      // Emit shutdown event
      this.emit('module:shutdown', { moduleId: this.config.id });

      return { success: true, data: 'Module shutdown successfully' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Process data through the module
   */
  async processData(data: [ModuleName]Data, options: [ModuleName]Options = {}): Promise<[ModuleName]Result> {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'Module not initialized' };
      }

      // Validate input data
      const validation = this.validateData(data);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Process the data
      const processedData = await this.performProcessing(data, options);

      // Store the result
      this.data.set(data.id, processedData);

      // Update statistics
      this.updateStats('process', 1);

      // Emit processing event
      this.emit('module:dataProcessed', { dataId: data.id, result: processedData });

      return { success: true, data: processedData };
    } catch (error) {
      this.updateStats('error', 1);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get module data by ID
   */
  getData(id: string): [ModuleName]Data | undefined {
    return this.data.get(id);
  }

  /**
   * Get all module data
   */
  getAllData(): [ModuleName]Data[] {
    return Array.from(this.data.values());
  }

  /**
   * Delete module data
   */
  deleteData(id: string): boolean {
    const deleted = this.data.delete(id);
    if (deleted) {
      this.emit('module:dataDeleted', { dataId: id });
    }
    return deleted;
  }

  /**
   * Get module configuration
   */
  getConfig(): ModuleConfig {
    return { ...this.config };
  }

  /**
   * Update module configuration
   */
  updateConfig(updates: Partial<ModuleConfig>): [ModuleName]Result {
    try {
      this.config = { ...this.config, ...updates };
      this.emit('module:configUpdated', { config: this.config });
      return { success: true, data: this.config };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get module statistics
   */
  getStats(): ModuleStats {
    return { ...this.stats };
  }

  /**
   * Get module health status
   */
  getHealthStatus(): ModuleHealthStatus {
    return {
      isInitialized: this.isInitialized,
      isHealthy: this.isInitialized && this.stats.errorCount === 0,
      dataCount: this.data.size,
      lastActivity: this.stats.lastActivity,
      uptime: this.stats.uptime,
      errorRate: this.calculateErrorRate()
    };
  }

  // Private methods
  private mergeConfig(config: Partial<ModuleConfig>): ModuleConfig {
    return {
      id: 'default-module-id',
      name: 'Default Module',
      version: '1.0.0',
      description: 'Default module description',
      author: 'MIFF Team',
      dependencies: [],
      capabilities: {
        operations: [],
        dataTypes: [],
        integrations: [],
        hooks: [],
        cliCommands: []
      },
      settings: {
        enabled: true,
        debugMode: false,
        logLevel: 'info',
        performanceMode: 'medium',
        customSettings: {}
      },
      metadata: {
        created: new Date(),
        updated: new Date(),
        lastUsed: new Date(),
        usageCount: 0,
        tags: [],
        category: ModuleCategory.UTILITY
      },
      ...config
    };
  }

  private async validateDependencies(): Promise<[ModuleName]Result> {
    // Implement dependency validation logic
    return { success: true };
  }

  private async initializeResources(): Promise<void> {
    // Implement resource initialization logic
  }

  private setupEventListeners(): void {
    // Implement event listener setup
  }

  private async cleanupResources(): Promise<void> {
    // Implement resource cleanup logic
  }

  private validateData(data: [ModuleName]Data): { valid: boolean; error?: string } {
    // Implement data validation logic
    return { valid: true };
  }

  private async performProcessing(data: [ModuleName]Data, options: [ModuleName]Options): Promise<[ModuleName]Data> {
    // Implement data processing logic
    return {
      ...data,
      updatedAt: new Date()
    };
  }

  private initializeStats(): ModuleStats {
    return {
      processCount: 0,
      errorCount: 0,
      lastActivity: new Date(),
      uptime: 0,
      startTime: new Date()
    };
  }

  private updateStats(operation: string, count: number): void {
    switch (operation) {
      case 'process':
        this.stats.processCount += count;
        break;
      case 'error':
        this.stats.errorCount += count;
        break;
    }
    this.stats.lastActivity = new Date();
    this.stats.uptime = Date.now() - this.stats.startTime.getTime();
  }

  private calculateErrorRate(): number {
    const total = this.stats.processCount + this.stats.errorCount;
    return total > 0 ? (this.stats.errorCount / total) * 100 : 0;
  }
}

export interface ModuleStats {
  processCount: number;
  errorCount: number;
  lastActivity: Date;
  uptime: number;
  startTime: Date;
}

export interface ModuleHealthStatus {
  isInitialized: boolean;
  isHealthy: boolean;
  dataCount: number;
  lastActivity: Date;
  uptime: number;
  errorRate: number;
}
```

### **Module CLI Harness**

```typescript
// CLI.ts
import { [ModuleName]Manager } from './Manager.js';
import { BaseCLIHarness } from '../shared/cliHarnessTemplate.js';

export class [ModuleName]CLI extends BaseCLIHarness {
  private manager: [ModuleName]Manager;

  constructor() {
    super();
    this.manager = new [ModuleName]Manager();
    this.moduleName = '[ModuleName]';
    this.supportedOperations = [
      'init',
      'shutdown',
      'process',
      'get',
      'list',
      'delete',
      'config',
      'stats',
      'health'
    ];
  }

  async executeOperation(operation: string, args: string[]): Promise<any> {
    switch (operation) {
      case 'init':
        return await this.initializeModule(args);
      case 'shutdown':
        return await this.shutdownModule(args);
      case 'process':
        return await this.processData(args);
      case 'get':
        return await this.getData(args);
      case 'list':
        return await this.listData(args);
      case 'delete':
        return await this.deleteData(args);
      case 'config':
        return await this.manageConfig(args);
      case 'stats':
        return await this.getStats(args);
      case 'health':
        return await this.getHealth(args);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private async initializeModule(args: string[]): Promise<any> {
    const result = await this.manager.initialize();
    return {
      operation: 'init',
      status: result.success ? 'ok' : 'error',
      data: result.data,
      error: result.error
    };
  }

  private async shutdownModule(args: string[]): Promise<any> {
    const result = await this.manager.shutdown();
    return {
      operation: 'shutdown',
      status: result.success ? 'ok' : 'error',
      data: result.data,
      error: result.error
    };
  }

  private async processData(args: string[]): Promise<any> {
    const dataId = args[0];
    const options = this.parseOptions(args.slice(1));

    if (!dataId) {
      throw new Error('Data ID required');
    }

    // Create sample data for processing
    const data = {
      id: dataId,
      type: 'sample',
      properties: {},
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.manager.processData(data, options);
    return {
      operation: 'process',
      status: result.success ? 'ok' : 'error',
      data: result.data,
      error: result.error
    };
  }

  private async getData(args: string[]): Promise<any> {
    const dataId = args[0];
    if (!dataId) {
      throw new Error('Data ID required');
    }

    const data = this.manager.getData(dataId);
    return {
      operation: 'get',
      status: 'ok',
      data: data || null
    };
  }

  private async listData(args: string[]): Promise<any> {
    const allData = this.manager.getAllData();
    return {
      operation: 'list',
      status: 'ok',
      data: allData,
      count: allData.length
    };
  }

  private async deleteData(args: string[]): Promise<any> {
    const dataId = args[0];
    if (!dataId) {
      throw new Error('Data ID required');
    }

    const deleted = this.manager.deleteData(dataId);
    return {
      operation: 'delete',
      status: 'ok',
      deleted,
      dataId
    };
  }

  private async manageConfig(args: string[]): Promise<any> {
    const subcommand = args[0];

    switch (subcommand) {
      case 'get':
        const config = this.manager.getConfig();
        return {
          operation: 'config',
          subcommand: 'get',
          status: 'ok',
          config
        };
      case 'set':
        const updates = this.parseConfigUpdates(args.slice(1));
        const result = this.manager.updateConfig(updates);
        return {
          operation: 'config',
          subcommand: 'set',
          status: result.success ? 'ok' : 'error',
          config: result.data,
          error: result.error
        };
      default:
        throw new Error(`Unknown config subcommand: ${subcommand}`);
    }
  }

  private async getStats(args: string[]): Promise<any> {
    const stats = this.manager.getStats();
    return {
      operation: 'stats',
      status: 'ok',
      stats
    };
  }

  private async getHealth(args: string[]): Promise<any> {
    const health = this.manager.getHealthStatus();
    return {
      operation: 'health',
      status: 'ok',
      health
    };
  }

  private parseOptions(args: string[]): Record<string, any> {
    const options: Record<string, any> = {};
    
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i];
      const value = args[i + 1];
      
      if (key && value) {
        options[key] = this.parseValue(value);
      }
    }
    
    return options;
  }

  private parseConfigUpdates(args: string[]): Record<string, any> {
    const updates: Record<string, any> = {};
    
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i];
      const value = args[i + 1];
      
      if (key && value) {
        updates[key] = this.parseValue(value);
      }
    }
    
    return updates;
  }

  private parseValue(value: string): any {
    // Try to parse as JSON first
    try {
      return JSON.parse(value);
    } catch {
      // If not JSON, return as string
      return value;
    }
  }
}
```

### **Module Test Suite**

```typescript
// Manager.test.ts
import { [ModuleName]Manager } from './Manager.js';
import { ModuleConfig, ModuleCategory } from './Schema.js';

describe('[ModuleName]Manager', () => {
  let manager: [ModuleName]Manager;
  let config: ModuleConfig;

  beforeEach(() => {
    config = {
      id: 'test-module',
      name: 'Test Module',
      version: '1.0.0',
      description: 'Test module for unit testing',
      author: 'Test Author',
      dependencies: [],
      capabilities: {
        operations: ['process', 'validate'],
        dataTypes: ['test-data'],
        integrations: [],
        hooks: [],
        cliCommands: ['init', 'process']
      },
      settings: {
        enabled: true,
        debugMode: false,
        logLevel: 'info',
        performanceMode: 'medium',
        customSettings: {}
      },
      metadata: {
        created: new Date(),
        updated: new Date(),
        lastUsed: new Date(),
        usageCount: 0,
        tags: ['test'],
        category: ModuleCategory.UTILITY
      }
    };
    
    manager = new [ModuleName]Manager(config);
  });

  describe('Module Lifecycle', () => {
    it('should initialize successfully', async () => {
      const result = await manager.initialize();
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('Module initialized successfully');
    });

    it('should shutdown successfully', async () => {
      await manager.initialize();
      const result = await manager.shutdown();
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('Module shutdown successfully');
    });

    it('should handle double initialization gracefully', async () => {
      await manager.initialize();
      const result = await manager.initialize();
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('Module already initialized');
    });
  });

  describe('Data Processing', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should process data successfully', async () => {
      const testData = {
        id: 'test-data-1',
        type: 'test',
        properties: { value: 'test' },
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await manager.processData(testData);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe(testData.id);
    });

    it('should fail to process data when not initialized', async () => {
      const uninitializedManager = new [ModuleName]Manager();
      const testData = {
        id: 'test-data-1',
        type: 'test',
        properties: { value: 'test' },
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await uninitializedManager.processData(testData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Module not initialized');
    });
  });

  describe('Data Management', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should store and retrieve data', async () => {
      const testData = {
        id: 'test-data-1',
        type: 'test',
        properties: { value: 'test' },
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await manager.processData(testData);
      const retrieved = manager.getData('test-data-1');
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-data-1');
    });

    it('should list all data', async () => {
      const testData1 = {
        id: 'test-data-1',
        type: 'test',
        properties: { value: 'test1' },
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const testData2 = {
        id: 'test-data-2',
        type: 'test',
        properties: { value: 'test2' },
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await manager.processData(testData1);
      await manager.processData(testData2);
      
      const allData = manager.getAllData();
      
      expect(allData).toHaveLength(2);
      expect(allData.some(d => d.id === 'test-data-1')).toBe(true);
      expect(allData.some(d => d.id === 'test-data-2')).toBe(true);
    });

    it('should delete data', async () => {
      const testData = {
        id: 'test-data-1',
        type: 'test',
        properties: { value: 'test' },
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await manager.processData(testData);
      const deleted = manager.deleteData('test-data-1');
      
      expect(deleted).toBe(true);
      expect(manager.getData('test-data-1')).toBeUndefined();
    });
  });

  describe('Configuration Management', () => {
    it('should get module configuration', () => {
      const retrievedConfig = manager.getConfig();
      
      expect(retrievedConfig.id).toBe(config.id);
      expect(retrievedConfig.name).toBe(config.name);
    });

    it('should update module configuration', () => {
      const updates = { name: 'Updated Module Name' };
      const result = manager.updateConfig(updates);
      
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Updated Module Name');
    });
  });

  describe('Statistics and Health', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should provide module statistics', () => {
      const stats = manager.getStats();
      
      expect(stats).toHaveProperty('processCount');
      expect(stats).toHaveProperty('errorCount');
      expect(stats).toHaveProperty('lastActivity');
      expect(stats).toHaveProperty('uptime');
    });

    it('should provide health status', () => {
      const health = manager.getHealthStatus();
      
      expect(health).toHaveProperty('isInitialized');
      expect(health).toHaveProperty('isHealthy');
      expect(health).toHaveProperty('dataCount');
      expect(health).toHaveProperty('lastActivity');
      expect(health).toHaveProperty('uptime');
      expect(health).toHaveProperty('errorRate');
    });
  });
});
```

---

## 📚 **Implementation Checklist**

### **Module Structure**
- [ ] Create module directory structure
- [ ] Implement schema definitions
- [ ] Create manager class
- [ ] Implement CLI harness
- [ ] Add bridge integration (if needed)
- [ ] Add capability introspection (if needed)

### **Core Functionality**
- [ ] Implement module lifecycle (init/shutdown)
- [ ] Add data processing capabilities
- [ ] Implement configuration management
- [ ] Add statistics and health monitoring
- [ ] Include error handling and validation

### **CLI Integration**
- [ ] Extend BaseCLIHarness
- [ ] Implement all required operations
- [ ] Add proper argument parsing
- [ ] Include help and usage information
- [ ] Add error handling and validation

### **Testing**
- [ ] Write comprehensive unit tests
- [ ] Test all module operations
- [ ] Test error conditions and edge cases
- [ ] Include integration tests
- [ ] Test CLI functionality

### **Documentation**
- [ ] Document all public APIs
- [ ] Include usage examples
- [ ] Add troubleshooting guide
- [ ] Create contributor guidelines
- [ ] Update module registry

---

## 🎯 **Best Practices**

### **Module Design**
- **Single Responsibility:** Each module should have one clear purpose
- **Loose Coupling:** Minimize dependencies on other modules
- **High Cohesion:** Related functionality should be grouped together
- **Clear Interfaces:** Define clear, stable public APIs

### **Technical Implementation**
- **Error Handling:** Handle all error conditions gracefully
- **Resource Management:** Properly initialize and cleanup resources
- **Performance:** Optimize for expected usage patterns
- **Testing:** Include comprehensive test coverage

### **MIFF Integration**
- **Standards Compliance:** Follow all MIFF architectural patterns
- **CLI Integration:** Implement proper CLI harness
- **Schema Validation:** Include proper data validation
- **Event System:** Use MIFF event system for communication

---

**🧩 Ready to implement modules in your MIFF game! Follow this template to ensure consistency and quality.**