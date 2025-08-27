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
		let c = container.querySelector('canvas');
		if (!c) {
			c = document.createElement('canvas');
			c.id = 'game-canvas';
			container.appendChild(c);
		}
		const size = scene.getSize ? scene.getSize() : { width: 800, height: 600 };
		c.width = size.width;
		c.height = size.height;
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
		if (!canvas) return;
		const delta = lastTs ? (ts - lastTs) : 16;
		lastTs = ts;
		scene.update(delta);
		scene.render();
		onLoop?.(delta);
		rafId = requestAnimationFrame(loop);
	};

	function start(): void {
		const container = ensureContainer();
		canvas = ensureCanvas(container);
		injectCSS();
		scene.mount(canvas);
		onStart?.();
		if (autostart) {
			run();
		} else {
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
		if (rafId !== null) cancelAnimationFrame(rafId);
		rafId = null;
		onStop?.();
		if (scene.destroy) scene.destroy();
		if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
		canvas = null;
	}

	return { start, stop };
}

