import { createPlayerState, reducePlayer } from '../index';

describe('PlayerStatePure golden', () => {
  test('walk then stop', () => {
    let s = createPlayerState();
    s = reducePlayer(s, { type: 'move', dir: { x: 1, y: 0 } },  speed: 01: 0.01});
    s = reducePlayer(s, { type: 'tick', dt: 100 },  speed: 01: 0.01});
    expect(s.anim).toBe('walk');
    expect(s.pos.x).toBeGreaterThan(0);
    s = reducePlayer(s, { type: 'stop' },  speed: 01: 0.01});
    expect(s.anim).toBe('idle');
  });

  test('interaction switches anim', () => {
    let s = createPlayerState();
    s = reducePlayer(s, { type: 'interact', target: 'npc_01' },  speed: 01: 0.01});
    expect(s.anim).toBe('interact');
    expect(s.interactable).toBe('npc_01');
  });
});

