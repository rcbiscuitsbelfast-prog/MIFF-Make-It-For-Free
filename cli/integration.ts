/*
 * CLI Integration Utilities for Golden Tests
 * Provides a stable runCLICommand helper used by various golden tests.
 */
import { execFileSync, spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export type CLIResult = any;

export function runCLICommand(moduleOrPath: string, ...args: string[]): CLIResult {
  // Resolve to absolute path of a cliHarness.ts
  let absCliPath = moduleOrPath;
  const cwd = process.cwd();

  const tryCandidates = (): string[] => {
    const candidates: string[] = [];
    const isTs = moduleOrPath.endsWith('.ts');
    if (path.isAbsolute(moduleOrPath)) {
      candidates.push(moduleOrPath);
    } else {
      if (isTs) candidates.push(path.resolve(cwd, moduleOrPath));
      // miff/pure/<Module>/cliHarness.ts
      candidates.push(path.resolve(cwd, 'miff', 'pure', moduleOrPath, 'cliHarness.ts'));
      // Direct module path under repo root
      candidates.push(path.resolve(cwd, moduleOrPath, 'cliHarness.ts'));
    }
    return candidates;
  };

  const candidates = tryCandidates();
  const target = candidates.find(p => fs.existsSync(p));
  if (!target) {
    throw new Error(`runCLICommand: could not resolve cliHarness for '${moduleOrPath}'. Tried: ${candidates.join(', ')}`);
  }
  absCliPath = fs.realpathSync.native ? fs.realpathSync.native(target) : fs.realpathSync(target);

  // Prefer npx tsx for ESM TypeScript execution
  const npxArgs = ['tsx', absCliPath, ...args];
  let output = '';
  try {
    output = execFileSync('npx', npxArgs, {
      cwd: path.dirname(absCliPath),
      encoding: 'utf-8',
      timeout: 30000,
      killSignal: 'SIGTERM'
    });
  } catch (e) {
    // Fallback to node --import tsx
    const res = spawnSync(process.execPath, ['--import', 'tsx', absCliPath, ...args], {
      cwd: path.dirname(absCliPath),
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    if (res.status !== 0) {
      throw new Error(`runCLICommand failed: ${res.stderr || res.stdout}`);
    }
    output = res.stdout || '';
  }

  try {
    return JSON.parse(output);
  } catch {
    return output;
  }
}

export default { runCLICommand };

#!/usr/bin/env tsx

import { execFileSync } from 'node:child_process';
import * as path from 'node:path';

function run(title: string, cmd: string[], cwd = process.cwd()) {
  try {
    const out = execFileSync(cmd[0], cmd.slice(1), { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    console.log(`\n=== ${title} ===`);
    process.stdout.write(out);
  } catch (e: any) {
    console.log(`\n=== ${title} (FAILED) ===`);
    process.stderr.write(e?.stderr || Buffer.from(String(e)));
    process.exitCode = 1;
  }
}

const root = path.resolve(process.cwd());

// Combat: dump and yaml export
run('CombatPure dump', ['npx','-y','tsx','miff/pure/CombatPure/cliHarness.ts','dump'], root);
run('CombatPure export yaml', ['npx','-y','tsx','miff/pure/CombatPure/cliHarness.ts','export','yaml'], root);

// Dialogue: simulate and markdown export
run('DialogueSystemPure simulate', ['npx','-y','tsx','miff/pure/DialogueSystemPure/cliHarness.ts','simulate'], root);
run('DialogueSystemPure export md', ['npx','-y','tsx','miff/pure/DialogueSystemPure/cliHarness.ts','export','markdown'], root);

// Economy: list and simulateAll
run('EconomyPure list', ['npx','-y','tsx','miff/pure/EconomyPure/cliHarness.ts','miff/pure/EconomyPure/sample_economy.json'], root);
run('EconomyPure simulateAll', ['node','-e',
  `const fs=require('fs');const f='miff/pure/EconomyPure/tmp_cmds.json';fs.writeFileSync(f, JSON.stringify([{op:'simulateAll'}]));`], root);
run('EconomyPure simulateAll exec', ['npx','-y','tsx','miff/pure/EconomyPure/cliHarness.ts','miff/pure/EconomyPure/sample_economy.json','miff/pure/EconomyPure/tmp_cmds.json'], root);

// WebBridge: export yaml
run('WebBridge export yaml', ['npx','-y','tsx','miff/pure/WebBridgePure/cliHarness.ts', path.resolve(root,'tmp-webbridge-yaml.json')], root);

// SaveLoad: export xml
run('SaveLoad export xml', ['npx','-y','tsx','miff/pure/SaveLoadPure/cliHarness.ts', 'miff/pure/SaveLoadPure/tests/sample_commands.json','miff/pure/SaveLoadPure/tests/sample_save_state.json'], root);

console.log('\nIntegration run completed.');

