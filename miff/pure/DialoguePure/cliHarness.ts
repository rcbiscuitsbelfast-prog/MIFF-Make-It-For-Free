#!/usr/bin/env ts-node

import fs from 'fs';
import { createDialogueEngine } from './DialoguePure';

interface HarnessInput {
  tree: any | string;
  startNode?: string;
  path?: string[]; // sequence of choice ids
}

function readInput(filePath: string): HarnessInput {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error('Usage: ts-node cliHarness.ts <input-file>');
    process.exit(1);
  }

  try {
    const input = readInput(inputFile);
    const treeData = typeof input.tree === 'string' ? input.tree : JSON.stringify(input.tree);
    const engine = createDialogueEngine(treeData);

    const start = engine.start(input.startNode || 'start');
    const steps: any[] = [];
    if (start) steps.push({ node: start.node.id, type: start.node.type, choices: (start as any).choices?.map((c: any) => c.id) || [] });

    const pathChoices = input.path || [];
    for (const choiceId of pathChoices) {
      const result = engine.selectChoice(choiceId);
      if (!result) break;
      steps.push({ node: result.node.id, type: result.node.type, choices: (result as any).choices?.map((c: any) => c.id) || [] });
      if (result.isEnd) break;
    }

    const finalContext = engine.getContext();
    const output = {
      op: 'dialogue_replay',
      status: 'ok',
      steps,
      context: {
        variables: Object.fromEntries(finalContext.variables),
        flags: Array.from(finalContext.flags),
        inventory: Array.from(finalContext.inventory),
        quests: Object.fromEntries(Array.from(finalContext.quests.entries()).map(([k, v]) => [k, v]))
      },
      history: finalContext.history
    };

    console.log(JSON.stringify(output));
  } catch (error) {
    console.error(JSON.stringify({ op: 'dialogue_replay', status: 'error', error: (error as Error)?.message || String(error) }));
    process.exit(1);
  }
}

main();

