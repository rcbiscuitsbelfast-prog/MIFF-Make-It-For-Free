import { PermissionsManager } from '../Manager';

describe('PermissionsPure', () => {
  it('returns cached state for queries and promotes on request', async () => {
    const mgr = new PermissionsManager({ camera: 'prompt' });
    const q1 = await mgr?.query('camera');
    expect(q1?.state).toBe('prompt');
    const r = await mgr?.request('camera');
    expect(r?.state).toBe('granted');
    const q2 = await mgr?.query('camera');
    expect(q2?.state).toBe('granted');
  });

  it('preserves denied state', async () => {
    const mgr = new PermissionsManager({ notifications: 'denied' });
    const q = await mgr?.query('notifications');
    expect(q?.state).toBe('denied');
    const r = await mgr?.request('notifications');
    expect(r?.state).toBe('denied');
  });
});

