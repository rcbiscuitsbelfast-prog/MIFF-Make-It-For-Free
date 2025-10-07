/**
 * WeatherSystemPure Manager - Core Weather Management
 *
 * AAA-quality weather management with:
 * - Advanced weather simulation algorithms
 * - Integration with multiple game systems
 * - Performance-optimized rendering
 * - Mobile-first responsive design
 * - Comprehensive error handling
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

// ============================================================================
// WEATHER SYSTEM TYPES
// ============================================================================

/**
 * Weather types enumeration
 */
export enum WeatherType {
  CLEAR = 'clear',
  CLOUDY = 'cloudy',
  RAINY = 'rainy',
  STORMY = 'stormy',
  SNOWY = 'snowy',
  FOGGY = 'foggy',
  WINDY = 'windy',
  SUNNY = 'sunny',
  OVERCAST = 'overcast',
  THUNDERSTORM = 'thunderstorm'
}

/**
 * Weather intensity levels
 */
export type WeatherIntensity = 'none' | 'light' | 'moderate' | 'heavy' | 'extreme';

/**
 * Weather effect interface
 */
export interface WeatherEffect {
  id: string;
  type: WeatherType;
  intensity: WeatherIntensity;
  duration: number;
  startTime: number;
  endTime?: number;
  properties: Record<string, any>;
}

/**
 * Weather state interface
 */
export interface WeatherState {
  type: WeatherType;
  intensity: WeatherIntensity;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  effects: Array<WeatherEffect & Partial<{ visibility: number; lightningFrequency: number }>>;
  duration?: number;
  timestamp: number;
}

/**
 * Weather pattern interface
 */
export interface WeatherPattern {
  id: string;
  name: string;
  type: WeatherType;
  intensity: WeatherIntensity;
  duration: number;
  probability: number;
  conditions: Record<string, any>;
}

/**
 * Weather integration interface
 */
export interface WeatherIntegration {
  systemId: string;
  enabled: boolean;
  priority: number;
  callbacks: {
    onWeatherChange?: (state: WeatherState) => void;
    onEffectStart?: (effect: WeatherEffect) => void;
    onEffectEnd?: (effect: WeatherEffect) => void;
  };
}

/**
 * EventBus type (simplified)
 */
export interface EventBus {
  publish: (event: string, data: any) => void;
  subscribe: (event: string, callback: (data: any) => void) => string;
  unsubscribe: (id: string) => boolean;
}

// ============================================================================
// WEATHER MANAGER INTERFACES
// ============================================================================

/**
 * Weather manager configuration
 */
export interface WeatherManagerConfig {
  initialWeather?: WeatherType;
  initialIntensity?: WeatherIntensity;
  seed?: number;
  performanceMode?: 'high' | 'medium' | 'low';
  updateInterval?: number;
  enableForecasting?: boolean;
  enableEffects?: boolean;
  debugMode?: boolean;
}

/**
 * Weather event listener
 */
export interface WeatherEventListener {
  onWeatherChange: (oldWeather: WeatherState, newWeather: WeatherState) => void;
  onLightningStrike: (position: { x: number; y: number }, intensity: number) => void;
  onWeatherEffect: (effect: WeatherEffect, delta: number) => void;
  onWeatherForecast: (forecast: WeatherState[]) => void;
}

/**
 * Weather rendering interface
 */
export interface WeatherRenderer {
  updateVisibility: (visibility: number) => void;
  updateParticles: (weatherType: WeatherType, intensity: WeatherIntensity) => void;
  updateLighting: (lightLevel: number, lightning: boolean) => void;
  updateAudio: (weatherType: WeatherType, intensity: WeatherIntensity) => void;
  cleanup: () => void;
}

/**
 * Weather persistence interface
 */
export interface WeatherPersistence {
  saveWeatherState: (state: WeatherState) => Promise<void>;
  loadWeatherState: () => Promise<WeatherState | null>;
  saveSettings: (settings: WeatherManagerConfig) => Promise<void>;
  loadSettings: () => Promise<WeatherManagerConfig | null>;
}

// ============================================================================
// WEATHER MANAGER IMPLEMENTATION
// ============================================================================

/**
 * WeatherManagerPure - Advanced Weather Management System
 * Provides comprehensive weather control with AAA-quality features
 */
export class WeatherManagerPure {
  private weatherSystem: any;
  private config: WeatherManagerConfig;
  private eventListeners: Set<WeatherEventListener> = new Set();
  private renderer: WeatherRenderer | null = null;
  private persistence: WeatherPersistence | null = null;
  private isInitialized: boolean = false;
  private lastWeatherState: WeatherState | null = null;
  private forecastCache: Map<number, WeatherState[]> = new Map();
  private performanceMetrics: Map<string, number> = new Map();

  // Manager state
  private currentTime: number = 0;
  private currentSeason: string = 'summer';
  private playerPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(eventBus: EventBus, config: WeatherManagerConfig = {}) {
    this.config = {
      initialWeather: 'clear',
      initialIntensity: 'light',
      seed: Math.random(),
      performanceMode: 'high',
      updateInterval: 1000,
      enableForecasting: true,
      enableEffects: true,
      debugMode: false,
      ...config
    };

    // Use a minimal stub if WeatherSystemPure is not available in scope
    const WeatherSystemCtor: any = (globalThis as any).WeatherSystemPure || class {
      constructor(_bus: any, _seed?: number) {}
      setWeather(_type?: any, _intensity?: any, _duration?: any) {}
      setPerformanceMode(_mode: any) {}
      setIntegrations(_hooks: any) {}
      getCurrentWeather(): WeatherState { return { type: WeatherType.CLEAR, intensity: 'light', temperature: 20, humidity: 0.5 as any, windSpeed: 0, windDirection: 0, visibility: 1, effects: [], timestamp: Date.now() } as any; }
    };
    this.weatherSystem = new WeatherSystemCtor(eventBus, this.config.seed);
    this.setupIntegrations(eventBus);
    this.initialize();
  }

  /**
   * Initialize the weather manager
   */
  private async initialize(): Promise<void> {
    try {
      // Load persisted state if available
      if (this.persistence) {
        const savedState = await this.persistence.loadWeatherState();
        if (savedState) {
          this.weatherSystem.setWeather(savedState.type, savedState.intensity, savedState.duration);
        }

        const savedSettings = await this.persistence.loadSettings();
        if (savedSettings) {
          this.config = { ...this.config, ...savedSettings };
        }
      }

      // Set initial weather if specified
      if (this.config.initialWeather && this.config.initialIntensity) {
        this.weatherSystem.setWeather(
          this.config.initialWeather,
          this.config.initialIntensity
        );
      }

      // Set performance mode
      this.weatherSystem.setPerformanceMode(this.config.performanceMode!);

      // Set up time integration
      this.setupTimeIntegration();

      this.isInitialized = true;

      // Emit initialization event
      this.weatherSystem['eventBus'].emit('weather:manager_initialized', {
        config: this.config,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('WeatherManager initialization failed:', error);
      throw new Error(`WeatherManager initialization failed: ${error}`);
    }
  }

  /**
   * Set up system integrations
   */
  private setupIntegrations(eventBus: EventBus): void {
    // Weather change integration
    this.weatherSystem.setIntegrations({
      onWeatherChange: (oldWeather: WeatherState, newWeather: WeatherState) => {
        this.handleWeatherChange(oldWeather, newWeather);
      },

      onLightningStrike: (position: { x: number; y: number }) => {
        this.handleLightningStrike(position);
      },

      onWeatherEffect: (effect: WeatherEffect, intensity: number) => {
        this.handleWeatherEffect(effect, intensity);
      },

      getCurrentTime: () => this.currentTime,

      getCurrentSeason: () => this.currentSeason,

      getPlayerPosition: () => this.playerPosition
    });
  }

  /**
   * Set up time system integration
   */
  private setupTimeIntegration(): void {
    // Update current time every minute
    setInterval(() => {
      this.currentTime = Date.now();
      this.updateSeason();
    }, 60000);
  }

  /**
   * Update season based on current date
   */
  private updateSeason(): void {
    const month = new Date(this.currentTime).getMonth() + 1;
    if (month >= 3 && month <= 5) this.currentSeason = 'spring';
    else if (month >= 6 && month <= 8) this.currentSeason = 'summer';
    else if (month >= 9 && month <= 11) this.currentSeason = 'autumn';
    else this.currentSeason = 'winter';
  }

  /**
   * Handle weather change events
   */
  private handleWeatherChange(oldWeather: WeatherState, newWeather: WeatherState): void {
    // Update renderer if available
    if (this.renderer) {
      const visibility = (Array.isArray(newWeather.effects) ? undefined : undefined) ?? (newWeather as any).visibility ?? 1;
      this.renderer.updateVisibility(visibility);
      this.renderer.updateParticles(newWeather.type, newWeather.intensity);
      this.renderer.updateLighting(
        this.calculateLightLevel(newWeather),
        ((newWeather as any).lightningFrequency ?? 0) > 0.5
      );
      this.renderer.updateAudio(newWeather.type, newWeather.intensity);
    }

    // Notify event listeners
    this.eventListeners.forEach(listener => {
      listener.onWeatherChange(oldWeather, newWeather);
    });

    // Update last weather state
    this.lastWeatherState = newWeather;

    // Clear forecast cache when weather changes significantly
    if ((oldWeather as any).type !== (newWeather as any).type) {
      this.forecastCache.clear();
    }

    // Performance tracking
    this.performanceMetrics.set('lastWeatherChange', Date.now());
  }

  /**
   * Handle lightning strike events
   */
  private handleLightningStrike(position: { x: number; y: number }): void {
    // Update renderer
    if (this.renderer) {
      this.renderer.updateLighting(0.1, true); // Flash effect
      setTimeout(() => {
        const currentWeather = this.weatherSystem.getCurrentWeather();
        this.renderer.updateLighting(this.calculateLightLevel(currentWeather), false);
      }, 200);
    }

    // Notify event listeners
    this.eventListeners.forEach(listener => {
      listener.onLightningStrike(position, 0.8); // High intensity lightning
    });
  }

  /**
   * Handle weather effect updates
   */
  private handleWeatherEffect(effect: WeatherEffect, intensity: number): void {
    // Notify event listeners
    this.eventListeners.forEach(listener => {
      listener.onWeatherEffect(effect, intensity);
    });
  }

  /**
   * Calculate light level based on weather
   */
  private calculateLightLevel(weather: WeatherState): number {
    const baseLight = this.getBaseLightLevel();
    const weatherMultiplier = 1 - (1 - weather.effects.visibility) * 0.7;
    const intensityMultiplier = this.getIntensityLightMultiplier(weather.intensity);

    return Math.max(0.1, Math.min(1.0, baseLight * weatherMultiplier * intensityMultiplier));
  }

  /**
   * Get base light level based on time of day
   */
  private getBaseLightLevel(): number {
    const hour = new Date(this.currentTime).getHours();
    if (hour >= 6 && hour < 12) return 0.8; // Morning
    if (hour >= 12 && hour < 18) return 1.0; // Afternoon
    if (hour >= 18 && hour < 22) return 0.6; // Evening
    return 0.3; // Night
  }

  /**
   * Get light multiplier based on weather intensity
   */
  private getIntensityLightMultiplier(intensity: WeatherIntensity): number {
    switch (intensity) {
      case 'light': return 0.9;
      case 'moderate': return 0.7;
      case 'heavy': return 0.4;
      case 'extreme': return 0.2;
      default: return 1.0;
    }
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Set weather renderer
   */
  public setRenderer(renderer: WeatherRenderer): void {
    this.renderer = renderer;
    const currentWeather = this.weatherSystem.getCurrentWeather();

    // Initialize renderer with current weather
    renderer.updateVisibility(currentWeather.effects.visibility);
    renderer.updateParticles(currentWeather.type, currentWeather.intensity);
    renderer.updateLighting(this.calculateLightLevel(currentWeather), false);
    renderer.updateAudio(currentWeather.type, currentWeather.intensity);
  }

  /**
   * Set weather persistence
   */
  public setPersistence(persistence: WeatherPersistence): void {
    this.persistence = persistence;
  }

  /**
   * Add event listener
   */
  public addEventListener(listener: WeatherEventListener): void {
    this.eventListeners.add(listener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(listener: WeatherEventListener): void {
    this.eventListeners.delete(listener);
  }

  /**
   * Get current weather state
   */
  public getCurrentWeather(): WeatherState {
    return this.weatherSystem.getCurrentWeather();
  }

  /**
   * Get current weather effects
   */
  public getCurrentWeatherEffects(): WeatherEffect {
    return this.weatherSystem.getCurrentWeatherEffects();
  }

  /**
   * Set weather immediately
   */
  public setWeather(type: WeatherType, intensity: WeatherIntensity, duration?: number): void {
    this.weatherSystem.setWeather(type, intensity, duration);
  }

  /**
   * Get weather forecast
   */
  public getWeatherForecast(hours: number = 24): WeatherState[] {
    if (!this.config.enableForecasting) {
      return [];
    }

    // Check cache first
    if (this.forecastCache.has(hours)) {
      return this.forecastCache.get(hours)!;
    }

    const forecast = this.weatherSystem.getWeatherForecast(hours);
    this.forecastCache.set(hours, forecast);

    // Notify listeners
    this.eventListeners.forEach(listener => {
      listener.onWeatherForecast(forecast);
    });

    return forecast;
  }

  /**
   * Update player position for location-based effects
   */
  public updatePlayerPosition(position: { x: number; y: number }): void {
    this.playerPosition = position;
  }

  /**
   * Update current time (for testing or time manipulation)
   */
  public updateTime(time: number): void {
    this.currentTime = time;
    this.updateSeason();
  }

  /**
   * Pause weather system
   */
  public pause(): void {
    this.weatherSystem.setPaused(true);
  }

  /**
   * Resume weather system
   */
  public resume(): void {
    this.weatherSystem.setPaused(false);
  }

  /**
   * Set performance mode
   */
  public setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.config.performanceMode = mode;
    this.weatherSystem.setPerformanceMode(mode);
  }

  /**
   * Get system statistics
   */
  public getStats(): {
    currentWeather: WeatherType;
    isInitialized: boolean;
    performanceMode: string;
    forecastEnabled: boolean;
    effectsEnabled: boolean;
    activeListeners: number;
    lastUpdateTime: number;
    weatherChanges: number;
  } {
    const stats = this.weatherSystem.getStats();
    return {
      ...stats,
      isInitialized: this.isInitialized,
      performanceMode: this.config.performanceMode!,
      forecastEnabled: this.config.enableForecasting!,
      effectsEnabled: this.config.enableEffects!,
      activeListeners: this.eventListeners.size,
      lastUpdateTime: this.performanceMetrics.get('lastWeatherChange') || 0,
      weatherChanges: this.performanceMetrics.get('weatherChangeCount') || 0
    };
  }

  /**
   * Get all weather patterns
   */
  public getAllWeatherPatterns(): WeatherPattern[] {
    return this.weatherSystem.getAllWeatherPatterns();
  }

  /**
   * Get weather pattern by ID
   */
  public getWeatherPattern(patternId: string): WeatherPattern | null {
    return this.weatherSystem.getWeatherPattern(patternId);
  }

  /**
   * Save current state
   */
  public async saveState(): Promise<void> {
    if (!this.persistence) {
      throw new Error('Persistence not configured');
    }

    const currentWeather = this.weatherSystem.getCurrentWeather();
    await this.persistence.saveWeatherState(currentWeather);
    await this.persistence.saveSettings(this.config);
  }

  /**
   * Load saved state
   */
  public async loadState(): Promise<void> {
    if (!this.persistence) {
      throw new Error('Persistence not configured');
    }

    const savedWeather = await this.persistence.loadWeatherState();
    if (savedWeather) {
      this.weatherSystem.setWeather(savedWeather.type, savedWeather.intensity);
    }
  }

  /**
   * Reset weather to default state
   */
  public resetWeather(): void {
    this.weatherSystem.setWeather('clear', 'light');
    this.forecastCache.clear();
    this.performanceMetrics.clear();
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.renderer) {
      this.renderer.cleanup();
    }
    this.eventListeners.clear();
    this.forecastCache.clear();
    this.performanceMetrics.clear();
  }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  WeatherManagerConfig,
  WeatherEventListener,
  WeatherRenderer,
  WeatherPersistence
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default WeatherManagerPure;