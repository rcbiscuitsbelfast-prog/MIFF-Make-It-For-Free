export interface SessionPlayerRef {
  playerId: string;
  avatar: string; // path to avatar manifest
  style: '3d' | '2d-side' | 'overlay';
  team?: string;
  status?: 'active' | 'inactive' | 'disconnected';
}

export interface SessionManifest {
  id: string;
  zone: string;
  players: SessionPlayerRef[];
  seed?: number;
  createdAt?: string;
}

export class SessionManifestPure {
  public static create(id: string, zone: string, players: SessionPlayerRef[], seed: number = Date.now() % 1e6): SessionManifest {
    return { id, zone, players, seed, createdAt: new Date().toISOString() };
  }

  public static validate(manifest: any): { ok: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!manifest || typeof manifest !== 'object') errors.push('manifest missing');
    if (!manifest.id) errors.push('id missing');
    if (!manifest.zone) errors.push('zone missing');
    if (!Array.isArray(manifest.players) || manifest.players.length === 0) errors.push('players missing');
    return { ok: errors.length === 0, errors };
  }
}

