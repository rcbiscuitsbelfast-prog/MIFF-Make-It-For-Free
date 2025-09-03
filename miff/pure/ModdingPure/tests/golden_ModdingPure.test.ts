import * as path from 'path';
import * as fs from 'fs';

describe('ModdingPure CLI golden', () => {
  const root = path.resolve(__dirname, '..');
  const fixturesDir = path.resolve(root, 'fixtures');
  const cliPath = path.resolve(root, 'cliHarness.ts');

  beforeAll(() => {
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
  });

  test('discover, load, bundle, export', () => {
    const fixturePath = path.resolve(fixturesDir, 'modding_cli_input.json');
    const input = {
      config: { autoLoad: false },
      actions: [
        { type: 'discover' },
        { type: 'loadEnabled' },
        { type: 'bundle', plugins: ['ui-enhancements', 'core-physics'] },
        { type: 'export', template: 'web-html5' }
      ]
    };
    fs.writeFileSync(fixturePath, JSON.stringify(input, null, 2));

    try {
      const out = (global as any).testUtils.runCLI(cliPath, [fixturePath]);
      const result = JSON.parse(out);

      expect(result.op).toBe('modding_replay');
      expect(result.status).toBe('ok');
      expect(result.plugins).toBeDefined();
      expect(result.bundle.assetCount).toBeGreaterThan(0);
      expect(String(result.exportPath)).toContain('web');
    } finally {
      fs.unlinkSync(fixturePath);
    }
  });
});

