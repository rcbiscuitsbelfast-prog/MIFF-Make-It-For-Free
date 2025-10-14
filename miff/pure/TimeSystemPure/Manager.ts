/**
 * TimeManagerPure - Advanced Time Management Manager
 *
 * Manages timers, cooldowns, scheduled events, and time scaling
 * with AAA-quality features and integration capabilities.
 */

export type TimerId = string;

export interface Timer {
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
  id: TimerId;
  duration: number;
  remaining: number;
  repeat?: boolean;
  maxRepeats?: number;
  currentRepeats?: number;
  callback?: () => void;
  metadata?: Record<string, any>;
}

export interface Cooldown {
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
  duration: number;
  remaining: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface ScheduledEvent {
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
  at: number;
  payload?: any;
  callback?: () => void;
  metadata?: Record<string, any>;
}

export interface TimeScale {
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
  factor: number;
  duration?: number;
  startTime: number;
  endTime?: number;
  metadata?: Record<string, any>;
}

export interface TimeStats {
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
  totalTimers: number;
  activeTimers: number;
  totalCooldowns: number;
  activeCooldowns: number;
  scheduledEvents: number;
  timeScales: number;
  averageTimerDuration: number;
  averageCooldownDuration: number;
  totalUpdates: number;
}

export interface TimeOutput {
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
  op: string;
  status: 'ok' | 'error';
  result?: any;
  issues?: string[];
}

export class TimeManagerPure {
  private timers: Map<TimerId, Timer> = new Map();
  private cooldowns: Map<string, Cooldown> = new Map();
  private scheduledEvents: Map<string, ScheduledEvent> = new Map();
  private timeScales: Map<string, TimeScale> = new Map();
  private time: number = 0;
  private paused: boolean = false;
  private updateInterval: number = 16; // 60 FPS
  private stats: TimeStats;

  constructor(updateInterval: number = 16) {
    this.updateInterval = updateInterval;
    this.time = Date.now();

    this.stats = {
      totalTimers: 0,
      activeTimers: 0,
      totalCooldowns: 0,
      activeCooldowns: 0,
      scheduledEvents: 0,
      timeScales: 0,
      averageTimerDuration: 0,
      averageCooldownDuration: 0,
      totalUpdates: 0
    };

    this.startUpdateLoop();
  }

  /**
   * Start the update loop
   */
  private startUpdateLoop(): void {
    if (this.updateInterval && this.updateInterval > 0) {
      setInterval(() => {
        this.update();
      }, this.updateInterval);
    }
  }

  /**
   * Add timer
   */
  addTimer(): TimeOutput {
    const newTimer = {
      ...timer,
      remaining: timer.duration,
      currentRepeats: 0
    };
    
    this.timers.set(timer.id, newTimer);
    this.stats.totalTimers++;
    this.stats.activeTimers++;
    
    return {
      op: 'add-timer',
      status: 'ok',
      result: newTimer
    };
  }

  /**
   * Add cooldown
   */
  addCooldown(): TimeOutput {
    const newCooldown = {
      ...cooldown,
      remaining: cooldown.duration
    };
    
    this.cooldowns.set(cooldown.id, newCooldown);
    this.stats.totalCooldowns++;
    this.stats.activeCooldowns++;
    
    return {
      op: 'add-cooldown',
      status: 'ok',
      result: cooldown
    };
  }

  /**
   * Schedule event
   */
  scheduleEvent(): TimeOutput {
    this.scheduledEvents.set(event.id, event);
    this.stats.scheduledEvents++;
    
    return {
      op: 'schedule-event',
      status: 'ok',
      result: event
    };
  }

  /**
   * Add time scale
   */
  addTimeScale(): TimeOutput {
    const newScale = {
      ...scale,
      startTime: this.time
    };
    
    this.timeScales.set(scale.id, newScale);
    this.stats.timeScales++;
    
    return {
      op: 'add-time-scale',
      status: 'ok',
      result: newScale
    };
  }

  /**
   * Get remaining time for timer/cooldown
   */
  getRemainingTime(): TimeOutput {
    const timer = this.timers.get(id);
    const cooldown = this.cooldowns.get(id);
    
    if (timer) {
      return {
        op: 'get-remaining',
        status: 'ok',
        result: {
          id,
          type: 'timer',
          remaining: timer.remaining
        }
      };
    }
    
    if (cooldown) {
      return {
        op: 'get-remaining',
        status: 'ok',
        result: {
          id,
          type: 'cooldown',
          remaining: cooldown.remaining
        }
      };
    }
    
    return {
      op: 'get-remaining',
      status: 'error',
      issues: [`No timer or cooldown found with ID ${id}`]
    };
  }

  /**
   * Tick time forward
   */
  tick(): TimeOutput {
    if (this.paused) {
      return {
        op: 'tick',
        status: 'ok',
        result: {
          dt: 0,
          time: this.time,
          paused: true
        }
      };
    }

    const timeScale = this.getCurrentTimeScale();
    const scaledDt = dt * timeScale;
    
    this.time += scaledDt;
    this.stats.totalUpdates++;
    
    // Update timers
    this.updateTimers(scaledDt);
    
    // Update cooldowns
    this.updateCooldowns(scaledDt);
    
    // Check scheduled events
    this.checkScheduledEvents();
    
    // Clean up expired time scales
    this.cleanupTimeScales();
    
    return {
      op: 'tick',
      status: 'ok',
      result: {
        dt: scaledDt,
        time: this.time,
        paused: false
      }
    };
  }

  /**
   * Update all timers
   */
  private updateTimers(dt: number): void {
    for (const [id, timer] of this.timers) {
      timer.remaining -= dt;
      
      if (timer.remaining <= 0) {
        if (timer.callback) {
          timer.callback();
        }
        
        if (timer.repeat && (!timer.maxRepeats || timer.currentRepeats < timer.maxRepeats)) {
          timer.currentRepeats = (timer.currentRepeats || 0) + 1;
          timer.remaining = timer.duration;
        } else {
          this.timers.delete(id);
          this.stats.activeTimers--;
        }
      }
    }
  }

  /**
   * Update all cooldowns
   */
  private updateCooldowns(dt: number): void {
    for (const [id, cooldown] of this.cooldowns) {
      cooldown.remaining -= dt;
      
      if (cooldown.remaining <= 0) {
        this.cooldowns.delete(id);
        this.stats.activeCooldowns--;
      }
    }
  }

  /**
   * Check for scheduled events
   */
  private checkScheduledEvents(): void {
    for (const [id, event] of this.scheduledEvents) {
      if (this.time >= event.at) {
        if (event.callback) {
          event.callback();
        }
        this.scheduledEvents.delete(id);
        this.stats.scheduledEvents--;
      }
    }
  }

  /**
   * Clean up expired time scales
   */
  private cleanupTimeScales(): void {
    for (const [id, scale] of this.timeScales) {
      if (scale.duration && this.time >= scale.startTime + scale.duration) {
        this.timeScales.delete(id);
        this.stats.timeScales--;
      }
    }
  }

  /**
   * Get current time scale factor
   */
  private getCurrentTimeScale(): number {
    let factor = 1.0;
    
    for (const scale of this.timeScales.values()) {
      if (!scale.duration || this.time < scale.startTime + scale.duration) {
        factor *= scale.factor;
      }
    }
    
    return factor;
  }

  /**
   * Pause time
   */
  pause(): TimeOutput {
    this.paused = true;
    return {
      op: 'pause',
      status: 'ok',
      result: { paused: true }
    };
  }

  /**
   * Resume time
   */
  resume(): TimeOutput {
    this.paused = false;
    return {
      op: 'resume',
      status: 'ok',
      result: { paused: false }
    };
  }

  /**
   * Get current time
   */
  getCurrentTime(): number {
    return this.time;
  }

  /**
   * Get statistics
   */
  getStats(): TimeStats {
    return { ...this.stats };
  }

  /**
   * Clear all timers
   */
  clearTimers(): TimeOutput {
    const count = this.timers.size;
    this.timers.clear();
    this.stats.activeTimers = 0;
    
    return {
      op: 'clear-timers',
      status: 'ok',
      result: { cleared: count }
    };
  }

  /**
   * Clear all cooldowns
   */
  clearCooldowns(): TimeOutput {
    const count = this.cooldowns.size;
    this.cooldowns.clear();
    this.stats.activeCooldowns = 0;
    
    return {
      op: 'clear-cooldowns',
      status: 'ok',
      result: { cleared: count }
    };
  }

  /**
   * Clear all scheduled events
   */
  clearScheduledEvents(): TimeOutput {
    const count = this.scheduledEvents.size;
    this.scheduledEvents.clear();
    this.stats.scheduledEvents = 0;
    
    return {
      op: 'clear-scheduled-events',
      status: 'ok',
      result: { cleared: count }
    };
  }

  /**
   * Clear all time scales
   */
  clearTimeScales(): TimeOutput {
    const count = this.timeScales.size;
    this.timeScales.clear();
    this.stats.timeScales = 0;
    
    return {
      op: 'clear-time-scales',
      status: 'ok',
      result: { cleared: count }
    };
  }

  /**
   * Reset all time systems
   */
  reset(): TimeOutput {
    this.clearTimers();
    this.clearCooldowns();
    this.clearScheduledEvents();
    this.clearTimeScales();
    
    this.time = Date.now();
    this.paused = false;
    
    return {
      op: 'reset',
      status: 'ok',
      result: { reset: true }
    };
  }

  /**
   * Update method called by the update loop
   */
  private update(): void {
    const now = Date.now();
    const dt = now - this.time;
    this.tick(dt);
  }
}