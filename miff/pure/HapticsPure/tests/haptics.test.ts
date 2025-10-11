import { HapticsManager } from '../Manager';

describe('HapticsPure', () => {
  it('schedules and plays patterns deterministically', async () => {
    const mgr = new HapticsManager();
    mgr.enqueue([
      { id: 'a', pattern: { type: 'impact', style: 'light' } },
      { id: 'b', pattern: { type: 'notification', level: 'success' } },
      { id: 'c', pattern: { type: 'custom', durationMs: 100, intensity: 0.5 } }
    ]);
    
    // Use Promise.race to add timeout
    const results = await Promise.race([
      mgr.playAll(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test timeout')), 5000)
      )
    ]);
    
    expect(results.map((r: any) => r.status)).toEqual(['played', 'played', 'played']);
  }, 10000); // Increase test timeout to 10 seconds
});

