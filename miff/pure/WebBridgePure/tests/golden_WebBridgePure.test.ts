import { WebBridge } from '../Bridge';

describe('WebBridgePure Golden', () => {
  test('simulate, render, interop basic envelopes', () => {
    const bridge = new WebBridge();
    const config = { renderer: 'canvas', targetVersion: '3.60', assetPath: '/assets', scriptPath: '/js', stylePath: '/css', useWebGL: false } as any;

    const sim = bridge?.simulate('loot', { tableId: 't1', level: 1 }, config);
    expect(sim?.op).toBe('simulate');
    expect(['ok','error']).toContain(sim?.status);

    const ren = bridge?.render('ui', { screen: 'inventory' }, config);
    expect(ren?.op).toBe('render');
    expect(['ok','error']).toContain(ren?.status);

    const inter = bridge?.interop('stats', { id: 'hero', data: { key: 'hp', base: 100 } }, config);
    expect(inter?.op).toBe('interop');
    expect(['ok','error']).toContain(inter?.status);
  });
});

