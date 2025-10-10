# **Manager Refactoring Guide: Standardizing MIFF Manager Classes**

**Date:** October 10, 2025  
**Purpose:** Guide for refactoring existing Manager classes to use BaseManager pattern  
**Target:** 122 Manager classes across MIFF framework  

---

## **📋 OVERVIEW**

This guide provides systematic instructions for refactoring existing Manager classes to use the new standardized `BaseManager` base class, ensuring consistency, maintainability, and architectural integrity across all MIFF modules.

---

## **🎯 REFACTORING OBJECTIVES**

1. **Consistent Lifecycle Management** - Standardized initialization, start, pause, resume, destroy
2. **Unified Error Handling** - Consistent error patterns and recovery mechanisms
3. **Standardized Metrics** - Performance monitoring and health checks
4. **Cache Management** - Built-in caching with TTL and size limits
5. **Event System** - Consistent event emission and logging
6. **Operation Tracking** - Standardized operation execution and monitoring

---

## **🔧 REFACTORING STEPS**

### **Step 1: Import BaseManager**

**Before:**
```typescript
export class IdleManager {
  private eventBus: EventBus;
  private config: IdleManagerConfig;
  // ... other properties
}
```

**After:**
```typescript
import { BaseManager, ManagerConfig, createManagerConfig } from '../shared/BaseManager.js';

export class IdleManager extends BaseManager {
  private eventBus: EventBus;
  private idleConfig: IdleManagerConfig;
  // ... other properties
}
```

### **Step 2: Update Constructor**

**Before:**
```typescript
constructor(eventBus: EventBus, config: IdleManagerConfig) {
  this.eventBus = eventBus;
  this.config = config;
  // ... initialization logic
}
```

**After:**
```typescript
constructor(eventBus: EventBus, idleConfig: IdleManagerConfig) {
  const managerConfig = createManagerConfig(
    'IdleManager',
    'Idle System Manager',
    '1.0.0',
    {
      enableLogging: true,
      enableMetrics: true,
      maxCacheSize: 500,
      timeout: 60000
    }
  );
  
  super(managerConfig);
  this.eventBus = eventBus;
  this.idleConfig = idleConfig;
}
```

### **Step 3: Implement Abstract Lifecycle Methods**

**Required Methods:**
```typescript
protected async onInitialize(): Promise<void> {
  // Initialize resources, load data, setup connections
  this.log('info', 'Initializing idle system');
  // ... initialization logic
}

protected async onStart(): Promise<void> {
  // Start operations, begin processing
  this.log('info', 'Starting idle system operations');
  // ... start logic
}

protected async onPause(): Promise<void> {
  // Pause operations while maintaining state
  this.log('info', 'Pausing idle system');
  // ... pause logic
}

protected async onResume(): Promise<void> {
  // Resume operations from paused state
  this.log('info', 'Resuming idle system');
  // ... resume logic
}

protected async onDestroy(): Promise<void> {
  // Cleanup resources, save state, close connections
  this.log('info', 'Destroying idle system');
  // ... cleanup logic
}
```

### **Step 4: Refactor Operations to Use executeOperation**

**Before:**
```typescript
public purchaseGenerator(id: string, count: number): boolean {
  const generator = this.generators.get(id);
  if (!generator || !generator.unlocked) {
    return false;
  }
  // ... purchase logic
  return true;
}
```

**After:**
```typescript
public async purchaseGenerator(id: string, count: number): Promise<boolean> {
  return this.executeOperation(
    'purchaseGenerator',
    async () => {
      const generator = this.generators.get(id);
      if (!generator || !generator.unlocked) {
        throw new Error(`Generator ${id} not found or not unlocked`);
      }
      // ... purchase logic
      return true;
    },
    { generatorId: id, count }
  );
}
```

### **Step 5: Add Cache Usage**

**Example Cache Usage:**
```typescript
public getResource(id: string): Resource | undefined {
  // Check cache first
  const cached = this.getCacheValue<Resource>(`resource_${id}`);
  if (cached) {
    return cached;
  }

  // Load from source
  const resource = this.resources.get(id);
  if (resource) {
    // Cache for 5 minutes
    this.setCacheValue(`resource_${id}`, resource, 300000);
  }

  return resource;
}
```

### **Step 6: Update Error Handling**

**Before:**
```typescript
try {
  // ... operation
} catch (error) {
  console.error('Operation failed:', error);
  return null;
}
```

**After:**
```typescript
// Error handling is now built into executeOperation
// Additional custom error handling can be added:
try {
  return await this.executeOperation('operationName', async () => {
    // ... operation logic
  });
} catch (error) {
  // Custom error handling if needed
  this.log('error', 'Custom error handling', { error });
  throw error; // Re-throw to maintain error propagation
}
```

---

## **📊 REFACTORING CHECKLIST**

### **Required Changes**
- [ ] Extend BaseManager instead of standalone class
- [ ] Update constructor to use createManagerConfig
- [ ] Implement all 5 abstract lifecycle methods
- [ ] Refactor operations to use executeOperation
- [ ] Update error handling patterns
- [ ] Add appropriate logging calls

### **Optional Enhancements**
- [ ] Add cache usage for frequently accessed data
- [ ] Implement custom metrics collection
- [ ] Add health check logic
- [ ] Create MIFFCapable implementation
- [ ] Add comprehensive unit tests

### **Validation Steps**
- [ ] All existing functionality preserved
- [ ] New lifecycle methods work correctly
- [ ] Error handling improved
- [ ] Logging and metrics functional
- [ ] Performance maintained or improved

---

## **🎯 PRIORITY ORDER FOR REFACTORING**

### **Phase 1: Critical Managers (Week 1)**
1. **NetworkBridgePure/Manager.ts** - Already has real implementation
2. **CombatCorePure/Manager.ts** - Core gameplay functionality
3. **DialogueSystemPure/Manager.ts** - Core interaction system
4. **QuestsPure/Manager.ts** - Core progression system
5. **StatsSystemPure/Manager.ts** - Core character system

### **Phase 2: Infrastructure Managers (Week 2)**
6. **EventBusPure/Manager.ts** - Core communication
7. **ValidationPure/Manager.ts** - Data integrity
8. **SaveLoadPure/Manager.ts** - Persistence system
9. **InventoryPure/Manager.ts** - Item management
10. **EconomyPure/Manager.ts** - Economic system

### **Phase 3: Specialized Managers (Week 3)**
11. **MagicSystemPure/Manager.ts** - Magic system
12. **CraftingPure/Manager.ts** - Crafting system
13. **AudioBridgePure/Manager.ts** - Audio system
14. **RenderingPure/Manager.ts** - Rendering system
15. **InputSystemPure/Manager.ts** - Input handling

### **Phase 4: Remaining Managers (Week 4)**
- All remaining 107 Manager classes
- Systematic refactoring using established patterns
- Validation and testing of all refactored managers

---

## **🔧 AUTOMATION TOOLS**

### **Refactoring Script Template**
```bash
#!/bin/bash
# Manager refactoring automation script

MODULE_NAME=$1
MANAGER_FILE="miff/pure/${MODULE_NAME}/Manager.ts"

if [ ! -f "$MANAGER_FILE" ]; then
  echo "Manager file not found: $MANAGER_FILE"
  exit 1
fi

echo "Refactoring $MODULE_NAME Manager..."

# Backup original
cp "$MANAGER_FILE" "${MANAGER_FILE}.backup"

# Apply refactoring patterns
# (This would contain sed/awk commands to automate common patterns)

echo "Refactoring complete. Please review and test $MANAGER_FILE"
```

### **Validation Script**
```typescript
// Validation script to check refactored managers
export function validateRefactoredManager(manager: BaseManager): boolean {
  const checks = [
    () => manager.getState().initialized !== undefined,
    () => manager.getMetrics().operationsPerSecond !== undefined,
    () => manager.getConfig().id !== undefined,
    () => manager.isHealthy !== undefined
  ];

  return checks.every(check => {
    try {
      return check();
    } catch {
      return false;
    }
  });
}
```

---

## **📈 EXPECTED BENEFITS**

### **Immediate Benefits**
- **Consistent Error Handling** - Standardized error patterns
- **Built-in Monitoring** - Automatic metrics and health checks
- **Improved Debugging** - Standardized logging and operation tracking
- **Cache Management** - Built-in caching reduces redundant operations

### **Long-term Benefits**
- **Maintainability** - Consistent patterns across all managers
- **Scalability** - Built-in performance monitoring and optimization
- **Reliability** - Standardized lifecycle and error recovery
- **Developer Productivity** - Familiar patterns and reduced boilerplate

---

## **🚨 COMMON PITFALLS**

1. **Breaking Existing APIs** - Ensure public methods remain compatible
2. **Async/Await Changes** - Operations now return Promises
3. **Error Handling Changes** - Errors are now thrown, not returned as null/false
4. **Lifecycle Dependencies** - Ensure proper initialization order
5. **Memory Leaks** - Use built-in cache and timer management

---

*This guide provides a systematic approach to refactoring all 122 Manager classes to use the standardized BaseManager pattern, ensuring architectural consistency and improved maintainability across the MIFF framework.*