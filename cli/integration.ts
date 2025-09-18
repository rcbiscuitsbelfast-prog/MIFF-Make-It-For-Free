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

