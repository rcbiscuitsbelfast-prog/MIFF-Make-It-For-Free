export class PlayerController {
    constructor(config = {}) {
        this.cfg = {
            width: config.width ?? 30,
            height: config.height ?? 30,
            gravity: config.gravity ?? 0.6,
            jumpForce: config.jumpForce ?? 15
        };
        this.state = { x: 0, y: 0, width: this.cfg.width, height: this.cfg.height, vx: 0, vy: 0, isOnGround: false };
    }
    setPosition(x, y) { this.state.x = x; this.state.y = y; }
    getState() { return { ...this.state }; }
    setHorizontal(dir) { this.state.vx = dir * 3; }
    jump() { if (this.state.isOnGround) {
        this.state.vy = -this.cfg.jumpForce;
        this.state.isOnGround = false;
    } }
    tick(bounds, platforms) {
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
        if (this.state.x < 0) {
            this.state.x = 0;
            this.state.vx = 0;
        }
        if (this.state.x + this.state.width > bounds.width) {
            this.state.x = bounds.width - this.state.width;
            this.state.vx = 0;
        }
    }
}
