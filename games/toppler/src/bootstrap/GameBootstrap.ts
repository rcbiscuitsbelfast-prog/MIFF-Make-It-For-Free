/**
 * IGameScene defines the minimal interface the bootstrap expects.
 */
export type IGameScene = {
	mount: (canvas: HTMLCanvasElement) => void;
	update: (delta: number) => void;
	render: () => void;
	getSize?: () => { width: number; height: number };
	destroy?: () => void;
};

export type GameLauncherOptions = {
	scene: IGameScene;
	containerId: string;
	cssPath?: string;
	autostart?: boolean;
	onStart?: () => void;
	onLoop?: (delta: number) => void;
	onStop?: () => void;
};

/**
 * createGameLauncher wires a scene to the DOM: canvas setup, CSS injection, lifecycle, and RAF loop.
 */
export function createGameLauncher(options: GameLauncherOptions) {
	const { scene, containerId, cssPath, autostart = false, onStart, onLoop, onStop } = options;
	let canvas: HTMLCanvasElement | null = null;
	let rafId: number | null = null;
	let lastTs = 0;

	function ensureContainer(): HTMLElement {
		const container = document.getElementById(containerId);
		if (!container) throw new Error(`#${containerId} container missing`);
		return container;
	}

	function ensureCanvas(container: HTMLElement): HTMLCanvasElement {
		console.log('[GameBootstrap Debug] Ensuring canvas in container:', container.id);
		let c = container.querySelector('canvas');
		if (!c) {
			console.log('[GameBootstrap Debug] Creating new canvas element');
			c = document.createElement('canvas');
			c.id = 'game-canvas';
			container.appendChild(c);
			console.log('[GameBootstrap Debug] Canvas appended to container');
		} else {
			console.log('[GameBootstrap Debug] Found existing canvas');
		}
		const size = scene.getSize ? scene.getSize() : { width: 800, height: 600 };
		console.log('[GameBootstrap Debug] Setting canvas size:', size);
		c.width = size.width;
		c.height = size.height;
		console.log('[GameBootstrap Debug] Canvas dimensions:', c.width, 'x', c.height);
		return c as HTMLCanvasElement;
	}

	function injectCSS(): void {
		if (!cssPath) return;
		if ([...document.querySelectorAll('link[rel="stylesheet"]')].some(l => (l as HTMLLinkElement).href.includes(cssPath!))) return;
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssPath;
		document.head.appendChild(link);
	}

	const loop = (ts: number): void => {
		if (!canvas) {
			console.warn('[GameBootstrap Debug] Loop called but canvas is null');
			return;
		}
		const delta = lastTs ? (ts - lastTs) : 16;
		lastTs = ts;
		scene.update(delta);
		scene.render();
		onLoop?.(delta);
		rafId = requestAnimationFrame(loop);
	};

	function start(): void {
		console.log('[GameBootstrap Debug] start() called');
		const container = ensureContainer();
		console.log('[GameBootstrap Debug] Container found:', container.id);
		canvas = ensureCanvas(container);
		console.log('[GameBootstrap Debug] Canvas created:', canvas.id, canvas.width, 'x', canvas.height);
		injectCSS();
		console.log('[GameBootstrap Debug] CSS injected');
		console.log('[GameBootstrap Debug] Calling scene.mount() with canvas');
		scene.mount(canvas);
		console.log('[GameBootstrap Debug] Scene mounted');
		onStart?.();
		if (autostart) {
			console.log('[GameBootstrap Debug] Autostart enabled, calling run()');
			run();
		} else {
			console.log('[GameBootstrap Debug] Autostart disabled, creating start button');
			const btn = document.createElement('button');
			btn.textContent = 'Start';
			btn.onclick = () => { btn.remove(); run(); };
			container.appendChild(btn);
		}
	}

	function run(): void {
		lastTs = 0;
		rafId = requestAnimationFrame(loop);
	}

	function stop(): void {
		console.log('[GameBootstrap] Stopping game and cleaning up resources...');
		
		// Cancel animation frame to prevent leaks
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
		
		// Call stop callback
		onStop?.();
		
		// Destroy scene and clean up
		if (scene.destroy) {
			console.log('[GameBootstrap] Calling scene.destroy()');
			scene.destroy();
		}
		
		// Remove canvas from DOM
		if (canvas && canvas.parentNode) {
			canvas.parentNode.removeChild(canvas);
		}
		canvas = null;
		
		// Reset timestamp
		lastTs = 0;
		
		console.log('[GameBootstrap] Cleanup completed - all resources released');
	}

	return { start, stop };
}

