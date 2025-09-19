// CameraBridgePure - comprehensive camera system (engine-agnostic)

export type Vec2 = { x: number; y: number };
export type Camera = { 
  x: number; 
  y: number; 
  zoom?: number;
  rotation?: number;
  shake?: { intensity: number; duration: number; timeLeft: number };
  bounds?: { minX: number; minY: number; maxX: number; maxY: number };
};

export interface CameraCommand {
  op: 'follow' | 'setPosition' | 'setZoom' | 'setRotation' | 'shake' | 'lerp' | 'clamp' | 'reset';
  target?: Vec2;
  position?: Vec2;
  zoom?: number;
  rotation?: number;
  alpha?: number;
  shakeIntensity?: number;
  shakeDuration?: number;
  bounds?: { minX: number; minY: number; maxX: number; maxY: number };
}

export interface CameraResult {
  op: 'camera';
  status: 'ok' | 'error';
  camera: Camera;
  applied: CameraCommand[];
  issues?: string[];
}

export class CameraManager {
  private camera: Camera = { x: 0, y: 0, zoom: 1, rotation: 0 };
  private commands: CameraCommand[] = [];

  process(cmds: CameraCommand[]): CameraResult {
    const applied: CameraCommand[] = [];
    const issues: string[] = [];

    for (const cmd of cmds) {
      try {
        this.processCommand(cmd);
        applied.push(cmd);
        this.commands.push(cmd);
      } catch (error) {
        issues.push(`Failed to process ${cmd.op}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      op: 'camera',
      status: issues.length > 0 ? 'error' : 'ok',
      camera: { ...this.camera },
      applied,
      issues: issues.length > 0 ? issues : undefined
    };
  }

  private processCommand(cmd: CameraCommand): void {
    switch (cmd.op) {
      case 'follow':
        if (cmd.target) {
          this.follow(cmd.target, cmd.alpha ?? 1);
        }
        break;
      case 'setPosition':
        if (cmd.position) {
          this.setPosition(cmd.position);
        }
        break;
      case 'setZoom':
        if (cmd.zoom !== undefined) {
          this.setZoom(cmd.zoom);
        }
        break;
      case 'setRotation':
        if (cmd.rotation !== undefined) {
          this.setRotation(cmd.rotation);
        }
        break;
      case 'shake':
        if (cmd.shakeIntensity && cmd.shakeDuration) {
          this.shake(cmd.shakeIntensity, cmd.shakeDuration);
        }
        break;
      case 'lerp':
        if (cmd.target && cmd.alpha !== undefined) {
          this.lerp(cmd.target, cmd.alpha);
        }
        break;
      case 'clamp':
        if (cmd.bounds) {
          this.clamp(cmd.bounds);
        }
        break;
      case 'reset':
        this.reset();
        break;
    }
  }

  follow(target: Vec2, alpha: number = 1): void {
    this.camera.x = round(this.camera.x + (target.x - this.camera.x) * alpha);
    this.camera.y = round(this.camera.y + (target.y - this.camera.y) * alpha);
  }

  setPosition(position: Vec2): void {
    this.camera.x = round(position.x);
    this.camera.y = round(position.y);
  }

  setZoom(zoom: number): void {
    this.camera.zoom = Math.max(0.1, Math.min(10, round(zoom)));
  }

  setRotation(rotation: number): void {
    this.camera.rotation = round(rotation % (Math.PI * 2));
  }

  shake(intensity: number, duration: number): void {
    this.camera.shake = {
      intensity: Math.max(0, intensity),
      duration: Math.max(0, duration),
      timeLeft: duration
    };
  }

  lerp(target: Vec2, alpha: number): void {
    this.camera.x = round(this.camera.x + (target.x - this.camera.x) * alpha);
    this.camera.y = round(this.camera.y + (target.y - this.camera.y) * alpha);
  }

  clamp(bounds: { minX: number; minY: number; maxX: number; maxY: number }): void {
    this.camera.x = Math.max(bounds.minX, Math.min(bounds.maxX, this.camera.x));
    this.camera.y = Math.max(bounds.minY, Math.min(bounds.maxY, this.camera.y));
    this.camera.bounds = bounds;
  }

  reset(): void {
    this.camera = { x: 0, y: 0, zoom: 1, rotation: 0 };
    this.commands = [];
  }

  update(deltaTime: number): void {
    // Update shake
    if (this.camera.shake) {
      this.camera.shake.timeLeft -= deltaTime;
      if (this.camera.shake.timeLeft <= 0) {
        this.camera.shake = undefined;
      }
    }

    // Apply bounds if set
    if (this.camera.bounds) {
      this.clamp(this.camera.bounds);
    }
  }

  getCamera(): Camera {
    return { ...this.camera };
  }

  getPosition(): Vec2 {
    return { x: this.camera.x, y: this.camera.y };
  }

  getZoom(): number {
    return this.camera.zoom ?? 1;
  }

  getRotation(): number {
    return this.camera.rotation ?? 0;
  }

  isShaking(): boolean {
    return this.camera.shake !== undefined && this.camera.shake.timeLeft > 0;
  }
}

// Legacy functions for backward compatibility
export function follow(cam: Camera, target: Vec2, alpha: number = 1): Camera {
  const x = round(cam.x + (target.x - cam.x) * alpha);
  const y = round(cam.y + (target.y - cam.y) * alpha);
  return { x, y, zoom: cam.zoom, rotation: cam.rotation };
}

export function lerp(cam: Camera, target: Vec2, alpha: number): Camera {
  return follow(cam, target, alpha);
}

export function setZoom(cam: Camera, zoom: number): Camera {
  return { ...cam, zoom: Math.max(0.1, Math.min(10, round(zoom))) };
}

export function setRotation(cam: Camera, rotation: number): Camera {
  return { ...cam, rotation: round(rotation % (Math.PI * 2)) };
}

export function shake(cam: Camera, intensity: number, duration: number): Camera {
  return { ...cam, shake: { intensity, duration, timeLeft: duration } };
}

function round(n: number): number { 
  return Math.round(n * 100) / 100; 
}

