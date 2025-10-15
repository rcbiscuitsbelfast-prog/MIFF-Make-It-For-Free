export interface SessionPlayerRef {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  playerId: string;
  avatar: string; // path to avatar manifest
  style: '3d' | '2d-side' | 'overlay';
  team?: string;
}

export interface SessionManifest {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  zone: string;
  players: SessionPlayerRef[];
  seed?: number;
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
    if (!Array.isArray(manifest.players)) errors.push('players missing');
    return { ok: errors.length === 0, errors };
  }
}

