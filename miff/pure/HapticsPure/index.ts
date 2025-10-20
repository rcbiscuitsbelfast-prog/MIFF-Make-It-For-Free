// HapticsPure - Advanced haptic feedback system for MIFF framework
// Schema Version: v1

import { Logger } from '../shared/logging';

const logger = Logger.create('Haptics');

export enum HapticDeviceType {
  GAMEPAD = 'gamepad',
  MOBILE = 'mobile',
  WEARABLE = 'wearable',
  VR_CONTROLLER = 'vr_controller',
  STEERING_WHEEL = 'steering_wheel',
  FLIGHT_STICK = 'flight_stick',
  CUSTOM = 'custom'
}

export enum HapticPatternType {
  CONSTANT = 'constant',
  RAMP_UP = 'ramp_up',
  RAMP_DOWN = 'ramp_down',
  PULSE = 'pulse',
  CLICK = 'click',
  BUZZ = 'buzz',
  RUMBLE = 'rumble',
  HEARTBEAT = 'heartbeat',
  EXPLOSION = 'explosion',
  IMPACT = 'impact',
  TEXTURE = 'texture',
  CUSTOM = 'custom'
}

export enum HapticWaveform {
  SINE = 'sine',
  SQUARE = 'square',
  TRIANGLE = 'triangle',
  SAWTOOTH = 'sawtooth',
  CUSTOM = 'custom'
}

export enum HapticPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent'
}

export enum HapticTarget {
  LEFT_TRIGGER = 'left_trigger',
  RIGHT_TRIGGER = 'right_trigger',
  LEFT_RUMBLE = 'left_rumble',
  RIGHT_RUMBLE = 'right_rumble',
  BOTH_TRIGGERS = 'both_triggers',
  BOTH_RUMBLES = 'both_rumbles',
  ALL = 'all',
  CUSTOM = 'custom'
}

export interface HapticDevice {
  id: string;
  name: string;
  type: HapticDeviceType;
  capabilities: HapticCapabilities;
  isConnected: boolean;
  isActive: boolean;
  batteryLevel?: number;
  supportedPatterns: HapticPatternType[];
  maxAmplitude: number;
  maxFrequency: number;
  metadata: Record<string, any>;
}

export interface HapticCapabilities {
  supportsAmplitude: boolean;
  supportsFrequency: boolean;
  supportsWaveform: boolean;
  supportsTriggerFeedback: boolean;
  supportsCustomPatterns: boolean;
  supportsSpatialAudio: boolean;
  maxSimultaneousEffects: number;
  supportedWaveforms: HapticWaveform[];
  supportedTargets: HapticTarget[];
}

export interface HapticPattern {
  id: string;
  name: string;
  type: HapticPatternType;
  description: string;
  duration: number; // milliseconds
  waveform: HapticWaveform;
  amplitude: number; // 0-1
  frequency: number; // Hz
  priority: HapticPriority;
  targets: HapticTarget[];
  sequence: HapticSequenceItem[];
  cooldown: number; // milliseconds
  reusable: boolean;
  tags: string[];
  metadata: Record<string, any>;
}

export interface HapticSequenceItem {
  timeOffset: number; // milliseconds from pattern start
  amplitude: number; // 0-1
  frequency: number; // Hz
  duration: number; // milliseconds
  waveform?: HapticWaveform;
  target?: HapticTarget;
}

export interface HapticEffect {
  id: string;
  patternId: string;
  instanceId: string;
  deviceId: string;
  startTime: number;
  endTime?: number;
  duration: number;
  amplitude: number;
  frequency: number;
  priority: HapticPriority;
  status: 'pending' | 'playing' | 'completed' | 'cancelled' | 'failed';
  progress: number; // 0-1
  metadata: Record<string, any>;
}

export interface HapticEnvironment {
  id: string;
  name: string;
  type: 'game' | 'menu' | 'loading' | 'cutscene' | 'combat' | 'exploration' | 'custom';
  devices: string[];
  patterns: HapticPattern[];
  settings: HapticEnvironmentSettings;
  activeEffects: string[];
  priorityQueue: HapticEffect[];
}

export interface HapticEnvironmentSettings {
  masterVolume: number; // 0-1
  masterIntensity: number; // 0-1
  frequencyRange: { min: number; max: number };
  amplitudeRange: { min: number; max: number };
  priorityThreshold: HapticPriority;
  maxConcurrentEffects: number;
  effectTimeout: number; // milliseconds
  enableAdaptiveFeedback: boolean;
  enableEnvironmentalHaptics: boolean;
  enableGestureFeedback: boolean;
}

export interface HapticEvent {
  id: string;
  type: 'pattern' | 'sequence' | 'effect' | 'device' | 'environment' | 'system';
  timestamp: number;
  source: string;
  target: string;
  data: Record<string, any>;
  priority: HapticPriority;
  processed: boolean;
}

export interface HapticGesture {
  id: string;
  name: string;
  type: 'tap' | 'swipe' | 'pinch' | 'rotate' | 'long_press' | 'multi_touch' | 'custom';
  duration: number;
  intensity: number;
  pattern: HapticPattern;
  requirements: GestureRequirement[];
  feedback: HapticFeedback;
}

export interface GestureRequirement {
  type: 'fingers' | 'pressure' | 'velocity' | 'distance' | 'angle' | 'custom';
  minValue: number;
  maxValue: number;
  description: string;
}

export interface HapticFeedback {
  pattern: HapticPattern;
  delay: number;
  duration: number;
  intensity: number;
  conditions: string[];
}

export interface HapticProfile {
  id: string;
  name: string;
  description: string;
  deviceType: HapticDeviceType;
  settings: HapticProfileSettings;
  patterns: HapticPattern[];
  environments: string[];
  isDefault: boolean;
  isReadOnly: boolean;
}

export interface HapticProfileSettings {
  masterVolume: number;
  masterIntensity: number;
  frequencyMultiplier: number;
  amplitudeMultiplier: number;
  effectDurationMultiplier: number;
  priorityThreshold: HapticPriority;
  enableCustomPatterns: boolean;
  enableEnvironmentalFeedback: boolean;
  enableGestureFeedback: boolean;
  enableAdaptiveFeedback: boolean;
}

export interface HapticStatistics {
  totalEffects: number;
  activeEffects: number;
  completedEffects: number;
  failedEffects: number;
  averageEffectDuration: number;
  averageAmplitude: number;
  averageFrequency: number;
  deviceUsage: Map<string, number>;
  patternUsage: Map<string, number>;
  environmentUsage: Map<string, number>;
  errors: string[];
  performanceScore: number;
}

export interface HapticConfiguration {
  globalSettings: HapticGlobalSettings;
  deviceProfiles: Map<string, HapticProfile>;
  defaultPatterns: Map<string, HapticPattern>;
  customPatterns: Map<string, HapticPattern>;
  environments: Map<string, HapticEnvironment>;
  eventHistory: HapticEvent[];
  statistics: HapticStatistics;
}

export interface HapticGlobalSettings {
  masterVolume: number;
  masterIntensity: number;
  enableAllDevices: boolean;
  enableEnvironmentalHaptics: boolean;
  enableGestureFeedback: boolean;
  enableAdaptiveFeedback: boolean;
  maxConcurrentEffects: number;
  defaultPriority: HapticPriority;
  effectTimeout: number;
  performanceMode: 'quality' | 'balanced' | 'performance';
  debugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export interface HapticResponse {
  id: string;
  effectId: string;
  deviceId: string;
  timestamp: number;
  success: boolean;
  error?: string;
  duration: number;
  amplitude: number;
  frequency: number;
  metadata: Record<string, any>;
}

export class HapticEngine {
  private devices: Map<string, HapticDevice> = new Map();
  private patterns: Map<string, HapticPattern> = new Map();
  private environments: Map<string, HapticEnvironment> = new Map();
  private activeEffects: Map<string, HapticEffect> = new Map();
  private eventQueue: HapticEvent[] = new Map();
  private configuration: HapticConfiguration;
  private performanceMetrics: HapticPerformanceMetrics;
  private deviceConnections: Map<string, WebSocket | EventTarget> = new Map();
  private gestureRecognizer: HapticGestureRecognizer;
  private isInitialized = false;

  constructor() {
    this.configuration = this.createDefaultConfiguration();
    this.performanceMetrics = this.initializePerformanceMetrics();
    this.gestureRecognizer = new HapticGestureRecognizer();
    this.initializeHapticSystem();
  }

  private createDefaultConfiguration(): HapticConfiguration {
    return {
      globalSettings: {
        masterVolume: 0.8,
        masterIntensity: 0.8,
        enableAllDevices: true,
        enableEnvironmentalHaptics: true,
        enableGestureFeedback: true,
        enableAdaptiveFeedback: true,
        maxConcurrentEffects: 16,
        defaultPriority: HapticPriority.MEDIUM,
        effectTimeout: 5000,
        performanceMode: 'balanced',
        debugMode: false,
        logLevel: 'info'
      },
      deviceProfiles: new Map(),
      defaultPatterns: new Map(),
      customPatterns: new Map(),
      environments: new Map(),
      eventHistory: [],
      statistics: this.createEmptyStatistics()
    };
  }

  private createEmptyStatistics(): HapticStatistics {
    return {
      totalEffects: 0,
      activeEffects: 0,
      completedEffects: 0,
      failedEffects: 0,
      averageEffectDuration: 0,
      averageAmplitude: 0,
      averageFrequency: 0,
      deviceUsage: new Map(),
      patternUsage: new Map(),
      environmentUsage: new Map(),
      errors: [],
      performanceScore: 100
    };
  }

  private initializePerformanceMetrics(): HapticPerformanceMetrics {
    return {
      totalEvents: 0,
      processedEvents: 0,
      failedEvents: 0,
      averageProcessingTime: 0,
      peakConcurrentEffects: 0,
      deviceConnectionTime: 0,
      gestureRecognitionAccuracy: 0,
      adaptiveFeedbackScore: 0,
      systemLatency: 0,
      memoryUsage: 0
    };
  }

  private async initializeHapticSystem(): Promise<void> {
    try {
      logger.info('Initializing haptic system');

      // Initialize default patterns
      await this.initializeDefaultPatterns();

      // Initialize default environments
      await this.initializeDefaultEnvironments();

      // Connect to available devices
      await this.discoverDevices();

      // Start event processing
      this.startEventProcessing();

      this.isInitialized = true;
      logger.info('Haptic system initialized successfully');
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to initialize haptic system', { error: err });
      throw new Error(`Haptic initialization failed: ${error}`);
    }
  }

  private async initializeDefaultPatterns(): Promise<void> {
    const defaultPatterns: HapticPattern[] = [
      {
        id: 'click_light',
        name: 'Light Click',
        type: HapticPatternType.CLICK,
        description: 'Light click feedback',
        duration: 50,
        waveform: HapticWaveform.SQUARE,
        amplitude: 0.3,
        frequency: 150,
        priority: HapticPriority.LOW,
        targets: [HapticTarget.ALL],
        sequence: [
          { timeOffset: 0, amplitude: 0.3, frequency: 150, duration: 50 }
        ],
        cooldown: 100,
        reusable: true,
        tags: ['ui', 'button', 'light'],
        metadata: {}
      },
      {
        id: 'rumble_impact',
        name: 'Impact Rumble',
        type: HapticPatternType.RUMBLE,
        description: 'Strong impact feedback',
        duration: 200,
        waveform: HapticWaveform.SINE,
        amplitude: 0.8,
        frequency: 50,
        priority: HapticPriority.HIGH,
        targets: [HapticTarget.BOTH_RUMBLES],
        sequence: [
          { timeOffset: 0, amplitude: 0.8, frequency: 50, duration: 100 },
          { timeOffset: 100, amplitude: 0.4, frequency: 30, duration: 100 }
        ],
        cooldown: 500,
        reusable: true,
        tags: ['combat', 'impact', 'damage'],
        metadata: {}
      },
      {
        id: 'heartbeat',
        name: 'Heartbeat',
        type: HapticPatternType.HEARTBEAT,
        description: 'Heartbeat rhythm',
        duration: 1000,
        waveform: HapticWaveform.SINE,
        amplitude: 0.5,
        frequency: 60, // 60 BPM
        priority: HapticPriority.MEDIUM,
        targets: [HapticTarget.LEFT_RUMBLE],
        sequence: [
          { timeOffset: 0, amplitude: 0.5, frequency: 60, duration: 100 },
          { timeOffset: 500, amplitude: 0.3, frequency: 60, duration: 100 },
          { timeOffset: 900, amplitude: 0.5, frequency: 60, duration: 100 }
        ],
        cooldown: 2000,
        reusable: true,
        tags: ['health', 'tension', 'rhythm'],
        metadata: {}
      }
    ];

    for (const pattern of defaultPatterns) {
      this.patterns.set(pattern.id, pattern);
      this.configuration.defaultPatterns.set(pattern.id, pattern);
    }
  }

  private async initializeDefaultEnvironments(): Promise<void> {
    const defaultEnvironments: HapticEnvironment[] = [
      {
        id: 'game_environment',
        name: 'Game Environment',
        type: 'game',
        devices: [],
        patterns: Array.from(this.configuration.defaultPatterns.values()),
        settings: {
          masterVolume: 0.8,
          masterIntensity: 0.8,
          frequencyRange: { min: 20, max: 300 },
          amplitudeRange: { min: 0.1, max: 1.0 },
          priorityThreshold: HapticPriority.MEDIUM,
          maxConcurrentEffects: 8,
          effectTimeout: 3000,
          enableAdaptiveFeedback: true,
          enableEnvironmentalHaptics: true,
          enableGestureFeedback: true
        },
        activeEffects: [],
        priorityQueue: []
      },
      {
        id: 'menu_environment',
        name: 'Menu Environment',
        type: 'menu',
        devices: [],
        patterns: Array.from(this.configuration.defaultPatterns.values()).filter((p: any) => p.tags.includes('ui')),
        settings: {
          masterVolume: 0.6,
          masterIntensity: 0.4,
          frequencyRange: { min: 100, max: 200 },
          amplitudeRange: { min: 0.1, max: 0.5 },
          priorityThreshold: HapticPriority.LOW,
          maxConcurrentEffects: 4,
          effectTimeout: 1000,
          enableAdaptiveFeedback: false,
          enableEnvironmentalHaptics: false,
          enableGestureFeedback: true
        },
        activeEffects: [],
        priorityQueue: []
      }
    ];

    for (const environment of defaultEnvironments) {
      this.environments.set(environment.id, environment);
      this.configuration.environments.set(environment.id, environment);
    }
  }

  private async discoverDevices(): Promise<void> {
    logger.info('Discovering haptic devices');

    try {
      // Check for gamepad support
      if ('getGamepads' in navigator) {
        const gamepads = (navigator as any).getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
          const gamepad = gamepads[i];
          if (gamepad && gamepad.vibrationActuator) {
            await this.registerDevice({
              id: `gamepad_${i}`,
              name: gamepad.id,
              type: HapticDeviceType.GAMEPAD,
              capabilities: {
                supportsAmplitude: true,
                supportsFrequency: false,
                supportsWaveform: false,
                supportsTriggerFeedback: false,
                supportsCustomPatterns: false,
                supportsSpatialAudio: false,
                maxSimultaneousEffects: 1,
                supportedWaveforms: [HapticWaveform.SQUARE],
                supportedTargets: [HapticTarget.BOTH_RUMBLES]
              },
              isConnected: true,
              isActive: true,
              supportedPatterns: [HapticPatternType.RUMBLE, HapticPatternType.CLICK],
              maxAmplitude: 1.0,
              maxFrequency: 100,
              metadata: { gamepadIndex: i }
            });
          }
        }
      }

      // Check for mobile device
      if ('vibrate' in navigator) {
        await this.registerDevice({
          id: 'mobile_device',
          name: 'Mobile Device',
          type: HapticDeviceType.MOBILE,
          capabilities: {
            supportsAmplitude: false,
            supportsFrequency: false,
            supportsWaveform: false,
            supportsTriggerFeedback: false,
            supportsCustomPatterns: false,
            supportsSpatialAudio: false,
            maxSimultaneousEffects: 1,
            supportedWaveforms: [HapticWaveform.SQUARE],
            supportedTargets: [HapticTarget.ALL]
          },
          isConnected: true,
          isActive: true,
          supportedPatterns: [HapticPatternType.CLICK, HapticPatternType.BUZZ],
          maxAmplitude: 1.0,
          maxFrequency: 100,
          metadata: { platform: 'mobile' }
        });
      }

      logger.info('Haptic devices discovered', { deviceCount: this.devices.size });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.warn('Haptic device discovery failed', { error: err });
    }
  }

  private async registerDevice(deviceInfo: HapticDevice): Promise<void> {
    this.devices.set(deviceInfo.id, deviceInfo);

    // Create device profile
    const profile: HapticProfile = {
      id: `${deviceInfo.id}_profile`,
      name: `${deviceInfo.name} Profile`,
      description: `Default profile for ${deviceInfo.name}`,
      deviceType: deviceInfo.type,
      settings: {
        masterVolume: 0.8,
        masterIntensity: 0.8,
        frequencyMultiplier: 1.0,
        amplitudeMultiplier: 1.0,
        effectDurationMultiplier: 1.0,
        priorityThreshold: HapticPriority.MEDIUM,
        enableCustomPatterns: deviceInfo.capabilities.supportsCustomPatterns,
        enableEnvironmentalFeedback: deviceInfo.capabilities.supportsSpatialAudio,
        enableGestureFeedback: true,
        enableAdaptiveFeedback: true
      },
      patterns: deviceInfo.supportedPatterns.map(patternType => {
        const defaultPattern = this.configuration.defaultPatterns.get(`${patternType}_default`);
        return defaultPattern || this.createDefaultPatternForType(patternType);
      }),
      environments: ['game_environment'],
      isDefault: true,
      isReadOnly: false
    };

    this.configuration.deviceProfiles.set(deviceInfo.id, profile);
    logger.info('Haptic device registered', { deviceName: deviceInfo.name, deviceType: deviceInfo.type });
  }

  private createDefaultPatternForType(patternType: HapticPatternType): HapticPattern {
    const basePattern: HapticPattern = {
      id: `${patternType}_default`,
      name: `${patternType} Default`,
      type: patternType,
      description: `Default ${patternType} pattern`,
      duration: 100,
      waveform: HapticWaveform.SQUARE,
      amplitude: 0.5,
      frequency: 100,
      priority: HapticPriority.MEDIUM,
      targets: [HapticTarget.ALL],
      sequence: [
        { timeOffset: 0, amplitude: 0.5, frequency: 100, duration: 100 }
      ],
      cooldown: 200,
      reusable: true,
      tags: [patternType],
      metadata: {}
    };

    return basePattern;
  }

  private startEventProcessing(): void {
    setInterval(() => {
      this.processEventQueue();
    }, 16); // 60 FPS

    setInterval(() => {
      this.updateActiveEffects();
    }, 100); // 10 FPS for effect updates
  }

  // Core haptic functionality
  async playPattern(patternId: string, deviceId?: string, options?: PlayOptions): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('HapticEngine not initialized');
    }

    const pattern = this.patterns.get(patternId);
    if (!pattern) {
      throw new Error(`Pattern not found: ${patternId}`);
    }

    const device = device.id ? this.devices.get(device.id) : this.getBestAvailableDevice(pattern);
    if (!device || !device.isConnected) {
      throw new Error(`No suitable device found for pattern: ${patternId}`);
    }

    const effectId = `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const effect: HapticEffect = {
      id: effectId,
      patternId,
      instanceId: effectId,
      deviceId: device.id,
      startTime: new Date(),
      duration: pattern.duration,
      amplitude: options?.amplitude || pattern.amplitude,
      frequency: options?.frequency || pattern.frequency,
      priority: options?.priority || pattern.priority,
      status: 'pending',
      progress: 0,
      metadata: options?.metadata || {}
    };

    this.activeEffects.set(effectId, effect);
    this.configuration.statistics.activeEffects++;

    // Queue for processing
    await this.queueEffect(effect);

    logger.info('Playing haptic pattern', { patternName: pattern.name, deviceName: device.name });
    return effectId;
  }

  private getBestAvailableDevice(pattern: HapticPattern): HapticDevice | null {
    for (const device of this.devices.values()) {
      if (device.isConnected && device.isActive &&
          device.supportedPatterns.includes(pattern.type)) {
        return device;
      }
    }
    return null;
  }

  private async queueEffect(effect: HapticEffect): Promise<void> {
    // Add to event queue for processing
    const event: HapticEvent = {
      id: `event_${effect.id}`,
      type: 'effect',
      timestamp: new Date(),
      source: 'haptic_engine',
      target: effect.device.id,
      data: { effect },
      priority: effect.priority,
      processed: false
    };

    // Priority-based insertion
    const insertIndex = this.findEventInsertPosition(event);
    this.eventQueue.splice(insertIndex, 0, event);

    // Limit queue size
    if (this.eventQueue.length > 1000) {
      this.eventQueue = this.eventQueue.slice(-500);
    }
  }

  private findEventInsertPosition(event: HapticEvent): number {
    const priorities = [HapticPriority.URGENT, HapticPriority.CRITICAL, HapticPriority.HIGH, HapticPriority.MEDIUM, HapticPriority.LOW];

    for (let i = 0; i < this.eventQueue.length; i++) {
      const queuedEvent = this.eventQueue[i];
      const eventPriority = priorities.indexOf(event.priority);
      const queuedPriority = priorities.indexOf(queuedEvent.priority);

      if (eventPriority < queuedPriority) {
        return i;
      }
    }

    return this.eventQueue.length;
  }

  private async processEventQueue(): Promise<void> {
    const now = Date.now();
    const eventsToProcess: HapticEvent[] = [];

    // Extract events that are ready to process
    for (let i = this.eventQueue.length - 1; i >= 0; i--) {
      const event = this.eventQueue[i];
      if (event.type === 'effect' && !event.processed) {
        eventsToProcess.push(event);
        this.eventQueue.splice(i, 1);
      }
    }

    // Process events
    for (const event of eventsToProcess) {
      try {
        await this.executeEffect(event.data.effect);
        event.processed = true;
        this.performanceMetrics.processedEvents++;
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to process haptic event', { error: err });
        this.performanceMetrics.failedEvents++;
      }
    }

    this.performanceMetrics.totalEvents += eventsToProcess.length;
  }

  private async executeEffect(effect: HapticEffect): Promise<void> {
    const device = this.devices.get(effect.device.id);
    if (!device || !device.isConnected) {
      throw new Error(`Device not available: ${effect.device.id}`);
    }

    const pattern = this.patterns.get(effect.patternId);
    if (!pattern) {
      throw new Error(`Pattern not found: ${effect.patternId}`);
    }

    effect.status = 'playing';

    try {
      // Execute based on device type
      switch (device.type) {
        case GAMEPAD:
          await this.executeGamepadEffect(effect, pattern, device);
          break;
        case MOBILE:
          await this.executeMobileEffect(effect, pattern, device);
          break;
        case WEARABLE:
          await this.executeWearableEffect(effect, pattern, device);
          break;
        default:
          await this.executeGenericEffect(effect, pattern, device);
      }

      effect.status = 'completed';
      effect.endTime = Date.now();
      this.configuration.statistics.completedEffects++;

      logger.debug('Haptic effect completed', { effectId: effect.id });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      effect.status = 'failed';
      this.configuration.statistics.failedEffects++;
      this.configuration.statistics.errors.push(`Effect ${effect.id} failed: ${error}`);
      throw error;
    }
  }

  private async executeGamepadEffect(effect: HapticEffect, pattern: HapticPattern, device: HapticDevice): Promise<void> {
    if ('getGamepads' in navigator) {
      const gamepads = (navigator as any).getGamepads();
      const gamepadIndex = device.metadata.gamepadIndex;

      if (gamepadIndex !== undefined && gamepads[gamepadIndex]) {
        const gamepad = gamepads[gamepadIndex];

        if (gamepad.vibrationActuator && gamepad.vibrationActuator.playEffect) {
          // Use advanced vibration API if available
          const vibrationEffect = {
            duration: pattern.duration,
            strongMagnitude: pattern.amplitude,
            weakMagnitude: pattern.amplitude * 0.5
          };

          gamepad.vibrationActuator.playEffect('dual-rumble', vibrationEffect);
        } else {
          // Fallback to basic vibration
          const duration = pattern.duration;
          const intensity = pattern.amplitude;
          gamepad.vibrationActuator.playEffect('dual-rumble', {
            duration,
            strongMagnitude: intensity,
            weakMagnitude: intensity * 0.5
          });
        }
      }
    }
  }

  private async executeMobileEffect(effect: HapticEffect, pattern: HapticPattern, device: HapticDevice): Promise<void> {
    if ('vibrate' in navigator) {
      const duration = pattern.duration;
      const intensity = pattern.amplitude;

      // Mobile devices typically only support basic vibration
      if (pattern.type === HapticPatternType.CLICK) {
        (navigator as any).vibrate(duration);
      } else if (pattern.type === HapticPatternType.BUZZ) {
        (navigator as any).vibrate([50, 50, 50]); // Buzz pattern
      } else {
        (navigator as any).vibrate(duration * intensity);
      }
    }
  }

  private async executeWearableEffect(effect: HapticEffect, pattern: HapticPattern, device: HapticDevice): Promise<void> {
    // Wearable device implementation would go here
    // This is a placeholder for future implementation
    logger.debug('Wearable haptic effect not implemented', { effectId: effect.id });
  }

  private async executeGenericEffect(effect: HapticEffect, pattern: HapticPattern, device: HapticDevice): Promise<void> {
    // Generic fallback implementation
    logger.debug('Generic haptic effect', { patternName: pattern.name, deviceName: device.name });
  }

  private async updateActiveEffects(): Promise<void> {
    const now = Date.now();
    const effectsToRemove: string[] = [];

    for (const [effectId, effect] of this.activeEffects) {
      if (effect.status === 'playing') {
        const elapsed = now - effect.startTime;
        effect.progress = Math.min(1, elapsed / effect.duration);

        if (elapsed >= effect.duration) {
          effect.status = 'completed';
          effect.endTime = now;
          effectsToRemove.push(effectId);
        }
      }
    }

    // Remove completed effects
    for (const effectId of effectsToRemove) {
      this.activeEffects.delete(effectId);
      this.configuration.statistics.activeEffects = Math.max(0, this.configuration.statistics.activeEffects - 1);
    }
  }

  // Pattern management
  createPattern(patternData: Partial<HapticPattern>): string {
    const patternId = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pattern: HapticPattern = {
      id: patternId,
      name: patternData.name || 'New Pattern',
      type: patternData.type || HapticPatternType.CUSTOM,
      description: patternData.description || '',
      duration: patternData.duration || 100,
      waveform: patternData.waveform || HapticWaveform.SINE,
      amplitude: patternData.amplitude || 0.5,
      frequency: patternData.frequency || 100,
      priority: patternData.priority || HapticPriority.MEDIUM,
      targets: patternData.targets || [HapticTarget.ALL],
      sequence: patternData.sequence || [],
      cooldown: patternData.cooldown || 0,
      reusable: patternData.reusable !== false,
      tags: patternData.tags || [],
      metadata: patternData.metadata || {}
    };

    this.patterns.set(patternId, pattern);
    this.configuration.customPatterns.set(patternId, pattern);

    return patternId;
  }

  getPattern(patternId: string): HapticPattern | undefined {
    return this.patterns.get(patternId);
  }

  updatePattern(patternId: string, updates: Partial<HapticPattern>): boolean {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return false;

    Object.assign(pattern, updates);
    return true;
  }

  deletePattern(patternId: string): boolean {
    const pattern = this.patterns.get(patternId);
    if (!pattern || pattern.tags.includes('default')) return false;

    this.patterns.delete(patternId);
    this.configuration.customPatterns.delete(patternId);
    return true;
  }

  // Environment management
  createEnvironment(environmentData: Partial<HapticEnvironment>): string {
    const environmentId = `environment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const environment: HapticEnvironment = {
      id: environmentId,
      name: environmentData.name || 'New Environment',
      type: environmentData.type || 'custom',
      devices: environmentData.devices || [],
      patterns: environmentData.patterns || [],
      settings: environmentData.settings || {
        masterVolume: 0.8,
        masterIntensity: 0.8,
        frequencyRange: { min: 20, max: 300 },
        amplitudeRange: { min: 0.1, max: 1.0 },
        priorityThreshold: HapticPriority.MEDIUM,
        maxConcurrentEffects: 8,
        effectTimeout: 3000,
        enableAdaptiveFeedback: true,
        enableEnvironmentalHaptics: true,
        enableGestureFeedback: true
      },
      activeEffects: [],
      priorityQueue: []
    };

    this.environments.set(environmentId, environment);
    this.configuration.environments.set(environmentId, environment);

    return environmentId;
  }

  // Gesture recognition
  async recognizeGesture(input: GestureInput): Promise<HapticGesture | null> {
    return await this.gestureRecognizer.recognize(input);
  }

  // Statistics and monitoring
  getStatistics(): HapticStatistics {
    // Update statistics
    this.configuration.statistics.activeEffects = this.activeEffects.size;
    this.configuration.statistics.averageEffectDuration = this.calculateAverageEffectDuration();
    this.configuration.statistics.averageAmplitude = this.calculateAverageAmplitude();
    this.configuration.statistics.averageFrequency = this.calculateAverageFrequency();

    return { ...this.configuration.statistics };
  }

  private calculateAverageEffectDuration(): number {
    const durations = Array.from(this.activeEffects.values()).map((e: any) => e.duration);
    return durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / length: 0;
  }

  private calculateAverageAmplitude(): number {
    const amplitudes = Array.from(this.activeEffects.values()).map((e: any) => e.amplitude);
    return amplitudes.length > 0 ? amplitudes.reduce((sum, a) => sum + a, 0) / length: 0;
  }

  private calculateAverageFrequency(): number {
    const frequencies = Array.from(this.activeEffects.values()).map((e: any) => e.frequency);
    return frequencies.length > 0 ? frequencies.reduce((sum, f) => sum + f, 0) / length: 0;
  }

  // Configuration management
  updateGlobalSettings(settings: Partial<HapticGlobalSettings>): void {
    Object.assign(this.configuration.globalSettings, settings);
  }

  getGlobalSettings(): HapticGlobalSettings {
    return { ...this.configuration.globalSettings };
  }

  // Device management
  connectDevice(id: string): boolean {
    const device = this.devices.get(device.id);
    if (!device) return false;

    device.isConnected = true;
    device.isActive = true;
    logger.info('Haptic device connected', { deviceName: device.name, deviceType: device.type });
    return true;
  }

  disconnectDevice(id: string): boolean {
    const device = this.devices.get(device.id);
    if (!device) return false;

    device.isConnected = false;
    device.isActive = false;

    // Stop all effects on this device
    for (const [effectId, effect] of this.activeEffects) {
      if (effect.device.id === device.id && effect.status === 'playing') {
        effect.status = 'cancelled';
      }
    }

    logger.info('Haptic device disconnected', { deviceName: device.name });
    return true;
  }

  // Export and import
  exportConfiguration(format: 'json' | 'xml' = 'json'): string {
    const config = {
      ...this.configuration,
      devices: Array.from(this.devices.values()),
      patterns: Array.from(this.patterns.values()),
      environments: Array.from(this.environments.values())
    };

    if (format === 'json') {
      return JSON.stringify(config, null, 2);
    } else {
      return this.convertToXML(config);
    }
  }

  private convertToXML(data): string {
    // Simple XML conversion
    return '<haptic_config><!-- XML export not fully implemented --></haptic_config>';
  }

  // Utility methods
  stopAllEffects(): void {
    for (const [effectId, effect] of this.activeEffects) {
      if (effect.status === 'playing') {
        effect.status = 'cancelled';
      }
    }

    logger.info('Stopped all active haptic effects', { effectCount: this.activeEffects.size });
  }

  getActiveEffects(): HapticEffect[] {
    return Array.from(this.activeEffects.values());
  }

  getDevice(id: string): HapticDevice | undefined {
    return this.devices.get(device.id);
  }

  getAllDevices(): HapticDevice[] {
    return Array.from(this.devices.values());
  }

  reset(): void {
    // Stop all effects
    this.stopAllEffects();

    // Clear collections
    this.devices.clear();
    this.patterns.clear();
    this.environments.clear();
    this.activeEffects.clear();
    this.eventQueue = [];

    // Reset configuration
    this.configuration = this.createDefaultConfiguration();

    // Reinitialize
    this.initializeHapticSystem();

    logger.info('Haptic engine reset to initial state');
  }

  dispose(): void {
    this.stopAllEffects();
    this.eventQueue = [];
    this.activeEffects.clear();
    this.devices.clear();
    this.patterns.clear();
    this.environments.clear();
    this.isInitialized = false;

    logger.info('Haptic engine disposed successfully');
  }
}

// Supporting interfaces and types
export interface PlayOptions {
  amplitude?: number;
  frequency?: number;
  priority?: HapticPriority;
  target?: HapticTarget;
  metadata?: Record<string, any>;
}

export interface GestureInput {
  type: 'tap' | 'swipe' | 'pinch' | 'rotate' | 'custom';
  touches: TouchPoint[];
  duration: number;
  velocity: number;
  pressure: number;
  metadata: Record<string, any>;
}

export interface TouchPoint {
  id: string;
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
}

export interface HapticPerformanceMetrics {
  totalEvents: number;
  processedEvents: number;
  failedEvents: number;
  averageProcessingTime: number;
  peakConcurrentEffects: number;
  deviceConnectionTime: number;
  gestureRecognitionAccuracy: number;
  adaptiveFeedbackScore: number;
  systemLatency: number;
  memoryUsage: number;
}

class HapticGestureRecognizer {
  async recognize(input: GestureInput): Promise<HapticGesture | null> {
    // Simple gesture recognition implementation
    // In a real implementation, this would use more sophisticated algorithms
    logger.debug('Recognizing haptic gesture', { inputType: input.type });
    return null;
  }
}