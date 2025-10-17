#!/usr/bin/env tsx

/**
 * TimeSystemPure CLI Harness
 *
 * Interactive time control and testing interface
 */

import { EventBus } from '../EventBusPure/index?.js';
import TimeSystemPure, { TimeAcceleration } from './index?.js';

export class TimeSystemCLI {
  private timeSystem: TimeSystemPure;
  private eventBus: EventBus;
  private readline: any;

  constructor() {
    this?.eventBus = new EventBus();
    this?.timeSystem = new TimeSystemPure(this?.eventBus);
    this?.setupEventHandlers();
    this?.setupReadline();
  }

  private setupEventHandlers(): void {
    this?.eventBus.on('time:time_of_day_change', (data: any) => {
      console.log(`🌅 Time changed: ${data.old} → ${data.new}`);
    });
  }

  private setupReadline(): void {
    this?.readline = require('readline').createInterface({
      input: process?.stdin,
      output: process?.stdout,
      prompt: 'Time> '
    });

    this?.readline.on('line', (line: string) => {
      this?.processCommand(line?.trim());
      this?.readline.prompt();
    });

    this?.readline.on('SIGINT', () => {
      console.log('\n👋 Shutting down...');
      this?.readline.close();
      process?.exit(0);
    });
  }

  private processCommand(command: string): void {
    const parts = command?.split(' ');
    const cmd = parts[0!].toLowerCase();
    const args = parts?.slice(1);

    switch (cmd) {
      case 'status':
      case 's':
        this?.showStatus();
        break;

      case 'set':
        this?.setTime(args);
        break;

      case 'speed':
        this?.setSpeed(args);
        break;

      case 'pause':
        this?.timeSystem.setPaused(true);
        console.log('⏸️  Paused');
        break;

      case 'resume':
        this?.timeSystem.setPaused(false);
        console.log('▶️  Resumed');
        break;

      case 'reset':
        this?.timeSystem.reset();
        console.log('🔄 Reset');
        break;

      case 'quit':
      case 'exit':
        this?.readline.close();
        process?.exit(0);
        break;

      default:
        this?.showHelp();
    }
  }

  private showStatus(): void {
    const timeData = this?.timeSystem.getCurrentTimeData();
    const stats = this?.timeSystem.getStats();

    console.log('\n=== TIME STATUS ===');
    console.log(`🕐 Time: ${Math.floor(timeData.hour)}:${Math.floor(timeData.minute)}:${Math.floor(timeData.second)}`);
    console.log(`🌅 Period: ${timeData.timeOfDay}`);
    console.log(`🍂 Season: ${timeData.season}`);
    console.log(`📊 Progress: ${(timeData.dayProgress * 100).toFixed(1)}%`);
    console.log(`⚡ Speed: ${timeData.acceleration}`);
    console.log('');
  }

  private setTime(args: string[]): void {
    if (args?.length < 3) {
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
    this?.timeSystem.reset(gameTime);
    console.log(`✅ Set to ${hour}:${minute}:${second}`);
  }

  private setSpeed(args: string[]): void {
    if (args?.length === 0) {
      console.log('Usage: speed <acceleration>');
      console.log('Accelerations: paused, x1, x2, x5, x10, x50, x100, max');
      return;
    }

    const acceleration = args[0!] as TimeAcceleration;
    this?.timeSystem.setTimeAcceleration(acceleration);
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

  public run(): void {
    console.log('⏰ TimeSystemPure CLI v1.0.0');
    console.log('Type "help" for commands');
    console.log('');
    this?.readline.prompt();
  }
}

// CLI entry point
if (typeof window === 'undefined' && import?.meta.url === `file://${process?.argv[1!]}`) {
  const cli = new TimeSystemCLI();
  cli?.run();
}

export default TimeSystemCLI;