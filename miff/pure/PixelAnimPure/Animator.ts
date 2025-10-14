export interface AnimationFrame {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  time: number;
  properties: Record<string, any>;
}

export interface Animation {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  frames: AnimationFrame[];
  duration: number;
  loop: boolean;
  easing: string;
}

export class PixelAnimator {
  private animations: Map<string, Animation> = new Map();
  private playingByObject: Map<string, string> = new Map();

  playAnimation(objectId: string, animation: Animation): void {
    this.animations.set(animation.id, animation);
    this.playingByObject.set(objectId, animation.id);
  }

  play(objectId: string, animationId: string): void {
    this.playingByObject.set(objectId, animationId);
  }

  stop(objectId: string): void {
    this.playingByObject.delete(objectId);
  }

  getAnimations(): Animation[] {
    return Array.from(this.animations.values());
  }

  update(deltaTime: number): void {
    // No-op for shim
  }
}

export default PixelAnimator;
