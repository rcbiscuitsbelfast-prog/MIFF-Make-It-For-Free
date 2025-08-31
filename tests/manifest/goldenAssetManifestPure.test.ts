import path from '../../miff/pure/path';
import fs from '../../miff/pure/fs';

test('AssetManifestPure validates sprite sheet manifest', () => {
  const cli = path.resolve('cli/manifest.ts');
  const file = path.resolve('systems/AssetManifestPure/fixtures/sprites.json');
  const out = (global as any).testUtils.runCLI(cli, [file]);
  const j = JSON.parse(out);
  expect(j.op).toBe('manifest');
  expect(j.status).toBe('ok');
  expect(j.manifest.assets.length).toBeGreaterThan(0);
  expect(j.audit.status).toBe('ok');
});

