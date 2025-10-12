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
  private logger: StructuredLogger;
  private timeSystem: TimeSystemPure;
  private eventBus: EventBus;
  private readline: any;

  constructor() {
    this.logger = new StructuredLogger({ module: 'TimeSystemCLI' });
    this.eventBus = new EventBus();
    this.timeSystem = new TimeSystemPure(this.eventBus);
    this.setupEventHandlers();
    this.setupReadline();
  }

  private setupEventHandlers(): void {
    this.eventBus.on('time:time_of_day_change', (data) => {
      this.logger.info(`🌅 Time changed: ${data.old} → ${data.new}`);
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
      this.logger.info('\n👋 Shutting down...');
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
        this.logger.info('⏸️  Paused');
        break;

      case 'resume':
        this.timeSystem.setPaused(false);
        this.logger.info('▶️  Resumed');
        break;

      case 'reset':
        this.timeSystem.reset();
        this.logger.info('🔄 Reset');
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
    const stats = this.timeSystem.getStats();

    this.logger.info('\n=== TIME STATUS ===');
    this.logger.info(`🕐 Time: ${Math.floor(timeData.hour)}:${Math.floor(timeData.minute)}:${Math.floor(timeData.second)}`);
    this.logger.info(`🌅 Period: ${timeData.timeOfDay}`);
    this.logger.info(`🍂 Season: ${timeData.season}`);
    this.logger.info(`📊 Progress: ${(timeData.dayProgress * 100).toFixed(1)}%`);
    this.logger.info(`⚡ Speed: ${timeData.acceleration}`);
    this.logger.info('');
  }

  private setTime(args: string[]): void {
    if (args.length < 3) {
      this.logger.info('Usage: set <hour> <minute> <second>');
      return;
    }

    const hour = parseInt(args[0]);
    const minute = parseInt(args[1]);
    const second = parseInt(args[2]);

    if (isNaN(hour) || isNaN(minute) || isNaN(second)) {
      this.logger.info('Invalid time values');
      return;
    }

    const gameTime = hour * 3600 + minute * 60 + second;
    this.timeSystem.reset(gameTime);
    this.logger.info(`✅ Set to ${hour}:${minute}:${second}`);
  }

  private setSpeed(args: string[]): void {
    if (args.length === 0) {
      this.logger.info('Usage: speed <acceleration>');
      this.logger.info('Accelerations: paused, x1, x2, x5, x10, x50, x100, max');
      return;
    }

    const acceleration = args[0] as TimeAcceleration;
    this.timeSystem.setTimeAcceleration(acceleration);
    this.logger.info(`✅ Speed set to ${acceleration}`);
  }

  private showHelp(): void {
    this.logger.info('\n=== TIME SYSTEM CLI ===');
    this.logger.info('📊 status/s          - Show current time status');
    this.logger.info('⏰ set <h> <m> <s>    - Set specific time');
    this.logger.info('⚡ speed <accel>      - Set time acceleration');
    this.logger.info('⏸️  pause             - Pause time system');
    this.logger.info('▶️  resume            - Resume time system');
    this.logger.info('🔄 reset             - Reset to 00:00:00');
    this.logger.info('👋 quit/exit          - Exit CLI');
    this.logger.info('');
    this.logger.info('⚡ Accelerations: paused, x1, x2, x5, x10, x50, x100, max');
    this.logger.info('');
  }

  public run(): void {
    this.logger.info('⏰ TimeSystemPure CLI v1.0.0');
    this.logger.info('Type "help" for commands');
    this.logger.info('');
    this.readline.prompt();
  }
}

// CLI entry point
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const cli = new TimeSystemCLI();
  cli.run();
}

export default TimeSystemCLI;