#!/usr/bin/env node

/**
 * fix-test-paths.js
 * --------------------------------------------
 * Scans MIFF Pure module test suites and automatically fixes broken
 * relative import paths. Intended as a Phase-17 maintenance helper so
 * new contributors do not run into path-not-found errors when running
 * `npm test`.
 *
 * Operation:
 *   1. Finds all `*.test.ts` files inside `miff/pure/**` (any depth).
 *   2. Reads each file, locating ES import statements.
 *   3. For every relative import (starting with '.'), attempts to
 *      resolve it on disk. When resolution fails, the script walks
 *      parent directories upward until it finds a match and rewrites
 *      the import path to that location.
 *   4. Saves the updated file and prints a summary table of fixes.
 *
 * The heuristic is intentionally conservative—only clearly broken
 * relative paths are changed. Absolute or package imports are left
 * untouched.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT = path.resolve(__dirname, '..');
const TEST_GLOB = path.join(ROOT, 'pure', '**', '*.test.ts');

/** Collect files */
const testFiles = glob.sync(TEST_GLOB, { nodir: true });
if (testFiles.length === 0) {
  console.log('[fix-test-paths] No test files found – nothing to do.');
  process.exit(0);
}

/** Helpers */
const IMPORT_RE = /import\s+[^'"`]+["'`]([^"'`]+)["'`]/g;

function resolveImport(currentFile, importPath) {
  if (!importPath.startsWith('.')) return importPath; // skip non-relative

  const currentDir = path.dirname(currentFile);
  let targetPath = path.resolve(currentDir, importPath);

  const EXTENSIONS = ['.ts', '.tsx', '.js', '.mjs', '.cjs', '/index.ts', '/index.js'];

  // Quick helper to test if a path exists with common TS/JS extensions
  const exists = (p) => {
    if (fs.existsSync(p)) return true;
    for (const ext of EXTENSIONS) {
      if (fs.existsSync(p + ext)) return true;
    }
    return false;
  };

  if (exists(targetPath)) return importPath; // already valid

  // Walk upwards max 4 levels to find a matching file/dir
  let up = '..';
  for (let i = 0; i < 4; i++) {
    const trial = path.resolve(currentDir, up, importPath);
    if (exists(trial)) {
      const relative = path.relative(currentDir, trial);
      return relative.startsWith('.') ? relative : './' + relative;
    }
    up = path.join('..', up);
  }
  // Could not find – leave unchanged
  return importPath;
}

const changes = [];

testFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const newContent = content.replace(IMPORT_RE, (match, p1) => {
    const fixed = resolveImport(filePath, p1);
    if (fixed !== p1) {
      modified = true;
      changes.push({ file: filePath, from: p1, to: fixed });
      return match.replace(p1, fixed);
    }
    return match;
  });
  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
});

// Log summary
if (changes.length === 0) {
  console.log('[fix-test-paths] All import paths are valid – no changes made.');
} else {
  console.log(`[fix-test-paths] Fixed ${changes.length} import path(s):`);
  changes.forEach(({ file, from, to }) => {
    console.log(`  • ${file}: '${from}' → '${to}'`);
  });
}