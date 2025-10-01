#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function main() {
  const date = process.env.DATE || new Date().toISOString().slice(0, 10);
  const outDir = path.resolve('docs/archive/test-results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const registryPath = path.resolve('docs/archive/scenarios/scenario_registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  // Accept optional scenario IDs to run; default to all in registry
  const targets = process.argv.slice(2);
  const scenarios = registry.scenarios.filter(s => targets.length === 0 || targets.includes(s.id));

  for (const sc of scenarios) {
    const { id, fixture } = sc;
    const outBase = `${date}-${id}-results.txt`;
    const out = path.join(outDir, outBase);

    const { fxPath, resolvedFrom } = resolveFixturePath(fixture);
    const command = `npx --yes tsx cli/miff-simulate.ts "${fxPath || fixture}"`;

    let stdout = '';
    let stderr = '';
    let status = 'error';
    let errorMsg = '';

    if (!fxPath) {
      errorMsg = `Missing fixture: ${fixture}`;
    } else {
      const res = spawnSync('npx', ['--yes', 'tsx', 'cli/miff-simulate.ts', fxPath], { encoding: 'utf8' });
      stdout = res.stdout || '';
      stderr = res.stderr || '';
      status = res.status === 0 ? 'ok' : 'error';
      if (status === 'error' && !stderr && stdout) {
        // Some tools print errors to stdout; classify as error
        stderr = stdout;
      }
    }

    const modules = inferModulesFromFixture(fixture);

    const lines = [];
    lines.push(`Scenario: ${id}`);
    lines.push(`Fixture: ${fixture}`);
    if (resolvedFrom && fxPath) lines.push(`Resolved Path: ${path.relative(process.cwd(), fxPath)} (from ${resolvedFrom})`);
    lines.push(`CLI: ${command}`);
    lines.push(`Modules Triggered: ${modules.length ? modules.join(', ') : 'unknown'}`);
    lines.push(`Status: ${status}`);
    if (errorMsg) lines.push(`Error: ${errorMsg}`);
    if (stderr && !errorMsg) lines.push(`Errors/Stderr:\n${stderr.trim()}`);
    lines.push('Output:');
    lines.push(stdout.trim());

    fs.writeFileSync(out, lines.join('\n') + '\n');
    process.stdout.write(`Wrote ${path.relative(process.cwd(), out)}\n`);
  }
}

function resolveFixturePath(fixture) {
  const candidates = [
    fixture,
    fixture.replace('miff/miff/pure/', 'miff/pure/'),
    fixture.replace('./', ''),
  ];
  for (const cand of candidates) {
    const abs = path.resolve(cand);
    if (fs.existsSync(abs)) return { fxPath: abs, resolvedFrom: cand !== fixture ? fixture : '' };
  }
  return { fxPath: null, resolvedFrom: '' };
}

function inferModulesFromFixture(fixture) {
  const f = fixture.toLowerCase();
  const modules = new Set();
  if (f.includes('combat')) modules.add('CombatPure').add('StatusEffectsPure').add('ItemsPure').add('TeamsPure');
  if (f.includes('quest')) modules.add('QuestSystemPure').add('DialogPure').add('InventoryPure').add('EventBusPure').add('LorePure');
  if (f.includes('beatmap') || f.includes('rhythm')) modules.add('RhythmSystemPure').add('AudioPure');
  if (f.includes('world')) modules.add('WorldManifestPure').add('LocationPure');
  if (f.includes('witcher_grove')) modules.add('DialogPure').add('QuestSystemPure').add('LocationPure').add('InventoryPure').add('EventBusPure').add('LorePure').add('AudioPure');
  return Array.from(modules);
}

if (require.main === module) main();

