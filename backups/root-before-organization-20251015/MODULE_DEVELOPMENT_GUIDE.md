# Module Development Guide

## 🏗️ Building Modules for the MIFF Framework

This comprehensive guide will help you create, develop, and maintain modules for the MIFF Framework.

---

## 📋 Table of Contents

1. [Module Architecture](#module-architecture)
2. [Creating a New Module](#creating-a-new-module)
3. [Module Structure](#module-structure)
4. [Manager Pattern](#manager-pattern)
5. [Testing Guidelines](#testing-guidelines)
6. [Capability System](#capability-system)
7. [Best Practices](#best-practices)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

---

## 🏛️ Module Architecture

### **Core Principles**

The MIFF Framework follows a modular architecture where each module is:
- **Self-contained**: Has its own logic, tests, and documentation
- **Discoverable**: Exposes capabilities through the capability system
- **Testable**: Has comprehensive test coverage
- **Maintainable**: Follows consistent patterns and conventions

### **Module Types**

1. **Core Modules**: Essential framework functionality
2. **Feature Modules**: Game features and mechanics
3. **Integration Modules**: External system integrations
4. **Utility Modules**: Helper functions and tools

---

## 🆕 Creating a New Module

### **Step 1: Module Planning**

Before creating a module, consider:
- **Purpose**: What problem does this module solve?
- **Dependencies**: What other modules does it need?
- **Interfaces**: What APIs will it expose?
- **Testing**: How will you test it?

### **Step 2: Create Module Directory**

```bash
# Navigate to the pure modules directory
cd miff/pure/

# Create your module directory (use Pure suffix)
mkdir YourModulePure
cd YourModulePure
```

### **Step 3: Module Structure**

Create the following files:
```
YourModulePure/
├── Manager.ts          # Core module logic
├── index.ts           # Public API exports
├── capabilities.ts    # Module capabilities
├── tests/            # Test files
│   └── YourModule.test.ts
└── README.md         # Module documentation
```

---

## 📁 Module Structure

### **Manager.ts - Core Module Logic**

The Manager.ts file contains the main module implementation:

```typescript
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import { MemoryManager } from '../shared/memory/MemoryManager';
import { StandardErrorHandler } from '../shared/error/StandardErrorHandler';

// Define your module's configuration interface
export interface YourModuleConfig {
  // Configuration properties
  name: string;
  enabled: boolean;
  settings: Record<string, any>;
}

// Define your module's data interfaces
export interface YourModuleData {
  id: string;
  name: string;
  // Other data properties
}

// Main module manager class
export class YourModuleManager {
  private config: YourModuleConfig;
  private data: Map<string, YourModuleData> = new Map();
  private isInitialized: boolean = false;
  
  // Required dependencies
  private logger: StructuredLogger;
  private memoryId: string;
  private errorHandler: StandardErrorHandler;

  constructor(config: YourModuleConfig) {
    this.config = config;
    this.logger = new StructuredLogger({ module: 'YourModuleManager' });
    this.memoryId = MemoryManager.registerInstance(this);
    this.errorHandler = new StandardErrorHandler();
  }

  // Initialize the module
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Module already initialized');
      return;
    }

    try {
      this.logger.info('Initializing YourModule...', { config: this.config });
      
      // Your initialization logic here
      this.data.clear();
      
      this.isInitialized = true;
      this.logger.info('YourModule initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize YourModule', { error: error.message });
      throw error;
    }
  }

  // Your module's public methods
  createItem(data: Omit<YourModuleData, 'id'>): YourModuleData {
    const id = this.generateId();
    const item: YourModuleData = { id, ...data };
    
    this.data.set(id, item);
    this.logger.info('Item created', { id, name: item.name });
    
    return item;
  }

  getItem(id: string): YourModuleData | undefined {
    return this.data.get(id);
  }

  getAllItems(): YourModuleData[] {
    return Array.from(this.data.values());
  }

  updateItem(id: string, updates: Partial<YourModuleData>): boolean {
    const item = this.data.get(id);
    if (!item) return false;

    const updatedItem = { ...item, ...updates };
    this.data.set(id, updatedItem);
    this.logger.info('Item updated', { id, updates });
    
    return true;
  }

  deleteItem(id: string): boolean {
    if (this.data.delete(id)) {
      this.logger.info('Item deleted', { id });
      return true;
    }
    return false;
  }

  // Utility methods
  private generateId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup
  async destroy(): Promise<void> {
    this.logger.info('Destroying YourModule...');
    
    this.data.clear();
    MemoryManager.unregisterInstance(this.memoryId);
    this.isInitialized = false;
    
    this.logger.info('YourModule destroyed');
  }
}

// Export default instance
export const defaultYourModuleManager = new YourModuleManager({
  name: 'Default YourModule',
  enabled: true,
  settings: {}
});
```

### **index.ts - Public API Exports**

```typescript
// Re-export all public APIs
export * from './Manager';
export { defaultYourModuleManager as default } from './Manager';

// Export module utilities
export function getModuleInfo(): { name: string; version: string; type: string } {
  return {
    name: 'YourModulePure',
    version: '1.0.0',
    type: 'YourModuleType'
  };
}

export function isModuleAvailable(): boolean {
  return true;
}

export function getModuleCapabilities(): string[] {
  return ['core', 'management', 'optimization'];
}
```

### **capabilities.ts - Module Capabilities**

```typescript
export const yourmoduleCapability = {
  "id": "yourmodule",
  "name": "YourModulePure",
  "description": "YourModule providing core functionality",
  "version": "1.0.0",
  "type": "feature",
  "category": "your-category",
  "tags": ["miff", "module", "exported", "yourmodule"],
  "dependencies": ["core-manager", "core-logging"],
  "interfaces": ["IYourModule"],
  "methods": [
    {
      "name": "initialize",
      "description": "Initialize the module manager",
      "parameters": [],
      "returnType": "Promise<void>",
      "isAsync": true,
      "isPublic": true,
      "examples": ["await manager.initialize();"]
    },
    {
      "name": "createItem",
      "description": "Create a new item",
      "parameters": [
        {
          "name": "data",
          "type": "Omit<YourModuleData, 'id'>",
          "required": true,
          "description": "Item data without ID"
        }
      ],
      "returnType": "YourModuleData",
      "isAsync": false,
      "isPublic": true,
      "examples": ["const item = manager.createItem({ name: 'Test Item' });"]
    }
  ],
  "properties": [
    {
      "name": "isInitialized",
      "type": "boolean",
      "description": "Whether the module is initialized",
      "readOnly": true,
      "defaultValue": false
    }
  ],
  "events": [
    {
      "name": "moduleReady",
      "description": "Module is ready for use",
      "payload": "ModuleInfo",
      "isAsync": true
    }
  ],
  "metadata": {
    "hasManager": true,
    "hasCLI": false,
    "hasIndex": true
  },
  "status": "active",
  "createdAt": "2025-01-27T00:00:00.000Z",
  "updatedAt": "2025-01-27T00:00:00.000Z"
};

export default yourmoduleCapability;
```

---

## 🎯 Manager Pattern

### **Required Dependencies**

Every Manager class must include:

```typescript
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import { MemoryManager } from '../shared/memory/MemoryManager';
import { StandardErrorHandler } from '../shared/error/StandardErrorHandler';
```

### **Required Properties**

```typescript
private logger: StructuredLogger;
private memoryId: string;
private errorHandler: StandardErrorHandler;
```

### **Required Methods**

```typescript
// Constructor
constructor(config: YourConfig) {
  this.logger = new StructuredLogger({ module: 'YourModuleManager' });
  this.memoryId = MemoryManager.registerInstance(this);
  this.errorHandler = new StandardErrorHandler();
}

// Initialize
async initialize(): Promise<void> {
  // Initialization logic
}

// Destroy
async destroy(): Promise<void> {
  // Cleanup logic
  MemoryManager.unregisterInstance(this.memoryId);
}
```

---

## 🧪 Testing Guidelines

### **Test File Structure**

```typescript
import { YourModuleManager, YourModuleConfig } from './Manager';

describe('YourModuleManager', () => {
  let manager: YourModuleManager;
  let config: YourModuleConfig;

  beforeEach(async () => {
    config = {
      name: 'Test Module',
      enabled: true,
      settings: {}
    };
    
    manager = new YourModuleManager(config);
    await manager.initialize();
  });

  afterEach(async () => {
    await manager.destroy();
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      expect(manager).toBeDefined();
      // Add initialization tests
    });
  });

  describe('Core Functionality', () => {
    test('should create item successfully', () => {
      const item = manager.createItem({ name: 'Test Item' });
      expect(item).toBeDefined();
      expect(item.id).toBeDefined();
      expect(item.name).toBe('Test Item');
    });

    test('should retrieve item by ID', () => {
      const item = manager.createItem({ name: 'Test Item' });
      const retrieved = manager.getItem(item.id);
      expect(retrieved).toEqual(item);
    });

    test('should update item successfully', () => {
      const item = manager.createItem({ name: 'Test Item' });
      const updated = manager.updateItem(item.id, { name: 'Updated Item' });
      expect(updated).toBe(true);
      
      const retrieved = manager.getItem(item.id);
      expect(retrieved?.name).toBe('Updated Item');
    });

    test('should delete item successfully', () => {
      const item = manager.createItem({ name: 'Test Item' });
      const deleted = manager.deleteItem(item.id);
      expect(deleted).toBe(true);
      
      const retrieved = manager.getItem(item.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid operations gracefully', () => {
      // Test error scenarios
    });
  });
});
```

### **Test Coverage Requirements**

- **Unit Tests**: Test individual methods
- **Integration Tests**: Test module interactions
- **Error Tests**: Test error handling
- **Edge Cases**: Test boundary conditions

---

## 🔧 Capability System

### **Capability Structure**

Each module must have a `capabilities.ts` file that describes:
- **Module Information**: Name, version, description
- **Dependencies**: Required modules
- **Interfaces**: Exposed interfaces
- **Methods**: Public methods with parameters
- **Properties**: Public properties
- **Events**: Emitted events
- **Metadata**: Additional information

### **Capability Discovery**

Modules are automatically discovered through:
- **File System Scanning**: Looks for `capabilities.ts` files
- **Module Registration**: Registers with the capability system
- **Dependency Resolution**: Resolves module dependencies

---

## ✅ Best Practices

### **Code Quality**

1. **Use TypeScript**: Always use TypeScript for type safety
2. **Follow Naming Conventions**: Use clear, descriptive names
3. **Add JSDoc Comments**: Document public methods
4. **Handle Errors Gracefully**: Use try-catch blocks
5. **Log Appropriately**: Use StructuredLogger for logging

### **Performance**

1. **Memory Management**: Register with MemoryManager
2. **Efficient Data Structures**: Use appropriate data structures
3. **Avoid Memory Leaks**: Clean up resources in destroy()
4. **Optimize Loops**: Use efficient algorithms

### **Security**

1. **Input Validation**: Validate all inputs
2. **Safe Operations**: Use safe utility functions
3. **Error Handling**: Don't expose sensitive information
4. **Access Control**: Implement proper access controls

### **Testing**

1. **Comprehensive Coverage**: Test all public methods
2. **Edge Cases**: Test boundary conditions
3. **Error Scenarios**: Test error handling
4. **Integration Tests**: Test with other modules

---

## 🔄 Common Patterns

### **CRUD Operations**

```typescript
// Create
createItem(data: CreateData): Item {
  const id = this.generateId();
  const item = { id, ...data };
  this.items.set(id, item);
  return item;
}

// Read
getItem(id: string): Item | undefined {
  return this.items.get(id);
}

// Update
updateItem(id: string, updates: Partial<Item>): boolean {
  const item = this.items.get(id);
  if (!item) return false;
  
  const updated = { ...item, ...updates };
  this.items.set(id, updated);
  return true;
}

// Delete
deleteItem(id: string): boolean {
  return this.items.delete(id);
}
```

### **Event Handling**

```typescript
private emitEvent(eventName: string, data: any): void {
  this.logger.info(`Event emitted: ${eventName}`, { data });
  // Emit to event system
}
```

### **Configuration Management**

```typescript
private validateConfig(config: YourConfig): void {
  if (!config.name) {
    throw new Error('Configuration name is required');
  }
  // Add other validations
}
```

---

## 🐛 Troubleshooting

### **Common Issues**

#### **Module Not Found**
- Check if `index.ts` exports the module correctly
- Verify the module is in the correct directory
- Ensure the module name follows the convention

#### **Initialization Errors**
- Check if all dependencies are available
- Verify configuration is valid
- Check error logs for specific issues

#### **Memory Leaks**
- Ensure `destroy()` is called
- Check if all resources are cleaned up
- Verify MemoryManager registration

#### **Test Failures**
- Check if all dependencies are mocked
- Verify test setup and teardown
- Check for timing issues in async tests

### **Debugging Tips**

1. **Use Logging**: Add detailed logging to understand flow
2. **Check Health**: Run health checks to identify issues
3. **Test Isolation**: Test modules in isolation
4. **Error Messages**: Read error messages carefully

---

## 📚 Additional Resources

- [Contributor Quick Start](./CONTRIBUTOR_QUICK_START.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Performance Guide](./PERFORMANCE_GUIDE.md)

---

## 🎉 Happy Coding!

You now have everything you need to create amazing modules for the MIFF Framework!

**Remember**: Follow the patterns, test thoroughly, and contribute to the community!

---

**Last Updated**: 2025-01-27  
**Version**: 1.0.0  
**Status**: Ready for Contributors  
**Owner**: R.C. Biscuits