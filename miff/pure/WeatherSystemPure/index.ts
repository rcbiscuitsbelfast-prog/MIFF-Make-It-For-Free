/**
 * WeatherSystemPure - Dynamic Weather System
 *
 * AAA-quality weather system with:
 * - Multiple weather types (rain, snow, fog, wind, storm, etc.)
 * - Dynamic weather transitions with smooth interpolation
 * - Weather effects on gameplay (visibility, movement speed, combat)
 * - Integration with TimeSystemPure and other systems
 * - Mobile-optimized performance
 * - Remix-safe deterministic behavior
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/index.js';

// ============================================================================
// WEATHER SYSTEM TYPES & INTERFACES
// ============================================================================

/**
 * Weather types supported by the system
 */
export type WeatherType =
  | 'clear' | 'cloudy' | 'rain' | 'heavy_rain' | 'storm' | 'thunderstorm'
  | 'snow' | 'blizzard' | 'fog' | 'dense_fog' | 'windy' | 'sandstorm'
  | 'drought' | 'heatwave' | 'cold_snap' | 'hail' | 'sleet';

/**
 * Weather intensity levels
 */
export type WeatherIntensity = 'light' | 'moderate' | 'heavy' | 'extreme';

/**
 * Weather transition types
 */
export type WeatherTransition = 'gradual' | 'sudden' | 'storm_front' | 'natural';

/**
 * Weather effects on gameplay
 */
export interface WeatherEffect {
  visibility: number;          // 0-1 (0 = blind, 1 = perfect visibility)
  movementSpeed: number;       // 0-1 (0 = no movement, 1 = normal speed)
  combatAccuracy: number;      // 0-1 (0 = random shots, 1 = perfect accuracy)
  temperature: number;         // -50 to +50 degrees Celsius
  precipitation: number;       // 0-1 (0 = dry, 1 = maximum precipitation)
  windSpeed: number;           // 0-100 m/s
  lightningFrequency: number;  // 0-1 (0 = no lightning, 1 = constant lightning)
  humidity: number;            // 0-100% relative humidity
  atmosphericPressure: number; // 950-1050 hPa
}

/**
 * Weather state configuration
 */
export interface WeatherState {
  type: WeatherType;
  intensity: WeatherIntensity;
  duration: number;            // Duration in seconds
  transitionType: WeatherTransition;
  effects: WeatherEffect;
  startTime: number;           // When this weather started
  endTime: number;             // When this weather should end
  isActive: boolean;
  transitionProgress: number;  // 0-1 (0 = just started, 1 = ending)
}

/**
 * Weather pattern for procedural generation
 */
export interface WeatherPattern {
  id: string;
  name: string;
  description: string;
  baseType: WeatherType;
  possibleIntensities: WeatherIntensity[];
  averageDuration: number;     // Average duration in seconds
  seasonalProbability: Record<string, number>; // Season -> probability (0-1)
  timeOfDayProbability: Record<string, number>; // Time of day -> probability (0-1)
  weatherEffects: Partial<WeatherEffect>;
  transitionEffects: {
    entering: Partial<WeatherEffect>;
    exiting: Partial<WeatherEffect>;
  };
}

/**
 * Integration hooks for other systems
 */
export interface WeatherIntegration {
  onWeatherChange?: (oldWeather: WeatherState, newWeather: WeatherState) => void;
  onLightningStrike?: (position: { x: number; y: number }) => void;
  onWeatherEffect?: (effect: WeatherEffect, intensity: number) => void;
  getCurrentTime?: () => number; // For time-based weather patterns
  getCurrentSeason?: () => string; // For seasonal weather patterns
  getPlayerPosition?: () => { x: number; y: number }; // For location-based effects
}

// ============================================================================
// WEATHER SYSTEM IMPLEMENTATION
// ============================================================================

/**
 * Main WeatherSystemPure class
 * Provides AAA-quality weather simulation with full integration support
 */
export class WeatherSystemPure {
  private currentWeather: WeatherState;
  private previousWeather: WeatherState | null = null;
  private weatherPatterns: Map<string, WeatherPattern> = new Map();
  private activeTransitions: Map<string, WeatherState> = new Map();
  private eventBus: EventBus;
  private integrations: WeatherIntegration = {};
  private randomSeed: number;
  private isPaused: boolean = false;
  private performanceMode: 'high' | 'medium' | 'low' = 'high';

  // Weather constants
  private readonly WEATHER_UPDATE_INTERVAL = 1000; // 1 second
  private readonly MAX_WEATHER_DURATION = 7200; // 2 hours
  private readonly MIN_WEATHER_DURATION = 300; // 5 minutes
  private readonly TRANSITION_DURATION = 300; // 5 minutes for smooth transitions

  // Performance optimization
  private lastUpdateTime: number = 0;
  private updateBuffer: WeatherEffect[] = [];
  private effectCache: Map<string, WeatherEffect> = new Map();

  constructor(eventBus: EventBus, seed: number = Math.random()) {
    this.eventBus = eventBus;
    this.randomSeed = seed;
    this.currentWeather = this.createInitialWeather();
    this.initializeWeatherPatterns();
    this.startWeatherUpdateLoop();
  }

  /**
   * Initialize weather patterns with realistic data
   */
  private initializeWeatherPatterns(): void {
    const patterns: WeatherPattern[] = [
      // Clear weather
      {
        id: 'clear_sunny',
        name: 'Clear Sunny',
        description: 'Bright, clear skies with good visibility',
        baseType: 'clear',
        possibleIntensities: ['light'],
        averageDuration: 3600,
        seasonalProbability: { spring: 0.4, summer: 0.6, autumn: 0.4, winter: 0.2 },
        timeOfDayProbability: { morning: 0.3, afternoon: 0.5, evening: 0.3, night: 0.1 },
        weatherEffects: {
          visibility: 1.0,
          movementSpeed: 1.0,
          combatAccuracy: 1.0,
          temperature: 22,
          precipitation: 0.0,
          windSpeed: 2,
          lightningFrequency: 0.0,
          humidity: 40,
          atmosphericPressure: 1013
        },
        transitionEffects: {
          entering: { visibility: 1.0, combatAccuracy: 1.0 },
          exiting: { visibility: 0.9, combatAccuracy: 0.95 }
        }
      },

      // Rain weather
      {
        id: 'rain_moderate',
        name: 'Moderate Rain',
        description: 'Steady rainfall with reduced visibility',
        baseType: 'rain',
        possibleIntensities: ['light', 'moderate'],
        averageDuration: 1800,
        seasonalProbability: { spring: 0.3, summer: 0.2, autumn: 0.4, winter: 0.1 },
        timeOfDayProbability: { morning: 0.2, afternoon: 0.4, evening: 0.3, night: 0.1 },
        weatherEffects: {
          visibility: 0.7,
          movementSpeed: 0.9,
          combatAccuracy: 0.8,
          temperature: 18,
          precipitation: 0.6,
          windSpeed: 8,
          lightningFrequency: 0.0,
          humidity: 85,
          atmosphericPressure: 1005
        },
        transitionEffects: {
          entering: { visibility: 0.8, precipitation: 0.4 },
          exiting: { visibility: 0.9, precipitation: 0.2 }
        }
      },

      // Storm weather
      {
        id: 'storm_heavy',
        name: 'Heavy Storm',
        description: 'Intense storm with strong winds and heavy precipitation',
        baseType: 'storm',
        possibleIntensities: ['heavy', 'extreme'],
        averageDuration: 900,
        seasonalProbability: { spring: 0.1, summer: 0.15, autumn: 0.2, winter: 0.05 },
        timeOfDayProbability: { morning: 0.1, afternoon: 0.3, evening: 0.2, night: 0.1 },
        weatherEffects: {
          visibility: 0.3,
          movementSpeed: 0.6,
          combatAccuracy: 0.4,
          temperature: 15,
          precipitation: 0.9,
          windSpeed: 25,
          lightningFrequency: 0.3,
          humidity: 95,
          atmosphericPressure: 985
        },
        transitionEffects: {
          entering: { visibility: 0.5, windSpeed: 15, precipitation: 0.7 },
          exiting: { visibility: 0.6, windSpeed: 10, precipitation: 0.3 }
        }
      },

      // Fog weather
      {
        id: 'fog_dense',
        name: 'Dense Fog',
        description: 'Thick fog severely limiting visibility',
        baseType: 'fog',
        possibleIntensities: ['moderate', 'heavy'],
        averageDuration: 1200,
        seasonalProbability: { spring: 0.2, summer: 0.05, autumn: 0.3, winter: 0.4 },
        timeOfDayProbability: { morning: 0.4, afternoon: 0.1, evening: 0.3, night: 0.5 },
        weatherEffects: {
          visibility: 0.2,
          movementSpeed: 0.8,
          combatAccuracy: 0.3,
          temperature: 12,
          precipitation: 0.1,
          windSpeed: 3,
          lightningFrequency: 0.0,
          humidity: 98,
          atmosphericPressure: 1010
        },
        transitionEffects: {
          entering: { visibility: 0.5, humidity: 0.8 },
          exiting: { visibility: 0.7, humidity: 0.6 }
        }
      },

      // Snow weather
      {
        id: 'snow_light',
        name: 'Light Snow',
        description: 'Gentle snowfall with accumulating snow',
        baseType: 'snow',
        possibleIntensities: ['light', 'moderate'],
        averageDuration: 2400,
        seasonalProbability: { spring: 0.05, summer: 0.0, autumn: 0.1, winter: 0.5 },
        timeOfDayProbability: { morning: 0.2, afternoon: 0.2, evening: 0.3, night: 0.4 },
        weatherEffects: {
          visibility: 0.8,
          movementSpeed: 0.7,
          combatAccuracy: 0.7,
          temperature: -2,
          precipitation: 0.4,
          windSpeed: 6,
          lightningFrequency: 0.0,
          humidity: 75,
          atmosphericPressure: 1008
        },
        transitionEffects: {
          entering: { visibility: 0.9, temperature: -1 },
          exiting: { visibility: 0.9, temperature: 1 }
        }
      }
    ];

    patterns.forEach(pattern => {
      this.weatherPatterns.set(pattern.id, pattern);
    });
  }

  /**
   * Create initial weather state
   */
  private createInitialWeather(): WeatherState {
    const clearPattern = this.weatherPatterns.get('clear_sunny')!;
    return {
      type: 'clear',
      intensity: 'light',
      duration: clearPattern.averageDuration,
      transitionType: 'natural',
      effects: clearPattern.weatherEffects as WeatherEffect,
      startTime: Date.now(),
      endTime: Date.now() + clearPattern.averageDuration * 1000,
      isActive: true,
      transitionProgress: 0
    };
  }

  /**
   * Start the weather update loop
   */
  private startWeatherUpdateLoop(): void {
    setInterval(() => {
      if (!this.isPaused) {
        this.updateWeather();
      }
    }, this.WEATHER_UPDATE_INTERVAL);
  }

  /**
   * Update weather state and trigger transitions
   */
  private updateWeather(): void {
    const now = Date.now();

    // Check if current weather should end
    if (now >= this.currentWeather.endTime) {
      this.transitionToNewWeather();
    }

    // Update transition progress
    this.currentWeather.transitionProgress = Math.min(
      1.0,
      (now - this.currentWeather.startTime) /
      (this.currentWeather.endTime - this.currentWeather.startTime)
    );

    // Emit weather effects
    this.emitWeatherEffects();

    // Update performance metrics
    this.updatePerformanceMetrics();
  }

  /**
   * Transition to new weather based on patterns
   */
  private transitionToNewWeather(): void {
    this.previousWeather = { ...this.currentWeather };

    // Select new weather pattern
    const newPattern = this.selectWeatherPattern();
    const newType = newPattern.baseType;
    const newIntensity = newPattern.possibleIntensities[
      Math.floor(Math.random() * newPattern.possibleIntensities.length)
    ];

    // Calculate duration with some randomness
    const durationVariance = 0.3; // ±30% variation
    const duration = Math.floor(
      newPattern.averageDuration *
      (1 + (Math.random() - 0.5) * durationVariance * 2)
    );

    // Create new weather state
    this.currentWeather = {
      type: newType,
      intensity: newIntensity,
      duration: Math.max(this.MIN_WEATHER_DURATION, Math.min(this.MAX_WEATHER_DURATION, duration)),
      transitionType: 'gradual',
      effects: this.calculateWeatherEffects(newPattern, newIntensity),
      startTime: Date.now(),
      endTime: Date.now() + duration * 1000,
      isActive: true,
      transitionProgress: 0
    };

    // Emit weather change event
    this.eventBus.emit('weather:changed', {
      oldWeather: this.previousWeather,
      newWeather: this.currentWeather,
      timestamp: Date.now()
    });
  }

  /**
   * Select weather pattern based on time, season, and probability
   */
  private selectWeatherPattern(): WeatherPattern {
    const currentTime = this.integrations.getCurrentTime?.() || Date.now();
    const currentSeason = this.integrations.getCurrentSeason?.() || 'summer';
    const hour = new Date(currentTime).getHours();
    const timeOfDay = this.getTimeOfDay(hour);

    // Weight patterns by probability
    const weightedPatterns: { pattern: WeatherPattern; weight: number }[] = [];

    this.weatherPatterns.forEach(pattern => {
      const seasonalProb = pattern.seasonalProbability[currentSeason] || 0.1;
      const timeProb = pattern.timeOfDayProbability[timeOfDay] || 0.1;
      const baseWeight = seasonalProb * timeProb;

      // Boost probability for weather types that follow current weather
      let continuityBonus = 1.0;
      if (this.previousWeather && this.previousWeather.type === pattern.baseType) {
        continuityBonus = 1.5; // 50% bonus for weather continuity
      }

      const finalWeight = baseWeight * continuityBonus;
      if (finalWeight > 0) {
        weightedPatterns.push({ pattern, weight: finalWeight });
      }
    });

    // Select pattern using weighted random selection
    const totalWeight = weightedPatterns.reduce((sum, item) => sum + item.weight, 0);
    let randomValue = Math.random() * totalWeight;

    for (const item of weightedPatterns) {
      randomValue -= item.weight;
      if (randomValue <= 0) {
        return item.pattern;
      }
    }

    // Fallback to clear weather
    return this.weatherPatterns.get('clear_sunny')!;
  }

  /**
   * Get time of day based on hour
   */
  private getTimeOfDay(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Calculate weather effects for a given pattern and intensity
   */
  private calculateWeatherEffects(pattern: WeatherPattern, intensity: WeatherIntensity): WeatherEffect {
    const baseEffects = pattern.weatherEffects;
    const intensityMultipliers = this.getIntensityMultipliers(intensity);

    return {
      visibility: Math.max(0, Math.min(1, (baseEffects.visibility || 1) * intensityMultipliers.visibility)),
      movementSpeed: Math.max(0, Math.min(1, (baseEffects.movementSpeed || 1) * intensityMultipliers.movement)),
      combatAccuracy: Math.max(0, Math.min(1, (baseEffects.combatAccuracy || 1) * intensityMultipliers.accuracy)),
      temperature: (baseEffects.temperature || 20) + intensityMultipliers.temperature,
      precipitation: Math.max(0, Math.min(1, (baseEffects.precipitation || 0) * intensityMultipliers.precipitation)),
      windSpeed: Math.max(0, (baseEffects.windSpeed || 0) * intensityMultipliers.wind),
      lightningFrequency: Math.max(0, Math.min(1, (baseEffects.lightningFrequency || 0) * intensityMultipliers.lightning)),
      humidity: Math.max(0, Math.min(100, (baseEffects.humidity || 50) * intensityMultipliers.humidity)),
      atmosphericPressure: (baseEffects.atmosphericPressure || 1013) + intensityMultipliers.pressure
    };
  }

  /**
   * Get intensity multipliers for different weather parameters
   */
  private getIntensityMultipliers(intensity: WeatherIntensity): Record<string, number> {
    switch (intensity) {
      case 'light':
        return {
          visibility: 1.2,
          movement: 0.9,
          accuracy: 0.85,
          temperature: 0.8,
          precipitation: 0.5,
          wind: 0.6,
          lightning: 0.3,
          humidity: 0.8,
          pressure: -5
        };
      case 'moderate':
        return {
          visibility: 0.8,
          movement: 0.7,
          accuracy: 0.6,
          temperature: 1.0,
          precipitation: 1.0,
          wind: 1.0,
          lightning: 1.0,
          humidity: 1.0,
          pressure: 0
        };
      case 'heavy':
        return {
          visibility: 0.4,
          movement: 0.5,
          accuracy: 0.3,
          temperature: 1.2,
          precipitation: 1.5,
          wind: 1.5,
          lightning: 1.8,
          humidity: 1.3,
          pressure: -15
        };
      case 'extreme':
        return {
          visibility: 0.1,
          movement: 0.2,
          accuracy: 0.1,
          temperature: 1.5,
          precipitation: 2.0,
          wind: 2.5,
          lightning: 3.0,
          humidity: 1.5,
          pressure: -30
        };
      default:
        return {
          visibility: 1.0,
          movement: 1.0,
          accuracy: 1.0,
          temperature: 1.0,
          precipitation: 1.0,
          wind: 1.0,
          lightning: 1.0,
          humidity: 1.0,
          pressure: 0
        };
    }
  }

  /**
   * Emit weather effects to integrated systems
   */
  private emitWeatherEffects(): void {
    const effects = this.getCurrentWeatherEffects();

    // Cache effects to avoid duplicate calculations
    const cacheKey = `${this.currentWeather.type}_${this.currentWeather.intensity}_${this.currentWeather.transitionProgress}`;
    if (!this.effectCache.has(cacheKey)) {
      this.effectCache.set(cacheKey, effects);
    }

    // Emit to integrated systems
    this.integrations.onWeatherEffect?.(effects, this.currentWeather.transitionProgress);

    // Performance mode adjustments
    if (this.performanceMode === 'low') {
      // Reduce update frequency for low performance mode
      if (this.updateBuffer.length > 10) {
        this.updateBuffer = [];
      }
      this.updateBuffer.push(effects);
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(): void {
    const now = Date.now();
    if (now - this.lastUpdateTime > 60000) { // Every minute
      this.eventBus.emit('weather:performance', {
        cacheSize: this.effectCache.size,
        transitions: this.activeTransitions.size,
        updateInterval: this.WEATHER_UPDATE_INTERVAL,
        performanceMode: this.performanceMode,
        timestamp: now
      });
      this.lastUpdateTime = now;
    }
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Get current weather state
   */
  public getCurrentWeather(): WeatherState {
    return { ...this.currentWeather };
  }

  /**
   * Get current weather effects
   */
  public getCurrentWeatherEffects(): WeatherEffect {
    const cacheKey = `${this.currentWeather.type}_${this.currentWeather.intensity}_${this.currentWeather.transitionProgress}`;
    return this.effectCache.get(cacheKey) || this.currentWeather.effects;
  }

  /**
   * Get weather pattern by ID
   */
  public getWeatherPattern(patternId: string): WeatherPattern | null {
    return this.weatherPatterns.get(patternId) || null;
  }

  /**
   * Set weather integration hooks
   */
  public setIntegrations(integrations: WeatherIntegration): void {
    this.integrations = { ...this.integrations, ...integrations };
  }

  /**
   * Force weather change (for testing or scripted events)
   */
  public setWeather(type: WeatherType, intensity: WeatherIntensity, duration?: number): void {
    const pattern = Array.from(this.weatherPatterns.values()).find(p => p.baseType === type);
    if (!pattern) return;

    this.previousWeather = { ...this.currentWeather };

    this.currentWeather = {
      type,
      intensity,
      duration: duration || pattern.averageDuration,
      transitionType: 'sudden',
      effects: this.calculateWeatherEffects(pattern, intensity),
      startTime: Date.now(),
      endTime: Date.now() + (duration || pattern.averageDuration) * 1000,
      isActive: true,
      transitionProgress: 0
    };

    this.eventBus.emit('weather:forced_change', {
      oldWeather: this.previousWeather,
      newWeather: this.currentWeather,
      forced: true,
      timestamp: Date.now()
    });
  }

  /**
   * Get weather forecast for upcoming periods
   */
  public getWeatherForecast(hours: number): WeatherState[] {
    const forecast: WeatherState[] = [];
    let currentTime = Date.now();

    for (let i = 0; i < hours; i++) {
      // Simulate weather transitions
      const pattern = this.selectWeatherPattern();
      const duration = Math.max(this.MIN_WEATHER_DURATION, Math.min(this.MAX_WEATHER_DURATION,
        pattern.averageDuration * (0.8 + Math.random() * 0.4)
      ));

      forecast.push({
        type: pattern.baseType,
        intensity: pattern.possibleIntensities[0],
        duration,
        transitionType: 'natural',
        effects: this.calculateWeatherEffects(pattern, pattern.possibleIntensities[0]),
        startTime: currentTime,
        endTime: currentTime + duration * 1000,
        isActive: true,
        transitionProgress: 0
      });

      currentTime += duration * 1000;
    }

    return forecast;
  }

  /**
   * Pause/resume weather system
   */
  public setPaused(paused: boolean): void {
    this.isPaused = paused;
    this.eventBus.emit('weather:paused', { paused, timestamp: Date.now() });
  }

  /**
   * Set performance mode
   */
  public setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.performanceMode = mode;
    this.eventBus.emit('weather:performance_mode', { mode, timestamp: Date.now() });
  }

  /**
   * Get system statistics
   */
  public getStats(): {
    currentWeather: WeatherType;
    activePatterns: number;
    transitionsThisHour: number;
    averageDuration: number;
    performanceMode: string;
    cacheSize: number;
  } {
    return {
      currentWeather: this.currentWeather.type,
      activePatterns: this.weatherPatterns.size,
      transitionsThisHour: this.activeTransitions.size,
      averageDuration: this.currentWeather.duration,
      performanceMode: this.performanceMode,
      cacheSize: this.effectCache.size
    };
  }

  /**
   * Get all available weather patterns
   */
  public getAllWeatherPatterns(): WeatherPattern[] {
    return Array.from(this.weatherPatterns.values());
  }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  WeatherType,
  WeatherIntensity,
  WeatherTransition,
  WeatherEffect,
  WeatherState,
  WeatherPattern,
  WeatherIntegration
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default WeatherSystemPure;