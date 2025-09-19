#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { TimeManager, Timer, Cooldown, ScheduledEvent, TimeScale } from './Manager';

type Cmd =
  | { op: 'list' }
  | { op: 'addTimer'; timer: Timer }
  | { op: 'addCooldown'; id: string; duration: number; category?: string }
  | { op: 'schedule'; id: string; at: number; payload?: any }
  | { op: 'tick'; dt: number }
  | { op: 'dump' }
  | { op: 'reset' }
  | { op: 'now' };

function main() {
  const commandsPath = process.argv[2] || '';
  const manager = new TimeManager();

  const log: string[] = [];

  const cmds: Cmd[] = commandsPath ? JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [
    { op: 'list' } as Cmd
  ];
  const outputs: any[] = [];

  for (const c of cmds) {
    if (c.op === 'list') {
      const result = manager.list({});
      outputs.push({ op: 'list', timers: result.result?.timers || [], cooldowns: result.result?.cooldowns || [], scheduled: result.result?.scheduled || [] });
    } else if (c.op === 'addTimer') {
      const result = manager.addTimer(c.timer);
      outputs.push({ op: 'addTimer', id: c.timer.id, status: result.status });
    } else if (c.op === 'addCooldown') {
      const result = manager.addCooldown(c.id, c.duration, c.category || 'general');
      outputs.push({ op: 'addCooldown', id: c.id, duration: c.duration, status: result.status });
    } else if (c.op === 'schedule') {
      const result = manager.schedule(c.id, c.at, c.payload);
      outputs.push({ op: 'schedule', id: c.id, at: c.at, status: result.status });
    } else if (c.op === 'tick') {
      const result = manager.tick(c.dt);
      outputs.push({ op: 'tick', dt: c.dt, time: result.result?.time, fired: result.result?.fired || [] });
    } else if (c.op === 'dump') {
      const result = manager.dump();
      outputs.push({ op: 'dump', time: result.result?.time, timers: result.result?.timers || [], cooldowns: result.result?.cooldowns || [], scheduled: result.result?.scheduled || [] });
    } else if (c.op === 'reset') {
      const result = manager.resetTime();
      outputs.push({ op: 'reset', status: result.status });
    } else if (c.op === 'now') {
      const time = manager.now();
      outputs.push({ op: 'now', time });
    }
  }

  const out = { log, outputs };
  console.log(JSON.stringify(out, null, 2));
}

if(import.meta.url === `file://${process.argv[1]}`) main();