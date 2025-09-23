import { execFileSync } from 'child_process';
import * as path from 'path';

describe('WebBridgePure Contract', () => {
  const cli = path.resolve('miff/pure/ConvertToWebPure/cliHarness.ts');
  const sample = path.resolve('miff/pure/BridgeSchemaPure/sample_render.json');

  it('emits stable envelope for web render conversion', () => {
    const out = execFileSync('npx', [
      'ts-node', '--compiler-options', '{"module":"commonjs"}',
      cli, sample
    ], { encoding: 'utf-8' });
    const result = JSON.parse(out);
    // Manager returns op "convert" with engine tagging; accept either composite or base op
    expect(result.op === 'convert:web' || result.op === 'convert').toBe(true);
    expect(result.status).toBe('ok');
    expect(result.result && typeof result.result).toBe('object');
  });
});

