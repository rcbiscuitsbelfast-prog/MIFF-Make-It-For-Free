#!/usr/bin/env node
/*
 * Compliance utility: validate presence of required files for Pure modules
 * Usage: node scripts/validate-modules.js
 */
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

const requiredFiles = [
  'Manager.ts',
  'cliHarness.ts',
  'index.ts'
];

const requiredTestPattern = /tests\/.*\.test\.ts$/;

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function findTests(dir) {
  const testsDir = path.join(dir, 'tests');
  if (!exists(testsDir)) return [];
  const walk = (d) => {
    const out = [];
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name);
      const s = fs.statSync(p);
      if (s.isDirectory()) out.push(...walk(p));
      else if (requiredTestPattern.test(p)) out.push(p);
    }
    return out;
  };
  return walk(testsDir);
}

function main() {
  const root = process.cwd();
  const base = path.join(root, 'miff', 'pure');
  const report = [];
  let ok = true;

  for (const mod of modulesToCheck) {
    const modDir = path.join(base, mod);
    const entry = { module: mod, missing: [], tests: [] };
    if (!exists(modDir)) {
      entry.missing.push('[module directory]');
      ok = false;
      report.push(entry);
      continue;
    }
    for (const f of requiredFiles) {
      const p = path.join(modDir, f);
      if (!exists(p)) { entry.missing.push(f); ok = false; }
    }
    entry.tests = findTests(modDir);
    if (entry.tests.length === 0) { entry.missing.push('tests/*.test.ts'); ok = false; }
    report.push(entry);
  }

  const envelope = {
    op: 'validate:modules',
    status: ok ? 'ok' : 'error',
    result: report,
    timestamp: Date.now()
  };
  console.log(JSON.stringify(envelope, null, 2));
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();

