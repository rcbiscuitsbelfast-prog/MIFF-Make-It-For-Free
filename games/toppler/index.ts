import { TopplerScene } from './TopplerScene.js';
import { createGameLauncher } from './src/bootstrap/GameBootstrap.js';
import { loadResources } from './src/bootstrap/ResourceLoader.js';

declare global { interface Window { TopplerStandalone?: any } }

async function bootstrap(): Promise<void> {
    const assets = await loadResources({});
    const scene = new TopplerScene({ assets, width: 800, height: 600 } as any);
    const launcher = createGameLauncher({
        scene: scene as any,
        containerId: 'app',
        autostart: window.location.search.includes('autostart=1'),
        cssPath: './toppler.css',
        onStart: () => console.log('Game starting'),
        onLoop: () => {},
        onStop: () => console.log('Game stopped')
    });
    launcher.start();
    (window as any).TopplerStandalone = { scene, launcher };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}

