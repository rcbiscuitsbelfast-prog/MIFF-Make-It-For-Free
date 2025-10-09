# 🤖 MIFF Agent Instructions

**Version:** 1.0  
**Last Updated:** 2025-01-08  
**Status:** Ready for AI Agents

---

## 📋 **Agent Integration Guide**

This document provides comprehensive instructions for AI agents to build complete games using the MIFF framework based on Game Design Intake Documents.

### **How to Use This Document**
1. **Review the intake document** provided by the contributor
2. **Follow MIFF architectural patterns** throughout implementation
3. **Use the provided templates** for consistent implementation
4. **Include comprehensive testing** for all functionality
5. **Generate complete documentation** for all systems

---

## 🎯 **Agent Workflow**

### **Phase 1: Intake Analysis**
1. **Read the Game Design Intake Document** completely
2. **Validate all required fields** are filled
3. **Identify MIFF modules to reuse** vs. new modules needed
4. **Plan the implementation** based on the intake requirements
5. **Create a development roadmap** with phases and milestones

### **Phase 2: Project Setup**
1. **Create project structure** following MIFF patterns
2. **Set up module directories** for all required systems
3. **Initialize git repository** with proper structure
4. **Create package.json** with MIFF dependencies
5. **Set up TypeScript configuration** following MIFF standards

### **Phase 3: Core Implementation**
1. **Implement core game systems** (managers, schemas, CLI)
2. **Create quest systems** using Quest Template
3. **Build game mechanics** using Mechanics Template
4. **Develop custom modules** using Module Template
5. **Integrate with existing MIFF modules** where possible

### **Phase 4: Integration & Testing**
1. **Write comprehensive test suites** for all systems
2. **Integrate all modules** with proper event handling
3. **Test CLI functionality** and user interactions
4. **Validate schema compliance** and data flow
5. **Performance test** and optimize as needed

### **Phase 5: Documentation & Polish**
1. **Generate API documentation** for all public interfaces
2. **Create user guides** and tutorials
3. **Write contributor documentation** for maintenance
4. **Create deployment guides** for different platforms
5. **Final testing** and bug fixes

---

## 🛠️ **Implementation Standards**

### **MIFF Architectural Patterns**

#### **Module Structure**
```
miff/pure/[ModuleName]Pure/
├── Manager.ts              # Main module manager
├── Schema.ts               # Data schemas and interfaces
├── CLI.ts                  # CLI harness implementation
├── Bridge.ts               # Bridge integration (if needed)
├── Capable.ts              # Capability introspection (if needed)
├── tests/                  # Comprehensive test suite
│   ├── Manager.test.ts
│   ├── Schema.test.ts
│   └── CLI.test.ts
├── README.md               # Module documentation
└── index.ts                # Module exports
```

#### **Manager Class Pattern**
```typescript
export class [ModuleName]Manager extends EventEmitter {
  private config: ModuleConfig;
  private data: Map<string, ModuleData> = new Map();
  private isInitialized: boolean = false;
  private stats: ModuleStats;

  constructor(config: Partial<ModuleConfig> = {}) {
    super();
    this.config = this.mergeConfig(config);
    this.stats = this.initializeStats();
  }

  async initialize(): Promise<ModuleResult> {
    // Implementation following MIFF patterns
  }

  async shutdown(): Promise<ModuleResult> {
    // Implementation following MIFF patterns
  }

  // Additional methods following MIFF patterns
}
```

#### **CLI Harness Pattern**
```typescript
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
    // Implementation following MIFF patterns
  }
}
```

### **Schema Definition Standards**

#### **Data Interfaces**
```typescript
export interface [ModuleName]Data {
  id: string;
  type: string;
  properties: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface [ModuleName]Config {
  id: string;
  name: string;
  version: string;
  description: string;
  settings: ModuleSettings;
  metadata: ModuleMetadata;
}

export interface [ModuleName]Result {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}
```

#### **Validation Patterns**
```typescript
private validateData(data: [ModuleName]Data): { valid: boolean; error?: string } {
  // Implement comprehensive validation
  if (!data.id) {
    return { valid: false, error: 'ID is required' };
  }
  
  if (!data.type) {
    return { valid: false, error: 'Type is required' };
  }
  
  // Additional validation logic
  return { valid: true };
}
```

### **Testing Standards**

#### **Unit Test Pattern**
```typescript
describe('[ModuleName]Manager', () => {
  let manager: [ModuleName]Manager;
  let config: [ModuleName]Config;

  beforeEach(() => {
    config = {
      // Test configuration
    };
    manager = new [ModuleName]Manager(config);
  });

  describe('Module Lifecycle', () => {
    it('should initialize successfully', async () => {
      const result = await manager.initialize();
      expect(result.success).toBe(true);
    });

    it('should shutdown successfully', async () => {
      await manager.initialize();
      const result = await manager.shutdown();
      expect(result.success).toBe(true);
    });
  });

  // Additional test cases
});
```

#### **Integration Test Pattern**
```typescript
describe('[ModuleName] Integration', () => {
  it('should integrate with MIFF framework', async () => {
    // Test MIFF integration
  });

  it('should handle events properly', async () => {
    // Test event handling
  });

  it('should persist data correctly', async () => {
    // Test data persistence
  });
});
```

---

## 🎮 **Game-Specific Implementation**

### **Quest System Implementation**

#### **Quest Manager**
```typescript
export class QuestManager extends EventEmitter {
  private quests: Map<string, QuestDefinition> = new Map();
  private activeQuests: Set<string> = new Set();
  private completedQuests: Set<string> = new Set();

  async startQuest(questId: string): Promise<QuestResult> {
    // Implementation following Quest Template
  }

  async completeQuest(questId: string): Promise<QuestResult> {
    // Implementation following Quest Template
  }

  async updateObjective(questId: string, objectiveId: string, progress: number): Promise<QuestResult> {
    // Implementation following Quest Template
  }
}
```

#### **Quest Schema**
```typescript
export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  status: QuestStatus;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  prerequisites: string[];
  location: QuestLocation;
  npcs: QuestNPC[];
  items: QuestItem[];
  metadata: QuestMetadata;
}
```

### **Mechanics System Implementation**

#### **Mechanics Manager**
```typescript
export class [MechanicName]Manager extends EventEmitter {
  private config: MechanicsConfig;
  private states: Map<string, [MechanicName]State> = new Map();
  private events: [MechanicName]Event[] = [];
  private hooks: [MechanicName]Hooks;

  async processEvent(event: [MechanicName]Event): Promise<[MechanicName]Result> {
    // Implementation following Mechanics Template
  }

  async updateState(playerId: string, state: Partial<[MechanicName]State>): Promise<[MechanicName]Result> {
    // Implementation following Mechanics Template
  }
}
```

#### **Runtime Hooks**
```typescript
export class [MechanicName]Hooks {
  private hooks: Map<string, MechanicsHook> = new Map();
  private eventHandlers: Map<string, Function[]> = new Map();

  registerHook(hook: MechanicsHook): void {
    // Implementation following Mechanics Template
  }

  async executeHooks(event: string, data: any): Promise<any[]> {
    // Implementation following Mechanics Template
  }
}
```

---

## 🔧 **CLI Integration**

### **CLI Command Structure**
```typescript
// All CLI commands should follow this pattern
export class [ModuleName]CLI extends BaseCLIHarness {
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
}
```

### **CLI Response Format**
```typescript
// All CLI responses should follow this format
{
  operation: string;
  status: 'ok' | 'error';
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}
```

---

## 📚 **Documentation Requirements**

### **Module Documentation**
Each module must include:

1. **README.md** - Complete module documentation
2. **API Documentation** - All public interfaces documented
3. **Usage Examples** - Code examples for common use cases
4. **Configuration Guide** - How to configure the module
5. **Troubleshooting Guide** - Common issues and solutions

### **Game Documentation**
Each game must include:

1. **Game README.md** - Complete game documentation
2. **Installation Guide** - How to install and run the game
3. **User Guide** - How to play the game
4. **Developer Guide** - How to modify or extend the game
5. **API Documentation** - All game APIs documented

---

## 🧪 **Testing Requirements**

### **Test Coverage**
- **Unit Tests:** 90%+ coverage for all modules
- **Integration Tests:** All module interactions tested
- **End-to-End Tests:** Complete game flow tested
- **Performance Tests:** Performance benchmarks included
- **Security Tests:** Security vulnerabilities tested

### **Test Structure**
```
tests/
├── unit/                   # Unit tests
│   ├── managers/
│   ├── schemas/
│   └── cli/
├── integration/            # Integration tests
│   ├── module-interactions/
│   └── system-integration/
├── e2e/                    # End-to-end tests
│   ├── game-flow/
│   └── user-scenarios/
├── performance/            # Performance tests
│   ├── load-tests/
│   └── benchmark-tests/
└── security/               # Security tests
    ├── vulnerability-tests/
    └── penetration-tests/
```

---

## 🚀 **Deployment Requirements**

### **Production Readiness**
- **All tests passing** (unit, integration, e2e)
- **Performance benchmarks** meeting requirements
- **Security audit** completed and issues resolved
- **Documentation** complete and up-to-date
- **CLI tools** fully functional
- **Error handling** comprehensive and graceful

### **Deployment Checklist**
- [ ] All modules implemented and tested
- [ ] CLI tools functional and documented
- [ ] Test suite complete and passing
- [ ] Documentation complete and accurate
- [ ] Performance requirements met
- [ ] Security requirements satisfied
- [ ] Error handling comprehensive
- [ ] Logging and monitoring implemented
- [ ] Configuration management complete
- [ ] Deployment scripts ready

---

## 🎯 **Success Criteria**

### **Technical Success**
- **All intake requirements** implemented
- **MIFF patterns** followed consistently
- **Test coverage** meets requirements
- **Performance** meets specifications
- **Security** requirements satisfied
- **Documentation** complete and accurate

### **User Success**
- **Game is playable** from start to finish
- **All quests** implemented and functional
- **All mechanics** working as designed
- **User interface** intuitive and responsive
- **Error messages** clear and helpful
- **Performance** smooth and responsive

### **Maintainer Success**
- **Code is maintainable** and well-structured
- **Tests are comprehensive** and reliable
- **Documentation is complete** and accurate
- **Configuration is flexible** and well-documented
- **Error handling is robust** and informative
- **Logging is comprehensive** and useful

---

## 📞 **Support and Resources**

### **MIFF Documentation**
- **Main README:** `README.md`
- **AI README:** `README.AI.md`
- **Module Index:** `docs/MIFF_MODULE_INDEX_2025.md`
- **Templates:** `docs/templates/`
- **Examples:** `docs/game-projects/`

### **Getting Help**
- **GitHub Issues:** For bug reports and feature requests
- **Discussions:** For questions and community support
- **Documentation:** Comprehensive guides and references
- **Templates:** Ready-to-use implementation templates

---

**🤖 Ready to build amazing games with MIFF! Follow these instructions to create production-ready games that integrate seamlessly with the MIFF framework.**