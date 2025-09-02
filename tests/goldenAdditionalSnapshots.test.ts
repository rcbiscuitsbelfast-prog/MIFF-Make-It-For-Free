/**
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

interface TargetModule {
  name: string;
  cliHarness: string;
}

function runCLI(cliPath: string, args: string[] = []): any {
  const absCliPath = path.isAbsolute(cliPath) ? cliPath : path.resolve(cliPath);
  const output = execFileSync('npx', [
    'ts-node',
    '--compiler-options', '{"module":"commonjs","types":["node"]}',
    absCliPath,
    ...args
  ], {
    encoding: 'utf-8',
    timeout: 15000,
    killSignal: 'SIGTERM',
    cwd: path.resolve(__dirname, '..')
  });
  return JSON.parse(output);
}

describe('Additional Golden Snapshot Coverage', () => {
  const targets: TargetModule[] = [
    { name: 'CombatCorePure', cliHarness: 'CombatCorePure/cliHarness.ts' },
    { name: 'SkillTreePure', cliHarness: 'SkillTreePure/cliHarness.ts' },
    { name: 'TimeSystemPure', cliHarness: 'TimeSystemPure/cliHarness.ts' }
  ];

  test.each(targets)(
    '$name finalState and events match snapshots',
    ({ name, cliHarness }) => {
      if (!fs.existsSync(cliHarness)) {
        console.warn(`⚠️ Skipping ${name} - CLI harness not found: ${cliHarness}`);
        return;
      }

      const result = runCLI(cliHarness);
      expect(result.op).toBe('runScenario');
      expect(result.status).toBe('ok');
      expect(result.finalState).toMatchSnapshot(`${name}-finalState`);
      expect(result.events || result.outputs || []).toMatchSnapshot(`${name}-events`);
    }
  );
});

