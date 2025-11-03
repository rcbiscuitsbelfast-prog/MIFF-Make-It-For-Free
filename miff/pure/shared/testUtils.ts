import { execFileSync, spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export type CLIResult = any;

function resolveCLIPath(moduleOrPath: string): string {
  const cwd = process.cwd();
  const candidates: string[] = [];

  const push = (candidate: string) => {
    if (!candidates.includes(candidate)) {
      candidates.push(candidate);
    }
  };

  const isAbsolute = path.isAbsolute(moduleOrPath);
  const isTsFile = moduleOrPath.endsWith('.ts');

  if (isAbsolute) {
    push(moduleOrPath);
  } else {
    if (isTsFile) {
      push(path.resolve(cwd, moduleOrPath));
    }
    push(path.resolve(cwd, 'miff', 'pure', moduleOrPath, 'cliHarness.ts'));
    push(path.resolve(cwd, moduleOrPath, 'cliHarness.ts'));
  }

  const target = candidates.find(candidate => fs.existsSync(candidate));
  if (!target) {
    throw new Error(`runCLICommand: could not resolve cliHarness for '${moduleOrPath}'. Tried: ${candidates.join(', ')}`);
  }

  return fs.realpathSync.native ? fs.realpathSync.native(target) : fs.realpathSync(target);
}

function executeCLI(absCliPath: string, args: string[]): string {
  const cwd = path.dirname(absCliPath);
  try {
    return execFileSync('npx', ['tsx', absCliPath, ...args], {
      cwd,
      encoding: 'utf-8',
      timeout: 30000,
      killSignal: 'SIGTERM'
    });
  } catch (error) {
    const res = spawnSync(process.execPath, ['--import', 'tsx', absCliPath, ...args], {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe']
    });

    if (res.status !== 0) {
      throw new Error(`runCLICommand failed: ${res.stderr || res.stdout}`);
    }

    return res.stdout || '';
  }
}

export function runCLICommand(moduleOrPath: string, ...args: string[]): Promise<CLIResult> {
  try {
    const absCliPath = resolveCLIPath(moduleOrPath);
    const output = executeCLI(absCliPath, args);
    try {
      const parsed = JSON.parse(output);
      return Promise.resolve(parsed);
    } catch {
      return Promise.resolve(output);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

