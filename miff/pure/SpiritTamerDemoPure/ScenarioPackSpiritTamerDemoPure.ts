// SpiritTamerDemoPure — Remix-safe scenario pack (Pure-only)
// Simulates rhythm-based spirit taming using TimeSystemPure (beats),
// a minimal input tracker (local), CollisionSystemPure (interaction zones),
// and optional PhysicsSystemPure (disabled by default for determinism).

import { TimeManager } from '../TimeSystemPure/Manager';
import { CollisionManager, AABB } from '../CollisionSystemPure/Manager';

export type Beat = { t: number; expected: boolean };
export type Tap = { t: number };

export interface TamingConfig {
	bpm?: number; // beats per minute
	totalBeats?: number; // number of beats in the session
	window?: number; // hit window in seconds (|tap - beat| <= window)
	threshold?: number; // progress needed to tame
}

export interface ScenarioConfig extends TamingConfig {
	dt?: number; // simulation step
	taps?: Tap[]; // optional taps (if omitted, default script is used)
}

export type TamingState = {
	t: number;
	hits: number;
	misses: number;
	aggression: number;
	progress: number;
	tamed: boolean;
};

export type SpiritTamerOutput = {
	op: 'runScenario';
	status: 'ok' | 'error';
	name: 'SpiritTamerDemoPure';
	beats: Beat[];
	timeline: TamingState[];
	events: any[];
	finalState: any;
	issues: string[];
};

function round(n: number): number { return Math.round(n * 100) / 100; }

function buildBeats(bpm: number, count: number): Beat[] {
	const interval = 60 / bpm;
	const beats: Beat[] = [];
	for (let i = 1; i <= count; i++) beats.push({ t: round(i * interval), expected: true });
	return beats;
}

function defaultTapScript(bpm: number): Tap[] {
	const interval = 60 / bpm;
	return [0.5 * interval * 1, 0.5 * interval * 2, interval * 3].map(t => ({ t: round(t) }));
}

export function runScenario(config: ScenarioConfig = {}): SpiritTamerOutput {
	const bpm = config.bpm ?? 120;
	const totalBeats = config.totalBeats ?? 4;
	const window = config.window ?? 0.1;
	const threshold = config.threshold ?? 3;
	const dt = config.dt ?? 0.1;
	const beats = buildBeats(bpm, totalBeats);
	const taps: Tap[] = (config.taps && config.taps.length ? config.taps : defaultTapScript(bpm)).map(t => ({ t: round(t.t) }));

	// Interaction zones — static trigger overlap to validate collision system usage
	const col = new CollisionManager();
	const player: AABB = { id: 'player', min: { x: -1, y: -1 }, max: { x: 1, y: 1 }, isTrigger: true };
	const spirit: AABB = { id: 'spirit', min: { x: 0, y: 0 }, max: { x: 0.5, y: 0.5 }, isTrigger: true };
	col.load([player, spirit]);

	const time = new TimeManager();
	const timeline: TamingState[] = [];
	const issues: string[] = [];

	let hits = 0;
	let misses = 0;
	let aggression = 0;
	let progress = 0;
	let tamed = false;
	let t = 0;

	// capture at t=0
	timeline.push({ t: 0, hits, misses, aggression, progress, tamed });

	const beatIndexByTime = new Map<number, number>();
	beats.forEach((b, i) => beatIndexByTime.set(b.t, i));
	const beatSet = new Set(beats.map(b => b.t));

	// process taps by simulation time
	const tapsByTime = new Map<number, Tap[]>();
	for (const tap of taps) {
		const list = tapsByTime.get(tap.t) || [];
		list.push(tap);
		tapsByTime.set(tap.t, list);
	}

	const totalTime = beats[beats.length - 1].t;
	while (round(t + dt) <= round(totalTime + 1e-9)) {
		time.tick(dt);
		t = round(time.now());

		// ensure zones overlap so interaction is permitted
		const check = col.check();
		const hasTrigger = check.triggers.some(tr => (tr.a === 'player' && tr.b === 'spirit') || (tr.a === 'spirit' && tr.b === 'player'));

		// Process any taps scheduled exactly at this tick
		if (hasTrigger) {
			const events = tapsByTime.get(t) || [];
			for (const _ of events) {
				// Find nearest beat
				let nearest: Beat | undefined;
				let nearestDelta = Number.POSITIVE_INFINITY;
				for (const b of beats) {
					const d = Math.abs(b.t - t);
					if (d < nearestDelta) { nearest = b; nearestDelta = d; }
				}
				if (nearest && nearestDelta <= window && nearest.expected && !tamed) {
					hits += 1;
					progress += 1;
					// do not mutate beats array; treat as consumed internally only
					if (progress >= threshold) tamed = true;
				} else {
					misses += 1;
					aggression += 1;
				}
			}
		}

		if (beatSet.has(t)) {
			// capture at beat times
			timeline.push({ t, hits, misses, aggression, progress, tamed });
		}
	}

	const beatsOut = beats.map(b => ({ t: b.t, expected: true }));
	
	// Extract events for golden fixture compatibility
	const events = [];
	if (tamed) {
		events.push({
			type: 'spiritTamed',
			finalHits: hits,
			finalProgress: progress,
			completionTime: timeline[timeline.length - 1]?.t || 0
		});
	}
	
	// Extract final state for golden fixture compatibility
	const finalState = timeline.length > 0 ? {
		spirit: {
			tamed,
			progress,
			hits,
			misses,
			aggression
		},
		scenario: {
			completed: true,
			totalBeats: beats.length,
			successfulTaps: hits
		}
	} : {};
	
	return { 
		op: 'runScenario', 
		status: 'ok', 
		name: 'SpiritTamerDemoPure', 
		beats: beatsOut, 
		timeline, 
		events,
		finalState,
		issues 
	};
}

// Remix Hooks
// - extendSpirit(type): provide custom patterns and thresholds (keep deterministic)
// - extendBeatMap(map): override beats array or BPM
// - extendInput(generator): replace taps source with a deterministic generator
// - onStateCapture(state): capture hooks for analytics/UX debugging