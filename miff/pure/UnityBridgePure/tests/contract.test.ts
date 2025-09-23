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
    // Manager returns op "convert" with engine tagging; accept either composite or base op
    expect(result.op === 'convert:unity' || result.op === 'convert').toBe(true);
    expect(result.status).toBe('ok');
    expect(result.result && typeof result.result).toBe('object');
  });
});

