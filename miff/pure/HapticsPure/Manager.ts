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
  | { type: 'environmental'; condition: string; threshold: number; response: HapticPattern;
    }
  | { type: 'adaptive'; basePattern: HapticPattern; modifiers: HapticModifier[] };

export interface HapticModifier {
  condition: string;
  property: 'intensity' | 'frequency' | 'duration' | 'waveform';
  value: any;
  transition: 'immediate' | 'smooth' | 'fade';
  duration?: number;
}

export interface HapticRequest {
  id: string;
  pattern: HapticPattern;
  at?: number; // epoch ms to trigger
  device?: HapticDeviceType;
  priority?: number;
  timeout?: number;
  metadata?: Record<string, any>;
}

export interface HapticResult {
  id: string;
  status: 'scheduled' | 'played' | 'skipped' | 'error' | 'cancelled' | 'delayed';
  reason?: string;
  actualDuration?: number;
  actualIntensity?: number;
  deviceUsed?: HapticDeviceType;
  timestamp?: number;
}

export interface HapticDevice {
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
  condition: string; // e.g., 'collision', 'proximity', 'health_low'
  threshold: number;
  pattern: HapticPattern;
  cooldown: number;
  lastTriggered?: number;
}

export class HapticsManager {
  private queue: HapticRequest[] = [];
  private devices: Map<string, HapticDevice> = new Map();
  private sequences: Map<string, HapticSequence> = new Map();
  private rhythmEngines: Map<string, HapticRhythmEngine> = new Map();
  private environmentalResponses: HapticEnvironmentalResponse[] = [];
  private activeRequests: Map<string, HapticResult> = new Map();
  private priorityQueue: Map<number, HapticRequest[]> = new Map();
  private deviceCapabilities: Map<HapticDeviceType, HapticCapabilities> = new Map();

  private now(): number { return Date.now(); }

  constructor() {
    this.initializeDefaultDevices();
    this.initializeDeviceCapabilities();
    this.initializeEnvironmentalResponses();
  }

  private initializeDefaultDevices(): void {
    // Default device configurations
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
        }
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
          latency: 10;

        }
    },
        connected: true,
        supportedWaveforms: [HapticWaveform.SINE, HapticWaveform.PULSE],
        maxIntensity: 1.0,
        maxFrequency: 300,
        maxDuration: 10000;
    }
    ];

    for (const device of defaultDevices) {
      this.devices.set(device.id, device);
    }
  }

  private initializeDeviceCapabilities(): void {
    this.deviceCapabilities.set(HapticDeviceType.GAMEPAD, {
      supportsWaveforms: true,
      supportsAmplitudeControl: true,
      supportsFrequencyControl: true,
      supportsDurationControl: true,
      supportsLocationControl: false,
      supportsMultipleActuators: false,
      maxSimultaneousEffects: 1,
      supportedEffects: [HapticEffect.BUZZ, HapticEffect.CLICK, HapticEffect.THUMP],
      latency: 5;
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
      latency: 10;
    });

    this.deviceCapabilities.set(HapticDeviceType.WEARABLE, {
      supportsWaveforms: true,
      supportsAmplitudeControl: true,
      supportsFrequencyControl: true,
      supportsDurationControl: true,
      supportsLocationControl: true,
      supportsMultipleActuators: true,
      maxSimultaneousEffects: 8,
      supportedEffects: Object.values(HapticEffect),
      latency: 2;
    });
  }

  private initializeEnvironmentalResponses(): void {
    // Default environmental haptic responses
    this.environmentalResponses = [
      {
        condition: 'collision',
        threshold: 0.5,
        pattern: { type: 'impact', style: 'medium' },
        cooldown: 100;
    },
      {
        condition: 'health_low',
        threshold: 25,
        pattern: { type: 'notification', level: 'warning' },
        cooldown: 5000;
    },
      {
        condition: 'proximity_alert',
        threshold: 10,
        pattern: { type: 'custom', durationMs: 200, intensity: 0.8 },
        cooldown: 1000;
    }
    ];
  }

  enqueue(requests: HapticRequest | HapticRequest[]): number {
    const list = Array.isArray(requests) ? requests : [
      req,
      u,
      e,
      s,
      t,
      s
    ];
    let added = 0;

    for (const request of list) {
      // Validate request
      if (!this.validateRequest(request)) {
        this.activeRequests.set(request.id, {
          id: request.id,
          status: 'error',
          reason: 'Invalid request'
        });
        continue;
      }

      // Add to appropriate priority queue
      const priority = request.priority || 0;
      if (!this.priorityQueue.has(priority)) {
        this.priorityQueue.set(priority, []);
      }
      this.priorityQueue.get(priority)!.push(request);
      added++;

      this.activeRequests.set(request.id, {
        id: request.id,
        status: 'scheduled'
      });
    }

    return added;
  }

  private validateRequest(request: HapticRequest): boolean {
    if (!request.id || !request.pattern) return false;

    // Validate pattern structure
    if (!this.validatePattern(request.pattern)) return false;

    // Check device compatibility
    if (request.device) {
      const capabilities = this.deviceCapabilities.get(request.device);
      if (!capabilities) return false;

      if (!this.isPatternSupported(request.pattern, capabilities)) return false;
    }

    return true;
  }

  private validatePattern(pattern: HapticPattern): boolean {
    switch (pattern.type) {
      case 'custom':
        return pattern.durationMs >= 0 && pattern.durationMs <= 5000 &&
               pattern.intensity >= 0 && pattern.intensity <= 1;
      case 'rhythmic':
        return pattern.bpm > 0 && pattern.bpm <= 300;
      case 'sequence':
        return pattern.effects.length > 0 && pattern.timing.length === pattern.effects.length;
      default:
        return true;
    }
  }

  private isPatternSupported(pattern: HapticPattern, capabilities: HapticCapabilities): boolean {
    switch (pattern.type) {
      case 'custom':
        return pattern.waveform ? capabilities.supportsWaveforms : true;
      case 'sequence':
        return pattern.effects.every(effect => capabilities.supportedEffects.includes(effect));
      default:
        return true;
    }
  }

  getPending(): HapticRequest[] {
    const allRequests: HapticRequest[] = [];
    for (const requests of this.priorityQueue.values()) {
      allRequests.push(...requests);
    }
    return allRequests.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  getDevices(): HapticDevice[] {
    return Array.from(this.devices.values());
  }

  getDevice(deviceId: string): HapticDevice | undefined {
    return this.devices.get(deviceId);
  }

  addDevice(device: HapticDevice): void {
    this.devices.set(device.id, device);
  }

  removeDevice(deviceId: string): boolean {
    return this.devices.delete(deviceId);
  }

  createSequence(sequence: HapticSequence): void {
    this.sequences.set(sequence.id, sequence);
  }

  getSequence(sequenceId: string): HapticSequence | undefined {
    return this.sequences.get(sequenceId);
  }

  createRhythmEngine(engine: HapticRhythmEngine): void {
    this.rhythmEngines.set(engine.id, engine);
  }

  getRhythmEngine(engineId: string): HapticRhythmEngine | undefined {
    return this.rhythmEngines.get(engineId);
  }

  updateRhythmEngine(engineId: string, updates: Partial<HapticRhythmEngine>): void {
    const engine = this.rhythmEngines.get(engineId);
    if (engine) {
      Object.assign(engine, updates);
    }
  }

  startRhythmEngine(engineId: string): boolean {
    const engine = this.rhythmEngines.get(engineId);
    if (engine) {
      engine.playing = true;
      return true;
    }
    return false;
  }

  stopRhythmEngine(engineId: string): boolean {
    const engine = this.rhythmEngines.get(engineId);
    if (engine) {
      engine.playing = false;
      return true;
    }
    return false;
  }

  addEnvironmentalResponse(response: HapticEnvironmentalResponse): void {
    this.environmentalResponses.push(response);
  }

  removeEnvironmentalResponse(condition: string): boolean {
    const index = this.environmentalResponses.findIndex(r => r.condition === condition);
    if (index !== -1) {
      this.environmentalResponses.splice(index, 1);
      return true;
    }
    return false;
  }

  async triggerEnvironmentalResponse(condition: string, value: number): Promise<HapticResult[]> {
    const results: HapticResult[] = [];
    const now = this.now();

    for (const response of this.environmentalResponses) {
      if (response.condition === condition && value >= response.threshold) {
        if (!response.lastTriggered || (now - response.lastTriggered) >= response.cooldown) {
          const request: HapticRequest = {
            id: `env_${condition}_${now}`,
            pattern: response.pattern,
            priority: 5;
    };

          const result = await this.playImmediate(request);
          if (result) {
            results.push(result);
            response.lastTriggered = now;
          }
        }
      }
    }

    return results;
  }

  clear(): void {
    this.queue = [];
    this.priorityQueue.clear();
    this.activeRequests.clear();
  }

  async playNext(): Promise<HapticResult | undefined> {
    // Process by priority (highest first)
    const priorities = Array.from(this.priorityQueue.keys()).sort((a, b) => b - a);

    for (const priority of priorities) {
      const requests = this.priorityQueue.get(priority)!;
      if (requests.length > 0) {
        const req = requests.shift();
        if (req) {
          try {
            const result = await this.play(req);
            this.activeRequests.set(req.id, result);
            return result;
          } catch (err) {
            const result: HapticResult = {
              id: req.id,
              status: 'error',
              reason: String(err),
              timestamp: this.now()
            };
            this.activeRequests.set(req.id, result);
            return result;
          }
        }
      }
    }

    return undefined;
  }

  async playAll(): Promise<HapticResult[]> {
    const results: HapticResult[] = [];

    while (true) {
      const result = await this.playNext();
      if (!result) break;
      results.push(result);
    }

    return results;
  }

  async playImmediate(request: HapticRequest): Promise<HapticResult | undefined> {
    try {
      const result = await this.play(request);
      this.activeRequests.set(request.id, result);
      return result;
    } catch (err) {
      const result: HapticResult = {
        id: request.id,
        status: 'error',
        reason: String(err),
        timestamp: this.now()
      };
      this.activeRequests.set(request.id, result);
      return result;
    }
  }

  // Core: play one request using navigator.vibrate or fallbacks
  async play(req: HapticRequest): Promise<HapticResult> {
    const current = this.now();
    const device = req.device ? this.devices.get(req.device) : this.getBestAvailableDevice();
    const capabilities = device ? device.capabilities : this.deviceCapabilities.get(HapticDeviceType.MOBILE);

    if (!capabilities) {
      return {
        id: req.id,
        status: 'error',
        reason: 'No haptic device available',
        timestamp: current;
    };
    }

    // Check scheduling
    if (req.at && req.at > current + 60_000) {
      return {
        id: req.id,
        status: 'skipped',
        reason: 'scheduled-too-far',
        timestamp: current;
    };
    }

    if (req.at && req.at > current) {
      const delay = req.at - current;
      await new Promise(r => setTimeout(r, delay));
    }

    // Check device limits
    const activeCount = Array.from(this.activeRequests.values())
      .filter(r => r.status === 'played' && r.deviceUsed === device?.type).length;

    if (activeCount >= capabilities.maxSimultaneousEffects) {
      return {
        id: req.id,
        status: 'skipped',
        reason: 'device-busy',
        timestamp: current;
    };
    }

    try {
      const vibrationPattern = this.patternToVibration(req.pattern, capabilities);
      const playResult = await this.playVibration(vibrationPattern, device);

      return {
        id: req.id,
        status: 'played',
        actualDuration: playResult.duration,
        actualIntensity: playResult.intensity,
        deviceUsed: device?.type,
        timestamp: this.now()
      };
    } catch (err) {
      return {
        id: req.id,
        status: 'error',
        reason: String(err),
        timestamp: this.now()
      };
    }
  }

  private getBestAvailableDevice(): HapticDevice | undefined {
    // Prefer connected devices with higher capabilities
    const connected = Array.from(this.devices.values()).filter(d => d.connected);
    if (connected.length > 0) {
      return connected.reduce((best, current) =>
        current.capabilities.maxSimultaneousEffects > best.capabilities.maxSimultaneousEffects ? current : best
      );
    }

    // Fall back to mobile if available
    return this.devices.get('default_mobile');
  }

  private patternToVibration(pattern: HapticPattern, capabilities: HapticCapabilities): any {
    switch (pattern.type) {
      case 'impact':
        const intensity = pattern.style === 'light' ? 0.3 : pattern.style === 'medium' ? 0.7 : 1.0;
        return {
          type: 'simple',
          duration: Math.floor(50 * intensity),
          intensity: intensity;
    };

      case 'notification':
        const levelIntensity = pattern.level === 'success' ? 0.4 : pattern.level === 'warning' ? 0.7 : 1.0;
        return {
          type: 'pattern',
          pattern: pattern.level === 'success' ? [50, 100, 50] : [100, 80, 100],
          intensity: levelIntensity;
    };

      case 'selection':
        return {
          type: 'simple',
          duration: 20,
          intensity: pattern.feedback === 'light' ? 0.3 : pattern.feedback === 'medium' ? 0.5 : 0.7
        };

      case 'custom':
        return {
          type: 'custom',
          duration: Math.max(0, Math.min(capabilities.supportedEffects.includes(HapticEffect.BUZZ) ? 5000 : 1000, pattern.durationMs)),
          intensity: Math.max(0, Math.min(1, pattern.intensity)),
          frequency: pattern.frequency,
          waveform: pattern.waveform
        };

      case 'sequence':
        return {
          type: 'sequence',
          effects: pattern.effects,
          timing: pattern.timing,
          loop: pattern.loop || false,
          adaptive: pattern.adaptive || false
        };

      case 'rhythmic':
        return {
          type: 'rhythmic',
          bpm: Math.max(60, Math.min(300, pattern.bpm)),
          pattern: pattern.pattern,
          measures: pattern.measures || 1,
          intensity: pattern.intensity || 0.7
        };

      case 'environmental':
        return this.patternToVibration(pattern.response, capabilities);

      case 'adaptive':
        return this.applyAdaptiveModifiers(pattern.basePattern, pattern.modifiers, capabilities);

      default:
        return { type: 'simple', duration: 0, intensity: 0;
    };
    }
  }

  private applyAdaptiveModifiers(basePattern: HapticPattern, modifiers: HapticModifier[], capabilities: HapticCapabilities): any {
    let modifiedPattern = this.patternToVibration(basePattern, capabilities);

    for (const modifier of modifiers) {
      // Apply modifiers based on conditions (simplified)
      if (modifier.transition === 'immediate') {
        if (modifier.property === 'intensity') {
          modifiedPattern.intensity = Math.max(0, Math.min(1, modifier.value));
        } else if (modifier.property === 'frequency' && modifiedPattern.frequency !== undefined) {
          modifiedPattern.frequency = Math.max(0, Math.min(capabilities.maxSimultaneousEffects, modifier.value));
        }
      }
    }

    return modifiedPattern;
  }

  private async playVibration(vibration: any, device?: HapticDevice): Promise<{ duration: number; intensity: number;
    }> {
    // Check if Web Vibration API is available
    if (typeof (globalThis as any).navigator !== 'undefined' && typeof (globalThis as any).navigator.vibrate === 'function') {
      if (vibration.type === 'simple') {
        (globalThis as any).navigator.vibrate(vibration.duration);
        return { duration: vibration.duration, intensity: vibration.intensity };
      } else if (vibration.type === 'pattern') {
        (globalThis as any).navigator.vibrate(vibration.pattern);
        return { duration: vibration.pattern.reduce((a: number, b: number) => a + b, 0), intensity: vibration.intensity };
      }
    }

    // Fallback for testing - simulate haptic feedback
    await new Promise(resolve => setTimeout(resolve, vibration.duration || 100));
    return { duration: vibration.duration || 100, intensity: vibration.intensity || 0.5 };
  }

  getStats(): any {
    return {
      queuedRequests: this.getPending().length,
      activeRequests: this.activeRequests.size,
      devicesConnected: Array.from(this.devices.values()).filter(d => d.connected).length,
      sequencesLoaded: this.sequences.size,
      rhythmEnginesActive: Array.from(this.rhythmEngines.values()).filter(e => e.playing).length,
      environmentalResponses: this.environmentalResponses.length,
      priorityQueues: this.priorityQueue.size
    };
  }

  exportPatterns(format: 'json' | 'xml' | 'csv' = 'json'): string {
    const patterns = Array.from(this.sequences.values());

    switch (format) {
      case 'json':
        return JSON.stringify(patterns, null, 2);
      case 'xml':
        // XML export would be implemented here
        return '<patterns><!-- XML export not implemented --></patterns>';
      case 'csv':
        // CSV export would be implemented here
        return 'id,name,type,timing\n';
      default:
        return JSON.stringify(patterns, null, 2);
    }
  }
}

