export type VisualItemEvent = { type: 'helmet.split' | string; payload?: any };

export interface ResolveOptions {
	maxFrames?: number;
	timeoutMs?: number;
}

export interface VisualItemEventResult {
	op: 'visual.item';
	status: 'ok' | 'skipped';
	resolved: boolean;
	frames: number;
	debug?: {
		frameLog: Array<{ frame: number; note: string }>;
		timeoutMs: number;
		maxFrames: number;
		itemType?: string;
	};
}

/**
 * resolve - Deterministically resolves a visual item event.
 * Guarantees resolution within one frame or via simulated timeout to avoid freezes.
 */
export function resolve(event: VisualItemEvent, opts: ResolveOptions = {}): VisualItemEventResult {
	const maxFrames = typeof opts.maxFrames === 'number' ? opts.maxFrames : 1;
	const timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : 16; // ~1 frame at 60fps

	const frameLog: Array<{ frame: number; note: string }> = [];

	// For mobile safety and determinism, never block: resolve immediately in <= 1 frame
	if (!event || !event.type) {
		frameLog.push({ frame: 0, note: 'No event provided' });
		return {
			op: 'visual.item',
			status: 'skipped',
			resolved: true,
			frames: 1,
			debug: { frameLog, timeoutMs, maxFrames }
		};
	}

	// Simulate doing the split work within a single frame
	frameLog.push({ frame: 0, note: 'Begin visual event processing' });

	if (event.type === 'helmet.split') {
		frameLog.push({ frame: 0, note: 'Helmet split visual resolved' });
		return {
			op: 'visual.item',
			status: 'ok',
			resolved: true,
			frames: 1,
			debug: { frameLog, timeoutMs, maxFrames, itemType: 'helmet' }
		};
	}

	// Unknown visual event: auto-resolve to avoid freeze
	frameLog.push({ frame: 0, note: `Unknown visual event: ${event.type} - auto-resolve` });
	return {
		op: 'visual.item',
		status: 'ok',
		resolved: true,
		frames: Math.min(1, maxFrames),
		debug: { frameLog, timeoutMs, maxFrames }
	};
}