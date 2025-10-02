import { createSnapState, reduceSnapAction } from '../index';

describe('SnapBuilderPure golden', () => {
  test('grid snap rounds to nearest unit', () => {
    const state = createSnapState({ grid: { x: 2, y: 2, z: 2 } });
    const result: any = reduceSnapAction(state, { type: 'snap_point', point: { x: 2.6, y: 3.4, z: -0.9 } });
    expect(result.snapped.x).toBe(2);
    expect(result.snapped.y).toBe(4);
    expect(result.snapped.z).toBe(-1);
  });
});

