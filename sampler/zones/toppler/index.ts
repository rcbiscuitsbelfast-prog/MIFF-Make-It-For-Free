/**
 * Toppler Demo - Main Entry Point
 * 
 * This file initializes all components and creates the complete Toppler game experience.
 * It demonstrates the modular architecture and remix-safe design of the MIFF framework.
 */

import { TopplerScene, TopplerConfig } from './TopplerScene';
import { PlayerController } from './PlayerController';
import { PlatformSpawner } from './PlatformSpawner';
import { WinTrigger, WinCondition } from './WinTrigger';
import { FailZone, FailCondition } from './FailZone';
import { TopplerTest } from './TopplerTest';

// Game configuration
const gameConfig: TopplerConfig = {
    theme: 'classic',
    platformCount: 8,
    platformSpacing: 120,
    playerStartHeight: 50,
    winHeight: 800,
    failHeight: -100,
    gravity: 0.6,
    jumpForce: 15,
    remixMode: false
};

// Initialize game components
class TopplerGame {
    private scene: TopplerScene;
    private playerController: PlayerController;
    private platformSpawner: PlatformSpawner;
    private winTrigger: WinTrigger;
    private failZone: FailZone;
    private testSuite: TopplerTest;
    private isInitialized: boolean = false;

    constructor(config: TopplerConfig) {
        this.initializeComponents(config);
        this.setupEventHandlers();
        this.isInitialized = true;
        
        console.log('[TopplerGame] Game initialized successfully');
    }

    private initializeComponents(config: TopplerConfig): void {
        // Initialize scene
        this.scene = new TopplerScene(config);

        // Initialize player controller
        this.playerController = new PlayerController({
            width: 30,
            height: 30,
            jumpForce: config.jumpForce,
            gravity: config.gravity,
            maxFallSpeed: 12,
            clingDistance: 5
        });

        // Initialize platform spawner
        this.platformSpawner = new PlatformSpawner({
            theme: config.theme,
            minSpacing: 80,
            maxSpacing: 150
        }, {
            width: window.innerWidth,
            height: window.innerHeight
        });

        // Initialize win trigger
        this.winTrigger = new WinTrigger({
            conditions: [
                {
                    id: 'height_reach',
                    type: 'height',
                    value: config.winHeight,
                    description: 'Reach the top platform',
                    narrative: '🎉 Congratulations! You have ascended to new heights!'
                }
            ],
            winHeight: config.winHeight,
            narrativeMode: true,
            remixMode: config.remixMode,
            onWin: (condition) => this.handleWin(condition)
        });

        // Initialize fail zone
        this.failZone = new FailZone({
            conditions: [
                {
                    id: 'height_fall',
                    type: 'height',
                    value: config.failHeight,
                    description: 'Fall below the fail threshold',
                    feedback: '💥 You fell too far! Try again.'
                }
            ],
            failHeight: config.failHeight,
            feedbackMode: true,
            remixMode: config.remixMode,
            onFail: (condition) => this.handleFail(condition),
            onReset: () => this.handleReset()
        });

        // Initialize test suite
        this.testSuite = new TopplerTest();
    }

    private setupEventHandlers(): void {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle remix mode toggle
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'TOPPLER_REMIX_TOGGLE') {
                this.setRemixMode(event.data.enabled);
            }
        });

        // Handle theme change
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'TOPPLER_THEME_CHANGE') {
                this.setTheme(event.data.theme);
            }
        });

        // Handle test execution
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'TOPPLER_RUN_TESTS') {
                this.runTests();
            }
        });
    }

    private handleWin(condition: WinCondition): void {
        console.log('[TopplerGame] Win condition triggered:', condition.description);
        
        // Update game state
        this.scene.getGameState().isWon = true;
        this.scene.getGameState().isPlaying = false;

        // Show win message
        this.showMessage('🎉 You Won!', condition.narrative || 'Congratulations!', 'success');

        // Send win event to parent
        if (window.parent) {
            window.parent.postMessage({
                type: 'TOPPLER_WIN',
                condition: condition,
                timestamp: Date.now()
            }, '*');
        }
    }

    private handleFail(condition: FailCondition): void {
        console.log('[TopplerGame] Fail condition triggered:', condition.description);
        
        // Update game state
        this.scene.getGameState().isFailed = true;
        this.scene.getGameState().isPlaying = false;

        // Show fail message
        this.showMessage('💥 Game Over', condition.feedback || 'Try again!', 'error');

        // Send fail event to parent
        if (window.parent) {
            window.parent.postMessage({
                type: 'TOPPLER_FAIL',
                condition: condition,
                timestamp: Date.now()
            }, '*');
        }
    }

    private handleReset(): void {
        console.log('[TopplerGame] Game reset requested');
        
        // Reset all components
        this.scene.reset();
        this.playerController.reset();
        this.winTrigger.reset();
        this.failZone.reset();

        // Regenerate platforms
        this.platformSpawner.generatePlatforms(this.scene.getGameState().theme || 'classic');

        // Hide any messages
        this.hideMessage();

        // Send reset event to parent
        if (window.parent) {
            window.parent.postMessage({
                type: 'TOPPLER_RESET',
                timestamp: Date.now()
            }, '*');
        }
    }

    private handleResize(): void {
        // Update platform spawner bounds
        this.platformSpawner.updateScreenBounds({
            width: window.innerWidth,
            height: window.innerHeight
        });

        // Regenerate platforms for new screen size
        this.platformSpawner.generatePlatforms(this.scene.getGameState().theme || 'classic');
    }

    private showMessage(title: string, message: string, type: 'success' | 'error' | 'info'): void {
        // Create message overlay
        const overlay = document.createElement('div');
        overlay.id = 'toppler-message-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;

        messageBox.innerHTML = `
            <h2 style="margin: 0 0 15px 0; font-size: 24px;">${title}</h2>
            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">${message}</p>
            <button onclick="document.getElementById('toppler-message-overlay').remove()" 
                    style="background: white; color: #333; border: none; padding: 12px 24px; 
                           border-radius: 6px; cursor: pointer; font-size: 16px;">
                Continue
            </button>
        `;

        overlay.appendChild(messageBox);
        document.body.appendChild(overlay);
    }

    private hideMessage(): void {
        const overlay = document.getElementById('toppler-message-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    public setRemixMode(enabled: boolean): void {
        console.log('[TopplerGame] Setting remix mode:', enabled);
        
        this.scene.setRemixMode(enabled);
        this.winTrigger.setRemixMode(enabled);
        this.failZone.setRemixMode(enabled);

        // Update UI if available
        if (window.parent) {
            window.parent.postMessage({
                type: 'TOPPLER_REMIX_MODE_CHANGED',
                enabled: enabled,
                timestamp: Date.now()
            }, '*');
        }
    }

    public setTheme(theme: string): void {
        console.log('[TopplerGame] Setting theme:', theme);
        
        this.scene.setTheme(theme as any);
        this.platformSpawner.setTheme(theme);

        // Update UI if available
        if (window.parent) {
            window.parent.postMessage({
                type: 'TOPPLER_THEME_CHANGED',
                theme: theme,
                timestamp: Date.now()
            }, '*');
        }
    }

    public async runTests(): Promise<void> {
        console.log('[TopplerGame] Running test suite...');
        
        try {
            const results = await this.testSuite.runAllTests();
            const passRate = this.testSuite.getPassRate();
            
            console.log(`[TopplerGame] Tests completed. Pass rate: ${passRate}%`);
            
            // Send test results to parent
            if (window.parent) {
                window.parent.postMessage({
                    type: 'TOPPLER_TEST_RESULTS',
                    results: results,
                    passRate: passRate,
                    timestamp: Date.now()
                }, '*');
            }
        } catch (error) {
            console.error('[TopplerGame] Test execution failed:', error);
        }
    }

    public getGameState(): any {
        return this.scene.getGameState();
    }

    public getTestResults(): any {
        return this.testSuite.getResults();
    }

    public destroy(): void {
        if (!this.isInitialized) return;

        console.log('[TopplerGame] Destroying game...');
        
        // Clean up components
        this.scene.destroy();
        this.playerController.destroy();
        this.platformSpawner.destroy();
        this.winTrigger.destroy();
        this.failZone.destroy();
        this.testSuite.destroy();

        // Remove event listeners
        window.removeEventListener('resize', this.handleResize.bind(this));
        
        this.isInitialized = false;
    }
}

// Initialize game when DOM is ready
let game: TopplerGame | undefined;

document.addEventListener('DOMContentLoaded', () => {
    console.log('[TopplerGame] DOM ready, initializing game...');
    
    // Check for remix mode in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const remixMode = urlParams.get('remix') === '1';
    
    if (remixMode) {
        gameConfig.remixMode = true;
    }

    // Initialize game
    game = new TopplerGame(gameConfig);

    // Send ready signal to parent
    if (window.parent) {
        window.parent.postMessage({
            type: 'TOPPLER_READY',
            config: gameConfig,
            timestamp: Date.now()
        }, '*');
    }

    console.log('[TopplerGame] Game ready!');
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (game) {
        game.destroy();
    }
});

// Export for external use
if (typeof window !== 'undefined') {
    (window as any).TopplerGame = TopplerGame;
    (window as any).topplerGame = game;
}

// Export components for remixers
export {
    TopplerGame,
    TopplerScene,
    PlayerController,
    PlatformSpawner,
    WinTrigger,
    FailZone,
    TopplerTest
};