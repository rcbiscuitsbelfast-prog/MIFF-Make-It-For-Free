import { execFileSync } from 'child_process';
import * as path from 'path';

const cli = path.resolve(__dirname, '..', '..', 'ConvertToWebPure', 'cliHarness.ts');
const sample = path.resolve(__dirname, '..', '..', 'BridgeSchemaPure', 'sample_render.json');

describe('WebBridgePure Contract', () => {
  it('emits stable envelope for web render conversion', () => {
    const out = execFileSync('npx', [
      'tsx',
      cli,
      sample
    ], { encoding: 'utf-8' });
    const result = JSON.parse(out);
    // Invariants: op tag, engine tag, items/issues arrays present
    expect(result.op === 'convert:web' || result.op === 'convert').toBe(true);
    expect(result.engine).toBe('web');
    expect(Array.isArray(result.items)).toBe(true);
    expect(Array.isArray(result.issues)).toBe(true);
  });
});

