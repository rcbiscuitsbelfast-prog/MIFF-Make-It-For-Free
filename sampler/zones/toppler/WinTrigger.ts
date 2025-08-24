/**
 * WinTrigger - Detects win condition for MIFF Toppler demo
 * 
 * Features:
 * - Configurable win detection zones
 * - Multiple win conditions support
 * - Narrative hook integration
 * - Remix mode debug overlays
 * - Remix-safe architecture with no hardcoded dependencies
 */

export interface WinCondition {
    id: string;
    type: 'height' | 'platform' | 'time' | 'custom';
    value: number | string;
    description: string;
    narrative?: string;
}

export interface WinTriggerConfig {
    conditions: WinCondition[];
    winHeight: number;
    winPlatformId?: string;
    timeLimit?: number;
    narrativeMode: boolean;
    remixMode: boolean;
    onWin: (condition: WinCondition) => void;
}

export interface WinEvent {
    condition: WinCondition;
    timestamp: number;
    playerStats: {
        height: number;
        attempts: number;
        timeElapsed: number;
    };
}

export class WinTrigger {
    private config: WinTriggerConfig;
    private isTriggered: boolean = false;
    private winTime: number = 0;
    private startTime: number = Date.now();
    private triggeredCondition: WinCondition | null = null;

    constructor(config: WinTriggerConfig) {
        this.config = {
            conditions: [
                {
                    id: 'height_reach',
                    type: 'height',
                    value: 800,
                    description: 'Reach the top platform',
                    narrative: 'You have ascended to new heights!'
                }
            ],
            winHeight: 800,
            narrativeMode: false,
            remixMode: false,
            onWin: () => {},
            ...config
        };

        this.startTime = Date.now();
    }

    public checkWinCondition(
        playerState: any,
        platforms: any[],
        gameState: any
    ): WinEvent | null {
        if (this.isTriggered) {
            return null;
        }

        // Check height-based win condition
        if (this.checkHeightWin(playerState)) {
            return this.triggerWin('height_reach', playerState, gameState);
        }

        // Check platform-based win condition
        if (this.checkPlatformWin(playerState, platforms)) {
            return this.triggerWin('platform_reach', playerState, gameState);
        }

        // Check time-based win condition
        if (this.checkTimeWin(gameState)) {
            return this.triggerWin('time_challenge', playerState, gameState);
        }

        // Check custom win conditions
        const customWin = this.checkCustomWinConditions(playerState, gameState);
        if (customWin) {
            return this.triggerWin(customWin.id, playerState, gameState);
        }

        return null;
    }

    private checkHeightWin(playerState: any): boolean {
        const winCondition = this.config.conditions.find(c => c.type === 'height');
        if (!winCondition) return false;

        const currentHeight = this.calculatePlayerHeight(playerState);
        return currentHeight >= (winCondition.value as number);
    }

    private checkPlatformWin(playerState: any, platforms: any[]): boolean {
        const winCondition = this.config.conditions.find(c => c.type === 'platform');
        if (!winCondition || !this.config.winPlatformId) return false;

        const winPlatform = platforms.find(p => p.id === this.config.winPlatformId);
        if (!winPlatform) return false;

        return this.checkPlayerOnPlatform(playerState, winPlatform);
    }

    private checkTimeWin(gameState: any): boolean {
        const winCondition = this.config.conditions.find(c => c.type === 'time');
        if (!winCondition || !this.config.timeLimit) return false;

        const timeElapsed = Date.now() - this.startTime;
        return timeElapsed <= (winCondition.value as number);
    }

    private checkCustomWinConditions(playerState: any, gameState: any): WinCondition | null {
        // Allow for custom win condition logic
        // This can be extended by remixers
        return null;
    }

    private calculatePlayerHeight(playerState: any): number {
        // Calculate player's height from bottom of screen
        // This assumes the game canvas height is available
        const canvasHeight = window.innerHeight || 600;
        return canvasHeight - playerState.y;
    }

    private checkPlayerOnPlatform(playerState: any, platform: any): boolean {
        const playerBottom = playerState.y + playerState.height;
        const playerTop = playerState.y;
        const platformTop = platform.y;
        const platformBottom = platform.y + platform.height;

        return playerBottom <= platformTop + 5 && 
               playerTop >= platformTop - 5 &&
               playerState.x + playerState.width > platform.x &&
               playerState.x < platform.x + platform.width;
    }

    private triggerWin(conditionId: string, playerState: any, gameState: any): WinEvent {
        const condition = this.config.conditions.find(c => c.id === conditionId);
        if (!condition) {
            throw new Error(`Win condition ${conditionId} not found`);
        }

        this.isTriggered = true;
        this.winTime = Date.now();
        this.triggeredCondition = condition;

        const winEvent: WinEvent = {
            condition,
            timestamp: this.winTime,
            playerStats: {
                height: this.calculatePlayerHeight(playerState),
                attempts: gameState.attempts || 0,
                timeElapsed: this.winTime - this.startTime
            }
        };

        // Call win callback
        this.config.onWin(condition);

        // Log win in remix mode
        if (this.config.remixMode) {
            this.logWinEvent(winEvent);
        }

        return winEvent;
    }

    private logWinEvent(winEvent: WinEvent): void {
        console.log('[WinTrigger] Win condition triggered!', {
            condition: winEvent.condition.description,
            height: winEvent.playerStats.height,
            attempts: winEvent.playerStats.attempts,
            timeElapsed: `${(winEvent.playerStats.timeElapsed / 1000).toFixed(2)}s`
        });
    }

    public render(ctx: CanvasRenderingContext2D, remixMode: boolean): void {
        if (remixMode) {
            this.renderDebugOverlay(ctx);
        }

        if (this.config.narrativeMode && this.isTriggered) {
            this.renderNarrative(ctx);
        }
    }

    private renderDebugOverlay(ctx: CanvasRenderingContext2D): void {
        // Draw win zone indicator
        const winZoneY = window.innerHeight - this.config.winHeight;
        
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(0, winZoneY, window.innerWidth, 20);
        ctx.setLineDash([]);

        // Draw win zone label
        ctx.fillStyle = '#ffff00';
        ctx.font = '16px monospace';
        ctx.fillText('WIN ZONE', 20, winZoneY - 10);

        // Draw current win conditions
        let yOffset = 20;
        this.config.conditions.forEach((condition, index) => {
            ctx.fillStyle = this.isTriggered ? '#00ff00' : '#ffff00';
            ctx.font = '12px monospace';
            ctx.fillText(`${index + 1}. ${condition.type}: ${condition.value}`, 20, yOffset);
            yOffset += 15;
        });

        // Draw win status
        if (this.isTriggered) {
            ctx.fillStyle = '#00ff00';
            ctx.font = '20px monospace';
            ctx.fillText('WIN!', window.innerWidth - 100, 30);
            
            if (this.triggeredCondition) {
                ctx.fillStyle = '#00ff00';
                ctx.font = '14px monospace';
                ctx.fillText(this.triggeredCondition.description, window.innerWidth - 200, 50);
            }
        }
    }

    private renderNarrative(ctx: CanvasRenderingContext2D): void {
        if (!this.triggeredCondition?.narrative) return;

        // Create narrative overlay
        const overlayHeight = 100;
        const overlayY = window.innerHeight / 2 - overlayHeight / 2;
        
        // Semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, overlayY, window.innerWidth, overlayHeight);
        
        // Border
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, overlayY, window.innerWidth, overlayHeight);
        
        // Narrative text
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.triggeredCondition.narrative, window.innerWidth / 2, overlayY + 50);
        
        // Reset text alignment
        ctx.textAlign = 'left';
    }

    public reset(): void {
        this.isTriggered = false;
        this.winTime = 0;
        this.triggeredCondition = null;
        this.startTime = Date.now();
    }

    public addWinCondition(condition: WinCondition): void {
        this.config.conditions.push(condition);
    }

    public removeWinCondition(conditionId: string): void {
        const index = this.config.conditions.findIndex(c => c.id === conditionId);
        if (index !== -1) {
            this.config.conditions.splice(index, 1);
        }
    }

    public setWinHeight(height: number): void {
        this.config.winHeight = height;
    }

    public setTimeLimit(limit: number): void {
        this.config.timeLimit = limit;
    }

    public setNarrativeMode(enabled: boolean): void {
        this.config.narrativeMode = enabled;
    }

    public isWinTriggered(): boolean {
        return this.isTriggered;
    }

    public getWinTime(): number {
        return this.winTime;
    }

    public getTriggeredCondition(): WinCondition | null {
        return this.triggeredCondition;
    }

    public getWinStats(): { startTime: number; winTime: number; timeElapsed: number } {
        return {
            startTime: this.startTime,
            winTime: this.winTime,
            timeElapsed: this.winTime - this.startTime
        };
    }

    public destroy(): void {
        this.config.conditions = [];
        this.reset();
    }
}