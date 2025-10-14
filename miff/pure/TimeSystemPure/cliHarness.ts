#!/usr/bin/env tsx

/**
 * TimeSystemPure CLI Harness
 *
 * Interactive time control and testing interface
 */

import { EventBus } from '../EventBusPure/index.js';
import TimeSystemPure, { TimeAcceleration } from './index.js';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

export class TimeSystemCLI {
  
  private timeSystem: TimeSystemPure;
  private eventBus: EventBus;
  private readline: any;

  constructor(...args: any[]) {
    
    this.eventBus = new EventBus();
    this.timeSystem = new TimeSystemPure(this.eventBus);
    this.setupEventHandlers();
    this.setupReadline();
  }

  private setupEventHandlers(): void {
    this.eventBus.on('time:time_of_day_change', (data) => {
      console.info(`🌅 Time changed: ${data.old} → ${data.new}`);
    });
  }

  private setupReadline(): void {
    this.readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'Time> '
    });

    this.readline.on('line', (line: string) => {
      this.processCommand(line.trim());
      this.readline.prompt();
    });

    this.readline.on('SIGINT', () => {
      console.info('\n👋 Shutting down...');
      this.readline.close();
      process.exit(0);
    });
  }

  private processCommand(command: string): void {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
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
        this.timeSystem.setPaused(true);
        console.info('⏸️  Paused');
        break;

      case 'resume':
        this.timeSystem.setPaused(false);
        console.info('▶️  Resumed');
        break;

      case 'reset':
        this.timeSystem.reset();
        console.info('🔄 Reset');
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
    const timeData = this.timeSystem.getCurrentTimeData();
//     const stats = this.timeSystem.getStats();

    console.info('\n=== TIME STATUS ===');
    console.info(`🕐 Time: ${Math.floor(timeData.hour)}:${Math.floor(timeData.minute)}:${Math.floor(timeData.second)}`);
    console.info(`🌅 Period: ${timeData.timeOfDay}`);
    console.info(`🍂 Season: ${timeData.season}`);
    console.info(`📊 Progress: ${(timeData.dayProgress * 100).toFixed(1)}%`);
    console.info(`⚡ Speed: ${timeData.acceleration}`);
    console.info('');
  }

  private setTime(args: string[]): void {
    if (args.length < 3) {
      console.info('Usage: set <hour> <minute> <second>');
      return;
    }

    const hour = parseInt(args[0]);
    const minute = parseInt(args[1]);
    const second = parseInt(args[2]);

    if (isNaN(hour) || isNaN(minute) || isNaN(second)) {
      console.info('Invalid time values');
      return;
    }

    const gameTime = hour * 3600 + minute * 60 + second;
    this.timeSystem.reset(gameTime);
    console.info(`✅ Set to ${hour}:${minute}:${second}`);
  }

  private setSpeed(args: string[]): void {
    if (args.length === 0) {
      console.info('Usage: speed <acceleration>');
      console.info('Accelerations: paused, x1, x2, x5, x10, x50, x100, max');
      return;
    }

    const acceleration = args[0] as TimeAcceleration;
    this.timeSystem.setTimeAcceleration(acceleration);
    console.info(`✅ Speed set to ${acceleration}`);
  }

  private showHelp(): void {
    console.info('\n=== TIME SYSTEM CLI ===');
    console.info('📊 status/s          - Show current time status');
    console.info('⏰ set <h> <m> <s>    - Set specific time');
    console.info('⚡ speed <accel>      - Set time acceleration');
    console.info('⏸️  pause             - Pause time system');
    console.info('▶️  resume            - Resume time system');
    console.info('🔄 reset             - Reset to 00:00:00');
    console.info('👋 quit/exit          - Exit CLI');
    console.info('');
    console.info('⚡ Accelerations: paused, x1, x2, x5, x10, x50, x100, max');
    console.info('');
  }

  public run(): void {
    console.info('⏰ TimeSystemPure CLI v1.0.0');
    console.info('Type "help" for commands');
    console.info('');
    this.readline.prompt();
  }
}

// CLI entry point
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const cli = new TimeSystemCLI();
  cli.run();
}

export default TimeSystemCLI;