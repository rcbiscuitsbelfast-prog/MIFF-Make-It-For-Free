/**
 * TopplerScene - Main scene controller for MIFF Toppler demo
 * 
 * Features:
 * - Loads and manages all game components
 * - Handles remix mode and debug overlays
 * - Accepts layout configuration injection
 * - Mobile-first responsive design
 * - Remix-safe architecture with no hardcoded dependencies
 */

export interface TopplerConfig {
    theme: 'forest' | 'ruins' | 'neon' | 'classic';
    platformCount: number;
    platformSpacing: number;
    playerStartHeight: number;
    winHeight: number;
    failHeight: number;
    gravity: number;
    jumpForce: number;
    remixMode: boolean;
}

export interface GameState {
    isPlaying: boolean;
    isWon: boolean;
    isFailed: boolean;
    currentHeight: number;
    maxHeight: number;
    attempts: number;
    startTime: number;
    theme: string;
}

export class TopplerScene {
    private config: TopplerConfig;
    private gameState: GameState;
    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private components: Map<string, any>;
    private animationId: number | null = null;

    constructor(config: Partial<TopplerConfig> = {}) {
        this.config = {
            theme: 'classic',
            platformCount: 8,
            platformSpacing: 120,
            playerStartHeight: 50,
            winHeight: 800,
            failHeight: -100,
            gravity: 0.6,
            jumpForce: 15,
            remixMode: false,
            ...config
        };

        this.gameState = {
            isPlaying: false,
            isWon: false,
            isFailed: false,
            currentHeight: this.config.playerStartHeight,
            maxHeight: this.config.playerStartHeight,
            attempts: 0,
            startTime: Date.now(),
            theme: this.config.theme
        };

        this.components = new Map();
        this.init();
    }

    private init(): void {
        this.createCanvas();
        this.loadComponents();
        this.setupEventListeners();
        this.gameState.isPlaying = true;
        this.startGameLoop();
    }

    private createCanvas(): void {
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.display = 'block';
        this.canvas.style.background = this.getThemeBackground();
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d')!;
    }

    private getThemeBackground(): string {
        const themes: Record<string, string> = {
            forest: 'linear-gradient(to bottom, #2d5016, #1a2e0f)',
            ruins: 'linear-gradient(to bottom, #4a4a4a, #2a2a2a)',
            neon: 'linear-gradient(to bottom, #0a0a2a, #000000)',
            classic: 'linear-gradient(to bottom, #87ceeb, #98fb98)'
        };
        
        const theme = themes[this.config.theme];
        if (theme) {
            return theme;
        }
        
        const classicTheme = themes['classic'];
        return classicTheme || 'linear-gradient(to bottom, #87ceeb, #98fb98)';
    }

    private loadComponents(): void {
        // Load components dynamically (will be implemented)
        this.components.set('player', this.createPlayer());
        this.components.set('platforms', this.createPlatforms());
        this.components.set('winTrigger', this.createWinTrigger());
        this.components.set('failZone', this.createFailZone());
        this.components.set('ui', this.createUI());
    }

    private createPlayer(): any {
        // Placeholder - will be replaced with PlayerController
        return {
            x: this.canvas.width / 2,
            y: this.canvas.height - this.config.playerStartHeight,
            width: 30,
            height: 30,
            velocityY: 0,
            isOnGround: false,
            update: () => this.updatePlayer(),
            render: () => this.renderPlayer()
        };
    }

    private createPlatforms(): any[] {
        const platforms: any[] = [];
        for (let i = 0; i < this.config.platformCount; i++) {
            const platform = {
                x: Math.random() * (this.canvas.width - 100) + 50,
                y: this.canvas.height - (i * this.config.platformSpacing + this.config.playerStartHeight),
                width: 80 + Math.random() * 40,
                height: 20,
                update: () => this.updatePlatform(),
                render: () => this.renderPlatform(platform)
            };
            platforms.push(platform);
        }
        return platforms;
    }

    private createWinTrigger(): any {
        return {
            x: this.canvas.width / 2 - 50,
            y: this.canvas.height - this.config.winHeight,
            width: 100,
            height: 20,
            render: () => this.renderWinTrigger()
        };
    }

    private createFailZone(): any {
        return {
            y: this.canvas.height + this.config.failHeight,
            render: () => this.renderFailZone()
        };
    }

    private createUI(): any {
        return {
            render: () => this.renderUI()
        };
    }

    private updatePlayer(): void {
        const player = this.components.get('player');
        
        // Apply gravity
        player.velocityY += this.config.gravity;
        player.y += player.velocityY;

        // Check platform collisions
        const platforms = this.components.get('platforms');
        player.isOnGround = false;
        
        for (const platform of platforms) {
            if (this.checkCollision(player, platform)) {
                if (player.velocityY > 0) {
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    player.isOnGround = true;
                }
            }
        }

        // Check win condition
        if (player.y <= this.canvas.height - this.config.winHeight) {
            this.triggerWin();
        }

        // Check fail condition
        if (player.y >= this.canvas.height + this.config.failHeight) {
            this.triggerFail();
        }

        // Update game state
        this.gameState.currentHeight = this.canvas.height - player.y;
        this.gameState.maxHeight = Math.max(this.gameState.maxHeight, this.gameState.currentHeight);
    }

    private updatePlatform(): void {
        // Platform update logic (can be extended for moving platforms)
        // Currently no update logic needed
    }

    private checkCollision(rect1: any, rect2: any): boolean {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    private triggerWin(): void {
        this.gameState.isWon = true;
        this.gameState.isPlaying = false;
        this.showWinMessage();
    }

    private triggerFail(): void {
        this.gameState.isFailed = true;
        this.gameState.isPlaying = false;
        this.gameState.attempts++;
        this.showFailMessage();
    }

    private showWinMessage(): void {
        if (this.config.remixMode) {
            console.log('[Toppler] Win condition triggered!');
        }
        // Will be implemented with UI component
    }

    private showFailMessage(): void {
        if (this.config.remixMode) {
            console.log(`[Toppler] Fail condition triggered! Attempts: ${this.gameState.attempts}`);
        }
        // Will be implemented with UI component
    }

    private renderPlayer(): void {
        const player = this.components.get('player');
        this.ctx.fillStyle = this.getThemeColor('player');
        this.ctx.fillRect(player.x, player.y, player.width, player.height);
        
        if (this.config.remixMode) {
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(player.x, player.y, player.width, player.height);
        }
    }

    private renderPlatform(platform: any): void {
        this.ctx.fillStyle = this.getThemeColor('platform');
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        if (this.config.remixMode) {
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        }
    }

    private renderWinTrigger(): void {
        const winTrigger = this.components.get('winTrigger');
        this.ctx.fillStyle = this.getThemeColor('win');
        this.ctx.fillRect(winTrigger.x, winTrigger.y, winTrigger.width, winTrigger.height);
        
        if (this.config.remixMode) {
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(winTrigger.x, winTrigger.y, winTrigger.width, winTrigger.height);
        }
    }

    private renderFailZone(): void {
        const failZone = this.components.get('failZone');
        this.ctx.fillStyle = this.getThemeColor('fail');
        this.ctx.fillRect(0, failZone.y, this.canvas.width, 50);
    }

    private renderUI(): void {
        // Render UI elements
        this.renderProgressBar();
        this.renderStats();
        
        if (this.config.remixMode) {
            this.renderDebugInfo();
        }
    }

    private renderProgressBar(): void {
        const progress = this.gameState.currentHeight / this.config.winHeight;
        const barWidth = 200;
        const barHeight = 20;
        const x = 20;
        const y = 20;

        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        this.ctx.fillStyle = this.getThemeColor('progress');
        this.ctx.fillRect(x, y, barWidth * progress, barHeight);
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, barWidth, barHeight);
    }

    private renderStats(): void {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Height: ${Math.round(this.gameState.currentHeight)}`, 20, 60);
        this.ctx.fillText(`Max: ${Math.round(this.gameState.maxHeight)}`, 20, 80);
        this.ctx.fillText(`Attempts: ${this.gameState.attempts}`, 20, 100);
    }

    private renderDebugInfo(): void {
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Theme: ${this.config.theme}`, 20, 140);
        this.ctx.fillText(`Gravity: ${this.config.gravity}`, 20, 155);
        this.ctx.fillText(`Jump Force: ${this.config.jumpForce}`, 20, 170);
        this.ctx.fillText(`Remix Mode: ON`, 20, 185);
    }

    private getThemeColor(element: string): string {
        const colorSchemes: Record<string, Record<string, string>> = {
            forest: {
                player: '#8B4513',
                platform: '#228B22',
                win: '#FFD700',
                fail: '#DC143C',
                progress: '#32CD32'
            },
            ruins: {
                player: '#696969',
                platform: '#A0522D',
                win: '#FFD700',
                fail: '#DC143C',
                progress: '#DAA520'
            },
            neon: {
                player: '#00FFFF',
                platform: '#FF00FF',
                win: '#FFFF00',
                fail: '#FF0000',
                progress: '#00FF00'
            },
            classic: {
                player: '#FF6B6B',
                platform: '#4ECDC4',
                win: '#45B7D1',
                fail: '#96CEB4',
                progress: '#FFEAA7'
            }
        };
        
        const themeColors = colorSchemes[this.config.theme];
        if (themeColors && themeColors[element]) {
            return themeColors[element];
        }
        
        const classicColors = colorSchemes['classic'];
        if (classicColors && classicColors[element]) {
            return classicColors[element];
        }
        
        // Fallback colors
        const fallbackColors: Record<string, string> = {
            player: '#FF6B6B',
            platform: '#4ECDC4',
            win: '#45B7D1',
            fail: '#96CEB4',
            progress: '#FFEAA7'
        };
        
        return fallbackColors[element] || '#4ECDC4';
    }

    private setupEventListeners(): void {
        // Handle window resize with bound method for proper cleanup
        window.addEventListener('resize', this.handleResize);

        // Handle input with bound method for proper cleanup
        this.canvas.addEventListener('click', this.handleInputBound);
        this.canvas.addEventListener('touchstart', this.handleInputBound);
        this.canvas.addEventListener('keydown', this.handleInputBound);
    }

    private handleInput(): void {
        if (this.gameState.isWon || this.gameState.isFailed) {
            this.resetGame();
            return;
        }

        const player = this.components.get('player');
        if (player.isOnGround) {
            player.velocityY = -this.config.jumpForce;
        }
    }

    private resetGame(): void {
        this.gameState = {
            isPlaying: true,
            isWon: false,
            isFailed: false,
            currentHeight: this.config.playerStartHeight,
            maxHeight: this.config.playerStartHeight,
            attempts: this.gameState.attempts,
            startTime: Date.now(),
            theme: this.config.theme
        };

        const player = this.components.get('player');
        player.x = this.canvas.width / 2;
        player.y = this.canvas.height - this.config.playerStartHeight;
        player.velocityY = 0;
        player.isOnGround = false;
    }

    private startGameLoop(): void {
        const gameLoop = () => {
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update components
            if (this.gameState.isPlaying) {
                this.components.get('player').update();
                this.components.get('platforms').forEach((platform: any) => platform.update());
            }

            // Render components
            this.components.get('platforms').forEach((platform: any) => platform.render());
            this.components.get('winTrigger').render();
            this.components.get('failZone').render();
            this.components.get('player').render();
            this.components.get('ui').render();

            this.animationId = requestAnimationFrame(gameLoop);
        };

        this.animationId = requestAnimationFrame(gameLoop);
    }

    // Test helper: single-step the internal loop once (no RAF)
    public loop(): void {
        if (!this.canvas || !this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.gameState.isPlaying) {
            this.components.get('player').update();
            this.components.get('platforms').forEach((platform: any) => platform.update());
        }
        this.components.get('platforms').forEach((platform: any) => platform.render());
        this.components.get('winTrigger').render();
        this.components.get('failZone').render();
        this.components.get('player').render();
        this.components.get('ui').render();
    }

    /**
     * IGameScene adapter: mount(canvas)
     * TopplerScene manages its own canvas, so this is a no-op to satisfy the bootstrap interface.
     */
    public mount(_canvas: HTMLCanvasElement): void {
        // No-op; the scene already created and attached its own canvas in init().
    }

    /**
     * IGameScene adapter: update(delta)
     * Executes a single logical update step (physics, collisions, win/fail checks).
     */
    public update(_delta: number): void {
        if (!this.canvas || !this.ctx) return;
        if (this.gameState.isPlaying) {
            this.components.get('player').update();
            this.components.get('platforms').forEach((platform: any) => platform.update());
        }
        // Keep gameState metrics fresh even if render not called yet
        const player = this.components.get('player');
        this.gameState.currentHeight = this.canvas.height - player.y;
        this.gameState.maxHeight = Math.max(this.gameState.maxHeight, this.gameState.currentHeight);
    }

    /**
     * IGameScene adapter: render()
     * Renders the current frame once.
     */
    public render(): void {
        if (!this.canvas || !this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.components.get('platforms').forEach((platform: any) => platform.render());
        this.components.get('winTrigger').render();
        this.components.get('failZone').render();
        this.components.get('player').render();
        this.components.get('ui').render();
    }

    public setRemixMode(enabled: boolean): void {
        this.config.remixMode = enabled;
        if (enabled) {
            console.log('[Toppler] Remix mode enabled');
        }
    }

    public setTheme(theme: TopplerConfig['theme']): void {
        this.config.theme = theme;
        this.gameState.theme = theme;
        this.canvas.style.background = this.getThemeBackground();
    }

    public getGameState(): GameState {
        return { ...this.gameState };
    }

    public reset(): void {
        this.resetGame();
    }

    public destroy(): void {
        // Cancel animation frame to prevent leaks
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Remove event listeners to prevent memory leaks
        if (this.canvas) {
            this.canvas.removeEventListener('click', this.handleInputBound);
            this.canvas.removeEventListener('touchstart', this.handleInputBound);
            this.canvas.removeEventListener('keydown', this.handleInputBound);
            
            // Remove canvas from DOM
            if (this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
        }
        
        // Clear resize listener
        window.removeEventListener('resize', this.handleResize);
        
        // Clear components
        this.components.clear();
        
        console.log('[TopplerScene] Cleanup completed - all resources released');
    }
    
    // Add bound methods for proper event listener cleanup
    private handleResize = () => {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    };
    
    private handleInputBound = () => this.handleInput();

    // Test helper: expose player for tests
    public getPlayer(): any {
        return this.components.get('player');
    }
}