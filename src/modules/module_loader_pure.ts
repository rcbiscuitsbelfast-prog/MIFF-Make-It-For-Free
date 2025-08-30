/**
 * ModuleLoaderPure.ts - Runtime hot-swapping and dynamic module loading
 * 
 * MIFF Framework - Make It For Free
 * License: AGPL-3.0 (remix-safe, see LICENSE.md)
 * 
 * Inspired by Delta Engine's hot-reloading capabilities and Crystal Space's plugin system.
 * Enables dynamic loading, unloading, and hot-swapping of MIFF modules at runtime.
 * 
 * Usage:
 *   const loader = new ModuleLoaderPure(systemRegistry, eventBus);
 *   await loader.loadModule('./PhysicsSystemPure', 'physics');
 *   await loader.hotSwapModule('physics', './NewPhysicsSystemPure');
 * 
 * Remix Safety:
 *   - Modules are isolated and can be safely replaced
 *   - Automatic cleanup prevents memory leaks
 *   - Error handling ensures system stability
 *   - Validation prevents loading of incompatible modules
 */

import type { SystemPure, IMIFFSystem, SystemFactory } from './system_pure';
import type { EventBusPure } from './eventbus_pure';

/**
 * Module metadata interface
 * Modules should export this information for validation
 */
export interface ModuleMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  miffVersion?: string;
  dependencies?: string[];
  provides?: string[];
  tags?: string[];
}

/**
 * Module export interface
 * Defines what a MIFF module should export
 */
export interface MIFFModule {
  metadata: ModuleMetadata;
  systems?: Record<string, SystemFactory>;
  install?: (loader: ModuleLoaderPure) => Promise<void> | void;
  uninstall?: (loader: ModuleLoaderPure) => Promise<void> | void;
}

/**
 * Loaded module tracking
 */
interface LoadedModule {
  path: string;
  module: MIFFModule;
  loadTime: number;
  systemNames: string[];
  dependencies: string[];
}

/**
 * Module loading options
 */
export interface ModuleLoadOptions {
  /** Force reload even if module is already loaded */
  forceReload?: boolean;
  /** Skip dependency validation */
  skipValidation?: boolean;
  /** Custom configuration for the module */
  config?: Record<string, any>;
  /** Timeout for module loading in milliseconds */
  timeout?: number;
}

/**
 * Runtime module loader with hot-swapping capabilities
 * Manages the lifecycle of MIFF modules and systems
 */
export class ModuleLoaderPure {
  private loadedModules = new Map<string, LoadedModule>();
  private moduleAliases = new Map<string, string>();
  private loadingPromises = new Map<string, Promise<MIFFModule>>();
  
  constructor(
    private systemRegistry: SystemPure,
    private eventBus: EventBusPure
  ) {
    // Listen for system events to track module state
    this.eventBus.subscribe('system.error', (data) => {
      console.warn(`Module system error in ${data.systemName}:`, data.error);
    });
  }

  /**
   * Load a module from a path or URL
   * @param modulePath - Path to the module file
   * @param alias - Optional alias for the module
   * @param options - Loading options
   */
  async loadModule(
    modulePath: string,
    alias?: string,
    options: ModuleLoadOptions = {}
  ): Promise<MIFFModule> {
    const {
      forceReload = false,
      skipValidation = false,
      config = {},
      timeout = 30000
    } = options;

    const moduleKey = alias || modulePath;

    // Check if module is already loaded
    if (this.loadedModules.has(moduleKey) && !forceReload) {
      return this.loadedModules.get(moduleKey)!.module;
    }

    // Check for ongoing load
    if (this.loadingPromises.has(moduleKey)) {
      return await this.loadingPromises.get(moduleKey)!;
    }

    // Start loading process
    const loadPromise = this.performModuleLoad(
      modulePath, 
      moduleKey, 
      config, 
      skipValidation, 
      timeout
    );
    
    this.loadingPromises.set(moduleKey, loadPromise);

    try {
      const module = await loadPromise;
      this.loadingPromises.delete(moduleKey);
      return module;
    } catch (error) {
      this.loadingPromises.delete(moduleKey);
      throw error;
    }
  }

  /**
   * Unload a module and clean up its systems
   */
  async unloadModule(moduleKey: string): Promise<void> {
    const loadedModule = this.loadedModules.get(moduleKey);
    if (!loadedModule) {
      console.warn(`Module '${moduleKey}' is not loaded`);
      return;
    }

    this.eventBus.publish('module.unloading', {
      moduleKey,
      moduleName: loadedModule.module.metadata.name
    });

    try {
      // Call module's uninstall hook
      if (loadedModule.module.uninstall) {
        await loadedModule.module.uninstall(this);
      }

      // Unregister all systems from this module
      for (const systemName of loadedModule.systemNames) {
        if (this.systemRegistry.isRegistered(systemName)) {
          await this.systemRegistry.unregister(systemName);
        }
      }

      // Remove from tracking
      this.loadedModules.delete(moduleKey);
      
      // Remove alias if it exists
      for (const [alias, path] of this.moduleAliases.entries()) {
        if (path === moduleKey) {
          this.moduleAliases.delete(alias);
        }
      }

      this.eventBus.publish('module.unloaded', {
        moduleKey,
        moduleName: loadedModule.module.metadata.name
      });

    } catch (error) {
      console.error(`Error unloading module '${moduleKey}':`, error);
      this.eventBus.publish('module.unload.error', {
        moduleKey,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Hot-swap a module with a new implementation
   * Maintains system state where possible
   */
  async hotSwapModule(
    moduleKey: string,
    newModulePath: string,
    options: ModuleLoadOptions = {}
  ): Promise<void> {
    const oldModule = this.loadedModules.get(moduleKey);
    if (!oldModule) {
      throw new Error(`Cannot hot-swap: module '${moduleKey}' is not loaded`);
    }

    this.eventBus.publish('module.hotswap.start', {
      moduleKey,
      oldPath: oldModule.path,
      newPath: newModulePath
    });

    try {
      // Load new module temporarily
      const newModule = await this.performModuleLoad(
        newModulePath,
        `${moduleKey}_temp`,
        options.config || {},
        options.skipValidation || false,
        options.timeout || 30000
      );

      // Validate compatibility
      if (!this.validateModuleCompatibility(oldModule.module, newModule)) {
        throw new Error(`New module is not compatible with existing module '${moduleKey}'`);
      }

      // Unload old module
      await this.unloadModule(moduleKey);

      // Register new module with original key
      this.loadedModules.set(moduleKey, {
        path: newModulePath,
        module: newModule,
        loadTime: Date.now(),
        systemNames: Object.keys(newModule.systems || {}),
        dependencies: newModule.metadata.dependencies || []
      });

      // Install new module
      if (newModule.install) {
        await newModule.install(this);
      }

      // Register systems from new module
      await this.registerModuleSystems(newModule, moduleKey);

      // Clean up temporary loading entry
      this.loadedModules.delete(`${moduleKey}_temp`);

      this.eventBus.publish('module.hotswap.complete', {
        moduleKey,
        newVersion: newModule.metadata.version
      });

    } catch (error) {
      console.error(`Hot-swap failed for module '${moduleKey}':`, error);
      this.eventBus.publish('module.hotswap.error', {
        moduleKey,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get information about loaded modules
   */
  getLoadedModules(): Record<string, any> {
    const modules: Record<string, any> = {};
    
    for (const [key, loaded] of this.loadedModules.entries()) {
      modules[key] = {
        path: loaded.path,
        metadata: loaded.module.metadata,
        loadTime: loaded.loadTime,
        systemNames: loaded.systemNames,
        dependencies: loaded.dependencies
      };
    }
    
    return modules;
  }

  /**
   * Check if a module is loaded
   */
  isModuleLoaded(moduleKey: string): boolean {
    return this.loadedModules.has(moduleKey);
  }

  /**
   * Get module by key or alias
   */
  getModule(moduleKey: string): MIFFModule | null {
    const loaded = this.loadedModules.get(moduleKey);
    return loaded ? loaded.module : null;
  }

  /**
   * Create an alias for a loaded module
   */
  createAlias(alias: string, moduleKey: string): void {
    if (!this.loadedModules.has(moduleKey)) {
      throw new Error(`Cannot create alias: module '${moduleKey}' is not loaded`);
    }
    
    this.moduleAliases.set(alias, moduleKey);
  }

  /**
   * Resolve alias to actual module key
   */
  resolveAlias(keyOrAlias: string): string {
    return this.moduleAliases.get(keyOrAlias) || keyOrAlias;
  }

  /**
   * Validate module dependencies
   */
  validateDependencies(module: MIFFModule): string[] {
    const missing: string[] = [];
    const deps = module.metadata.dependencies || [];
    
    for (const dep of deps) {
      const resolved = this.resolveAlias(dep);
      if (!this.loadedModules.has(resolved)) {
        missing.push(dep);
      }
    }
    
    return missing;
  }

  /**
   * Get dependency graph for debugging
   */
  getDependencyGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {};
    
    for (const [key, loaded] of this.loadedModules.entries()) {
      graph[key] = loaded.dependencies;
    }
    
    return graph;
  }

  /**
   * Perform the actual module loading
   */
  private async performModuleLoad(
    modulePath: string,
    moduleKey: string,
    config: Record<string, any>,
    skipValidation: boolean,
    timeout: number
  ): Promise<MIFFModule> {
    this.eventBus.publish('module.loading', { moduleKey, modulePath });

    try {
      // Load module with timeout
      const modulePromise = this.importModule(modulePath);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Module load timeout: ${modulePath}`)), timeout);
      });

      const moduleExports = await Promise.race([modulePromise, timeoutPromise]);
      const module = this.validateModuleExports(moduleExports, modulePath);

      // Validate dependencies unless skipped
      if (!skipValidation) {
        const missingDeps = this.validateDependencies(module);
        if (missingDeps.length > 0) {
          throw new Error(`Missing dependencies: ${missingDeps.join(', ')}`);
        }
      }

      // Track loaded module
      const loadedModule: LoadedModule = {
        path: modulePath,
        module,
        loadTime: Date.now(),
        systemNames: Object.keys(module.systems || {}),
        dependencies: module.metadata.dependencies || []
      };

      this.loadedModules.set(moduleKey, loadedModule);

      // Call module's install hook
      if (module.install) {
        await module.install(this);
      }

      // Register systems
      await this.registerModuleSystems(module, moduleKey);

      this.eventBus.publish('module.loaded', {
        moduleKey,
        moduleName: module.metadata.name,
        version: module.metadata.version
      });

      return module;

    } catch (error) {
      console.error(`Failed to load module '${modulePath}':`, error);
      this.eventBus.publish('module.load.error', {
        moduleKey,
        modulePath,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Dynamic import with error handling
   */
  private async importModule(modulePath: string): Promise<any> {
    try {
      // Handle different module path formats
      if (modulePath.startsWith('http') || modulePath.startsWith('/')) {
        return await import(modulePath);
      } else if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
        return await import(modulePath);
      } else {
        // Assume it's a relative path from current location
        return await import(`./${modulePath}`);
      }
    } catch (error) {
      throw new Error(`Failed to import module '${modulePath}': ${error}`);
    }
  }

  /**
   * Validate that module exports conform to MIFFModule interface
   */
  private validateModuleExports(moduleExports: any, modulePath: string): MIFFModule {
    if (!moduleExports || typeof moduleExports !== 'object') {
      throw new Error(`Module '${modulePath}' does not export an object`);
    }

    // Check for metadata
    if (!moduleExports.metadata || typeof moduleExports.metadata !== 'object') {
      throw new Error(`Module '${modulePath}' missing required metadata`);
    }

    const { metadata } = moduleExports;
    
    if (!metadata.name || typeof metadata.name !== 'string') {
      throw new Error(`Module '${modulePath}' metadata missing required 'name' field`);
    }

    if (!metadata.version || typeof metadata.version !== 'string') {
      throw new Error(`Module '${modulePath}' metadata missing required 'version' field`);
    }

    return moduleExports as MIFFModule;
  }

  /**
   * Register all systems from a module
   */
  private async registerModuleSystems(module: MIFFModule, moduleKey: string): Promise<void> {
    if (!module.systems) return;

    for (const [systemName, factory] of Object.entries(module.systems)) {
      try {
        this.systemRegistry.register(systemName, factory, {
          dependencies: module.metadata.dependencies || [],
          singleton: true,
          replaceExisting: true
        });
        
        console.log(`Registered system '${systemName}' from module '${moduleKey}'`);
      } catch (error) {
        console.error(`Failed to register system '${systemName}' from module '${moduleKey}':`, error);
        throw error;
      }
    }
  }

  /**
   * Validate compatibility between old and new modules for hot-swapping
   */
  private validateModuleCompatibility(oldModule: MIFFModule, newModule: MIFFModule): boolean {
    // Check that module names match
    if (oldModule.metadata.name !== newModule.metadata.name) {
      console.warn('Module names do not match during hot-swap');
      return false;
    }

    // Check that provided systems are compatible
    const oldSystems = new Set(Object.keys(oldModule.systems || {}));
    const newSystems = new Set(Object.keys(newModule.systems || {}));
    
    // New module should provide at least the same systems
    for (const systemName of oldSystems) {
      if (!newSystems.has(systemName)) {
        console.warn(`New module missing system '${systemName}' required for hot-swap`);
        return false;
      }
    }

    return true;
  }
}

/**
 * Utility function to create a module metadata object
 */
export function createModuleMetadata(metadata: Partial<ModuleMetadata>): ModuleMetadata {
  return {
    name: metadata.name || 'Unknown Module',
    version: metadata.version || '1.0.0',
    description: metadata.description,
    author: metadata.author,
    license: metadata.license || 'AGPL-3.0',
    miffVersion: metadata.miffVersion || '1.0.0',
    dependencies: metadata.dependencies || [],
    provides: metadata.provides || [],
    tags: metadata.tags || []
  };
}

/**
 * Utility function to create a basic MIFF module structure
 */
export function createMIFFModule(
  metadata: ModuleMetadata,
  systems: Record<string, SystemFactory> = {},
  hooks: {
    install?: (loader: ModuleLoaderPure) => Promise<void> | void;
    uninstall?: (loader: ModuleLoaderPure) => Promise<void> | void;
  } = {}
): MIFFModule {
  return {
    metadata,
    systems,
    install: hooks.install,
    uninstall: hooks.uninstall
  };
}