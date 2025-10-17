import { createBlockState, reduceBlockAction } from '../index';

describe('BlockBuilderPure golden', () => {
  test('register and tint block', () => {
    const state = createBlockState({ blocks: [{ type: 'wood', hardness: 1, color: '#a52a2a' }] });
    const registered = reduceBlockAction(state, { type: 'register', block: { type: 'glass', hardness: 0.5, color: '#cfe' } });
    const tinted = reduceBlockAction(registered, { type: 'tint', blockType: 'wood', color: '#8b4513' });
    expect(tinted?.catalog['glass'].hardness).toBe(0.5);
    expect(tinted?.catalog['wood'].color).toBe('#8b4513');
  });
});

