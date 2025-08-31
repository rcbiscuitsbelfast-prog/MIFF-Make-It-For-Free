/**
 * FailZone - Detects fail condition for MIFF Toppler demo
 * 
 * Features:
 * - Configurable fail detection zones
 * - Multiple fail conditions support
 * - Feedback and reset mechanisms
 * - Remix mode debug overlays
 * - Remix-safe architecture with no hardcoded dependencies
 */

export interface FailCondition {
    id: string;
    type: 'height' | 'time' | 'attempts' | 'custom';
    value: number | string;
    description: string;
    feedback?: string;
}

export interface FailZoneConfig {
    conditions: FailCondition[];
    failHeight: number;
    maxAttempts?: number;
    timeLimit?: number;
    feedbackMode: boolean;
    remixMode: boolean;
    onFail: (condition: FailCondition) => void;
    onReset: () => void;
}

export interface FailEvent {
    condition: FailCondition;
    timestamp: number;
    playerStats: {
        height: number;
        attempts: number;
        timeElapsed: number;
    };
}

export class FailZone {
    private config: FailZoneConfig;
    private isTriggered: boolean = false;
    private failTime: number = 0;
    private startTime: number = Date.now();
    private triggeredCondition: FailCondition | null = null;
    private resetCooldown: number = 1000; // 1 second cooldown before reset
    private lastResetTime: number = 0;

    constructor(config: FailZoneConfig) {
        const defaultConfig = {
            conditions: [
                {
                    id: 'height_fall',
                    type: 'height',
                    value: -100,
                    description: 'Fall below the fail threshold',
                    feedback: 'You fell too far! Try again.'
                }
            ],
            failHeight: -100,
            feedbackMode: true,
            remixMode: false,
            onFail: () => {},
            onReset: () => {}
        };

        this.config = { ...defaultConfig, ...config };
        this.startTime = Date.now();
    }

    public checkFailCondition(
        playerState: any,
        gameState: any
    ): FailEvent | null {
        if (this.isTriggered) {
            return null;
        }

        // Check height-based fail condition
        if (this.checkHeightFail(playerState)) {
            return this.triggerFail('height_fall', playerState, gameState);
        }

        // Check time-based fail condition
        if (this.checkTimeFail()) {
            return this.triggerFail('time_limit', playerState, gameState);
        }

        // Check attempts-based fail condition
        if (this.checkAttemptsFail(gameState)) {
            return this.triggerFail('max_attempts', playerState, gameState);
        }

        // Check custom fail conditions
        const customFail = this.checkCustomFailConditions();
        if (customFail) {
            return this.triggerFail(customFail.id, playerState, gameState);
        }

        return null;
    }

    private checkHeightFail(playerState: any): boolean {
        const failCondition = this.config.conditions.find(c => c.type === 'height');
        if (!failCondition) return false;

        const currentHeight = this.calculatePlayerHeight(playerState);
        return currentHeight <= (failCondition.value as number);
    }

    private checkTimeFail(): boolean {
        const failCondition = this.config.conditions.find(c => c.type === 'time');
        if (!failCondition || !this.config.timeLimit) return false;

        const timeElapsed = Date.now() - this.startTime;
        return timeElapsed >= (failCondition.value as number);
    }

    private checkAttemptsFail(gameState: any): boolean {
        const failCondition = this.config.conditions.find(c => c.type === 'attempts');
        if (!failCondition || !this.config.maxAttempts) return false;

        return (gameState.attempts || 0) >= (failCondition.value as number);
    }

    private checkCustomFailConditions(): FailCondition | null {
        // Allow for custom fail condition logic
        // This can be extended by remixers
        return null;
    }

    private calculatePlayerHeight(playerState: any): number {
        // Calculate player's height from bottom of screen
        // This assumes the game canvas height is available
        const canvasHeight = window.innerHeight || 600;
        return canvasHeight - playerState.y;
    }

    private triggerFail(conditionId: string, playerState: any, gameState: any): FailEvent {
        const condition = this.config.conditions.find(c => c.id === conditionId);
        if (!condition) {
            throw new Error(`Fail condition ${conditionId} not found`);
        }

        this.isTriggered = true;
        this.failTime = Date.now();
        this.triggeredCondition = condition;

        const failEvent: FailEvent = {
            condition,
            timestamp: this.failTime,
            playerStats: {
                height: this.calculatePlayerHeight(playerState),
                attempts: gameState.attempts || 0,
                timeElapsed: this.failTime - this.startTime
            }
        };

        // Call fail callback
        this.config.onFail(condition);

        // Log fail in remix mode
        if (this.config.remixMode) {
            this.logFailEvent(failEvent);
        }

        return failEvent;
    }

    private logFailEvent(winEvent: FailEvent): void {
        console.log('[FailZone] Fail condition triggered!', {
            condition: winEvent.condition.description,
            height: winEvent.playerStats.height,
            attempts: winEvent.playerStats.attempts,
            timeElapsed: `${(winEvent.playerStats.timeElapsed / 1000).toFixed(2)}s`
        });
    }

    public handleInput(event: any): boolean {
        // Check if reset input is pressed
        const resetKeys = ['r', 'R', 'Enter', ' '];
        const key = event.key || event.code;
        
        if (resetKeys.includes(key) && this.isTriggered) {
            const now = Date.now();
            if (now - this.lastResetTime > this.resetCooldown) {
                this.reset();
                return true;
            }
        }

        return false;
    }

    public render(ctx: CanvasRenderingContext2D, remixMode: boolean): void {
        if (remixMode) {
            this.renderDebugOverlay(ctx);
        }

        if (this.config.feedbackMode && this.isTriggered) {
            this.renderFeedback(ctx);
        }
    }

    private renderDebugOverlay(ctx: CanvasRenderingContext2D): void {
        // Draw fail zone indicator
        const failZoneY = window.innerHeight + this.config.failHeight;
        
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(0, failZoneY, window.innerWidth, 50);
        ctx.setLineDash([]);

        // Draw fail zone label
        ctx.fillStyle = '#ff0000';
        ctx.font = '16px monospace';
        ctx.fillText('FAIL ZONE', 20, failZoneY - 10);

        // Draw current fail conditions
        let yOffset = 20;
        this.config.conditions.forEach((condition, index) => {
            ctx.fillStyle = this.isTriggered ? '#ff0000' : '#ff6666';
            ctx.font = '12px monospace';
            ctx.fillText(`${index + 1}. ${condition.type}: ${condition.value}`, 20, yOffset);
            yOffset += 15;
        });

        // Draw fail status
        if (this.isTriggered) {
            ctx.fillStyle = '#ff0000';
            ctx.font = '20px monospace';
            ctx.fillText('FAIL!', window.innerWidth - 100, 30);
            
            if (this.triggeredCondition) {
                ctx.fillStyle = '#ff0000';
                ctx.font = '14px monospace';
                ctx.fillText(this.triggeredCondition.description, window.innerWidth - 200, 50);
            }

            // Draw reset instructions
            ctx.fillStyle = '#ffff00';
            ctx.font = '14px monospace';
            ctx.fillText('Press R, Enter, or Space to reset', 20, window.innerHeight - 30);
        }
    }

    private renderFeedback(ctx: CanvasRenderingContext2D): void {
        if (!this.triggeredCondition?.feedback) return;

        // Create feedback overlay
        const overlayHeight = 120;
        const overlayY = window.innerHeight / 2 - overlayHeight / 2;
        
        // Semi-transparent background
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fillRect(0, overlayY, window.innerWidth, overlayHeight);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, overlayY, window.innerWidth, overlayHeight);
        
        // Feedback text
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.triggeredCondition.feedback, window.innerWidth / 2, overlayY + 50);
        
        // Reset instructions
        ctx.font = '18px Arial';
        ctx.fillText('Press R, Enter, or Space to try again', window.innerWidth / 2, overlayY + 80);
        
        // Reset text alignment
        ctx.textAlign = 'left';
    }

    public reset(): void {
        this.isTriggered = false;
        this.failTime = 0;
        this.triggeredCondition = null;
        this.lastResetTime = Date.now();
        
        // Call reset callback
        this.config.onReset();
    }

    public addFailCondition(condition: FailCondition): void {
        this.config.conditions.push(condition);
    }

    public removeFailCondition(conditionId: string): void {
        const index = this.config.conditions.findIndex(c => c.id === conditionId);
        if (index !== -1) {
            this.config.conditions.splice(index, 1);
        }
    }

    public setFailHeight(height: number): void {
        this.config.failHeight = height;
    }

    public setMaxAttempts(attempts: number): void {
        this.config.maxAttempts = attempts;
    }

    public setTimeLimit(limit: number): void {
        this.config.timeLimit = limit;
    }

    public setFeedbackMode(enabled: boolean): void {
        this.config.feedbackMode = enabled;
    }

    public setResetCooldown(cooldown: number): void {
        this.resetCooldown = cooldown;
    }

    public setRemixMode(enabled: boolean): void {
        this.config.remixMode = enabled;
    }

    public isFailTriggered(): boolean {
        return this.isTriggered;
    }

    public getFailTime(): number {
        return this.failTime;
    }

    public getTriggeredCondition(): FailCondition | null {
        return this.triggeredCondition;
    }

    public getFailStats(): { startTime: number; failTime: number; timeElapsed: number } {
        return {
            startTime: this.startTime,
            failTime: this.failTime,
            timeElapsed: this.failTime - this.startTime
        };
    }

    public destroy(): void {
        this.config.conditions = [];
        this.reset();
    }
}