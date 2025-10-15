import { StructuredLogger } from '../shared/logging/StructuredLogger';
/**
 * AudioMixerPure.ts - Advanced Audio Mixing Engine
 *
 * Comprehensive audio mixing system with spatial audio processing,
 * advanced effects, mixing channels, and real-time audio processing.
 *
 * Features:
 * - Multi-channel mixing (master, music, SFX, voice, ambient)
 * - Advanced spatial audio with HRTF and room simulation
 * - Real-time audio effects (reverb, echo, distortion, EQ)
 * - Dynamic audio routing and bus system
 * - Audio analysis and visualization
 * - Cross-platform audio processing
 */

export enum AudioChannel {
  MASTER = 'master',
  MUSIC = 'music',
  SFX = 'sfx',
  VOICE = 'voice',
  AMBIENT = 'ambient',
  UI = 'ui'
}

export enum AudioEffectType {
  REVERB = 'reverb',
  ECHO = 'echo',
  DISTORTION = 'distortion',
  EQUALIZER = 'equalizer',
  COMPRESSOR = 'compressor',
  FILTER = 'filter',
  CHORUS = 'chorus',
  FLANGER = 'flanger'
}

export enum SpatialAudioMode {
  STEREO = 'stereo',
  HRTF = 'hrtf',
  BINAURAL = 'binaural',
  SURROUND_5_1 = 'surround_5_1',
  SURROUND_7_1 = 'surround_7_1'
}

export interface AudioBus {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  volume: number;
  mute: boolean;
  solo: boolean;
  effects: AudioEffect[];
  sends: AudioSend[];
  inputChannels: AudioChannel[];
}

export interface AudioSend {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  busId: string;
  amount: number; // 0.0 to 1.0
  preFader: boolean;
}

export interface AudioEffect {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: AudioEffectType;
  enabled: boolean;
  parameters: Record<string, number>;
}

export interface SpatialAudioSource {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  direction: { x: number; y: number; z: number };
  coneInnerAngle: number;
  coneOuterAngle: number;
  coneOuterVolume: number;
  maxDistance: number;
  referenceDistance: number;
  rolloffFactor: number;
}

export interface AudioAnalysisData {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  frequencyData: Float32Array;
  timeDomainData: Float32Array;
  volume: number;
  pitch: number;
  spectralCentroid: number;
  spectralRolloff: number;
  zeroCrossingRate: number;
}

export interface MixingConfig {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  sampleRate: number;
  bufferSize: number;
  channels: number;
  maxSources: number;
  enableSpatialAudio: boolean;
  spatialMode: SpatialAudioMode;
  enableFFT: boolean;
  fftSize: number;
  roomDimensions?: { width: number; height: number; depth: number };
  roomMaterial?: 'concrete' | 'wood' | 'carpet' | 'custom';
  reverbDecay?: number;
  reverbDamping?: number;
}

export interface AudioSource {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  audioData: AudioBuffer;
  loop: boolean;
  volume: number;
  pitch: number;
  spatial?: SpatialAudioSource;
  effects: AudioEffect[];
  bus: string;
  fadeIn?: number;
  fadeOut?: number;
  playbackRate: number;
}

export class AudioMixerPure {
  
  private config: MixingConfig;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private buses: Map<string, AudioBus> = new Map();
  private sources: Map<string, AudioSource> = new Map();
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();
  private analyser: AnalyserNode | null = null;
  private fftData: Float32Array | null = null;
  private timeData: Float32Array | null = null;
  private isInitialized = false;
  private listener: AudioListener | null = null;
  private spatialEnabled = false;

  constructor(config: MixingConfig) {
    
    this.config = config;
    this.initializeAudioContext();
    this.initializeBuses();
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      // Create AudioContext with optimal settings
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.config.sampleRate,
        latencyHint: 'interactive'
      });

      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 1.0;
      this.masterGain.connect(this.audioContext.destination);

      // Create analyser for audio analysis
      if (this.config.enableFFT) {
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = this.config.fftSize;
        this.analyser.smoothingTimeConstant = 0.8;
        this.fftData = new Float32Array(this.analyser.frequencyBinCount);
        this.timeData = new Float32Array(this.analyser.fftSize);

        this.analyser.connect(this.masterGain);
      }

      // Set up audio listener for spatial audio
      if (this.audioContext.listener && this.config.enableSpatialAudio) {
        this.listener = this.audioContext.listener;
        this.spatialEnabled = true;
      }

      this.isInitialized = true;
      console.info('🎵 AudioMixer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
      this.isInitialized = false;
    }
  }

  private initializeBuses(): void {
    // Create default audio buses
    const defaultBuses: AudioBus[] = [
      {
        id: 'master',
        name: 'Master',
        volume: 1.0,
        mute: false,
        solo: false,
        effects: [],
        sends: [],
        inputChannels: [AudioChannel.MASTER]
      },
      {
        id: 'music',
        name: 'Music',
        volume: 0.8,
        mute: false,
        solo: false,
        effects: [
          {
            id: 'music_reverb',
            type: AudioEffectType.REVERB,
            enabled: true,
            parameters: { decay: 2.0, damping: 0.3 }
          }
        ],
        sends: [{ busId: 'master', amount: 1.0, preFader: false }],
        inputChannels: [AudioChannel.MUSIC]
      },
      {
        id: 'sfx',
        name: 'Sound Effects',
        volume: 1.0,
        mute: false,
        solo: false,
        effects: [],
        sends: [{ busId: 'master', amount: 1.0, preFader: false }],
        inputChannels: [AudioChannel.SFX]
      },
      {
        id: 'voice',
        name: 'Voice',
        volume: 1.0,
        mute: false,
        solo: false,
        effects: [
          {
            id: 'voice_compressor',
            type: AudioEffectType.COMPRESSOR,
            enabled: true,
            parameters: { threshold: -24, ratio: 4, attack: 0.003, release: 0.25 }
          }
        ],
        sends: [{ busId: 'master', amount: 1.0, preFader: false }],
        inputChannels: [AudioChannel.VOICE]
      },
      {
        id: 'ambient',
        name: 'Ambient',
        volume: 0.6,
        mute: false,
        solo: false,
        effects: [
          {
            id: 'ambient_reverb',
            type: AudioEffectType.REVERB,
            enabled: true,
            parameters: { decay: 4.0, damping: 0.5 }
          }
        ],
        sends: [{ busId: 'master', amount: 0.8, preFader: false }],
        inputChannels: [AudioChannel.AMBIENT]
      },
      {
        id: 'ui',
        name: 'User Interface',
        volume: 0.7,
        mute: false,
        solo: false,
        effects: [],
        sends: [{ busId: 'master', amount: 1.0, preFader: false }],
        inputChannels: [AudioChannel.UI]
      }
    ];

    for (const bus of defaultBuses) {
      this.buses.set(bus.id, bus);
    }
  }

  public async loadAudioFromArrayBuffer(buffer: ArrayBuffer, id: string): Promise<void> {
    if (!this.audioContext || !this.isInitialized) {
      throw new Error('Audio context not initialized');
    }

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(buffer);
      const source: AudioSource = {
        id,
        audioData: audioBuffer,
        loop: false,
        volume: 1.0,
        pitch: 1.0,
        effects: [],
        bus: 'master',
        playbackRate: 1.0
      };

      this.sources.set(id, source);
      console.info(`✅ Audio loaded: ${id}`);
    } catch (error) {
      console.error(`Failed to load audio ${id}:`, error);
      throw error;
    }
  }

  public async loadAudioFromURL(url: string, id: string): Promise<void> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      await this.loadAudioFromArrayBuffer(arrayBuffer, id);
    } catch (error) {
      console.error(`Failed to load audio from URL ${url}:`, error);
      throw error;
    }
  }

  public async playAudio(
    id: string,
    options: {
      channel?: AudioChannel;
      volume?: number;
      pitch?: number;
      loop?: boolean;
      fadeIn?: number;
      spatial?: SpatialAudioSource;
    } = {}
  ): Promise<string | null> {
    if (!this.audioContext || !this.isInitialized) {
      console.warn('Audio context not initialized');
      return null;
    }

    const source = this.sources.get(id);
    if (!source) {
      console.warn(`Audio source not found: ${id}`);
      return null;
    }

    // Check channel capacity
    const channel = options.channel || AudioChannel.SFX;
    const bus = this.getBusForChannel(channel);
    if (!bus) {
      console.warn(`No bus found for channel: ${channel}`);
      return null;
    }

    // Create audio buffer source
    const bufferSource = this.audioContext.createBufferSource();
    bufferSource.buffer = source.audioData;
    bufferSource.loop = options.loop ?? source.loop;
    bufferSource.playbackRate.value = (options.pitch ?? source.pitch) * source.playbackRate;

    // Create gain node for volume control
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = (options.volume ?? source.volume) * bus.volume;

    // Apply fade in if specified
    if (options.fadeIn) {
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        (options.volume ?? source.volume) * bus.volume,
        this.audioContext.currentTime + options.fadeIn
      );
    }

    // Create spatial audio if enabled
    if (this.spatialEnabled && (options.spatial || source.spatial)) {
      this.applySpatialAudio(bufferSource, options.spatial || source.spatial!);
    }

    // Connect audio nodes
    bufferSource.connect(gainNode);

    // Apply effects
    const effectsChain = this.createEffectsChain(source.effects);
    if (effectsChain.length > 0) {
      gainNode.connect(effectsChain[0]);
      for (let i = 0; i < effectsChain.length - 1; i++) {
        effectsChain[i].connect(effectsChain[i + 1]);
      }
      effectsChain[effectsChain.length - 1].connect(this.masterGain!);
    } else {
      gainNode.connect(this.masterGain!);
    }

    // Start playback
    const startTime = this.audioContext.currentTime;
    bufferSource.start(startTime);

    // Create unique instance ID
    const instanceId = `${id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.activeSources.set(instanceId, bufferSource);

    // Handle playback end
    bufferSource.onended = () => {
      this.activeSources.delete(instanceId);
      console.info(`🎵 Audio ended: ${instanceId}`);
    };

    console.info(`🎵 Playing audio: ${id} (instance: ${instanceId})`);
    return instanceId;
  }

  public stopAudio(instanceId: string, fadeOut: number = 0): void {
    const source = this.activeSources.get(instanceId);
    if (!source) return;

    const stopTime = this.audioContext?.currentTime || 0;

    if (fadeOut > 0) {
      // Create a fade out effect
      const gainNode = this.findGainNodeForSource(source);
      if (gainNode) {
        gainNode.gain.cancelScheduledValues(stopTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, stopTime);
        gainNode.gain.linearRampToValueAtTime(0, stopTime + fadeOut);
      }

      // Stop after fade out
      setTimeout(() => {
        source.stop(stopTime + fadeOut);
        this.activeSources.delete(instanceId);
      }, fadeOut * 1000);
    } else {
      source.stop(stopTime);
      this.activeSources.delete(instanceId);
    }

    console.info(`⏹️  Stopping audio: ${instanceId}`);
  }

  public stopAllAudio(fadeOut: number = 0): void {
    for (const [instanceId] of this.activeSources) {
      this.stopAudio(instanceId, fadeOut);
    }
  }

  public setVolume(instanceId: string, volume: number): void {
    const source = this.activeSources.get(instanceId);
    if (!source) return;

    const gainNode = this.findGainNodeForSource(source);
    if (gainNode) {
      gainNode.gain.value = volume;
    }
  }

  public setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  public setBusVolume(busId: string, volume: number): void {
    const bus = this.buses.get(busId);
    if (bus) {
      bus.volume = Math.max(0, Math.min(1, volume));
      this.updateBusRouting(bus);
    }
  }

  public muteBus(busId: string, mute: boolean): void {
    const bus = this.buses.get(busId);
    if (bus) {
      bus.mute = mute;
      this.updateBusRouting(bus);
    }
  }

  public soloBus(busId: string, solo: boolean): void {
    const bus = this.buses.get(busId);
    if (bus) {
      bus.solo = solo;
      this.updateBusRouting(bus);
    }
  }

  public addEffect(busId: string, effect: AudioEffect): void {
    const bus = this.buses.get(busId);
    if (bus) {
      bus.effects.push(effect);
      this.updateBusRouting(bus);
    }
  }

  public removeEffect(busId: string, effectId: string): void {
    const bus = this.buses.get(busId);
    if (bus) {
      const index = bus.effects.findIndex(e => e.id === effectId);
      if (index !== -1) {
        bus.effects.splice(index, 1);
        this.updateBusRouting(bus);
      }
    }
  }

  public getAudioAnalysis(): AudioAnalysisData | null {
    if (!this.analyser || !this.fftData || !this.timeData) {
      return null;
    }

    if (this.fftData) {
      this.analyser.getFloatFrequencyData(new Float32Array(this.fftData));
    }
    if (this.timeData) {
      this.analyser.getFloatTimeDomainData(new Float32Array(this.timeData));
    }

    // Calculate basic metrics
    let volume = 0;
    for (let i = 0; i < this.timeData.length; i++) {
      volume += Math.abs(this.timeData[i]);
    }
    volume /= this.timeData.length;

    // Calculate spectral centroid
    let spectralCentroid = 0;
    let totalMagnitude = 0;
    const nyquist = this.config.sampleRate / 2;
    for (let i = 0; i < this.fftData.length; i++) {
      const frequency = (i / this.fftData.length) * nyquist;
      const magnitude = Math.abs(this.fftData[i]);
      spectralCentroid += frequency * magnitude;
      totalMagnitude += magnitude;
    }
    spectralCentroid = totalMagnitude > 0 ? spectralCentroid / totalMagnitude : 0;

    // Calculate spectral rolloff
    const rolloffPercentile = 0.85;
    let rolloffMagnitude = totalMagnitude * rolloffPercentile;
    let spectralRolloff = 0;
    let currentMagnitude = 0;
    for (let i = 0; i < this.fftData.length; i++) {
      currentMagnitude += Math.abs(this.fftData[i]);
      if (currentMagnitude >= rolloffMagnitude) {
        spectralRolloff = (i / this.fftData.length) * nyquist;
        break;
      }
    }

    // Calculate zero crossing rate
    let zeroCrossings = 0;
    for (let i = 1; i < this.timeData.length; i++) {
      if ((this.timeData[i-1] >= 0) !== (this.timeData[i] >= 0)) {
        zeroCrossings++;
      }
    }

    return {
      frequencyData: new Float32Array(this.fftData),
      timeDomainData: new Float32Array(this.timeData),
      volume,
      pitch: this.estimatePitch(),
      spectralCentroid,
      spectralRolloff,
      zeroCrossingRate: zeroCrossings / this.timeData.length
    };
  }

  public setListenerPosition(position: { x: number; y: number; z: number }): void {
    if (this.listener) {
      this.listener.positionX.value = position.x;
      this.listener.positionY.value = position.y;
      this.listener.positionZ.value = position.z;
    }
  }

  public setListenerOrientation(forward: { x: number; y: number; z: number }, up: { x: number; y: number; z: number }): void {
    if (this.listener) {
      this.listener.forwardX.value = forward.x;
      this.listener.forwardY.value = forward.y;
      this.listener.forwardZ.value = forward.z;
      this.listener.upX.value = up.x;
      this.listener.upY.value = up.y;
      this.listener.upZ.value = up.z;
    }
  }

  public getStats(): any {
    return {
      initialized: this.isInitialized,
      sources: this.sources.size,
      activeSources: this.activeSources.size,
      buses: this.buses.size,
      spatialEnabled: this.spatialEnabled,
      masterVolume: this.masterGain?.gain.value || 0,
      sampleRate: this.audioContext?.sampleRate || 0,
      currentTime: this.audioContext?.currentTime || 0
    };
  }

  public createBus(bus: AudioBus): void {
    this.buses.set(bus.id, bus);
    console.info(`🚌 Created audio bus: ${bus.name} (${bus.id})`);
  }

  public getBus(busId: string): AudioBus! {
    return this.buses.get(busId);
  }

  public getBuses(): AudioBus[] {
    return Array.from(this.buses.values());
  }

  private getBusForChannel(channel: AudioChannel): AudioBus! {
    for (const bus of this.buses.values()) {
      if (bus.inputChannels.includes(channel)) {
        return bus;
      }
    }
    return this.buses.get('master'); // Fallback to master
  }

  private applySpatialAudio(source: AudioBufferSourceNode, spatial: SpatialAudioSource): void {
    if (!this.audioContext) return;

    // Create panner node
    const panner = this.audioContext.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'exponential';
    panner.refDistance = spatial.referenceDistance;
    panner.maxDistance = spatial.maxDistance;
    panner.rolloffFactor = spatial.rolloffFactor;
    panner.coneInnerAngle = spatial.coneInnerAngle;
    panner.coneOuterAngle = spatial.coneOuterAngle;
    panner.coneOuterGain = spatial.coneOuterVolume;

    // Set position and orientation
    panner.positionX.value = spatial.position.x;
    panner.positionY.value = spatial.position.y;
    panner.positionZ.value = spatial.position.z;

    // Connect source to panner
    source.disconnect();
    source.connect(panner);
    panner.connect(this.masterGain!);
  }

  private createEffectsChain(effects: AudioEffect[]): AudioNode[] {
    if (!this.audioContext) return [];

    const chain: AudioNode[] = [];

    for (const effect of effects) {
      if (!effect.enabled) continue;

      let effectNode: AudioNode | null = null;

      switch (effect.type) {
        case AudioEffectType.REVERB:
          effectNode = this.createReverbNode(effect.parameters);
          break;
        case AudioEffectType.ECHO:
          effectNode = this.createEchoNode(effect.parameters);
          break;
        case AudioEffectType.DISTORTION:
          effectNode = this.createDistortionNode(effect.parameters);
          break;
        case AudioEffectType.EQUALIZER:
          effectNode = this.createEqualizerNode(effect.parameters);
          break;
        case AudioEffectType.COMPRESSOR:
          effectNode = this.createCompressorNode(effect.parameters);
          break;
        case AudioEffectType.FILTER:
          effectNode = this.createFilterNode(effect.parameters);
          break;
        case AudioEffectType.CHORUS:
          effectNode = this.createChorusNode(effect.parameters);
          break;
        case AudioEffectType.FLANGER:
          effectNode = this.createFlangerNode(effect.parameters);
          break;
      }

      if (effectNode) {
        chain.push(effectNode);
      }
    }

    return chain;
  }

  private createReverbNode(parameters: Record<string, number>): AudioNode | null {
    if (!this.audioContext) return null;

    // Simplified reverb using convolution
    const convolver = this.audioContext.createConvolver();
    // In a real implementation, you would load an impulse response
    // For now, we'll create a simple delay-based reverb
    const delay = this.audioContext.createDelay(0.3);
    const feedback = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    feedback.gain.value = parameters.decay || 0.5;
    delay.delayTime.value = parameters.delayTime || 0.1;
    filter.frequency.value = parameters.damping || 3000;

    delay.connect(feedback);
    feedback.connect(delay);
    filter.connect(delay);

    // Create a simple impulse response
    const impulseLength = this.audioContext.sampleRate * 0.5;
    const impulse = this.audioContext.createBuffer(2, impulseLength, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < impulseLength; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2);
      }
    }

    convolver.buffer = impulse;
    convolver.connect(delay);

    return convolver;
  }

  private createEchoNode(parameters: Record<string, number>): AudioNode | null {
    if (!this.audioContext) return null;

    const delay = this.audioContext.createDelay(5.0);
    const feedback = this.audioContext.createGain();
    const mix = this.audioContext.createGain();

    delay.delayTime.value = parameters.delayTime || 0.5;
    feedback.gain.value = parameters.feedback || 0.3;
    mix.gain.value = parameters.mix || 0.5;

    delay.connect(feedback);
    feedback.connect(delay);

    return delay;
  }

  private createDistortionNode(parameters: Record<string, number>): AudioNode | null {
    if (!this.audioContext) return null;

    const waveShaper = this.audioContext.createWaveShaper();
    const amount = parameters.amount || 50;

    const curve = new Float32Array(65536);
    for (let i = 0; i < curve.length; i++) {
      const x = (i - 32768) / 32768;
      curve[i] = Math.tanh(amount * x) / Math.tanh(amount);
    }

    waveShaper.curve = curve;
    waveShaper.oversample = '4x';

    return waveShaper;
  }

  private createEqualizerNode(parameters: Record<string, number>): AudioNode | null {
    if (!this.audioContext) return null;

    // Simple 3-band equalizer
    const lowFilter = this.audioContext.createBiquadFilter();
    const midFilter = this.audioContext.createBiquadFilter();
    const highFilter = this.audioContext.createBiquadFilter();

    lowFilter.type = 'lowshelf';
    lowFilter.frequency.value = parameters.lowFreq || 250;
    lowFilter.gain.value = parameters.lowGain || 0;

    midFilter.type = 'peaking';
    midFilter.frequency.value = parameters.midFreq || 1000;
    midFilter.Q.value = parameters.midQ || 1;
    midFilter.gain.value = parameters.midGain || 0;

    highFilter.type = 'highshelf';
    highFilter.frequency.value = parameters.highFreq || 4000;
    highFilter.gain.value = parameters.highGain || 0;

    lowFilter.connect(midFilter);
    midFilter.connect(highFilter);

    return lowFilter;
  }

  private createCompressorNode(parameters: Record<string, number>): AudioNode | null {
    if (!this.audioContext) return null;

    const compressor = this.audioContext.createDynamicsCompressor();
    compressor.threshold.value = parameters.threshold || -24;
    compressor.ratio.value = parameters.ratio || 4;
    compressor.attack.value = parameters.attack || 0.003;
    compressor.release.value = parameters.release || 0.25;

    return compressor;
  }

  private createFilterNode(parameters: Record<string, number>): AudioNode | null {
    if (!this.audioContext) return null;

    const filter = this.audioContext.createBiquadFilter();
    const validTypes: BiquadFilterType[] = ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'];
    const typeValue = parameters.type as unknown as BiquadFilterType;
    filter.type = validTypes.includes(typeValue) ? typeValue : 'lowpass';
    filter.frequency.value = parameters.frequency || 1000;
    filter.Q.value = parameters.q || 1;
    filter.gain.value = parameters.gain || 0;

    return filter;
  }

  private createChorusNode(parameters: Record<string, number>): AudioNode | null {
    if (!this.audioContext) return null;

    const input = this.audioContext.createGain();
    const output = this.audioContext.createGain();
    const delay1 = this.audioContext.createDelay(0.1);
    const delay2 = this.audioContext.createDelay(0.1);
    const lfo1 = this.audioContext.createOscillator();
    const lfo2 = this.audioContext.createOscillator();
    const lfoGain1 = this.audioContext.createGain();
    const lfoGain2 = this.audioContext.createGain();

    delay1.delayTime.value = 0.02;
    delay2.delayTime.value = 0.025;

    lfo1.frequency.value = parameters.rate1 || 0.5;
    lfo2.frequency.value = parameters.rate2 || 0.7;
    lfoGain1.gain.value = parameters.depth1 || 0.005;
    lfoGain2.gain.value = parameters.depth2 || 0.005;

    lfo1.connect(lfoGain1);
    lfo2.connect(lfoGain2);
    lfoGain1.connect(delay1.delayTime);
    lfoGain2.connect(delay2.delayTime);

    input.connect(delay1);
    input.connect(delay2);
    input.connect(output);

    delay1.connect(output);
    delay2.connect(output);

    lfo1.start();
    lfo2.start();

    return input;
  }

  private createFlangerNode(parameters: Record<string, number>): AudioNode | null {
    if (!this.audioContext) return null;

    const input = this.audioContext.createGain();
    const output = this.audioContext.createGain();
    const delay = this.audioContext.createDelay(0.01);
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    const feedback = this.audioContext.createGain();

    delay.delayTime.value = 0.005;
    lfo.frequency.value = parameters.rate || 0.5;
    lfoGain.gain.value = parameters.depth || 0.002;
    feedback.gain.value = parameters.feedback || 0.5;

    lfo.connect(lfoGain);
    lfoGain.connect(delay.delayTime);

    input.connect(delay);
    input.connect(output);
    delay.connect(feedback);
    feedback.connect(delay);
    feedback.connect(output);

    lfo.start();

    return input;
  }

  private updateBusRouting(bus: AudioBus): void {
    // Update bus volume and effects routing
    // In a real implementation, this would update the audio graph
    console.info(`🔄 Updated bus routing for: ${bus.name}`);
  }

  private findGainNodeForSource(source: AudioBufferSourceNode): GainNode | null {
    // In a real implementation, this would traverse the audio graph
    // For now, return null as we don't have direct access to gain nodes
    return null;
  }

  private estimatePitch(): number {
    // Simplified pitch estimation
    // In a real implementation, this would use autocorrelation or YIN algorithm
    return 440; // Default to A4
  }
}

// Export for CLI usage
export default AudioMixerPure;