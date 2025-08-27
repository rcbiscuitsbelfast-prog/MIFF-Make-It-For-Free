/**
 * Standalone TopplerScene
 * Engine-agnostic canvas-based scene controller.
 */
import { StartMenu } from './StartMenu';
import type { StartMenuConfig, StartMenuEvents } from './StartMenu';

export type TopplerTheme = 'classic' | 'forest' | 'ruins' | 'neon';

export interface TopplerConfig {
    theme?: TopplerTheme;
    width?: number;
    height?: number;
    gravity?: number;
    jumpForce?: number;
    winHeight?: number;
    failHeight?: number;
}

export interface GameState {
    isPlaying: boolean;
    isWon: boolean;
    isFailed: boolean;
    currentHeight: number;
    maxHeight: number;
    attempts: number;
    startTime: number;
    theme: TopplerTheme;
}

export interface Rect { x: number; y: number; width: number; height: number }

export class TopplerScene {
    private config: Required<TopplerConfig>;
    private state: GameState;
    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private player: Rect = { x: 0, y: 0, width: 30, height: 30 };
    private platforms: Rect[] = [];
    private velocityY = 0;
    private animationId: number | null = null;
    private hasStartedLoop: boolean = false;
    private tickCount: number = 0;

    constructor(config: TopplerConfig = {}) {
        this.config = {
            theme: config.theme ?? 'classic',
            width: config.width ?? 360,
            height: config.height ?? 640,
            gravity: config.gravity ?? 0.6,
            jumpForce: config.jumpForce ?? 15,
            winHeight: config.winHeight ?? 560,
            failHeight: config.failHeight ?? -100
        };
        this.state = {
            isPlaying: true,
            isWon: false,
            isFailed: false,
            currentHeight: 0,
            maxHeight: 0,
            attempts: 0,
            startTime: Date.now(),
            theme: this.config.theme
        };
    }

    public mount(container: HTMLElement): void {
        // Render start menu first; game loop begins after user starts
        const menuConfig: StartMenuConfig = { title: 'Toppler', instructions: 'Reach the top. Space/ArrowUp to jump.' };
        const menu = new StartMenu(menuConfig);
        const events: StartMenuEvents = {
            onStart: (): void => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log('[Toppler Debug] StartMenu onStart fired');
                }
                this.bootstrapCanvas(container);
                this.loop();
            },
            onToggleContrast: (enabled: boolean): void => {
                // High contrast palette
                document.body.style.background = enabled ? '#000' : '#0b0b0b';
            },
            onToggleReducedMotion: (enabled: boolean): void => {
                // If reduced motion is on, lower gravity to reduce rapid movement
                this.config.gravity = enabled ? 0.3 : 0.6;
            }
        };
        menu.mount(container, events);

        // Optional: auto-start via URL param for testing (e.g., ?autostart=1)
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get('autostart') === '1') {
                if (typeof (menu as any).unmount === 'function') (menu as any).unmount();
                events.onStart();
            }
        } catch {}
    }

    private bootstrapCanvas(container: HTMLElement): void {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
        container.appendChild(this.canvas);
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context not available');
        this.ctx = ctx;
        if (process.env.NODE_ENV !== 'production') {
            // Debug: confirm canvas mount and size
            console.log('[TopplerScene] Canvas mounted', { width: this.canvas.width, height: this.canvas.height });
        }

        // Place player bottom center
        this.player.x = (this.config.width - this.player.width) / 2;
        this.player.y = this.config.height - this.player.height - 8;

        // Simple ascending platforms
        this.platforms = Array.from({ length: 8 }).map((_, i) => ({
            x: 40 + ((i % 2) * 160),
            y: this.config.height - 80 - i * 70,
            width: 120,
            height: 16
        }));
        if (process.env.NODE_ENV !== 'production') {
            console.log('[Toppler Debug] Platforms spawned:', this.platforms.length);
        }
    }

    public jump(): void {
        if (this.state.isWon || this.state.isFailed) return;
        // allow jump only when falling slowly or on platform
        if (this.velocityY >= 0) {
            this.velocityY = -this.config.jumpForce;
        }
    }

    private loop = (): void => {
        if (!this.hasStartedLoop) {
            this.hasStartedLoop = true;
            if (process.env.NODE_ENV !== 'production') {
                console.log('[TopplerScene] Game loop started');
            }
        }
        this.tickCount++;
        if (process.env.NODE_ENV !== 'production' && (this.tickCount % 30 === 0)) {
            console.log('[Toppler Debug] Loop tick', this.tickCount, 'height', this.config.height - this.player.y);
        }
        // physics
        this.velocityY += this.config.gravity;
        this.player.y += this.velocityY;

        // collide with platforms from above
        for (const p of this.platforms) {
            const onTop = this.player.y + this.player.height <= p.y + 5;
            if (this.intersects(this.player, p) && this.velocityY > 0 && onTop) {
                this.player.y = p.y - this.player.height;
                this.velocityY = 0;
            }
        }

        // win/fail checks
        const heightFromBottom = this.config.height - this.player.y;
        this.state.currentHeight = heightFromBottom;
        this.state.maxHeight = Math.max(this.state.maxHeight, heightFromBottom);
        if (heightFromBottom >= this.config.winHeight) {
            this.state.isWon = true;
            this.state.isPlaying = false;
        }
        if (this.player.y > this.config.height - this.config.failHeight) {
            this.state.isFailed = true;
            this.state.isPlaying = false;
        }

        // render
        this.render();

        if (this.state.isPlaying) {
            this.animationId = requestAnimationFrame(this.loop);
        }
    }

    private intersects(a: Rect, b: Rect): boolean {
        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    }

    private render(): void {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.config.width, this.config.height);
        // bg
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.config.width, this.config.height);
        // platforms
        this.ctx.fillStyle = '#4ECDC4';
        for (const p of this.platforms) this.ctx.fillRect(p.x, p.y, p.width, p.height);
        // player
        this.ctx.fillStyle = '#FFE66D';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    }

    public getState(): GameState { return { ...this.state }; }
    public getPlayer(): Rect { return { ...this.player }; }
    public getPlatforms(): Rect[] { return this.platforms.map(p => ({ ...p })); }

    public destroy(): void {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.canvas && this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
    }
}

