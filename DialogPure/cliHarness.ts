#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { DialogSim } from './DialogSim';

type Cmd =
  | { op: 'listDialogs' }
  | { op: 'simulateDialog'; dialogId: string }
  | { op: 'simulateChoice'; dialogId: string; choiceId: string }
  | { op: 'dumpDialog'; dialogId: string }
  | { op: 'exportDialog'; dialogId: string };

function main() {
  const dialogsPath = process.argv[2] || path.resolve('DialogPure/sample_dialog.json');
  const commandsPath = process.argv[3] || '';
  const obj = JSON.parse(fs.readFileSync(path.resolve(dialogsPath), 'utf-8'));
  const sim = new DialogSim({
    onDialogChoiceMade: (d, c) => {/* hook for remix */},
    onDialogComplete: (d) => {/* hook for remix */},
    addItem: (id, q) => {/* hook for remix */},
    startQuest: (q) => {/* hook for remix */},
  });
  sim.loadFromObject(obj);

  const log: string[] = [];
  const cmds: Cmd[] = commandsPath ? JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [{ op: 'listDialogs' } as Cmd];

  const outputs: any[] = [];
  for (const c of cmds) {
    if (c.op === 'listDialogs') {
      outputs.push({ op: 'listDialogs', dialogs: sim.listDialogs() });
    } else if (c.op === 'simulateDialog') {
      outputs.push(sim.simulateDialog(c.dialogId));
    } else if (c.op === 'simulateChoice') {
      outputs.push(sim.simulateChoice(c.dialogId, c.choiceId));
    } else if (c.op === 'dumpDialog') {
      outputs.push({ op: 'dumpDialog', dialog: sim.getDialog(c.dialogId) });
    } else if (c.op === 'exportDialog') {
      outputs.push({ op: 'exportDialog', dialog: sim.exportDialog(c.dialogId) });
    }
  }

  console.log(JSON.stringify({ outputs }, null, 2));
}

if (require.main === module) main();

