/**
 * Main entry point for Toppler Medieval
 * Integrates with MIFF orchestration system
 */

import { TopplerMedievalOverlays } from './TopplerMedievalOverlays.js';
import { createGameLauncher } from './bootstrap/GameBootstrap.js';

class TopplerMedievalScene {
    private game: TopplerMedievalOverlays;

    constructor() {
        this.game = new TopplerMedievalOverlays();
    }

    mount(canvas: HTMLCanvasElement): void {
        this.game.mount(canvas);
    }

    update(delta: number): void {
        // Update handled internally by TopplerMedieval
    }

    render(): void {
        // Rendering handled internally by TopplerMedieval
    }

    getSize(): { width: number; height: number } {
        return { width: 640, height: 480 };
    }

    destroy(): void {
        this.game.destroy();
    }
}

// Global mount function for HTML integration
declare global {
    interface Window {
        mountTopplerMedieval: () => void;
    }
}

window.mountTopplerMedieval = () => {
    console.log('[TopplerMedieval] Mounting game...');
    
    const scene = new TopplerMedievalScene();
    const launcher = createGameLauncher({
        scene,
        containerId: 'app',
        autostart: true,
        onStart: () => {
            console.log('[TopplerMedieval] Game started');
        },
        onStop: () => {
            console.log('[TopplerMedieval] Game stopped');
        }
    });

    launcher.start();
    
    // Store launcher globally for potential cleanup
    (window as any).topplerLauncher = launcher;
};

export { TopplerMedievalScene };