
// Compiled from PlayerStatePure
(function() {
  'use strict';
  
  

type Facing = 'up'|'down'|'left'|'right';
interface Vec2 { x: number; y: number }

interface PlayerConfig { speed: number; }

interface PlayerState {
  pos: Vec2;
  vel: Vec2;
  facing: Facing;
  anim: 'idle'|'walk'|'interact';
  interactable?: string;
}

type PlayerAction =
  | { type: 'tick'; dt: number }
  | { type: 'move'; dir: Vec2 }
  | { type: 'stop' }
  | { type: 'interact'; target?: string };

function createPlayerState(): PlayerState { return { pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 }, facing: 'down', anim: 'idle' }; }

function reducePlayer(state: PlayerState, action: PlayerAction, cfg: PlayerConfig): PlayerState {
  switch (action.type) {
    case 'move': {
      const vx = clamp(action.dir.x, -1, 1) * cfg.speed;
      const vy = clamp(action.dir.y, -1, 1) * cfg.speed;
      const facing: Facing = Math.abs(vx) > Math.abs(vy) ? (vx >= 0 ? 'right':'left') : (vy >= 0 ? 'down':'up');
      return { ...state, vel: { x: vx, y: vy }, anim: 'walk', facing };
    }
    case 'stop': {
      return { ...state, vel: { x: 0, y: 0 }, anim: 'idle' };
    }
    case 'tick': {
      const nx = state.pos.x + state.vel.x * action.dt;
      const ny = state.pos.y + state.vel.y * action.dt;
      const anim = (Math.abs(state.vel.x) + Math.abs(state.vel.y)) > 0 ? 'walk' : (state.anim === 'interact' ? 'interact' : 'idle');
      return { ...state, pos: { x: nx, y: ny }, anim };
    }
    case 'interact': {
      return { ...state, anim: 'interact', interactable: action.target };
    }
    default:
      return state;
  }
}

function clamp(n: number, a: number, b: number): number { return Math.max(a, Math.min(b, n)); }

default { createPlayerState, reducePlayer };

interface Vector2 { x: number; y: number }

interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  action: boolean;
}

interface PlayerIdentity {
  playerId: string;
  team?: string;
  status?: 'active' | 'inactive' | 'disconnected';
}

interface PlayerAvatarRef {
  manifestPath: string; 
  style: '3d' | '2d-side' | 'overlay';
}

interface PlayerStateSnapshot {
  identity: PlayerIdentity;
  avatar: PlayerAvatarRef;
  position: Vector2;
  velocity: Vector2;
  input: InputState;
  tick: number;
}

class PlayerStatePure {
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
    const speed = 120; 
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


  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.PlayerStatePure = {
      // Add exports here as needed
    };
  }
})();
