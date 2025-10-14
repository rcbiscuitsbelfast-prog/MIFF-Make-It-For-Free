/**
 * HapticsPure Manager - Advanced Haptic Feedback System
 *
 * Comprehensive haptic feedback system with:
 * - Multi-device support (gamepad, mobile, wearable)
 * - Advanced pattern generation and sequencing
 * - Environmental response system
 * - Rhythm engine for musical haptics
 * - Adaptive feedback based on context
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { StructuredLogger, LogLevel } from '../shared/logging/StructuredLogger';
import { PerformanceOptimizer } from '../shared/performance/PerformanceOptimizer';
import { MemoryManager } from '../shared/memory/MemoryManager';

export enum HapticDeviceType {
  GAMEPAD = 'gamepad',
  MOBILE = 'mobile',
  WEARABLE = 'wearable',
  CUSTOM = 'custom'
}

export enum HapticWaveform {
  SINE = 'sine',
  SQUARE = 'square',
  TRIANGLE = 'triangle',
  SAWTOOTH = 'sawtooth',
  PULSE = 'pulse',
  NOISE = 'noise'
}

export enum HapticEffect {
  BUZZ = 'buzz',
  CLICK = 'click',
  DOUBLE_CLICK = 'double_click',
  TICK = 'tick',
  THUMP = 'thump',
  HEAVY_CLICK = 'heavy_click',
  RELEASE = 'release',
  SPIN = 'spin',
  THUD = 'thud'
}

export enum HapticSequenceType {
  SIMPLE = 'simple',
  COMPLEX = 'complex',
  RHYTHMIC = 'rhythmic',
  ADAPTIVE = 'adaptive'
}

export type HapticPattern =
  | { type: 'impact'; style: 'light' | 'medium' | 'heavy'; location?: string }
  | { type: 'notification'; level: 'success' | 'warning' | 'error'; priority?: number }
  | { type: 'selection'; feedback?: 'light' | 'medium' | 'heavy' }
  | { type: 'custom'; durationMs: number; intensity: number; frequency?: number; waveform?: HapticWaveform }
  | { type: 'sequence'; effects: HapticEffect[]; timing: number[]; loop?: boolean; adaptive?: boolean }
  | { type: 'rhythmic'; bpm: number; pattern: string; measures?: number; intensity?: number }
  | { type: 'environmental'; condition: string; threshold: number; response: HapticPattern }
  | { type: 'adaptive'; basePattern: HapticPattern; modifiers: HapticModifier[] };

export interface HapticModifier {
  // Auto-added common properties
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
  condition: string;
  property: 'intensity' | 'frequency' | 'duration' | 'waveform';
  value: any;
  transition: 'immediate' | 'smooth' | 'fade';
  duration?: number;
}

export interface HapticRequest {
  // Auto-added common properties
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
  id: string;
  pattern: HapticPattern;
  at?: number; // epoch ms to trigger
  device?: HapticDeviceType;
  priority?: number;
  timeout?: number;
  metadata?: Record<string, any>;
}

export interface HapticResult {
  // Auto-added common properties
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
  id: string;
  status: 'scheduled' | 'played' | 'skipped' | 'error' | 'cancelled' | 'delayed';
  reason?: string;
  actualDuration?: number;
  actualIntensity?: number;
  deviceUsed?: HapticDeviceType;
  timestamp?: number;
}

export interface HapticDevice {
  // Auto-added common properties
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
  id: string;
  type: HapticDeviceType;
  name: string;
  capabilities: HapticCapabilities;
  connected: boolean;
  batteryLevel?: number;
  supportedWaveforms: HapticWaveform[];
  maxIntensity: number;
  maxFrequency: number;
  maxDuration: number;
}

export interface HapticCapabilities {
  // Auto-added common properties
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
  supportsWaveforms: boolean;
  supportsAmplitudeControl: boolean;
  supportsFrequencyControl: boolean;
  supportsDurationControl: boolean;
  supportsLocationControl: boolean;
  supportsMultipleActuators: boolean;
  maxSimultaneousEffects: number;
  supportedEffects: HapticEffect[];
  latency: number;
}

export interface HapticSequence {
  // Auto-added common properties
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
  id: string;
  name: string;
  type: HapticSequenceType;
  patterns: HapticPattern[];
  timing: number[];
  loop: boolean;
  adaptive: boolean;
  metadata?: Record<string, any>;
}

export interface HapticRhythmEngine {
  // Auto-added common properties
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
  id: string;
  name: string;
  bpm: number;
  timeSignature: [number, number];
  patterns: Map<string, HapticPattern[]>;
  currentPattern: string;
  playing: boolean;
  position: number; // current beat position
  intensity: number;
  adaptive: boolean;
}

export interface HapticEnvironmentalResponse {
  // Auto-added common properties
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
  condition: string; // e.g., 'collision', 'proximity', 'health_low'
  threshold: number;
  pattern: HapticPattern;
  cooldown: number;
  lastTriggered?: number;
}

export interface HapticsConfig {
  // Auto-added common properties
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
  enableHapticFeedback: boolean;
  enableEnvironmentalResponses: boolean;
  enableRhythmEngine: boolean;
  enableAdaptiveFeedback: boolean;
  maxConcurrentEffects: number;
  defaultIntensity: number;
  defaultDuration: number;
  enableDebugging: boolean;
  enableLogging: boolean;
  logLevel: LogLevel;
}

export class HapticsManager {
  private config: HapticsConfig;
  
  private memoryId: string;
  private queue: HapticRequest[] = [];
  private devices: Map<string, HapticDevice> = new Map();
  private sequences: Map<string, HapticSequence> = new Map();
  private rhythmEngines: Map<string, HapticRhythmEngine> = new Map();
  private environmentalResponses: HapticEnvironmentalResponse[] = [];
  private activeRequests: Map<string, HapticResult> = new Map();
  private priorityQueue: Map<number, HapticRequest[]> = new Map();
  private deviceCapabilities: Map<HapticDeviceType, HapticCapabilities> = new Map();
  private performanceOptimizer: PerformanceOptimizer;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(config: HapticsConfig = {
    enableHapticFeedback: true,
    enableEnvironmentalResponses: true,
    enableRhythmEngine: true,
    enableAdaptiveFeedback: true,
    maxConcurrentEffects: 4,
    defaultIntensity: 0.5,
    defaultDuration: 100,
    enableDebugging: false,
    enableLogging: true,
    logLevel: LogLevel.INFO
  }) {
    this.config = config;

    // Initialize structured logging
    this.logger = new StructuredLogger({
      level: config.logLevel,
      enableConsole: config.enableLogging,
      performanceMonitoring: true,
      modules: {
        'HapticsManager': LogLevel.DEBUG
      }
    });

    // Initialize performance optimizer
    this.performanceOptimizer = new PerformanceOptimizer({
      enableOptimization: true,
      enableMemoryOptimization: true,
      enableCPUOptimization: true,
      enableGPUOptimization: false,
      enableNetworkOptimization: false
    });

    // Register with memory manager
    this.memoryId = `HapticsManager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    MemoryManager.registerObject(this.memoryId, this, 'HapticsManager');

    this.initializeDefaultDevices();
    this.initializeDeviceCapabilities();
    this.initializeEnvironmentalResponses();
    this.startUpdateLoop();

    console.info('HapticsManager initialized', {
      config: this.config,
      memoryId: this.memoryId
    });
  }

  /**
   * Start haptic feedback system
   */
  public start(): void {
    if (this.updateInterval) {
      console.warn('HapticsPure', 'Haptic system is already running');
      return;
    }

    console.info('HapticsPure', 'Starting haptic feedback system');
    this.startUpdateLoop();
  }

  /**
   * Stop haptic feedback system
   */
  public stop(): void {
    if (!this.updateInterval) {
      console.warn('HapticsPure', 'Haptic system is not running');
      return;
    }

    console.info('HapticsPure', 'Stopping haptic feedback system');

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Cancel all active requests
    this.cancelAllRequests();
  }

  /**
   * Start update loop
   */
  private startUpdateLoop(): void {
    this.updateInterval = setInterval(() => {
      this.processQueue();
      this.updateRhythmEngines();
      this.checkEnvironmentalResponses();
    }, 16); // 60 FPS
  }

  /**
   * Play haptic pattern
   */
  public playPattern(pattern: HapticPattern, deviceType?: HapticDeviceType, priority: number = 1): string {
    if (!this.config.enableHapticFeedback) {
      console.warn('HapticsPure', 'Haptic feedback is disabled');
      return '';
    }

    const requestId = `haptic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const request: HapticRequest = {
      id: requestId,
      pattern,
      device: deviceType,
      priority,
      metadata: {}
    };

    this.queue.push(request);
    console.debug('Haptic pattern queued', { requestId, pattern: pattern.type, priority });

    return requestId;
  }

  /**
   * Play haptic effect
   */
  public playEffect(effect: HapticEffect, intensity: number = this.config.defaultIntensity, duration: number = this.config.defaultDuration): string {
    const pattern: HapticPattern = {
      type: 'custom',
      durationMs: duration,
      intensity,
      waveform: HapticWaveform.PULSE
    };

    return this.playPattern(pattern);
  }

  /**
   * Play impact haptic
   */
  public playImpact(style: 'light' | 'medium' | 'heavy', location?: string): string {
    const pattern: HapticPattern = {
      type: 'impact',
      style,
      location
    };

    return this.playPattern(pattern);
  }

  /**
   * Play notification haptic
   */
  public playNotification(level: 'success' | 'warning' | 'error', priority: number = 1): string {
    const pattern: HapticPattern = {
      type: 'notification',
      level,
      priority
    };

    return this.playPattern(pattern, undefined, priority);
  }

  /**
   * Play selection haptic
   */
  public playSelection(feedback: 'light' | 'medium' | 'heavy' = 'light'): string {
    const pattern: HapticPattern = {
      type: 'selection',
      feedback
    };

    return this.playPattern(pattern);
  }

  /**
   * Create haptic sequence
   */
  public createSequence(name: string, patterns: HapticPattern[], timing: number[], loop: boolean = false, adaptive: boolean = false): string {
    const sequenceId = `sequence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sequence: HapticSequence = {
      id: sequenceId,
      name,
      type: adaptive ? HapticSequenceType.ADAPTIVE : HapticSequenceType.SIMPLE,
      patterns,
      timing,
      loop,
      adaptive
    };

    this.sequences.set(sequenceId, sequence);
    console.info('Haptic sequence created', { sequenceId, name, patternCount: patterns.length });

    return sequenceId;
  }

  /**
   * Play haptic sequence
   */
  public playSequence(sequenceId: string, intensity: number = this.config.defaultIntensity): string {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      console.warn('Haptic sequence not found', { sequenceId });
      return '';
    }

    const requestId = `sequence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let currentPatternIndex = 0;

    const playNextPattern = () => {
      if (currentPatternIndex >= sequence.patterns.length) {
        if (sequence.loop) {
          currentPatternIndex = 0;
        } else {
          return;
        }
      }

      const pattern = sequence.patterns[currentPatternIndex];
      const delay = sequence.timing[currentPatternIndex] || 0;

      setTimeout(() => {
        this.playPattern(pattern);
        currentPatternIndex++;
        playNextPattern();
      }, delay);
    };

    playNextPattern();
    console.info('Haptic sequence started', { sequenceId, requestId });

    return requestId;
  }

  /**
   * Create rhythm engine
   */
  public createRhythmEngine(name: string, bpm: number, timeSignature: [number, number] = [4, 4]): string {
    const engineId = `rhythm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const engine: HapticRhythmEngine = {
      id: engineId,
      name,
      bpm,
      timeSignature,
      patterns: new Map(),
      currentPattern: 'default',
      playing: false,
      position: 0,
      intensity: this.config.defaultIntensity,
      adaptive: false
    };

    this.rhythmEngines.set(engineId, engine);
    console.info('Rhythm engine created', { engineId, name, bpm });

    return engineId;
  }

  /**
   * Add pattern to rhythm engine
   */
  public addRhythmPattern(engineId: string, patternName: string, patterns: HapticPattern[]): boolean {
    const engine = this.rhythmEngines.get(engineId);
    if (!engine) {
      console.warn('Rhythm engine not found', { engineId });
      return false;
    }

    engine.patterns.set(patternName, patterns);
    console.debug('Rhythm pattern added', { engineId, patternName, patternCount: patterns.length });
    return true;
  }

  /**
   * Start rhythm engine
   */
  public startRhythmEngine(engineId: string, patternName?: string): boolean {
    const engine = this.rhythmEngines.get(engineId);
    if (!engine) {
      console.warn('Rhythm engine not found', { engineId });
      return false;
    }

    if (patternName) {
      engine.currentPattern = patternName;
    }

    engine.playing = true;
    engine.position = 0;
    console.info('Rhythm engine started', { engineId, pattern: engine.currentPattern });
    return true;
  }

  /**
   * Stop rhythm engine
   */
  public stopRhythmEngine(engineId: string): boolean {
    const engine = this.rhythmEngines.get(engineId);
    if (!engine) {
      console.warn('Rhythm engine not found', { engineId });
      return false;
    }

    engine.playing = false;
    console.info('Rhythm engine stopped', { engineId });
    return true;
  }

  /**
   * Add environmental response
   */
  public addEnvironmentalResponse(condition: string, threshold: number, pattern: HapticPattern, cooldown: number = 1000): void {
    const response: HapticEnvironmentalResponse = {
      condition,
      threshold,
      pattern,
      cooldown
    };

    this.environmentalResponses.push(response);
    console.info('Environmental response added', { condition, threshold, cooldown });
  }

  /**
   * Trigger environmental response
   */
  public triggerEnvironmentalResponse(condition: string, value: number): void {
    if (!this.config.enableEnvironmentalResponses) return;

    const response = this.environmentalResponses.find(r => r.condition === condition);
    if (!response) return;

    if (value < response.threshold) return;

    const now = Date.now();
    if (response.lastTriggered && now - response.lastTriggered < response.cooldown) return;

    response.lastTriggered = now;
    this.playPattern(response.pattern);
    console.debug('Environmental response triggered', { condition, value, threshold: response.threshold });
  }

  /**
   * Register haptic device
   */
  public registerDevice(device: HapticDevice): void {
    this.devices.set(device.id, device);
    console.info('Haptic device registered', { deviceId: device.id, type: device.type, name: device.name });
  }

  /**
   * Unregister haptic device
   */
  public unregisterDevice(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device) {
      console.warn('Haptic device not found', { deviceId });
      return false;
    }

    this.devices.delete(deviceId);
    console.info('Haptic device unregistered', { deviceId, type: device.type });
    return true;
  }

  /**
   * Get available devices
   */
  public getAvailableDevices(): HapticDevice[] {
    return Array.from(this.devices.values()).filter(device => device.connected);
  }

  /**
   * Get device by ID
   */
  public getDevice(deviceId: string): HapticDevice | null {
    return this.devices.get(deviceId) || null;
  }

  /**
   * Cancel haptic request
   */
  public cancelRequest(requestId: string): boolean {
    const requestIndex = this.queue.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
      console.warn('Haptic request not found', { requestId });
      return false;
    }

    this.queue.splice(requestIndex, 1);
    console.debug('Haptic request cancelled', { requestId });
    return true;
  }

  /**
   * Cancel all haptic requests
   */
  public cancelAllRequests(): void {
    this.queue = [];
    this.activeRequests.clear();
    console.info('HapticsPure', 'All haptic requests cancelled');
  }

  /**
   * Process haptic queue
   */
  private processQueue(): void {
    if (this.queue.length === 0) return;

    // Sort by priority (higher priority first)
    this.queue.sort((a, b) => (b.priority || 1) - (a.priority || 1));

    // Process up to max concurrent effects
    const activeCount = this.activeRequests.size;
    const maxConcurrent = this.config.maxConcurrentEffects;
    
    if (activeCount >= maxConcurrent) return;

    const request = this.queue.shift();
    if (!request) return;

    this.executeHapticRequest(request);
  }

  /**
   * Execute haptic request
   */
  private executeHapticRequest(request: HapticRequest): void {
    const device = this.selectDevice(request.device);
    if (!device) {
      console.warn('No suitable device found for haptic request', { requestId: request.id });
      return;
    }

    const result: HapticResult = {
      id: request.id,
      status: 'played',
      deviceUsed: device.type,
      timestamp: Date.now()
    };

    this.activeRequests.set(request.id, result);

    // Simulate haptic execution
    this.simulateHapticExecution(request, device, result);

    console.debug('Haptic request executed', { requestId: request.id, deviceId: device.id });
  }

  /**
   * Select appropriate device for request
   */
  private selectDevice(preferredType?: HapticDeviceType): HapticDevice | null {
    const availableDevices = Array.from(this.devices.values()).filter(device => device.connected);
    
    if (preferredType) {
      const preferredDevice = availableDevices.find(device => device.type === preferredType);
      if (preferredDevice) return preferredDevice;
    }

    return availableDevices[0] || null;
  }

  /**
   * Simulate haptic execution
   */
  private simulateHapticExecution(request: HapticRequest, device: HapticDevice, result: HapticResult): void {
    // Simulate haptic duration based on pattern
    let duration = 100; // default
    
    if (request.pattern.type === 'custom') {
      duration = request.pattern.durationMs;
    } else if (request.pattern.type === 'impact') {
      duration = request.pattern.style === 'light' ? 50 : request.pattern.style === 'medium' ? 100 : 200;
    }

    // Simulate execution time
    setTimeout(() => {
      result.status = 'played';
      result.actualDuration = duration;
      this.activeRequests.delete(request.id);
    }, duration);
  }

  /**
   * Update rhythm engines
   */
  private updateRhythmEngines(): void {
    for (const engine of this.rhythmEngines.values()) {
      if (!engine.playing) continue;

      const beatDuration = 60000 / engine.bpm; // milliseconds per beat
      const now = Date.now();
      
      // Update position based on time
      engine.position = (now % (beatDuration * engine.timeSignature[0])) / beatDuration;

      // Play patterns at beat positions
      const patterns = engine.patterns.get(engine.currentPattern);
      if (patterns && patterns.length > 0) {
        const beatIndex = Math.floor(engine.position);
        if (beatIndex < patterns.length) {
          const pattern = patterns[beatIndex];
          this.playPattern(pattern);
        }
      }
    }
  }

  /**
   * Check environmental responses
   */
  private checkEnvironmentalResponses(): void {
    // This would integrate with actual game state monitoring
    // For now, it's a placeholder for the environmental response system
  }

  /**
   * Initialize default devices
   */
  private initializeDefaultDevices(): void {
    const defaultDevices: HapticDevice[] = [
      {
        id: 'default_gamepad',
        type: HapticDeviceType.GAMEPAD,
        name: 'Gamepad',
        capabilities: {
          supportsWaveforms: true,
          supportsAmplitudeControl: true,
          supportsFrequencyControl: true,
          supportsDurationControl: true,
          supportsLocationControl: false,
          supportsMultipleActuators: false,
          maxSimultaneousEffects: 1,
          supportedEffects: [HapticEffect.BUZZ, HapticEffect.CLICK, HapticEffect.THUMP],
          latency: 5
        },
        connected: false,
        supportedWaveforms: [HapticWaveform.SINE, HapticWaveform.SQUARE],
        maxIntensity: 1.0,
        maxFrequency: 1000,
        maxDuration: 5000
      },
      {
        id: 'default_mobile',
        type: HapticDeviceType.MOBILE,
        name: 'Mobile Device',
        capabilities: {
          supportsWaveforms: true,
          supportsAmplitudeControl: true,
          supportsFrequencyControl: false,
          supportsDurationControl: true,
          supportsLocationControl: true,
          supportsMultipleActuators: true,
          maxSimultaneousEffects: 4,
          supportedEffects: Object.values(HapticEffect),
          latency: 10
        },
        connected: true,
        supportedWaveforms: [HapticWaveform.SINE, HapticWaveform.PULSE],
        maxIntensity: 1.0,
        maxFrequency: 300,
        maxDuration: 10000
      }
    ];

    defaultDevices.forEach(device => this.registerDevice(device));
  }

  /**
   * Initialize device capabilities
   */
  private initializeDeviceCapabilities(): void {
    // Initialize default capabilities for each device type
    this.deviceCapabilities.set(HapticDeviceType.GAMEPAD, {
      supportsWaveforms: true,
      supportsAmplitudeControl: true,
      supportsFrequencyControl: true,
      supportsDurationControl: true,
      supportsLocationControl: false,
      supportsMultipleActuators: false,
      maxSimultaneousEffects: 1,
      supportedEffects: [HapticEffect.BUZZ, HapticEffect.CLICK, HapticEffect.THUMP],
      latency: 5
    });

    this.deviceCapabilities.set(HapticDeviceType.MOBILE, {
      supportsWaveforms: true,
      supportsAmplitudeControl: true,
      supportsFrequencyControl: false,
      supportsDurationControl: true,
      supportsLocationControl: true,
      supportsMultipleActuators: true,
      maxSimultaneousEffects: 4,
      supportedEffects: Object.values(HapticEffect),
      latency: 10
    });
  }

  /**
   * Initialize environmental responses
   */
  private initializeEnvironmentalResponses(): void {
    // Add default environmental responses
    this.addEnvironmentalResponse('collision', 0.5, {
      type: 'impact',
      style: 'medium'
    });

    this.addEnvironmentalResponse('health_low', 0.2, {
      type: 'notification',
      level: 'warning'
    });

    this.addEnvironmentalResponse('achievement', 1.0, {
      type: 'notification',
      level: 'success'
    });
  }

  /**
   * Get haptic statistics
   */
  public getHapticStats(): any {
    return {
      activeRequests: this.activeRequests.size,
      queuedRequests: this.queue.length,
      registeredDevices: this.devices.size,
      connectedDevices: Array.from(this.devices.values()).filter(d => d.connected).length,
      sequences: this.sequences.size,
      rhythmEngines: this.rhythmEngines.size,
      environmentalResponses: this.environmentalResponses.length
    };
  }

  /**
   * Get manager configuration
   */
  public getConfig(): HapticsConfig {
    return { ...this.config };
  }

  /**
   * Update manager configuration
   */
  public updateConfig(newConfig: Partial<HapticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.info('HapticsManager configuration updated', { config: this.config });
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stop();
    MemoryManager.unregisterObject(this.memoryId);
    console.info('HapticsPure', 'HapticsManager destroyed');
  }
}