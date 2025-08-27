/**
 * @jest-environment jsdom
 */

/**
 * This test uses browser-specific features like document.createElement,
 * which aren't available in Jest's default Node.js environment.
 * 
 * Without this line, Jest throws a "ReferenceError: document is not defined"
 * because it's running in a server-like context that doesn't simulate the DOM.
 * 
 * By specifying `@jest-environment jsdom`, we tell Jest to use a simulated
 * browser environment (jsdom), which provides access to document, window, etc.
 * 
 * This allows DOM-based tests—like player movement and win/fail triggers—to run
 * without errors, while keeping the test modular and remix-safe.
 */
import { TopplerScene } from '../TopplerScene';
import { createTestCanvas } from './utils';

function makeContainer(): HTMLElement {
    const div = document.createElement('div');
    document.body.appendChild(div);
    return div;
}

describe('TopplerScene (standalone)', () => {
    beforeAll(() => {
        // Fallback mock in case CI does not preload the global setup
        if (!(HTMLCanvasElement.prototype as any).getContext ||
            (HTMLCanvasElement.prototype.getContext as any)._stubbed !== true) {
            const stub = function () {
                return {
                    fillStyle: '#000',
                    strokeStyle: '#000',
                    lineWidth: 1,
                    clearRect: () => {},
                    fillRect: () => {},
                    strokeRect: () => {},
                    beginPath: () => {},
                    moveTo: () => {},
                    lineTo: () => {},
                    stroke: () => {},
                    fillText: () => {},
                    font: '',
                } as any;
            } as any;
            stub._stubbed = true;
            Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
                configurable: true,
                writable: true,
                value: stub
            });
        }
    });
    it('initializes and mounts', () => {
        const scene = new TopplerScene({ width: 200, height: 300 });
        const container = makeContainer();
        // ensure canvas exists and context is initialized
        const canvas = createTestCanvas(200, 300);
        scene.mount(container);
        const state = scene.getState();
        expect(state.isPlaying).toBe(true);
        scene.destroy();
    });

    it('player can jump and move upward', () => {
        const scene = new TopplerScene({ width: 200, height: 300 });
        const container = makeContainer();
        const canvas = createTestCanvas(200, 300);
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
        const canvas = createTestCanvas(200, 300);
        scene.mount(container);
        // force player high
        (scene as any).getPlayer().y = 100;
        for (let i = 0; i < 30; i++) (scene as any)['loop']();
        const state = scene.getState();
        expect(state.isWon || state.isFailed).toBe(true);
        scene.destroy();
    });
});

