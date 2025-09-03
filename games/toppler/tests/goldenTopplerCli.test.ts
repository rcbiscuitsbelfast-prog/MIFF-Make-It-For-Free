import { execFileSync } from 'child_process';
import path from 'path';

describe('Toppler CLI Golden', () => {
  const cliPath = path.resolve(__dirname, '../cliHarness.ts');

  it('runs deterministic headless loop and returns structured JSON', () => {
    const output = execFileSync('npx', [
      'ts-node',
      '--compiler-options', '{"module":"commonjs"}',
      cliPath,
      'play',
      '--seed', '7',
      '--steps', '5',
      '--speed', '1.5'
    ], { encoding: 'utf-8' });

    // Extract last JSON line (ignoring bootstrap debug logs)
    const lines = output.trim().split(/\r?\n/);
    const jsonLine = lines[lines.length - 1];
    const result = JSON.parse(jsonLine);

    expect(result.op).toBe('play');
    expect(result.status).toBe('ok');
    expect(result.summary).toMatchObject({ seed: 7, steps: 5, speed: 1.5 });
  });
});

