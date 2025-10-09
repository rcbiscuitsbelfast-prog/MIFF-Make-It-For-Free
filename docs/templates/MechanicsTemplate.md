# ⚙️ MIFF Mechanics Template

**Version:** 1.0  
**Last Updated:** 2025-01-08  
**Status:** Ready for Contributors

---

## 📋 **Mechanics Implementation Guide**

This template provides a standardized way to implement game mechanics in MIFF games, ensuring consistency, testability, and maintainability across all gameplay systems.

### **How to Use This Template**
1. **Copy this template** to your mechanics implementation directory
2. **Fill out all sections** according to your mechanic design
3. **Follow MIFF patterns** for runtime hooks, schemas, and transport layers
4. **Include comprehensive tests** for all mechanic functionality
5. **Update mechanics registry** when adding new mechanics

---

## ⚙️ **Mechanics Implementation**

### **Mechanics Structure**

```
miff/pure/[MechanicName]Pure/
├── Manager.ts              # Main mechanics manager
├── Schema.ts               # Mechanics data schemas
├── Hooks.ts                # Runtime hooks implementation
├── Transport.ts            # Transport layer (if needed)
├── CLI.ts                  # CLI harness implementation
├── tests/                  # Test suite
│   ├── Manager.test.ts
│   ├── Hooks.test.ts
│   └── Transport.test.ts
├── README.md               # Mechanics documentation
└── index.ts                # Mechanics exports
```

### **Mechanics Schema Definition**

```typescript
// Schema.ts
export interface MechanicsConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  category: MechanicsCategory;
  priority: number;
  enabled: boolean;
  dependencies: string[];
  hooks: MechanicsHook[];
  settings: MechanicsSettings;
  metadata: MechanicsMetadata;
}

export enum MechanicsCategory {
  MOVEMENT = 'movement',
  COMBAT = 'combat',
  INTERACTION = 'interaction',
  PROGRESSION = 'progression',
  ECONOMY = 'economy',
  SOCIAL = 'social',
  CRAFTING = 'crafting',
  EXPLORATION = 'exploration',
  CUSTOM = 'custom'
}

export interface MechanicsHook {
  id: string;
  name: string;
  event: string;
  priority: number;
  async: boolean;
  handler: string;
  conditions: HookCondition[];
}

export interface HookCondition {
  type: 'player' | 'world' | 'item' | 'quest' | 'custom';
  property: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface MechanicsSettings {
  enabled: boolean;
  debugMode: boolean;
  performanceMode: 'low' | 'medium' | 'high';
  customSettings: Record<string, any>;
}

export interface MechanicsMetadata {
  created: Date;
  updated: Date;
  lastUsed: Date;
  usageCount: number;
  tags: string[];
  author: string;
}

// Mechanics-specific data interfaces
export interface [MechanicName]State {
  id: string;
  playerId: string;
  state: string;
  properties: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface [MechanicName]Event {
  id: string;
  type: string;
  playerId: string;
  data: Record<string, any>;
  timestamp: Date;
  processed: boolean;
}

export interface [MechanicName]Result {
  success: boolean;
  state?: [MechanicName]State;
  event?: [MechanicName]Event;
  error?: string;
  metadata?: Record<string, any>;
}
```

### **Mechanics Manager Implementation**

```typescript
// Manager.ts
import { MechanicsConfig, [MechanicName]State, [MechanicName]Event, [MechanicName]Result } from './Schema.js';
import { EventEmitter } from 'events';

export class [MechanicName]Manager extends EventEmitter {
  private config: MechanicsConfig;
  private states: Map<string, [MechanicName]State> = new Map();
  private events: [MechanicName]Event[] = [];
  private isInitialized: boolean = false;
  private stats: MechanicsStats;

  constructor(config: Partial<MechanicsConfig> = {}) {
    super();
    this.config = this.mergeConfig(config);
    this.stats = this.initializeStats();
  }

  /**
   * Initialize the mechanics system
   */
  async initialize(): Promise<[MechanicName]Result> {
    try {
      if (this.isInitialized) {
        return { success: true, metadata: { message: 'Mechanics already initialized' } };
      }

      // Validate dependencies
      const dependencyCheck = await this.validateDependencies();
      if (!dependencyCheck.success) {
        return { success: false, error: dependencyCheck.error };
      }

      // Initialize mechanics-specific resources
      await this.initializeResources();

      // Set up event listeners
      this.setupEventListeners();

      // Register hooks
      await this.registerHooks();

      // Mark as initialized
      this.isInitialized = true;

      // Emit initialization event
      this.emit('mechanics:initialized', { mechanicsId: this.config.id });

      return { success: true, metadata: { message: 'Mechanics initialized successfully' } };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Shutdown the mechanics system
   */
  async shutdown(): Promise<[MechanicName]Result> {
    try {
      if (!this.isInitialized) {
        return { success: true, metadata: { message: 'Mechanics not initialized' } };
      }

      // Unregister hooks
      await this.unregisterHooks();

      // Clean up resources
      await this.cleanupResources();

      // Clear data
      this.states.clear();
      this.events = [];

      // Mark as not initialized
      this.isInitialized = false;

      // Emit shutdown event
      this.emit('mechanics:shutdown', { mechanicsId: this.config.id });

      return { success: true, metadata: { message: 'Mechanics shutdown successfully' } };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Process a mechanics event
   */
  async processEvent(event: [MechanicName]Event): Promise<[MechanicName]Result> {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'Mechanics not initialized' };
      }

      // Validate event
      const validation = this.validateEvent(event);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Process the event
      const result = await this.performEventProcessing(event);

      // Store the event
      this.events.push(event);
      event.processed = true;

      // Update statistics
      this.updateStats('event', 1);

      // Emit event processed
      this.emit('mechanics:eventProcessed', { event, result });

      return { success: true, event, metadata: result };
    } catch (error) {
      this.updateStats('error', 1);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update player state
   */
  async updateState(playerId: string, state: Partial<[MechanicName]State>): Promise<[MechanicName]Result> {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'Mechanics not initialized' };
      }

      // Get existing state or create new one
      let existingState = this.states.get(playerId);
      if (!existingState) {
        existingState = {
          id: `state-${playerId}-${Date.now()}`,
          playerId,
          state: 'default',
          properties: {},
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      // Update state
      const updatedState: [MechanicName]State = {
        ...existingState,
        ...state,
        updatedAt: new Date()
      };

      // Store updated state
      this.states.set(playerId, updatedState);

      // Update statistics
      this.updateStats('state', 1);

      // Emit state updated
      this.emit('mechanics:stateUpdated', { playerId, state: updatedState });

      return { success: true, state: updatedState };
    } catch (error) {
      this.updateStats('error', 1);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get player state
   */
  getState(playerId: string): [MechanicName]State | undefined {
    return this.states.get(playerId);
  }

  /**
   * Get all states
   */
  getAllStates(): [MechanicName]State[] {
    return Array.from(this.states.values());
  }

  /**
   * Get mechanics events
   */
  getEvents(limit: number = 100): [MechanicName]Event[] {
    return this.events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get mechanics configuration
   */
  getConfig(): MechanicsConfig {
    return { ...this.config };
  }

  /**
   * Update mechanics configuration
   */
  updateConfig(updates: Partial<MechanicsConfig>): [MechanicName]Result {
    try {
      this.config = { ...this.config, ...updates };
      this.emit('mechanics:configUpdated', { config: this.config });
      return { success: true, metadata: { config: this.config } };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get mechanics statistics
   */
  getStats(): MechanicsStats {
    return { ...this.stats };
  }

  /**
   * Get mechanics health status
   */
  getHealthStatus(): MechanicsHealthStatus {
    return {
      isInitialized: this.isInitialized,
      isHealthy: this.isInitialized && this.stats.errorCount === 0,
      stateCount: this.states.size,
      eventCount: this.events.length,
      lastActivity: this.stats.lastActivity,
      uptime: this.stats.uptime,
      errorRate: this.calculateErrorRate()
    };
  }

  // Private methods
  private mergeConfig(config: Partial<MechanicsConfig>): MechanicsConfig {
    return {
      id: 'default-mechanics-id',
      name: 'Default Mechanics',
      version: '1.0.0',
      description: 'Default mechanics for unit testing',
      category: MechanicsCategory.CUSTOM,
      priority: 1,
      enabled: true,
      dependencies: [],
      hooks: [],
      settings: {
        enabled: true,
        debugMode: false,
        performanceMode: 'medium',
        customSettings: {}
      },
      metadata: {
        created: new Date(),
        updated: new Date(),
        lastUsed: new Date(),
        usageCount: 0,
        tags: [],
        author: 'MIFF Team'
      },
      ...config
    };
  }

  private async validateDependencies(): Promise<[MechanicName]Result> {
    // Implement dependency validation logic
    return { success: true };
  }

  private async initializeResources(): Promise<void> {
    // Implement resource initialization logic
  }

  private setupEventListeners(): void {
    // Implement event listener setup
  }

  private async registerHooks(): Promise<void> {
    // Implement hook registration logic
  }

  private async unregisterHooks(): Promise<void> {
    // Implement hook unregistration logic
  }

  private async cleanupResources(): Promise<void> {
    // Implement resource cleanup logic
  }

  private validateEvent(event: [MechanicName]Event): { valid: boolean; error?: string } {
    // Implement event validation logic
    return { valid: true };
  }

  private async performEventProcessing(event: [MechanicName]Event): Promise<Record<string, any>> {
    // Implement event processing logic
    return { processed: true, timestamp: new Date() };
  }

  private initializeStats(): MechanicsStats {
    return {
      eventCount: 0,
      stateCount: 0,
      errorCount: 0,
      lastActivity: new Date(),
      uptime: 0,
      startTime: new Date()
    };
  }

  private updateStats(operation: string, count: number): void {
    switch (operation) {
      case 'event':
        this.stats.eventCount += count;
        break;
      case 'state':
        this.stats.stateCount += count;
        break;
      case 'error':
        this.stats.errorCount += count;
        break;
    }
    this.stats.lastActivity = new Date();
    this.stats.uptime = Date.now() - this.stats.startTime.getTime();
  }

  private calculateErrorRate(): number {
    const total = this.stats.eventCount + this.stats.stateCount + this.stats.errorCount;
    return total > 0 ? (this.stats.errorCount / total) * 100 : 0;
  }
}

export interface MechanicsStats {
  eventCount: number;
  stateCount: number;
  errorCount: number;
  lastActivity: Date;
  uptime: number;
  startTime: Date;
}

export interface MechanicsHealthStatus {
  isInitialized: boolean;
  isHealthy: boolean;
  stateCount: number;
  eventCount: number;
  lastActivity: Date;
  uptime: number;
  errorRate: number;
}
```

### **Runtime Hooks Implementation**

```typescript
// Hooks.ts
import { MechanicsHook, HookCondition } from './Schema.js';

export class [MechanicName]Hooks {
  private hooks: Map<string, MechanicsHook> = new Map();
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeHooks();
  }

  /**
   * Register a hook
   */
  registerHook(hook: MechanicsHook): void {
    this.hooks.set(hook.id, hook);
    
    // Set up event handler
    if (!this.eventHandlers.has(hook.event)) {
      this.eventHandlers.set(hook.event, []);
    }
    
    this.eventHandlers.get(hook.event)!.push(this.createHandler(hook));
  }

  /**
   * Unregister a hook
   */
  unregisterHook(hookId: string): void {
    const hook = this.hooks.get(hookId);
    if (hook) {
      const handlers = this.eventHandlers.get(hook.event);
      if (handlers) {
        const index = handlers.findIndex(h => h.name === hook.handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
      this.hooks.delete(hookId);
    }
  }

  /**
   * Execute hooks for an event
   */
  async executeHooks(event: string, data: any): Promise<any[]> {
    const handlers = this.eventHandlers.get(event) || [];
    const results: any[] = [];

    // Sort handlers by priority
    const sortedHandlers = handlers.sort((a, b) => {
      const hookA = Array.from(this.hooks.values()).find(h => h.handler === a.name);
      const hookB = Array.from(this.hooks.values()).find(h => h.handler === b.name);
      return (hookA?.priority || 0) - (hookB?.priority || 0);
    });

    for (const handler of sortedHandlers) {
      try {
        const result = await handler(data);
        results.push(result);
      } catch (error) {
        console.error(`Hook execution error: ${error}`);
        results.push({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return results;
  }

  /**
   * Check if conditions are met
   */
  checkConditions(conditions: HookCondition[], data: any): boolean {
    return conditions.every(condition => {
      const value = this.getPropertyValue(data, condition.property);
      return this.evaluateCondition(value, condition.operator, condition.value);
    });
  }

  /**
   * Get all registered hooks
   */
  getHooks(): MechanicsHook[] {
    return Array.from(this.hooks.values());
  }

  /**
   * Get hooks for a specific event
   */
  getHooksForEvent(event: string): MechanicsHook[] {
    return Array.from(this.hooks.values()).filter(hook => hook.event === event);
  }

  private initializeHooks(): void {
    // Initialize default hooks
    const defaultHooks: MechanicsHook[] = [
      {
        id: 'player-move-hook',
        name: 'Player Move Hook',
        event: 'player:move',
        priority: 1,
        async: true,
        handler: 'handlePlayerMove',
        conditions: []
      },
      {
        id: 'player-action-hook',
        name: 'Player Action Hook',
        event: 'player:action',
        priority: 1,
        async: true,
        handler: 'handlePlayerAction',
        conditions: []
      }
    ];

    for (const hook of defaultHooks) {
      this.registerHook(hook);
    }
  }

  private createHandler(hook: MechanicsHook): Function {
    const handler = async (data: any) => {
      // Check conditions
      if (!this.checkConditions(hook.conditions, data)) {
        return { skipped: true, reason: 'Conditions not met' };
      }

      // Execute handler based on name
      switch (hook.handler) {
        case 'handlePlayerMove':
          return await this.handlePlayerMove(data);
        case 'handlePlayerAction':
          return await this.handlePlayerAction(data);
        default:
          return { error: 'Unknown handler' };
      }
    };

    // Set handler name for sorting
    (handler as any).name = hook.handler;
    return handler;
  }

  private async handlePlayerMove(data: any): Promise<any> {
    // Implement player move handling
    return { processed: true, type: 'player_move', data };
  }

  private async handlePlayerAction(data: any): Promise<any> {
    // Implement player action handling
    return { processed: true, type: 'player_action', data };
  }

  private getPropertyValue(data: any, property: string): any {
    const keys = property.split('.');
    let value = data;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private evaluateCondition(value: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return value === expected;
      case 'not_equals':
        return value !== expected;
      case 'greater_than':
        return value > expected;
      case 'less_than':
        return value < expected;
      case 'contains':
        return Array.isArray(value) && value.includes(expected);
      default:
        return false;
    }
  }
}
```

### **Transport Layer Implementation**

```typescript
// Transport.ts
import { [MechanicName]State, [MechanicName]Event } from './Schema.js';

export interface TransportConfig {
  type: 'local' | 'network' | 'file' | 'database';
  endpoint?: string;
  credentials?: Record<string, string>;
  settings: Record<string, any>;
}

export class [MechanicName]Transport {
  private config: TransportConfig;
  private isConnected: boolean = false;

  constructor(config: TransportConfig) {
    this.config = config;
  }

  /**
   * Connect to transport
   */
  async connect(): Promise<boolean> {
    try {
      switch (this.config.type) {
        case 'local':
          this.isConnected = true;
          break;
        case 'network':
          await this.connectToNetwork();
          break;
        case 'file':
          await this.connectToFile();
          break;
        case 'database':
          await this.connectToDatabase();
          break;
        default:
          throw new Error(`Unsupported transport type: ${this.config.type}`);
      }
      return true;
    } catch (error) {
      console.error('Transport connection failed:', error);
      return false;
    }
  }

  /**
   * Disconnect from transport
   */
  async disconnect(): Promise<boolean> {
    try {
      this.isConnected = false;
      return true;
    } catch (error) {
      console.error('Transport disconnection failed:', error);
      return false;
    }
  }

  /**
   * Send state to transport
   */
  async sendState(state: [MechanicName]State): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Transport not connected');
    }

    try {
      switch (this.config.type) {
        case 'local':
          return this.sendToLocal(state);
        case 'network':
          return await this.sendToNetwork(state);
        case 'file':
          return await this.sendToFile(state);
        case 'database':
          return await this.sendToDatabase(state);
        default:
          throw new Error(`Unsupported transport type: ${this.config.type}`);
      }
    } catch (error) {
      console.error('State send failed:', error);
      return false;
    }
  }

  /**
   * Send event to transport
   */
  async sendEvent(event: [MechanicName]Event): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Transport not connected');
    }

    try {
      switch (this.config.type) {
        case 'local':
          return this.sendToLocal(event);
        case 'network':
          return await this.sendToNetwork(event);
        case 'file':
          return await this.sendToFile(event);
        case 'database':
          return await this.sendToDatabase(event);
        default:
          throw new Error(`Unsupported transport type: ${this.config.type}`);
      }
    } catch (error) {
      console.error('Event send failed:', error);
      return false;
    }
  }

  /**
   * Receive data from transport
   */
  async receive(): Promise<([MechanicName]State | [MechanicName]Event)[]> {
    if (!this.isConnected) {
      throw new Error('Transport not connected');
    }

    try {
      switch (this.config.type) {
        case 'local':
          return this.receiveFromLocal();
        case 'network':
          return await this.receiveFromNetwork();
        case 'file':
          return await this.receiveFromFile();
        case 'database':
          return await this.receiveFromDatabase();
        default:
          throw new Error(`Unsupported transport type: ${this.config.type}`);
      }
    } catch (error) {
      console.error('Data receive failed:', error);
      return [];
    }
  }

  /**
   * Check if transport is connected
   */
  isTransportConnected(): boolean {
    return this.isConnected;
  }

  // Private methods for different transport types
  private async connectToNetwork(): Promise<void> {
    // Implement network connection
  }

  private async connectToFile(): Promise<void> {
    // Implement file connection
  }

  private async connectToDatabase(): Promise<void> {
    // Implement database connection
  }

  private sendToLocal(data: any): boolean {
    // Implement local sending
    return true;
  }

  private async sendToNetwork(data: any): Promise<boolean> {
    // Implement network sending
    return true;
  }

  private async sendToFile(data: any): Promise<boolean> {
    // Implement file sending
    return true;
  }

  private async sendToDatabase(data: any): Promise<boolean> {
    // Implement database sending
    return true;
  }

  private receiveFromLocal(): ([MechanicName]State | [MechanicName]Event)[] {
    // Implement local receiving
    return [];
  }

  private async receiveFromNetwork(): Promise<([MechanicName]State | [MechanicName]Event)[]> {
    // Implement network receiving
    return [];
  }

  private async receiveFromFile(): Promise<([MechanicName]State | [MechanicName]Event)[]> {
    // Implement file receiving
    return [];
  }

  private async receiveFromDatabase(): Promise<([MechanicName]State | [MechanicName]Event)[]> {
    // Implement database receiving
    return [];
  }
}
```

---

## 📚 **Implementation Checklist**

### **Mechanics Structure**
- [ ] Create mechanics directory structure
- [ ] Implement schema definitions
- [ ] Create manager class
- [ ] Implement runtime hooks
- [ ] Add transport layer
- [ ] Create CLI harness

### **Core Functionality**
- [ ] Implement mechanics lifecycle (init/shutdown)
- [ ] Add event processing capabilities
- [ ] Implement state management
- [ ] Add hook system
- [ ] Include transport integration

### **Runtime Integration**
- [ ] Implement runtime hooks
- [ ] Add event handling
- [ ] Include state persistence
- [ ] Add transport layer
- [ ] Implement performance optimization

### **Testing**
- [ ] Write comprehensive unit tests
- [ ] Test all mechanics operations
- [ ] Test hook system
- [ ] Test transport layer
- [ ] Include integration tests

### **Documentation**
- [ ] Document all public APIs
- [ ] Include usage examples
- [ ] Add troubleshooting guide
- [ ] Create contributor guidelines
- [ ] Update mechanics registry

---

## 🎯 **Best Practices**

### **Mechanics Design**
- **Performance First:** Optimize for real-time gameplay
- **Modular Design:** Make mechanics composable and reusable
- **Event-Driven:** Use events for loose coupling
- **State Management:** Handle state transitions carefully

### **Technical Implementation**
- **Hook System:** Implement efficient hook execution
- **Transport Layer:** Handle network and persistence gracefully
- **Error Handling:** Recover from errors without breaking gameplay
- **Testing:** Test all edge cases and performance scenarios

### **MIFF Integration**
- **Standards Compliance:** Follow all MIFF architectural patterns
- **Runtime Hooks:** Integrate with MIFF runtime system
- **Schema Validation:** Include proper data validation
- **Event System:** Use MIFF event system for communication

---

**⚙️ Ready to implement mechanics in your MIFF game! Follow this template to ensure consistency and quality.**