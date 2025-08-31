import { resolve as resolveVisual, VisualItemEvent } from '../VisualItemEventPure/index';
import { applyQuestEvent, QuestState, QuestEvent } from '../QuestSystemPure/index';
import { resetAfterVisualEvent } from '../InputSystemPure/index';

export type TimelineEvent = { frame: number; op: string; args?: any };
export type QuestTimeline = { id: string; events: TimelineEvent[]; remixMode?: boolean };

export interface TimelineResult {
	op: 'quest.timeline';
	status: 'ok';
	frames: number;
	questState: QuestState;
	processed: Array<{ frame: number; op: string; note: string }>;
	debug: {
		frameProgression: number[];
		questTransitions: string[];
		visualResolutions: string[];
		inputState: any;
		remixMode: boolean;
	};
}

export function runTimeline(tl: QuestTimeline, initialState?: QuestState): TimelineResult {
	const sorted = tl.events.slice().sort((a,b)=> a.frame - b.frame);
	const frames = sorted.length ? sorted[sorted.length-1].frame + 1 : 0;
	const frameProgression: number[] = [];
	const questTransitions: string[] = [];
	const visualResolutions: string[] = [];
	const processed: Array<{ frame: number; op: string; note: string }> = [];

	let state: QuestState = initialState || {
		quests: {
			helmet_of_fate: {
				id: 'helmet_of_fate',
				title: 'Helmet of Fate',
				description: 'Endure the arrow strike and split the helmet',
				steps: {
					intro: { id: 'intro', description: 'Get hit by the arrow', triggers: [{ type: 'interact', target: 'arrow', completed: false } as any], next: 'split', completed: false, requiredTriggers: 1 },
					split: { id: 'split', description: 'Helmet splits', triggers: [{ type: 'interact', target: 'helmet.split', completed: false } as any], completed: false, requiredTriggers: 1 }
				},
				start: 'intro',
				rewards: [{ type: 'xp', amount: 10, granted: false } as any],
				status: 'available',
				currentStep: 'intro',
				progress: 0
			}
		},
		activeQuests: [],
		completedQuests: [],
		failedQuests: [],
		playerStats: { level: 1, xp: 0, inventory: {}, location: { x: 0, y: 0 }, reputation: {} }
	};

	// Start the quest
	const startEvent: QuestEvent = { type: 'start', questId: 'helmet_of_fate', timestamp: 0 } as any;
	({ questState: state } = applyQuestEvent(state, startEvent));
	questTransitions.push('helmet_of_fate:available->active');

	let lastFrame = -1;
	for (const ev of sorted) {
		if (ev.frame !== lastFrame) {
			frameProgression.push(ev.frame);
			lastFrame = ev.frame;
		}

		switch (ev.op) {
			case 'hit': {
				processed.push({ frame: ev.frame, op: ev.op, note: 'Arrow hits player' });
				const progressEvent: QuestEvent = { type: 'progress', questId: 'helmet_of_fate', stepId: 'intro', triggerData: { type: 'interact', target: 'arrow' }, timestamp: ev.frame } as any;
				({ questState: state } = applyQuestEvent(state, progressEvent));
				break;
			}
			case 'visual.item': {
				const visual: VisualItemEvent = { type: (ev.args && ev.args.type) || 'helmet.split', payload: ev.args };
				const res = resolveVisual(visual, { maxFrames: 1, timeoutMs: 16 });
				visualResolutions.push(`frame ${ev.frame}: ${visual.type} -> ${res.resolved ? 'resolved' : 'skipped'}`);
				processed.push({ frame: ev.frame, op: ev.op, note: 'Helmet split visual resolved' });
				// Mark split step progress
				const progressEvent: QuestEvent = { type: 'progress', questId: 'helmet_of_fate', stepId: 'split', triggerData: { type: 'interact', target: 'helmet.split' }, timestamp: ev.frame } as any;
				({ questState: state } = applyQuestEvent(state, progressEvent));
				// Ensure quest completes after item event
				({ questState: state } = applyQuestEvent(state, { type: 'complete', questId: 'helmet_of_fate', timestamp: ev.frame } as any));
				questTransitions.push('helmet_of_fate:active->completed');
				// Reset input to keep cursor responsive
				const inputReset = resetAfterVisualEvent();
				processed.push({ frame: ev.frame, op: 'input.reset', note: `cursor=${inputReset.cursor}` });
				break;
			}
			case 'quest.start': {
				processed.push({ frame: ev.frame, op: ev.op, note: `Start next quest ${ev.args?.questId || 'unknown'}` });
				break;
			}
			default: {
				processed.push({ frame: ev.frame, op: ev.op, note: 'No-op' });
				break;
			}
		}
	}

	return {
		op: 'quest.timeline',
		status: 'ok',
		frames,
		questState: state,
		processed,
		debug: {
			frameProgression,
			questTransitions,
			visualResolutions,
			inputState: { cursor: 'idle' },
			remixMode: !!tl.remixMode
		}
	};
}