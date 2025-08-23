export type Vector2 = { x: number; y: number };

export type FrameEntity = {
  id: string;
  type: 'sprite' | 'text' | 'node' | 'sound' | 'animation';
  position: Vector2;
  animation?: { name: string; playing: boolean };
  effects?: string[];
  props?: Record<string, any>;
};

export type FrameUIOverlay = {
  id: string;
  kind: 'debug' | 'hud' | 'tooltip' | 'menu';
  text?: string;
  position?: Vector2;
};

export type RenderFrame = {
  frameId: string;
  timestampMs: number;
  entities: FrameEntity[];
  uiOverlays?: FrameUIOverlay[];
  annotations?: string[];
};

export type ValidateOutput = { op: 'validate'; status: 'ok' | 'error'; issues: string[] };
export type DumpOutput = { op: 'dump'; status: 'ok'; frame: RenderFrame };

export class RenderPayloadManager {
  validate(frame: RenderFrame): ValidateOutput {
    const issues: string[] = [];
    if (!frame.frameId) issues.push('Missing frameId');
    if (typeof frame.timestampMs !== 'number') issues.push('timestampMs must be number');
    if (!Array.isArray(frame.entities)) issues.push('entities must be an array');
    frame.entities?.forEach((e, i) => {
      if (!e.id) issues.push(`Entity ${i}: missing id`);
      if (!e.type) issues.push(`Entity ${i}: missing type`);
      if (!e.position || typeof e.position.x !== 'number' || typeof e.position.y !== 'number') {
        issues.push(`Entity ${i}: invalid position`);
      }
    });
    return { op: 'validate', status: issues.length ? 'error' : 'ok', issues };
  }

  dump(frame: RenderFrame): DumpOutput {
    return { op: 'dump', status: 'ok', frame: JSON.parse(JSON.stringify(frame)) };
  }
}