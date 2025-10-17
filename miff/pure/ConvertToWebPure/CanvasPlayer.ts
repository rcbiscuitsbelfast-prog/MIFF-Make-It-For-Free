// ConvertToWebPure - HTML5 Canvas player for RenderPayloadPure frames
// Engine-agnostic canvas renderer with play/pause/replay and optional interpolation

import { RenderFrame } from '../RenderPayloadPure/GameStateToFrames';

export type CanvasPlayerOptions = {
  fps?: number;            // Target frames per second (for timebase only)
  speed?: number;          // Playback speed multiplier
  background?: string;     // Default background color
  interpolate?: boolean;   // Linear interpolation between frames
  debug?: boolean;         // Draw overlay with IDs and frame index
  spriteSize?: number;     // Default box size for sprites (since we have IDs only)
};

export class CanvasRenderPlayer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private frames: RenderFrame[];
  private opts: Required<CanvasPlayerOptions>;
  private rafId: number | null = null;
  private playing = false;
  private startTime = 0;
  private pausedTime = 0;
  private frameIndex = 0;

  constructor(canvas: HTMLCanvasElement, frames: RenderFrame[], options: CanvasPlayerOptions = {}){
    const ctx = canvas.getContext('2d');
    if(!ctx) throw new Error('Canvas 2D context not available');
    this.canvas = canvas;
    this.ctx = ctx;
    this.frames = frames.slice();
    this.opts = {
      fps: options.fps ?? 30,
      speed: options.speed ?? 1,
      background: options.background ?? '#000000',
      interpolate: options.interpolate ?? false,
      debug: options.debug ?? false,
      spriteSize: options.spriteSize ?? 16
    };
    this.resizeForDevicePixelRatio();
    this.drawFrame(0, 0);
  }

  play(){
    if(this.playing) return;
    this.playing = true;
    this.startTime = performance.now() - this.pausedTime;
    const loop = (now: number) => {
      if(!this.playing) return;
      const elapsed = (now - this.startTime) / 1000 * this.opts.speed;
      const frameDur = 1 / this.opts.fps;
      const totalFrames = this.frames.length;
      const exactIndex = elapsed / frameDur;
      const base = Math.floor(exactIndex);
      const t = exactIndex - base; // 0..1
      const i = Math.min(base, totalFrames - 1);
      const next = Math.min(i + 1, totalFrames - 1);
      this.frameIndex = i;
      this.drawFrame(i, this.opts.interpolate ? t : 0);
      if(i >= totalFrames - 1){
        // stop at last frame
        this.pause();
        return;
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  pause(){
    if(!this.playing) return;
    this.playing = false;
    if(this.rafId !== null){
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.pausedTime = performance.now() - this.startTime;
  }

  stop(){
    this.pause();
    this.pausedTime = 0;
    this.frameIndex = 0;
    this.drawFrame(0, 0);
  }

  toggle(){ this.playing ? this.pause() : this.play(); }
  setDebug(v: boolean){ this.opts.debug = v; this.drawFrame(this.frameIndex, 0); }
  setSpeed(v: number){ this.opts.speed = Math.max(0.1, v); }
  setInterpolation(v: boolean){ this.opts.interpolate = v; }

  private resizeForDevicePixelRatio(){
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private drawFrame(i: number, t: number){
    const curr = this.frames[i];
    const next = this.frames[Math.min(i + 1, this.frames.length - 1)];
    const ctx = this.ctx;

    // background
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.fillStyle = curr.backgroundColor || this.opts.background;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // camera (simple translate/scale)
    const camX = lerp(curr.camera.x, next.camera.x ?? curr.camera.x, t);
    const camY = lerp(curr.camera.y, next.camera.y ?? curr.camera.y, t);
    const camZ = lerp(curr.camera.zoom ?? 1, next.camera.zoom ?? (curr.camera.zoom ?? 1), t);
    ctx.translate(-camX, -camY);
    ctx.scale(camZ, camZ);

    // sprites - frame already sorted by layer; still ensure 
    const sprites = curr.sprites;
    const size = this.opts.spriteSize;
    for(const s of sprites){
      // color based on id hash for visibility
      ctx.fillStyle = colorFromId(s.id);
      ctx.fillRect(s.x - size/2, s.y - size/2, size, size);
      if(this.opts.debug){
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(s.id, s.x - size/2, s.y - size/2 - 2);
      }
    }

    ctx.restore();
    if(this.opts.debug){
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '12px monospace';
      ctx.fillText(`frame ${i}`, 8, 14);
    }
  }
}

function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }

function colorFromId(id: string): string {
  let h = 0;
  for(let i=0;i<id.length;i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const r = (h & 0xFF);
  const g = ((h >> 8) & 0xFF);
  const b = ((h >> 16) & 0xFF);
  return `rgb(${r},${g},${b})`;
}

