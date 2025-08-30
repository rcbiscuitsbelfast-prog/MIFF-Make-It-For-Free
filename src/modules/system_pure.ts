/**
 * SystemPure.ts - Core system registry with dependency injection
 * 
 * MIFF Framework - Make It For Free
 * License: AGPL-3.0 (remix-safe, see LICENSE.md)
 * 
 * Inspired by Delta Engine's service locator pattern and clean dependency injection.
 * Provides runtime service registration, resolution, and hot-swapping capabilities.
 * 
 * Usage:
 *   const system = new SystemPure();
 *   system.register('physics', () => new PhysicsSystem());
 *   const physics = system.resolve<PhysicsSystem>('physics');
 * 
 * Remix Safety:
 *   - Interface-driven design allows swapping implementations
 *   - No hard dependencies on specific service implementations
 *   - Services can be mocked for testing
 *   - Hot-reload friendly with proper lifecycle management
 */

import type { EventBusPure } from './eventbus_pure';

/**
 * Base interface that all MIFF systems should implement
 * Provides lifecycle hooks for proper initialization and cleanup
 */
export interface IMIFFSystem {
  readonly name: string;
  readonly version: string;
  
  /**
   * Initialize the system
   * Called when system is first registered and resolved
   */
  init(): Promise<void> | void;
  
  /**
   * Update the system (called every frame if applicable)
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  update?(deltaTime: number): void;
  
  /**
   * Clean up system resources
   * Called when system is being replaced or shut down
   */
  shutdown(): Promise<void> | void;
  
  /**
   * Get system configuration for debugging/introspection
   */
  getConfig?(): Record<string, any>;
}

/**
 * Factory function type for creating system instances
 */
export type SystemFactory<T = IMIFFSystem> = (
  dependencies: SystemDependencies
) => T | Promise<T>;

/**
 * Dependencies passed to system factories
 */
export interface SystemDependencies {
  eventBus: EventBusPure;
  registry: SystemPure;
  config?: Record<string, any>;
}

/**
 * System registration metadata
 */
export interface SystemRegistration<T = IMIFFSystem> {
  name: string;
  factory: SystemFactory<T>;
  dependencies: string[];
  singleton: boolean;
  instance?: T;
  initPromise?: Promise<T>;
}

/**
 * Main system registry and dependency injection container
 * Manages all MIFF subsystems with hot-swapping support
 */
export class SystemPure {
  private systems = new Map<string, SystemRegistration<IMIFFSystem>>();
  private instances = new Map<string, IMIFFSystem>();
  private initOrder: string[] = [];
  private eventBus?: EventBusPure;
  
  constructor(eventBus?: EventBusPure) {
    this.eventBus = eventBus;
  }

  /**
   * Set the event bus for this system registry
   * Usually called during bootstrap
   */
  setEventBus(eventBus: EventBusPure): void {
    this.eventBus = eventBus;
  }

  /**
   * Register a system factory with the registry
   * @param name - Unique system identifier
   * @param factory - Function that creates the system instance
   * @param options - Registration options
   */
  register<T extends IMIFFSystem>(
    name: string,
    factory: SystemFactory<T>,
    options: {
      dependencies?: string[];
      singleton?: boolean;
      replaceExisting?: boolean;
    } = {}
  ): void {
    const {
      dependencies = [],
      singleton = true,
      replaceExisting = false
    } = options;

    // Check if system already exists
    if (this.systems.has(name) && !replaceExisting) {
      throw new Error(`System '${name}' is already registered. Use replaceExisting: true to replace.`);
    }

    // If replacing, shut down existing system
    if (this.systems.has(name) && replaceExisting) {
      this.unregister(name);
    }

    const registration: SystemRegistration<T> = {
      name,
      factory: factory,
      dependencies,
      singleton
    };

    this.systems.set(name, registration);
    
    // Emit registration event
    this.eventBus?.publish('system.registered', {
      systemName: name,
      dependencies,
      singleton
    });
  }

  /**
   * Resolve a system instance, initializing it if needed
   * Handles dependency resolution automatically
   */
  async resolve<T extends IMIFFSystem>(name: string): Promise<T> {
    const registration = this.systems.get(name);
    if (!registration) {
      throw new Error(`System '${name}' is not registered.`);
    }

    // Return existing instance if singleton and already created
    if (registration.singleton && registration.instance) {
      return registration.instance as T;
    }

    // Check for pending initialization to avoid duplicate work
    if (registration.initPromise) {
      return (await registration.initPromise) as T;
    }

    // Create initialization promise
    registration.initPromise = this.createSystemInstance(registration);
    
    try {
      const instance = await registration.initPromise;
      
      // Store instance if singleton
      if (registration.singleton) {
        registration.instance = instance;
        this.instances.set(name, instance);
      }
      
      return instance as T;
    } catch (error) {
      // Clear failed init promise
      delete registration.initPromise;
      throw error;
    }
  }

  /**
   * Resolve a system synchronously (only works if already initialized)
   * Throws error if system is not ready
   */
  resolveSync<T extends IMIFFSystem>(name: string): T {
    const registration = this.systems.get(name);
    if (!registration) {
      throw new Error(`System '${name}' is not registered.`);
    }

    if (!registration.instance) {
      throw new Error(`System '${name}' is not initialized. Use resolve() for async initialization.`);
    }

    return registration.instance as T;
  }

  /**
   * Check if a system is registered
   */
  isRegistered(name: string): boolean {
    return this.systems.has(name);
  }

  /**
   * Check if a system is initialized
   */
  isInitialized(name: string): boolean {
    const registration = this.systems.get(name);
    return registration?.instance !== undefined;
  }

  /**
   * Unregister and shut down a system
   */
  async unregister(name: string): Promise<void> {
    const registration = this.systems.get(name);
    if (!registration) {
      return;
    }

    // Shut down instance if it exists
    if (registration.instance) {
      try {
        await registration.instance.shutdown();
      } catch (error) {
        console.error(`Error shutting down system '${name}':`, error);
      }
    }

    // Remove from collections
    this.systems.delete(name);
    this.instances.delete(name);
    
    // Remove from init order
    const index = this.initOrder.indexOf(name);
    if (index >= 0) {
      this.initOrder.splice(index, 1);
    }

    this.eventBus?.publish('system.unregistered', { systemName: name });
  }

  /**
   * Initialize all registered systems in dependency order
   */
  async initializeAll(): Promise<void> {
    const systemNames = Array.from(this.systems.keys());
    const resolved = new Set<string>();
    const resolving = new Set<string>();

    // Topological sort for dependency resolution
    const resolutionOrder: string[] = [];
    
    const visit = (name: string): void => {
      if (resolved.has(name)) return;
      if (resolving.has(name)) {
        throw new Error(`Circular dependency detected involving system '${name}'`);
      }

      resolving.add(name);
      
      const registration = this.systems.get(name);
      if (registration) {
        for (const dep of registration.dependencies) {
          if (!this.systems.has(dep)) {
            throw new Error(`System '${name}' depends on unregistered system '${dep}'`);
          }
          visit(dep);
        }
      }
      
      resolving.delete(name);
      resolved.add(name);
      resolutionOrder.push(name);
    };

    // Visit all systems to build resolution order
    for (const name of systemNames) {
      visit(name);
    }

    // Initialize in dependency order
    for (const name of resolutionOrder) {
      await this.resolve(name);
    }

    this.initOrder = resolutionOrder;
    this.eventBus?.publish('system.allInitialized', { 
      initOrder: this.initOrder 
    });
  }

  /**
   * Shut down all systems in reverse initialization order
   */
  async shutdownAll(): Promise<void> {
    const shutdownOrder = [...this.initOrder].reverse();
    
    for (const name of shutdownOrder) {
      await this.unregister(name);
    }

    this.initOrder = [];
    this.eventBus?.publish('system.allShutdown', {});
  }

  /**
   * Update all systems that support update cycles
   */
  updateAll(deltaTime: number): void {
    for (const instance of this.instances.values()) {
      if (instance.update) {
        try {
          instance.update(deltaTime);
        } catch (error) {
          console.error(`Error updating system '${instance.name}':`, error);
        }
      }
    }
  }

  /**
   * Get all registered system names
   */
  getSystemNames(): string[] {
    return Array.from(this.systems.keys()).sort();
  }

  /**
   * Get system information for debugging
   */
  getSystemInfo(name: string): Record<string, any> | null {
    const registration = this.systems.get(name);
    if (!registration) {
      return null;
    }

    return {
      name: registration.name,
      dependencies: registration.dependencies,
      singleton: registration.singleton,
      initialized: registration.instance !== undefined,
      config: registration.instance?.getConfig?.() || {}
    };
  }

  /**
   * Get information about all systems
   */
  getAllSystemInfo(): Record<string, any> {
    const info: Record<string, any> = {};
    
    for (const name of this.systems.keys()) {
      info[name] = this.getSystemInfo(name);
    }
    
    return info;
  }

  /**
   * Create a system instance with proper dependency injection
   */
  private async createSystemInstance<T extends IMIFFSystem>(
    registration: SystemRegistration<T>
  ): Promise<T> {
    // Resolve dependencies first
    const dependencies: SystemDependencies = {
      eventBus: this.eventBus!,
      registry: this
    };

    // Wait for all dependencies to be resolved
    for (const depName of registration.dependencies) {
      await this.resolve(depName);
    }

    // Create the instance
    const instance = await registration.factory(dependencies);

    // Initialize the instance
    if (instance.init) {
      await instance.init();
    }

    this.eventBus?.publish('system.initialized', {
      systemName: instance.name,
      version: instance.version
    });

    return instance;
  }
}

/**
 * Global system registry instance
 * Modules can import this directly or create isolated registries for testing
 */
export const globalSystemRegistry = new SystemPure();

/**
 * Convenience decorator for registering systems
 * Usage: @MIFFSystem('physics', ['input', 'eventBus'])
 */
export function MIFFSystem(
  name: string, 
  dependencies: string[] = []
) {
  return function<T extends new (...args: any[]) => IMIFFSystem>(
    constructor: T
  ) {
    // Register the system class as a factory
    globalSystemRegistry.register(
      name,
      (deps) => new constructor(deps),
      { dependencies }
    );
    
    return constructor;
  };
}

/**
 * Base class for MIFF systems
 * Provides common functionality and enforces interface compliance
 */
export abstract class BaseMIFFSystem implements IMIFFSystem {
  abstract readonly name: string;
  abstract readonly version: string;
  
  protected eventBus: EventBusPure;
  protected registry: SystemPure;
  protected config: Record<string, any>;

  constructor(dependencies: SystemDependencies) {
    this.eventBus = dependencies.eventBus;
    this.registry = dependencies.registry;
    this.config = dependencies.config || {};
  }

  abstract init(): Promise<void> | void;
  abstract shutdown(): Promise<void> | void;

  update?(deltaTime: number): void;

  getConfig(): Record<string, any> {
    return { ...this.config };
  }

  /**
   * Emit an event through the system event bus
   */
  protected emit(eventType: string, data: any = {}): void {
    this.eventBus.publish(eventType, {
      ...data,
      source: this.name
    });
  }

  /**
   * Subscribe to an event
   */
  protected subscribe<T = any>(
    eventType: string, 
    handler: (data: T) => void
  ) {
    return this.eventBus.subscribe(eventType, handler);
  }
}