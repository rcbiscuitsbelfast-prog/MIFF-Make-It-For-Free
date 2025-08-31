// Toppler Zone - ESM module
// Exports:
// - default async function(step): Pure reducer for fixture-driven replay (engine-agnostic)
// - startZone (named): Initializes interactive scaffold used elsewhere

export { startZone } from './toppler.js';

/**
 * default - Pure step reducer for Toppler
 * Input step shape (suggested): { state, action, data }
 * - state: current immutable state object
 * - action: 'move' | 'reset'
 * - data: { dx, dy } for movement
 * Returns next state without side effects.
 */
export default async function stepReducer(step){
	const prev = normalizeState(step?.state);
	const action = step?.action || 'noop';
	const data = step?.data || {};

	switch(action){
		case 'reset': {
			return initialState();
		}
		case 'move': {
			const { dx=0, dy=0 } = data;
			return applyMove(prev, dx, dy);
		}
		default:
			return prev;
	}
}

// ---------- Pure helpers ----------
function initialState(){
	return {
		grid: { width: 8, height: 6 },
		player: { x: 1, y: 1 },
		blocks: [ { id:'b1', x:2, y:1 } ],
		goals: [ { x:6, y:1 } ],
		completed: false
	};
}

function normalizeState(s){
	if(!s || typeof s!=='object') return initialState();
	const clone = JSON.parse(JSON.stringify(s));
	if(!clone.grid) clone.grid = { width:8, height:6 };
	if(!clone.player) clone.player = { x:1, y:1 };
	if(!Array.isArray(clone.blocks)) clone.blocks = [];
	if(!Array.isArray(clone.goals)) clone.goals = [];
	if(typeof clone.completed !== 'boolean') clone.completed = false;
	return clone;
}

function applyMove(state, dx, dy){
	const next = JSON.parse(JSON.stringify(state));
	const { width, height } = next.grid;
	const tx = clamp(next.player.x + dx, 0, width - 1);
	const ty = clamp(next.player.y + dy, 0, height - 1);
	// Check if a block occupies target
	const blk = next.blocks.find(b => b.x===tx && b.y===ty);
	if(blk){
		// Attempt to push block
		const bx = clamp(blk.x + dx, 0, width - 1);
		const by = clamp(blk.y + dy, 0, height - 1);
		const blocked = next.blocks.some(b=> b!==blk && b.x===bx && b.y===by);
		if(!blocked && (bx!==blk.x || by!==blk.y)){
			blk.x = bx; blk.y = by;
			next.player.x = tx; next.player.y = ty;
		}
	} else {
		next.player.x = tx; next.player.y = ty;
	}
	// Check goal reached
	next.completed = next.goals.some(g=> g.x===next.player.x && g.y===next.player.y);
	return next;
}

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }