import { TopplerScene } from './TopplerScene.js';
import { createGameLauncher } from './src/bootstrap/GameBootstrap.js';
import { loadResources } from './src/bootstrap/ResourceLoader.js';

declare global { interface Window { TopplerStandalone?: any } }

async function bootstrap(): Promise<void> {
    await loadResources({});
    const scene = new TopplerScene({});
    const launcher = createGameLauncher({
        scene,
        containerId: 'app',
        autostart: window.location.search.includes('autostart=1'),
        cssPath: './toppler.css'
    });
    launcher.start();
    (window as any).TopplerStandalone = { scene, launcher };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}

