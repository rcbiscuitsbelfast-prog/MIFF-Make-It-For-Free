# MIFF Framework - Contributor Onboarding Guide

**Welcome to the MIFF Framework!** This guide will help you get started as a contributor to the Make It For Free (MIFF) game development framework.

## 🎯 **What is MIFF?**

MIFF is a comprehensive, open-source game development framework that provides:
- **Cross-platform game engines** (Unity, Godot, Unreal, Web)
- **Modular architecture** with 200+ pure modules
- **TypeScript-first** development with full type safety
- **Performance optimization** and structured logging
- **Security hardening** and memory management
- **Developer experience** tools and utilities

## 🚀 **Quick Start**

### **1. Prerequisites**
- **Node.js** 18+ and npm
- **TypeScript** 5.0+
- **Git** for version control
- **VS Code** (recommended) with TypeScript extension

### **2. Setup Development Environment**
```bash
# Clone the repository
git clone https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free.git
cd MIFF-Make-It-For-Free

# Install dependencies
npm install

# Verify installation
npm run type-check
npm run build
```

### **3. Project Structure**
```
miff/
├── pure/                    # Core framework modules
│   ├── [ModuleName]Pure/    # Individual modules
│   │   ├── Manager.ts       # Module manager
│   │   ├── index.ts         # Module exports
│   │   ├── cliHarness.ts    # CLI interface
│   │   └── tests/           # Module tests
│   └── shared/              # Shared utilities
│       ├── logging/         # Structured logging
│       ├── performance/     # Performance optimization
│       ├── memory/          # Memory management
│       └── error/           # Error handling
├── docs/                    # Documentation
└── examples/                # Example projects
```

## 📚 **Development Workflow**

### **1. Understanding the Architecture**

#### **Pure Modules**
Each module follows the "Pure" pattern:
- **Manager.ts**: Core business logic and state management
- **index.ts**: Public API exports
- **cliHarness.ts**: Command-line interface
- **tests/**: Comprehensive test coverage

#### **Shared Systems**
- **StructuredLogger**: Consistent logging across modules
- **PerformanceOptimizer**: O(n²) pattern fixes and optimization
- **MemoryManager**: Object lifecycle and leak prevention
- **StandardErrorHandler**: Unified error handling

### **2. Creating a New Module**

#### **Step 1: Create Module Directory**
```bash
mkdir miff/pure/YourModulePure
cd miff/pure/YourModulePure
```

#### **Step 2: Create Manager.ts**
```typescript
import { StructuredLogger, LogLevel } from '../shared/logging/StructuredLogger';
import { MemoryManager } from '../shared/memory/MemoryManager';
import { StandardErrorHandler } from '../shared/error/StandardErrorHandler';

export interface YourModuleConfig {
  enableFeature: boolean;
  maxItems: number;
  // ... other config options
}

export class YourModuleManager {
  private config: YourModuleConfig;
  private logger: StructuredLogger;
  private memoryId: string;
  private errorHandler: StandardErrorHandler;

  constructor(config: Partial<YourModuleConfig> = {}) {
    this.config = {
      enableFeature: true,
      maxItems: 1000,
      ...config
    };

    // Initialize structured logging
    this.logger = new StructuredLogger({
      level: LogLevel.INFO,
      enableConsole: true,
      performanceMonitoring: true,
      modules: {
        'YourModuleManager': LogLevel.DEBUG
      }
    });

    // Register with memory manager
    this.memoryId = `YourModuleManager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    MemoryManager.registerObject(this.memoryId, this, 'YourModuleManager');

    // Initialize error handler
    this.errorHandler = new StandardErrorHandler(this.logger);
  }

  async initialize(): Promise<boolean> {
    const timerId = this.logger.startTimer('YourModuleManager', 'initialize');
    
    try {
      // Your initialization logic here
      this.logger.info('YourModuleManager', 'Module initialized successfully');
      
      const duration = this.logger.endTimer(timerId);
      this.logger.logPerformance('YourModuleManager', 'initialize', duration);
      
      return true;
    } catch (error) {
      this.logger.error('YourModuleManager', 'Failed to initialize module', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, error instanceof Error ? error : undefined);
      
      this.logger.endTimer(timerId);
      return false;
    }
  }

  destroy(): void {
    this.logger.info('YourModuleManager', 'Destroying module');
    
    // Unregister from memory manager
    MemoryManager.unregisterObject(this.memoryId);
    
    // Destroy logger
    this.logger.destroy();
  }
}

// Export default instance
export const defaultYourModuleManager = new YourModuleManager();
export { YourModuleManager as default };
```

#### **Step 3: Create index.ts**
```typescript
// Re-export all public APIs
export * from './Manager';
export { defaultYourModuleManager as default } from './Manager';

// Export module utilities
export function getModuleInfo(): { name: string; version: string; type: string } {
  return {
    name: 'YourModulePure',
    version: '1.0.0',
    type: 'YourModulePure'
  };
}

export function isModuleAvailable(): boolean {
  return true;
}

export function getModuleCapabilities(): string[] {
  return ['core', 'management', 'optimization'];
}
```

#### **Step 4: Create cliHarness.ts**
```typescript
#!/usr/bin/env node

/**
 * YourModulePure CLI Harness
 */

import { YourModuleManager } from './Manager';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  const manager = new YourModuleManager();
  
  try {
    await manager.initialize();
    
    switch (command) {
      case 'init':
        console.log('✅ Module initialized');
        break;
      case 'status':
        console.log('📊 Module status: Active');
        break;
      default:
        console.log('Usage: your-module <init|status>');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    manager.destroy();
  }
}

main();
```

### **3. Testing Your Module**

#### **Create Test File**
```typescript
// tests/yourModule.test.ts
import { YourModuleManager } from '../Manager';

describe('YourModuleManager', () => {
  let manager: YourModuleManager;

  beforeEach(() => {
    manager = new YourModuleManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  test('should initialize successfully', async () => {
    const result = await manager.initialize();
    expect(result).toBe(true);
  });

  test('should handle errors gracefully', async () => {
    // Test error scenarios
  });
});
```

#### **Run Tests**
```bash
npm test -- --testPathPattern=YourModulePure
```

## 🔧 **Development Guidelines**

### **1. Code Standards**

#### **TypeScript Best Practices**
- Use **strict type checking** - no `any` types
- Define **interfaces** for all data structures
- Use **enums** for constants and status values
- Implement **proper error handling** with StandardErrorHandler

#### **Performance Guidelines**
- Use **PerformanceOptimizer** for O(n²) patterns
- Implement **memory management** with MemoryManager
- Use **structured logging** instead of console.log
- Optimize **object cloning** operations

#### **Security Guidelines**
- Use **SafeJSONParser** for JSON operations
- Use **SafePathUtils** for file operations
- Use **SafeObjectUtils** for object merging
- Use **InputSanitizer** for user input

### **2. Error Handling**

#### **Use StandardErrorHandler**
```typescript
import { StandardErrorHandler, ErrorCode, ErrorSeverity } from '../shared/error/StandardErrorHandler';

const errorHandler = new StandardErrorHandler();

try {
  // Your operation
} catch (error) {
  const standardError = errorHandler.createError(
    ErrorCode.OPERATION_FAILED,
    'Operation failed',
    { module: 'YourModule', operation: 'doSomething' },
    error instanceof Error ? error : new Error(String(error)),
    ErrorSeverity.MEDIUM
  );
  
  await errorHandler.handleError(standardError);
}
```

### **3. Logging**

#### **Use StructuredLogger**
```typescript
import { StructuredLogger, LogLevel } from '../shared/logging/StructuredLogger';

const logger = new StructuredLogger({
  level: LogLevel.INFO,
  modules: { 'YourModule': LogLevel.DEBUG }
});

// Instead of console.log
logger.info('YourModule', 'Operation completed', { 
  itemCount: 42,
  duration: 150 
});

// Performance monitoring
const timerId = logger.startTimer('YourModule', 'operation');
// ... do work ...
const duration = logger.endTimer(timerId);
logger.logPerformance('YourModule', 'operation', duration);
```

## 🧪 **Testing Guidelines**

### **1. Test Structure**
- **Unit tests** for individual functions
- **Integration tests** for module interactions
- **Performance tests** for optimization validation
- **Security tests** for vulnerability prevention

### **2. Test Coverage**
- Aim for **90%+ coverage** on new modules
- Test **error scenarios** and edge cases
- Test **performance characteristics**
- Test **security boundaries**

### **3. Test Commands**
```bash
# Run all tests
npm test

# Run specific module tests
npm test -- --testPathPattern=YourModulePure

# Run with coverage
npm run test:coverage

# Run performance tests
npm run test:performance
```

## 📖 **Documentation Standards**

### **1. Code Documentation**
- **JSDoc comments** for all public APIs
- **README.md** for each module
- **Type definitions** for all interfaces
- **Usage examples** in comments

### **2. API Documentation**
- **Clear function signatures**
- **Parameter descriptions**
- **Return value documentation**
- **Error condition details**

### **3. Module Documentation**
```markdown
# YourModulePure

## Overview
Brief description of what this module does.

## Features
- Feature 1
- Feature 2
- Feature 3

## Usage
```typescript
import { YourModuleManager } from './Manager';

const manager = new YourModuleManager();
await manager.initialize();
```

## API Reference
[Detailed API documentation]
```

## 🚀 **Contributing Process**

### **1. Fork and Branch**
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/yourusername/MIFF-Make-It-For-Free.git

# Create feature branch
git checkout -b feature/your-feature-name
```

### **2. Development**
- Make your changes
- Write tests
- Update documentation
- Run quality checks

### **3. Quality Checks**
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Tests
npm test

# Build
npm run build
```

### **4. Commit and Push**
```bash
git add .
git commit -m "feat: Add your feature description"
git push origin feature/your-feature-name
```

### **5. Create Pull Request**
- Use descriptive title
- Include detailed description
- Reference any related issues
- Ensure all checks pass

## 🎯 **Module Priorities**

### **High Priority Modules** (Create First)
1. **Core Game Systems**: ItemsPure, AvatarSystemPure, NavigationSystemPure
2. **Essential Features**: AIProfilesPure, AssetManifestPure, ClueSystemPure
3. **Integration Systems**: WebSocketServerPure, APIGatewayPure, MessageQueuePure

### **Medium Priority Modules** (Create Second)
1. **Feature Modules**: CharacterCustomizationPure, InventoryPure, CombatPure
2. **Bridge Systems**: UnityBridgePure, UnrealBridgePure, WebBridgePure
3. **Utility Modules**: CacheManagerPure, ValidationSystemPure, ErrorHandlingPure

### **Low Priority Modules** (Create Last)
1. **Demo Modules**: WitcherExplorerDemoPure, TopplerDemoPure
2. **Specialized Features**: QuantumComputingPure, EdgeComputingPure
3. **Experimental Modules**: NeuralNetworkPure, ComputerVisionPure

## 🆘 **Getting Help**

### **Resources**
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Documentation**: Comprehensive guides and references
- **Examples**: Working code samples and tutorials

### **Community**
- **Discord**: Real-time chat and support
- **Forums**: Detailed discussions and Q&A
- **Wiki**: Community-maintained documentation

### **Support Channels**
- **Bug Reports**: GitHub Issues
- **Feature Requests**: GitHub Discussions
- **General Questions**: Discord/Forums
- **Security Issues**: Private email to maintainers

## 🎉 **Welcome to the Team!**

Thank you for contributing to MIFF! Your contributions help make game development more accessible and powerful for developers worldwide.

**Happy coding!** 🚀

---

*This guide is maintained by the MIFF Framework team. Last updated: January 2025*