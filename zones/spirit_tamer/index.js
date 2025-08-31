// Spirit Tamer Zone - ESM module
// Exports:
// - default async function(step): Pure reducer for fixture-driven replay
// - startZone (named): Initializes interactive scaffold used elsewhere

export { startZone } from './spirit_tamer.js';

/**
 * default - Pure step reducer for Spirit Tamer
 * Actions: 'reset' | 'tap' | 'turn'
 * - 'tap' with data.id === 'spirit_fox' attempts capture
 * - 'turn' advances encounter timer/cooldowns
 */
export default async function stepReducer(step){
	const prev = normalizeState(step?.state);
	const action = step?.action || 'noop';
	const data = step?.data || {};

	switch(action){
		case 'reset': return initialState();
		case 'tap': return handleTap(prev, data.id);
		case 'turn': return advanceTurn(prev);
		default: return prev;
	}
}

// ---------- Pure helpers ----------
function initialState(){
	return {
		spirits: [{ id:'spirit_fox', hp: 3, captured: false }],
		inventory: {},
		turn: 0
	};
}

function normalizeState(s){
	if(!s || typeof s!=='object') return initialState();
	const c = JSON.parse(JSON.stringify(s));
	if(!Array.isArray(c.spirits)) c.spirits = [];
	if(!c.inventory) c.inventory = {};
	if(!Number.isFinite(c.turn)) c.turn = 0;
	return c;
}

function handleTap(state, id){
	const next = JSON.parse(JSON.stringify(state));
	if(!id) return next;
	const spirit = next.spirits.find(s=> s.id===id);
	if(spirit && !spirit.captured){
		// Placeholder capture: reduce hp, capture at 0
		spirit.hp = Math.max(0, spirit.hp - 1);
		if(spirit.hp===0){
			spirit.captured = true;
			next.inventory[id] = (next.inventory[id]||0) + 1;
		}
	}
	return next;
}

function advanceTurn(state){
	const next = JSON.parse(JSON.stringify(state));
	next.turn += 1;
	return next;
}