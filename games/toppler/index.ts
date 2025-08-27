import { TopplerScene } from './TopplerScene.js';

declare global { interface Window { TopplerStandalone?: any } }

function bootstrap(): void {
    const container = document.getElementById('app');
    if (!container) throw new Error('#app container missing');
    const scene = new TopplerScene({});
    scene.mount(container);

    // Minimal input for local testing
    window.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'ArrowUp') scene.jump();
    });

    window.TopplerStandalone = { scene };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}

