#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { runTimeline, QuestTimeline } from './index';
import { InputSanitizer } from '../shared/security/InputSanitizer.js';

type Cmd =
  | { op: 'run' }
  | { op: 'validate' }
  | { op: 'list' }
  | { op: 'dump' };

function main() {
  // SECURITY: Validate all inputs
  const timelinePath = InputSanitizer.getSafeArg(2, {
    type: 'path',
    required: false,
    pattern: /\.json$/i,
    maxLength: 500
  }, 'QuestTimelinePure/fixtures/helmet_of_fate.timeline.json');
  
  const commandsPath = InputSanitizer.getSafeArg(3, {
    type: 'path',
    required: false,
    pattern: /\.json$/i,
    maxLength: 500
  }, '');
  
  const timeline: QuestTimeline = JSON.parse(fs.readFileSync(path.resolve(timelinePath), 'utf-8'));

  const log: string[] = [];

  const cmds: Cmd[] = commandsPath ? JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [{ op: 'run' } as Cmd];
  const outputs: any[] = [];

  for (const c of cmds) {
    if (c.op === 'run') {
      const result = runTimeline(timeline);
      outputs.push(result);
    } else if (c.op === 'validate') {
      const valid = timeline.id && timeline.events && Array.isArray(timeline.events);
      outputs.push({ op: 'validate', valid, issues: valid ? [] : ['Invalid timeline structure'] });
    } else if (c.op === 'list') {
      outputs.push({ op: 'list', timelines: [timeline.id] });
    } else if (c.op === 'dump') {
      outputs.push({ op: 'dump', timeline });
    }
  }

  const out = { log, outputs };
  console.log(JSON.stringify(out, null, 2));
}

if(import.meta.url === `file://${process.argv[1!]}`) main();