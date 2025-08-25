import { TopplerScene } from '../TopplerScene';

function makeContainer(): HTMLElement {
    const div = document.createElement('div');
    document.body.appendChild(div);
    return div;
}

describe('TopplerScene (standalone)', () => {
    it('initializes and mounts', () => {
        const scene = new TopplerScene({ width: 200, height: 300 });
        const container = makeContainer();
        scene.mount(container);
        const state = scene.getState();
        expect(state.isPlaying).toBe(true);
        scene.destroy();
    });

    it('player can jump and move upward', () => {
        const scene = new TopplerScene({ width: 200, height: 300 });
        const container = makeContainer();
        scene.mount(container);
        const before = scene.getPlayer().y;
        scene.jump();
        // simulate a few frames
        for (let i = 0; i < 5; i++) (scene as any)['loop']();
        const after = scene.getPlayer().y;
        expect(after).toBeLessThan(before);
        scene.destroy();
    });

    it('win/fail triggers eventually toggle', () => {
        const scene = new TopplerScene({ width: 200, height: 300, winHeight: 100 });
        const container = makeContainer();
        scene.mount(container);
        // force player high
        (scene as any).getPlayer().y = 100;
        for (let i = 0; i < 30; i++) (scene as any)['loop']();
        const state = scene.getState();
        expect(state.isWon || state.isFailed).toBe(true);
        scene.destroy();
    });
});

