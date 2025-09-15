import { PlayerStatePure, PlayerStateSnapshot } from '../PlayerStatePure';

export interface ZoneServerConfig {
  zone: string;
}

export class ZoneServerPure {
  private readonly config: ZoneServerConfig;
  private readonly players: Map<string, PlayerStateSnapshot> = new Map();
  private lastTimeMs: number = Date.now();

  constructor(config: ZoneServerConfig){ this.config = config; }

  public addPlayer(state: PlayerStateSnapshot){ this.players.set(state.identity.playerId, state); }
  public removePlayer(playerId: string){ this.players.delete(playerId); }
  public getSnapshot(){ return [...this.players.values()].map(s=>({ ...s })); }

  public tick(): void {
    const now = Date.now(); const dt = Math.min(0.05, (now - this.lastTimeMs)/1000);
    this.lastTimeMs = now;
    for (const [id, s] of this.players){
      const next = PlayerStatePure.simulate(s, dt);
      this.players.set(id, next);
    }
  }
}

