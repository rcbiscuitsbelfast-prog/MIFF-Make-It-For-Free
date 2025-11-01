#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CameraManager, CameraCommand } from './index.ts';
import { InputSanitizer } from '../shared/security/InputSanitizer.ts';

type Cmd =
  | { op: 'process'; commands: CameraCommand[] }
  | { op: 'follow'; target: { x: number; y: number }; alpha?: number }
  | { op: 'setPosition'; position: { x: number; y: number } }
  | { op: 'setZoom'; zoom: number }
  | { op: 'shake'; intensity: number; duration: number }
  | { op: 'list' }
  | { op: 'dump' };

function main() {
  const rootDir = path.dirname(fileURLToPath(import.meta.url));
  const resolveFromRoot = (p: string) => path.isAbsolute(p) ? p : path.resolve(rootDir, p);

  // SECURITY: Validate all inputs
  const inputPath = InputSanitizer.getSafeArg(2, {
    type: 'path',
    required: false,
    pattern: /\.json$/i,
    maxLength: 500
  }, path.resolve(rootDir, 'fixtures/camera.json'));
  
  const commandsPath = InputSanitizer.getSafeArg(3, {
    type: 'path',
    required: false,
    pattern: /\.json$/i,
    maxLength: 500
  }, '');
  
  const input = JSON.parse(fs.readFileSync(resolveFromRoot(inputPath), 'utf-8'));

  const log: string[] = [];

  const cmds: CameraCommand[] = commandsPath ? JSON.parse(fs.readFileSync(resolveFromRoot(commandsPath), 'utf-8')) : [
    { op: 'follow', target: input.target, alpha: input.alpha ?? 1 } as CameraCommand
  ];
  const outputs: any[] = [];

  const manager = new CameraManager();

  // Process commands
  const result = manager.process(cmds);
  outputs.push(result);

  // Additional commands
  if (commandsPath) {
    const additionalCmds: Cmd[] = JSON.parse(fs.readFileSync(resolveFromRoot(commandsPath), 'utf-8'));
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

if(import.meta.url === `file://${process.argv[1!]}`) main();