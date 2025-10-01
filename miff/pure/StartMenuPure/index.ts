export type StartMenuLayout = 'tabs' | 'radial';

export interface StartMenuConfig {
	layout: StartMenuLayout;
	items: string[]; // identifiers like 'newGame', 'loadGame', 'settings', 'accessibility', 'devTools'
	hotkeys?: {
		confirm?: string;
		back?: string;
	};
}

export interface StartMenuState {
	readonly layout: StartMenuLayout;
	readonly items: string[];
	readonly selectedIndex: number;
	readonly isActive: boolean;
	readonly lastAction?: string;
}

export type StartMenuAction =
	| { type: 'INIT' }
	| { type: 'SELECT_INDEX'; index: number }
	| { type: 'SELECT_NEXT' }
	| { type: 'SELECT_PREV' }
	| { type: 'CONFIRM' }
	| { type: 'BACK' }
	| { type: 'CLOSE' };

export function createStartMenuState(config: StartMenuConfig): StartMenuState {
	const items = Array.isArray(config.items) && config.items.length > 0 ? config.items.slice(0) : ['newGame'];
	return {
		layout: config.layout || 'tabs',
		items,
		selectedIndex: 0,
		isActive: true,
		lastAction: 'INIT',
	};
}

export function reduceStartMenuAction(state: StartMenuState, action: StartMenuAction): StartMenuState {
	switch (action.type) {
		case 'INIT':
			return { ...state, isActive: true, selectedIndex: 0, lastAction: 'INIT' };
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
		case 'CONFIRM': {
			// Close menu on confirm; bridge decides route based on selected item
			return { ...state, isActive: false, lastAction: 'CONFIRM' };
		}
		case 'BACK':
			return { ...state, isActive: false, lastAction: 'BACK' };
		case 'CLOSE':
			return { ...state, isActive: false, lastAction: 'CLOSE' };
		default:
			return state;
	}
}

export function getSelectedItem(state: StartMenuState): string {
	return state.items[state.selectedIndex] || '';
}

export function isMenuOpen(state: StartMenuState): boolean {
	return !!state.isActive;
}

