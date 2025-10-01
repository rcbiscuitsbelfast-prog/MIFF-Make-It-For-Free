import { createGameMenuState, reduceGameMenuAction, isMenuOpen, getSelectedItem } from '../index';

test('GameMenuPure toggle and selection deterministic', () => {
	const s0 = createGameMenuState({ layout: 'tabs', items: ['inventory','quests','map'] });
	const s1 = reduceGameMenuAction(s0, { type: 'OPEN' });
	const s2 = reduceGameMenuAction(s1, { type: 'SELECT_NEXT' });
	const s3 = reduceGameMenuAction(s2, { type: 'CONFIRM' });
	const s4 = reduceGameMenuAction(s3, { type: 'BACK' });
	expect(isMenuOpen(s1)).toBe(true);
	expect(getSelectedItem(s2)).toBe('quests');
	expect(isMenuOpen(s4)).toBe(false);
});

