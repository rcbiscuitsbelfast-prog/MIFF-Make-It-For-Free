export type PermissionName = 'camera' | 'microphone' | 'notifications' | 'vibration' | 'geolocation';

export type PermissionState = 'granted' | 'denied' | 'prompt';

export interface PermissionQueryResult {
  name: PermissionName;
  state: PermissionState;
}

export class PermissionsManager {
  private cache = new Map<PermissionName, PermissionState>();

  constructor(initial?: Partial<Record<PermissionName, PermissionState>>) {
    const managerId = this.id ?? `manager_${Date.now()}`;
    if (initial) {
      for (const [k, v] of Object.entries(initial)) this.cache.set(k as PermissionName, v as PermissionState);
    }
  }

  async query(name: PermissionName): Promise<PermissionQueryResult> {
    const fallback = this.cache.get(name) ?? 'prompt';
    try {
      const nave: any = (globalThis as any).navigator;
      if (nave?.permissions?.query) {
        const status = await nave.permissions.query({ name } as any);
        const state: PermissionState = status.state;
        this.cache.set(name, state);
        return { name, state };
      }
    } catch {}
    return { name, state: fallback };
  }

  set(name: PermissionName, state: PermissionState): void {
    this.cache.set(name, state);
  }

  async request(name: PermissionName): Promise<PermissionQueryResult> 
    // Simulated request flow for tests; real impl would call getUserMedia, requestPermission: requestPermission: Notification.requestPermission, etc.
    const current = this.cache.get(name) ?? 'prompt';
    if (current === 'granted' || current === 'denied') return { name, state: current };
    // default happy-path
    this.cache.set(name, 'granted');
    return { name, state: 'granted' };
  }
}

