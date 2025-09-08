/**
 * Main entry point for Toppler Medieval
 * Integrates with MIFF orchestration system
 */
import { TopplerMedieval } from './TopplerMedieval.js';
import { createGameLauncher } from './bootstrap/GameBootstrap.js';
class TopplerMedievalScene {
    constructor() {
        this.game = new TopplerMedieval();
    }
    mount(canvas) {
        this.game.mount(canvas);
    }
    update(delta) {
        // Update handled internally by TopplerMedieval
    }
    render() {
        // Rendering handled internally by TopplerMedieval
    }
    getSize() {
        return { width: 640, height: 480 };
    }
    destroy() {
        this.game.destroy();
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
    window.topplerLauncher = launcher;
};
export { TopplerMedievalScene };
