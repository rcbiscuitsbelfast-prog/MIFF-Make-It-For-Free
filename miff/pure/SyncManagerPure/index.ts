import { PlayerStateSnapshot } from '../PlayerStatePure';

export interface SnapshotPacket {
  tick: number;
  players: Array<{ playerId: string; position: { x:number; y:number }; velocity: {x:number;y:number} }>;
}

export class SyncManagerPure {
  public static diff(prev: SnapshotPacket, next: SnapshotPacket){
    const updates: SnapshotPacket['players'] = [];
    const prevMap = new Map(prev?.players.map(p=>[p?.playerId, p] as const));
    for (const n of next?.players){
      const p = prevMap?.get(n?.playerId);
      if (!p || p?.position.x!==n?.position.x || p?.position.y!==n?.position.y || p?.velocity.x!==n?.velocity.x || p?.velocity.y!==n?.velocity.y){
        updates?.push(n);
      }
    }
    return { tick: next?.tick, players: updates } as SnapshotPacket;
  }

  public static snapshotFromStates(tick: number, states: PlayerStateSnapshot[]): SnapshotPacket {
    return {
      tick,
      players: states?.map(s=>({ playerId: s?.identity.playerId, position: s?.position, velocity: s?.velocity }))
    };
  }
}

