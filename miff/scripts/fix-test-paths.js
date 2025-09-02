#!/usr/bin/env node
/*
  MIFF fix-test-paths
  - Scans miff/pure/*/tests/*.test.ts
  - Fixes broken relative import paths (../../ vs ../../../ etc)
  - Writes updated files and logs a summary
*/

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../../..');
const TARGET_GLOB_ROOT = path.join(WORKSPACE_ROOT, 'miff', 'pure');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function fixImports(content, filePath) {
  let updated = content;
  let changes = 0;

  // Heuristic rewrites for common breakages
  const replacements = [
    // Collapse repeated ../ segments
    { re: /\.\.\/\.\.\/(\.\.\/)+/g, to: '../../' },
    // Convert absolute-like imports to relative, e.g., miff/pure/Module -> ../
    { re: /from\s+['"]miff\/pure\//g, to: "from '../../" },
    // Older src/modules to miff/pure mapping
    { re: /from\s+['"]src\/modules\//g, to: "from '../../" },
    // Normalize TypeScript extension-less imports if they accidentally include .ts
    { re: /from\s+(['"][^'"]+)\.ts(['"])/g, to: 'from $1$2' },
  ];

  for (const rule of replacements) {
    const before = updated;
    updated = updated.replace(rule.re, rule.to);
    if (updated !== before) changes++;
  }

  // Ensure relative imports start with ./ or ../
  updated = updated.replace(/from\s+['"]([^'"\.\/@][^'"]*)['"]/g, (m, p1) => {
    // Skip package imports (e.g., jest, ts-jest)
    if (/^[a-zA-Z0-9_-]+/.test(p1)) return m;
    return m.replace(p1, './' + p1);
  });

  return { updated, changes };
}

function main() {
  const allFiles = walk(TARGET_GLOB_ROOT);
  const testFiles = allFiles.filter(f => /\/tests\/.+\.test\.ts$/.test(f));

  let modifiedCount = 0;
  const modified = [];

  for (const file of testFiles) {
    const original = fs.readFileSync(file, 'utf8');
    const { updated, changes } = fixImports(original, file);
    if (changes > 0 && updated !== original) {
      fs.writeFileSync(file, updated, 'utf8');
      modifiedCount++;
      modified.push({ file, changes });
    }
  }

  const summary = {
    op: 'fix-test-paths',
    status: 'ok',
    scanned: testFiles.length,
    modified: modifiedCount,
    files: modified,
  };

  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) {
  try { main(); }
  catch (err) {
    console.error(JSON.stringify({ op: 'fix-test-paths', status: 'error', error: String(err && err.message || err) }));
    process.exit(1);
  }
}

