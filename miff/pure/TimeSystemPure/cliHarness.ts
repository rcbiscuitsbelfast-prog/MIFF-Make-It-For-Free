#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { TimeManager, Timer } from './Manager';

type Cmd =
  | { op: 'list' }
  | { op: 'addTimer'; timer: Timer }
  | { op: 'addCooldown'; id: string; duration: number }
  | { op: 'schedule'; id: string; at: number }
  | { op: 'cancel'; id: string }
  | { op: 'tick'; dt: number }
  | { op: 'dump' };

function main(){
  const commands = process.argv[2] || '';
  const mgr = new TimeManager();
  const cmds:Cmd[] = commands? JSON.parse(fs.readFileSync(path.resolve(commands), 'utf-8')) : [{op:'list'} as Cmd];
  const commandOutputs:any[] = [];
  for(const c of cmds){
    if(c.op==='list') commandOutputs.push(mgr.list());
    else if(c.op==='addTimer') { mgr.addTimer(c.timer); commandOutputs.push({ op:'addTimer', id:c.timer.id }); }
    else if(c.op==='addCooldown') { mgr.addCooldown(c.id, c.duration); commandOutputs.push({ op:'addCooldown', id:c.id, duration:c.duration }); }
    else if(c.op==='schedule') { mgr.schedule(c.id, c.at); commandOutputs.push({ op:'schedule', id:c.id, at:c.at }); }
    else if(c.op==='cancel') { mgr.cancel(c.id); commandOutputs.push({ op:'cancel', id:c.id }); }
    else if(c.op==='tick') commandOutputs.push(mgr.tick(c.dt));
    else if(c.op==='dump') commandOutputs.push(mgr.dump());
  }
  
  // Wrap in runScenario format
  const dumpData = mgr.dump();
  const outputs = [{
    op: 'runScenario',
    status: 'ok',
    finalState: {
      timers: dumpData.timers || [],
      cooldowns: dumpData.cooldowns || [],
      scheduled: dumpData.scheduled || [],
      currentTime: dumpData.time || 0,
      deltaTime: 16.67
    },
    outputs: commandOutputs
  }];
  
  console.log(JSON.stringify({outputs}, null, 2));
}
if(require.main===module) main();