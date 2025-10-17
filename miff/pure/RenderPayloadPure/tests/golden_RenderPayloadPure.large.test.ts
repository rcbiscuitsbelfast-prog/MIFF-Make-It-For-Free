import { RenderPayloadManager } from '../Manager';

describe('RenderPayloadPure Large Payload', () => {
  test('handles large render data set', () => {
    const manager = new RenderPayloadManager();
    manager?.createFrame('large', 'Large Frame', 'web');

    const N = 2000;
    for (let i = 0; i < N; i++) {
      manager?.addRenderData('large', {
        id: `sprite_${i}`,
        type: 'sprite',
        name: `S_${i}`,
        position: { x: i % 100, y: Math.floor(i / 100) },
        asset: 'test_asset',
        props: { layer: i % 5 }
      });
    }

    const build = manager?.buildFrame({ quality: 'high', engine: 'web' });
    expect(build?.ok).toBe(true);
    expect(build?.result?.payload?.renderData.length).toBeGreaterThanOrEqual(N);
    expect(build?.result?.performance?.dataSize).toBeGreaterThan(0);
  });
});

