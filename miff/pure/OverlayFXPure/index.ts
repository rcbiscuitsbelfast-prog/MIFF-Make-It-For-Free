/**
 * OverlayFXPure - Stateless Visual Effects System
 * 
 * Provides stateless visual effects for overlays including blur, vignette, color shift,
 * and other post-processing effects that can be applied to game scenes.
 * 
 * @module OverlayFXPure
 * @version 1.0.0
 * @license MIT
 */

export enum OverlayEffectType {
  BLUR = 'blur',
  VIGNETTE = 'vignette',
  COLOR_SHIFT = 'color_shift',
  BRIGHTNESS = 'brightness',
  CONTRAST = 'contrast',
  SATURATION = 'saturation',
  GRAIN = 'grain',
  SCAN_LINES = 'scan_lines',
  CHROMATIC_ABERRATION = 'chromatic_aberration',
  DISTORTION = 'distortion'
}

export interface OverlayEffectConfig {
  type: OverlayEffectType;
  intensity: number; // 0-1
  duration?: number; // milliseconds, -1 for permanent
  easing?: 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out';
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft_light';
  color?: string; // hex color for color-based effects
  radius?: number; // for blur, vignette effects
  angle?: number; // for directional effects
}

export interface OverlayLayer {
  id: string;
  name: string;
  effects: OverlayEffectConfig[];
  enabled: boolean;
  priority: number; // higher number = rendered on top
  opacity: number; // 0-1
}

export class OverlayFXManager {
  private layers: Map<string, OverlayLayer> = new Map();
  private activeEffects: Map<string, OverlayEffectConfig> = new Map();

  /**
   * Create a new overlay layer
   */
  createLayer(id: string, name: string, priority: number = 0): OverlayLayer {
    const layer: OverlayLayer = {
      id,
      name,
      effects: [],
      enabled: true,
      priority,
      opacity: 1.0
    };
    
    this.layers.set(id, layer);
    return layer;
  }

  /**
   * Add an effect to a layer
   */
  addEffect(layerId: string, effect: OverlayEffectConfig): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    layer.effects.push(effect);
    this.activeEffects.set(`${layerId}_${effect.type}`, effect);
    return true;
  }

  /**
   * Remove an effect from a layer
   */
  removeEffect(layerId: string, effectType: OverlayEffectType): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    layer.effects = layer.effects.filter(e => e.type !== effectType);
    this.activeEffects.delete(`${layerId}_${effectType}`);
    return true;
  }

  /**
   * Enable/disable a layer
   */
  setLayerEnabled(layerId: string, enabled: boolean): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    layer.enabled = enabled;
    return true;
  }

  /**
   * Set layer opacity
   */
  setLayerOpacity(layerId: string, opacity: number): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    layer.opacity = Math.max(0, Math.min(1, opacity));
    return true;
  }

  /**
   * Get all active effects for rendering
   */
  getActiveEffects(): OverlayEffectConfig[] {
    const effects: OverlayEffectConfig[] = [];
    
    for (const layer of this.layers.values()) {
      if (layer.enabled && layer.opacity > 0) {
        for (const effect of layer.effects) {
          effects.push({
            ...effect,
            intensity: effect.intensity * layer.opacity
          });
        }
      }
    }
    
    return effects.sort((a, b) => {
      const layerA = Array.from(this.layers.values()).find(l => 
        l.effects.some(e => e === a)
      );
      const layerB = Array.from(this.layers.values()).find(l => 
        l.effects.some(e => e === b)
      );
      return (layerB?.priority || 0) - (layerA?.priority || 0);
    });
  }

  /**
   * Apply scan mode effects (wireframe, highlight, etc.)
   */
  applyScanMode(): void {
    this.createLayer('scan_mode', 'Scan Mode Effects', 10);
    this.addEffect('scan_mode', {
      type: OverlayEffectType.CHROMATIC_ABERRATION,
      intensity: 0.3,
      color: '#00ff00'
    });
    this.addEffect('scan_mode', {
      type: OverlayEffectType.SCAN_LINES,
      intensity: 0.5
    });
  }

  /**
   * Apply danger zone effects (red tint, distortion)
   */
  applyDangerZone(): void {
    this.createLayer('danger_zone', 'Danger Zone Effects', 15);
    this.addEffect('danger_zone', {
      type: OverlayEffectType.COLOR_SHIFT,
      intensity: 0.4,
      color: '#ff0000'
    });
    this.addEffect('danger_zone', {
      type: OverlayEffectType.DISTORTION,
      intensity: 0.2
    });
  }

  /**
   * Apply NPC aura effects (soft glow, color tint)
   */
  applyNPCAura(npcType: string): void {
    const layerId = `npc_aura_${npcType}`;
    this.createLayer(layerId, `NPC Aura - ${npcType}`, 5);
    
    const auraColor = this.getNPCAuraColor(npcType);
    this.addEffect(layerId, {
      type: OverlayEffectType.VIGNETTE,
      intensity: 0.3,
      color: auraColor,
      radius: 0.8
    });
  }

  /**
   * Get aura color based on NPC type
   */
  private getNPCAuraColor(npcType: string): string {
    const colorMap: Record<string, string> = {
      'friendly': '#00ff00',
      'neutral': '#ffff00',
      'hostile': '#ff0000',
      'quest': '#00ffff',
      'merchant': '#ff8000',
      'guard': '#0080ff'
    };
    
    return colorMap[npcType] || '#ffffff';
  }

  /**
   * Clear all effects
   */
  clearAllEffects(): void {
    this.layers.clear();
    this.activeEffects.clear();
  }

  /**
   * Get layer by ID
   */
  getLayer(layerId: string): OverlayLayer | undefined {
    return this.layers.get(layerId);
  }

  /**
   * Get all layers
   */
  getAllLayers(): OverlayLayer[] {
    return Array.from(this.layers.values());
  }

  /**
   * Export layer configuration for serialization
   */
  exportConfiguration(): Record<string, any> {
    const config: Record<string, any> = {};
    
    for (const [id, layer] of this.layers) {
      config[id] = {
        name: layer.name,
        effects: layer.effects,
        enabled: layer.enabled,
        priority: layer.priority,
        opacity: layer.opacity
      };
    }
    
    return config;
  }

  /**
   * Import layer configuration from serialized data
   */
  importConfiguration(config: Record<string, any>): void {
    this.clearAllEffects();
    
    for (const [id, layerData] of Object.entries(config)) {
      const layer: OverlayLayer = {
        id,
        name: layerData.name,
        effects: layerData.effects || [],
        enabled: layerData.enabled !== false,
        priority: layerData.priority || 0,
        opacity: layerData.opacity || 1.0
      };
      
      this.layers.set(id, layer);
      
      // Rebuild active effects
      for (const effect of layer.effects) {
        this.activeEffects.set(`${id}_${effect.type}`, effect);
      }
    }
  }
}

// Export default instance
export const overlayFXManager = new OverlayFXManager();