// AudioBridgePure - comprehensive audio command processing

export type AudioCmd =
  | { op: 'play'; id: string; volume?: number; loop?: boolean; fadeIn?: number; channel?: string }
  | { op: 'playSpatial'; id: string; spatialConfig: SpatialAudioConfig; fadeIn?: number }
  | { op: 'stop'; id: string; fadeOut?: number }
  | { op: 'pause'; id: string }
  | { op: 'resume'; id: string }
  | { op: 'setVolume'; id: string; volume: number; fadeTime?: number }
  | { op: 'setPitch'; id: string; pitch: number }
  | { op: 'setLoop'; id: string; loop: boolean }
  | { op: 'fadeIn'; id: string; duration: number; targetVolume?: number }
  | { op: 'fadeOut'; id: string; duration: number }
  | { op: 'setSpatial'; id: string; spatialConfig: SpatialAudioConfig }
  | { op: 'setMasterVolume'; volume: number }
  | { op: 'enableHRTF'; enabled: boolean }
  | { op: 'enableReverb'; enabled: boolean }
  | { op: 'setReverb'; decay: number; damping: number }
  | { op: 'addEffect'; id: string; effectType: string; parameters?: Record<string, number> }
  | { op: 'removeEffect'; id: string; effectId: string }
  | { op: 'setListenerPosition'; position: { x: number; y: number; z: number } }
  | { op: 'setListenerOrientation'; forward: { x: number; y: number; z: number }; up: { x: number; y: number; z: number } }
  | { op: 'stopAll' }
  | { op: 'list' }
  | { op: 'getState'; id: string }
  | { op: 'getAnalysis' }
  | { op: 'getStats' };

export interface AudioState {
  id: string;
  playing: boolean;
  paused: boolean;
  volume: number;
  pitch: number;
  loop: boolean;
  fadeInProgress?: 'in' | 'out';
  fadeStartTime?: number;
  fadeDuration?: number;
  fadeTargetVolume?: number;
}

export interface SpatialAudioConfig {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  direction?: { x: number; y: number; z: number };
  volume: number;
  pitch: number;
  coneInnerAngle?: number;
  coneOuterAngle?: number;
  coneOuterVolume?: number;
  maxDistance?: number;
  referenceDistance?: number;
  rolloffFactor?: number;
  directivityPattern?: 'omnidirectional' | 'cardioid' | 'figure8' | 'custom';
}

export interface AudioAnalysisData {
  rms: number;
  spectralCentroid: number;
  spectralRolloff: number;
  frequencyData: Float32Array;
  timeData: Float32Array;
  sampleRate: number;
  timestamp: number;
}

export interface AudioResult {
  op: 'audio';
  status: 'ok' | 'error';
  applied: AudioCmd[];
  state?: AudioState[];
  analysis?: AudioAnalysisData;
  stats?: any;
  issues?: string[];
}

export class AudioManager {
  private audioStates = new Map<string, AudioState>();
  private currentTime = 0;

  process(cmds: AudioCmd[]): AudioResult {
    const applied: AudioCmd[] = [];
    const issues: string[] = [];

    for (const cmd of cmds) {
      try {
        this.processCommand(cmd);
        applied.push(cmd);
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        issues.push(`Failed to process ${cmd.op}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Handle special commands that need result data
    let analysis: AudioAnalysisData | undefined;
    let stats: any | undefined;

    for (const cmd of cmds) {
      if (cmd.op === 'getAnalysis') {
        analysis = this.getAudioAnalysis();
      } else if (cmd.op === 'getStats') {
        stats = this.getStats();
      }
    }

    return {
      op: 'audio',
      status: issues.length > 0 ? 'error' : 'ok',
      applied,
      state: Array.from(this.audioStates.values()),
      analysis,
      stats,
      issues: issues.length > 0 ? issues : undefined
    };
  }

  private processCommand(cmd: AudioCmd): void {
    switch (cmd.op) {
      case 'play':
        this.playAudio(cmd.id, cmd.volume ?? 1.0, cmd.loop ?? false, cmd.fadeIn);
        break;
      case 'stop':
        this.stopAudio(cmd.id, cmd.fadeOut);
        break;
      case 'pause':
        this.pauseAudio(cmd.id);
        break;
      case 'resume':
        this.resumeAudio(cmd.id);
        break;
      case 'setVolume':
        this.setVolume(cmd.id, cmd.volume, cmd.fadeTime);
        break;
      case 'setPitch':
        this.setPitch(cmd.id, cmd.pitch);
        break;
      case 'setLoop':
        this.setLoop(cmd.id, cmd.loop);
        break;
      case 'fadeIn':
        this.fadeIn(cmd.id, cmd.duration, cmd.targetVolume ?? 1.0);
        break;
      case 'fadeOut':
        this.fadeOut(cmd.id, cmd.duration);
        break;
      case 'stopAll':
        this.stopAll();
        break;
      case 'list':
        // List command is handled in the result
        break;
      case 'getState':
        // Get state command is handled in the result
        break;
      case 'playSpatial':
        this.playSpatialAudio(cmd.id, cmd.spatialConfig, cmd.fadeIn);
        break;
      case 'setSpatial':
        this.setSpatialAudio(cmd.id, cmd.spatialConfig);
        break;
      case 'setMasterVolume':
        this.setMasterVolume(cmd.volume);
        break;
      case 'enableHRTF':
        this.enableHRTF(cmd.enabled);
        break;
      case 'enableReverb':
        this.enableReverb(cmd.enabled);
        break;
      case 'setReverb':
        this.setReverb(cmd.decay, cmd.damping);
        break;
      case 'addEffect':
        this.addEffect(cmd.id, cmd.effectType, cmd.parameters);
        break;
      case 'removeEffect':
        this.removeEffect(cmd.id, cmd.effectId);
        break;
      case 'setListenerPosition':
        this.setListenerPosition(cmd.position);
        break;
      case 'setListenerOrientation':
        this.setListenerOrientation(cmd.forward, cmd.up);
        break;
      case 'getAnalysis':
        // Analysis command is handled in the result
        break;
      case 'getStats':
        // Stats command is handled in the result
        break;
    }
  }

  private playAudio(id: string, volume: number, loop: boolean, fadeIn?: number): void {
    const state: AudioState = {
      id,
      playing: true,
      paused: false,
      volume: fadeIn ? 0 : volume,
      pitch: 1.0,
      loop
    };

    if (fadeIn) {
      state.fadeInProgress = 'in';
      state.fadeStartTime = this.currentTime;
      state.fadeDuration = fadeIn;
      state.fadeTargetVolume = volume;
    }

    this.audioStates.set(id, state);
  }

  private stopAudio(id: string, fadeOut?: number): void {
    const state = this.audioStates.get(id);
    if (!state) return;

    if (fadeOut) {
      state.fadeInProgress = 'out';
      state.fadeStartTime = this.currentTime;
      state.fadeDuration = fadeOut;
      state.fadeTargetVolume = 0;
    } else {
      state.playing = false;
      state.paused = false;
    }
  }

  private pauseAudio(id: string): void {
    const state = this.audioStates.get(id);
    if (state) {
      state.paused = true;
      state.playing = false;
    }
  }

  private resumeAudio(id: string): void {
    const state = this.audioStates.get(id);
    if (state) {
      state.paused = false;
      state.playing = true;
    }
  }

  private setVolume(id: string, volume: number, fadeTime?: number): void {
    const state = this.audioStates.get(id);
    if (!state) return;

    if (fadeTime) {
      state.fadeInProgress = 'in';
      state.fadeStartTime = this.currentTime;
      state.fadeDuration = fadeTime;
      state.fadeTargetVolume = volume;
    } else {
      state.volume = volume;
    }
  }

  private setPitch(id: string, pitch: number): void {
    const state = this.audioStates.get(id);
    if (state) {
      state.pitch = pitch;
    }
  }

  private setLoop(id: string, loop: boolean): void {
    const state = this.audioStates.get(id);
    if (state) {
      state.loop = loop;
    }
  }

  private fadeIn(id: string, duration: number, targetVolume: number): void {
    const state = this.audioStates.get(id);
    if (!state) return;

    state.fadeInProgress = 'in';
    state.fadeStartTime = this.currentTime;
    state.fadeDuration = duration;
    state.fadeTargetVolume = targetVolume;
  }

  private fadeOut(id: string, duration: number): void {
    const state = this.audioStates.get(id);
    if (!state) return;

    state.fadeInProgress = 'out';
    state.fadeStartTime = this.currentTime;
    state.fadeDuration = duration;
    state.fadeTargetVolume = 0;
  }

  private stopAll(): void {
    for (const state of Array.from(this.audioStates.values())) {
      state.playing = false;
      state.paused = false;
    }
  }

  getState(id: string): AudioState | undefined {
    return this.audioStates.get(id);
  }

  getAllStates(): AudioState[] {
    return Array.from(this.audioStates.values());
  }

  // Advanced audio processing methods
  private playSpatialAudio(id: string, spatialConfig: SpatialAudioConfig, fadeIn?: number): void {
    const state: AudioState = {
      id,
      playing: true,
      paused: false,
      volume: spatialConfig.volume,
      pitch: spatialConfig.pitch,
      loop: false
    };

    if (fadeIn) {
      state.fadeInProgress = 'in';
      state.fadeStartTime = this.currentTime;
      state.fadeDuration = fadeIn;
      state.fadeTargetVolume = spatialConfig.volume;
    }

    // Store spatial configuration
    (state as any).spatialConfig = spatialConfig;

    this.audioStates.set(id, state);
  }

  private setSpatialAudio(id: string, spatialConfig: SpatialAudioConfig): void {
    const state = this.audioStates.get(id);
    if (state) {
      (state as any).spatialConfig = spatialConfig;
    }
  }

  private setMasterVolume(volume: number): void {
    // In a real implementation, this would control the master audio bus
    console.log(`Setting master volume to ${volume}`);
  }

  private enableHRTF(enabled: boolean): void {
    console.log(`HRTF ${enabled ? 'enabled' : 'disabled'}`);
  }

  private enableReverb(enabled: boolean): void {
    console.log(`Reverb ${enabled ? 'enabled' : 'disabled'}`);
  }

  private setReverb(decay: number, damping: number): void {
    console.log(`Reverb parameters: decay=${decay}, damping=${damping}`);
  }

  private addEffect(id: string, effectType: string, parameters?: Record<string, number>): void {
    console.log(`Adding effect ${effectType} to ${id}`, parameters);
  }

  private removeEffect(id: string, effectId: string): void {
    console.log(`Removing effect ${effectId} from ${id}`);
  }

  private setListenerPosition(position: { x: number; y: number; z: number }): void {
    console.log(`Setting listener position to (${position.x}, ${position.y}, ${position.z})`);
  }

  private setListenerOrientation(forward: { x: number; y: number; z: number }, up: { x: number; y: number; z: number }): void {
    console.log(`Setting listener orientation - forward: (${forward.x}, ${forward.y}, ${forward.z}), up: (${up.x}, ${up.y}, ${up.z})`);
  }

  private getAudioAnalysis(): AudioAnalysisData {
    // Mock audio analysis data
    return {
      rms: 0.5,
      spectralCentroid: 1000,
      spectralRolloff: 2000,
      frequencyData: new Float32Array(1024),
      timeData: new Float32Array(1024),
      sampleRate: 44100,
      timestamp: Date.now()
    };
  }

  private getStats(): any {
    return {
      totalStates: this.audioStates.size,
      playingStates: Array.from(this.audioStates.values()).filter(s => s.playing).length,
      pausedStates: Array.from(this.audioStates.values()).filter(s => s.paused).length,
      currentTime: this.currentTime,
      features: {
        spatialAudio: true,
        hrtf: true,
        reverb: true,
        effects: true,
        analysis: true
      }
    };
  }
}

// Legacy function for backward compatibility
export function process(cmds: AudioCmd[]): AudioResult {
  const manager = new AudioManager();
  return manager.process(cmds);
}

