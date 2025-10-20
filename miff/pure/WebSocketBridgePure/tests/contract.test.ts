import { execFileSync } from 'child_process';
import * as path from 'path';

describe('WebSocketBridgePure Contract', () => {
  const cli = path.resolve('miff/pure/WebSocketBridgePure/index.ts');

  it('exposes stable API shape', () => {
    // For now, require the module and inspect exported members shape via ts-node
    const modulePath = cli.replace(/\.ts$/, '').replace(/\\/g,'/');
    const code = `
      import * as mod from '${modulePath}';
      const keys = Object.keys(mod).sort();
      console.log(JSON.stringify({ keys }, null, 2));
    `;
    const out = execFileSync('npx', ['ts-node', '-e', code], { encoding: 'utf-8' });
    const result = JSON.parse(out);
    expect(Array.isArray(result.keys)).toBe(true);
    expect(result.keys.length).toBeGreaterThan(0);
  });
});

