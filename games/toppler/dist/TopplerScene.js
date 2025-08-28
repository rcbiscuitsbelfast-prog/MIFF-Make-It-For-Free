/**
 * Standalone TopplerScene
 * Engine-agnostic canvas-based scene controller.
 */
export class TopplerScene {
    constructor(config = {}) {
        this.player = { x: 0, y: 0, width: 30, height: 30 };
        this.platforms = [];
        this.velocityY = 0;
        this.animationId = null;
        this.hasStartedLoop = false;
        this.loop = () => {
            if (!this.hasStartedLoop)
                this.hasStartedLoop = true;
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
        };
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
    /**
     * Update game state based on delta time.
     * Called by the bootstrap loop to advance physics and game logic.
     */
    update(delta) {
        // No-op for now. Can be extended with platform/player tick logic later.
        // The existing loop() method handles physics updates internally.
    }
    mount(canvas) {
        console.log('[TopplerScene Debug] mount() called with canvas:', canvas.id, canvas.width, 'x', canvas.height);
        // Store the canvas reference
        this.canvas = canvas;
        console.log('[TopplerScene Debug] Canvas stored in this.canvas');
        // Get the 2D context and store it
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('[TopplerScene Debug] Failed to get 2D context in mount()');
            return;
        }
        this.ctx = ctx;
        console.log('[TopplerScene Debug] 2D context stored in this.ctx');
        // Initialize player position
        this.player.x = (this.config.width - this.player.width) / 2;
        this.player.y = this.config.height - this.player.height - 8;
        console.log('[TopplerScene Debug] Player positioned at:', this.player.x, this.player.y);
        // Initialize platforms
        this.platforms = Array.from({ length: 8 }).map((_, i) => ({
            x: 40 + ((i % 2) * 160),
            y: this.config.height - 80 - i * 70,
            width: 120,
            height: 16
        }));
        console.log('[TopplerScene Debug] Platforms initialized:', this.platforms.length);
        console.log('[TopplerScene Debug] mount() complete');
    }
    bootstrapCanvas(container) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
        container.appendChild(this.canvas);
        const ctx = this.canvas.getContext('2d');
        if (!ctx)
            throw new Error('Canvas 2D context not available');
        this.ctx = ctx;
        // Canvas ready
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
        // Platforms spawned
    }
    jump() {
        if (this.state.isWon || this.state.isFailed)
            return;
        // allow jump only when falling slowly or on platform
        if (this.velocityY >= 0) {
            this.velocityY = -this.config.jumpForce;
        }
    }
    startLoop() {
        this.loop();
    }
    intersects(a, b) {
        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    }
    /**
     * Render the current game state to the canvas.
     * Called by the bootstrap loop every frame.
     * This debug implementation confirms loop activity and canvas access.
     */
    render() {
        // Check if canvas exists
        if (!this.canvas) {
            console.warn('[TopplerScene Debug] Canvas is null, cannot render');
            return;
        }
        // Access the 2D rendering context
        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            console.error('[TopplerScene Debug] Failed to get 2D context');
            return;
        }
        // Clear the canvas each frame
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Fill background with a bright red color to ensure visibility
        ctx.fillStyle = "#ff0000"; // Bright red
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw a cyan rectangle in the center
        ctx.fillStyle = "#00ffff"; // Cyan
        ctx.fillRect(100, 100, 200, 200);
        // Draw debug text to confirm render loop is active
        ctx.fillStyle = "#ffffff"; // White
        ctx.font = "20px monospace";
        ctx.fillText("TopplerScene: render() active", 20, 40);
        // Draw frame count or timestamp for diagnostics
        ctx.fillStyle = "#ffff00"; // Yellow
        ctx.fillText(`Frame: ${performance.now().toFixed(0)}`, 20, 70);
        // Draw canvas info
        ctx.fillText(`Canvas: ${this.canvas.width}x${this.canvas.height}`, 20, 100);
    }
    getState() { return { ...this.state }; }
    getPlayer() { return { ...this.player }; }
    getPlatforms() { return this.platforms.map(p => ({ ...p })); }
    destroy() {
        if (this.animationId)
            cancelAnimationFrame(this.animationId);
        if (this.canvas && this.canvas.parentNode)
            this.canvas.parentNode.removeChild(this.canvas);
    }
}
