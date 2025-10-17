import { createPrefabState, reducePrefabAction } from '../index';

describe('PrefabBuilderPure golden', () => {
  test('create + add + translate', () => {
    const initial = createPrefabState({ id: 'pf1', name: 'House', blocks: [{ type: 'wood', x: 0, y: 0, z: 0 }] });
    const withDoor = reducePrefabAction(initial, { type: 'add_block', block: { type: 'door', x: 1, y: 0, z: 0 } });
    const moved = reducePrefabAction(withDoor, { type: 'translate', dx: 2, dy: 0, dz: 0 });

    expect(moved?.id).toBe('pf1');
    expect(moved?.blocks).toHaveLength(2);
    expect(moved?.blocks[0!].x).toBe(2);
    expect(moved?.blocks[1!].type).toBe('door');
  });
});

