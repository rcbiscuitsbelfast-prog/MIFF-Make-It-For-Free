// AudioPure - Comprehensive audio system for MIFF framework
// Schema Version: v1

export enum AudioFormat {
  MP3 = 'mp3',
  WAV = 'wav',
  OGG = 'ogg',
  FLAC = 'flac',
  AAC = 'aac',
  WEBM = 'webm'
}

export enum AudioChannel {
  MONO = 1,
  STEREO = 2,
  SURROUND_5_1 = 6,
  SURROUND_7_1 = 8
}

export enum AudioState {
  STOPPED = 'stopped',
  PLAYING = 'playing',
  PAUSED = 'paused',
  LOADING = 'loading',
  ERROR = 'error'
}

export enum AudioEffectType {
  REVERB = 'reverb',
  DELAY = 'delay',
  CHORUS = 'chorus',
  DISTORTION = 'distortion',
  COMPRESSION = 'compression',
  EQ = 'equalizer',
  FILTER = 'filter',
  PITCH_SHIFT = 'pitch_shift',
  VOLUME = 'volume',
  PAN = 'pan'
}

export enum AudioBusType {
  MASTER = 'master',
  MUSIC = 'music',
  SFX = 'sfx',
  VOICE = 'voice',
  AMBIENT = 'ambient',
  UI = 'ui',
  CUSTOM = 'custom'
}

export interface AudioSource {
  id: string;
  name: string;
  url: string;
  format: AudioFormat;
  channels: AudioChannel;
  sampleRate: number;
  duration: number;
  size: number;
  metadata?: Record<string, any>;
  preload: boolean;
  loop: boolean;
  volume: number;
  pitch: number;
  pan: number;
}

export interface AudioEffect {
  id: string;
  type: AudioEffectType;
  enabled: boolean;
  parameters: Record<string, number>;
  automation?: AudioAutomationPoint[];
  bypass: boolean;
}

export interface AudioAutomationPoint {
  time: number;
  value: number;
  curve: 'linear' | 'exponential' | 'logarithmic' | 'step';
}

export interface AudioBus {
  id: string;
  name: string;
  type: AudioBusType;
  volume: number;
  mute: boolean;
  solo: boolean;
  effects: AudioEffect[];
  sends: AudioBusSend[];
  parentBus?: string;
  childBuses: string[];
}

export interface AudioBusSend {
  busId: string;
  level: number;
  preFader: boolean;
  enabled: boolean;
}

export interface AudioMixerStrip {
  id: string;
  name: string;
  sourceId?: string;
  busId: string;
  volume: number;
  mute: boolean;
  solo: boolean;
  pan: number;
  effects: AudioEffect[];
  automation: AudioAutomation;
  enabled: boolean;
}

export interface AudioAutomation {
  volume: AudioAutomationPoint[];
  pan: AudioAutomationPoint[];
  effects: Record<string, AudioAutomationPoint[]>;
}

export interface AudioListener {
  position: { x: number; y: number; z: number };
  orientation: { forward: { x: number; y: number; z: number }; up: { x: number; y: number; z: number } };
  velocity: { x: number; y: number; z: number };
}

export interface SpatialAudioConfig {
  enabled: boolean;
  minDistance: number;
  maxDistance: number;
  rolloffFactor: number;
  coneInnerAngle: number;
  coneOuterAngle: number;
  coneOuterGain: number;
}

export interface AudioPerformanceMetrics {
  activeSources: number;
  totalSources: number;
  audioLatency: number;
  bufferUnderruns: number;
  memoryUsage: number;
  cpuUsage: number;
  droppedFrames: number;
  outputLatency: number;
}

export interface AudioAnalysisData {
  frequencyData: Float32Array;
  timeDomainData: Float32Array;
  spectralCentroid: number;
  spectralRolloff: number;
  rms: number;
  peak: number;
  zeroCrossingRate: number;
}

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private sources: Map<string, AudioSource> = new Map();
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();
  private buses: Map<string, AudioBus> = new Map();
  private mixerStrips: Map<string, AudioMixerStrip> = new Map();
  private masterBus: AudioBus;
  private audioListener: AudioListener;
  private performanceMetrics: AudioPerformanceMetrics;
  private analyserNode: AnalyserNode | null = null;
  private gainNodes: Map<string, GainNode> = new Map();
  private isInitialized = false;
  private audioWorkletLoaded = false;

  constructor() {
    this.masterBus = this.createMasterBus();
    this.audioListener = this.createDefaultListener();
    this.performanceMetrics = this.initializePerformanceMetrics();
    this.initializeAudioContext();
  }

  private createMasterBus(): AudioBus {
    return {
      id: 'master',
      name: 'Master',
      type: AudioBusType.MASTER,
      volume: 1.0,
      mute: false,
      solo: false,
      effects: [],
      sends: [],
      childBuses: []
    };
  }

  private createDefaultListener(): AudioListener {
    return {
      position: { x: 0, y: 0, z: 0 },
      orientation: {
        forward: { x: 0, y: 0, z: -1 },
        up: { x: 0, y: 1, z: 0 }
      },
      velocity: { x: 0, y: 0, z: 0 }
    };
  }

  private initializePerformanceMetrics(): AudioPerformanceMetrics {
    return {
      activeSources: 0,
      totalSources: 0,
      audioLatency: 0,
      bufferUnderruns: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      droppedFrames: 0,
      outputLatency: 0
    };
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      // Create AudioContext with optimal settings
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 44100
      });

      // Create analyser for audio analysis
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Create master gain node
      const masterGain = this.audioContext.createGain();
      masterGain.gain.value = this.masterBus.volume;
      masterGain.connect(this.audioContext.destination);

      this.gainNodes.set('master', masterGain);

      this.isInitialized = true;
      console.log('[AudioEngine] Initialized successfully');
    } catch (error) {
      console.error('[AudioEngine] Failed to initialize:', error);
      throw new Error(`Audio initialization failed: ${error}`);
    }
  }

  // Core audio functionality
  async loadAudioSource(source: AudioSource): Promise<void> {
    if (!this.audioContext || !this.isInitialized) {
      throw new Error('AudioEngine not initialized');
    }

    try {
      const response = await fetch(source.url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Store the source with buffer
      this.sources.set(source.id, { ...source, duration: audioBuffer.duration });

      this.performanceMetrics.totalSources++;

      console.log(`[AudioEngine] Loaded audio source: ${source.name}`);
    } catch (error) {
      console.error(`[AudioEngine] Failed to load audio source ${source.name}:`, error);
      throw new Error(`Audio source loading failed: ${error}`);
    }
  }

  async playSource(sourceId: string, options?: PlayOptions): Promise<void> {
    if (!this.audioContext || !this.isInitialized) {
      throw new Error('AudioEngine not initialized');
    }

    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Audio source not found: ${sourceId}`);
    }

    try {
      // Stop any existing source with the same ID
      this.stopSource(sourceId);

      // Create audio buffer source
      const audioSource = this.audioContext.createBufferSource();
      const buffer = await this.getAudioBuffer(sourceId);
      audioSource.buffer = buffer;

      // Configure playback
      audioSource.loop = source.loop;
      audioSource.playbackRate.value = options?.pitch || source.pitch;
      // Create gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = options?.volume || source.volume;
      audioSource.connect(gainNode);

      // Connect to master bus
      const masterGain = this.gainNodes.get('master');
      if (masterGain) {
        gainNode.connect(masterGain);
      }

      // Store reference
      this.activeSources.set(sourceId, audioSource);

      // Start playback
      const startTime = options?.startTime || 0;
      audioSource.start(this.audioContext.currentTime + startTime);

      this.performanceMetrics.activeSources++;

      // Set up event handlers
      audioSource.onended = () => {
        this.activeSources.delete(sourceId);
        this.performanceMetrics.activeSources = Math.max(0, this.performanceMetrics.activeSources - 1);
        console.log(`[AudioEngine] Source ended: ${sourceId}`);
      };

      console.log(`[AudioEngine] Playing source: ${source.name}`);
    } catch (error) {
      console.error(`[AudioEngine] Failed to play source ${sourceId}:`, error);
      throw new Error(`Audio playback failed: ${error}`);
    }
  }

  private async getAudioBuffer(sourceId: string): Promise<AudioBuffer> {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Audio source not found: ${sourceId}`);
    }

    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    try {
      const response = await fetch(source.url);
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      throw new Error(`Failed to decode audio buffer: ${error}`);
    }
  }

  stopSource(sourceId: string): void {
    const source = this.activeSources.get(sourceId);
    if (source) {
      try {
        source.stop();
        this.activeSources.delete(sourceId);
        this.performanceMetrics.activeSources = Math.max(0, this.performanceMetrics.activeSources - 1);
        console.log(`[AudioEngine] Stopped source: ${sourceId}`);
      } catch (error) {
        console.warn(`[AudioEngine] Error stopping source ${sourceId}:`, error);
      }
    }
  }

  pauseSource(sourceId: string): void {
    const source = this.activeSources.get(sourceId);
    if (source) {
      source.playbackRate.value = 0;
      console.log(`[AudioEngine] Paused source: ${sourceId}`);
    }
  }

  resumeSource(sourceId: string): void {
    const source = this.activeSources.get(sourceId);
    if (source) {
      source.playbackRate.value = 1;
      console.log(`[AudioEngine] Resumed source: ${sourceId}`);
    }
  }

  setSourceVolume(sourceId: string, volume: number): void {
    const source = this.activeSources.get(sourceId);
    if (source) {
      // Note: Volume control is now handled by gain nodes created during playback
      // This method is kept for API compatibility but doesn't directly control volume
      console.log(`[AudioEngine] Volume control for ${sourceId} should be set during playback: ${volume}`);
    }
  }

  setSourcePitch(sourceId: string, pitch: number): void {
    const source = this.activeSources.get(sourceId);
    if (source) {
      source.playbackRate.value = Math.max(0.1, Math.min(4, pitch));
    }
  }

  setSourcePan(sourceId: string, pan: number): void {
    const source = this.activeSources.get(sourceId);
    if (source && this.audioContext) {
      const panner = this.audioContext.createPanner();
      panner.setPosition(Math.max(-1, Math.min(1, pan)), 0, 0);
      // Reconnect with panner if needed
    }
  }

  // Bus management
  createBus(busConfig: Partial<AudioBus>): string {
    const bus: AudioBus = {
      id: `bus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: busConfig.name || 'New Bus',
      type: busConfig.type || AudioBusType.CUSTOM,
      volume: busConfig.volume || 1.0,
      mute: busConfig.mute || false,
      solo: busConfig.solo || false,
      effects: busConfig.effects || [],
      sends: busConfig.sends || [],
      parentBus: busConfig.parentBus,
      childBuses: busConfig.childBuses || []
    };

    this.buses.set(bus.id, bus);

    // Create gain node for the bus
    if (this.audioContext) {
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = bus.volume;

      const masterGain = this.gainNodes.get('master');
      if (masterGain) {
        gainNode.connect(masterGain);
      }

      this.gainNodes.set(bus.id, gainNode);
    }

    return bus.id;
  }

  getBus(busId: string): AudioBus | undefined {
    return this.buses.get(busId);
  }

  setBusVolume(busId: string, volume: number): void {
    const bus = this.buses.get(busId);
    if (bus) {
      bus.volume = Math.max(0, Math.min(1, volume));

      const gainNode = this.gainNodes.get(busId);
      if (gainNode) {
        gainNode.gain.value = volume;
      }
    }
  }

  setBusMute(busId: string, mute: boolean): void {
    const bus = this.buses.get(busId);
    if (bus) {
      bus.mute = mute;

      const gainNode = this.gainNodes.get(busId);
      if (gainNode) {
        gainNode.gain.value = mute ? 0 : bus.volume;
      }
    }
  }

  // Effect management
  addEffect(busId: string, effect: AudioEffect): void {
    const bus = this.buses.get(busId);
    if (bus) {
      bus.effects.push(effect);
      this.applyEffect(busId, effect);
    }
  }

  removeEffect(busId: string, effectId: string): void {
    const bus = this.buses.get(busId);
    if (bus) {
      const effectIndex = bus.effects.findIndex(e => e.id === effectId);
      if (effectIndex !== -1) {
        bus.effects.splice(effectIndex, 1);
      }
    }
  }

  private applyEffect(busId: string, effect: AudioEffect): void {
    // Apply audio effects - simplified implementation
    // In a real implementation, this would create actual audio nodes
    console.log(`[AudioEngine] Applying effect ${effect.type} to bus ${busId}`);
  }

  // Spatial audio
  setListenerPosition(position: { x: number; y: number; z: number }): void {
    this.audioListener.position = position;
    if (this.audioContext && this.audioContext.listener) {
      const listener = this.audioContext.listener;
      listener.setPosition(position.x, position.y, position.z);
    }
  }

  setListenerOrientation(forward: { x: number; y: number; z: number }, up: { x: number; y: number; z: number }): void {
    this.audioListener.orientation = { forward, up };
    if (this.audioContext && this.audioContext.listener) {
      const listener = this.audioContext.listener;
      listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
    }
  }

  // Performance monitoring
  getPerformanceMetrics(): AudioPerformanceMetrics {
    // Update metrics
    if (this.audioContext) {
      this.performanceMetrics.audioLatency = this.audioContext.baseLatency || 0;
      this.performanceMetrics.outputLatency = this.audioContext.outputLatency || 0;
    }

    this.performanceMetrics.activeSources = this.activeSources.size;
    this.performanceMetrics.totalSources = this.sources.size;

    return { ...this.performanceMetrics };
  }

  // Audio analysis
  getAudioAnalysis(): AudioAnalysisData {
    if (!this.analyserNode) {
      throw new Error('Audio analyser not available');
    }

    const bufferLength = this.analyserNode.frequencyBinCount;
    const frequencyData = new Float32Array(bufferLength);
    const timeDomainData = new Float32Array(bufferLength);

    this.analyserNode.getFloatFrequencyData(frequencyData);
    this.analyserNode.getFloatTimeDomainData(timeDomainData);

    // Calculate spectral centroid
    let centroidSum = 0;
    let magnitudeSum = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = Math.abs(frequencyData[i]);
      centroidSum += i * magnitude;
      magnitudeSum += magnitude;
    }

    const spectralCentroid = magnitudeSum > 0 ? centroidSum / magnitudeSum : 0;

    // Calculate spectral rolloff
    const rolloffPercentile = 0.85;
    let rolloffMagnitude = magnitudeSum * rolloffPercentile;
    let spectralRolloff = 0;
    let currentMagnitude = 0;

    for (let i = 0; i < frequencyData.length; i++) {
      currentMagnitude += Math.abs(frequencyData[i]);
      if (currentMagnitude >= rolloffMagnitude) {
        spectralRolloff = (i / frequencyData.length) * (this.audioContext?.sampleRate || 44100) / 2;
        break;
      }
    }

    // Calculate RMS and peak
    let rmsSum = 0;
    let peak = 0;
    for (let i = 0; i < timeDomainData.length; i++) {
      const sample = timeDomainData[i];
      rmsSum += sample * sample;
      peak = Math.max(peak, Math.abs(sample));
    }
    const rms = Math.sqrt(rmsSum / timeDomainData.length);

    // Calculate zero crossing rate
    let zeroCrossings = 0;
    for (let i = 1; i < timeDomainData.length; i++) {
      if ((timeDomainData[i-1] >= 0) !== (timeDomainData[i] >= 0)) {
        zeroCrossings++;
      }
    }
    const zeroCrossingRate = zeroCrossings / timeDomainData.length;

    return {
      frequencyData,
      timeDomainData,
      spectralCentroid,
      spectralRolloff,
      rms,
      peak,
      zeroCrossingRate
    };
  }

  // Utility methods
  getAllSources(): AudioSource[] {
    return Array.from(this.sources.values());
  }

  getActiveSources(): string[] {
    return Array.from(this.activeSources.keys());
  }

  getAllBuses(): AudioBus[] {
    return Array.from(this.buses.values());
  }

  exportProject(format: 'json' | 'wav' | 'mp3' = 'json'): Promise<string> {
    const projectData = {
      sources: Array.from(this.sources.values()),
      buses: Array.from(this.buses.values()),
      mixerStrips: Array.from(this.mixerStrips.values()),
      masterBus: this.masterBus,
      metadata: {
        exportTime: new Date().toISOString(),
        engineVersion: '1.0.0'
      }
    };

    switch (format) {
      case 'json':
        return Promise.resolve(JSON.stringify(projectData, null, 2));
      case 'wav':
      case 'mp3':
        return Promise.reject(new Error(`${format} export not implemented yet`));
      default:
        return Promise.resolve(JSON.stringify(projectData, null, 2));
    }
  }

  dispose(): void {
    // Stop all active sources
    for (const [sourceId, source] of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (error) {
        console.warn(`Error stopping source ${sourceId}:`, error);
      }
    }

    // Clear all maps
    this.activeSources.clear();
    this.sources.clear();
    this.buses.clear();
    this.mixerStrips.clear();
    this.gainNodes.clear();

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    this.isInitialized = false;
    console.log('[AudioEngine] Disposed successfully');
  }
}

// Supporting interfaces and types
export interface PlayOptions {
  volume?: number;
  pitch?: number;
  pan?: number;
  startTime?: number;
  fadeIn?: number;
  loop?: boolean;
}

export interface AudioProject {
  sources: AudioSource[];
  buses: AudioBus[];
  mixerStrips: AudioMixerStrip[];
  masterBus: AudioBus;
  metadata: {
    exportTime: string;
    engineVersion: string;
  };
}

export interface SecurityConfiguration {
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordMinLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  sessionTimeout: number;
  auditLogRetention: number;
  enableRateLimiting: boolean;
  rateLimitRequests: number;
  rateLimitWindow: number;
  enableIPWhitelist: boolean;
  ipWhitelist: string[];
  enableAuditLogging: boolean;
  sensitiveActions: string[];
}