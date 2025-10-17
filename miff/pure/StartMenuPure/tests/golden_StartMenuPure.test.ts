import { createStartMenuState, reduceStartMenuAction, getSelectedItem } from '../index';

test('StartMenuPure deterministic navigation', () => {
	const state0 = createStartMenuState({ layout: 'tabs', items: ['newGame','loadGame','settings'] });
	const state1 = reduceStartMenuAction(state0, { type: 'SELECT_NEXT' });
	const state2 = reduceStartMenuAction(state1, { type: 'SELECT_NEXT' });
	const state3 = reduceStartMenuAction(state2, { type: 'SELECT_NEXT' });
	const state4 = reduceStartMenuAction(state3, { type: 'CONFIRM' });
	expect(getSelectedItem(state3)).toBe('newGame'); // wrap-around
	expect(state4.isActive).toBe(false);
});

