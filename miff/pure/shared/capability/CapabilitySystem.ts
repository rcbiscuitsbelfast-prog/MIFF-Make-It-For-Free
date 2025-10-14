import { StructuredLogger } from '../logging/StructuredLogger';

/**
 * Capability System - Core architectural component for module discovery and introspection
 * Provides comprehensive capability management, discovery, and validation
 */

export interface Capability {
  // Auto-added common properties
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
  id: string;
  name: string;
  description: string;
  version: string;
  type: 'core' | 'feature' | 'integration' | 'utility';
  category: string;
  tags: string[];
  dependencies: string[];
  interfaces: string[];
  methods: CapabilityMethod[];
  properties: CapabilityProperty[];
  events: CapabilityEvent[];
  metadata: Record<string, any>;
  status: 'active' | 'deprecated' | 'experimental' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CapabilityMethod {
  // Auto-added common properties
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
  name: string;
  description: string;
  parameters: CapabilityParameter[];
  returnType: string;
  isAsync: boolean;
  isPublic: boolean;
  examples: string[];
}

export interface CapabilityParameter {
  // Auto-added common properties
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
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: any;
}

export interface CapabilityProperty {
  // Auto-added common properties
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
  name: string;
  type: string;
  description: string;
  readOnly: boolean;
  defaultValue?: any;
}

export interface CapabilityEvent {
  // Auto-added common properties
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
  name: string;
  description: string;
  payload: string;
  isAsync: boolean;
}

export interface CapabilityDiscovery {
  // Auto-added common properties
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
  capabilities: Capability[];
  interfaces: string[];
  dependencies: string[];
  metadata: Record<string, any>;
}

export interface CapabilityRegistry {
  // Auto-added common properties
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
  capabilities: Map<string, Capability>;
  modules: Map<string, CapabilityDiscovery>;
  categories: Map<string, string[]>;
  tags: Map<string, string[]>;
  dependencies: Map<string, string[]>;
}

export class CapabilitySystem {
  
  private registry: CapabilityRegistry;
  private isInitialized: boolean = false;

  constructor(...args: any[]) {
    
    this.registry = {
      capabilities: new Map(),
      modules: new Map(),
      categories: new Map(),
      tags: new Map(),
      dependencies: new Map()
    };
  }

  /**
   * Initialize the capability system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Capability system already initialized');
      return;
    }

    try {
      console.info('Initializing capability system...');
      
      // Discover capabilities from all modules
      await this.discoverCapabilities();
      
      // Build capability registry
      await this.buildRegistry();
      
      this.isInitialized = true;
      console.info('Capability system initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize capability system', { error: error.message });
      throw error;
    }
  }

  /**
   * Discover capabilities from all modules
   */
  private async discoverCapabilities(): Promise<void> {
    console.info('Discovering capabilities from modules...');
    
    // This would typically scan the filesystem for capability files
    // For now, we'll create a basic discovery mechanism
    
    const coreCapabilities = this.createCoreCapabilities();
    const featureCapabilities = this.createFeatureCapabilities();
    const integrationCapabilities = this.createIntegrationCapabilities();
    const utilityCapabilities = this.createUtilityCapabilities();
    
    const allCapabilities = [
      ...coreCapabilities,
      ...featureCapabilities,
      ...integrationCapabilities,
      ...utilityCapabilities
    ];
    
    for (const capability of allCapabilities) {
      this.registry.capabilities.set(capability.id, capability);
    }
    
    console.info(`Discovered ${allCapabilities.length} capabilities`);
  }

  /**
   * Build the capability registry
   */
  private async buildRegistry(): Promise<void> {
    console.info('Building capability registry...');
    
    // Build categories
    for (const capability of this.registry.capabilities.values()) {
      if (!this.registry.categories.has(capability.category)) {
        this.registry.categories.set(capability.category, []);
      }
      this.registry.categories.get(capability.category)?.push(capability.id);
      
      // Build tags
      for (const tag of capability.tags) {
        if (!this.registry.tags.has(tag)) {
          this.registry.tags.set(tag, []);
        }
        this.registry.tags.get(tag)?.push(capability.id);
      }
      
      // Build dependencies
      for (const dependency of capability.dependencies) {
        if (!this.registry.dependencies.has(dependency)) {
          this.registry.dependencies.set(dependency, []);
        }
        this.registry.dependencies.get(dependency)?.push(capability.id);
      }
    }
    
    console.info('Capability registry built successfully');
  }

  /**
   * Create core capabilities
   */
  private createCoreCapabilities(): Capability[] {
    return [
      {
        id: 'core-manager',
        name: 'Manager Pattern',
        description: 'Core manager pattern for all modules',
        version: '1.0.0',
        type: 'core',
        category: 'architecture',
        tags: ['core', 'manager', 'pattern'],
        dependencies: [],
        interfaces: ['IManager'],
        methods: [
          {
            name: 'initialize',
            description: 'Initialize the manager',
            parameters: [],
            returnType: 'Promise<void>',
            isAsync: true,
            isPublic: true,
            examples: ['await manager.initialize();']
          },
          {
            name: 'destroy',
            description: 'Destroy the manager',
            parameters: [],
            returnType: 'Promise<void>',
            isAsync: true,
            isPublic: true,
            examples: ['await manager.destroy();']
          }
        ],
        properties: [
          {
            name: 'isInitialized',
            type: 'boolean',
            description: 'Whether the manager is initialized',
            readOnly: true,
            defaultValue: false
          }
        ],
        events: [],
        metadata: {
          priority: 'high',
          stability: 'stable'
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'core-logging',
        name: 'Structured Logging',
        description: 'Structured logging system',
        version: '1.0.0',
        type: 'core',
        category: 'logging',
        tags: ['core', 'logging', 'structured'],
        dependencies: [],
        interfaces: ['ILogger'],
        methods: [
          {
            name: 'info',
            description: 'Log info message',
            parameters: [
              { name: 'message', type: 'string', required: true, description: 'Log message' },
              { name: 'context', type: 'object', required: false, description: 'Log context' }
            ],
            returnType: 'void',
            isAsync: false,
            isPublic: true,
            examples: ['logger.info("Operation completed", { userId: 123 });']
          }
        ],
        properties: [],
        events: [],
        metadata: {
          priority: 'high',
          stability: 'stable'
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  /**
   * Create feature capabilities
   */
  private createFeatureCapabilities(): Capability[] {
    return [
      {
        id: 'feature-ai',
        name: 'AI Integration',
        description: 'Artificial intelligence integration capabilities',
        version: '1.0.0',
        type: 'feature',
        category: 'ai',
        tags: ['ai', 'machine-learning', 'intelligence'],
        dependencies: ['core-manager', 'core-logging'],
        interfaces: ['IAISystem'],
        methods: [
          {
            name: 'processAI',
            description: 'Process AI request',
            parameters: [
              { name: 'request', type: 'AIRequest', required: true, description: 'AI request' }
            ],
            returnType: 'Promise<AIResponse>',
            isAsync: true,
            isPublic: true,
//             examples: ['const response = await aiSystem.processAI(request);']
          }
        ],
        properties: [],
        events: [
          {
            name: 'aiProcessed',
            description: 'AI processing completed',
            payload: 'AIResponse',
            isAsync: true
          }
        ],
        metadata: {
          priority: 'medium',
          stability: 'stable'
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  /**
   * Create integration capabilities
   */
  private createIntegrationCapabilities(): Capability[] {
    return [
      {
        id: 'integration-godot',
        name: 'Godot Integration',
        description: 'Godot game engine integration',
        version: '1.0.0',
        type: 'integration',
        category: 'engine',
        tags: ['godot', 'engine', 'integration'],
        dependencies: ['core-manager'],
        interfaces: ['IGodotBridge'],
        methods: [
          {
            name: 'exportToGodot',
            description: 'Export project to Godot',
            parameters: [
              { name: 'project', type: 'Project', required: true, description: 'Project to export' }
            ],
            returnType: 'Promise<ExportResult>',
            isAsync: true,
            isPublic: true,
            examples: ['const result = await godotBridge.exportToGodot(project);']
          }
        ],
        properties: [],
        events: [],
        metadata: {
          priority: 'medium',
          stability: 'stable'
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  /**
   * Create utility capabilities
   */
  private createUtilityCapabilities(): Capability[] {
    return [
      {
        id: 'utility-validation',
        name: 'Input Validation',
        description: 'Input validation utilities',
        version: '1.0.0',
        type: 'utility',
        category: 'validation',
        tags: ['validation', 'input', 'security'],
        dependencies: [],
        interfaces: ['IValidator'],
        methods: [
          {
            name: 'validate',
            description: 'Validate input data',
            parameters: [
              { name: 'data', type: 'any', required: true, description: 'Data to validate' },
              { name: 'schema', type: 'Schema', required: true, description: 'Validation schema' }
            ],
            returnType: 'ValidationResult',
            isAsync: false,
            isPublic: true,
            examples: ['const result = validator.validate(data, schema);']
          }
        ],
        properties: [],
        events: [],
        metadata: {
          priority: 'high',
          stability: 'stable'
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  /**
   * Get capability by ID
   */
  getCapability(id: string): Capability! {
    return this.registry.capabilities.get(id);
  }

  /**
   * Get all capabilities
   */
  getAllCapabilities(): Capability[] {
    return Array.from(this.registry.capabilities.values());
  }

  /**
   * Get capabilities by category
   */
  getCapabilitiesByCategory(category: string): Capability[] {
    const capabilityIds = this.registry.categories.get(category) || [];
    return capabilityIds.map(id => this.registry.capabilities.get(id)!);
  }

  /**
   * Get capabilities by tag
   */
  getCapabilitiesByTag(tag: string): Capability[] {
    const capabilityIds = this.registry.tags.get(tag) || [];
    return capabilityIds.map(id => this.registry.capabilities.get(id)!);
  }

  /**
   * Get capabilities by type
   */
  getCapabilitiesByType(type: string): Capability[] {
    return this.getAllCapabilities().filter(cap => cap.type === type);
  }

  /**
   * Search capabilities
   */
  searchCapabilities(query: string): Capability[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllCapabilities().filter(cap => 
      cap.name.toLowerCase().includes(lowerQuery) ||
      cap.description.toLowerCase().includes(lowerQuery) ||
      cap.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get capability dependencies
   */
  getCapabilityDependencies(id: string): Capability[] {
    const capability = this.registry.capabilities.get(id);
    if (!capability) return [];
    
    return capability.dependencies
      .map(depId => this.registry.capabilities.get(depId))
      .filter(Boolean) as Capability[];
  }

  /**
   * Get capability dependents
   */
  getCapabilityDependents(id: string): Capability[] {
    const dependentIds = this.registry.dependencies.get(id) || [];
    return dependentIds.map(depId => this.registry.capabilities.get(depId)!);
  }

  /**
   * Get capability statistics
   */
  getCapabilityStats(): {
    total: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  } {
    const capabilities = this.getAllCapabilities();
    
    const byType = capabilities.reduce((acc, cap) => {
      acc[cap.type] = (acc[cap.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byCategory = capabilities.reduce((acc, cap) => {
      acc[cap.category] = (acc[cap.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byStatus = capabilities.reduce((acc, cap) => {
      acc[cap.status] = (acc[cap.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: capabilities.length,
      byType,
      byCategory,
      byStatus
    };
  }

  /**
   * Destroy the capability system
   */
  async destroy(): Promise<void> {
    console.info('Destroying capability system...');
    
    this.registry.capabilities.clear();
    this.registry.modules.clear();
    this.registry.categories.clear();
    this.registry.tags.clear();
    this.registry.dependencies.clear();
    
    this.isInitialized = false;
    console.info('Capability system destroyed');
  }
}

// Export default instance
export const capabilitySystem = new CapabilitySystem();
export default capabilitySystem;