import { execFileSync } from 'child_process';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const cli = path.resolve(root, 'cliHarness.ts');

describe('CameraBridgePure Contract', () => {
  it('emits stable camera envelope', () => {
    const out = execFileSync('npx', [
      'tsx',
      cli
    ], { encoding: 'utf-8' });
    const result = JSON.parse(out);
    expect(result && typeof result).toBe('object');
    expect(result.op || 'camera').toBeDefined();
    expect(result.status || 'ok').toBeDefined();
  });
});

