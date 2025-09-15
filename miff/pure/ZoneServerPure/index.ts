import { PlayerStatePure, PlayerStateSnapshot } from '../PlayerStatePure';
import { WebSocketBridgePure } from '../WebSocketBridgePure';
import { PerfMetricsPure } from '../PerfMetricsPure';

export interface ZoneServerConfig {
  zone: string;
}

export class ZoneServerPure {
  private readonly config: ZoneServerConfig;
  private readonly players: Map<string, PlayerStateSnapshot> = new Map();
  private lastTimeMs: number = Date.now();
  private bridge?: WebSocketBridgePure;
  private perf: PerfMetricsPure = new PerfMetricsPure();

  constructor(config: ZoneServerConfig){ this.config = config; }

  public setBridge(bridge: WebSocketBridgePure): void { this.bridge = bridge; }

  public addPlayer(state: PlayerStateSnapshot){ this.players.set(state.identity.playerId, state); }
  public removePlayer(playerId: string){ this.players.delete(playerId); }
  public getSnapshot(){ return [...this.players.values()].map(s=>({ ...s })); }
  public getPerfSnapshot(){ return this.perf.snapshot(); }

  public tick(): void {
    const now = Date.now(); const dt = Math.min(0.05, (now - this.lastTimeMs)/1000);
    this.lastTimeMs = now;
    const tickStart = performance.now();
    let simulated = 0;
    for (const [id, s] of this.players){
      const next = PlayerStatePure.simulate(s, dt);
      this.players.set(id, next);
      simulated += 1;
    }
    const tickEnd = performance.now();
    this.perf.record((dt*1000), tickStart, tickEnd, simulated);
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

