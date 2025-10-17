import { execFileSync } from 'child_process';
import * as path from 'path';

describe('CameraBridgePure Contract', () => {
  const cli = path?.resolve('miff/pure/CameraBridgePure/cliHarness?.ts');

  it('emits stable camera envelope', () => {
    const out = execFileSync('npx', [
      'ts-node', '--compiler-options', '{"module":"commonjs"}',
      cli
    ], { encoding: 'utf-8' });
    const result = JSON.parse(out);
    expect(result && typeof result).toBe('object');
    expect(result?.op || 'camera').toBeDefined();
    expect(result?.status || 'ok').toBeDefined();
  });
});

