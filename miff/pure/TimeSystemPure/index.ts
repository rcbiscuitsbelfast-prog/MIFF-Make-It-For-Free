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
  private readonly REAL_TIME_TO_GAME_TIME = 60; // 1 real second = 60 game seconds

  constructor(eventBus: EventBus, config: TimeSystemConfig = {
    initialTime: 0,
    dayLength: 1440, // 24 minutes = 1 game day
    defaultAcceleration: 'x1',
    enableSeasons: true,
    debugMode: false
  }) {
    this.eventBus = eventBus;
    this.config = config;
    this.currentTimeData = this.createInitialTimeData();
    this.startTimeUpdateLoop();
  }

  private createInitialTimeData(): TimeData {
    const gameTime = this.config.initialTime || 0;
    return {
      currentTime: gameTime,
      realTime: Date.now(),
      timeOfDay: this.getTimeOfDay(gameTime),
      season: this.getSeason(gameTime),
      dayOfYear: Math.floor(gameTime / (this.config.dayLength || 1440)),
      hour: this.convertToHour(gameTime),
      minute: Math.floor((gameTime % 3600) / 60),
      second: Math.floor(gameTime % 60),
      dayProgress: this.getDayProgress(gameTime),
      seasonProgress: this.getSeasonProgress(gameTime),
      timeScale: 1.0,
      acceleration: this.config.defaultAcceleration || 'x1'
    };
  }

  private getTimeOfDay(gameTime: number): TimeOfDay {
    const hour = this.convertToHour(gameTime);
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 13) return 'noon';
    if (hour >= 13 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 20) return 'dusk';
    if (hour >= 20 && hour < 22) return 'evening';
    if (hour >= 22 && hour < 24) return 'night';
    return 'midnight';
  }

  private getSeason(gameTime: number): Season {
    if (!this.config.enableSeasons) return 'summer';
    const dayOfYear = Math.floor(gameTime / (this.config.dayLength || 1440));
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
    const dayLength = this.config.dayLength || 1440;
    return (gameTime % dayLength) / (dayLength / 24);
  }

  private getDayProgress(gameTime: number): number {
    const dayLength = this.config.dayLength || 1440;
    return (gameTime % dayLength) / dayLength;
  }

  private getSeasonProgress(gameTime: number): number {
    const dayOfYear = Math.floor(gameTime / (this.config.dayLength || 1440));
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
      dayOfYear: Math.floor(newGameTime / (this.config.dayLength || 1440)),
      hour: this.convertToHour(newGameTime),
      minute: Math.floor((newGameTime % 3600) / 60),
      second: Math.floor(newGameTime % 60),
      dayProgress: this.getDayProgress(newGameTime),
      seasonProgress: this.getSeasonProgress(newGameTime),
      timeScale: this.currentTimeScale,
      acceleration: this.getCurrentAcceleration()
    };
  }


  private emitTimeEvents(oldTimeData: TimeData): void {
    const newTimeData = this.currentTimeData;

    // Emit general time change
    this.eventBus.emit('time:change', {
      oldTime: oldTimeData,
      newTime: newTimeData,
      deltaTime: newTimeData.currentTime - oldTimeData.currentTime,
      timestamp: Date.now()
    });

    // Emit time of day change
    if (oldTimeData.timeOfDay !== newTimeData.timeOfDay) {
      this.eventBus.emit('time:time_of_day_change', {
        old: oldTimeData.timeOfDay,
        new: newTimeData.timeOfDay,
        timestamp: Date.now()
      });
    }

    // Emit season change
    if (oldTimeData.season !== newTimeData.season) {
      this.eventBus.emit('time:season_change', {
        old: oldTimeData.season,
        new: newTimeData.season,
        timestamp: Date.now()
      });
    }
  }

  // Public API methods
  public getCurrentTimeData(): TimeData {
    return { ...this.currentTimeData };
  }

  public setTimeAcceleration(acceleration: TimeAcceleration): void {
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
  }

  public getCurrentAcceleration(): TimeAcceleration {
    return this.currentTimeData.acceleration;
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
    if (paused) {
      this.currentTimeScale = 0;
    } else {
      this.setTimeAcceleration(this.config.defaultAcceleration || 'x1');
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
    this.currentTimeData = this.createInitialTimeData();
    if (initialTime !== undefined) {
      this.currentTimeData.currentTime = initialTime;
    }
  }
}

export default TimeSystemPure;