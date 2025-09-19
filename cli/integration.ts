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
