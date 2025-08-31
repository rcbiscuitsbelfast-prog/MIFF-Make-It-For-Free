// RenderPayloadPure - GameState -> frame-by-frame render payload (engine-agnostic)

export interface EntityState {
  id: string;
  x: number;
  y: number;
  layer?: number;
  spriteId: string;
}

export interface CameraState {
  x: number;
  y: number;
  zoom?: number;
}

export interface FrameState {
  entities: EntityState[];
  camera: CameraState;
  backgroundColor?: string;
}

export interface GameState {
  frames: FrameState[];
}

export interface RenderSprite {
  id: string;
  x: number;
  y: number;
  layer?: number;
}

export interface RenderFrame {
  frameIndex: number;
  sprites: RenderSprite[];
  camera: CameraState;
  backgroundColor?: string;
}

// Alias for compatibility with requested signature
export type RenderPayload = RenderFrame;

/**
 * generateRenderPayload - Converts a validated GameState into deterministic frames.
 * Determinism notes:
 *  - Sprites are sorted by (layer asc, id asc)
 *  - Optional fields are omitted if undefined to keep JSON stable
 */
export function generateRenderPayload(gameState: GameState): RenderPayload[] {
  const frames: RenderPayload[] = [];

  gameState.frames.forEach((fs, idx) => {
    const sprites: RenderSprite[] = fs.entities
      .map(e => ({ id: e.spriteId, x: round(e.x), y: round(e.y), layer: e.layer }))
      .sort((a, b) => {
        const la = a.layer ?? 0;
        const lb = b.layer ?? 0;
        if (la !== lb) return la - lb;
        return a.id.localeCompare(b.id);
      })
      .map(s => ({ id: s.id, x: s.x, y: s.y, ...(s.layer !== undefined ? { layer: s.layer } : {}) }));

    const frame: RenderFrame = {
      frameIndex: idx,
      sprites,
      camera: { x: round(fs.camera.x), y: round(fs.camera.y), ...(fs.camera.zoom !== undefined ? { zoom: round(fs.camera.zoom) } : {}) },
      ...(fs.backgroundColor ? { backgroundColor: fs.backgroundColor } : {})
    };
    frames.push(frame);
  });

  return frames;
}

function round(n: number): number { return Math.round(n * 100) / 100; }

