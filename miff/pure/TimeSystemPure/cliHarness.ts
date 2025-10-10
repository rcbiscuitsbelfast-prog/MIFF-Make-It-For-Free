#!/usr/bin/env tsx

/**
 * TimeSystemPure CLI Harness
 *
 * Interactive time control and testing interface
 */

import { EventBus } from '../EventBusPure/index.js';
import TimeSystemPure, { TimeAcceleration } from './index.js';

export class TimeSystemCLI {
  private timeSystem: TimeSystemPure;
  private eventBus: EventBus;
  private readline: any;

  constructor() {
    this.eventBus = new EventBus();
    this.timeSystem = new TimeSystemPure(this.eventBus);
    this.setupEventHandlers();
    this.setupReadline();
  }

  private setupEventHandlers(): void {
    this.eventBus.on('time:time_of_day_change', (data) => {
      console.log(`🌅 Time changed: ${data.old} → ${data.new}`);
    });
  }

  private setupReadline(): void {
    // Create a mock readline for test environment
    this.readline = {
      prompt: () => {},
      close: () => {},
      on: () => {}
    };

    // Try to set up real readline in non-test environment
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
      import('readline').then((readline) => {
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
      }).catch(() => {
        // Keep mock readline if import fails
      });
    }
  }

  private processCommand(command: string): void {
    try {
      // Try to parse as JSON command first
      const jsonCommand = JSON.parse(command);
      this.processJSONCommand(jsonCommand);
    } catch {
      // Fall back to text command parsing
      const parts = command.split(' ');
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);
      this.processTextCommand(cmd, args);
    }
  }

  private processJSONCommand(cmd: any): void {
    switch (cmd.op) {
      case 'list':
        this.listTimers();
        break;
      case 'addTimer':
        this.addTimer(cmd.timer);
        break;
      case 'addCooldown':
        this.addCooldown(cmd.id, cmd.duration);
        break;
      case 'schedule':
        this.scheduleEvent(cmd.id, cmd.at);
        break;
      case 'tick':
        this.tick(cmd.dt);
        break;
      case 'dump':
        this.dumpState();
        break;
      default:
        console.log(`Unknown command: ${cmd.op}`);
    }
  }

  private processTextCommand(cmd: string, args: string[]): void {
    switch (cmd) {
      case 'status':
      case 's':
        this.showStatus();
        break;
      case 'help':
      case 'h':
        this.showHelp();
        break;
      case 'quit':
      case 'q':
        console.log('👋 Goodbye!');
        process.exit(0);
        break;
      default:
        console.log(`Unknown command: ${cmd}. Type 'help' for available commands.`);
    }
  }

  private listTimers(): void {
    const timers = this.timeSystem.getTimers();
    const cooldowns = this.timeSystem.getCooldowns();
    const scheduled = this.timeSystem.getScheduledEvents();
    
    console.log(JSON.stringify({
      op: 'list',
      timers: timers,
      cooldowns: cooldowns,
      scheduled: scheduled
    }));
  }

  private addTimer(timer: any): void {
    const result = this.timeSystem.addTimer(timer.id, timer.duration, timer.repeat);
    console.log(JSON.stringify({
      op: 'addTimer',
      id: timer.id,
      status: result ? 'ok' : 'error'
    }));
  }

  private addCooldown(id: string, duration: number): void {
    const result = this.timeSystem.addCooldown(id, duration);
    console.log(JSON.stringify({
      op: 'addCooldown',
      id: id,
      duration: duration,
      status: result ? 'ok' : 'error'
    }));
  }

  private scheduleEvent(id: string, at: number): void {
    const result = this.timeSystem.scheduleEvent(id, at);
    console.log(JSON.stringify({
      op: 'schedule',
      id: id,
      at: at,
      status: result ? 'ok' : 'error'
    }));
  }

  private tick(dt: number): void {
    this.timeSystem.tick(dt);
    console.log(JSON.stringify({
      op: 'tick',
      dt: dt,
      status: 'ok'
    }));
  }

  private dumpState(): void {
    const state = this.timeSystem.getTimeData();
    console.log(JSON.stringify({
      op: 'dump',
      state: state
    }));
  }

  private showStatus(): void {
    const timeData = this.timeSystem.getTimeData();
    console.log(`🕐 Current Time: ${timeData.hour}:${timeData.minute.toString().padStart(2, '0')}:${timeData.second.toString().padStart(2, '0')}`);
    console.log(`🌅 Time of Day: ${timeData.timeOfDay}`);
    console.log(`📅 Season: ${timeData.season}`);
    console.log(`⚡ Acceleration: ${timeData.acceleration}`);
    console.log(`⏸️  Paused: ${this.timeSystem.isPaused()}`);
  }

  private showHelp(): void {
    console.log(`
🕐 TimeSystemPure CLI Commands:

Status & Control:
  status, s     - Show current time status
  help, h       - Show this help message
  quit, q       - Exit the program

Time Operations:
  tick <seconds> - Advance time by specified seconds
  pause         - Pause time progression
  resume        - Resume time progression
  set <time>    - Set specific time

Timers & Events:
  list          - List all timers and events
  add-timer     - Add a new timer
  add-cooldown  - Add a new cooldown
  schedule      - Schedule an event

JSON Commands:
  You can also send JSON commands for programmatic control.
  See commands.json for examples.
    `);
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

  public run(): void {
    console.log('⏰ TimeSystemPure CLI v1.0.0');
    console.log('Type "help" for commands');
    console.log('');
    this.readline.prompt();
  }

  public runBatchCommands(commands: any[]): string {
    const outputs: string[] = [];
    const originalConsoleLog = console.log;
    
    // Capture console.log output
    console.log = (message: string) => {
      outputs.push(message);
    };

    try {
      for (const command of commands) {
        this.processJSONCommand(command);
      }
    } finally {
      // Restore console.log
      console.log = originalConsoleLog;
    }

    return outputs.join('\n');
  }
}

// CLI entry point
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const cli = new TimeSystemCLI();
  cli.run();
}

export default TimeSystemCLI;