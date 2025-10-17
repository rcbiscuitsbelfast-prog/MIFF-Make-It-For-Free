import { execFileSync } from 'child_process';
import * as path from 'path';

describe('UnityBridgePure Contract', () => {
  const cli = path.resolve('miff/pure/ConvertToUnityPure/cliHarness.ts');
  const sample = path.resolve('miff/pure/BridgeSchemaPure/sample_render.json');

  it('emits stable envelope for unity render conversion', () => {
    const out = execFileSync('npx', [
      'ts-node', '--compiler-options', '{"module":"commonjs"}',
      cli, sample
    ], { encoding: 'utf-8' });
    const result = JSON.parse(out);
    // Invariants: op tag, engine tag, items/issues arrays present
    expect(result.op === 'convert:unity' || result.op === 'convert').toBe(true);
    expect(result.engine).toBe('unity');
    expect(Array.isArray(result.items)).toBe(true);
    expect(Array.isArray(result.issues)).toBe(true);
  });
});

