export type Scene = {
	mount: (container: HTMLElement) => void;
	startLoop: () => void;
	destroy?: () => void;
};

export type GameLauncherOptions<T extends Scene> = {
	scene: T;
	containerId?: string;
	autostart?: boolean;
	cssPath?: string;
};

export function createGameLauncher<T extends Scene>(options: GameLauncherOptions<T>) {
	const { scene, containerId = 'app', autostart = false, cssPath } = options;
	let canvas: HTMLCanvasElement | null = null;
	let started = false;
	const listeners: Array<{ target: EventTarget; type: string; cb: EventListener }> = [];

	function ensureContainer(): HTMLElement {
		const container = document.getElementById(containerId);
		if (!container) throw new Error(`#${containerId} container missing`);
		return container;
	}

	function injectCSS(): void {
		if (!cssPath) return;
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssPath;
		document.head.appendChild(link);
	}

	function injectCanvas(container: HTMLElement): HTMLCanvasElement {
		const c = document.createElement('canvas');
		c.id = 'game-canvas';
		container.appendChild(c);
		return c;
	}

	function start(): void {
		if (started) return;
		started = true;
		const container = ensureContainer();
		canvas = injectCanvas(container);
		if (document.readyState === 'loading') {
			const cb = () => injectCSS();
			document.addEventListener('DOMContentLoaded', cb, { once: true });
			listeners.push({ target: document, type: 'DOMContentLoaded', cb: cb as EventListener });
		} else {
			injectCSS();
		}

		if (autostart) {
			scene.mount(container);
			scene.startLoop();
			return;
		}

		// Minimal start menu: click-to-start
		const btn = document.createElement('button');
		btn.textContent = 'Start Game';
		btn.onclick = () => {
			btn.remove();
			scene.mount(container);
			scene.startLoop();
		};
		container.appendChild(btn);
	}

	function stop(): void {
		if (!started) return;
		started = false;
		if (scene.destroy) scene.destroy();
		for (const { target, type, cb } of listeners) target.removeEventListener(type, cb);
		listeners.length = 0;
		if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
		canvas = null;
	}

	return { start, stop };
}

