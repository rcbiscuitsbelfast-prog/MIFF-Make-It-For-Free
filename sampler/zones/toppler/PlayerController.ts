/**
 * PlayerController - Handles player physics, collision, and input for MIFF Toppler
 * 
 * Features:
 * - Modular input mapping (touch, keyboard, gamepad)
 * - Physics-based movement with configurable parameters
 * - Collision detection and response
 * - Cling logic for platform edges
 * - Remix-safe architecture with no hardcoded dependencies
 */

export interface PlayerConfig {
    width: number;
    height: number;
    jumpForce: number;
    gravity: number;
    maxFallSpeed: number;
    clingDistance: number;
    inputMapping: InputMapping;
}

export interface InputMapping {
    jump: string[];
    left: string[];
    right: string[];
    reset: string[];
}

export interface PlayerState {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    isOnGround: boolean;
    isClimbing: boolean;
    facing: 'left' | 'right';
    lastJumpTime: number;
    jumpCooldown: number;
}

export class PlayerController {
    private config: PlayerConfig;
    private state: PlayerState;
    private inputState: Map<string, boolean>;
    private touchStartY: number = 0;
    private touchStartTime: number = 0;
    private isTouchActive: boolean = false;

    constructor(config: Partial<PlayerConfig> = {}) {
        this.config = {
            width: 30,
            height: 30,
            jumpForce: 15,
            gravity: 0.6,
            maxFallSpeed: 12,
            clingDistance: 5,
            inputMapping: {
                jump: [' ', 'ArrowUp', 'w', 'W'],
                left: ['ArrowLeft', 'a', 'A'],
                right: ['ArrowRight', 'd', 'D'],
                reset: ['r', 'R', 'Enter']
            },
            ...config
        };

        this.state = {
            x: 0,
            y: 0,
            velocityX: 0,
            velocityY: 0,
            isOnGround: false,
            isClimbing: false,
            facing: 'right',
            lastJumpTime: 0,
            jumpCooldown: 100
        };

        this.inputState = new Map();
        this.setupInputHandlers();
    }

    private setupInputHandlers(): void {
        // Keyboard input
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Touch input for mobile
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e));

        // Mouse input for desktop
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Gamepad support (if available)
        if (navigator.getGamepads) {
            window.addEventListener('gamepadconnected', (e) => this.handleGamepadConnected(e));
        }
    }

    private handleKeyDown(event: KeyboardEvent): void {
        const key = event.key;
        this.inputState.set(key, true);

        // Prevent default behavior for game keys
        if (this.config.inputMapping.jump.includes(key) ||
            this.config.inputMapping.left.includes(key) ||
            this.config.inputMapping.right.includes(key) ||
            this.config.inputMapping.reset.includes(key)) {
            event.preventDefault();
        }
    }

    private handleKeyUp(event: KeyboardEvent): void {
        this.inputState.set(event.key, false);
    }

    private handleTouchStart(event: TouchEvent): void {
        if (event.touches.length > 0) {
            this.isTouchActive = true;
            this.touchStartY = event.touches[0].clientY;
            this.touchStartTime = Date.now();
        }
    }

    private handleTouchEnd(event: TouchEvent): void {
        this.isTouchActive = false;
        
        // Check if this was a tap (not a drag)
        const touchDuration = Date.now() - this.touchStartTime;
        if (touchDuration < 200) {
            this.triggerJump();
        }
    }

    private handleTouchMove(event: TouchEvent): void {
        if (event.touches.length > 0) {
            const currentY = event.touches[0].clientY;
            const deltaY = this.touchStartY - currentY;
            
            // Swipe up to jump
            if (deltaY > 50) {
                this.triggerJump();
            }
        }
    }

    private handleMouseDown(event: MouseEvent): void {
        this.isTouchActive = true;
        this.touchStartY = event.clientY;
        this.touchStartTime = Date.now();
    }

    private handleMouseUp(event: MouseEvent): void {
        this.isTouchActive = false;
        
        const touchDuration = Date.now() - this.touchStartTime;
        if (touchDuration < 200) {
            this.triggerJump();
        }
    }

    private handleGamepadConnected(event: any): void {
        console.log('[PlayerController] Gamepad connected:', event.gamepad);
    }

    private triggerJump(): void {
        const now = Date.now();
        if (now - this.state.lastJumpTime > this.state.jumpCooldown) {
            this.state.lastJumpTime = now;
            this.jump();
        }
    }

    public update(deltaTime: number, platforms: any[], bounds: { width: number; height: number }): void {
        this.handleInput();
        this.updatePhysics(deltaTime);
        this.checkCollisions(platforms);
        this.checkBounds(bounds);
        this.updateClimbing();
    }

    private handleInput(): void {
        // Horizontal movement
        let moveLeft = false;
        let moveRight = false;

        // Check keyboard input
        for (const key of this.config.inputMapping.left) {
            if (this.inputState.get(key)) {
                moveLeft = true;
                break;
            }
        }

        for (const key of this.config.inputMapping.right) {
            if (this.inputState.get(key)) {
                moveRight = true;
                break;
            }
        }

        // Check gamepad input
        const gamepads = navigator.getGamepads();
        for (const gamepad of gamepads) {
            if (gamepad && gamepad.connected) {
                const leftStick = gamepad.axes[0];
                if (leftStick < -0.5) moveLeft = true;
                if (leftStick > 0.5) moveRight = true;
            }
        }

        // Apply horizontal movement
        if (moveLeft && !moveRight) {
            this.state.velocityX = -3;
            this.state.facing = 'left';
        } else if (moveRight && !moveLeft) {
            this.state.velocityX = 3;
            this.state.facing = 'right';
        } else {
            this.state.velocityX *= 0.8; // Friction
        }

        // Jump input
        let shouldJump = false;
        for (const key of this.config.inputMapping.jump) {
            if (this.inputState.get(key)) {
                shouldJump = true;
                break;
            }
        }

        if (shouldJump) {
            this.jump();
        }
    }

    private updatePhysics(deltaTime: number): void {
        // Apply gravity
        this.state.velocityY += this.config.gravity;
        
        // Limit fall speed
        if (this.state.velocityY > this.config.maxFallSpeed) {
            this.state.velocityY = this.config.maxFallSpeed;
        }

        // Update position
        this.state.x += this.state.velocityX;
        this.state.y += this.state.velocityY;

        // Reset ground state
        this.state.isOnGround = false;
    }

    private checkCollisions(platforms: any[]): void {
        for (const platform of platforms) {
            if (this.checkCollisionWithPlatform(platform)) {
                this.handlePlatformCollision(platform);
            }
        }
    }

    private checkCollisionWithPlatform(platform: any): boolean {
        return this.state.x < platform.x + platform.width &&
               this.state.x + this.config.width > platform.x &&
               this.state.y < platform.y + platform.height &&
               this.state.y + this.config.height > platform.y;
    }

    private handlePlatformCollision(platform: any): void {
        const playerBottom = this.state.y + this.config.height;
        const playerTop = this.state.y;
        const platformTop = platform.y;
        const platformBottom = platform.y + platform.height;

        // Landing on top of platform
        if (this.state.velocityY > 0 && playerBottom <= platformTop + 5) {
            this.state.y = platformTop - this.config.height;
            this.state.velocityY = 0;
            this.state.isOnGround = true;
            this.state.isClimbing = false;
        }
        // Hitting platform from below
        else if (this.state.velocityY < 0 && playerTop >= platformBottom - 5) {
            this.state.y = platformBottom;
            this.state.velocityY = 0;
        }
        // Hitting platform from sides
        else if (this.state.velocityX > 0 && this.state.x < platform.x) {
            this.state.x = platform.x - this.config.width;
            this.state.velocityX = 0;
        } else if (this.state.velocityX < 0 && this.state.x > platform.x + platform.width) {
            this.state.x = platform.x + platform.width;
            this.state.velocityX = 0;
        }
    }

    private checkBounds(bounds: { width: number; height: number }): void {
        // Left boundary
        if (this.state.x < 0) {
            this.state.x = 0;
            this.state.velocityX = 0;
        }
        
        // Right boundary
        if (this.state.x + this.config.width > bounds.width) {
            this.state.x = bounds.width - this.config.width;
            this.state.velocityX = 0;
        }

        // Bottom boundary (fail zone)
        if (this.state.y > bounds.height + 100) {
            // Player fell off - this will be handled by the scene
        }
    }

    private updateClimbing(): void {
        // Check if player is near a platform edge for climbing
        if (!this.state.isOnGround && this.state.velocityY > 0) {
            // This could be extended for more complex climbing mechanics
            this.state.isClimbing = false;
        }
    }

    public jump(): void {
        if (this.state.isOnGround) {
            this.state.velocityY = -this.config.jumpForce;
            this.state.isOnGround = false;
        }
    }

    public setPosition(x: number, y: number): void {
        this.state.x = x;
        this.state.y = y;
        this.state.velocityX = 0;
        this.state.velocityY = 0;
    }

    public reset(): void {
        this.state.velocityX = 0;
        this.state.velocityY = 0;
        this.state.isOnGround = false;
        this.state.isClimbing = false;
        this.state.lastJumpTime = 0;
    }

    public getState(): PlayerState {
        return { ...this.state };
    }

    public getBounds(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.state.x,
            y: this.state.y,
            width: this.config.width,
            height: this.config.height
        };
    }

    public setInputMapping(mapping: Partial<InputMapping>): void {
        this.config.inputMapping = { ...this.config.inputMapping, ...mapping };
    }

    public setPhysics(config: Partial<Pick<PlayerConfig, 'jumpForce' | 'gravity' | 'maxFallSpeed'>>): void {
        Object.assign(this.config, config);
    }

    public destroy(): void {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        document.removeEventListener('keyup', this.handleKeyUp.bind(this));
        document.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        document.removeEventListener('touchend', this.handleTouchEnd.bind(this));
        document.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        document.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    }
}