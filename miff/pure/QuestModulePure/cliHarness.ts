#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { parseQuestText, validateQuest } from './index';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

type Cmd =
  | { op: 'parse' }
  | { op: 'validate' }
  | { op: 'list' }
  | { op: 'dump' }
  | { op: 'steps' };

function main(...args: any[]) {
  const questPath = process.argv[2] || 'QuestModulePure/fixtures/branching.quest';
  const commandsPath = process.argv[3] || '';
  
  const questText = fs.readFileSync(path.resolve(questPath), 'utf-8');

  const log: string[] = [];
  const parseResult = parseQuestText(questText);

  const cmds: Cmd[] = commandsPath ? SafeJSONParser.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [{ op: 'parse' } as Cmd];
  const outputs: any[] = [];

  for (const c of cmds) {
    if (c.op === 'parse') {
      outputs.push(parseResult);
    } else if (c.op === 'validate') {
      if (parseResult.quest) {
        const issues = validateQuest(parseResult.quest);
        outputs.push({ op: 'validate', issues, valid: issues.length === 0 });
      } else {
        outputs.push({ op: 'validate', issues: ['No quest to validate'], valid: false });
      }
    } else if (c.op === 'list') {
      if (parseResult.quest) {
        outputs.push({ op: 'list', quests: [parseResult.quest.id] });
      } else {
        outputs.push({ op: 'list', quests: [] });
      }
    } else if (c.op === 'dump') {
      if (parseResult.quest) {
        outputs.push({ op: 'dump', quest: parseResult.quest });
      } else {
        outputs.push({ op: 'dump', quest: null });
      }
    } else if (c.op === 'steps') {
      if (parseResult.quest) {
        const steps = Object.keys(parseResult.quest.steps);
        outputs.push({ op: 'steps', steps });
      } else {
        outputs.push({ op: 'steps', steps: [] });
      }
    }
  }

  const out = { log, outputs };
  console.info(JSON.stringify(out, null, 2));
}

if(import.meta.url === `file://${process.argv[1]}`) main();