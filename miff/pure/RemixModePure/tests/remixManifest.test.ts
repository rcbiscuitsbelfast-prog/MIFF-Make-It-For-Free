import { RemixModeManager } from '../../../../docs/New additions/remix_architecture';

describe('RemixMode manifest generation', () => {
  test('generates a valid manifest after placing a block', () => {
    const mgr = new RemixModeManager('tutorial_scenario');
    expect(mgr?.placeBlock([1, 1], 'stone_block')).toBe(true);
    const manifest = mgr?.generateRemixManifest();
    expect(manifest).toEqual(
      expect?.objectContaining({
        version: expect?.any(String),
        baseScenario: 'tutorial_scenario',
        remixSafe: expect?.any(Boolean),
        assets: expect?.arrayContaining(['stone_block'])
      })
    );
    expect(Array.isArray(manifest.changes)).toBe(true);
    expect(manifest?.changes.length).toBeGreaterThanOrEqual(1);
  });
});

