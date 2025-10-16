/**
 * MIFF Asset Pipeline
 *
 * Advanced asset processing, optimization, and management system
 */

export interface AssetConfig {
  sourcePath: string;
  outputPath: string;
  assetTypes: string[];
  optimizationLevel: 'none' | 'basic' | 'medium' | 'high' | 'ultra';
  compressionEnabled: boolean;
  cachingEnabled: boolean;
  parallelProcessing: boolean;
  maxConcurrentTasks: number;
  enablePreprocessing: boolean;
  enablePostprocessing: boolean;
  qualitySettings: Record<string, number>;
}

export interface AssetInfo {
  id: string;
  path: string;
  type: string;
  size: number;
  originalSize: number;
  compressedSize: number;
  loadTime: number;
  dependencies: string[];
  metadata: Record<string, any>;
  processed: boolean;
  cached: boolean;
}

export interface PipelineStats {
  totalAssets: number;
  processedAssets: number;
  failedAssets: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
  totalSizeReduction: number;
  compressionRatio: number;
  cacheHitRate: number;
  throughput: number; // assets per second
}

export interface ProcessingTask {
  assetId: string;
  type: 'load' | 'process' | 'compress' | 'optimize' | 'cache';
  priority: number;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: number;
  endTime?: number;
  error?: string;
}

export class AssetPipeline {
  private config: AssetConfig;
  private assetRegistry: Map<string, AssetInfo> = new Map();
  private processingQueue: ProcessingTask[] = [];
  private activeTasks: Set<string> = new Set();
  private completedTasks: Set<string> = new Set();
  private cacheManager: Map<string, any> = new Map();
  private stats: PipelineStats;
  private workers: Worker[] = [];
  private processingTimer?: NodeJS.Timeout;

  constructor(config: AssetConfig) {
    this.config = {
      ...config,
      optimizationLevel: config.optimizationLevel ?? 'high',
      compressionEnabled: config.compressionEnabled ?? true,
      cachingEnabled: config.cachingEnabled ?? true,
      parallelProcessing: config.parallelProcessing ?? true,
      maxConcurrentTasks: config.maxConcurrentTasks ?? 4,
      enablePreprocessing: config.enablePreprocessing ?? true,
      enablePostprocessing: config.enablePostprocessing ?? true,
      qualitySettings: config.qualitySettings ?? {},
    };

    this.stats = this.initializeStats();
    this.initializeWorkers();
    this.startProcessingTimer();
  }

  /**
   * Process all assets in the pipeline
   */
  async processAllAssets(): Promise<PipelineStats> {
    this.log('🚀 Starting asset pipeline processing...');

    const startTime = performance.now();

    try {
      // Phase 1: Discover and analyze assets
      await this.discoverAssets();

      // Phase 2: Build dependency graph
      this.buildDependencyGraph();

      // Phase 3: Create processing tasks
      this.createProcessingTasks();

      // Phase 4: Execute processing pipeline
      await this.executePipeline();

      // Phase 5: Finalize and report
      const endTime = performance.now();
      this.stats.totalProcessingTime = endTime - startTime;
      this.stats.averageProcessingTime = this.stats.totalProcessingTime / Math.max(1, this.stats.processedAssets);
      this.stats.throughput = this.stats.processedAssets / (this.stats.totalProcessingTime / 1000);

      this.log(`✅ Asset pipeline complete: ${this.stats.processedAssets}/${this.stats.totalAssets} assets processed`);
      this.log(`📊 Performance: ${this.stats.throughput.toFixed(2)} assets/sec, ${(this.stats.compressionRatio * 100).toFixed(1)}% compression`);

      return this.stats;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.log(`❌ Asset pipeline failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
      throw error;
    }
  }

  /**
   * Process single asset
   */
  async processAsset(assetId: string): Promise<AssetInfo | null> {
    const asset = this.assetRegistry.get(assetId);
    if (!asset) {
      this.log(`Asset not found: ${assetId}`, 'error');
      return null;
    }

    try {
      this.log(`Processing asset: ${assetId}`);

      // Create processing task
      const task = this.createTask(assetId, 'process');
      this.processingQueue.push(task);

      // Process the asset
      const result = await this.executeTask(task);

      if (result.status === 'completed') {
        asset.processed = true;
        this.stats.processedAssets++;
        this.log(`✅ Asset processed: ${assetId}`);
        return asset;
      } else {
        asset.processed = false;
        this.stats.failedAssets++;
        this.log(`❌ Asset processing failed: ${assetId} - ${result.error}`, 'error');
        return null;
      }

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.log(`Asset processing error: ${assetId} - ${error instanceof Error ? error.message : String(error)}`, 'error');
      return null;
    }
  }

  /**
   * Load asset from cache or source
   */
  async loadAsset(assetId: string): Promise<any> {
    // Check cache first
    if (this.config.cachingEnabled) {
      const cached = this.cacheManager.get(assetId);
      if (cached) {
        this.log(`Cache hit for asset: ${assetId}`);
        return cached;
      }
    }

    // Load from source
    const asset = this.assetRegistry.get(assetId);
    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`);
    }

    const data = await this.loadAssetData(asset);
    asset.loadTime = performance.now() - (asset as any).loadStartTime;

    // Cache the loaded asset
    if (this.config.cachingEnabled) {
      this.cacheManager.set(assetId, data);
    }

    return data;
  }

  /**
   * Optimize asset based on type and settings
   */
  async optimizeAsset(assetId: string, assetData: any): Promise<any> {
    const asset = this.assetRegistry.get(assetId);
    if (!asset) return assetData;

    switch (asset.type) {
      case 'image':
        return this.optimizeImage(asset, assetData);
      case 'audio':
        return this.optimizeAudio(asset, assetData);
      case 'video':
        return this.optimizeVideo(asset, assetData);
      case 'model':
        return this.optimizeModel(asset, assetData);
      case 'texture':
        return this.optimizeTexture(asset, assetData);
      case 'shader':
        return this.optimizeShader(asset, assetData);
      default:
        return this.optimizeGeneric(asset, assetData);
    }
  }

  /**
   * Compress asset data
   */
  async compressAsset(assetId: string, assetData: any): Promise<any> {
    if (!this.config.compressionEnabled) {
      return assetData;
    }

    const asset = this.assetRegistry.get(assetId);
    if (!asset) return assetData;

    const originalSize = this.estimateSize(assetData);
    const compressed = await this.compressData(assetData, asset.type);

    const compressedSize = this.estimateSize(compressed);
    asset.compressedSize = compressedSize;
    asset.originalSize = originalSize;

    this.log(`Compressed ${assetId}: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB`);

    return compressed;
  }

  /**
   * Get asset information
   */
  getAssetInfo(assetId: string): AssetInfo | null {
    return this.assetRegistry.get(assetId) || null;
  }

  /**
   * Get all assets of specific type
   */
  getAssetsByType(type: string): AssetInfo[] {
    return Array.from(this.assetRegistry.values()).filter((asset: any) => asset.type === type);
  }

  /**
   * Get pipeline statistics
   */
  getStats(): PipelineStats {
    return { ...this.stats };
  }

  /**
   * Clear asset cache
   */
  clearCache(): void {
    this.cacheManager.clear();
    this.log('Asset cache cleared');
  }

  /**
   * Preload critical assets
   */
  async preloadAssets(assetIds: string[]): Promise<void> {
    this.log(`Preloading ${assetIds.length} critical assets...`);

    for (const assetId of assetIds) {
      try {
        await this.loadAsset(assetId);
        this.log(`Preloaded asset: ${assetId}`);
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        this.log(`Preload failed for ${assetId}: ${error instanceof Error ? error.message : String(error)}`, 'debug');
      }
    }
  }

  private async discoverAssets(): Promise<void> {
    this.log('🔍 Discovering assets...');

    const assets = await this.scanAssetDirectory(this.config.sourcePath);
    let discovered = 0;

    for (const asset of assets) {
      const assetInfo: AssetInfo = {
        id: asset.id,
        path: asset.path,
        type: asset.type,
        size: asset.size,
        originalSize: asset.size,
        compressedSize: 0,
        loadTime: 0,
        dependencies: asset.dependencies || [],
        metadata: asset.metadata || {},
        processed: false,
        cached: false
      };

      this.assetRegistry.set(asset.id, assetInfo);
      discovered++;
    }

    this.stats.totalAssets = discovered;
    this.log(`Discovered ${discovered} assets`);
  }

  private buildDependencyGraph(): void {
    this.log('📊 Building asset dependency graph...');

    for (const [assetId, asset] of this.assetRegistry) {
      for (const dependencyId of asset.dependencies) {
        if (!this.assetRegistry.has(dependencyId)) {
          this.log(`Missing dependency: ${assetId} -> ${dependencyId}`, 'warn');
        }
      }
    }
  }

  private createProcessingTasks(): void {
    this.log('📋 Creating processing tasks...');

    for (const [assetId, asset] of this.assetRegistry) {
      const tasks: ProcessingTask[] = [
        {
          assetId,
          type: 'load',
          priority: this.calculateTaskPriority(asset),
          dependencies: asset.dependencies,
          status: 'pending',
          progress: 0
        },
        {
          assetId,
          type: 'process',
          priority: this.calculateTaskPriority(asset),
          dependencies: [assetId], // Depends on load
          status: 'pending',
          progress: 0
        }
      ];

      if (this.config.compressionEnabled) {
        tasks.push({
          assetId,
          type: 'compress',
          priority: this.calculateTaskPriority(asset),
          dependencies: [assetId], // Depends on process
          status: 'pending',
          progress: 0
        });
      }

      tasks.push({
        assetId,
        type: 'cache',
        priority: this.calculateTaskPriority(asset),
        dependencies: [assetId], // Depends on compress or process
        status: 'pending',
        progress: 0
      });

      this.processingQueue.push(...tasks);
    }

    // Sort by priority and dependencies
    this.processingQueue.sort((a: any, b: any) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.dependencies.length - b.dependencies.length; // Fewer dependencies first
    });

    this.log(`Created ${this.processingQueue.length} processing tasks`);
  }

  private async executePipeline(): Promise<void> {
    this.log('⚙️ Executing asset processing pipeline...');

    const maxConcurrent = this.config.parallelProcessing ? this.config.maxConcurrentTasks : 1;

    while (this.processingQueue.length > 0 || this.activeTasks.size > 0) {
      // Start new tasks if capacity available
      while (this.activeTasks.size < maxConcurrent && this.processingQueue.length > 0) {
        const task = this.processingQueue.shift();
        if (task && this.canExecuteTask(task)) {
          this.executeTask(task);
        }
      }

      // Wait for active tasks to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.log('Pipeline execution complete');
  }

  private canExecuteTask(task: ProcessingTask): boolean {
    // Check if all dependencies are completed
    return task.dependencies.every(depId => {
      const depTask = this.processingQueue.find(t => t.assetId === depId && t.type === 'process');
      return !depTask || this.completedTasks.has(`${depId}-process`);
    });
  }

  private async executeTask(task: ProcessingTask): Promise<ProcessingTask> {
    this.activeTasks.add(task.assetId);
    task.status = 'running';
    task.startTime = performance.now();

    try {
      switch (task.type) {
        case 'load':
          await this.loadAsset(task.assetId);
          break;
        case 'process':
          const asset = this.assetRegistry.get(task.assetId);
          if (asset) {
            const data = await this.loadAsset(task.assetId);
            const processed = await this.optimizeAsset(task.assetId, data);
            this.cacheManager.set(`${task.assetId}-processed`, processed);
          }
          break;
        case 'compress':
          const processedData = this.cacheManager.get(`${task.assetId}-processed`);
          if (processedData) {
            const compressed = await this.compressAsset(task.assetId, processedData);
            this.cacheManager.set(`${task.assetId}-compressed`, compressed);
          }
          break;
        case 'cache':
          const compressedData = this.cacheManager.get(`${task.assetId}-compressed`) ||
                                this.cacheManager.get(`${task.assetId}-processed`);
          if (compressedData) {
            this.cacheManager.set(task.assetId, compressedData);
            const asset = this.assetRegistry.get(task.assetId);
            if (asset) {
              asset.cached = true;
            }
          }
          break;
      }

      task.status = 'completed';
      task.progress = 100;
      task.endTime = performance.now();
      this.completedTasks.add(`${task.assetId}-${task.type}`);

      this.log(`✅ Task completed: ${task.assetId} (${task.type})`);

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : String(error);
      this.log(`❌ Task failed: ${task.assetId} (${task.type}) - ${error instanceof Error ? error.message : String(error)}`, 'error');
    }

    this.activeTasks.delete(task.assetId);
    return task;
  }

  private createTask(assetId: string, type: ProcessingTask['type']): ProcessingTask {
    const asset = this.assetRegistry.get(assetId);
    return {
      assetId,
      type,
      priority: this.calculateTaskPriority(asset!),
      dependencies: asset?.dependencies || [],
      status: 'pending',
      progress: 0
    };
  }

  private calculateTaskPriority(asset: AssetInfo): number {
    // Base priority
    let priority = 5;

    // Type-based priority
    switch (asset.type) {
      case 'shader': priority += 3; break;
      case 'texture': priority += 2; break;
      case 'model': priority += 1; break;
      case 'audio': priority += 1; break;
      case 'image': priority += 0; break;
      default: priority += 0; break;
    }

    // Size-based priority (larger assets get higher priority)
    const sizeBonus = Math.min(3, Math.floor(asset.size / 1000000)); // 1MB chunks
    priority += sizeBonus;

    // Dependency count (assets with more dependencies get higher priority)
    priority += Math.min(2, asset.dependencies.length);

    return Math.min(10, priority);
  }

  private async scanAssetDirectory(path: string): Promise<any[]> {
    // Scan directory for assets
    // This is a simplified implementation
    const assets = [
      { id: 'player-texture', path: 'textures/player.png', type: 'texture', size: 2048000, dependencies: [], metadata: {} },
      { id: 'background-music', path: 'audio/background.mp3', type: 'audio', size: 5120000, dependencies: [], metadata: {} },
      { id: 'player-model', path: 'models/player.glb', type: 'model', size: 1536000, dependencies: [], metadata: {} },
      { id: 'ui-atlas', path: 'textures/ui.png', type: 'texture', size: 1048000, dependencies: [], metadata: {} },
      { id: 'sound-effect', path: 'audio/effect.wav', type: 'audio', size: 256000, dependencies: [], metadata: {} }
    ];

    return assets;
  }

  private async loadAssetData(asset: AssetInfo): Promise<any> {
    // Simulate asset loading
    (asset as any).loadStartTime = performance.now();

    // Simulate loading time based on asset size
    const loadTime = asset.size / 1000000; // 1MB per second
    await new Promise(resolve => setTimeout(resolve, loadTime));

    // Return mock asset data
    return {
      id: asset.id,
      type: asset.type,
      data: `Mock data for ${asset.id}`,
      size: asset.size
    };
  }

  private async optimizeImage(asset: AssetInfo, data: any): Promise<any> {
    // Image optimization logic
    const quality = this.config.qualitySettings.image || 85;
    const optimizedSize = Math.floor(asset.size * (quality / 100));

    this.log(`Optimizing image ${asset.id}: ${asset.size} → ${optimizedSize} bytes`);

    return {
      ...data,
      optimized: true,
      quality,
      size: optimizedSize
    };
  }

  private async optimizeAudio(asset: AssetInfo, data: any): Promise<any> {
    // Audio optimization logic
    const bitrate = this.config.qualitySettings.audio || 128;
    const optimizedSize = Math.floor(asset.size * (bitrate / 320)); // Assuming original is 320kbps

    this.log(`Optimizing audio ${asset.id}: ${asset.size} → ${optimizedSize} bytes`);

    return {
      ...data,
      optimized: true,
      bitrate,
      size: optimizedSize
    };
  }

  private async optimizeVideo(asset: AssetInfo, data: any): Promise<any> {
    // Video optimization logic
    const bitrate = this.config.qualitySettings.video || 1000;
    const optimizedSize = Math.floor(asset.size * (bitrate / 2000));

    return {
      ...data,
      optimized: true,
      bitrate,
      size: optimizedSize
    };
  }

  private async optimizeModel(asset: AssetInfo, data: any): Promise<any> {
    // 3D model optimization logic
    const compression = this.config.qualitySettings.model || 0.8;
    const optimizedSize = Math.floor(asset.size * compression);

    return {
      ...data,
      optimized: true,
      compression,
      size: optimizedSize
    };
  }

  private async optimizeTexture(asset: AssetInfo, data: any): Promise<any> {
    // Texture optimization logic
    const format = this.config.qualitySettings.texture || 'compressed';
    const optimizedSize = Math.floor(asset.size * 0.6); // Assume 40% reduction

    return {
      ...data,
      optimized: true,
      format,
      size: optimizedSize
    };
  }

  private async optimizeShader(asset: AssetInfo, data: any): Promise<any> {
    // Shader optimization logic
    return {
      ...data,
      optimized: true,
      minified: true,
      size: asset.size
    };
  }

  private async optimizeGeneric(asset: AssetInfo, data: any): Promise<any> {
    // Generic optimization
    return {
      ...data,
      optimized: true,
      size: asset.size
    };
  }

  private async compressData(data: any, type: string): Promise<any> {
    // Compression logic based on asset type
    const compressionRatio = type === 'image' ? 0.7 :
                            type === 'audio' ? 0.8 :
                            type === 'video' ? 0.75 :
                            type === 'model' ? 0.6 : 0.9;

    const compressedSize = Math.floor(this.estimateSize(data) * compressionRatio);

    return {
      ...data,
      compressed: true,
      compressionRatio,
      size: compressedSize
    };
  }

  private estimateSize(data: any): number {
    if (typeof data === 'string') return data.length * 2;
    if (typeof data === 'object' && data.size) return data.size;
    if (typeof data === 'object') {
      return JSON.stringify(data).length * 2;
    }
    return 1024; // Default estimate
  }

  private initializeWorkers(): void {
    if (this.config.parallelProcessing) {
      // Initialize worker threads for parallel processing
      for (let i = 0; i < this.config.maxConcurrentTasks; i++) {
        this.workers.push({
          id: i,
          busy: false,
          task: null
        } as Worker);
      }
    }
  }

  private startProcessingTimer(): void {
    this.processingTimer = setInterval(() => {
      this.updateProcessingStats();
    }, 1000);
  }

  private updateProcessingStats(): void {
    const completedTasks = this.processingQueue.filter((t: any) => t.status === 'completed').length +
                          Array.from(this.completedTasks).length;
    const failedTasks = this.processingQueue.filter((t: any) => t.status === 'failed').length;

    this.stats.processedAssets = completedTasks;
    this.stats.failedAssets = failedTasks;

    // Calculate compression ratio
    let totalOriginal = 0;
    let totalCompressed = 0;

    for (const asset of this.assetRegistry.values()) {
      totalOriginal += asset.originalSize;
      totalCompressed += asset.compressedSize || asset.originalSize;
    }

    this.stats.compressionRatio = totalOriginal > 0 ? totalCompressed / totalOriginal : 1;
    this.stats.totalSizeReduction = totalOriginal - totalCompressed;
  }

  private initializeStats(): PipelineStats {
    return {
      totalAssets: 0,
      processedAssets: 0,
      failedAssets: 0,
      totalProcessingTime: 0,
      averageProcessingTime: 0,
      totalSizeReduction: 0,
      compressionRatio: 1,
      cacheHitRate: 0,
      throughput: 0
    };
  }

  private log(message: string, level: 'info' | 'debug' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    console.log(`[ASSETPIPE:${level.toUpperCase()}] ${timestamp} - ${message}`);
  }

  /**
   * Shutdown asset pipeline
   */
  shutdown(): void {
    this.log('🛑 Shutting down asset pipeline...');

    if (this.processingTimer) {
      clearInterval(this.processingTimer);
    }

    // Wait for active tasks to complete
    const shutdownPromise = new Promise(resolve => {
      const checkComplete = () => {
        if (this.activeTasks.size === 0) {
          resolve(void 0);
        } else {
          setTimeout(checkComplete, 100);
        }
      };
      checkComplete();
    });

    shutdownPromise.then(() => {
      this.log('Asset pipeline shutdown complete');
    });
  }
}

interface Worker {
  id: number;
  busy: boolean;
  task: ProcessingTask | null;
}