import { HapticsManager } from '../Manager';

describe('HapticsPure', () => {
  it('schedules and plays patterns deterministically', async () => {
    const mgr = new HapticsManager();
    mgr.enqueue([
      { id: 'a', pattern: { type: 'impact', style: 'light' } },
      { id: 'b', pattern: { type: 'notification', level: 'success' } },
      { id: 'c', pattern: { type: 'custom', durationMs: 100, intensity: 0.5 } }
    ]);
    const results = await mgr.playAll();
    expect(results.map(r => r.status)).toEqual(['played', 'played', 'played']);
  });
});

