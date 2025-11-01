#!/usr/bin/env tsx

/**
 * TimeSystemPure CLI Harness
 *
 * Interactive time control and testing interface
 */

import fs from 'fs';
import path from 'path';
import { EventBus } from '../EventBusPure/index.js';
import TimeSystemPure, { TimeAcceleration } from './index.js';

export class TimeSystemCLI {
  private timeSystem: TimeSystemPure | null = null;
  private eventBus: EventBus | null = null;
  private readline: any;
  private timers: Array<{ id: string; duration: number; remaining: number; repeat: boolean }> = [];
  private cooldowns: Array<{ id: string; duration: number; remaining: number; category: string }> = [];
  private scheduledEvents: Array<{ id: string; at: number; fired: boolean }> = [];
  private currentTime = 0;

  constructor() {}

  private setupEventHandlers(): void {
    if (!this.eventBus) {
      return;
    }
    this.eventBus.on('time:time_of_day_change', (data) => {
      if (data?.old && data?.new) {
        console.log(`🌅 Time changed: ${data.old} → ${data.new}`);
      }
    });
  }

  private ensureTimeSystem(): TimeSystemPure {
    if (!this.timeSystem) {
      this.eventBus = new EventBus();
      this.timeSystem = new TimeSystemPure(this.eventBus);
      this.setupEventHandlers();
    }
    return this.timeSystem;
  }

  private async setupReadline(): Promise<void> {
    const readline = await import('readline');
    this.readline = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'Time> '
    });

    this.readline.on('line', (line: string) => {
      this.processCommand(line.trim());
      this.readline.prompt();
    });

    this.readline.on('SIGINT', () => {
      console.log('\n👋 Shutting down...');
      this.readline.close();
      process.exit(0);
    });
  }

  private executeStructuredCommand(command: any): any {
    switch (command.op) {
      case 'list':
        return {
          op: 'list',
          timers: this.timers.map(t => ({ id: t.id, duration: t.duration, remaining: round(t.remaining) })),
          cooldowns: this.cooldowns.map(c => ({ id: c.id, duration: c.duration, remaining: round(c.remaining), category: c.category })),
          scheduled: this.scheduledEvents.filter(e => !e.fired).map(e => ({ id: e.id, at: e.at }))
        };
      case 'addTimer': {
        const timer = {
          id: String(command.timer?.id ?? command.id ?? `timer_${this.timers.length + 1}`),
          duration: Number(command.timer?.duration ?? command.duration ?? 0),
          remaining: Number(command.timer?.remaining ?? command.duration ?? 0),
          repeat: Boolean(command.timer?.repeat ?? command.repeat ?? false)
        };
        this.timers = this.timers.filter(t => t.id !== timer.id);
        this.timers.push(timer);
        return { op: 'addTimer', id: timer.id, status: 'ok' };
      }
      case 'addCooldown': {
        const cooldown = {
          id: String(command.id ?? `cooldown_${this.cooldowns.length + 1}`),
          duration: Number(command.duration ?? 0),
          remaining: Number(command.duration ?? 0),
          category: String(command.category ?? 'general')
        };
        this.cooldowns = this.cooldowns.filter(c => c.id !== cooldown.id);
        this.cooldowns.push(cooldown);
        return { op: 'addCooldown', id: cooldown.id, duration: cooldown.duration, status: 'ok' };
      }
      case 'schedule': {
        const id = String(command.id ?? `event_${this.scheduledEvents.length + 1}`);
        const at = Number(command.at ?? 0);
        const existing = this.scheduledEvents.find(e => e.id === id);
        if (existing) {
          existing.at = at;
          existing.fired = false;
        } else {
          this.scheduledEvents.push({ id, at, fired: false });
        }
        return { op: 'schedule', id, at, status: 'ok' };
      }
      case 'tick': {
        const dt = Number(command.dt ?? 0);
        this.currentTime = round(this.currentTime + dt);
        const fired: string[] = [];

        // Update timers
        for (let i = 0; i < this.timers.length; i++) {
          const timer = this.timers[i];
          timer.remaining = Math.max(0, round(timer.remaining - dt));
          if (timer.remaining === 0) {
            fired.push(`timer:${timer.id}`);
            if (timer.repeat) {
              timer.remaining = timer.duration;
            } else {
              this.timers.splice(i, 1);
              i--;
            }
          }
        }

        // Update cooldowns
        for (const cooldown of this.cooldowns) {
          const previous = cooldown.remaining;
          cooldown.remaining = Math.max(0, round(cooldown.remaining - dt));
          if (previous > 0 && cooldown.remaining === 0) {
            fired.push(`cooldown:${cooldown.id}`);
          }
        }

        // Fire scheduled events
        for (const event of this.scheduledEvents) {
          if (!event.fired && this.currentTime >= event.at) {
            fired.push(`scheduled:${event.id}`);
            event.fired = true;
          }
        }

        return { op: 'tick', dt, time: this.currentTime, fired };
      }
      case 'dump':
        return {
          op: 'dump',
          time: this.currentTime,
          timers: this.timers.map(t => ({ id: t.id, duration: t.duration, remaining: round(t.remaining) })),
          cooldowns: this.cooldowns.map(c => ({ id: c.id, duration: c.duration, remaining: round(c.remaining), category: c.category })),
          scheduled: this.scheduledEvents.filter(e => !e.fired).map(e => ({ id: e.id, at: e.at }))
        };
      default:
        return { op: command.op ?? 'unknown', status: 'error', message: `Unsupported command: ${command.op}` };
    }
  }

  private processCommand(command: string): void {
    const parts = command.split(' ');
    const cmd = parts[0!].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'status':
      case 's':
        this.showStatus();
        break;

      case 'set':
        this.setTime(args);
        break;

      case 'speed':
        this.setSpeed(args);
        break;

      case 'pause':
        this.ensureTimeSystem().setPaused(true);
        console.log('⏸️  Paused');
        break;

      case 'resume':
        this.ensureTimeSystem().setPaused(false);
        console.log('▶️  Resumed');
        break;

      case 'reset':
        this.ensureTimeSystem().reset();
        console.log('🔄 Reset');
        break;

      case 'quit':
      case 'exit':
        this.readline.close();
        process.exit(0);
        break;

      default:
        this.showHelp();
    }
  }

  private showStatus(): void {
    const timeSystem = this.ensureTimeSystem();
    const timeData = timeSystem.getCurrentTimeData();
    const stats = timeSystem.getStats();

    console.log('\n=== TIME STATUS ===');
    console.log(`🕐 Time: ${Math.floor(timeData.hour)}:${Math.floor(timeData.minute)}:${Math.floor(timeData.second)}`);
    console.log(`🌅 Period: ${timeData.timeOfDay}`);
    console.log(`🍂 Season: ${timeData.season}`);
    console.log(`📊 Progress: ${(timeData.dayProgress * 100).toFixed(1)}%`);
    console.log(`⚡ Speed: ${timeData.acceleration}`);
    console.log('');
  }

  private setTime(args: string[]): void {
    if (args.length < 3) {
      console.log('Usage: set <hour> <minute> <second>');
      return;
    }

    const hour = parseInt(args[0!]);
    const minute = parseInt(args[1!]);
    const second = parseInt(args[2!]);

    if (isNaN(hour) || isNaN(minute) || isNaN(second)) {
      console.log('Invalid time values');
      return;
    }

    const gameTime = hour * 3600 + minute * 60 + second;
    this.ensureTimeSystem().reset(gameTime);
    console.log(`✅ Set to ${hour}:${minute}:${second}`);
  }

  private setSpeed(args: string[]): void {
    if (args.length === 0) {
      console.log('Usage: speed <acceleration>');
      console.log('Accelerations: paused, x1, x2, x5, x10, x50, x100, max');
      return;
    }

    const acceleration = args[0!] as TimeAcceleration;
    this.ensureTimeSystem().setTimeAcceleration(acceleration);
    console.log(`✅ Speed set to ${acceleration}`);
  }

  private showHelp(): void {
    console.log('\n=== TIME SYSTEM CLI ===');
    console.log('📊 status/s          - Show current time status');
    console.log('⏰ set <h> <m> <s>    - Set specific time');
    console.log('⚡ speed <accel>      - Set time acceleration');
    console.log('⏸️  pause             - Pause time system');
    console.log('▶️  resume            - Resume time system');
    console.log('🔄 reset             - Reset to 00:00:00');
    console.log('👋 quit/exit          - Exit CLI');
    console.log('');
    console.log('⚡ Accelerations: paused, x1, x2, x5, x10, x50, x100, max');
    console.log('');
  }

  public async run(): Promise<void> {
    if (!this.readline) {
      await this.setupReadline();
    }
    console.log('⏰ TimeSystemPure CLI v1.0.0');
    console.log('Type "help" for commands');
    console.log('');
    this.readline.prompt();
  }

  public runBatch(commandsPath: string): void {
    const payload = JSON.parse(fs.readFileSync(commandsPath, 'utf-8'));
    if (!Array.isArray(payload)) {
      throw new Error('Command file must contain an array of commands');
    }

    // Reset simulation state for batch execution
    this.timers = [];
    this.cooldowns = [];
    this.scheduledEvents = [];
    this.currentTime = 0;

    const outputs = [] as any[];
    for (const command of payload) {
      outputs.push(this.executeStructuredCommand(command));
    }

    console.log(JSON.stringify({ log: [], outputs }, null, 2));
  }
}

// CLI entry point
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1!]}`) {
  const cli = new TimeSystemCLI();
  const commandsPath = process.argv[2];
  if (commandsPath && commandsPath.endsWith('.json')) {
    cli.runBatch(pathResolve(commandsPath));
  } else {
    cli.run().catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
  }
}

export default TimeSystemCLI;

function pathResolve(p: string): string {
  return p && !path.isAbsolute(p) ? path.resolve(p) : p;
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}