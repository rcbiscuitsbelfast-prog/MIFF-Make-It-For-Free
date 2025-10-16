/**
 * MIFF Lazy Loading System
 *
 * Intelligent lazy loading and preloading for MIFF modules
 */

import { CacheManager, CacheEntry } from './CacheManager';

export interface ModuleInfo {
  name: string;
  path: string;
  dependencies: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  preload: boolean;
  lazy: boolean;
  size: number;
  loadTime: number;
}

export interface LoadingStrategy {
  name: string;
  modules: string[];
  trigger: 'immediate' | 'interaction' | 'idle' | 'manual';
  priority: number;
  preload: boolean;
}

export class LazyLoader {
  private cacheManager: CacheManager;
  private moduleRegistry: Map<string, ModuleInfo> = new Map();
  private loadingStrategies: LoadingStrategy[] = [];
  private loadedModules: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private intersectionObserver?: IntersectionObserver;
  private idleCallbackId?: number;

  constructor(cacheManager: CacheManager) {
    this.cacheManager = cacheManager;
    this.initializeModuleRegistry();
    this.initializeLoadingStrategies();
    this.setupIntersectionObserver();
    this.setupIdleLoading();
  }

  /**
   * Register a module for lazy loading
   */
  registerModule(moduleInfo: ModuleInfo): void {
    this.moduleRegistry.set(moduleInfo.name, moduleInfo);
    this.log(`Registered module: ${moduleInfo.name} (${moduleInfo.priority} priority)`);

    // Auto-preload critical modules
    if (moduleInfo.preload && moduleInfo.priority === 'critical') {
      this.preloadModule(moduleInfo.name);
    }
  }

  /**
   * Load a module with intelligent caching
   */
  async loadModule(moduleName: string, options: { force?: boolean; priority?: boolean } = {}): Promise<any> {
    // Check if already loaded
    if (this.loadedModules.has(moduleName) && !options.force) {
      const cached = this.cacheManager.get(`module:${moduleName}`);
      if (cached) {
        this.log(`Module ${moduleName} already loaded and cached`);
        return cached;
      }
    }

    // Check if already loading
    if (this.loadingPromises.has(moduleName)) {
      this.log(`Module ${moduleName} already loading, waiting...`);
      return this.loadingPromises.get(moduleName);
    }

    // Start loading
    const loadingPromise = this.performModuleLoad(moduleName, options);
    this.loadingPromises.set(moduleName, loadingPromise);

    try {
      const module = await loadingPromise;
      this.loadedModules.add(moduleName);
      this.cacheManager.set(`module:${moduleName}`, module, {
        ttl: 3600000, // 1 hour
        metadata: { type: 'module', loaded: true }
      });

      this.log(`✅ Module loaded: ${moduleName}`);
      return module;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.log(`❌ Failed to load module ${moduleName}: ${error.message}`, 'error');
      throw error;
    } finally {
      this.loadingPromises.delete(moduleName);
    }
  }

  /**
   * Preload modules based on strategy
   */
  async preloadModules(strategyName?: string): Promise<void> {
    const strategies = strategyName
      ? this.loadingStrategies.filter(s => s.name === strategyName)
      : this.loadingStrategies;

    for (const strategy of strategies) {
      this.log(`Preloading strategy: ${strategy.name} (${strategy.modules.length} modules)`);

      for (const moduleName of strategy.modules) {
        if (strategy.preload) {
          try {
            await this.preloadModule(moduleName);
          } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
            this.log(`Preload failed for ${moduleName}: ${error.message}`, 'debug');
          }
        }
      }
    }
  }

  /**
   * Get module loading status
   */
  getModuleStatus(moduleName: string): 'not-loaded' | 'loading' | 'loaded' | 'error' {
    if (this.loadedModules.has(moduleName)) return 'loaded';
    if (this.loadingPromises.has(moduleName)) return 'loading';
    if (this.cacheManager.has(`module:${moduleName}`)) return 'loaded';
    return 'not-loaded';
  }

  /**
   * Get loading statistics
   */
  getLoadingStats() {
    const modules = Array.from(this.moduleRegistry.values());
    const loadedCount = this.loadedModules.size;
    const cachedCount = Array.from(this.cacheManager.getEntriesByPattern('module:')).length;
    const totalSize = modules.reduce((sum, mod) => sum + mod.size, 0);

    return {
      totalModules: modules.length,
      loadedModules: loadedCount,
      cachedModules: cachedCount,
      loadingModules: this.loadingPromises.size,
      totalSize,
      averageLoadTime: this.calculateAverageLoadTime(),
      loadingEfficiency: loadedCount / Math.max(1, modules.length - cachedCount)
    };
  }

  /**
   * Create lazy component wrapper
   */
  createLazyComponent(moduleName: string, componentName: string) {
    return {
      load: () => this.loadModule(moduleName),
      isLoaded: () => this.loadedModules.has(moduleName),
      getStatus: () => this.getModuleStatus(moduleName)
    };
  }

  /**
   * Optimize loading based on user behavior
   */
  optimizeForUserBehavior(interactionData: {
    mostUsedModules: string[];
    averageSessionTime: number;
    peakUsageHours: number[];
  }): void {
    this.log('Optimizing loading strategy based on user behavior...');

    // Adjust loading strategies
    this.loadingStrategies.forEach(strategy => {
      const priorityBoost = interactionData.mostUsedModules.includes(strategy.name) ? 2 : 1;
      strategy.priority = Math.min(10, strategy.priority * priorityBoost);
    });

    // Preload frequently used modules
    interactionData.mostUsedModules.slice(0, 5).forEach(moduleName => {
      if (!this.loadedModules.has(moduleName)) {
        this.preloadModule(moduleName);
      }
    });

    this.log('Loading optimization complete');
  }

  private async performModuleLoad(moduleName: string, options: { force?: boolean; priority?: boolean } = {}): Promise<any> {
    const moduleInfo = this.moduleRegistry.get(moduleName);
    if (!moduleInfo) {
      throw new Error(`Module ${moduleName} not registered`);
    }

    const startTime = performance.now();

    try {
      // Simulate module loading with realistic timing
      await this.simulateModuleLoad(moduleInfo);

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      this.log(`Module ${moduleName} loaded in ${loadTime.toFixed(2)}ms`);

      // Update module info
      moduleInfo.loadTime = loadTime;
      moduleInfo.lazy = false;

      return { moduleName, loadTime, status: 'success' };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.log(`Module load failed: ${error.message}`, 'error');
      throw error;
    }
  }

  private async preloadModule(moduleName: string): Promise<void> {
    if (this.loadedModules.has(moduleName)) {
      this.log(`Module ${moduleName} already loaded`);
      return;
    }

    try {
      this.log(`Preloading module: ${moduleName}`);
      await this.loadModule(moduleName, { priority: true });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.log(`Preload failed for ${moduleName}: ${error.message}`, 'debug');
    }
  }

  private async simulateModuleLoad(moduleInfo: ModuleInfo): Promise<void> {
    // Simulate realistic loading time based on module size and complexity
    const baseLoadTime = 50; // Base 50ms
    const sizeFactor = moduleInfo.size / 1000; // Size factor
    const dependencyFactor = moduleInfo.dependencies.length * 10; // Dependency factor
    const complexityFactor = moduleInfo.priority === 'critical' ? 1.5 : 1; // Critical modules load faster

    const totalLoadTime = (baseLoadTime + sizeFactor + dependencyFactor) * complexityFactor;

    // Simulate loading with progress
    await new Promise(resolve => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          clearInterval(interval);
          resolve(void 0);
        }
      }, totalLoadTime / 5);
    });

    // Simulate dependency loading
    for (const dependency of moduleInfo.dependencies) {
      if (!this.loadedModules.has(dependency)) {
        await this.loadModule(dependency);
      }
    }
  }

  private initializeModuleRegistry(): void {
    // Register core MIFF modules
    const coreModules: ModuleInfo[] = [
      {
        name: 'HealthSystemPure',
        path: './HealthSystemPure/index.ts',
        dependencies: [],
        priority: 'critical',
        preload: true,
        lazy: false,
        size: 15000,
        loadTime: 0
      },
      {
        name: 'CombatPure',
        path: './CombatPure/index.ts',
        dependencies: ['HealthSystemPure'],
        priority: 'critical',
        preload: true,
        lazy: false,
        size: 25000,
        loadTime: 0
      },
      {
        name: 'TeamsPure',
        path: './TeamsPure/index.ts',
        dependencies: [],
        priority: 'high',
        preload: true,
        lazy: false,
        size: 18000,
        loadTime: 0
      },
      {
        name: 'EffectsPure',
        path: './EffectsPure/index.ts',
        dependencies: ['HealthSystemPure'],
        priority: 'high',
        preload: true,
        lazy: false,
        size: 22000,
        loadTime: 0
      },
      {
        name: 'AudioPure',
        path: './AudioPure/index.ts',
        dependencies: [],
        priority: 'medium',
        preload: false,
        lazy: true,
        size: 12000,
        loadTime: 0
      },
      {
        name: 'ExportAndroidPure',
        path: './ExportAndroidPure/index.ts',
        dependencies: [],
        priority: 'low',
        preload: false,
        lazy: true,
        size: 8000,
        loadTime: 0
      }
    ];

    coreModules.forEach(module => this.registerModule(module));
  }

  private initializeLoadingStrategies(): void {
    this.loadingStrategies = [
      {
        name: 'critical-first',
        modules: ['HealthSystemPure', 'CombatPure'],
        trigger: 'immediate',
        priority: 10,
        preload: true
      },
      {
        name: 'gameplay-features',
        modules: ['TeamsPure', 'EffectsPure', 'ItemsPure'],
        trigger: 'interaction',
        priority: 8,
        preload: false
      },
      {
        name: 'system-utilities',
        modules: ['AudioPure', 'InputSystemPure', 'DebugOverlayPure'],
        trigger: 'idle',
        priority: 5,
        preload: false
      },
      {
        name: 'export-tools',
        modules: ['ExportAndroidPure', 'ExportWebPure', 'ConvertToUnityPure'],
        trigger: 'manual',
        priority: 3,
        preload: false
      }
    ];
  }

  private setupIntersectionObserver(): void {
    if (typeof window !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const moduleName = entry.target.getAttribute('data-module');
              if (moduleName && !this.loadedModules.has(moduleName)) {
                this.loadModule(moduleName);
              }
            }
          });
        },
        { threshold: 0.1 }
      );
    }
  }

  private setupIdleLoading(): void {
    if (typeof window !== 'undefined') {
      this.idleCallbackId = requestIdleCallback(() => {
        this.preloadModules('system-utilities');
      });
    }
  }

  private calculateAverageLoadTime(): number {
    const modules = Array.from(this.moduleRegistry.values());
    const loadedModules = modules.filter(m => m.loadTime > 0);

    if (loadedModules.length === 0) return 0;

    return loadedModules.reduce((sum, m) => sum + m.loadTime, 0) / loadedModules.length;
  }

  private log(message: string, level: 'info' | 'debug' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    console.log(`[LAZYLOADER:${level.toUpperCase()}] ${timestamp} - ${message}`);
  }

  /**
   * Shutdown lazy loader
   */
  shutdown(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    if (this.idleCallbackId) {
      cancelIdleCallback(this.idleCallbackId);
    }

    this.loadingPromises.clear();
    this.log('Lazy loader shutdown complete');
  }
}