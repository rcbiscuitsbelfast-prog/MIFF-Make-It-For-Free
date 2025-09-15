import { PlayerStatePure, PlayerStateSnapshot } from '../PlayerStatePure';
import { WebSocketBridgePure } from '../WebSocketBridgePure';

export interface ZoneServerConfig {
  zone: string;
}

export class ZoneServerPure {
  private readonly config: ZoneServerConfig;
  private readonly players: Map<string, PlayerStateSnapshot> = new Map();
  private lastTimeMs: number = Date.now();
  private bridge?: WebSocketBridgePure;

  constructor(config: ZoneServerConfig){ this.config = config; }

  public setBridge(bridge: WebSocketBridgePure): void { this.bridge = bridge; }

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
    // Broadcast state delta
    if (this.bridge) {
      const snapshot = this.getSnapshot();
      this.bridge.send({ type: 'state-delta', players: snapshot.map(s => ({ 
        playerId: s.identity.playerId, 
        position: s.position, 
        velocity: s.velocity,
        tick: s.tick 
      })) });
    }
  }
}

