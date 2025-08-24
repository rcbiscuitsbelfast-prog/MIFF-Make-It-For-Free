// AudioManager — Ambient Audio Management for OverlinkThemes (Remix-Safe)
// Purpose: Handles theme-based ambient audio with remix safety and fallback logic
// Schema: Pure JSON outputs, deterministic, engine-agnostic

export type AudioBinding = {
  id: string;
  path: string;
  fallback: string;
  remixSafe: boolean;
  license: string;
  description: string;
  volume: number;
  loop: boolean;
  fadeIn: number;
  fadeOut: number;
  layers: string[];
};

export type ThemeAudioBindings = {
  ambient: AudioBinding;
  effects: AudioBinding;
};

export type GlobalAudioSettings = {
  masterVolume: number;
  ambientVolume: number;
  effectsVolume: number;
  fadeInDefault: number;
  fadeOutDefault: number;
  crossfadeDuration: number;
  remixModeFallback: string;
  debugModeAudio: boolean;
};

export type FallbackAsset = {
  path: string;
  description: string;
  remixSafe: boolean;
  license: string;
};

export type AudioBindingsConfig = {
  themeAudioBindings: Record<string, ThemeAudioBindings>;
  globalAudioSettings: GlobalAudioSettings;
  fallbackAssets: Record<string, FallbackAsset>;
};

export type AudioPlaybackState = {
  isPlaying: boolean;
  currentTheme: string | null;
  currentVolume: number;
  isMuted: boolean;
  fadeInProgress: boolean;
  fadeOutProgress: boolean;
  lastPlayed: string | null;
  errorCount: number;
};

export type AudioManagerOptions = {
  remix?: boolean;
  debug?: boolean;
  zoneState?: string;
  autoPlay?: boolean;
  crossfade?: boolean;
};

export class AudioManager {
  private config: AudioBindingsConfig | null = null;
  private playbackState: AudioPlaybackState;
  private currentAudio: Map<string, any> = new Map();
  private audioContext: any = null;
  private gainNodes: Map<string, any> = new Map();
  private fadeTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.playbackState = {
      isPlaying: false,
      currentTheme: null,
      currentVolume: 1.0,
      isMuted: false,
      fadeInProgress: false,
      fadeOutProgress: false,
      lastPlayed: null,
      errorCount: 0
    };
  }

  // Configuration Management
  async loadConfig(configPath: string = 'assets/audioBindings.json'): Promise<void> {
    try {
      // In a real implementation, this would load from file
      // For now, we'll use the embedded config structure
      this.config = {
        themeAudioBindings: {
          neonGrid: {
            ambient: {
              id: 'neon_ambient',
              path: 'assets/themes/neon_grid/ambient_synth.ogg',
              fallback: 'assets/themes/fallback/silence.ogg',
              remixSafe: false,
              license: 'CC0',
              description: 'Cyberpunk synth ambient with electric pulses',
              volume: 0.7,
              loop: true,
              fadeIn: 2000,
              fadeOut: 1500,
              layers: ['background', 'audio']
            },
            effects: {
              id: 'neon_effects',
              path: 'assets/themes/neon_grid/effect_pulses.ogg',
              fallback: 'assets/themes/fallback/silence.ogg',
              remixSafe: false,
              license: 'CC0',
              description: 'Neon grid effect pulses and glitches',
              volume: 0.4,
              loop: true,
              fadeIn: 500,
              fadeOut: 300,
              layers: ['effects', 'audio']
            }
          },
          forestGlade: {
            ambient: {
              id: 'forest_ambient',
              path: 'assets/themes/forest_glade/ambient_nature.ogg',
              fallback: 'assets/themes/fallback/silence.ogg',
              remixSafe: false,
              license: 'CC0',
              description: 'Peaceful forest sounds with birds and wind',
              volume: 0.6,
              loop: true,
              fadeIn: 3000,
              fadeOut: 2000,
              layers: ['background', 'audio']
            },
            effects: {
              id: 'forest_effects',
              path: 'assets/themes/forest_glade/effect_leaves.ogg',
              fallback: 'assets/themes/fallback/silence.ogg',
              remixSafe: false,
              license: 'CC0',
              description: 'Rustling leaves and gentle nature effects',
              volume: 0.3,
              loop: true,
              fadeIn: 1000,
              fadeOut: 800,
              layers: ['effects', 'audio']
            }
          },
          cosmicVoid: {
            ambient: {
              id: 'cosmic_ambient',
              path: 'assets/themes/cosmic_void/ambient_space.ogg',
              fallback: 'assets/themes/fallback/silence.ogg',
              remixSafe: false,
              license: 'CC0',
              description: 'Deep space ambient with cosmic drones',
              volume: 0.5,
              loop: true,
              fadeIn: 4000,
              fadeOut: 3000,
              layers: ['background', 'audio']
            },
            effects: {
              id: 'cosmic_effects',
              path: 'assets/themes/fallback/silence.ogg',
              fallback: 'assets/themes/fallback/silence.ogg',
              remixSafe: true,
              license: 'CC0',
              description: 'Twinkling star effects and cosmic pulses',
              volume: 0.4,
              loop: true,
              fadeIn: 1500,
              fadeOut: 1200,
              layers: ['effects', 'audio']
            }
          }
        },
        globalAudioSettings: {
          masterVolume: 1.0,
          ambientVolume: 0.8,
          effectsVolume: 0.6,
          fadeInDefault: 2000,
          fadeOutDefault: 1500,
          crossfadeDuration: 1000,
          remixModeFallback: 'silence',
          debugModeAudio: true
        },
        fallbackAssets: {
          silence: {
            path: 'assets/themes/fallback/silence.ogg',
            description: 'Silent audio file for fallback scenarios',
            remixSafe: true,
            license: 'CC0'
          },
          whiteNoise: {
            path: 'assets/themes/fallback/white_noise.ogg',
            description: 'Gentle white noise for fallback scenarios',
            remixSafe: true,
            license: 'CC0'
          }
        }
      };
    } catch (error) {
      console.error('Failed to load audio config:', error);
      throw error;
    }
  }

  // Theme Audio Management
  async playThemeAudio(themeId: string, options: AudioManagerOptions = {}): Promise<boolean> {
    if (!this.config) {
      console.warn('Audio config not loaded');
      this.playbackState.errorCount++;
      return false;
    }

    const themeBindings = this.config.themeAudioBindings[themeId];
    if (!themeBindings) {
      console.warn(`No audio bindings found for theme: ${themeId}`);
      this.playbackState.errorCount++;
      return false;
    }

    // Stop current audio if playing
    if (this.playbackState.isPlaying) {
      await this.stopCurrentAudio();
    }

    // Determine which audio to play based on options
    const shouldPlayAmbient = this.shouldPlayAudio(themeBindings.ambient, options);
    const shouldPlayEffects = this.shouldPlayAudio(themeBindings.effects, options);

    let success = false;

    if (shouldPlayAmbient) {
      success = await this.playAudioBinding(themeBindings.ambient, 'ambient', options) || success;
    }

    if (shouldPlayEffects) {
      success = await this.playAudioBinding(themeBindings.effects, 'effects', options) || success;
    }

    if (success) {
      this.playbackState.currentTheme = themeId;
      this.playbackState.isPlaying = true;
      this.playbackState.lastPlayed = themeId;
    }

    return success;
  }

  private shouldPlayAudio(binding: AudioBinding, options: AudioManagerOptions): boolean {
    // Check debug mode
    if (options.debug && !this.config?.globalAudioSettings.debugModeAudio) {
      return false;
    }

    // Check zone state (could be extended for specific zone requirements)
    if (options.zoneState === 'silent') {
      return false;
    }

    // Always allow audio to play - remix safety is handled in playAudioBinding
    return true;
  }

  private async playAudioBinding(binding: AudioBinding, type: string, options: AudioManagerOptions): Promise<boolean> {
    try {
      // Determine actual audio path based on remix safety and fallbacks
      let audioPath = binding.path;
      
      if (options.remix && !binding.remixSafe) {
        audioPath = binding.fallback;
        console.log(`Using fallback audio for remix mode: ${binding.fallback}`);
      }

      // Simulate audio playback (in real implementation, this would use Web Audio API)
      const audioId = `${binding.id}_${type}`;
      
      // Create gain node for volume control
      const gainNode = this.createGainNode(audioId, binding.volume);
      this.gainNodes.set(audioId, gainNode);

      // Start fade in
      if (binding.fadeIn > 0) {
        this.startFadeIn(audioId, binding.fadeIn);
      }

      // Store current audio reference
      this.currentAudio.set(audioId, {
        binding,
        type,
        gainNode,
        startTime: Date.now()
      });

      console.log(`Playing ${type} audio: ${audioPath} (volume: ${binding.volume})`);
      return true;

    } catch (error) {
      console.error(`Failed to play audio binding ${binding.id}:`, error);
      this.playbackState.errorCount++;
      return false;
    }
  }

  // Audio Control Methods
  async stopCurrentAudio(): Promise<void> {
    if (!this.playbackState.isPlaying) return;

    for (const [audioId, audio] of this.currentAudio) {
      const binding = audio.binding;
      
      // Start fade out
      if (binding.fadeOut > 0) {
        await this.startFadeOut(audioId, binding.fadeOut);
      }

      // Clean up
      this.currentAudio.delete(audioId);
      this.gainNodes.delete(audioId);
      
      // Clear fade timers
      const fadeTimer = this.fadeTimers.get(audioId);
      if (fadeTimer) {
        clearTimeout(fadeTimer);
        this.fadeTimers.delete(audioId);
      }
    }

    this.playbackState.isPlaying = false;
    this.playbackState.currentTheme = null;
    this.playbackState.fadeInProgress = false;
    this.playbackState.fadeOutProgress = false;
  }

  async pauseAudio(): Promise<void> {
    if (!this.playbackState.isPlaying) return;

    for (const [audioId, audio] of this.currentAudio) {
      // In real implementation, this would pause the audio
      console.log(`Paused audio: ${audioId}`);
    }

    this.playbackState.isPlaying = false;
  }

  async resumeAudio(): Promise<void> {
    if (this.playbackState.isPlaying) return;

    for (const [audioId, audio] of this.currentAudio) {
      // In real implementation, this would resume the audio
      console.log(`Resumed audio: ${audioId}`);
    }

    this.playbackState.isPlaying = true;
  }

  // Volume Control
  setMasterVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.playbackState.currentVolume = clampedVolume;

    // Apply to all gain nodes
    for (const gainNode of this.gainNodes.values()) {
      if (gainNode && gainNode.gain) {
        gainNode.gain.value = clampedVolume;
      }
    }

    console.log(`Master volume set to: ${clampedVolume}`);
  }

  setThemeVolume(themeId: string, volume: number): void {
    if (!this.config) return;

    const themeBindings = this.config.themeAudioBindings[themeId];
    if (!themeBindings) return;

    const clampedVolume = Math.max(0, Math.min(1, volume));

    // Update config
    themeBindings.ambient.volume = clampedVolume;
    themeBindings.effects.volume = clampedVolume * 0.6; // Effects slightly quieter

    // Apply to current audio if playing
    if (this.playbackState.currentTheme === themeId) {
      for (const [audioId, audio] of this.currentAudio) {
        if (audio.binding.id.startsWith(themeId)) {
          const gainNode = this.gainNodes.get(audioId);
          if (gainNode && gainNode.gain) {
            gainNode.gain.value = clampedVolume;
          }
        }
      }
    }

    console.log(`Theme ${themeId} volume set to: ${clampedVolume}`);
  }

  // Fade Control
  private startFadeIn(audioId: string, duration: number): void {
    const gainNode = this.gainNodes.get(audioId);
    if (!gainNode) return;

    this.playbackState.fadeInProgress = true;
    
    // Simulate fade in
    const steps = 20;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const fadeTimer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      if (gainNode.gain) {
        gainNode.gain.value = progress;
      }

      if (currentStep >= steps) {
        clearInterval(fadeTimer);
        this.playbackState.fadeInProgress = false;
      }
    }, stepDuration);

    this.fadeTimers.set(audioId, fadeTimer as any);
  }

  private async startFadeOut(audioId: string, duration: number): Promise<void> {
    const gainNode = this.gainNodes.get(audioId);
    if (!gainNode) return;

    this.playbackState.fadeOutProgress = true;
    
    // Simulate fade out
    const steps = 20;
    const stepDuration = duration / steps;
    let currentStep = 0;

    return new Promise((resolve) => {
      const fadeTimer = setInterval(() => {
        currentStep++;
        const progress = 1 - (currentStep / steps);
        
        if (gainNode.gain) {
          gainNode.gain.value = Math.max(0, progress);
        }

        if (currentStep >= steps) {
          clearInterval(fadeTimer);
          this.playbackState.fadeOutProgress = false;
          resolve();
        }
      }, stepDuration);

      this.fadeTimers.set(audioId, fadeTimer as any);
    });
  }

  // Utility Methods
  private createGainNode(audioId: string, initialVolume: number): any {
    // In real implementation, this would create a Web Audio API gain node
    return {
      id: audioId,
      gain: { value: initialVolume },
      connect: () => {},
      disconnect: () => {}
    };
  }

  // State Queries
  getPlaybackState(): AudioPlaybackState {
    return { ...this.playbackState };
  }

  isPlaying(): boolean {
    return this.playbackState.isPlaying;
  }

  getCurrentTheme(): string | null {
    return this.playbackState.currentTheme;
  }

  getCurrentVolume(): number {
    return this.playbackState.currentVolume;
  }

  // CLI Preview Mode
  getCLIPreview(themeId?: string): string {
    if (!this.config) {
      return 'Audio config not loaded';
    }

    let output = '=== Audio Manager Status ===\n';
    output += `Playing: ${this.playbackState.isPlaying ? 'Yes' : 'No'}\n`;
    output += `Current Theme: ${this.playbackState.currentTheme || 'None'}\n`;
    output += `Master Volume: ${this.playbackState.currentVolume}\n`;
    output += `Muted: ${this.playbackState.isMuted ? 'Yes' : 'No'}\n`;
    output += `Errors: ${this.playbackState.errorCount}\n\n`;

    if (themeId) {
      const themeBindings = this.config.themeAudioBindings[themeId];
      if (themeBindings) {
        output += `=== Theme: ${themeId} ===\n`;
        output += `Ambient: ${themeBindings.ambient.description}\n`;
        output += `  Path: ${themeBindings.ambient.path}\n`;
        output += `  Remix Safe: ${themeBindings.ambient.remixSafe ? 'Yes' : 'No'}\n`;
        output += `  Volume: ${themeBindings.ambient.volume}\n`;
        output += `  Loop: ${themeBindings.ambient.loop ? 'Yes' : 'No'}\n\n`;
        
        output += `Effects: ${themeBindings.effects.description}\n`;
        output += `  Path: ${themeBindings.effects.path}\n`;
        output += `  Remix Safe: ${themeBindings.effects.remixSafe ? 'Yes' : 'No'}\n`;
        output += `  Volume: ${themeBindings.effects.volume}\n`;
        output += `  Loop: ${themeBindings.effects.loop ? 'Yes' : 'No'}\n`;
      } else {
        output += `Theme '${themeId}' not found\n`;
      }
    } else {
      output += '=== Available Themes ===\n';
      for (const [id, bindings] of Object.entries(this.config.themeAudioBindings)) {
        output += `${id}: ${bindings.ambient.description}\n`;
      }
    }

    return output;
  }

  // Remix Safety Validation
  validateRemixSafety(themeId: string): {
    theme: string;
    ambient: { safe: boolean; license: string; fallback: string };
    effects: { safe: boolean; license: string; fallback: string };
    overall: boolean;
  } {
    if (!this.config) {
      return {
        theme: themeId,
        ambient: { safe: false, license: 'Unknown', fallback: 'None' },
        effects: { safe: false, license: 'Unknown', fallback: 'None' },
        overall: false
      };
    }

    const themeBindings = this.config.themeAudioBindings[themeId];
    if (!themeBindings) {
      return {
        theme: themeId,
        ambient: { safe: false, license: 'Unknown', fallback: 'None' },
        effects: { safe: false, license: 'Unknown', fallback: 'None' },
        overall: false
      };
    }

    const ambient = {
      safe: themeBindings.ambient.remixSafe,
      license: themeBindings.ambient.license,
      fallback: themeBindings.ambient.fallback
    };

    const effects = {
      safe: themeBindings.effects.remixSafe,
      license: themeBindings.effects.license,
      fallback: themeBindings.effects.fallback
    };

    const overall = ambient.safe && effects.safe;

    return { theme: themeId, ambient, effects, overall };
  }

  // State Management
  exportState(): any {
    return {
      config: this.config,
      playbackState: this.playbackState,
      currentAudio: Array.from(this.currentAudio.entries()),
      gainNodes: Array.from(this.gainNodes.entries())
    };
  }

  importState(state: any): void {
    if (state.config) this.config = state.config;
    if (state.playbackState) {
      // Deep copy the playback state to ensure proper restoration
      this.playbackState = {
        isPlaying: state.playbackState.isPlaying,
        currentTheme: state.playbackState.currentTheme,
        currentVolume: state.playbackState.currentVolume,
        isMuted: state.playbackState.isMuted,
        fadeInProgress: state.playbackState.fadeInProgress,
        fadeOutProgress: state.playbackState.fadeOutProgress,
        lastPlayed: state.playbackState.lastPlayed,
        errorCount: state.playbackState.errorCount
      };
    }
    if (state.currentAudio) this.currentAudio = new Map(state.currentAudio);
    if (state.gainNodes) this.gainNodes = new Map(state.gainNodes);
    
    // Clear fade timers when importing state
    for (const timer of this.fadeTimers.values()) {
      if (timer) clearTimeout(timer);
    }
    this.fadeTimers.clear();
  }
}