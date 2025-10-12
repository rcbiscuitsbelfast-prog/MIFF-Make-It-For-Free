#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const modulesToCheck = [
  'ChainValidatorPure',
  'StorySystemPure',
  'RaidSystemPure',
  'ChainManagerPure',
  'AIProfileIntegrationLayer',
  'RemixTaggingPure',
  'DialoguePure'
];

const requiredFiles = ['Manager.ts', 'cliHarness.ts', 'index.ts'];
const requiredTestPattern = /tests\/.*\.test\.ts$/;

function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }

function findTests(dir) {
  const testsDir = path.join(dir, 'tests');
  if (!exists(testsDir)) return [];
  const walk = d => fs.readdirSync(d).flatMap(name => {
    const p = path.join(d, name);
    const s = fs.statSync(p);
    if (s.isDirectory()) return walk(p);
    return requiredTestPattern.test(p) ? [p] : [];
  });
  return walk(testsDir);
}

function generateMarkdown(report) {
  const lines = [];
  lines.push('# Test Inventory Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  const totals = { ok: 0, missingTests: 0, missingCore: 0 };
  for (const entry of report) {
    const missingCore = entry.missing.filter(m => m !== 'tests/*.test.ts');
    const hasTests = entry.tests.length > 0;
    if (missingCore.length === 0 && hasTests) totals.ok++;
    if (!hasTests) totals.missingTests++;
    if (missingCore.length > 0) totals.missingCore++;
  }
  lines.push(`- Modules OK: ${totals.ok}`);
  lines.push(`- Missing tests: ${totals.missingTests}`);
  lines.push(`- Missing core files: ${totals.missingCore}`);
  lines.push('');
  for (const entry of report) {
    lines.push(`## ${entry.module}`);
    lines.push('- Required files: Manager.ts, cliHarness.ts, index.ts');
    lines.push(`- Missing: ${entry.missing.length ? entry.missing.join(', ') : 'None'}`);
    lines.push(`- Tests: ${entry.tests.length ? entry.tests.map(t => path.relative(process.cwd(), t)).join(', ') : 'None'}`);
    lines.push('');
  }
  return lines.join('\n');
}

function main() {
  const base = path.join(process.cwd(), 'miff', 'pure');
  const report = [];
  for (const mod of modulesToCheck) {
    const modDir = path.join(base, mod);
    const entry = { module: mod, missing: [], tests: [] };
    if (!exists(modDir)) {
      entry.missing.push('[module directory]');
      report.push(entry);
      continue;
    }
    for (const f of requiredFiles) {
      if (!exists(path.join(modDir, f))) entry.missing.push(f);
    }
    entry.tests = findTests(modDir);
    if (entry.tests.length === 0) entry.missing.push('tests/*.test.ts');
    report.push(entry);
  }
  const outDir = path.join(process.cwd(), 'docs');
  if (!exists(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'TEST_INVENTORY.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(outDir, 'TEST_INVENTORY.md'), generateMarkdown(report));
  console.log('Generated docs/TEST_INVENTORY.{json,md}');
}

if (import.meta.url === `file://${process.argv[1]}`) main();

