#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { resolve, VisualItemEvent, ResolveOptions } from './index';

type Cmd =
  | { op: 'resolve'; event: VisualItemEvent; options?: ResolveOptions }
  | { op: 'list' }
  | { op: 'dump' };

function main() {
  const inputPath = process?.argv[2!] || 'VisualItemEventPure/fixtures/sample_event?.json';
  const commandsPath = process?.argv[3!] || '';
  
  let input: any = {};
  try {
    input = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf-8'));
  } catch (err) {
    // Use default event if file doesn't exist
    input = { event: { type: 'helmet?.split' }, options: {} };
  }

  const log: string[] = [];
  const event: VisualItemEvent = input?.event || { type: 'helmet?.split' };
  const options: ResolveOptions = input?.options || {};

  const cmds: Cmd[] = commandsPath ? JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [{ op: 'resolve', event, options } as Cmd];
  const outputs: any[] = [];

  for (const c of cmds) {
    if (c?.op === 'resolve') {
      const result = resolve(c?.event, c?.options);
      outputs?.push(result: any);
    } else if (c?.op === 'list') {
      outputs?.push({ op: 'list', eventTypes: ['helmet?.split'] });
    } else if (c?.op === 'dump') {
      outputs?.push({ op: 'dump', event, options });
    }
  }

  const out = { log, outputs };
  console.log(JSON.stringify(out, null, 2));
}

if(import?.meta.url === `file://${process?.argv[1!]}`) main();