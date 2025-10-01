export type GameMenuLayout = 'tabs' | 'radial';

export interface GameMenuConfig {
	layout: GameMenuLayout;
	items: string[]; // identifiers like 'inventory','quests','map','stats','settings','exit'
	hotkeys?: {
		pause?: string;
		confirm?: string;
		back?: string;
	};
}

export interface GameMenuState {
	readonly layout: GameMenuLayout;
	readonly items: string[];
	readonly selectedIndex: number;
	readonly isOpen: boolean;
	readonly lastAction?: string;
}

export type GameMenuAction =
	| { type: 'INIT' }
	| { type: 'OPEN' }
	| { type: 'CLOSE' }
	| { type: 'TOGGLE' }
	| { type: 'SELECT_INDEX'; index: number }
	| { type: 'SELECT_NEXT' }
	| { type: 'SELECT_PREV' }
	| { type: 'CONFIRM' }
	| { type: 'BACK' };

export function createGameMenuState(config: GameMenuConfig): GameMenuState {
	const items = Array.isArray(config.items) && config.items.length > 0 ? config.items.slice(0) : ['inventory'];
	return {
		layout: config.layout || 'tabs',
		items,
		selectedIndex: 0,
		isOpen: false,
		lastAction: 'INIT',
	};
}

export function reduceGameMenuAction(state: GameMenuState, action: GameMenuAction): GameMenuState {
	switch (action.type) {
		case 'INIT':
			return { ...state, isOpen: false, selectedIndex: 0, lastAction: 'INIT' };
		case 'OPEN':
			return { ...state, isOpen: true, lastAction: 'OPEN' };
		case 'CLOSE':
			return { ...state, isOpen: false, lastAction: 'CLOSE' };
		case 'TOGGLE':
			return { ...state, isOpen: !state.isOpen, lastAction: 'TOGGLE' };
		case 'SELECT_INDEX': {
			const clamped = Math.max(0, Math.min(state.items.length - 1, action.index));
			return { ...state, selectedIndex: clamped, lastAction: 'SELECT_INDEX' };
		}
		case 'SELECT_NEXT': {
			const next = (state.selectedIndex + 1) % state.items.length;
			return { ...state, selectedIndex: next, lastAction: 'SELECT_NEXT' };
		}
		case 'SELECT_PREV': {
			const prev = (state.selectedIndex - 1 + state.items.length) % state.items.length;
			return { ...state, selectedIndex: prev, lastAction: 'SELECT_PREV' };
		}
		case 'CONFIRM':
			return { ...state, lastAction: 'CONFIRM' };
		case 'BACK':
			return { ...state, isOpen: false, lastAction: 'BACK' };
		default:
			return state;
	}
}

export function getSelectedItem(state: GameMenuState): string {
	return state.items[state.selectedIndex] || '';
}

export function isMenuOpen(state: GameMenuState): boolean {
	return !!state.isOpen;
}

