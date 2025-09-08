/**
 * TopplerMedieval - Orchestration-driven Toppler Medieval implementation
 * 
 * Features:
 * - Orchestration.medieval.json driven overlays and transitions
 * - Input mode detection (gamepad, keyboard, touch)
 * - Persistent state management
 * - MIFF standards compliance
 * - No legacy UI artifacts
 */

export interface TopplerState {
    score: number;
    difficulty: 'Squire' | 'Knight' | 'Warlord';
    inputMode: 'touch' | 'keyboard' | 'gamepad';
    currentScene: 'TopplerIntro' | 'TopplerPlay' | 'TopplerGameOver';
    gameActive: boolean;
    player: {
        x: number;
        y: number;
        vx: number;
        vy: number;
        w: number;
        h: number;
    };
    enemies: Array<{ x: number; y: number; w: number; h: number; dir: number }>;
    chests: Array<{ x: number; y: number; w: number; h: number }>;
    platforms: Array<{ x: number; y: number; w: number; h: number; t: number }>;
    goalX: number;
    time: number;
}

export interface OrchestrationConfig {
    zone: string;
    title: string;
    description: string;
    ui: {
        startMenu: {
            enabled: boolean;
            options: Array<{
                label: string;
                action?: string;
                submenu?: Array<{
                    label: string;
                    toggle?: string;
                    choices?: string[];
                    bind?: string;
                }>;
            }>;
        };
    };
    orchestration: {
        startScene: string;
        scenes: string[];
        transitions: Record<string, { from: string; to: string; modal?: string }>;
    };
}

export class TopplerMedieval {
    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private state: TopplerState;
    private orchestration: OrchestrationConfig | null = null;
    private animationId: number | null = null;
    private lastTime = 0;
    private gamepadIndex = -1;
    private touchZones: Array<{ id: string; x: number; y: number; w: number; h: number }> = [];
    
    // Audio
    private audio = {
        music: null as HTMLAudioElement | null,
        sfx: {
            jump: null as HTMLAudioElement | null,
            collect: null as HTMLAudioElement | null,
            curse: null as HTMLAudioElement | null
        }
    };
    
    // Sprites
    private sprites = {
        player: null as HTMLImageElement | null,
        enemy: null as HTMLImageElement | null,
        cliff: null as HTMLImageElement | null,
        bridge: null as HTMLImageElement | null,
        chest: null as HTMLImageElement | null
    };

    constructor() {
        this.state = this.getDefaultState();
        this.initializeInputDetection();
    }

    private getDefaultState(): TopplerState {
        return {
            score: 0,
            difficulty: 'Squire',
            inputMode: 'keyboard',
            currentScene: 'TopplerIntro',
            gameActive: false,
            player: { x: 20, y: 420, vx: 0, vy: 0, w: 40, h: 40 },
            enemies: [],
            chests: [],
            platforms: [],
            goalX: 560,
            time: 0
        };
    }

    private initializeInputDetection(): void {
        // Detect gamepad
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                this.gamepadIndex = i;
                this.state.inputMode = 'gamepad';
                break;
            }
        }

        // Detect touch capability
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.state.inputMode = 'touch';
        }

        // Listen for gamepad connection
        window.addEventListener('gamepadconnected', (e) => {
            this.gamepadIndex = e.gamepad.index;
            this.state.inputMode = 'gamepad';
            this.persistState();
        });

        window.addEventListener('gamepaddisconnected', () => {
            this.gamepadIndex = -1;
            this.state.inputMode = 'ontouchstart' in window ? 'touch' : 'keyboard';
            this.persistState();
        });
    }

    public async mount(canvas: HTMLCanvasElement): Promise<void> {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        
        // Load orchestration configuration
        await this.loadOrchestration();
        
        // Restore state from localStorage
        this.restoreState();
        
        // Load assets
        await this.loadAssets();
        
        // Setup input handlers
        this.setupInputHandlers();
        
        // Setup touch zones for touch input
        this.setupTouchZones();
        
        // Start with intro scene
        this.transitionToScene('TopplerIntro');
        
        // Start game loop
        this.startGameLoop();
    }

    private async loadOrchestration(): Promise<void> {
        try {
            const response = await fetch('/site/zones/toppler/orchestration.medieval.json');
            this.orchestration = await response.json();
        } catch (error) {
            console.error('Failed to load orchestration config:', error);
        }
    }

    private persistState(): void {
        try {
            const persistedState = {
                score: this.state.score,
                difficulty: this.state.difficulty,
                inputMode: this.state.inputMode
            };
            localStorage.setItem('toppler_state', JSON.stringify(persistedState));
        } catch (error) {
            console.error('Failed to persist state:', error);
        }
    }

    private restoreState(): void {
        try {
            const saved = localStorage.getItem('toppler_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.score !== undefined) this.state.score = parsed.score;
                if (parsed.difficulty) this.state.difficulty = parsed.difficulty;
                if (parsed.inputMode) this.state.inputMode = parsed.inputMode;
            }
        } catch (error) {
            console.error('Failed to restore state:', error);
        }
    }

    private resetGameState(): void {
        this.state.score = 0;
        this.state.player = { x: 20, y: 420, vx: 0, vy: 0, w: 40, h: 40 };
        this.state.enemies = [];
        this.state.chests = [];
        this.state.platforms = [];
        this.state.time = 0;
        this.state.gameActive = false;
        this.persistState();
    }

    private async loadAssets(): Promise<void> {
        const loadImage = (src: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load ${src}`));
                img.src = src;
            });
        };

        const loadAudio = (src: string): Promise<HTMLAudioElement> => {
            return new Promise((resolve, reject) => {
                const audio = new Audio();
                audio.oncanplaythrough = () => resolve(audio);
                audio.onerror = () => reject(new Error(`Failed to load ${src}`));
                audio.src = src;
            });
        };

        // Load sprites
        try {
            this.sprites.player = await loadImage('/assets/Player.png');
            this.sprites.enemy = await loadImage('/assets/Skeleton.png');
            this.sprites.cliff = await loadImage('/assets/Cliff_Tile.png');
            this.sprites.bridge = await loadImage('/assets/Bridge_Wood.png');
            this.sprites.chest = await loadImage('/assets/Chest.png');
        } catch (error) {
            console.warn('Some sprites failed to load:', error);
        }

        // Load audio
        try {
            this.audio.music = await loadAudio('/assets/audio/music/Loops/1. Dawn of Blades.ogg');
            this.audio.music.loop = true;
            this.audio.music.volume = 0.2;
            
            this.audio.sfx.jump = await loadAudio('/assets/audio/sfx/confirmation_3_sean.wav');
            this.audio.sfx.collect = await loadAudio('/assets/audio/sfx/completion_4_sean.wav');
            this.audio.sfx.curse = await loadAudio('/assets/audio/sfx/damage_5_sean.wav');
        } catch (error) {
            console.warn('Some audio files failed to load:', error);
        }
    }

    private setupInputHandlers(): void {
        // Keyboard input
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Touch input
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Mouse input (fallback)
        this.canvas.addEventListener('click', this.handleClick.bind(this));
    }

    private setupTouchZones(): void {
        if (this.state.inputMode !== 'touch') return;
        
        const canvasRect = this.canvas.getBoundingClientRect();
        const zoneSize = 80;
        const margin = 20;
        
        this.touchZones = [
            { id: 'left', x: margin, y: canvasRect.height - zoneSize - margin, w: zoneSize, h: zoneSize },
            { id: 'right', x: canvasRect.width - zoneSize - margin, y: canvasRect.height - zoneSize - margin, w: zoneSize, h: zoneSize },
            { id: 'jump', x: canvasRect.width / 2 - zoneSize / 2, y: canvasRect.height - zoneSize - margin, w: zoneSize, h: zoneSize }
        ];
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (this.state.inputMode !== 'keyboard') return;
        
        switch (event.key) {
            case 'ArrowLeft':
                this.state.player.vx = -140;
                break;
            case 'ArrowRight':
                this.state.player.vx = 140;
                break;
            case 'ArrowUp':
            case ' ':
                if (this.state.currentScene === 'TopplerPlay' && this.isPlayerOnGround()) {
                    this.state.player.vy = -360;
                    this.playSound('jump');
                }
                break;
            case 'Enter':
                this.handleSceneTransition();
                break;
        }
    }

    private handleKeyUp(event: KeyboardEvent): void {
        if (this.state.inputMode !== 'keyboard') return;
        
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            this.state.player.vx = 0;
        }
    }

    private handleTouchStart(event: TouchEvent): void {
        if (this.state.inputMode !== 'touch') return;
        
        event.preventDefault();
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        for (const zone of this.touchZones) {
            if (x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h) {
                switch (zone.id) {
                    case 'left':
                        this.state.player.vx = -140;
                        break;
                    case 'right':
                        this.state.player.vx = 140;
                        break;
                    case 'jump':
                        if (this.state.currentScene === 'TopplerPlay' && this.isPlayerOnGround()) {
                            this.state.player.vy = -360;
                            this.playSound('jump');
                        }
                        break;
                }
                break;
            }
        }
        
        // Handle scene transitions on tap
        this.handleSceneTransition();
    }

    private handleTouchEnd(event: TouchEvent): void {
        if (this.state.inputMode !== 'touch') return;
        
        event.preventDefault();
        this.state.player.vx = 0;
    }

    private handleClick(event: MouseEvent): void {
        this.handleSceneTransition();
    }

    private handleSceneTransition(): void {
        switch (this.state.currentScene) {
            case 'TopplerIntro':
                this.transitionToScene('TopplerPlay');
                break;
            case 'TopplerGameOver':
                this.resetGameState();
                this.transitionToScene('TopplerIntro');
                break;
        }
    }

    private transitionToScene(scene: 'TopplerIntro' | 'TopplerPlay' | 'TopplerGameOver'): void {
        this.state.currentScene = scene;
        
        switch (scene) {
            case 'TopplerIntro':
                this.state.gameActive = false;
                break;
            case 'TopplerPlay':
                this.state.gameActive = true;
                this.initializeGameEntities();
                this.playMusic();
                break;
            case 'TopplerGameOver':
                this.state.gameActive = false;
                this.stopMusic();
                break;
        }
    }

    private initializeGameEntities(): void {
        // Initialize enemies
        this.state.enemies = [
            { x: 200, y: 460, w: 28, h: 28, dir: 1 },
            { x: 360, y: 460, w: 28, h: 28, dir: -1 }
        ];

        // Initialize chests
        this.state.chests = [
            { x: 120, y: 460, w: 22, h: 22 },
            { x: 480, y: 460, w: 22, h: 22 }
        ];

        // Initialize platforms based on difficulty
        const difficultySettings = this.getDifficultySettings();
        this.state.platforms = [
            { x: 80, y: 420, w: 60, h: 10, t: difficultySettings.platformLife },
            { x: 200, y: 380, w: 60, h: 10, t: difficultySettings.platformLife },
            { x: 320, y: 400, w: 60, h: 10, t: difficultySettings.platformLife },
            { x: 440, y: 360, w: 60, h: 10, t: difficultySettings.platformLife }
        ];
    }

    private getDifficultySettings() {
        switch (this.state.difficulty) {
            case 'Knight':
                return { gravity: 980, enemySpeed: 60, platformLife: 6.0 };
            case 'Warlord':
                return { gravity: 1100, enemySpeed: 90, platformLife: 4.0 };
            default: // Squire
                return { gravity: 900, enemySpeed: 40, platformLife: 8.0 };
        }
    }

    private isPlayerOnGround(): boolean {
        return this.state.player.y + this.state.player.h >= 480 - 20;
    }

    private playSound(sound: 'jump' | 'collect' | 'curse'): void {
        try {
            if (this.audio.sfx[sound]) {
                this.audio.sfx[sound]!.currentTime = 0;
                this.audio.sfx[sound]!.play();
            }
        } catch (error) {
            console.warn(`Failed to play sound: ${sound}`, error);
        }
    }

    private playMusic(): void {
        try {
            if (this.audio.music) {
                this.audio.music.play();
            }
        } catch (error) {
            console.warn('Failed to play music:', error);
        }
    }

    private stopMusic(): void {
        try {
            if (this.audio.music) {
                this.audio.music.pause();
                this.audio.music.currentTime = 0;
            }
        } catch (error) {
            console.warn('Failed to stop music:', error);
        }
    }

    private updateGamepad(): void {
        if (this.gamepadIndex === -1 || this.state.inputMode !== 'gamepad') return;
        
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[this.gamepadIndex];
        
        if (!gamepad) return;
        
        // Left stick or D-pad for movement
        const leftStickX = gamepad.axes[0];
        const dpadLeft = gamepad.buttons[14]?.pressed;
        const dpadRight = gamepad.buttons[15]?.pressed;
        
        if (Math.abs(leftStickX) > 0.1) {
            this.state.player.vx = leftStickX * 140;
        } else if (dpadLeft) {
            this.state.player.vx = -140;
        } else if (dpadRight) {
            this.state.player.vx = 140;
        } else {
            this.state.player.vx = 0;
        }
        
        // A button or face button 0 for jump
        if (gamepad.buttons[0]?.pressed && this.state.currentScene === 'TopplerPlay' && this.isPlayerOnGround()) {
            this.state.player.vy = -360;
            this.playSound('jump');
        }
        
        // Start button for scene transitions
        if (gamepad.buttons[9]?.pressed) {
            this.handleSceneTransition();
        }
    }

    private update(deltaTime: number): void {
        if (this.state.currentScene !== 'TopplerPlay' || !this.state.gameActive) return;
        
        this.updateGamepad();
        
        const settings = this.getDifficultySettings();
        
        // Update player physics
        this.state.player.vy += settings.gravity * deltaTime;
        this.state.player.x += this.state.player.vx * deltaTime;
        this.state.player.y += this.state.player.vy * deltaTime;
        
        // Ground collision
        const floorY = 480 - 20 - this.state.player.h;
        if (this.state.player.y > floorY) {
            this.state.player.y = floorY;
            this.state.player.vy = 0;
        }
        
        // Boundary constraints
        if (this.state.player.x < 0) this.state.player.x = 0;
        if (this.state.player.x + this.state.player.w > 640) {
            this.state.player.x = 640 - this.state.player.w;
        }
        
        // Update enemies
        for (const enemy of this.state.enemies) {
            enemy.x += enemy.dir * settings.enemySpeed * deltaTime;
            
            if (enemy.x < 40) {
                enemy.x = 40;
                enemy.dir = 1;
            }
            if (enemy.x + enemy.w > 600) {
                enemy.x = 600 - enemy.w;
                enemy.dir = -1;
            }
            
            // Check collision with player
            if (this.rectsOverlap(this.state.player, enemy)) {
                this.playSound('curse');
                this.transitionToScene('TopplerGameOver');
                return;
            }
        }
        
        // Update chests
        for (let i = this.state.chests.length - 1; i >= 0; i--) {
            const chest = this.state.chests[i];
            if (this.rectsOverlap(this.state.player, chest)) {
                this.state.score += 10;
                this.state.chests.splice(i, 1);
                this.playSound('collect');
            }
        }
        
        // Check win condition
        if (this.state.player.x + this.state.player.w >= this.state.goalX) {
            this.transitionToScene('TopplerGameOver');
        }
        
        this.state.time += deltaTime;
        this.persistState();
    }

    private rectsOverlap(a: { x: number; y: number; w: number; h: number }, 
                        b: { x: number; y: number; w: number; h: number }): boolean {
        return a.x < b.x + b.w && 
               a.x + a.w > b.x && 
               a.y < b.y + b.h && 
               a.y + a.h > b.y;
    }

    private render(): void {
        // Clear canvas
        this.ctx.fillStyle = '#0b1020';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch (this.state.currentScene) {
            case 'TopplerIntro':
                this.renderIntroOverlay();
                break;
            case 'TopplerPlay':
                this.renderGameplay();
                break;
            case 'TopplerGameOver':
                this.renderGameOverOverlay();
                break;
        }
    }

    private renderIntroOverlay(): void {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#58a6ff';
        this.ctx.font = 'bold 32px serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.orchestration?.title || 'Toppler: Medieval', this.canvas.width / 2, 150);
        
        this.ctx.fillStyle = '#d0d7de';
        this.ctx.font = '18px serif';
        this.ctx.fillText(this.orchestration?.description || 'Leap across haunted isles...', this.canvas.width / 2, 200);
        
        this.ctx.fillStyle = '#ffa500';
        this.ctx.font = '16px sans-serif';
        this.ctx.fillText('Press Enter or Tap to Start Quest', this.canvas.width / 2, 300);
        
        this.ctx.fillStyle = '#888';
        this.ctx.font = '14px sans-serif';
        this.ctx.fillText(`Input Mode: ${this.state.inputMode.toUpperCase()}`, this.canvas.width / 2, 350);
        this.ctx.fillText(`Difficulty: ${this.state.difficulty}`, this.canvas.width / 2, 370);
    }

    private renderGameplay(): void {
        // Render ground tiles
        if (this.sprites.cliff) {
            for (let x = 0; x < this.canvas.width; x += 32) {
                this.ctx.drawImage(this.sprites.cliff, x, this.canvas.height - 32, 32, 32);
            }
        }
        
        // Render platforms
        for (const platform of this.state.platforms) {
            if (platform.t > 0) {
                const alpha = Math.max(0.2, platform.t / 8);
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                
                if (this.sprites.bridge) {
                    this.ctx.drawImage(this.sprites.bridge, platform.x, platform.y, platform.w, platform.h);
                } else {
                    this.ctx.fillStyle = `rgba(120, 120, 180, ${alpha})`;
                    this.ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
                }
                
                this.ctx.restore();
            }
        }
        
        // Render goal area
        const pulse = 8 + Math.abs(Math.sin(performance.now() / 200)) * 10;
        this.ctx.fillStyle = '#0f2a3f';
        this.ctx.fillRect(this.state.goalX, 0, this.canvas.width - this.state.goalX, this.canvas.height);
        this.ctx.fillStyle = '#13466e';
        this.ctx.fillRect(this.state.goalX - pulse, 0, 3, this.canvas.height);
        
        // Render enemies
        for (const enemy of this.state.enemies) {
            if (this.sprites.enemy) {
                this.ctx.drawImage(this.sprites.enemy, enemy.x, enemy.y, enemy.w, enemy.h);
            } else {
                this.ctx.fillStyle = '#bd4b4b';
                this.ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
            }
        }
        
        // Render chests
        for (let i = 0; i < this.state.chests.length; i++) {
            const chest = this.state.chests[i];
            if (this.sprites.chest) {
                this.ctx.save();
                this.ctx.filter = `hue-rotate(${(i % 2) * 180}deg)`;
                this.ctx.drawImage(this.sprites.chest, chest.x, chest.y, chest.w, chest.h);
                this.ctx.filter = 'none';
                this.ctx.restore();
            } else {
                this.ctx.fillStyle = i % 2 ? '#d46f6f' : '#6fb7d4';
                this.ctx.fillRect(chest.x, chest.y, chest.w, chest.h);
            }
        }
        
        // Render player
        if (this.sprites.player) {
            this.ctx.drawImage(this.sprites.player, this.state.player.x, this.state.player.y, 
                             this.state.player.w, this.state.player.h);
        } else {
            this.ctx.fillStyle = '#58a6ff';
            this.ctx.fillRect(this.state.player.x, this.state.player.y, 
                             this.state.player.w, this.state.player.h);
        }
        
        // Render UI
        this.ctx.fillStyle = '#d0d7de';
        this.ctx.font = '14px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.state.score}`, 10, 20);
        this.ctx.fillText(`Difficulty: ${this.state.difficulty}`, 10, 40);
        
        // Render touch zones if in touch mode
        if (this.state.inputMode === 'touch') {
            this.renderTouchZones();
        }
    }

    private renderTouchZones(): void {
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#58a6ff';
        
        for (const zone of this.touchZones) {
            this.ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
            
            // Add zone labels
            this.ctx.save();
            this.ctx.globalAlpha = 0.8;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px sans-serif';
            this.ctx.textAlign = 'center';
            
            let label = '';
            switch (zone.id) {
                case 'left': label = '◀'; break;
                case 'right': label = '▶'; break;
                case 'jump': label = '⤴'; break;
            }
            
            this.ctx.fillText(label, zone.x + zone.w / 2, zone.y + zone.h / 2 + 4);
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }

    private renderGameOverOverlay(): void {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 28px serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Quest Complete!', this.canvas.width / 2, 150);
        
        this.ctx.fillStyle = '#d0d7de';
        this.ctx.font = '18px sans-serif';
        this.ctx.fillText(`Final Score: ${this.state.score}`, this.canvas.width / 2, 200);
        this.ctx.fillText(`Time: ${Math.round(this.state.time)}s`, this.canvas.width / 2, 230);
        
        this.ctx.fillStyle = '#ffa500';
        this.ctx.font = '16px sans-serif';
        this.ctx.fillText('Press Enter or Tap to Return to Menu', this.canvas.width / 2, 300);
    }

    private startGameLoop(): void {
        const gameLoop = (timestamp: number) => {
            if (!this.lastTime) this.lastTime = timestamp;
            const deltaTime = Math.min(0.033, (timestamp - this.lastTime) / 1000);
            this.lastTime = timestamp;
            
            this.update(deltaTime);
            this.render();
            
            this.animationId = requestAnimationFrame(gameLoop);
        };
        
        this.animationId = requestAnimationFrame(gameLoop);
    }

    public destroy(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Remove event listeners
        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keyup', this.handleKeyUp.bind(this));
        
        if (this.canvas) {
            this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
            this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
            this.canvas.removeEventListener('click', this.handleClick.bind(this));
        }
        
        // Stop audio
        this.stopMusic();
        
        console.log('[TopplerMedieval] Destroyed and cleaned up resources');
    }
}