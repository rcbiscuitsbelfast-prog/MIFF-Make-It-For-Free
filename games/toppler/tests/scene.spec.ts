/**
 * @jest-environment jsdom
 */

import { TopplerScene } from '../TopplerScene';
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

describe('TopplerScene (bootstrap)', () => {
    it('initializes and mounts via launcher', () => {
        const app = ensureApp();
        const scene = new TopplerScene({ width: 200, height: 300 });
        const launcher = createGameLauncher({ scene, containerId: 'app', autostart: true });
        launcher.start();
        const state = scene.getState();
        expect(state.isPlaying).toBe(true);
        launcher.stop();
    });

    it('player can jump and move upward (manual ticks)', () => {
        ensureApp();
        const scene = new TopplerScene({ width: 200, height: 300 });
        const launcher = createGameLauncher({ scene, containerId: 'app', autostart: true });
        launcher.start();
        const before = scene.getPlayer().y;
        scene.jump();
        for (let i = 0; i < 5; i++) (scene as any)['loop']();
        const after = scene.getPlayer().y;
        expect(after).toBeLessThan(before);
        launcher.stop();
    });

    it('win/fail toggles after ticks', () => {
        ensureApp();
        const scene = new TopplerScene({ width: 200, height: 300, winHeight: 100 });
        const launcher = createGameLauncher({ scene, containerId: 'app', autostart: true });
        launcher.start();
        (scene as any).getPlayer().y = 100;
        for (let i = 0; i < 30; i++) (scene as any)['loop']();
        const state = scene.getState();
        expect(state.isWon || state.isFailed).toBe(true);
        launcher.stop();
    });
});

