import { TopplerScene } from './TopplerScene.js';
import { createGameLauncher } from './src/bootstrap/GameBootstrap.js';
import { loadResources } from './src/bootstrap/ResourceLoader.js';

declare global { interface Window { TopplerStandalone?: any } }

async function bootstrap(): Promise<void> {
    console.log('[Toppler Debug] Bootstrap starting...');
    console.log('[Toppler Debug] URL search:', window.location.search);
    console.log('[Toppler Debug] Autostart enabled:', window.location.search.includes('autostart=1'));
    
    const assets = await loadResources({});
    console.log('[Toppler Debug] Assets loaded:', Object.keys(assets));
    
    const scene = new TopplerScene({ assets, width: 360, height: 640 } as any);
    console.log('[Toppler Debug] Scene created');
    
    const launcher = createGameLauncher({
        scene: scene as any,
        containerId: 'app',
        autostart: window.location.search.includes('autostart=1'),
        onStart: () => console.log('[Toppler Debug] Game starting'),
        onLoop: (delta) => {},
        onStop: () => console.log('[Toppler Debug] Game stopped')
    });
    
    console.log('[Toppler Debug] Launcher created, calling start()...');
    launcher.start();
    console.log('[Toppler Debug] Launcher started');
    
    (window as any).TopplerStandalone = { scene, launcher };
    console.log('[Toppler Debug] Bootstrap complete');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}

