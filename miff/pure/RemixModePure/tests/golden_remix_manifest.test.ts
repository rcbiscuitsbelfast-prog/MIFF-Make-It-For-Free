/**
 * Golden test for Remix manifest generation
 * Note: This test mirrors existing RemixModeManager contract in docs.
 */
import { RemixModeManager } from '../../../../docs/New additions/remix_architecture';

describe('Golden: Remix manifest', () => {
  test('produces stable manifest with one placed block', () => {
    const mgr = new RemixModeManager('golden_scenario');
    expect(mgr.placeBlock([2, 3], 'stone_block')).toBe(true);
    const manifest = mgr.generateRemixManifest();

    // Structural expectations
    expect(manifest).toEqual(
      expect.objectContaining({
        baseScenario: 'golden_scenario',
        remixSafe: expect.any(Boolean),
        assets: expect.arrayContaining(['stone_block']),
      })
    );
    expect(Array.isArray(manifest.changes)).toBe(true);
    expect(manifest.changes.length).toBeGreaterThanOrEqual(1);

    // Golden snapshot of critical fields (allowing version variability)
    const minimal = {
      baseScenario: manifest.baseScenario,
      remixSafe: manifest.remixSafe,
      assets: manifest.assets.slice().sort(),
      firstChange: manifest.changes[0] && {
        pos: manifest.changes[0].pos,
        block: manifest.changes[0].block,
      },
    };
    expect(minimal).toMatchObject({
      baseScenario: 'golden_scenario',
      remixSafe: true,
      assets: expect.arrayContaining(['stone_block']),
      firstChange: { pos: [2, 3], block: 'stone_block' },
    });
  });
});

