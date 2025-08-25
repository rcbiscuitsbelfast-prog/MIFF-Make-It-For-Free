export interface PlayerConfig {
    width?: number;
    height?: number;
    gravity?: number;
    jumpForce?: number;
}

export interface PlayerState {
    x: number; y: number;
    width: number; height: number;
    vx: number; vy: number;
    isOnGround: boolean;
}

export class PlayerController {
    private cfg: Required<PlayerConfig>;
    private state: PlayerState;

    constructor(config: PlayerConfig = {}) {
        this.cfg = {
            width: config.width ?? 30,
            height: config.height ?? 30,
            gravity: config.gravity ?? 0.6,
            jumpForce: config.jumpForce ?? 15
        };
        this.state = { x: 0, y: 0, width: this.cfg.width, height: this.cfg.height, vx: 0, vy: 0, isOnGround: false };
    }

    public setPosition(x: number, y: number): void { this.state.x = x; this.state.y = y; }
    public getState(): PlayerState { return { ...this.state }; }
    public setHorizontal(dir: -1 | 0 | 1): void { this.state.vx = dir * 3; }
    public jump(): void { if (this.state.isOnGround) { this.state.vy = -this.cfg.jumpForce; this.state.isOnGround = false; } }

    public tick(bounds: { width: number; height: number }, platforms: Array<{ x: number; y: number; width: number; height: number }>): void {
        // integrate
        this.state.vy += this.cfg.gravity;
        this.state.x += this.state.vx;
        this.state.y += this.state.vy;

        // collide platforms from above
        this.state.isOnGround = false;
        for (const p of platforms) {
            const onTop = this.state.y + this.state.height <= p.y + 5;
            const intersect = this.state.x < p.x + p.width && this.state.x + this.state.width > p.x && this.state.y < p.y + p.height && this.state.y + this.state.height > p.y;
            if (intersect && this.state.vy > 0 && onTop) {
                this.state.y = p.y - this.state.height;
                this.state.vy = 0;
                this.state.isOnGround = true;
            }
        }

        // bounds
        if (this.state.x < 0) { this.state.x = 0; this.state.vx = 0; }
        if (this.state.x + this.state.width > bounds.width) { this.state.x = bounds.width - this.state.width; this.state.vx = 0; }
    }
}

