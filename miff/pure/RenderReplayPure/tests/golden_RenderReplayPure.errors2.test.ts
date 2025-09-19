import { ReplayManager } from '../Manager';

describe('RenderReplayPure Errors 2', () => {
  test('rejects invalid session input', () => {
    const mgr = new ReplayManager();
    const bad = mgr.loadSession({ id: '', frames: null } as any);
    expect(bad.ok).toBe(false);
  });
});

