/**
 * AudioPure.ts
 * 
 * Inspired by Panda3D AudioManager and Crystal Space FMOD plugin.
 * Provides pure, remix-safe audio management for MIFF games with spatialization and event callbacks.
 * 
 * Attribution: Panda3D (BSD License) - AudioManager patterns and event callback model
 * Attribution: Crystal Space (LGPL) - FMOD plugin integration concepts
 */

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bufferSize: number;
  spatialAudio: boolean;
  maxSimultaneousSounds: number;
}

export interface AudioEvent {
  type: 'play' | 'stop' | 'pause' | 'volume' | 'spatial';
  soundId: string;
  timestamp: number;
  data?: any;
}

export interface SpatialAudioConfig {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  volume: number;
  pitch: number;
  dopplerEffect: boolean;
}

export interface SoundDefinition {
  id: string;
  name: string;
  category: string;
  volume: number;
  pitch: number;
  loop: boolean;
  spatial: boolean;
  data?: Uint8Array; // Audio data in PCM format
}

export type AudioCallback = (event: AudioEvent) => void;

export class AudioSystem {
  private config: AudioConfig;
  private sounds: Map<string, SoundDefinition>;
  private activeSounds: Map<string, any>; // Sound instances
  private callbacks: AudioCallback[];
  private listenerPosition: { x: number; y: number; z: number };
  private listenerVelocity: { x: number; y: number; z: number };
  private isHeadless: boolean;
  private instanceCounter: number; // Add counter for unique instance IDs

  constructor(config: AudioConfig, headless: boolean = false) {
    this.config = config;
    this.sounds = new Map();
    this.activeSounds = new Map();
    this.callbacks = [];
    this.listenerPosition = { x: 0, y: 0, z: 0 };
    this.listenerVelocity = { x: 0, y: 0, z: 0 };
    this.isHeadless = headless;
    this.instanceCounter = 0; // Initialize counter

    if (this.isHeadless) {
      console.log('[AudioPure] Running in headless mode - audio events will be logged only');
    }
  }

  addCallback(callback: AudioCallback): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: AudioCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  private emitEvent(event: AudioEvent): void {
    if (this.isHeadless) {
      console.log(`[AudioPure] ${event.type.toUpperCase()}: ${event.soundId}`, event.data || '');
    }

    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[AudioPure] Callback error:', error);
      }
    });
  }

  registerSound(definition: SoundDefinition): void {
    this.sounds.set(definition.id, definition);
    
    this.emitEvent({
      type: 'play',
      soundId: definition.id,
      timestamp: Date.now(),
      data: { action: 'registered', definition }
    });
  }

  unregisterSound(soundId: string): void {
    if (this.sounds.has(soundId)) {
      this.stopSound(soundId);
      this.sounds.delete(soundId);
      
      this.emitEvent({
        type: 'stop',
        soundId,
        timestamp: Date.now(),
        data: { action: 'unregistered' }
      });
    }
  }

  playSound(soundId: string, volume: number = 1.0, pitch: number = 1.0): string | null {
    const sound = this.sounds.get(soundId);
    if (!sound) {
      console.warn(`[AudioPure] Sound not found: ${soundId}`);
      return null;
    }

    // Check if we've reached the maximum simultaneous sounds
    if (this.activeSounds.size >= this.config.maxSimultaneousSounds) {
      console.warn(`[AudioPure] Maximum simultaneous sounds reached (${this.config.maxSimultaneousSounds})`);
      return null;
    }

    // Use counter for deterministic unique IDs in test environments
    const instanceId = `${soundId}_${Date.now()}_${this.instanceCounter++}`;
    
    const instance = {
      id: instanceId,
      soundId,
      volume: volume * sound.volume,
      pitch: pitch * sound.pitch,
      loop: sound.loop,
      spatial: sound.spatial,
      startTime: Date.now(),
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 }
    };

    this.activeSounds.set(instanceId, instance);

    this.emitEvent({
      type: 'play',
      soundId,
      timestamp: Date.now(),
      data: { instanceId, volume, pitch, loop: sound.loop }
    });

    return instanceId;
  }

  playSpatialSound(soundId: string, spatialConfig: SpatialAudioConfig): string | null {
    const instanceId = this.playSound(soundId, spatialConfig.volume, spatialConfig.pitch);
    
    if (instanceId) {
      const instance = this.activeSounds.get(instanceId);
      if (instance) {
        instance.position = spatialConfig.position;
        instance.velocity = spatialConfig.velocity;
        instance.spatial = true;

        this.emitEvent({
          type: 'spatial',
          soundId,
          timestamp: Date.now(),
          data: { instanceId, spatialConfig }
        });
      }
    }

    return instanceId;
  }

  stopSound(instanceId: string): boolean {
    const instance = this.activeSounds.get(instanceId);
    if (!instance) {
      return false;
    }

    this.activeSounds.delete(instanceId);

    this.emitEvent({
      type: 'stop',
      soundId: instance.soundId,
      timestamp: Date.now(),
      data: { instanceId, duration: Date.now() - instance.startTime }
    });

    return true;
  }

  stopAllSounds(): void {
    const instanceIds = Array.from(this.activeSounds.keys());
    instanceIds.forEach(instanceId => {
      this.stopSound(instanceId);
    });
  }

  pauseSound(instanceId: string): boolean {
    const instance = this.activeSounds.get(instanceId);
    if (!instance) {
      return false;
    }

    this.emitEvent({
      type: 'pause',
      soundId: instance.soundId,
      timestamp: Date.now(),
      data: { instanceId, paused: true }
    });

    return true;
  }

  setVolume(instanceId: string, volume: number): boolean {
    const instance = this.activeSounds.get(instanceId);
    if (!instance) {
      return false;
    }

    instance.volume = Math.max(0, Math.min(1, volume));

    this.emitEvent({
      type: 'volume',
      soundId: instance.soundId,
      timestamp: Date.now(),
      data: { instanceId, volume: instance.volume }
    });

    return true;
  }

  setListenerPosition(position: { x: number; y: number; z: number }): void {
    this.listenerPosition = position;
  }

  setListenerVelocity(velocity: { x: number; y: number; z: number }): void {
    this.listenerVelocity = velocity;
  }

  updateSpatialAudio(): void {
    if (!this.config.spatialAudio) return;

    for (const [instanceId, instance] of this.activeSounds) {
      if (instance.spatial) {
        const distance = this.calculateDistance(instance.position, this.listenerPosition);
        const volume = this.calculateSpatialVolume(distance, instance.volume);
        
        // Apply doppler effect if enabled
        if (this.config.spatialAudio) {
          const dopplerPitch = this.calculateDopplerEffect(instance.velocity, this.listenerVelocity);
          instance.pitch *= dopplerPitch;
        }

        this.setVolume(instanceId, volume);
      }
    }
  }

  private calculateDistance(pos1: { x: number; y: number; z: number }, pos2: { x: number; y: number; z: number }): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private calculateSpatialVolume(distance: number, baseVolume: number): number {
    // Simple inverse square law for volume falloff
    const maxDistance = 100; // Configurable
    const falloff = Math.max(0, 1 - (distance / maxDistance));
    return baseVolume * falloff * falloff;
  }

  private calculateDopplerEffect(sourceVelocity: { x: number; y: number; z: number }, listenerVelocity: { x: number; y: number; z: number }): number {
    // Simplified doppler effect calculation
    const relativeVelocity = {
      x: sourceVelocity.x - listenerVelocity.x,
      y: sourceVelocity.y - listenerVelocity.y,
      z: sourceVelocity.z - listenerVelocity.z
    };
    
    const speed = Math.sqrt(relativeVelocity.x * relativeVelocity.x + relativeVelocity.y * relativeVelocity.y + relativeVelocity.z * relativeVelocity.z);
    const speedOfSound = 343; // m/s
    
    return 1 + (speed / speedOfSound);
  }

  getActiveSounds(): any[] {
    return Array.from(this.activeSounds.values());
  }

  getSoundDefinition(soundId: string): SoundDefinition | undefined {
    return this.sounds.get(soundId);
  }

  getStats(): any {
    return {
      totalSounds: this.sounds.size,
      activeSounds: this.activeSounds.size,
      maxSimultaneous: this.config.maxSimultaneousSounds,
      spatialAudio: this.config.spatialAudio,
      headless: this.isHeadless
    };
  }

  // Headless mode utilities
  generateAudioReport(): string {
    const stats = this.getStats();
    const activeSounds = this.getActiveSounds();
    
    let report = `Audio System Report\n`;
    report += `==================\n`;
    report += `Total Registered Sounds: ${stats.totalSounds}\n`;
    report += `Active Sounds: ${stats.activeSounds}\n`;
    report += `Max Simultaneous: ${stats.maxSimultaneous}\n`;
    report += `Spatial Audio: ${stats.spatialAudio ? 'Enabled' : 'Disabled'}\n`;
    report += `Headless Mode: ${stats.headless ? 'Yes' : 'No'}\n\n`;
    
    if (activeSounds.length > 0) {
      report += `Active Sound Instances:\n`;
      activeSounds.forEach(sound => {
        report += `  - ${sound.soundId} (${sound.instanceId})\n`;
        report += `    Volume: ${sound.volume.toFixed(2)}, Pitch: ${sound.pitch.toFixed(2)}\n`;
        if (sound.spatial) {
          report += `    Position: (${sound.position.x.toFixed(1)}, ${sound.position.y.toFixed(1)}, ${sound.position.z.toFixed(1)})\n`;
        }
      });
    }
    
    return report;
  }
}

// CLI interface
export function createAudioSystem(config: AudioConfig, headless: boolean = false): AudioSystem {
  return new AudioSystem(config, headless);
}

// Export for CLI usage
export default AudioSystem;