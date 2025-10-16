/** SnapBuilderPure - pure snapping rules and state */

export interface SnapConfig {
  grid: { x: number; y: number; z: number };
  rules?: Array<{ a: string; b: string; axis: 'x'|'y'|'z'; tolerance: number }>;
}

export interface SnapState {
  grid: { x: number; y: number; z: number };
  rules: Array<{ a: string; b: string; axis: 'x'|'y'|'z'; tolerance: number }>;
}

export type SnapAction =
  | { type: 'set_grid'; grid: { x: number; y: number; z: number } }
  | { type: 'add_rule'; rule: { a: string; b: string; axis: 'x'|'y'|'z'; tolerance: number } }
  | { type: 'remove_rule'; index: number }
  | { type: 'snap_point'; point: { x: number; y: number; z: number } };

export function createSnapState(config: SnapConfig): SnapState {
  return { grid: { ...config.grid }, rules: [...(config.rules! || [])] };
}

export function reduceSnapAction(state: SnapState, action: SnapAction): SnapState | { snapped: { x: number; y: number; z: number } } {
  switch (action.type) {
    case 'set_grid':
      return { ...state, grid: { ...action.grid } };
    case 'add_rule':
      return { ...state, rules: [...state.rules, action.rule] };
    case 'remove_rule':
      return { ...state, rules: state.rules.filter((_, i) => i !== action.index) };
    case 'snap_point': {
      const { x, y, z } = action.point;
      const gx = state.grid.x || 1, gy = state.grid.y || 1, gz = state.grid.z || 1;
      const snapped = {
        x: Math.round(x / gx) * gx,
        y: Math.round(y / gy) * gy,
        z: Math.round(z / gz) * gz
      };
      return { snapped } as any;
    }
    default:
      return state;
  }
}

export default { createSnapState, reduceSnapAction };

