/**
 * PixelAnimPure Manager
 * 
 * Manages pixel animations, sprite sheets, and animation sequences with
 * comprehensive preset support and export capabilities.
 */

import { Animation, AnimationFrame, SpriteSheet, PixelAnimPure } from './index';

export interface AnimationSequence {
  id: string;
  name: string;
  animations: Animation[];
  transitions?: Record<string, string>; // from -> to animation mappings
  metadata?: {
    category?: string;
    tags?: string[];
    author?: string;
    created?: string;
  };
}

export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  category: 'character' | 'environment' | 'effect' | 'ui' | 'custom';
  frames: string[];
  fps: number;
  loop: boolean;
  metadata?: {
    frameWidth?: number;
    frameHeight?: number;
    style?: string;
    tags?: string[];
  };
}

export interface AnimationStats {
  totalAnimations: number;
  totalSequences: number;
  totalFrames: number;
  averageFramesPerAnimation: number;
  presetUsage: Record<string, number>;
  categoryDistribution: Record<string, number>;
}

export class PixelAnimManager {
  private animations: Map<string, Animation> = new Map();
  private sequences: Map<string, AnimationSequence> = new Map();
  private presets: Map<string, AnimationPreset> = new Map();

  constructor() {
    this.initializeDefaultPresets();
    this.createSampleAnimations();
  }

  private initializeDefaultPresets() {
    const defaultPresets: AnimationPreset[] = [
      {
        id: 'walk-basic',
        name: 'Basic Walk Cycle',
        description: 'Standard 4-frame walk animation',
        category: 'character',
        frames: ['walk1.png', 'walk2.png', 'walk3.png', 'walk4.png'],
        fps: 8,
        loop: true,
        metadata: { frameWidth: 32, frameHeight: 32, style: 'pixel', tags: ['movement', 'character'] }
      },
      {
        id: 'idle-basic',
        name: 'Basic Idle',
        description: 'Simple 2-frame idle animation',
        category: 'character',
        frames: ['idle1.png', 'idle2.png'],
        fps: 4,
        loop: true,
        metadata: { frameWidth: 32, frameHeight: 32, style: 'pixel', tags: ['idle', 'character'] }
      },
      {
        id: 'attack-sword',
        name: 'Sword Attack',
        description: '3-frame sword attack animation',
        category: 'character',
        frames: ['attack1.png', 'attack2.png', 'attack3.png'],
        fps: 12,
        loop: false,
        metadata: { frameWidth: 48, frameHeight: 48, style: 'pixel', tags: ['combat', 'weapon'] }
      },
      {
        id: 'flame-flicker',
        name: 'Flame Flicker',
        description: 'Flickering flame effect',
        category: 'effect',
        frames: ['flame1.png', 'flame2.png', 'flame3.png', 'flame2.png'],
        fps: 10,
        loop: true,
        metadata: { frameWidth: 16, frameHeight: 24, style: 'pixel', tags: ['fire', 'environment'] }
      },
      {
        id: 'water-flow',
        name: 'Water Flow',
        description: 'Flowing water animation',
        category: 'environment',
        frames: ['water1.png', 'water2.png', 'water3.png', 'water4.png'],
        fps: 6,
        loop: true,
        metadata: { frameWidth: 32, frameHeight: 32, style: 'pixel', tags: ['water', 'environment'] }
      }
    ];

    defaultPresets.forEach((preset: any) => {
      this.presets.set(preset.id, preset);
    });
  }

  private createSampleAnimations() {
    // Create sample animations from presets
    const sampleIds = ['walk-basic', 'idle-basic', 'flame-flicker'];
    sampleIds.forEach(presetId => {
      const preset = this.presets.get(presetId);
      if (preset) {
        const animation = this.createAnimationFromPreset(presetId);
        if (animation.ok && animation.animation) {
          this.animations.set(animation.animation.name, animation.animation);
        }
      }
    });

    // Create a sample sequence
    const walkAnim = this.animations.get('Basic Walk Cycle');
    const idleAnim = this.animations.get('Basic Idle');
    if (walkAnim && idleAnim) {
      this.createSequence('character-basic', 'Basic Character', [walkAnim, idleAnim], {
        'Basic Idle': 'Basic Walk Cycle',
        'Basic Walk Cycle': 'Basic Idle'
      });
    }
  }

  /**
   * Create animation from preset
   */
  createAnimationFromPreset(presetId: string): { ok: boolean; animation?: Animation; errors?: string[] } {
    try {
      const preset = this.presets.get(presetId);
      if (!preset) {
        return { ok: false, errors: [`Preset ${presetId} not found`] };
      }

      const animation = PixelAnimPure.createAnimation(preset.name, preset.frames, preset.fps, preset.loop);
      return { ok: true, animation };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Create custom animation
   */
  createAnimation(name: string, frames: string[], fps: number = 8, loop: boolean = true): { ok: boolean; animation?: Animation; errors?: string[] } {
    try {
      if (this.animations.has(name)) {
        return { ok: false, errors: [`Animation ${name} already exists`] };
      }

      if (frames.length === 0) {
        return { ok: false, errors: ['Animation must have at least one frame'] };
      }

      if (fps <= 0 || fps > 60) {
        return { ok: false, errors: ['FPS must be between 1 and 60'] };
      }

      const animation = PixelAnimPure.createAnimation(name, frames, fps, loop);
      this.animations.set(name, animation);

      return { ok: true, animation };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Get animation by name
   */
  getAnimation(name: string): { ok: boolean; animation?: Animation; errors?: string[] } {
    const animation = this.animations.get(name);
    if (!animation) {
      return { ok: false, errors: [`Animation ${name} not found`] };
    }
    return { ok: true, animation };
  }

  /**
   * List all animations
   */
  listAnimations(filter?: { category?: string; loop?: boolean }): { ok: boolean; animations: Animation[]; total: number } {
    let animations = Array.from(this.animations.values());

    if (filter?.loop !== undefined) {
      animations = animations.filter((a: any) => a.loop === filter.loop);
    }

    // Note: category filtering would require additional metadata in Animation interface
    // For now, we'll return all animations

    return { ok: true, animations, total: animations.length };
  }

  /**
   * Create animation sequence
   */
  createSequence(id: string, name: string, animations: Animation[], transitions?: Record<string, string>): { ok: boolean; sequence?: AnimationSequence; errors?: string[] } {
    try {
      if (this.sequences.has(id)) {
        return { ok: false, errors: [`Sequence ${id} already exists`] };
      }

      if (animations.length === 0) {
        return { ok: false, errors: ['Sequence must have at least one animation'] };
      }

      const sequence: AnimationSequence = {
        id,
        name,
        animations,
        transitions,
        metadata: {
          created: Date.now().toISOString(),
          category: 'custom'
        }
      };

      this.sequences.set(id, sequence);
      return { ok: true, sequence };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Get sequence by ID
   */
  getSequence(id: string): { ok: boolean; sequence?: AnimationSequence; errors?: string[] } {
    const sequence = this.sequences.get(id);
    if (!sequence) {
      return { ok: false, errors: [`Sequence ${id} not found`] };
    }
    return { ok: true, sequence };
  }

  /**
   * List all sequences
   */
  listSequences(): { ok: boolean; sequences: AnimationSequence[]; total: number } {
    const sequences = Array.from(this.sequences.values());
    return { ok: true, sequences, total: sequences.length };
  }

  /**
   * Create sprite sheet from animations
   */
  createSpriteSheet(animationNames: string[], frameWidth: number, frameHeight: number): { ok: boolean; spriteSheet?: SpriteSheet; errors?: string[] } {
    try {
      const animations: Animation[] = [];
      
      for (const name of animationNames) {
        const animation = this.animations.get(name);
        if (!animation) {
          return { ok: false, errors: [`Animation ${name} not found`] };
        }
        animations.push(animation);
      }

      const spriteSheet = PixelAnimPure.createSpriteSheet(animations, frameWidth, frameHeight);
      return { ok: true, spriteSheet };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Add custom preset
   */
  addPreset(preset: AnimationPreset): { ok: boolean; errors?: string[] } {
    try {
      if (this.presets.has(preset.id)) {
        return { ok: false, errors: [`Preset ${preset.id} already exists`] };
      }

      if (preset.frames.length === 0) {
        return { ok: false, errors: ['Preset must have at least one frame'] };
      }

      this.presets.set(preset.id, preset);
      return { ok: true };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * List all presets
   */
  listPresets(category?: string): { ok: boolean; presets: AnimationPreset[]; total: number } {
    let presets = Array.from(this.presets.values());
    
    if (category) {
      presets = presets.filter((p: any) => p.category === category);
    }

    return { ok: true, presets, total: presets.length };
  }

  /**
   * Simulate animation playback
   */
  simulate(animationName: string, duration: number = 5000): { ok: boolean; simulation?: any; errors?: string[] } {
    const animation = this.animations.get(animationName);
    if (!animation) {
      return { ok: false, errors: [`Animation ${animationName} not found`] };
    }

    const frameDuration = 1000 / animation.speed; // ms per frame
    const totalFrames = animation.frames.length;
    const animationDuration = totalFrames * frameDuration;
    
    const events: any[] = [];
    let currentTime = 0;
    let cycles = 0;

    while (currentTime < duration) {
      for (let i = 0; i < totalFrames && currentTime < duration; i++) {
        events.push({
          timestamp: currentTime,
          frame: i,
          layer: animation.frames[i!].layer,
          cycle: cycles,
          progress: currentTime / duration
        });
        currentTime += frameDuration;
      }
      
      cycles++;
      
      if (!animation.loop) {
        break;
      }
    }

    return {
      ok: true,
      simulation: {
        animationName,
        duration,
        totalCycles: cycles,
        totalEvents: events.length,
        frameDuration,
        animationDuration,
        events: events.slice(0, 50) // Limit events for output
      }
    };
  }

  /**
   * Get animation statistics
   */
  getStats(): AnimationStats {
    const animations = Array.from(this.animations.values());
    const sequences = Array.from(this.sequences.values());
    
    const totalAnimations = animations.length;
    const totalSequences = sequences.length;
    const totalFrames = animations.reduce((sum, anim) => sum + anim.frames.length, 0);
    const averageFramesPerAnimation = totalAnimations > 0 ? totalFrames / totalAnimations : 0;

    // Preset usage (simplified - would need tracking in real implementation)
    const presetUsage: Record<string, number> = {};
    this.presets.forEach((preset, id) => {
      presetUsage[id!] = animations.filter((a: any) => a.name === preset.name).length;
    });

    // Category distribution
    const categoryDistribution: Record<string, number> = {};
    this.presets.forEach((preset: any) => {
      categoryDistribution[preset.category] = (categoryDistribution[preset.category] || 0) + 1;
    });

    return {
      totalAnimations,
      totalSequences,
      totalFrames,
      averageFramesPerAnimation,
      presetUsage,
      categoryDistribution
    };
  }

  /**
   * Export animation in various formats
   */
  exportAnimation(name: string, format: 'json' | 'manifest' | 'spritesheet' = 'json'): { ok: boolean; data?: any; errors?: string[] } {
    const animation = this.animations.get(name);
    if (!animation) {
      return { ok: false, errors: [`Animation ${name} not found`] };
    }

    switch (format) {
      case 'json':
        return { ok: true, data: animation };
      
      case 'manifest':
        return {
          ok: true,
          data: {
            schema: 'miff.pixel.animation.manifest.v1',
            animation: PixelAnimPure.exportAnimation(animation),
            metadata: {
              exportedAt: Date.now().toISOString(),
              frameCount: animation.frames.length,
              duration: (animation.frames.length * 1000) / animation.speed
            }
          }
        };
      
      case 'spritesheet':
        const spriteSheet = PixelAnimPure.createSpriteSheet([animation!], 32, 32);
        return {
          ok: true,
          data: {
            spriteSheet: PixelAnimPure.exportSpriteSheet(spriteSheet),
            animation: PixelAnimPure.exportAnimation(animation)
          }
        };
      
      default:
        return { ok: false, errors: [`Unknown export format: ${format}`] };
    }
  }

  /**
   * Delete animation
   */
  deleteAnimation(name: string): { ok: boolean; errors?: string[] } {
    if (!this.animations.has(name)) {
      return { ok: false, errors: [`Animation ${name} not found`] };
    }

    // Check if animation is used in any sequences
    const usedInSequences = Array.from(this.sequences.values()).filter((seq: any) =>
      seq.animations.some(anim => anim.name === name)
    );

    if (usedInSequences.length > 0) {
      const sequenceNames = usedInSequences.map((seq: any) => seq.name).join(', ');
      return { ok: false, errors: [`Animation ${name} is used in sequences: ${sequenceNames}`] };
    }

    this.animations.delete(name);
    return { ok: true };
  }

  /**
   * Delete sequence
   */
  deleteSequence(id: string): { ok: boolean; errors?: string[] } {
    if (!this.sequences.has(id)) {
      return { ok: false, errors: [`Sequence ${id} not found`] };
    }

    this.sequences.delete(id);
    return { ok: true };
  }

  /**
   * Validate animation
   */
  validateAnimation(animation: Animation): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!animation.name || animation.name.trim() === '') {
      errors.push('Animation name is required');
    }

    if (!animation.frames || animation.frames.length === 0) {
      errors.push('Animation must have at least one frame');
    }

    if (animation.speed <= 0 || animation.speed > 60) {
      errors.push('Animation speed must be between 1 and 60 FPS');
    }

    if (animation.frames && animation.frames.length > 0) {
      animation.frames.forEach((frame, index) => {
      if (!frame.layer || frame.layer.trim() === '') {
        errors.push(`Frame ${index}: layer is required`);
      }
      if (frame.duration <= 0) {
        errors.push(`Frame ${index}: duration must be positive`);
      }
      });
    }

    return { valid: errors.length === 0, errors };
  }
}