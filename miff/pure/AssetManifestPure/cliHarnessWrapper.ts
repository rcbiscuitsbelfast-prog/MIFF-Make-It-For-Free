#!/usr/bin/env tsx
/**
 * CLI Harness Wrapper for AssetManifestPure
 * Handles --mode=action style arguments
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
// Import from index or create mock types
type AssetEntry = {
  id: string;
  type: string;
  path: string;
  size: number;
  format: string;
  compressed?: boolean;
};

class AssetManifest {
  private assets: Map<string, AssetEntry> = new Map();
  
  addAsset(asset: AssetEntry) {
    this.assets.set(asset.id, asset);
  }
  
  getAllAssets(...args: any[]) {
    return Array.from(this.assets.values());
  }
  
  getAsset(id: string) {
    return this.assets.get(id);
  }
  
  getTotalSize(...args: any[]) {
    return Array.from(this.assets.values()).reduce((sum, a) => sum + a.size, 0);
  }
  
  exportManifest(...args: any[]) {
    return { assets: this.getAllAssets(), totalSize: this.getTotalSize() };
  }
}

const { mode, params } = parseKeyValueArgs(process.argv);
const manifest = new AssetManifest();

try {
  switch (mode) {
    case 'prepareAssets': {
      const { includeTextures, includeAudio, includeModels, compression } = params;
      
      const assets: AssetEntry[] = [];
      
      if (includeTextures !== false) {
        assets.push({
          id: 'texture_001',
          type: 'texture',
          path: 'assets/textures/player.png',
          size: 2048 * 1024,
          format: 'png',
          compressed: compression === 'high'
        });
      }
      
      if (includeAudio !== false) {
        assets.push({
          id: 'audio_001',
          type: 'audio',
          path: 'assets/audio/music.mp3',
          size: 5 * 1024 * 1024,
          format: 'mp3',
          compressed: compression === 'high'
        });
      }
      
      if (includeModels !== false) {
        assets.push({
          id: 'model_001',
          type: 'model',
          path: 'assets/models/character.glb',
          size: 10 * 1024 * 1024,
          format: 'glb',
          compressed: compression === 'high'
        });
      }
      
      assets.forEach(asset => manifest.addAsset(asset));
      
      handleSuccess({
        assets,
        count: assets.length,
        totalSize: assets.reduce((sum, a) => sum + a.size, 0),
        compression: compression || 'none'
      }, 'prepareAssets');
      break;
    }

    case 'listAssets': {
      const assets = manifest.getAllAssets();
      handleSuccess({
        assets,
        count: assets.length,
        totalSize: manifest.getTotalSize()
      }, 'listAssets');
      break;
    }

    case 'getAsset': {
      const { assetId } = params;
      const asset = manifest.getAsset(assetId);
      if (!asset) {
        throw new Error(`Asset not found: ${assetId}`);
      }
      handleSuccess({ asset }, 'getAsset');
      break;
    }

    case 'export': {
      const manifestData = manifest.exportManifest();
      handleSuccess({
        manifest: manifestData,
        exported: true
      }, 'export');
      break;
    }

    default:
      throw new Error(`Unknown operation: ${mode}. Available: prepareAssets, listAssets, getAsset, export`);
  }
} catch (error) {
  handleError(error);
}
