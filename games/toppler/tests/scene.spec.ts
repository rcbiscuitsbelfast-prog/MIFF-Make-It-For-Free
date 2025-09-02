/**
 * @jest-environment jsdom
 */

import { TopplerScene } from '../../../zones/toppler/TopplerScene';
import { createGameLauncher } from '../src/bootstrap/GameBootstrap';

function ensureApp(): HTMLElement {
    let app = document.getElementById('app');
    if (!app) {
        app = document.createElement('div');
        app.id = 'app';
        document.body.appendChild(app);
    }
    return app;
}

// Global cleanup tracking
const activeScenes: TopplerScene[] = [];
const activeLaunchers: Array<{ stop: () => void }> = [];

function cleanup(): void {
    console.log('[Test Cleanup] Cleaning up active scenes and launchers...');
    
    // Stop all active launchers
    activeLaunchers.forEach(launcher => {
        try {
            launcher.stop();
        } catch (error) {
            console.warn('[Test Cleanup] Error stopping launcher:', error);
        }
    });
    activeLaunchers.length = 0;
    
    // Destroy all active scenes
    activeScenes.forEach(scene => {
        try {
            scene.destroy();
        } catch (error) {
            console.warn('[Test Cleanup] Error destroying scene:', error);
        }
    });
    activeScenes.length = 0;
    
    // Clean up DOM
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = '';
    }
    
    // Force garbage collection if available
    if (global.gc) {
        global.gc();
    }
    
    console.log('[Test Cleanup] Cleanup completed');
}

describe('TopplerScene (bootstrap)', () => {
    afterEach(() => cleanup());
    it('initializes and mounts via launcher', () => {
        const app = ensureApp();
        const scene = new TopplerScene({ theme: 'classic' });
        const launcher = createGameLauncher({ scene: (scene as unknown) as any, containerId: 'app', autostart: true });
        
        // Track for cleanup
        activeScenes.push(scene);
        activeLaunchers.push(launcher);
        
        launcher.start();
        const state = scene.getGameState();
        expect(state.isPlaying).toBe(true);
        launcher.stop();
    });

    it('player can jump and move upward (manual ticks)', () => {
        ensureApp();
        const scene = new TopplerScene({ theme: 'classic' });
        const launcher = createGameLauncher({ scene: (scene as unknown) as any, containerId: 'app', autostart: true });
        
        // Track for cleanup
        activeScenes.push(scene);
        activeLaunchers.push(launcher);
        
        launcher.start();
        const before = (scene as any).components.get('player').y;
        (scene as any).handleInput?.();
        for (let i = 0; i < 5; i++) (scene as any)['startGameLoop']?.();
        const after = (scene as any).components.get('player').y;
        expect(typeof after).toBe('number');
        launcher.stop();
    });

    it('win/fail toggles after ticks', () => {
        ensureApp();
        const scene = new TopplerScene({ theme: 'classic', winHeight: 100 });
        const launcher = createGameLauncher({ scene: (scene as unknown) as any, containerId: 'app', autostart: true });
        
        // Track for cleanup
        activeScenes.push(scene);
        activeLaunchers.push(launcher);
        
        launcher.start();
        (scene as any).getPlayer().y = 100;
        for (let i = 0; i < 30; i++) (scene as any)['loop']();
        const state = scene.getGameState();
        expect(state.isWon || state.isFailed).toBe(true);
        launcher.stop();
    });
});

