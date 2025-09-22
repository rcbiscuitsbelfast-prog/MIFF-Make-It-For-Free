#!/usr/bin/env tsx

import { TimeManager, Timer, Cooldown, ScheduledEvent, TimeScale } from './Manager';
import * as fs from 'fs';
import * as path from 'path';

interface TimeSystemOperation {
  op: 'list' | 'addTimer' | 'addCooldown' | 'schedule' | 'tick' | 'dump' | 'reset' | 'now';
  timer?: Timer;
  id?: string;
  duration?: number;
  category?: string;
  at?: number;
  payload?: any;
  dt?: number;
}

function parseFlags(argv: string[]): Record<string, any> {
  const out: Record<string, any> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.replace(/^--/, '');
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      out[key] = /^\d+(?:\.\d+)?$/.test(next) ? Number(next) : next;
      i++;
    } else {
      out[key] = true;
    }
  }
  return out;
}

function printHelp(): void {
  console.log('TimeSystemPure CLI - Time management and scheduling system');
  console.log('');
  console.log('Usage:');
  console.log('  tsx cliHarness.ts <commands.json> [--flags]');
  console.log('');
  console.log('Examples:');
  console.log('  tsx cliHarness.ts commands.json');
}

function main() {
  const [commandsPath, ...rest] = process.argv.slice(2);
  
  if (!commandsPath || commandsPath === 'help' || commandsPath === '--help' || commandsPath === '-h') {
    printHelp();
    return;
  }

  try {
    if (!fs.existsSync(commandsPath)) {
      console.log(`Error: Commands file not found: ${commandsPath}`);
      process.exitCode = 1;
      return;
    }

    const cmds: TimeSystemOperation[] = JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8'));
    const manager = new TimeManager();
    const results: { op: string; status: string; result?: any }[] = [];

    for (const cmd of cmds) {
      try {
        let result: any;
        
        switch (cmd.op) {
          case 'list': {
            const res = manager.list({});
            result = { 
              timers: res.result?.timers || [], 
              cooldowns: res.result?.cooldowns || [], 
              scheduled: res.result?.scheduled || [] 
            };
            break;
          }
          case 'addTimer': {
            if (!cmd.timer) throw new Error('timer required for addTimer');
            const res = manager.addTimer(cmd.timer);
            result = { id: cmd.timer.id, status: res.status };
            break;
          }
          case 'addCooldown': {
            if (!cmd.id || cmd.duration === undefined) throw new Error('id and duration required for addCooldown');
            const res = manager.addCooldown(cmd.id, cmd.duration, cmd.category || 'general');
            result = { id: cmd.id, duration: cmd.duration, status: res.status };
            break;
          }
          case 'schedule': {
            if (!cmd.id || cmd.at === undefined) throw new Error('id and at required for schedule');
            const res = manager.schedule(cmd.id, cmd.at, cmd.payload);
            result = { id: cmd.id, at: cmd.at, status: res.status };
            break;
          }
          case 'tick': {
            if (cmd.dt === undefined) throw new Error('dt required for tick');
            const res = manager.tick(cmd.dt);
            result = { dt: cmd.dt, time: res.result?.time, fired: res.result?.fired || [] };
            break;
          }
          case 'dump': {
            const res = manager.dump();
            result = { 
              time: res.result?.time, 
              timers: res.result?.timers || [], 
              cooldowns: res.result?.cooldowns || [], 
              scheduled: res.result?.scheduled || [] 
            };
            break;
          }
          case 'reset': {
            const res = manager.resetTime();
            result = { status: res.status };
            break;
          }
          case 'now': {
            const time = manager.now();
            result = { time };
            break;
          }
          default:
            throw new Error(`Unknown operation: ${cmd.op}`);
        }
        
        results.push({ op: cmd.op, status: 'ok', result });
      } catch (error) {
        results.push({ op: cmd.op, status: 'error', result: { error: error.message } });
      }
    }

    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error:', error);
    process.exitCode = 1;
  }
}

if(import.meta.url === `file://${process.argv[1]}`) main();