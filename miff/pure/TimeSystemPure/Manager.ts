/**
 * TimeManagerPure - Advanced Time Management Manager
 *
 * Manages timers, cooldowns, scheduled events, and time scaling
 * with AAA-quality features and integration capabilities.
 */

export type TimerId = string;

export interface Timer {
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
  id: string;
  duration: number;
  remaining: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface ScheduledEvent {
  id: string;
  at: number;
  payload?: any;
  callback?: () => void;
  metadata?: Record<string, any>;
}

export interface TimeScale {
  id: string;
  factor: number;
  duration?: number;
  startTime: number;
  endTime?: number;
  metadata?: Record<string, any>;
}

export interface TimeStats {
  totalTimers: number;
  activeTimers: number;
  totalCooldowns: number;
  activeCooldowns: number;
  scheduledEvents: number;
  timeScales: number;
  averageTimerDuration: number;
  averageCooldownDuration: number;
}

export interface TimeFilter {
  type?: 'timer' | 'cooldown' | 'scheduled' | 'scale';
  category?: string;
  minDuration?: number;
  maxDuration?: number;
  active?: boolean;
}

export interface TimeOutput {
  op: string;
  status: 'ok' | 'error';
  result?: Timer | Cooldown | ScheduledEvent | TimeScale | TimeStats | string;
  issues?: string[];
}

export interface TimeManagerConfig {
  initialTime?: number;
  updateInterval?: number;
  enablePersistence?: boolean;
  debugMode?: boolean;
}

export class TimeManager {
  private time = 0; // seconds
  private timers = new Map<string, Timer>();
  private cooldowns = new Map<string, Cooldown>();
  private scheduled: ScheduledEvent[] = [];
  private timeScales = new Map<string, TimeScale>();
  private paused = false;
  private timeScale = 1.0;
  private stats: TimeStats;
  private config: TimeManagerConfig;
  private updateInterval: number;

  constructor(config: TimeManagerConfig = {
    initialTime: 0,
    updateInterval: 1000,
    enablePersistence: false,
    debugMode: false
  }) {
    this.config = config;
    this.updateInterval = config.updateInterval || 1000;
    this.time = config.initialTime || 0;

    this.stats = {
      totalTimers: 0,
      activeTimers: 0,
      totalCooldowns: 0,
      activeCooldowns: 0,
      scheduledEvents: 0,
      timeScales: 0,
      averageTimerDuration: 0,
      averageCooldownDuration: 0
    };

    this.startUpdateLoop();
  }

  /**
   * Get current time
   */
  now(): number { 
    return this.round(this.time); 
  }

  /**
   * Set time scale
   */
  setTimeScale(scale: number): TimeOutput {
    this.timeScale = Math.max(0, scale);
    return {
      op: 'set-scale',
      status: 'ok',
      result: `Time scale set to ${this.timeScale}`
    };
  }

  /**
   * Pause time
   */
  pause(): TimeOutput {
    this.paused = true;
    return {
      op: 'pause',
      status: 'ok',
      result: 'Time paused'
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
      result: 'Time resumed'
    };
  }

  /**
   * Add timer
   */
  addTimer(timer: Timer): TimeOutput {
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
  addCooldown(id: string, duration: number, category?: string): TimeOutput {
    const cooldown: Cooldown = {
      id,
      duration,
      remaining: duration,
      category
    };
    
    this.cooldowns.set(id, cooldown);
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
  schedule(id: string, at: number, payload?: any, callback?: () => void): TimeOutput {
    const scheduled: ScheduledEvent = {
      id,
      at,
      payload,
      callback
    };
    
    this.scheduled.push(scheduled);
    this.scheduled.sort((a: any, b: any) => a.at - b.at);
    this.stats.scheduledEvents++;
    
    return {
      op: 'schedule',
      status: 'ok',
      result: scheduled
    };
  }

  /**
   * Add time scale
   */
  addTimeScale(scale: TimeScale): TimeOutput {
    this.timeScales.set(scale.id, scale);
    this.stats.timeScales++;
    
    return {
      op: 'add-scale',
      status: 'ok',
      result: scale
    };
  }

  /**
   * Cancel timer/cooldown/scheduled event
   */
  cancel(id: string): TimeOutput {
    let cancelled = false;
    
    if (this.timers.has(id)) {
      this.timers.delete(id);
      this.stats.activeTimers--;
      cancelled = true;
    }
    
    if (this.cooldowns.has(id)) {
      this.cooldowns.delete(id);
      this.stats.activeCooldowns--;
      cancelled = true;
    }
    
    const scheduledIndex = this.scheduled.findIndex(s => s.id === id);
    if (scheduledIndex !== -1) {
      this.scheduled.splice(scheduledIndex, 1);
      this.stats.scheduledEvents--;
      cancelled = true;
    }
    
    if (this.timeScales.has(id)) {
      this.timeScales.delete(id);
      this.stats.timeScales--;
      cancelled = true;
    }
    
    if (!cancelled) {
      return {
        op: 'cancel',
        status: 'error',
        issues: [`No timer, cooldown, or scheduled event found with ID ${id}`]
      };
    }
    
    return {
      op: 'cancel',
      status: 'ok',
      result: `Cancelled ${id}`
    };
  }

  /**
   * Check if cooldown is ready
   */
  isCooldownReady(id: string): TimeOutput {
    const cooldown = this.cooldowns.get(id);
    if (!cooldown) {
      return {
        op: 'check-cooldown',
        status: 'error',
        issues: [`Cooldown with ID ${id} not found`]
      };
    }
    
    return {
      op: 'check-cooldown',
      status: 'ok',
      result: {
        id,
        ready: cooldown.remaining <= 0,
        remaining: cooldown.remaining
      }
    };
  }

  /**
   * Get remaining time for timer/cooldown
   */
  getRemainingTime(id: string): TimeOutput {
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
  tick(dt: number): TimeOutput {
    if (this.paused) {
      return {
        op: 'tick',
        status: 'ok',
        result: {
          dt: 0,
          time: this.time,
          fired: [],
          paused: true
        }
      };
    }

    // Apply time scale
    const scaledDt = dt * this.timeScale;
    this.time = Math.max(0, this.time + scaledDt);
    const fired: string[] = [];

    // Determine if scheduled events will fire this tick; used to gate lenient timer firing
    const willFireScheduledThisTick = this.scheduled.length > 0 && this.scheduled[0].at <= this.time;
    const allowLenientTimerFire = !willFireScheduledThisTick;

    // Update timers
    for (const timer of this.timers.values()) {
      timer.remaining -= scaledDt;
      // Simple timer firing - fire when remaining time reaches zero or below
      if (timer.remaining <= 0) {
        fired.push(`timer:${timer.id}`);
        
        if (timer.callback) {
          try {
            timer.callback();
          } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
            console.error(`Error in timer callback ${timer.id}:`, err instanceof Error ? err.message : String(err));
          }
        }
        
        if (timer.repeat) {
          timer.currentRepeats = (timer.currentRepeats || 0) + 1;
          if (timer.maxRepeats && timer.currentRepeats >= timer.maxRepeats) {
            this.timers.delete(timer.id);
            this.stats.activeTimers--;
          } else {
            timer.remaining = timer.duration;
          }
        } else {
          this.timers.delete(timer.id);
          this.stats.activeTimers--;
        }
      }
    }

    // Update cooldowns
    for (const cooldown of this.cooldowns.values()) {
      cooldown.remaining = Math.max(0, cooldown.remaining - scaledDt);
      if (cooldown.remaining === 0) {
        fired.push(`cooldown:${cooldown.id}`);
      }
    }

    // Fire scheduled events
    while (this.scheduled.length && this.scheduled[0].at <= this.time) {
      const scheduled = this.scheduled.shift()!;
      fired.push(`scheduled:${scheduled.id}`);
      
      if (scheduled.callback) {
        try {
          scheduled.callback();
        } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
          console.error(`Error in scheduled event callback ${scheduled.id}:`, err instanceof Error ? err.message : String(err));
        }
      }
      
      this.stats.scheduledEvents--;
    }

    // Update time scales
    for (const scale of this.timeScales.values()) {
      if (scale.duration && this.time >= scale.startTime + scale.duration) {
        this.timeScales.delete(scale.id);
        this.stats.timeScales--;
      }
    }

    return {
      op: 'tick',
      status: 'ok',
      result: {
        dt: scaledDt,
        time: this.round(this.time),
        fired,
        paused: false
      }
    };
  }

  /**
   * List all timers, cooldowns, and scheduled events
   */
  list(filter?: TimeFilter): TimeOutput {
    let timers = Array.from(this.timers.values());
    let cooldowns = Array.from(this.cooldowns.values());
    let scheduled = [...this.scheduled];
    let scales = Array.from(this.timeScales.values());

    if (filter) {
      if (filter.type === 'timer') {
        cooldowns = [];
        scheduled = [];
        scales = [];
      } else if (filter.type === 'cooldown') {
        timers = [];
        scheduled = [];
        scales = [];
      } else if (filter.type === 'scheduled') {
        timers = [];
        cooldowns = [];
        scales = [];
      } else if (filter.type === 'scale') {
        timers = [];
        cooldowns = [];
        scheduled = [];
      }

      if (filter.category) {
        timers = timers.filter((t: any) => t.metadata?.category === filter.category);
        cooldowns = cooldowns.filter((c: any) => c.category === filter.category);
      }

      if (filter.minDuration !== undefined) {
        timers = timers.filter((t: any) => t.duration >= filter.minDuration!);
        cooldowns = cooldowns.filter((c: any) => c.duration >= filter.minDuration!);
      }

      if (filter.maxDuration !== undefined) {
        timers = timers.filter((t: any) => t.duration <= filter.maxDuration!);
        cooldowns = cooldowns.filter((c: any) => c.duration <= filter.maxDuration!);
      }

      if (filter.active !== undefined) {
        if (filter.active) {
          timers = timers.filter((t: any) => t.remaining > 0);
          cooldowns = cooldowns.filter((c: any) => c.remaining > 0);
        } else {
          timers = timers.filter((t: any) => t.remaining <= 0);
          cooldowns = cooldowns.filter((c: any) => c.remaining <= 0);
        }
      }
    }

    return {
      op: 'list',
      status: 'ok',
      result: {
        timers: timers.map((t: any) => ({ id: t.id, remaining: this.round(t.remaining), duration: t.duration })),
        cooldowns: cooldowns.map((c: any) => ({ id: c.id, remaining: this.round(c.remaining), duration: c.duration })),
        scheduled: scheduled.map((s: any) => ({ id: s.id, at: s.at })),
        scales: scales.map((s: any) => ({ id: s.id, factor: s.factor, startTime: s.startTime }))
      }
    };
  }

  /**
   * Get time statistics
   */
  getStats(): TimeOutput {
    const totalTimerDuration = Array.from(this.timers.values()).reduce((sum, t) => sum + t.duration, 0);
    const totalCooldownDuration = Array.from(this.cooldowns.values()).reduce((sum, c) => sum + c.duration, 0);

    this.stats.averageTimerDuration = this.stats.totalTimers > 0 ? totalTimerDuration / this.stats.totalTimers : 0;
    this.stats.averageCooldownDuration = this.stats.totalCooldowns > 0 ? totalCooldownDuration / this.stats.totalCooldowns : 0;

    return {
      op: 'stats',
      status: 'ok',
      result: { ...this.stats }
    };
  }

  /**
   * Export time data
   */
  exportTime(format: 'json' | 'manifest' | 'summary' | 'events' = 'json'): TimeOutput {
    switch (format) {
      case 'json':
        return {
          op: 'export',
          status: 'ok',
          result: {
            time: this.time,
            timers: Array.from(this.timers.values()),
            cooldowns: Array.from(this.cooldowns.values()),
            scheduled: this.scheduled,
            scales: Array.from(this.timeScales.values()),
            stats: this.stats
          }
        };
      
      case 'manifest':
        return {
          op: 'export',
          status: 'ok',
          result: {
            schema: 'miff.time.export.v1',
            time: this.time,
            timers: Array.from(this.timers.values()),
            cooldowns: Array.from(this.cooldowns.values()),
            scheduled: this.scheduled,
            scales: Array.from(this.timeScales.values()),
            exportedAt: Date.now().toISOString(),
            stats: this.stats
          }
        };
      
      case 'summary':
        return {
          op: 'export',
          status: 'ok',
          result: {
            summary: this.stats,
            currentTime: this.time,
            paused: this.paused,
            timeScale: this.timeScale,
            activeCounts: {
              timers: this.stats.activeTimers,
              cooldowns: this.stats.activeCooldowns,
              scheduled: this.stats.scheduledEvents,
              scales: this.stats.timeScales
            }
          }
        };
      
      case 'events':
        return {
          op: 'export',
          status: 'ok',
          result: {
            scheduled: this.scheduled,
            total: this.scheduled.length
          }
        };
      
      default:
        return {
          op: 'export',
          status: 'error',
          issues: [`Unknown export format: ${format}`]
        };
    }
  }

  /**
   * Reset time system
   */
  resetTime(): TimeOutput {
    this.time = 0;
    this.timers.clear();
    this.cooldowns.clear();
    this.scheduled = [];
    this.timeScales.clear();
    this.paused = false;
    this.timeScale = 1.0;
    this.stats = {
      totalTimers: 0,
      activeTimers: 0,
      totalCooldowns: 0,
      activeCooldowns: 0,
      scheduledEvents: 0,
      timeScales: 0,
      averageTimerDuration: 0,
      averageCooldownDuration: 0
    };
    
    return {
      op: 'reset',
      status: 'ok',
      result: 'Time system reset'
    };
  }

  /**
   * Dump current state
   */
  dump(): TimeOutput {
    return {
      op: 'dump',
      status: 'ok',
      result: {
        time: this.round(this.time),
        timers: Array.from(this.timers.values()).map((t: any) => ({
          ...t,
          remaining: this.round(t.remaining)
        })),
        cooldowns: Array.from(this.cooldowns.values()).map((c: any) => ({
          ...c,
          remaining: this.round(c.remaining)
        })),
        scheduled: this.scheduled.map((s: any) => ({ ...s })),
        scales: Array.from(this.timeScales.values()),
        paused: this.paused,
        timeScale: this.timeScale
      }
    };
  }

  private round(n: number): number { 
    return Math.round(n * 100) / 100; 
  }
}