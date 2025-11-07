/**
 * AssetLoaderPure - Asset Loading and Management System
 * 
 * Handles loading, caching, and management of game assets including
 * sprites, audio, beat maps, and manifests. Mobile-optimized.
 * 
 * @module AssetLoaderPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Asset type enum
 */
export enum AssetType {
  IMAGE = 'image',
  AUDIO = 'audio',
  JSON = 'json',
  BEATMAP = 'beatmap'
}

/**
 * Asset status enum
 */
export enum AssetStatus {
  PENDING = 'pending',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
}

/**
 * Asset interface
 */
export interface IAsset {
  id: string;
  type: AssetType;
  path: string;
  status: AssetStatus;
  data: any;
  error?: string;
  loadTime?: number;
  size?: number;
}

/**
 * Asset manifest interface
 */
export interface IAssetManifest {
  schema: string;
  version: string;
  lastUpdated: string;
  sprites: Record<string, any>;
  audio: Record<string, any>;
  beatmaps: Record<string, any>;
  tiles?: Record<string, any>;
}

/**
 * Asset Loader Manager
 */
export class AssetLoaderManager {
  private assets: Map<string, IAsset> = new Map();
  private manifest: IAssetManifest | null = null;
  private basePath: string;
  private loadQueue: string[] = [];
  private isLoading: boolean = false;
  private maxConcurrent: number = 4;

  constructor(basePath: string = '/miff/assets/kpop_game/') {
    this.basePath = basePath;
  }

  /**
   * Load asset manifest
   */
  async loadManifest(manifestPath?: string): Promise<IAssetManifest> {
    const path = manifestPath || `${this.basePath}manifest.json`;
    
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to load manifest: ${response.statusText}`);
      
      this.manifest = await response.json();
//       return this.manifest;
    } catch (error) {
      throw new Error(`Manifest load error: ${error}`);
    }
  }

  /**
   * Load image asset
   */
  private loadImage(asset: IAsset): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const startTime = Date.now();
      
      img.onload = () => {
        asset.data = img;
        asset.status = AssetStatus.LOADED;
        asset.loadTime = Date.now() - startTime;
        resolve();
      };
      
      img.onerror = () => {
        asset.status = AssetStatus.ERROR;
        asset.error = 'Failed to load image';
        reject(new Error(asset.error));
      };
      
      img.src = asset.path;
    });
  }

  /**
   * Load audio asset
   */
  private loadAudio(asset: IAsset): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const startTime = Date.now();
      
      audio.addEventListener('canplaythrough', () => {
        asset.data = audio;
        asset.status = AssetStatus.LOADED;
        asset.loadTime = Date.now() - startTime;
        resolve();
      });
      
      audio.addEventListener('error', () => {
        asset.status = AssetStatus.ERROR;
        asset.error = 'Failed to load audio';
        reject(new Error(asset.error));
      });
      
      audio.src = asset.path;
      audio.load();
    });
  }

  /**
   * Load JSON asset
   */
  private async loadJSON(asset: IAsset): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(asset.path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      asset.data = await response.json();
      asset.status = AssetStatus.LOADED;
      asset.loadTime = Date.now() - startTime;
    } catch (error) {
      asset.status = AssetStatus.ERROR;
      asset.error = `Failed to load JSON: ${error}`;
      throw new Error(asset.error);
    }
  }

  /**
   * Queue asset for loading
   */
  queueAsset(id: string, type: AssetType, path: string): void {
    if (this.assets.has(id)) return;
    
    const asset: IAsset = {
      id,
      type,
      path: path.startsWith('http') ? path : `${this.basePath}${path}`,
      status: AssetStatus.PENDING,
      data: null
    };
    
    this.assets.set(id, asset);
    this.loadQueue.push(id);
  }

  /**
   * Load single asset
   */
  async loadAsset(id: string): Promise<IAsset> {
    const asset = this.assets.get(id);
    if (!asset) throw new Error(`Asset not found: ${id}`);
    if (asset.status === AssetStatus.LOADED) return asset;
    if (asset.status === AssetStatus.LOADING) {
      // Wait for it to finish
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (asset.status === AssetStatus.LOADED || asset.status === AssetStatus.ERROR) {
            clearInterval(checkInterval);
            resolve(asset);
          }
        }, 100);
      });
    }
    
    asset.status = AssetStatus.LOADING;
    
    try {
      switch (asset.type) {
        case AssetType.IMAGE:
          await this.loadImage(asset);
          break;
        case AssetType.AUDIO:
          await this.loadAudio(asset);
          break;
        case AssetType.JSON:
        case AssetType.BEATMAP:
          await this.loadJSON(asset);
          break;
      }
      return asset;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Load all queued assets
   */
  async loadAll(onProgress?: (loaded: number, total: number) => void): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;
    
    const total = this.loadQueue.length;
    let loaded = 0;
    
    while (this.loadQueue.length > 0) {
      const batch = this.loadQueue.splice(0, this.maxConcurrent);
      
      await Promise.allSettled(
        batch.map(async (id) => {
          try {
            await this.loadAsset(id);
            loaded++;
            if (onProgress) onProgress(loaded, total);
          } catch (error) {
            console.error(`Failed to load asset ${id}:`, error);
          }
        })
      );
    }
    
    this.isLoading = false;
  }

  /**
   * Get asset
   */
  getAsset(id: string): IAsset | undefined {
    return this.assets.get(id);
  }

  /**
   * Get asset data
   */
  getAssetData<T = any>(id: string): T | null {
    const asset = this.assets.get(id);
    return asset?.data || null;
  }

  /**
   * Check if asset is loaded
   */
  isAssetLoaded(id: string): boolean {
    const asset = this.assets.get(id);
    return asset?.status === AssetStatus.LOADED;
  }

  /**
   * Get loading progress
   */
  getLoadingProgress(): { loaded: number; total: number; percentage: number } {
    const total = this.assets.size;
    const loaded = Array.from(this.assets.values()).filter(a => a.status === AssetStatus.LOADED).length;
    const percentage = total > 0 ? (loaded / total) * 100 : 0;
    
    return { loaded, total, percentage };
  }

  /**
   * Get manifest
   */
  getManifest(): IAssetManifest | null {
    return this.manifest;
  }

  /**
   * Preload all assets from manifest
   */
  async preloadFromManifest(): Promise<void> {
    if (!this.manifest) {
      throw new Error('No manifest loaded');
    }
    
    // Queue sprites
    if (this.manifest.sprites) {
      Object.entries(this.manifest.sprites).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'object' && value.path) {
          this.queueAsset(`sprite_${key}`, AssetType.IMAGE, value.path);
        } else if (Array.isArray(value)) {
          value.forEach((item: any, index: number) => {
            if (item.path) {
              this.queueAsset(`sprite_${key}_${index}`, AssetType.IMAGE, item.path);
            }
          });
        }
      });
    }
    
    // Queue audio
    if (this.manifest.audio?.music) {
      Object.entries(this.manifest.audio.music).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'object' && value.path) {
          this.queueAsset(`music_${key}`, AssetType.AUDIO, value.path);
        } else if (typeof value === 'string') {
          this.queueAsset(`music_${key}`, AssetType.AUDIO, value);
        }
      });
    }
    
    if (this.manifest.audio?.sfx) {
      Object.entries(this.manifest.audio.sfx).forEach(([key, value]: [string, any]) => {
        this.queueAsset(`sfx_${key}`, AssetType.AUDIO, value as string);
      });
    }
    
    // Queue beatmaps
    if (this.manifest.beatmaps) {
      Object.entries(this.manifest.beatmaps).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'object' && value.path) {
          this.queueAsset(`beatmap_${key}`, AssetType.BEATMAP, value.path);
        }
      });
    }
    
    // Load all
    await this.loadAll();
  }
}

export default AssetLoaderManager;
