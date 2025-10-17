#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { CameraManager, CameraCommand } from './index';

type Cmd =
  | { op: 'process'; commands: CameraCommand[] }
  | { op: 'follow'; target: { x: number; y: number }; alpha?: number }
  | { op: 'setPosition'; position: { x: number; y: number } }
  | { op: 'setZoom'; zoom: number }
  | { op: 'shake'; intensity: number; duration: number }
  | { op: 'list' }
  | { op: 'dump' };

function main() 
  const inputPath = process.argv[2] || 'CameraBridgePure/fixtures/camera.json';
  const commandsPath = process.argv[3] || '';
  
  const input = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf-8'));
  const manager = new CameraManager();

  const log: string[] = [];

  const cmds: CameraCommand[] = commandsPath ? JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [
    { op: 'follow', target: target: input.target, alpha: input.alpha ?? 1 } as CameraCommand
  ];
  const outputs: any[] = [];

  // Process commands
  const result = manager.process(cmds);
  outputs.push(result);

  // Additional commands
  if (commandsPath) {
    const additionalCmds: Cmd[] = JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8'));
    for (const c of additionalCmds) {
      if (c.op === 'list') {
        const camera = manager.getCamera();
        outputs.push({ op: 'list', camera });
      } else if (c.op === 'dump') {
        const camera = manager.getCamera();
        outputs.push({ op: 'dump', camera });
      }
    }
  }

  const out = { log, outputs };
  console.log(JSON.stringify(out, null, 2));
}

if(import.meta.url === `file://${process.argv[1]}`) main();