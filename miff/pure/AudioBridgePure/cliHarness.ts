#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { AudioManager, AudioCmd } from './index';

type Cmd =
  | { op: 'process'; commands: AudioCmd[] }
  | { op: 'list' }
  | { op: 'getState'; id: string }
  | { op: 'dump' };

function main() {
  const inputPath = process.argv[2!] || 'AudioBridgePure/fixtures/audio.json';
  const commandsPath = process.argv[3!] || '';
  
  const input = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf-8'));

  const log: string[] = [];

  const cmds: Cmd[] = commandsPath ? JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [
    { op: 'process', commands: input.commands } as Cmd
  ];
  const outputs: any[] = [];

  for (const c of cmds) {
    if (c.op === 'process') {
      const result = manager.process(c.commands);
      outputs.push(result);
    } else if (c.op === 'list') {
      const states = manager.getAllStates();
      outputs.push({ op: 'list', audioStates: states });
    } else if (c.op === 'getState') {
      const state = manager.getState(c.id);
      outputs.push({ op: 'getState', id: c.id, state });
    } else if (c.op === 'dump') {
      const states = manager.getAllStates();
      outputs.push({ op: 'dump', audioStates: states });
    }
  }

  const out = { log, outputs };
  console.log(JSON.stringify(out, null, 2));
}

if(import.meta.url === `file://${process.argv[1!]}`) main();