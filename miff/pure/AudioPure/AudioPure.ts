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
  enableHRTF?: boolean;
  enableReverb?: boolean;
  enableFFT?: boolean;
  fftSize?: number;
  roomDimensions?: { width: number; height: number; depth: number };
  reverbDecay?: number;
  reverbDamping?: number;
  masterVolume?: number;
  enableAudioAnalysis?: boolean;
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
  coneInnerAngle?: number;
  coneOuterAngle?: number;
  coneOuterVolume?: number;
  maxDistance?: number;
  referenceDistance?: number;
  rolloffFactor?: number;
  directivityPattern?: 'omnidirectional' | 'cardioid' | 'figure8' | 'custom';
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
  private listenerOrientation: { forward: { x: number; y: number; z: number }; up: { x: number; y: number; z: number } };
  private isHeadless: boolean;
  private instanceCounter: number; // Add counter for unique instance IDs
  private hrtfEnabled: boolean;
  private reverbEnabled: boolean;
  private fftEnabled: boolean;
  private masterVolume: number;
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private reverbNode?: ConvolverNode;
  private masterGain?: GainNode;

  constructor(config: AudioConfig, headless: boolean = false) {
    this.config = config;
    this.sounds = new Map();
    this.activeSounds = new Map();
    this.callbacks = [];
    this.listenerPosition = { x: 0, y: 0, z: 0 };
    this.listenerVelocity = { x: 0, y: 0, z: 0 };
    this.listenerOrientation = { forward: { x: 0, y: 0, z: -1 }, up: { x: 0, y: 1, z: 0 } };
    this.isHeadless = headless;
    this.instanceCounter = 0; // Initialize counter
    this.hrtfEnabled = config.enableHRTF ?? false;
    this.reverbEnabled = config.enableReverb ?? false;
    this.fftEnabled = config.enableFFT ?? false;
    this.masterVolume = config.masterVolume ?? 1.0;

    if (!headless) {
      this.initializeAudioContext();
    }

    if (this.isHeadless) {
      logger.info('Running in headless mode - audio events will be logged only');
    }
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.config.sampleRate,
        latencyHint: 'interactive'
      });

      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.audioContext.destination);

      // Create analyser for audio analysis
      if (this.fftEnabled) {
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = this.config.fftSize! || 2048;
        this.analyser.smoothingTimeConstant = 0.8;
        this.analyser.connect(this.masterGain);
      }

      // Create reverb effect
      if (this.reverbEnabled) {
        await this.createReverbNode();
      }

      logger.info('Audio context initialized successfully');
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to initialize audio context', { error: err });
    }
  }

  private async createReverbNode(): Promise<void> {
    if (!this.audioContext) return;

    this.reverbNode = this.audioContext.createConvolver();

    // Create a realistic reverb impulse response
    const sampleRate = this.audioContext.sampleRate;
    const decay = this.config.reverbDecay! || 2.0;
    const damping = this.config.reverbDamping! || 0.5;
    const length = sampleRate * decay;

    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);

      for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        const envelope = Math.exp(-time * damping);
        channelData[i] = (Math.random() * 2 - 1) * envelope;
      }
    }

    this.reverbNode.buffer = impulse;
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
      logger.debug('Audio event in headless mode', { eventType: event.type, soundId: event.soundId, data: event.data });
    }

    this.callbacks.forEach((callback: any) => {
      try {
        callback(event);
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Audio callback error', { error: err, soundId: event.soundId });
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
      logger.warn('Sound not found', { soundId });
      return null;
    }

    // Check if we've reached the maximum simultaneous sounds
    if (this.activeSounds.size >= this.config.maxSimultaneousSounds) {
      logger.warn('Maximum simultaneous sounds reached', { max: this.config.maxSimultaneousSounds, current: this.activeSounds.size });
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
      startTime: new Date(),
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

    if (instanceId && this.audioContext) {
      const instance = this.activeSounds.get(instanceId);
      if (instance) {
        instance.position = spatialConfig.position;
        instance.velocity = spatialConfig.velocity;
        instance.spatial = true;
        instance.direction = (spatialConfig as any).direction || { x: 0, y: 0, z: 0 };
        instance.coneInnerAngle = spatialConfig.coneInnerAngle;
        instance.coneOuterAngle = spatialConfig.coneOuterAngle;
        instance.coneOuterVolume = spatialConfig.coneOuterVolume;
        instance.maxDistance = spatialConfig.maxDistance;
        instance.referenceDistance = spatialConfig.referenceDistance;
        instance.rolloffFactor = spatialConfig.rolloffFactor;
        instance.directivityPattern = spatialConfig.directivityPattern;

        // Create panner node for advanced spatial audio
        if (this.hrtfEnabled) {
          instance.pannerNode = this.createPannerNode(spatialConfig);
        }

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

  private createPannerNode(spatialConfig: SpatialAudioConfig): PannerNode | null {
    if (!this.audioContext) return null;

    const panner = this.audioContext.createPanner();
    panner.panningModel = this.hrtfEnabled ? 'HRTF' : 'equalpower';
    panner.distanceModel = 'inverse';
    panner.refDistance = spatialConfig.referenceDistance || 1;
    panner.maxDistance = spatialConfig.maxDistance || 10000;
    panner.rolloffFactor = spatialConfig.rolloffFactor || 1;
    panner.coneInnerAngle = spatialConfig.coneInnerAngle || 360;
    panner.coneOuterAngle = spatialConfig.coneOuterAngle || 360;
    panner.coneOuterGain = spatialConfig.coneOuterVolume || 0;

    return panner;
  }

  public getAudioAnalysis(): any {
    if (!this.analyser || !this.fftEnabled) {
      return null;
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const frequencyData = new Float32Array(bufferLength);
    const timeData = new Float32Array(bufferLength);

    this.analyser.getFloatFrequencyData(frequencyData);
    this.analyser.getFloatTimeDomainData(timeData);

    // Calculate RMS volume
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      sum += timeData[i] * timeData[i];
    }
    const rms = Math.sqrt(sum / timeData.length);

    // Calculate spectral centroid
    let centroidSum = 0;
    let magnitudeSum = 0;
    const nyquist = this.config.sampleRate / 2;

    for (let i = 0; i < frequencyData.length; i++) {
      const frequency = (i / frequencyData.length) * nyquist;
      const magnitude = Math.abs(frequencyData[i]);
      centroidSum += frequency * magnitude;
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
        spectralRolloff = (i / frequencyData.length) * nyquist;
        break;
      }
    }

    return {
      frequencyData,
      timeData,
      rms,
      spectralCentroid,
      spectralRolloff,
      sampleRate: this.config.sampleRate,
      timestamp: new Date()
    };
  }

  public setListenerOrientation(forward: { x: number; y: number; z: number }, up: { x: number; y: number; z: number }): void {
    this.listenerOrientation.forward = forward;
    this.listenerOrientation.up = up;

    if (this.audioContext?.listener) {
      this.audioContext.listener.forwardX.value = forward.x;
      this.audioContext.listener.forwardY.value = forward.y;
      this.audioContext.listener.forwardZ.value = forward.z;
      this.audioContext.listener.upX.value = up.x;
      this.audioContext.listener.upY.value = up.y;
      this.audioContext.listener.upZ.value = up.z;
    }
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }

  public enableHRTF(enable: boolean): void {
    this.hrtfEnabled = enable;
    logger.info('HRTF state changed', { enabled: enable });
  }

  public enableReverb(enable: boolean): void {
    this.reverbEnabled = enable;
    logger.info('Reverb state changed', { enabled: enable });
  }

  public setReverbParameters(decay: number, damping: number): void {
    this.config.reverbDecay = decay;
    this.config.reverbDamping = damping;

    if (this.reverbEnabled) {
      this.createReverbNode();
    }
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
      data: { instanceId, duration: new Date() - instance.startTime }
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

  private updateSoundPitch(instanceId: string, pitch: number): void {
    const instance = this.activeSounds.get(instanceId);
    if (instance) {
      instance.pitch = pitch;
    }
  }

  updateSpatialAudio(): void {
    if (!this.config.spatialAudio! || !this.audioContext) return;

    for (const [instanceId, instance] of Array.from(this.activeSounds.entries())) {
      if (instance.spatial) {
        this.updateSpatialSource(instanceId, instance);
      }
    }
  }

  private updateSpatialSource(instanceId: string, instance: any): void {
    if (!this.audioContext) return;

    const spatial = instance.spatial as SpatialAudioConfig;
    const distance = this.calculateDistance(spatial.position, this.listenerPosition);
    const volume = this.calculateSpatialVolume(distance, spatial.volume, spatial);
    const dopplerShift = this.calculateAdvancedDopplerEffect(spatial.velocity, this.listenerVelocity);
    const directivity = this.calculateDirectivity(spatial);

    // Apply spatial effects
    const finalVolume = volume * directivity;
    const finalPitch = spatial.pitch * dopplerShift;

    this.setVolume(instanceId, finalVolume);
    this.updateSoundPitch(instanceId, finalPitch);

    // Apply HRTF if enabled
    if (this.hrtfEnabled && instance.pannerNode) {
      this.updateHRTF(instance.pannerNode, spatial);
    }
  }

  private calculateDirectivity(spatial: SpatialAudioConfig): number {
    const listenerToSource = {
      x: spatial.position.x - this.listenerPosition.x,
      y: spatial.position.y - this.listenerPosition.y,
      z: spatial.position.z - this.listenerPosition.z
    };

    const distance = Math.sqrt(listenerToSource.x ** 2 + listenerToSource.y ** 2 + listenerToSource.z ** 2);

    if (distance === 0) return 1.0;

    const normalizedDirection = {
      x: listenerToSource.x / distance,
      y: listenerToSource.y / distance,
      z: listenerToSource.z / distance
    };

    // Calculate angle between source direction and listener
    const dotProduct = normalizedDirection.x * this.listenerOrientation.forward.x +
                      normalizedDirection.y * this.listenerOrientation.forward.y +
                      normalizedDirection.z * this.listenerOrientation.forward.z;

    const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct)));

    // Apply directivity pattern
    switch (spatial.directivityPattern || 'omnidirectional') {
      case 'cardioid':
        return 0.5 + 0.5 * Math.cos(angle);
      case 'figure8':
        return Math.cos(angle);
      case 'custom':
        // Custom directivity calculation based on cone angles
        const innerAngle = (spatial.coneInnerAngle || 360) * Math.PI / 180;
        const outerAngle = (spatial.coneOuterAngle || 360) * Math.PI / 180;

        if (angle <= innerAngle) return 1.0;
        if (angle >= outerAngle) return spatial.coneOuterVolume || 0.0;

        const t = (angle - innerAngle) / (outerAngle - innerAngle);
        return 1.0 - t * (1.0 - (spatial.coneOuterVolume || 0.0));
      default: // omnidirectional
        return 1.0;
    }
  }

  private calculateAdvancedDopplerEffect(sourceVelocity: { x: number; y: number; z: number }, listenerVelocity: { x: number; y: number; z: number }): number {
    const speedOfSound = 343; // m/s
    const relativeVelocity = {
      x: sourceVelocity.x - listenerVelocity.x,
      y: sourceVelocity.y - listenerVelocity.y,
      z: sourceVelocity.z - listenerVelocity.z
    };

    const sourceToListener = {
      x: this.listenerPosition.x - sourceVelocity.x,
      y: this.listenerPosition.y - sourceVelocity.y,
      z: this.listenerPosition.z - sourceVelocity.z
    };

    const distance = Math.sqrt(sourceToListener.x ** 2 + sourceToListener.y ** 2 + sourceToListener.z ** 2);

    if (distance === 0) return 1.0;

    const normalizedDirection = {
      x: sourceToListener.x / distance,
      y: sourceToListener.y / distance,
      z: sourceToListener.z / distance
    };

    const projectedVelocity = relativeVelocity.x * normalizedDirection.x +
                             relativeVelocity.y * normalizedDirection.y +
                             relativeVelocity.z * normalizedDirection.z;

    return 1 + (projectedVelocity / speedOfSound);
  }

  private updateHRTF(pannerNode: PannerNode, spatial: SpatialAudioConfig): void {
    // Update HRTF parameters
    pannerNode.positionX.value = spatial.position.x;
    pannerNode.positionY.value = spatial.position.y;
    pannerNode.positionZ.value = spatial.position.z;

    const direction = (spatial as any).direction || { x: 0, y: 0, z: 0 };
    pannerNode.orientationX.value = direction.x;
    pannerNode.orientationY.value = direction.y;
    pannerNode.orientationZ.value = direction.z;

    pannerNode.refDistance = spatial.referenceDistance || 1;
    pannerNode.maxDistance = spatial.maxDistance || 10000;
    pannerNode.rolloffFactor = spatial.rolloffFactor || 1;
    pannerNode.coneInnerAngle = spatial.coneInnerAngle || 360;
    pannerNode.coneOuterAngle = spatial.coneOuterAngle || 360;
    pannerNode.coneOuterGain = spatial.coneOuterVolume || 0;
  }

  private calculateSpatialVolume(distance: number, baseVolume: number, spatial: SpatialAudioConfig): number {
    if (distance <= (spatial.referenceDistance || 1)) {
      return baseVolume;
    }

    const maxDistance = spatial.maxDistance || 100;
    const rolloffFactor = spatial.rolloffFactor || 1;

    // Inverse distance model (more realistic than inverse square)
    const attenuation = Math.min(1, (spatial.referenceDistance || 1) / (distance * rolloffFactor));
    return baseVolume * attenuation;
  }

  private calculateDistance(pos1: { x: number; y: number; z: number }, pos2: { x: number; y: number; z: number }): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
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
      hrtfEnabled: this.hrtfEnabled,
      reverbEnabled: this.reverbEnabled,
      fftEnabled: this.fftEnabled,
      masterVolume: this.masterVolume,
      audioContextState: this.audioContext?.state || 'none',
      sampleRate: this.audioContext?.sampleRate || 0,
      currentTime: this.audioContext?.currentTime || 0,
      listenerPosition: this.listenerPosition,
      listenerOrientation: this.listenerOrientation,
      headless: this.isHeadless,
      advancedFeatures: {
        directivityPatterns: true,
        dopplerEffects: true,
        hrtf: this.hrtfEnabled,
        reverb: this.reverbEnabled,
        audioAnalysis: this.fftEnabled
      }
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
      activeSounds.forEach((sound: any) => {
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