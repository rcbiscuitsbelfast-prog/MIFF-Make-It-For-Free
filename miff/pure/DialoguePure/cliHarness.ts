#!/usr/bin/env ts-node

import fs from 'fs';
import { createDialogueEngine } from './DialoguePure';

function createSeededRand(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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
  const [,, cmdOrFile, ...rest] = process.argv;
  const isCommand = ['init', 'teardown', 'replay', 'export'].includes(cmdOrFile || '');
  const args = isCommand ? rest : [cmdOrFile, ...rest];
  const command = isCommand ? (cmdOrFile as 'init'|'teardown'|'replay'|'export') : 'replay';

  const opts: Record<string, any> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a?.startsWith('--')) {
      const k = a.slice(2);
      const v = args[i+1] && !args[i+1].startsWith('--') ? args[++i] : true;
      opts[k] = v;
    } else if (!opts.input) {
      opts.input = a;
    }
  }

  if (opts.seed) {
    (global as any).__DP_RAND__ = createSeededRand(String(opts.seed));
  }

  try {
    if (command === 'init') {
      process.stdout.write(JSON.stringify({ op: 'init', module: 'DialoguePure', status: 'ok', timestamp: Date.now() }));
      return;
    }
    if (command === 'teardown') {
      process.stdout.write(JSON.stringify({ op: 'teardown', module: 'DialoguePure', status: 'ok', timestamp: Date.now() }));
      return;
    }

    const inputFile = opts.input;
    if (!inputFile) {
      console.error('Usage: ts-node cliHarness.ts replay <input-file> [--seed N]');
      process.exit(1);
    }

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
      seed: opts.seed || null,
      steps,
      context: {
        variables: Object.fromEntries(finalContext.variables),
        flags: Array.from(finalContext.flags),
        inventory: Array.from(finalContext.inventory),
        quests: Object.fromEntries(Array.from(finalContext.quests.entries()).map(([k, v]) => [k, v]))
      },
      history: finalContext.history
    };

    process.stdout.write(JSON.stringify(output));
  } catch (error) {
    console.error(JSON.stringify({ op: 'dialogue_replay', status: 'error', error: (error as Error)?.message || String(error) }));
    process.exit(1);
  }
}

main();

