import { execFileSync } from 'child_process';
import * as path from 'path';
import { SafeJSONParser } from '../../shared/security/SafeJSONParser';


describe('WebBridgePure Contract', () => {
  const cli = path.resolve('miff/pure/ConvertToWebPure/cliHarness.ts');
  const sample = path.resolve('miff/pure/BridgeSchemaPure/sample_render.json');

  it('emits stable envelope for web render conversion', () => {
    const out = execFileSync('npx', [
      'ts-node', '--compiler-options', '{"module":"commonjs"}',
      cli, sample
    ], { encoding: 'utf-8' });
    const result = SafeJSONParser.parse(out);
    // Invariants: op tag, engine tag, items/issues arrays present
    expect(result.op === 'convert:web' || result.op === 'convert').toBe(true);
    expect(result.engine).toBe('web');
    expect(Array.isArray(result.items)).toBe(true);
    expect(Array.isArray(result.issues)).toBe(true);
  });
});

