export type TimerId = string;

export type Timer = { id: TimerId; duration: number; remaining: number; repeat?: boolean };
export type Cooldown = { id: string; duration: number; remaining: number };
export type Scheduled = { id: string; at: number; payload?: any };

export type TickOutput = { op: 'tick'; dt: number; time: number; fired: string[] };
export type ListOutput = { op: 'list'; timers: string[]; cooldowns: string[]; scheduled: string[] };
export type DumpOutput = { op: 'dump'; time: number; timers: Timer[]; cooldowns: Cooldown[]; scheduled: Scheduled[] };

export class TimeManager {
  private time = 0; // seconds
  private timers = new Map<string, Timer>();
  private cooldowns = new Map<string, Cooldown>();
  private scheduled: Scheduled[] = [];

  now(): number { return this.time; }

  list(): ListOutput {
    return { op: 'list', timers: Array.from(this.timers.keys()), cooldowns: Array.from(this.cooldowns.keys()), scheduled: this.scheduled.map(s=>s.id) };
  }

  addTimer(t: Timer): void { this.timers.set(t.id, { ...t, remaining: t.duration }); }
  addCooldown(id: string, duration: number): void { this.cooldowns.set(id, { id, duration, remaining: duration }); }
  schedule(id: string, at: number, payload?: any): void { this.scheduled.push({ id, at, payload }); this.scheduled.sort((a,b)=>a.at-b.at); }

  cancel(id: string): void { this.timers.delete(id); this.cooldowns.delete(id); this.scheduled = this.scheduled.filter(s=>s.id!==id); }

  tick(dt: number): TickOutput {
    this.time = Math.max(0, this.time + dt);
    const fired: string[] = [];

    // Update timers
    for (const t of this.timers.values()) {
      t.remaining -= dt;
      if (t.remaining <= 0) {
        fired.push(`timer:${t.id}`);
        if (t.repeat) t.remaining = t.duration; else this.timers.delete(t.id);
      }
    }

    // Update cooldowns
    for (const c of this.cooldowns.values()) {
      c.remaining = Math.max(0, c.remaining - dt);
      if (c.remaining === 0) fired.push(`cooldown:${c.id}`);
    }

    // Fire scheduled
    while (this.scheduled.length && this.scheduled[0].at <= this.time) {
      const s = this.scheduled.shift()!;
      fired.push(`scheduled:${s.id}`);
    }

    return { op: 'tick', dt, time: this.round(this.time), fired };
  }

  dump(): DumpOutput {
    return {
      op: 'dump',
      time: this.round(this.time),
      timers: Array.from(this.timers.values()).map(t=>({ ...t, remaining: this.round(t.remaining) })),
      cooldowns: Array.from(this.cooldowns.values()).map(c=>({ ...c, remaining: this.round(c.remaining) })),
      scheduled: this.scheduled.map(s=>({ ...s }))
    };
  }

  private round(n: number): number { return Math.round(n * 100) / 100; }
}