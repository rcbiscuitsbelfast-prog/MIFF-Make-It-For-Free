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
  const outputs:any[] = [];
  for(const c of cmds){
    if(c.op==='list') outputs.push(mgr.list());
    else if(c.op==='addTimer') { mgr.addTimer(c.timer); outputs.push({ op:'addTimer', id:c.timer.id }); }
    else if(c.op==='addCooldown') { mgr.addCooldown(c.id, c.duration); outputs.push({ op:'addCooldown', id:c.id, duration:c.duration }); }
    else if(c.op==='schedule') { mgr.schedule(c.id, c.at); outputs.push({ op:'schedule', id:c.id, at:c.at }); }
    else if(c.op==='cancel') { mgr.cancel(c.id); outputs.push({ op:'cancel', id:c.id }); }
    else if(c.op==='tick') outputs.push(mgr.tick(c.dt));
    else if(c.op==='dump') outputs.push(mgr.dump());
  }
  console.log(JSON.stringify({outputs}, null, 2));
}
if(require.main===module) main();