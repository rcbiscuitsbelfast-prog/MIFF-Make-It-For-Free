export interface Vector2 { x: number; y: number }

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  action: boolean;
}

export interface PlayerIdentity {
  playerId: string;
  team?: string;
  status?: 'active' | 'inactive' | 'disconnected';
}

export interface PlayerAvatarRef {
  manifestPath: string; // path to avatar manifest json
  style: '3d' | '2d-side' | 'overlay';
}

export interface PlayerStateSnapshot {
  identity: PlayerIdentity;
  avatar: PlayerAvatarRef;
  position: Vector2;
  velocity: Vector2;
  input: InputState;
  tick: number;
}

export class PlayerStatePure {
  public static create(playerId: string, avatarManifestPath: string, style: PlayerAvatarRef['style']): PlayerStateSnapshot {
    return {
      identity: { playerId, status: 'active' },
      avatar: { manifestPath: avatarManifestPath, style },
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      input: { left: false, right: false, up: false, down: false, jump: false, action: false },
      tick: 0
    };
  }

  public static applyInput(state: PlayerStateSnapshot, input: Partial<InputState>): PlayerStateSnapshot {
    const next: PlayerStateSnapshot = JSON.parse(JSON.stringify(state));
    Object.assign(next.input, input);
    return next;
  }

  public static simulate(state: PlayerStateSnapshot, dt: number): PlayerStateSnapshot {
    const next: PlayerStateSnapshot = JSON.parse(JSON.stringify(state));
    const speed = 120; // px/s
    const vx = (next.input.left ? -1 : 0) + (next.input.right ? 1 : 0);
    const vy = (next.input.up ? -1 : 0) + (next.input.down ? 1 : 0);
    next.velocity.x = vx * speed;
    next.velocity.y = vy * speed;
    next.position.x += next.velocity.x * dt;
    next.position.y += next.velocity.y * dt;
    next.tick += 1;
    return next;
  }

  public static serialize(state: PlayerStateSnapshot): string {
    return JSON.stringify(state);
  }

  public static deserialize(json: string): PlayerStateSnapshot {
    const o = JSON.parse(json);
    return o as PlayerStateSnapshot;
  }
}

