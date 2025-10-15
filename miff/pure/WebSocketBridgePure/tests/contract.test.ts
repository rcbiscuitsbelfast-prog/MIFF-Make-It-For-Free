import { execFileSync } from 'child_process';
import * as path from 'path';
import { SafeJSONParser } from '../../shared/security/SafeJSONParser';
import { log } from '../../shared/logging/StructuredLogger';



describe('WebSocketBridgePure Contract', () => {
  const cli = path.resolve('miff/pure/WebSocketBridgePure/index.ts');

  it('exposes stable API shape', () => {
    // For now, require the module and inspect exported members shape via ts-node
    const code = `
      import * as mod from '${cli.replace(/\\/g,'/')}';
      const keys = Object.keys(mod).sort();
      log.info(JSON.stringify({ keys }, null, 2));
    `;
    const out = execFileSync('npx', ['ts-node', '-e', code], { encoding: 'utf-8' });
    const result = SafeJSONParser.parse(out);
    expect(Array.isArray(result.keys)).toBe(true);
    expect(result.keys.length).toBeGreaterThan(0);
  });
});

