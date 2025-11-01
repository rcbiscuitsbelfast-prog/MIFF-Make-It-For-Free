/**
 * TimeSystemPure - AAA Quality Time Management System
 *
 * Advanced time management with day/night cycles and time manipulation
 *
 * @version 2.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/index.js';

export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'evening' | 'night' | 'midnight';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type TimeAcceleration = 'paused' | 'x1' | 'x2' | 'x5' | 'x10' | 'x50' | 'x100' | 'max';

export interface TimeData {
  currentTime: number;
  realTime: number;
  timeOfDay: TimeOfDay;
  season: Season;
  dayOfYear: number;
  hour: number;
  minute: number;
  second: number;
  dayProgress: number;
  seasonProgress: number;
  timeScale: number;
  acceleration: TimeAcceleration;
}

export interface TimeSystemConfig {
  initialTime?: number;
  dayLength?: number; // seconds per game day
  defaultAcceleration?: TimeAcceleration;
  enableSeasons?: boolean;
  debugMode?: boolean;
}

export class TimeSystemPure {
  private eventBus: EventBus;
  private config: TimeSystemConfig;
  private currentTimeData: TimeData;
  private isPaused: boolean = false;
  private lastUpdateTime: number = Date.now();
  private currentTimeScale: number = 1.0;
  private readonly UPDATE_INTERVAL = 1000;
  private readonly REAL_TIME_TO_GAME_TIME = 720; // 1 real second = 12 in-game minutes
  private readonly BASE_DAY_LENGTH = 1440; // seconds per default game day (24 minutes)

  constructor(eventBus: EventBus, config: TimeSystemConfig = {}) {
    const defaults: TimeSystemConfig = {
      initialTime: 0,
      dayLength: this.BASE_DAY_LENGTH,
      defaultAcceleration: 'x1',
      enableSeasons: true,
      debugMode: false
    };
    this.eventBus = eventBus;
    this.config = { ...defaults, ...config };
    this.currentTimeData = this.createInitialTimeData();
    this.startTimeUpdateLoop();
  }

  private createInitialTimeData(): TimeData {
    const gameTime = this.config.initialTime ?? 0;
    return this.buildTimeData(gameTime);
  }

  private buildTimeData(gameTime: number): TimeData {
    return {
      currentTime: gameTime,
      realTime: Date.now(),
      timeOfDay: this.getTimeOfDay(gameTime),
      season: this.getSeason(gameTime),
      dayOfYear: Math.floor(gameTime / (this.config.dayLength ?? this.BASE_DAY_LENGTH)),
      hour: this.convertToHour(gameTime),
      minute: Math.floor((gameTime % 3600) / 60),
      second: Math.floor(gameTime % 60),
      dayProgress: this.getDayProgress(gameTime),
      seasonProgress: this.getSeasonProgress(gameTime),
      timeScale: 1.0,
      acceleration: this.config.defaultAcceleration! || 'x1'
    };
  }

  private getTimeOfDay(gameTime: number): TimeOfDay {
    const rawHour = this.convertToHour(gameTime);
    const hour = ((rawHour % 24) + 24) % 24;
    if (hour >= 6 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 13) return 'noon';
    if (hour >= 13 && hour < 19) return 'afternoon';
    if (hour >= 19 && hour < 21) return 'dusk';
    if (hour >= 21 && hour < 23) return 'evening';
    if (hour >= 23 && hour < 24) return 'night';
    return 'midnight';
  }

  private getSeason(gameTime: number): Season {
    if (!this.config.enableSeasons) return 'summer';
    const dayOfYear = Math.floor(gameTime / (this.config.dayLength ?? this.BASE_DAY_LENGTH));
    const seasonIndex = Math.floor((dayOfYear % 120) / 30); // 30 days per season
    switch (seasonIndex) {
      case 0: return 'spring';
      case 1: return 'summer';
      case 2: return 'autumn';
      case 3: return 'winter';
      default: return 'summer';
    }
  }

  private convertToHour(gameTime: number): number {
    const dayLength = this.config.dayLength ?? this.BASE_DAY_LENGTH;
    const baseHour = gameTime / 3600;
    const ratio = this.BASE_DAY_LENGTH / dayLength;
    return baseHour * ratio;
  }

  private getDayProgress(gameTime: number): number {
    const hour = this.convertToHour(gameTime);
    const normalizedHour = ((hour % 24) + 24) % 24;
    return normalizedHour / 24;
  }

  private getSeasonProgress(gameTime: number): number {
    const dayOfYear = Math.floor(gameTime / (this.config.dayLength ?? this.BASE_DAY_LENGTH));
    return (dayOfYear % 30) / 30; // 30 days per season
  }

  private startTimeUpdateLoop(): void {
    setInterval(() => {
      if (!this.isPaused) {
        this.updateTime();
      }
    }, this.UPDATE_INTERVAL);
  }

  private updateTime(): void {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    if (deltaTime <= 0) return;

    const gameDeltaTime = deltaTime * this.REAL_TIME_TO_GAME_TIME * this.currentTimeScale;
    const newGameTime = this.currentTimeData.currentTime + gameDeltaTime;

    const oldTimeData = { ...this.currentTimeData };
    this.currentTimeData = this.updateTimeData(newGameTime);

    this.emitTimeEvents(oldTimeData);
  }

  private updateTimeData(newGameTime: number): TimeData {
    return {
      ...this.currentTimeData,
      currentTime: newGameTime,
      realTime: Date.now(),
      timeOfDay: this.getTimeOfDay(newGameTime),
      season: this.getSeason(newGameTime),
      dayOfYear: Math.floor(newGameTime / (this.config.dayLength! || 1440)),
      hour: this.convertToHour(newGameTime),
      minute: Math.floor((newGameTime % 3600) / 60),
      second: Math.floor(newGameTime % 60),
      dayProgress: this.getDayProgress(newGameTime),
      seasonProgress: this.getSeasonProgress(newGameTime),
      timeScale: this.currentTimeScale,
      acceleration: this.computeAccelerationFromScale()
    };
  }

  private computeAccelerationFromScale(): TimeAcceleration {
    if (this.currentTimeScale === 0) return 'paused';
    if (this.currentTimeScale === 1) return 'x1';
    if (this.currentTimeScale === 2) return 'x2';
    if (this.currentTimeScale === 5) return 'x5';
    if (this.currentTimeScale === 10) return 'x10';
    if (this.currentTimeScale === 50) return 'x50';
    if (this.currentTimeScale === 100) return 'x100';
    return 'max';
  }

  private emitTimeEvents(oldTimeData: TimeData): void {
    const newTimeData = this.currentTimeData;

    // Emit general time change
    this.emitWithEnvelope('time:change', {
      oldTime: oldTimeData,
      newTime: newTimeData,
      deltaTime: newTimeData.currentTime - oldTimeData.currentTime
    });

    // Emit time of day change
    if (oldTimeData.timeOfDay !== newTimeData.timeOfDay) {
      this.emitWithEnvelope('time:time_of_day_change', {
        old: oldTimeData.timeOfDay,
        new: newTimeData.timeOfDay
      });
    }

    // Emit season change
    if (oldTimeData.season !== newTimeData.season) {
      this.emitWithEnvelope('time:season_change', {
        old: oldTimeData.season,
        new: newTimeData.season
      });
    }
  }

  private emitWithEnvelope(eventType: string, data: Record<string, any>): void {
    this.eventBus.emit(eventType, {
      type: eventType,
      data,
      timestamp: new Date()
    });
  }

  // Public API methods
  public getCurrentTimeData(): TimeData {
    return { ...this.currentTimeData };
  }

  public setTimeAcceleration(acceleration: TimeAcceleration): void {
    const previous = this.currentTimeData.acceleration;
    switch (acceleration) {
      case 'paused': this.currentTimeScale = 0; break;
      case 'x1': this.currentTimeScale = 1; break;
      case 'x2': this.currentTimeScale = 2; break;
      case 'x5': this.currentTimeScale = 5; break;
      case 'x10': this.currentTimeScale = 10; break;
      case 'x50': this.currentTimeScale = 50; break;
      case 'x100': this.currentTimeScale = 100; break;
      case 'max': this.currentTimeScale = 1000; break;
    }

    this.currentTimeData.acceleration = acceleration;
    if (previous !== acceleration) {
      this.emitWithEnvelope('time:acceleration_change', {
        oldAcceleration: previous,
        newAcceleration: acceleration
      });
    }
  }

  public getCurrentAcceleration(): TimeAcceleration {
    return this.currentTimeData.acceleration;
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
    if (paused) {
      this.currentTimeScale = 0;
      this.currentTimeData.acceleration = 'paused';
    } else {
      const defaultAcceleration = this.config.defaultAcceleration! || 'x1';
      this.setTimeAcceleration(defaultAcceleration);
    }
  }

  public getStats(): any {
    return {
      currentTime: this.currentTimeData.currentTime,
      timeOfDay: this.currentTimeData.timeOfDay,
      season: this.currentTimeData.season,
      acceleration: this.currentTimeData.acceleration,
      dayProgress: this.currentTimeData.dayProgress,
      seasonProgress: this.currentTimeData.seasonProgress,
      timeScale: this.currentTimeScale
    };
  }

  public reset(initialTime?: number): void {
    const gameTime = initialTime ?? (this.config.initialTime ?? 0);
    this.currentTimeData = this.buildTimeData(gameTime);
  }
}

export default TimeSystemPure;